const express = require('express');
const _ = require('lodash');
const { Op } = require("sequelize");

const db = require('../../db/models');
const { privateRoute } = require('../utils/middlewares');
const { EnglishDays, MINUTE } = require("../constants/data");
const { AVAILABILITY_STATUS, REPEAT_FREQ } = require("../constants/enums");
const {
  getDayBounds,
  getEventInstance,
  getDayOfMonth,
  checkRepeatIntervalMatch,
  getWeekdayNumber,
  countCertainDaySinceStartOfMonth,
  countCertainDayTillEndOfMonth,
  getDayTimeLimitingTasks,
} = require("../utils/helpers");
const { serialize } = require('../utils/serializers');

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
    name, description, completed, startTime, endTime, recurringEventId, originalStartTime, isFullDay,
    latitude, longitude, placeName, address, url, googleId, googleCalendarId, isGuestListPublic,
    repeatEnabled, repeatFreq, repeatInterval, repeatByDayReceived, repeatUntil, repeatCount
  } = eventData;
  const repeatByDay = repeatByDayReceived === 'onDay' ? '' : repeatByDayReceived;

  const where = keys.reduce((acc, key) => ({ ...acc, [key]: eventData[key] }), {});

  const event = await db.Event.findOne({ where: { ...where, UserId }});

  if (recurringEventId) {
    const recurringEvent = await db.Event.findOne({ where: { googleId: recurringEventId }});

    if (recurringEvent) {
      if (event) {
        event.recurrentEventId = recurringEvent.id;
        event.originalStartTime = originalStartTime;
        event.recurringEventId = null;
      } else {
        eventData.recurrentEventId = recurringEvent.id;
        eventData.recurringEventId = null;
      }
    }
  }

  if (event) {
    if (event.repeatEnabled) {
      if (!repeatEnabled) {
        event.noLongerRecurrent = true;
      } else if (
        event.repeatFreq !== repeatFreq ||
        event.repeatInterval !== repeatInterval ||
        event.repeatByDay !== repeatByDay ||
        event.repeatUntil !== repeatUntil ||
        event.repeatCount !== repeatCount
      ) {
        event.repeatChanged = true;
      }
    }

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
    event.repeatByDay = repeatByDay;
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

const getEventOccurence = (event, chosenDate) => {
  const startTime = new Date(event.startTime);
  const eventDuration = new Date(event.endTime) - startTime;
  startTime.setFullYear(chosenDate.getFullYear());
  startTime.setMonth(chosenDate.getMonth());
  startTime.setDate(chosenDate.getDate());
  const endTime = new Date(startTime.getTime() + eventDuration);

  return { startTime, endTime };
}

const addEventOccurrence = (acc, event, chosenDate, attendees, extraFields = {}) => {
  const { startTime, endTime } = getEventOccurence(event, chosenDate);

  acc.push(getEventInstance(event, startTime.toISOString(), endTime.toISOString(), attendees, extraFields));
}

const checkIfDayHasEventOccurrence = (date, event) => {
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
  }

  const since = new Date(event.startTime);
  switch (event.repeatFreq) {
    case REPEAT_FREQ.DAILY:
      since.setDate(since.getDate() + 1);
      break;
    case REPEAT_FREQ.WEEKLY:
      since.setDate(since.getDate() + 1);
      break;
    case REPEAT_FREQ.MONTHLY:
      since.setDate(since.getDate() + 1);
      since.setMonth(since.getMonth() + (event.repeatInterval || 1) - 1);
      break;
    case REPEAT_FREQ.YEARLY:
      since.setDate(since.getDate() + 1);
      since.setFullYear(since.getFullYear() + (event.repeatInterval || 1) - 1);
      break;
    default: break;
  }

  const { dayStart, dayEnd } = getDayBounds(new Date(date));
  const { dayStart: sinceStart } = getDayBounds(since);

  if ((until && until < dayStart) || (dayEnd < sinceStart)) return false;

  const startTime = new Date(event.startTime);
  switch (event.repeatFreq) {
    case REPEAT_FREQ.DAILY:
      return checkRepeatIntervalMatch(startTime, event.repeatInterval, event.repeatFreq, dayStart)
    case REPEAT_FREQ.WEEKLY:
      const daysOfWeek = event.repeatByDay.split(',').map(dayTxt => (
        EnglishDays.findIndex(el => dayTxt === el.slice(0,2).toUpperCase())
      ));
      daysOfWeek.sort();
      return daysOfWeek.includes(getWeekdayNumber(dayStart)) && (
        checkRepeatIntervalMatch(startTime, event.repeatInterval, event.repeatFreq, dayStart)
      );
    case REPEAT_FREQ.MONTHLY:
      if (!event.repeatByDay) {
        return dayStart.getDate() === startTime.getDate() && (
          checkRepeatIntervalMatch(startTime, event.repeatInterval, event.repeatFreq, dayStart)
        );
      } else {
        const [weekdayOfMonth, dayOfWeek] = getDayOfMonth(event.repeatByDay);
        const chosenDayOfWeek = getWeekdayNumber(dayStart);

        if (dayOfWeek !== chosenDayOfWeek) return false;

        return checkRepeatIntervalMatch(startTime, event.repeatInterval, event.repeatFreq, dayStart) && ((
            weekdayOfMonth === -1 && countCertainDayTillEndOfMonth(dayOfWeek, dayStart) === 0
          ) || (
            countCertainDaySinceStartOfMonth(dayOfWeek, dayStart) === weekdayOfMonth
          ));
      }
    case REPEAT_FREQ.YEARLY:
      return dayStart.getMonth() === startTime.getMonth() && dayStart.getDate() === startTime.getDate() && (
        checkRepeatIntervalMatch(startTime, event.repeatInterval, event.repeatFreq, dayStart)
      );
    default:
      return false;
  }
}

