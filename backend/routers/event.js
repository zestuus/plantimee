const express = require('express');

const db = require('../../db/models');
const { privateRoute } = require('../middlewares');

const router = express.Router();

router.get('/list-own', privateRoute, async (req, res) => {
    const { id } = req.user;
    const user = await db.User.findOne({
        where: { id },
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

    const { own_events } = user;
    res.send(own_events);
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
            }]
        }],
        order: [
            ['events', 'id', 'asc'],
        ],
    });

    if (!user) {
        return res.status(403).send("Invalid token!");
    }

    const { events } = user;
    res.send(events);
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
        id, name, description, completed, start_time, end_time, is_full_day, latitude, longitude, location_name, url,
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
    event.location_name = location_name;
    event.url = url;
    event.updatedAt = new Date();

    try {
        await event.save();
        res.send(event);
    } catch (e) {
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
        res.status(400).send("Error during delete!");
    }
});

router.post('/invite', privateRoute, async (req, res) => {
    const { userId: UserId, eventId: EventId } = req.body;

    const participation = await db.Participation.build({
        UserId,
        EventId,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    try {
        const savedParticipation = await participation.save();
        res.send(savedParticipation);
    } catch (e) {
        res.status(400).send("Error during invite!");
    }
});

module.exports = router;