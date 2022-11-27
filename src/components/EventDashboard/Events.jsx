import React, { useEffect, useState } from 'react';
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import styled from "styled-components";

import {useGoogleLogin} from "@react-oauth/google";
import DateFnsUtils from "@date-io/date-fns";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ExpandMore from "@material-ui/icons/ExpandMore";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import { Popover, Radio, RadioGroup, Checkbox } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import LogoutIcon from '@material-ui/icons/ExitToApp';

import { ColumnTitle } from "./Timeline";
import Event, { EventCard } from "./Event";
import withSettings from '../HOCs/withSettings';
import googleIcon from "../../images/google.svg";
import { getDayBounds, getGoogleTokenExpired, googleCalendarEventToPlantimeeEvent } from "../../utils/helpers";
import { Control } from "../Header";
import { getUserInfo, importEventsFromGoogleCalendar } from "../../api/google_calendar";
import { deleteCompletedEvent, importEvents } from "../../api/event";
import { GOOGLE_API_USER_SCOPE, LOCALE } from "../../constants/enums";
import { closeSnackbar, googleOAuthLogin, googleOAuthLogout, openSnackbar } from "../../actions/settingsAction";

export const Container = styled(Grid)`
  height: 100%;
`

export const ColumnHeader = styled(Grid)`
  padding: 0 7px 0 5px;
`;

export const ScrollArea = styled.div`
  width: 100%;
  flex: 1;
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

const SyncBlockTitle = styled.p`
  margin: 5px 0;
  font-weight: bold;
`;

const DatePicker = styled(KeyboardDatePicker)`
  margin: 10px 0;
  ${props => props.$inline ? `
    flex: 1;
    margin: 10px 5px;
  ` : ''};
`;

export const TooltipText = styled.p`
  font-size: 14px;
`

const TriggerModalButton = styled(Button)`
  min-width: 20px;
`;

const GoogleLoginButton = styled(Button)`
  margin: 5px 10px;
  border: 1px solid black;