router.get('/list-own', privateRoute, async (req, res) => {
  const { id } = req.user;
  const { date } = req.query;
  const chosenDate = new Date(date);
  const { dayStart, dayEnd } = getDayBounds(chosenDate);
  try {
    const user = await db.User.findOne({
      where: { id },
      include: [{
        model: db.Event,
        as: "own_events",
        where: {
          [Op.or]: [
            { recurrentEventId: null },
            {
              startTime: {
                [Op.lt]: dayEnd,
              },
              endTime: {
                [Op.gt]: dayStart,
              }
            }
          ]
        },
        include: [
          {
            model: db.User,
            as: 'attendees',
            attributes: ['id', 'username', 'full_name', 'email']
          }
        ]
      }],
      order: [
        ["own_events", 'startTime', 'asc'],
      ],
    });

    if (!user) {
      return res.status(404).send("No events!");
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

    const recurrentInstances = await db.Event.findAll({
      where: {
        recurrentEventId: {
          [Op.not]: null
        },
        originalStartTime: {
          [Op.between]: [dayStart, dayEnd]
        }
      }
    });
    const recurrentInstanceExistenceMap = recurrentInstances.reduce((acc, event) => {
      acc[event.recurrentEventId] = !!event;

      return acc;
    }, {});

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
        if (!recurrentInstanceExistenceMap[event.id] && checkIfDayHasEventOccurrence(chosenDate, event)) {
          addEventOccurrence(acc, event, chosenDate, attendees);
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
  const { date } = req.query;

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

    const eventsWithStatuses = events.reduce((acc, event, index) => {
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

      acc.push(event);

      if (event.repeatEnabled && event.repeatFreq) {
        const chosenDate = new Date(date);
        if (checkIfDayHasEventOccurrence(chosenDate, event)) {
          addEventOccurrence(acc, event, chosenDate, attendees, { availability: AVAILABILITY_STATUS.CAN_ATTEND });
        }
      }

      return acc;
    }, [])

    res.send(eventsWithStatuses);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during fetch invited events!");
  }
});

router.get('/list-instances', privateRoute, async (req, res) => {
  const { id } = req.user;
  const { dateFrom, dateTo, currentDate } = req.query;
  const { dayStart: filterStart } = getDayBounds(dateFrom);
  const { dayEnd: filterEnd } = getDayBounds(dateTo);
  const { dayStart, dayEnd } = getDayBounds(currentDate);
  const filterFrom = dateFrom ? {
    endTime: {
      [Op.gt]: filterStart
    }
  } : null;
  const filterTo = dateFrom ? {
    startTime: {
      [Op.lt]: filterEnd
    }
  } : null;
  try {
    const instances = await db.Event.findAll({
      where: {
        UserId: id,
        recurrentEventId: {
          [Op.not]: null
        },
        [Op.not]: {
          startTime: {
            [Op.lt]: dayEnd,
          },
          endTime: {
            [Op.gt]: dayStart,
          }
        },
        ...filterFrom,
        ...filterTo,
      }
    });
    res.send(instances);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during list instances of recurring events!");
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

  if (event.noLongerRecurrent) {
    await db.Event.destroy({ where: { recurrentEventId: event.id }});
  } else if (event.repeatChanged) {
    const recurrentInstances = await db.Event.findAll({ where: { recurrentEventId: event.id }});

    await Promise.all(recurrentInstances.map(async instance => {
      if (!checkIfDayHasEventOccurrence(instance.originalStartTime, event)) {
        await instance.destroy();
      }
    }));
  }


  try {
    await event.save();
    res.send(event);
  } catch (e) {
    console.error(e);
    res.status(400).send("Error during update!");
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
    if (event.repeatEnabled) {
      await db.Event.destroy({ where: { recurrentEventId: id }});
    }

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

          if (editedEvent.noLongerRecurrent) {
            await db.Event.destroy({ where: { recurrentEventId: event.id }});
          } else if (editedEvent.repeatChanged) {
            const recurrentInstances = await db.Event.findAll({ where: { recurrentEventId: editedEvent.id }});

            await Promise.all(recurrentInstances.map(async instance => {
              if (!checkIfDayHasEventOccurrence(instance.originalStartTime, instance)) {
                await instance.destroy();
              }
            }));
          }
        }
        return editedEvent;
      })
    );
    const eventsToCreate = editedEvents.filter(event => !event.id);

    await Promise.all(eventsToCreate.map(async event => {
      if (event.recurringEventId) {
        const recurringEvent = eventsToCreate.find(e => e.googleId === event.recurringEventId);

        if (recurringEvent) {
          const createdEvent = await db.Event.create(recurringEvent);

          if (createdEvent) {
            event.recurrentEventId = createdEvent.id;
            recurringEvent.id = createdEvent.id;
          }
        }
      }
    }));

    const createdEvents = await db.Event.bulkCreate(eventsToCreate.filter(event => !event.id));

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

router.post('/extract', privateRoute, async (req, res) => {
  const { id } = req.user;
  const { recurrentEventId, originalStartTime } = req.body;

  const user = await db.User.findOne({
    where: { id },
    include: [{
      model: db.Event,
      where: {
        id: recurrentEventId
      },
      as: "own_events",
    }],
    order: [
      ["own_events", 'id', 'asc'],
    ],
  });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  if (user.own_events && user.own_events.length === 1) {
    const [recurrentEvent] = user.own_events;
    const startTime = new Date(originalStartTime);
    const duration = recurrentEvent.endTime - recurrentEvent.startTime;
    const endTime = new Date(duration + startTime.getTime());

    const { name, description, url, latitude, longitude, placeName, address } = recurrentEvent;

    const eventData = {
      UserId: id,
      name,
      description,
      url,
      startTime,
      endTime,
      latitude,
      longitude,
      placeName,
      address,
      recurrentEventId,
      originalStartTime: startTime,
      completed: false,
      isFullDay: false,
      isGuestListPublic: true,
      repeatEnabled: false,
      repeatFreq: null,
      repeatInterval: null,
      repeatByDay: null,
      repeatUntil: null,
      repeatCount: null,
      googleId: null,
      googleCalendarId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event = await db.Event.build(eventData);

    try {
      await event.save();

      res.send(event);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error during extraction!");
    }
  } else {
    res.status(500).send("Something went wrong during extraction!");
  }
});

router.get('/venue', privateRoute, async (req, res) => {
  const { id } = req.user;
  const { eventId, algorithm } = req.query;

  const user = await db.User.findOne({
    where: { id }
  });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  const event = await db.Event.findOne({
    where: { id: eventId },
    include: [{
      model: db.User,
      as: 'attendees'
    }]
  });

  event.attendees.push(user)
  const coords = event.attendees.map(({ latitude, longitude }) => (
    latitude && longitude && ({ lat: latitude, lng: longitude })
  ));
  const mean = coords.reduce((result, point) => {
    result.lat += point.lat;
    result.lng += point.lng;
    return result;
  }, { lat: 0, lng: 0 });
  mean.lat /= coords.length || 1;
  mean.lng /= coords.length || 1;

  if (algorithm === 'MEAN') {
    return res.send(mean);
  }

  const min = coords.reduce((result, point) => {
    if (point.lat < result.lat) result.lat = point.lat;
    if (point.lng < result.lng) result.lng = point.lng;
    return result;
  }, { ...coords[0] });
  const max = coords.reduce((result, point) => {
    if (point.lat > result.lat) result.lat = point.lat;
    if (point.lng > result.lng) result.lng = point.lng;
    return result;
  }, { ...coords[0] });
  const stepPoint = {
    lat: (max.lat - min.lat),
    lng: (max.lng - min.lng),
  };
  const eps = 0.000001;

  const distance = (a, b) => Math.sqrt((b.lat-a.lat) ** 2 + (b.lng-a.lng) ** 2);
  const distanceSum = (point, otherPoints) => (
    otherPoints.reduce((result, p) => result + distance(p, point), 0)
  );
  const move = (point, diff, direction) => {
    const result = { ...point };
    switch (direction) {
      case 'up':
        result.lat += diff.lat;
        break;
      case 'down':
        result.lat -= diff.lat;
        break;
      case 'left':
        result.lng -= diff.lng;
        break;
      case 'right':
        result.lng += diff.lng;
        break;
    }
    return result;
  }

  const currPoint = { ...mean };

  while(stepPoint.lat > eps && stepPoint.lng > eps) {
    const nextOptions = [
      currPoint,
      move(currPoint, stepPoint, 'up'),
      move(currPoint, stepPoint, 'down'),
      move(currPoint, stepPoint, 'left'),
      move(currPoint, stepPoint, 'right'),
    ];

    const distanceSums = nextOptions.map(point => distanceSum(point, coords));
    const bestOption = distanceSums.reduce((result, sum, index) => {
      if (sum < result.value) {
        result = { index, value: sum };
      }
      return result;
    }, { index: 0, value: distanceSums[0] });
    currPoint.lat = nextOptions[bestOption.index].lat;
    currPoint.lng = nextOptions[bestOption.index].lng;

    stepPoint.lat = stepPoint.lat / 2;
    stepPoint.lng = stepPoint.lng / 2;
  }

  res.send(currPoint);
});

router.get('/hours', privateRoute, async (req, res) => {
  const { id } = req.user;
  const { fromDate, toDate, fromTime, toTime, event: eventId, duration } = serialize(req.query, 'hours');
  const msDuration = duration * MINUTE;

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

  let start = new Date();
  let { dayEnd: end } = getDayBounds(start);
  if (fromDate) start = fromDate;
  if (toDate) end = toDate;

  const collectTask = (eventData) => {
    let startDate = new Date(eventData.startTime);
    let endDate = new Date(eventData.endTime);

    if (eventData.startTime && eventData.endTime && !eventData.isFullDay && start < endDate && startDate < endDate && startDate < end) {
      let taskStart = startDate;
      let taskEnd = endDate;
      if (startDate < start) taskStart = start;
      if (end < endDate) taskEnd = end;
      raw_tasks.push([taskStart.getTime(), taskEnd.getTime()]);
    }
    if (eventData.repeatEnabled) {
      let from = new Date(start);
      while (from < end) {
        if (checkIfDayHasEventOccurrence(from, eventData)) {
          ({ startTime: startDate, endTime: endDate } = getEventOccurence(event, from));

          if (eventData.startTime && eventData.endTime && !eventData.isFullDay && start < endDate && startDate < endDate && startDate < end) {
            let taskStart = startDate;
            let taskEnd = endDate;
            if (startDate < start) taskStart = start;
            if (end < endDate) taskEnd = end;
            raw_tasks.push([taskStart.getTime(), taskEnd.getTime()]);
          }
        }
        from.setDate(from.getDate() + 1);
      }
    }
  }

  events.forEach(collectTask);
  own_events.forEach(collectTask);
  attendees.forEach(attendee => {
    attendee.events.forEach(collectTask);
    attendee.own_events.forEach(collectTask);
  })

  const dayTimeLimitingTasks = (fromTime && toTime) ? (
    getDayTimeLimitingTasks(start, end, fromTime, toTime)
  ) : [];

  const tasks = _.uniqBy([
    ...raw_tasks,
    ...dayTimeLimitingTasks
  ], item => JSON.stringify(item));

  let segments = [[start.getTime(), end.getTime()]];

  tasks.forEach(task => {
    segments = segments.reduce((result, segment) => {
      if (task[1] <= segment[0] || segment[1] <= task[0]) {
        result.push([segment[0], segment[1]]);
      } else {
        if (segment[0] < task[0] && task[0] < segment[1]) {
          result.push([segment[0], task[0]]);
        }
        if (segment[0] < task[1] && task[1] < segment[1]) {
          result.push([task[1], segment[1]]);
        }
      }

      return result;
    }, []);
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