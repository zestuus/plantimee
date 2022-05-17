const express = require('express');
const _ = require('lodash');

const db = require('../../db/models');
const { privateRoute } = require('../utils/middlewares');
const { AVAILABILITY_STATUS } = require("../constants/enums");

const router = express.Router();

const getAvailabilityStatus = (events, start, end, defaultStatus = AVAILABILITY_STATUS.CAN_ATTEND) => {
  return events.reduce((prevStatus, event) => {
    if (prevStatus === AVAILABILITY_STATUS.CANNOT_ATTEND) return AVAILABILITY_STATUS.CANNOT_ATTEND;
    if (event.completed === true) return prevStatus;

    const [ownStart, ownEnd] = [new Date(event.start_time), new Date(event.end_time)];

    if ((ownStart < start && end < ownEnd) || (start < ownStart && ownEnd < end)) {
      return AVAILABILITY_STATUS.CANNOT_ATTEND;
    } else if (end < ownStart || ownEnd < start) {
      if (prevStatus === AVAILABILITY_STATUS.CAN_ATTEND) {
        return AVAILABILITY_STATUS.CAN_ATTEND;
      }
    } else if (ownStart < start && ownEnd < end) {
      if (prevStatus === AVAILABILITY_STATUS.LEAVE_EARLY) {
        return AVAILABILITY_STATUS.BE_LATE_LEAVE_EARLY;
      }
      return AVAILABILITY_STATUS.BE_LATE;
    } else if (start < ownStart && end < ownEnd) {
      if (prevStatus === AVAILABILITY_STATUS.BE_LATE) {
        return AVAILABILITY_STATUS.BE_LATE_LEAVE_EARLY;
      }
      return AVAILABILITY_STATUS.LEAVE_EARLY;
    }

    return prevStatus
  }, defaultStatus)
};

router.get('/list-own', privateRoute, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await db.User.findOne({
      where: {id},
      include: [{
        model: db.Event,
        as: "own_events",
        include: [{
          model: db.User,
          as: 'attendees',
          attributes: ['id', 'username', 'full_name', 'email']
        }]
      }],
      order: [
        ["own_events", 'id', 'asc'],
      ],
    });

    if (!user) {
      return res.status(403).send("Invalid token!");
    }

    const {own_events} = user;
    const attendeeIds = own_events.reduce((user_ids, event) => ([
      ...user_ids,
      ...event.attendees.map(attendee => attendee.id),
    ]), []);

    const users = await db.User.findAll({
      where: {id: attendeeIds},
      include: [{
        model: db.Event,
        as: "own_events",
      }, {
        model: db.Event,
        as: "events",
      }],
      order: [
        ['own_events', 'id', 'asc'],
        ['events', 'id', 'asc'],
      ],
    });

    const eventsWithAttendeesStatuses = own_events.map(event => {
      event.attendees = event.attendees.map(attendee => {
        const user = users.find(user => user.id === attendee.id);
        const [start, end] = [new Date(event.start_time), new Date(event.end_time)];

        const midStatus = getAvailabilityStatus(user.own_events, start, end);
        attendee.setDataValue('availability', getAvailabilityStatus(user.events, start, end, midStatus));

        return attendee;
      });
      return event;
    });

    res.send(eventsWithAttendeesStatuses);
  } catch (e) {
    console.error(e);

    return res.status(400).send(e);
  }
});

router.get('/list-invited', privateRoute, async (req, res) => {
  const { id } = req.user;
  const user = await db.User.findOne({
    where: { id },
    include: [{
      model: db.Event,
      as: 'events',
      include: [{
        model: db.User,
        as: 'organizer',
        attributes: ['username']
      }, {
        model: db.User,
        as: 'attendees',
        attributes: ['id', 'username', 'full_name', 'email']
      }]
    }, {
      model: db.Event,
      as: "own_events",
    }],
    order: [
      ['events', 'id', 'asc'],
    ],
  });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  const { events, own_events } = user;

  const eventsWithStatuses = events.map((event, index) => {
    const [start, end] = [new Date(event.start_time), new Date(event.end_time)];

    const midStatus = getAvailabilityStatus(own_events, start, end);
    const otherInvitedEvents = events.filter((_, i) => index !== i);
    event.setDataValue('availability', getAvailabilityStatus(otherInvitedEvents, start, end, midStatus));

    return event;
  })

  res.send(eventsWithStatuses);
});

router.delete('/invited', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const { id: EventId } = req.body;
  const event = await db.Participation.findOne({ where: { EventId, UserId }});

  if (!event) {
    res.status(400).send("You aren't invited for this event!");
  }

  try {
    await event.destroy();
    res.send(event);
  } catch (e) {
    res.status(400).send("Error during delete!");
  }
});

router.delete('/invite', privateRoute, async (req, res) => {
  const { userId: UserId, eventId: EventId } = req.body;
  const event = await db.Participation.findOne({ where: { EventId, UserId }});

  if (!event) {
    res.status(400).send("User isn't invited for this event!");
  }

  try {
    await event.destroy();
    res.send(event);
  } catch (e) {
    res.status(400).send("Error during delete!");
  }
});

