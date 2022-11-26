import React, {useEffect, useState} from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';

import {Container} from "../SignIn";
import {PRIMARY_COLOR} from "../../constants/config";
import { getGoogleTokenExpired, getWindowSize } from "../../utils/helpers";
import Timeline from "./Timeline";
import Events, { TooltipText } from "./Events";
import Settings from "./Settings";
import {
  createEvent,
  deleteEvent, deleteInvitation, findHoursAutomatically,
  getInvitedEvents,
  getOwnEvents,
  inviteParticipant,
  rejectInvitation,
  updateEvent
} from "../../api/event";
import withSettings from '../HOCs/withSettings';
import { listUserCalendars } from "../../api/google_calendar";

const Title = styled.h1`
  @media (max-width: 600px) {
    font-size: 22px; 
  }
`;

const Table = styled(Grid)`
  border: 2px solid ${PRIMARY_COLOR};
  border-radius: 5px;
  height: calc(100% - 85px);
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
  font-size: 12px;
  height: 40px;
  width: 118px;
`;

const EventDashboard = ({ translate: __, googleOAuthToken }) => {
  // external state
  const [chosenEvent, setChosenEvent] = useState(null);
  const [ownEvents, setOwnEvents] = useState([]);
  const [ownEventsBackup, setOwnEventsBackup] = useState([]);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [userCalendars, setUserCalendars] = useState([]);
  // internal state
  const [screenWidth, setScreenWidth] = useState(getWindowSize().width);
  const [columnShown, setColumnShown] = useState('timeline');
  const [anchorEl, setAnchorEl] = useState(null);
  const [reloadSwitch, setReloadSwitch] = useState(false);
  const [reloadDate, setReloadDate] = useState(new Date());

  const columnsVisibility = {
    timeline: true,
    events: true,
    settings: true,
  }

  const googleTokenExpired = getGoogleTokenExpired();

  useEffect(() => {
    (async () => {
      try {
        const ownEventsData = await getOwnEvents(reloadDate);
        const invitedEventsData = await getInvitedEvents(reloadDate);
        setOwnEvents(ownEventsData);
        setOwnEventsBackup(ownEventsData);
        setInvitedEvents(invitedEventsData);
      } catch (err) {
        setOwnEvents(null);
      }
    })();
  }, [reloadSwitch]);

  useEffect(() => {
    (async() => {
      if (!googleTokenExpired) {
        const calendars = await listUserCalendars(googleOAuthToken);

        if (calendars) {
          const { items } = calendars;
          setUserCalendars(items);
        }
      }

    })()
  }, [googleOAuthToken, reloadSwitch])

  useEffect(() => {
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
    const result = await updateEvent(newEventData);
    if (result) {
      setOwnEventsBackup(ownEvents);
    }
  }

  const handleInvite = async data => {
    const attendee = await inviteParticipant(data);
    if (attendee) {
      const events = ownEvents.map(event => event.id === data.eventId ?
          {
            ...event, attendees: [...(event.attendees || []), {
              id: attendee.id,
              username: attendee.username,
              full_name: attendee.full_name,
              email: attendee.email,
            }]
          } :
          { ...event }
      );
      setOwnEvents(events);
      return true;
    } else {
      return false;
    }
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

    if (newEvent) {
      setChosenEvent(newEvent.id);
      const events = [...(ownEvents || []), newEvent]
      setOwnEvents(events);
      setReloadSwitch(!reloadSwitch);
    }
  }

  const handleFindAutomatically = async data => {
    const updatedEvent = await findHoursAutomatically(data);
    if (updatedEvent) {
      const events = ownEvents.map(event => event.id === updatedEvent.id ? {...updatedEvent} : {...event});
      setOwnEvents(events);
      return updatedEvent;
    } else {
      return null;
    }
  }

  const handleReload = (date = null) => {
    setReloadSwitch(!reloadSwitch)
    if (date) {
      setReloadDate(date);
    }
  };

  if (600 < screenWidth && screenWidth < 960) {
    columnsVisibility.settings = columnShown === 'settings';
    columnsVisibility.timeline = !columnsVisibility.settings;
  } else if (screenWidth < 600) {
    columnsVisibility.timeline = columnShown === 'timeline';
    columnsVisibility.events = columnShown === 'events';
    columnsVisibility.settings = columnShown === 'settings';
  }

  const chosenEventData = (ownEvents && ownEvents.find(event => event.id === chosenEvent))
    || (invitedEvents && invitedEvents.find(event => event.id === chosenEvent));
  const chosenEventDataBackup = ownEventsBackup && ownEventsBackup.find(event => event.id === chosenEvent);

  return (
    <Grid container justifyContent="center">
      <Container item md={11} xs={11}>
        <Grid container alignItems="center">
          <Title>
            {__('Event Dashboard')}
          </Title>
          <Tooltip
            title={(
              <TooltipText>
                {__('Update data')}
              </TooltipText>
            )}
          >
            <IconButton onClick={() => handleReload()} style={{ margin: '6px 0 0 5px', padding: 0 }}>
              <CachedIcon/>
            </IconButton>
          </Tooltip>
          <Hidden xsDown mdUp>
            <FormControlLabel
              style={{ marginLeft: 'auto' }}
              control={
                <Switch
                  checked={columnShown === 'settings'}
                  onChange={handleSwitch}
                  color="primary"
                  name="show_settings"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label={columnShown === 'settings' ? __("Settings") : __("Timeline")}
            />
          </Hidden>
          <Hidden smUp>
            <ColumnSwitch
              style={{ marginLeft: 'auto' }}
              aria-controls="simple-menu"
              aria-haspopup="true"
              variant="contained"
              color="primary"
              onClick={handleClick}>
              {__(columnShown.charAt(0).toUpperCase() + columnShown.slice(1))}
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
                {__('Timeline')}
              </MenuItem>
              <MenuItem
                selected={columnShown === 'events'}
                onClick={() => {
                  handleClose();
                  setColumnShown('events')
                }}
              >
                {__('Events')}
              </MenuItem>
              <MenuItem
                selected={columnShown === 'settings'}
                onClick={() => {
                  handleClose();
                  setColumnShown('settings')
                }}
              >
                {__('Settings')}
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
                handleReload={handleReload}
              />
            </Column>
          )}
          {columnsVisibility['events'] && (
            <Column item container direction="column" md={4} sm={6} xs={12}>
              <Events
                ownEvents={ownEvents}
                invitedEvents={invitedEvents}
                chosenEvent={chosenEvent}
                setChosenEvent={setChosenEvent}
                userCalendars={userCalendars}
                handleReload={handleReload}
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
                eventDataBackup={chosenEventDataBackup}
                userCalendars={userCalendars}
                onInviteAttendee={handleInvite}
                onChangeOwnEventLocally={handleChangeOwnEventLocally}
                onSaveChangesOwnEvent={handleSaveChangesOwnEvent}
                onDeleteOwnEvent={handleDeleteOwnEvent}
                onRejectInvitation={handleRejectInvitation}
                onDeleteInvitation={handleDeleteInvitation}
                onFindAutomatically={handleFindAutomatically}
              />
            </Column>
          )}
        </Table>
      </Container>
    </Grid>
  );
};

export default withSettings(EventDashboard);