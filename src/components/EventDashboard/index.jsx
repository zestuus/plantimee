import React, {useEffect, useState} from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";

import {Container} from "../SignIn";
import {PRIMARY_COLOR} from "../../utils/constants";
import {getWindowSize} from "../../utils/helpers";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Timeline from "./Timeline";
import Events from "./Events";
import Settings from "./Settings";
import {
    createEvent,
    deleteEvent, deleteInvitation,
    getInvitedEvents,
    getOwnEvents,
    inviteParticipant,
    rejectInvitation,
    updateEvent
} from "../../api/event";

const Title = styled.h1`
    @media (max-width: 600px) {
      font-size: 22px; 
    }
`;

const Table = styled(Grid)`
    border: 2px solid ${PRIMARY_COLOR};
    border-radius: 5px;
    height: calc(100% - 100px);
    @media (max-width: 600px) {
      height: calc(100% - 70px);
    }
`;

const Column = styled(Grid)`
    ${props => props.hidden ? 'display: none;' : ''};
    padding: 10px;
    height: 100%;
    &:not(:last-of-type) {
      border-right: 2px solid ${PRIMARY_COLOR};
    }
`

const ColumnSwitch = styled(Button)`
    text-transform: capitalize;
    font-size: 12px;
    height: 40px;
    width: 80px;
`;

const EventDashboard = () => {
    // external state
    const [chosenEvent, setChosenEvent] = useState(null);
    const [ownEvents, setOwnEvents] = useState([]);
    const [invitedEvents, setInvitedEvents] = useState([]);
    // internal state
    const [screenWidth, setScreenWidth] = useState(getWindowSize().width);
    const [columnShown, setColumnShown] = useState('timeline');
    const [anchorEl, setAnchorEl] = useState(null);

    const columnsVisibility = {
        timeline: true,
        tasks: true,
        settings: true,
    }

    useEffect(() => {
        (async () => {
            try {
                const ownEventsData = await getOwnEvents();
                const invitedEventsData = await getInvitedEvents();
                setOwnEvents(ownEventsData);
                setInvitedEvents(invitedEventsData);
            } catch (err) {
                setOwnEvents(null);
            }
        })();

        const handleResize = () => {
            setScreenWidth(getWindowSize().width);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSwitch = event => {
        setColumnShown(event.target.checked ? 'settings' : 'timeline');
    }

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const openColumn = column => {
        setColumnShown(column);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeOwnEvent = async newEventData => {
        const events = ownEvents.map(event => event.id === newEventData.id ? { ...newEventData } : {...event} );
        setOwnEvents(events);
        await updateEvent(newEventData);
    }

    const handleChangeOwnEventLocally = async newEventData => {
        const events = ownEvents.map(event => event.id === newEventData.id ? { ...newEventData } : {...event} );
        setOwnEvents(events);
    }

    const handleSaveChangesOwnEvent = async newEventData => {
        await updateEvent(newEventData);
    }

    const handleInvite = async data => {
        const events = ownEvents.map(event => event.id === data.eventId ?
            { ...event, attendees: [...event.attendees, {
                id: data.id,
                username: data.username,
                full_name: data.full_name,
                email: data.email,
            }] } :
            {...event}
        );
        setOwnEvents(events);
        await inviteParticipant(data);
    }

    const handleDeleteOwnEvent = async id => {
        const events = ownEvents.filter(event => event.id !== id);
        setChosenEvent(null);
        setOwnEvents(events);
        await deleteEvent(id);
    }

    const handleRejectInvitation = async id => {
        const events = invitedEvents.filter(event => event.id !== id);
        setChosenEvent(null);
        setInvitedEvents(events);
        await rejectInvitation(id);
    }

    const handleDeleteInvitation = async data => {
        const events = ownEvents.map(event => event.id === data.eventId ?
            { ...event, attendees: [...event.attendees.filter(attendee => attendee.id !== data.userId)] } :
            {...event}
        );
        setOwnEvents(events);
        await deleteInvitation(data);
    }

    const handleCreateNewEvent = async () => {
        const newEvent = await createEvent();
        setChosenEvent(newEvent.id);
        const events = [...ownEvents, newEvent]
        setOwnEvents(events);
    }

    if (600 < screenWidth && screenWidth < 960) {
        columnsVisibility.settings = columnShown === 'settings';
        columnsVisibility.timeline = !columnsVisibility.settings;
    } else if (screenWidth < 600) {
        columnsVisibility.timeline = columnShown === 'timeline';
        columnsVisibility.tasks = columnShown === 'tasks';
        columnsVisibility.settings = columnShown === 'settings';
    }

    const chosenEventData =  ownEvents.find(event => event.id === chosenEvent)
        || invitedEvents.find(event => event.id === chosenEvent);

    return (
        <Grid container justify="center">
            <Container item md={11} xs={11}>
                <Grid container justify="space-between" alignItems="center">
                    <Title>Dashboard</Title>
                    <Hidden xsDown mdUp>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={columnShown === 'settings'}
                                    onChange={handleSwitch}
                                    color="primary"
                                    name="show_settings"
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                />
                            }
                            label={columnShown === 'settings' ? "Settings" : "Timeline"}
                        />
                    </Hidden>
                    <Hidden smUp>
                        <ColumnSwitch
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            variant="contained"
                            color="primary"
                            onClick={handleClick}>
                            {columnShown}
                        </ColumnSwitch>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                selected={columnShown === 'timeline'}
                                onClick={() => {
                                    handleClose();
                                    setColumnShown('timeline')
                                }}>
                                Timeline</MenuItem>
                            <MenuItem
                                selected={columnShown === 'tasks'}
                                onClick={() => {
                                    handleClose();
                                    setColumnShown('tasks')
                                }}
                            >
                                Tasks
                            </MenuItem>
                            <MenuItem
                                selected={columnShown === 'settings'}
                                onClick={() => {
                                    handleClose();
                                    setColumnShown('settings')
                                }}
                            >
                                Settings
                            </MenuItem>
                        </Menu>
                    </Hidden>
                </Grid>
                <Table container alignItems="stretch">
                    {columnsVisibility['timeline'] && (
                        <Column item container direction="column" md={4} sm={6} xs={12}>
                            <Timeline
                                ownEvents={ownEvents}
                                invitedEvents={invitedEvents}
                                setChosenEvent={setChosenEvent}
                                setColumnShown={setColumnShown}
                            />
                        </Column>
                    )}
                    {columnsVisibility['tasks'] && (
                        <Column item container direction="column" md={4} sm={6} xs={12}>
                            <Events
                                ownEvents={ownEvents}
                                invitedEvents={invitedEvents}
                                chosenEvent={chosenEvent}
                                setChosenEvent={setChosenEvent}
                                openColumn={openColumn}
                                onCreateNewEvent={handleCreateNewEvent}
                                onChangeOwnEvent={handleChangeOwnEvent}
                            />
                        </Column>
                    )}
                    {columnsVisibility['settings'] && (
                        <Column item container direction="column" md={4} sm={6} xs={12}>
                            <Settings
                                eventData={chosenEventData}
                                onInviteAttendee={handleInvite}
                                onChangeOwnEventLocally={handleChangeOwnEventLocally}
                                onSaveChangesOwnEvent={handleSaveChangesOwnEvent}
                                onDeleteOwnEvent={handleDeleteOwnEvent}
                                onRejectInvitation={handleRejectInvitation}
                                onDeleteInvitation={handleDeleteInvitation}
                            />
                        </Column>
                    )}
                </Table>
            </Container>
        </Grid>
    );
};

export default EventDashboard;