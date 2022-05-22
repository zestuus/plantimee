const express = require('express');
const _ = require('lodash');
const { Op } = require("sequelize");

const db = require('../../db/models');
const { privateRoute } = require('../utils/middlewares');
const { EnglishDays } = require("../constants/config");
const { AVAILABILITY_STATUS, REPEAT_FREQ } = require("../constants/enums");
const { getDayBounds, getEventInstance, countCertainDay } = require("../utils/helpers");

const router = express.Router();

const getAvailabilityStatus = (events, start, end, defaultStatus = AVAILABILITY_STATUS.CAN_ATTEND) => {
  return events.reduce((prevStatus, event) => {
    if (prevStatus === AVAILABILITY_STATUS.CANNOT_ATTEND) return AVAILABILITY_STATUS.CANNOT_ATTEND;
    if (event.completed === true || event.isFullDay) return prevStatus;

    const [ownStart, ownEnd] = [new Date(event.startTime), new Date(event.endTime)];

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

const editEvent = async (eventData, UserId, keys=['id']) => {
  const {
    name, description, completed, startTime, endTime, isFullDay, isGuestListPublic,
    latitude, longitude, placeName, address, url, googleId, googleCalendarId,
    repeatEnabled, repeatFreq, repeatInterval, repeatByDay, repeatUntil, repeatCount
  } = eventData;

  const where = keys.reduce((acc, key) => ({ ...acc, [key]: eventData[key] }), {});

  const event = await db.Event.findOne({ where: { ...where, UserId }});

  if (event) {
    event.name = name || null;
    event.description = description || null;
    event.completed = completed;
    event.isFullDay = isFullDay;
    event.isGuestListPublic = isGuestListPublic;
    event.startTime = startTime;
    event.endTime = endTime;
    event.repeatEnabled = repeatEnabled;
    event.repeatFreq = repeatFreq;
    event.repeatInterval = repeatInterval;
    event.repeatByDay = repeatByDay === 'onDay' ? '' : repeatByDay;
    event.repeatUntil = repeatUntil;
    event.repeatCount = repeatCount;
    event.latitude = latitude;
    event.longitude = longitude;
    event.placeName = placeName || null;
    event.address = address || null;
    event.url = url || null;
    event.googleId = googleId;
    event.googleCalendarId = googleCalendarId;
    event.updatedAt = new Date();

    return event;
  }
  return eventData;
}

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
        ["own_events", 'startTime', 'asc'],
      ],
    });

    if (!user) {
      return res.status(403).send("Invalid token!");
    }

    const { own_events } = user;
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

    const eventsWithAttendeesStatuses = own_events.reduce((acc, event) => {
      const attendees = event.attendees.map(attendee => {
        const user = users.find(user => user.id === attendee.id);
        const [start, end] = [new Date(event.startTime), new Date(event.endTime)];

        const midStatus = getAvailabilityStatus(user.own_events, start, end);
        attendee.setDataValue('availability', getAvailabilityStatus(user.events, start, end, midStatus));

        return attendee;
      });
      user.setDataValue('own_events', []);
      user.setDataValue('events', []);

      attendees.unshift(user);
      event.setDataValue('attendees', attendees);
      acc.push(event);

      if (event.repeatEnabled && event.repeatFreq) {
        console.log('repeatFreq', event.repeatFreq);
        console.log('repeatByDay', event.repeatByDay);
        console.log('repeatUntil', event.repeatUntil);
        console.log('repeatInterval', event.repeatInterval);
        console.log('repeatCount', event.repeatCount);

        let until;
        if (event.repeatUntil) {
          ({ dayEnd: until } = getDayBounds(new Date(event.repeatUntil)));
        } else if (event.repeatCount) {
          const startDate = new Date(event.startTime);
          switch (event.repeatFreq) {
            case REPEAT_FREQ.DAILY:
              startDate.setDate(startDate.getDate() + (event.repeatInterval || 1) * event.repeatCount);
              break;
            case REPEAT_FREQ.WEEKLY:
              startDate.setDate(startDate.getDate() + (event.repeatInterval || 1) * 7 * event.repeatCount);
              break;
            case REPEAT_FREQ.MONTHLY:
              startDate.setMonth(startDate.getMonth() + (event.repeatInterval || 1) * event.repeatCount);
              break;
            case REPEAT_FREQ.YEARLY:
              startDate.setFullYear(startDate.getFullYear() + (event.repeatInterval || 1) * event.repeatCount);
              break;
            default: break;
          }
          ({ dayEnd: until } = getDayBounds(startDate));
        } else {
          const nextYear = new Date(event.startTime);
          switch (event.repeatFreq) {
            case REPEAT_FREQ.DAILY:
              nextYear.setFullYear(nextYear.getFullYear() + 1);
              break;
            case REPEAT_FREQ.WEEKLY:
              nextYear.setFullYear(nextYear.getFullYear() + 5);
              break;
            case REPEAT_FREQ.MONTHLY:
              nextYear.setFullYear(nextYear.getFullYear() + 20);
              break;
            case REPEAT_FREQ.YEARLY:
              nextYear.setFullYear(nextYear.getFullYear() + 50);
              break;
            default: break;
          }
          ({ dayEnd: until } = getDayBounds(nextYear));
        }
        const since = new Date(event.startTime);
        const startDayOfWeek = since.getDay();
        const startIndexOfDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
        const eventDuration = new Date(event.endTime) - new Date(event.startTime);

        const getDayOfMonth = (date, byday) => {
          const dayNumOfMonth = parseInt(byday.slice(0,-2), 10);
          const dOfWeek = byday.slice(-2);
          const dOfWeekIndex = EnglishDays.findIndex(day => day.slice(0, 2).toUpperCase() === dOfWeek);

          return [dayNumOfMonth, dOfWeekIndex];
        };
        const dayOfMonth = (event.repeatFreq === REPEAT_FREQ.MONTHLY) ? (
          event.repeatByDay === '' ? since.getDate() : getDayOfMonth(since, event.repeatByDay)
        ) : null;
        const daysOfWeek = (event.repeatFreq === REPEAT_FREQ.WEEKLY) ? (
          event.repeatByDay
            .split(',')
            .map(dayTxt => EnglishDays.findIndex(el => dayTxt === el.slice(0,2).toUpperCase()))
        ) : [];
        daysOfWeek.sort();
        console.log(daysOfWeek);

        switch (event.repeatFreq) {
          case REPEAT_FREQ.DAILY:
            if (event.repeatInterval > 1) {
              since.setDate(since.getDate() + 1);
            }
            since.setDate(since.getDate() + 1);
            break;
          case REPEAT_FREQ.WEEKLY:
            if (event.repeatInterval > 1) {
              since.setDate(since.getDate() + (event.repeatInterval - 1) * 7);
            }
            since.setDate(since.getDate() + 1);
            break;
          case REPEAT_FREQ.MONTHLY:
            since.setMonth(since.getMonth() + event.repeatInterval);
            break;
          case REPEAT_FREQ.YEARLY:
            since.setFullYear(since.getFullYear() + event.repeatInterval);
            break;
          default: break;
        }

        while (since < until) {
          const dayOfWeek = since.getDay();
          const indexOfDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          let startTime;
          let endTime;
          switch (event.repeatFreq) {
            case REPEAT_FREQ.DAILY:
              startTime = since.toISOString();
              endTime = new Date(since.getTime() + eventDuration).toISOString();

              acc.push(getEventInstance(event, startTime, endTime, attendees));

              since.setDate(since.getDate() + (event.repeatInterval || 1));
              break;
            case REPEAT_FREQ.WEEKLY:
              // todo: if weekly and byday is null then skip unnecessary loop
              // since.setDate(since.getDate() + (event.repeatInterval || 1) * 7);
              if (daysOfWeek.includes(indexOfDay)) {
                startTime = since.toISOString();
                endTime = new Date(since.getTime() + eventDuration).toISOString();

                acc.push(getEventInstance(event, startTime, endTime, attendees));
              }
              if (startIndexOfDay === indexOfDay && event.repeatInterval > 1) {
                since.setDate(since.getDate() + (event.repeatInterval - 1) * 7)
              }
              since.setDate(since.getDate() + 1);
              break;
            case REPEAT_FREQ.MONTHLY:
              const startOfMonth = new Date(since.toISOString().slice(0,7));
              const endOfMonth = new Date(since.toISOString().slice(0,7));
              endOfMonth.setMonth(endOfMonth.getMonth() + 1);
              endOfMonth.setDate(endOfMonth.getDate() - 1);
              const daysCountFromMonthStart = countCertainDay(dayOfWeek, startOfMonth, since);
              const daysCountToMonthEnd = countCertainDay(dayOfWeek, since, endOfMonth) - 1;

              console.log();
              console.log('since', since);
              console.log('daysCountFromMonthStart', daysCountFromMonthStart);
              console.log('indexOfDay', indexOfDay);
              console.log('dayOfMonth', dayOfMonth);
              console.log('since.getDate()', since.getDate());
              if ((dayOfMonth === since.getDate()) || (dayOfMonth.length && indexOfDay === dayOfMonth[1] && ((dayOfMonth[0] === -1 && daysCountToMonthEnd === 0) || (dayOfMonth[0] === daysCountFromMonthStart)))) {
                startTime = since.toISOString();
                endTime = new Date(since.getTime() + eventDuration).toISOString();

                console.log(startTime, endTime);

                acc.push(getEventInstance(event, startTime, endTime, attendees));
                if (dayOfMonth !== since.getDate()) {
                  since.setDate(new Date(event.startTime).getDate());
                }
                since.setMonth(since.getMonth() + event.repeatInterval);
              } else {
                since.setDate(since.getDate() + 1);
              }
              break;
            case REPEAT_FREQ.YEARLY:
              startTime = since.toISOString();
              endTime = new Date(since.getTime() + eventDuration).toISOString();

              console.log(startTime, endTime);

              acc.push(getEventInstance(event, startTime, endTime, attendees));
              since.setFullYear(since.getFullYear() + event.repeatInterval);
              break;
            default: break;
          }
        }
      }

      return acc;
    }, []);

    res.send(eventsWithAttendeesStatuses);
  } catch (e) {
    console.error(e);
    return res.status(400).send(e);
  }
});