`;

const ProfilePicture = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const Events = ({
  actions,
  language,
  ownEvents,
  invitedEvents,
  chosenEvent,
  handleReload,
  setChosenEvent,
  onCreateNewEvent,
  onChangeOwnEvent,
  googleOAuthToken,
  userCalendars,
  translate: __
}) => {
  const { dayStart: defaultStartShowDate } = getDayBounds();
  const { dayEnd: defaultEndShowDate } = getDayBounds();
  defaultEndShowDate.setDate(defaultEndShowDate.getDate() + 7);

  const [filterEventsModalAnchorEl, setFilterEventsModalAnchorEl] = useState(null);
  const [googleSyncModalAnchorEl, setGoogleSyncModalAnchorEl] = useState(null);
  const [chosenCalendar, setChosenCalendar] = useState(null);
  const [chosenDayStart, setChosenDayStart] = useState(new Date());

  const [showInvitedEvents, setShowInvitedEvents] = useState(true);
  const [showActiveEvents, setShowActiveEvents] = useState(true);
  const [showFullDayEvents, setShowFullDayEvents] = useState(false);
  const [showCompletedEvents, setShowCompletedEvents] = useState(false);

  const [filterByDate, setFilterByDate] = useState(false);
  const [startShowDate, setStartShowDate] = useState(defaultStartShowDate);
  const [endShowDate, setSndShowDate] = useState(defaultEndShowDate);

  const [userInfo, setUserInfo] = useState(null);

  const handleOpenGoogleSyncModal = (event) => {
    setGoogleSyncModalAnchorEl(event.currentTarget);
  };

  const handleCloseGoogleSyncModal = () => {
    setGoogleSyncModalAnchorEl(null);
  };

  const handleOpenFilterEventsModal = (event) => {
    setFilterEventsModalAnchorEl(event.currentTarget);
  };

  const handleCloseFilterEventsModal = () => {
    setFilterEventsModalAnchorEl(null);
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: codeResponse => {
      if (codeResponse) {
        const { access_token: accessToken } = codeResponse;
        const expireDate = new Date();

        expireDate.setSeconds(expireDate.getSeconds() + parseInt(codeResponse.expires_in, 10))

        actions.googleOAuthLogin(accessToken, expireDate);
      }
    },
    scope: Object.values(GOOGLE_API_USER_SCOPE).join(' '),
  });

  const handleImport = async () => {
    if (googleOAuthToken && chosenCalendar) {
      const { dayStart } = getDayBounds(chosenDayStart);
      const result = await importEventsFromGoogleCalendar(chosenCalendar, dayStart.toISOString());

      if (result) {
        const { items } = result;
        const filterCanceledEvents = items.filter(event => event.status !== 'cancelled');
        const plantimeeEvents = await Promise.all(filterCanceledEvents.map(googleCalendarEventToPlantimeeEvent));

        const importResult = await importEvents(plantimeeEvents);

        if (importResult) {
          const { edited, created } = importResult;

          handleReload();
          actions.openSnackbar(`${__('Events are successfully synchronized')} (${__('edited')}: ${edited}, ${__('created')}: ${created})!`);
          setTimeout(actions.closeSnackbar, 2000);
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

  const handleDeleteAllCompleted = async () => {
    await deleteCompletedEvent();
    handleReload();
  }

  const filterEventByDate = (event) => !event.recurrentEventId && (
    !filterByDate || (
      event.repeatEnabled && ((!event.repeatCount && !event.repeatUntil) || (event.repeatUntil && (startShowDate < new Date(event.repeatUntil)) ))
    ) || (startShowDate < new Date(event.endTime) && new Date(event.startTime) < endShowDate)
  );
  const invitedEventsToShow = invitedEvents ? invitedEvents.filter(filterEventByDate) : [];
  const [ownActive, ownFullDay, ownCompleted] = (ownEvents || []).reduce((grouped, event) => {
    if (!event.recurrentEventId) {
      if (event.completed) {
        grouped[2].push(event);
      } else if (filterEventByDate(event)) {
        if (event.isFullDay) {
          grouped[1].push(event);
        } else {
          grouped[0].push(event);
        }
      }
    }

    return grouped;
    }, [[], [], []]);

  const googleTokenExpired = getGoogleTokenExpired();

  useEffect(() => {
    (async() => {
      if (userCalendars) {
        const primaryCalendar = userCalendars.find(calendar => calendar.primary);

        if (primaryCalendar) {
          setChosenCalendar(primaryCalendar.id);
        }
      }
    })()
  }, [JSON.stringify(userCalendars)]);

  useEffect(() => {
    (async () => {
      if (!googleTokenExpired) {
        const userInfo = await getUserInfo(googleOAuthToken);

        if (userInfo) {
          setUserInfo(userInfo);
        }
      }
    })()
  }, [googleOAuthToken]);

  return (
    <Container container direction="column" justifyContent="flex-start">
      <ColumnHeader container direction="row" alignItems="center">
        <ColumnTitle>{__('Events')}</ColumnTitle>
          <span style={{ marginLeft: 'auto' }}>
            <Tooltip
              title={(
                <TooltipText>
                  {__('Filter events')}
                </TooltipText>
              )}
            >
              <TriggerModalButton
                onClick={handleOpenFilterEventsModal}
              >
                 <FilterListIcon />
              </TriggerModalButton>
            </Tooltip>
            <Tooltip
              title={(
                <TooltipText>
                  {__('Sync with Google')}
                </TooltipText>
              )}
            >
              <TriggerModalButton
                onClick={handleOpenGoogleSyncModal}
              >
                <img src={googleIcon} alt="google sync" style={{ width: 20 }} draggable={false} />
              </TriggerModalButton>
            </Tooltip>
          </span>
        <Button
          style={{ paddingLeft: 0 }}
          onClick={() => onCreateNewEvent()}
        >
          <AddIcon />{__('Create')}
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
          {showInvitedEvents && (invitedEventsToShow.length ? (
            <Grid container direction="column">
              {invitedEventsToShow.map(event => (
                <Event
                  invited
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
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
                  onChangeOwnEvent={onChangeOwnEvent}
                />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no own active events')}</EventCard>)}
          <GroupSwitch onClick={() => {
            setShowFullDayEvents(!showFullDayEvents)
          }}>
            {showFullDayEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__('Your own full day events')}
          </GroupSwitch>
          {showFullDayEvents && ( ownFullDay.length ? (
            <Grid container direction="column">
              {ownFullDay.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  onChangeOwnEvent={onChangeOwnEvent}
                />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no own full day events')}</EventCard>)}
          <Grid container alignItems="center" justifyContent="space-between">
            <GroupSwitch onClick={() => {
              setShowCompletedEvents(!showCompletedEvents)
            }}>
              {showCompletedEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
              {__('Completed events')}
            </GroupSwitch>
            <Button
              disabled={!ownCompleted.length}
              onClick={handleDeleteAllCompleted}
            >
              <DeleteIcon />
              {__('Delete all')}
            </Button>
          </Grid>
          {showCompletedEvents && ( ownCompleted.length ? (
            <Grid container direction="column">
              {ownCompleted.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  onChangeOwnEvent={onChangeOwnEvent} />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no completed events')}</EventCard>)}
        </ScrollContentWrapper>
      </ScrollArea>
      <Popover
        id={googleSyncModalAnchorEl ? "simple-popover" : undefined}
        open={!!googleSyncModalAnchorEl}
        anchorEl={googleSyncModalAnchorEl}
        onClose={handleCloseGoogleSyncModal}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        <Control component="fieldset" variant="standard">
          <SyncBlockTitle>{__('Synchronization with Google Calendar')}</SyncBlockTitle>
          {googleTokenExpired && (
            <GoogleLoginButton
              onClick={() => {
                handleGoogleSignIn();
              }}
            >
              <img src={googleIcon} alt="google sign in" style={{width: 30, marginRight: 5}}/>
              {__('Sign in with Google')}
            </GoogleLoginButton>
          )}
          {!googleTokenExpired && !!userInfo && (
            <Grid container alignItems="center" justifyContent="space-between" style={{ padding: '0 10px' }}>
              <ProfilePicture src={userInfo.picture || ''} alt={userInfo.name}/>
              <p style={{ margin: 5, textAlign: 'center' }}>
                {__('Signed in as:')}
                <br/>
                <span style={{ fontWeight: 'bold' }}>{userInfo.name}</span>
              </p>
              <Tooltip
                title={(
                  <TooltipText>
                    {__('Logout')}
                  </TooltipText>
                )}
              >
                <IconButton onClick={actions.googleOAuthLogout}>
                  <LogoutIcon/>
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          <RadioGroup aria-label="calendar" name="calendar" value={chosenCalendar} onChange={handleChangeCalendar}>
            <Label component="legend">{__('Choose a calendar:')}</Label>
            {!googleTokenExpired && userCalendars.length ? (
                userCalendars.map(calendar => (
                    <FormControlLabel key={calendar.id} value={calendar.id} control={<Radio color="primary"/>}
                                      label={calendar.summary}/>
                ))
            ) : (
                <React.Fragment>
                  <h4 style={{ margin: 5 }}>{__('Failed to fetch list of you calendars')}</h4>
                  <p style={{ margin: 5 }}>{__('Please login or try again later')}</p>
                </React.Fragment>
            )}
          </RadioGroup>
          <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
            <DatePicker
                variant="inline"
                label={__('Sync events starting from:')}
                format="yyyy/MM/dd"
                disabled={googleTokenExpired || !chosenCalendar}
                value={chosenDayStart}
                onChange={setChosenDayStart}
            />
          </MuiPickersUtilsProvider>
          <Grid container>
            <Button
                disabled={googleTokenExpired || !chosenCalendar}
                onClick={handleImport}
            >
              <GetAppIcon style={{marginRight: 'auto'}}/>
              {__('Import events')}
            </Button>
            <Button
                disabled
                // disabled={!chosenCalendar}
                onClick={handleExport}
            >
              <PublishIcon style={{marginRight: 'auto'}}/>
              {__('Export events')}
            </Button>
          </Grid>
        </Control>
      </Popover>
      <Popover
        id={filterEventsModalAnchorEl ? "simple-popover" : undefined}
        open={!!filterEventsModalAnchorEl}
        anchorEl={filterEventsModalAnchorEl}
        onClose={handleCloseFilterEventsModal}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}>
          <Control component="fieldset" variant="standard">
            <FormControlLabel
              control={(
                <Checkbox
                  color="primary"
                  checked={filterByDate}
                  onChange={(event) => { setFilterByDate(event.target.checked); }}
                />
              )}
              label={__('Enable filtering')}
            />
            <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
            <Grid container direction="column" justifyContent="space-around" alignItems="center">
              <DatePicker
                $inline
                disabled={!filterByDate}
                variant="inline"
                label={__('Show events since:')}
                format="yyyy/MM/dd"
                value={startShowDate}
                onChange={setStartShowDate}
              />
              <DatePicker
                $inline
                disabled={!filterByDate}
                variant="inline"
                label={__('Show events till:')}
                format="yyyy/MM/dd"
                value={endShowDate}
                onChange={setSndShowDate}
              />
            </Grid>
          </MuiPickersUtilsProvider>
          </Control>
      </Popover>
    </Container>
  );
};


const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    openSnackbar,
    closeSnackbar,
    googleOAuthLogin,
    googleOAuthLogout,
  }, dispatch),
});


export default compose(
  withSettings,
  connect(null, mapDispatchToProps)
)(Events);