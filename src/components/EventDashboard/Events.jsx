import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ExpandMore from "@material-ui/icons/ExpandMore";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import { Popover, Radio, RadioGroup } from "@material-ui/core";

import {ColumnTitle} from "./Timeline";
import Event, { EventCard } from "./Event";
import withSettings from '../HOCs/withSettings';
import googleIcon from "../../images/google.svg";
import { getGoogleTokenExpired, googleCalendarEventToPlantimeeEvent } from "../../utils/helpers";
import { Control } from "../Header";
import { importEventsFromGoogleCalendar, listUserCalendars } from "../../api/google_calendar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import { importEvents } from "../../api/event";

export const Container = styled(Grid)`
  height: 100%;
`

export const ColumnHeader = styled(Grid)`
  padding: 0 7px 0 5px;
`;

export const ScrollArea = styled.div`
  width: 100%;
  height: calc(100% - 37px);
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 0.5em;
  }
  &::-webkit-scrollbar-track {
    background-color: #97a5c1;
  },
  &::-webkit-scrollbar-thumb {
    background: #556e9e;
  }
`;

export const ScrollContentWrapper = styled(Grid)`
  background-color: white;
  padding: 10px;
  min-height: 100%;
  position: relative;
`;

const GroupSwitch = styled(Button)`
  text-transform: none;
`;

const Label = styled(FormLabel)`
  margin: 10px 0;
`;

const Events = ({
  ownEvents,
  invitedEvents,
  chosenEvent,
  handleReload,
  setChosenEvent,
  openColumn,
  onCreateNewEvent,
  onChangeOwnEvent,
  googleOAuthToken,
  googleOAuthTokenExpireDate,
  translate: __
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showInvitedEvents, setShowInvitedEvents] = useState(true);
  const [showActiveEvents, setShowActiveEvents] = useState(true);
  const [showCompletedEvents, setShowCompletedEvents] = useState(true);
  const [userCalendars, setUserCalendars] = useState([]);
  const [chosenCalendar, setChosenCalendar] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImport = async () => {
    if (googleOAuthToken && chosenCalendar) {
      const timeMin = new Date().toISOString();
      const result = await importEventsFromGoogleCalendar(chosenCalendar, timeMin);

      if (result) {
        const { items } = result;
        const filterReccurentEventsTemporary = items.filter(event => !event.recurrence);
        const plantimeeEvents = await Promise.all(filterReccurentEventsTemporary.map(googleCalendarEventToPlantimeeEvent));

        const importResult = await importEvents(plantimeeEvents);

        if (importResult) {
          const { imported } = importResult;

          handleReload();
          alert(`${imported} events are successfully imported!`);
        }
      }
    }
  };

  const handleExport = async () => {
    console.log('Export');
  };

  const handleChangeCalendar = (event) => {
    setChosenCalendar(event.target.value);
  };

  const [ownActive, ownCompleted] = (ownEvents || []).reduce((grouped, event) => {
    if (event.completed) {
      grouped[1].push(event);
    } else {
      grouped[0].push(event);
    }

    return grouped;
  }, [[],[]]);

  const googleTokenExpired = getGoogleTokenExpired(googleOAuthToken, googleOAuthTokenExpireDate);

  useEffect(() => {
    (async() => {
      if (!googleTokenExpired) {
        const calendars = await listUserCalendars(googleOAuthToken);

        if (calendars) {
          const { items } = calendars;
          const primaryCalendar = items.find(calendar => calendar.primary);

          setUserCalendars(items);
          setChosenCalendar(primaryCalendar.id);
        }
      }

    })()
  }, [googleOAuthToken])

  return (
    <Container container direction="column" justifyContent="flex-start">
      <ColumnHeader container direction="row" alignItems="center">
        <ColumnTitle>{__('Events')}</ColumnTitle>
        <Button
          onClick={handleClick}
          style={{ marginLeft: 'auto' }}
        >
          {__('Sync with')}
          <img src={googleIcon} alt="google sync" style={{ width: 20, marginLeft: 5 }}/>
        </Button>
        <Button
          style={{ paddingLeft: 0 }}
          onClick={() => {
            onCreateNewEvent();
            openColumn('settings');
          }}
        >
          <AddIcon />{__('Create new')}
        </Button>
      </ColumnHeader>
      <ScrollArea>
        <ScrollContentWrapper container direction="column" alignItems="flex-start">
          <GroupSwitch onClick={() => {
            setShowInvitedEvents(!showInvitedEvents)
          }}>
            {showInvitedEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__("Events you're invited to")}
          </GroupSwitch>
          {showInvitedEvents && ( invitedEvents.length ? (
            <Grid container direction="column">
              {invitedEvents.map(event => (
                <Event
                  invited
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  openColumn={openColumn}
                  setChosenEvent={setChosenEvent}
                />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no invited events')}</EventCard>)}
          <GroupSwitch onClick={() => {
            setShowActiveEvents(!showActiveEvents)
          }}>
            {showActiveEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__('Your own active events')}
          </GroupSwitch>
          {showActiveEvents && ( ownActive.length ? (
            <Grid container direction="column">
              {ownActive.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  openColumn={openColumn}
                  onChangeOwnEvent={onChangeOwnEvent} />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no own active events')}</EventCard>)}
          <GroupSwitch onClick={() => {
            setShowCompletedEvents(!showCompletedEvents)
          }}>
            {showCompletedEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__('Completed events')}
          </GroupSwitch>
          {showCompletedEvents && ( ownCompleted.length ? (
            <Grid container direction="column">
              {ownCompleted.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  openColumn={openColumn}
                  onChangeOwnEvent={onChangeOwnEvent} />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no completed events')}</EventCard>)}
        </ScrollContentWrapper>
      </ScrollArea>
      <Popover
        id={anchorEl ? "simple-popover" : undefined}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        {googleTokenExpired ? (
          <Grid container direction="column" alignItems="center" style={{ padding: 15 }}>
            <h4 style={{ margin: 5 }}>{__('You are not logged in with Google')}</h4>
            <p style={{ margin: 5 }}>{__('Please, open settings on the top bar to log in')}</p>
          </Grid>
        ) : (
          <Control component="fieldset" variant="standard">
            <RadioGroup aria-label="gender" name="gender1" value={chosenCalendar} onChange={handleChangeCalendar}>
              <Label component="legend">{__('Choose a calendar:')}</Label>
              {userCalendars.length ? (
                userCalendars.map(calendar => (
                  <FormControlLabel key={calendar.id} value={calendar.id} control={<Radio color="primary" />} label={calendar.summary} />
                ))
              ) : (
                <React.Fragment>
                  <h4 style={{ margin: 5 }}>{__('Failed to fetch list of you calendars')}</h4>
                  <p style={{ margin: 5 }}>{__('Please try again later')}</p>
                </React.Fragment>
              )}
            </RadioGroup>
            <Grid container>
              <Button
                disabled={!chosenCalendar}
                onClick={handleImport}
              >
                <GetAppIcon style={{ marginRight: 'auto' }}/>
                {__('Import events')}
              </Button>
              <Button
                disabled={!chosenCalendar}
                onClick={handleExport}
              >
                <PublishIcon style={{ marginRight: 'auto' }}/>
                {__('Export events')}
              </Button>
            </Grid>
          </Control>
        )}
      </Popover>
    </Container>
  );
};

export default withSettings(Events);