router.get('/list-invited', privateRoute, async (req, res) => {
  const { id } = req.user;

  try {
    const user = await db.User.findOne({
      where: { id },
      include: [{
        model: db.Event,
        as: 'events',
        include: [{
          model: db.User,
          as: 'organizer',
          attributes: ['id', 'username', 'full_name', 'email']
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
      const [start, end] = [new Date(event.startTime), new Date(event.endTime)];

      const midStatus = getAvailabilityStatus(own_events, start, end);
      const otherInvitedEvents = events.filter((_, i) => index !== i);
      event.setDataValue('availability', getAvailabilityStatus(otherInvitedEvents, start, end, midStatus));

      let attendees = event.attendees;
      const you = event.attendees.find(attendee => attendee.id === user.id);
      you.setDataValue('isYou', true);
      if (!event.isGuestListPublic) {
        attendees = event.attendees.filter(attendee => attendee.id === user.id);
      }
      attendees.unshift(event.organizer);
      event.setDataValue('attendees', attendees);

      return event;
    })

    res.send(eventsWithStatuses);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during fetch invited events!");
  }
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
    console.error(e);
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
    console.error(e);
    res.status(400).send("Error during delete!");
  }
});

router.post('/', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 1);

  const eventData = {
    UserId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    completed: false,
    isFullDay: false,
    isGuestListPublic: true,
    repeatEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const event = await db.Event.build(eventData);

  try {
    const savedEvent = await event.save();
    res.send(savedEvent);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during create!");
  }
});

router.put('/', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  const event = await editEvent(req.body, UserId);

  if (!event) {
    console.error(e);
    res.status(400).send("Event doesn't exists or you aren't the event's organizer!");
  }

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

router.delete('/completed', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;

  try {
    await db.Event.destroy({ where: { UserId, completed: true } })
    res.send('OK');
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during delete!");
  }
});

router.post('/import', privateRoute, async (req, res) => {
  const { id: UserId } = req.user;
  const { events } = req.body;

  try {
    const editedEvents = await Promise.all(
      events.map(async (event) => {
        const editedEvent = await editEvent({ ...event, UserId }, UserId, ['googleId', 'googleCalendarId']);

        if (editedEvent.id) {
          await editedEvent.save();
        }
        return editedEvent;
      })
    );
    const eventsToCreate = editedEvents.filter(event => !event.id);

    const createdEvents = await db.Event.bulkCreate(eventsToCreate);

    events.forEach(event => {
      if (event.attendees && event.attendees.length) {
        const savedEvent = (
          editedEvents.find(e => e.googleId === event.googleId)
        ) || createdEvents.find(e => e.googleId === event.googleId);

        if (savedEvent) {
          event.attendees.forEach(async (attendee) => {
            const { email } = attendee;
            const user = await db.User.findOne({ where: { email }});

            if (user) {
              const participation = await db.Participation.build({
                UserId: user.id,
                EventId: savedEvent.id,
                createdAt: new Date(),
                updatedAt: new Date()
              });

              await participation.save();
            }
          });
        }
      }
    });

    res.send({ edited: editedEvents.length - createdEvents.length, created: createdEvents.length });
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during import!");
  }
});

router.post('/invite', privateRoute, async (req, res) => {
  const { keywordToLookFor, eventId: EventId } = req.body;

  const user = await db.User.findOne({
    where: {
      [Op.or]: [
        {
          username: keywordToLookFor,
        },
        {
          email: keywordToLookFor,
        }
      ],
    }
  });
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
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);
    const now = new Date();

    if (eventData.startTime && eventData.endTime && now < startDate && startDate < endDate) {
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
    event.startTime = new Date(segmentToInsertIn[0])
    event.endTime = new Date(segmentToInsertIn[0] + msDuration)

    const savedEvent = await event.save();

    return res.send(savedEvent);
  }
  res.send(null);
});

module.exports = router;