router.post('/', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const eventData = { UserId, completed: false, is_full_day: false, createdAt: new Date(), updatedAt: new Date(), }
  const event = await db.Event.build(eventData);

  try {
    const savedEvent = await event.save();
    res.send(savedEvent);
  } catch (e) {
    res.status(400).send("Error during create!");
  }
});

router.put('/', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const {
    id, name, description, completed, start_time, end_time, is_full_day, latitude, longitude, placeName, address, url,
  } = req.body;
  const event = await db.Event.findOne({ where: { id, UserId }});

  if (!event) {
    res.status(400).send("Event doesn't exists or you aren't the event's organizer!");
  }

  event.name = name;
  event.description = description;
  event.completed = completed;
  event.is_full_day = is_full_day;
  event.start_time = start_time;
  event.end_time = end_time;
  event.latitude = latitude;
  event.longitude = longitude;
  event.placeName = placeName;
  event.address = address;
  event.url = url;
  event.updatedAt = new Date();

  try {
    await event.save();
    res.send(event);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error  during update!");
  }
});

router.delete('/', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const { id } = req.body;
  const event = await db.Event.findOne({ where: { id, UserId }});

  if (!event) {
    res.status(400).send("Event doesn't exists or you aren't the event's organizer!");
  }

  try {
    await event.destroy();
    res.send(event);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during delete!");
  }
});

router.post('/invite', privateRoute, async (req, res) => {
  const { usernameToLookFor, eventId: EventId } = req.body;

  const user = await db.User.findOne({ where: { username: usernameToLookFor } });
  const event = await db.Event.findOne({
    where: { id: EventId },
    include: [{
      model: db.User,
      as: "organizer",
    }],
  });

  if (user && event && event.organizer.id !== user.id) {
    const participation = await db.Participation.build({
      UserId: user.id,
      EventId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    try {
      await participation.save();

      res.send(user);
    } catch (e) {
      console.error(e);
      res.status(400).send("Error during invite!");
    }
  } else {
    res.status(400).send("User not found!");
  }
});

router.get('/hours', privateRoute, async (req, res) => {
  const { id } = req.user;
  const eventId = parseInt(req.query.event, 10);
  const duration = parseInt(req.query.duration, 10);
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const fromTime = req.query.fromTime;
  const toTime = req.query.toTime || (fromTime && '23:59');
  const msDuration = duration * 60 * 1000;

  console.log(fromDate);
  console.log(toDate);
  console.log(fromTime);
  console.log(toTime);

  const user = await db.User.findOne({
    where: { id },
    include: [{
      model: db.Event,
      as: "own_events",
    }, {
      model: db.Event,
      as: "events",
    }],
    order: [
      ["own_events", 'id', 'asc'],
      ["events", 'id', 'asc'],
    ],
  });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  const { own_events, events } = user;

  const event = await db.Event.findOne({
    where: { id: eventId },
    include: [{
      model: db.User,
      as: "attendees",
      include: [{
        model: db.Event,
        as: "own_events",
      }, {
        model: db.Event,
        as: "events",
      }]
    }],
    order: [
      ['id', 'asc'],
    ],
  });

  if (!event) {
    res.status(400).send("Event doesn't exists or you aren't the event's organizer!");
  }

  const { attendees } = event;

  let raw_tasks = [];

  const collectTasks = (eventData) => {
    const startDate = new Date(eventData.start_time);
    const endDate = new Date(eventData.end_time);
    const now = new Date();

    if (eventData.start_time && eventData.end_time && now < startDate && startDate < endDate) {
      raw_tasks.push([startDate.getTime(), endDate.getTime()]);
    }
  }

  collectTasks(event);
  events.forEach(collectTasks);
  own_events.forEach(collectTasks);
  attendees.forEach(attendee => {
    attendee.events.forEach(collectTasks);
    attendee.own_events.forEach(collectTasks);
  })

  const tasks = _.uniqBy(raw_tasks, item => JSON.stringify(item));

  const now = new Date();

  let segments = [[]];
  segments[0].push(now.getTime());
  now.setHours(23);
  now.setMinutes(59);
  now.setSeconds(59);
  segments[0].push(now.getTime());

  let segmentsCopy;
  tasks.forEach(task => {
    segmentsCopy = _.cloneDeep(segments);
    segmentsCopy.forEach(segment => {
      if (task[0] <= segment[0] && task[1] < segment[1] && segment[0] < task[1]){
        segment[0] = task[1];
      } else if (segment[0] < task[0] && segment[1] <= task[1] && task[0] < segment[1]){
        segment[1] = task[0];
      } else if (segment[0] < task[0] && task[1] < segment[1]) {
        segmentsCopy.push([task[1], segment[1]]);
        segment[1] = task[0];
      } else if (segment[0] === task[0] && task[1] === segment[1]) {
        segment[0] = segment[1];
      }
    });
    segments = _.cloneDeep(segmentsCopy);
  });

  const sortedSegments = _.sortBy(segments, seg => seg[0]);

  const segmentToInsertIn = sortedSegments.find(seg => msDuration < (seg[1] - seg[0]+0.05));
  if (segmentToInsertIn) {
    event.start_time = new Date(segmentToInsertIn[0])
    event.end_time = new Date(segmentToInsertIn[0] + msDuration)

    const savedEvent = await event.save();

    return res.send(savedEvent);
  }
  res.send(null);
});

module.exports = router;