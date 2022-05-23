import React, { forwardRef, useEffect, useState } from 'react';
import styled from "styled-components";
import MapPicker from "react-google-map-picker";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import Alert from '@material-ui/lab/Alert';

import {ColumnTitle} from './Timeline';
import {
  ColumnHeader, Container, ScrollArea, ScrollContentWrapper
} from './Events';
import {
  countCertainDay,
  formatDateString,
  getDayBounds,
  getGoogleTokenExpired, getPluralizePeriodsSuffix, isMonthlyByDayValue,
  roundFloat
} from '../../utils/helpers';
import {
  EnglishDays,
  OneDay, OneHour, OneMinute, UkrainianDays
} from '../../constants/config';
import Participant from './Participant';
import AutoFindModal from '../dialogs/AutoFindModal';
import withSettings from '../HOCs/withSettings';
import {findNearbyLocation} from "../../api/maps";
import ChooseLocationDialog from "../dialogs/ChooseLocationDialog";

import { KeyboardDatePicker, KeyboardDateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
  LANGUAGE,
  LOCALE,
  ORDINAL_NUMBERS,
  REPEAT_FREQ,
  REPEAT_FREQ_LABEL,
  REPEAT_FREQ_TYPES
} from "../../constants/enums";
import DateFnsUtils from "@date-io/date-fns";
import googleIcon from "../../images/google.svg";
import Tooltip from "@material-ui/core/Tooltip";
import { LinkOff } from "@material-ui/icons";
import { MenuItem, Radio, Select } from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

const Input = styled(TextField)`
    margin: 10px 0;
`;

const ParticipantsBlock = styled(Grid)`
  margin: 10px 0;
`;

const DateTimePicker = styled(KeyboardDateTimePicker)`
  margin: 10px 0;
`;

const DatePicker = styled(KeyboardDatePicker)`
  margin: 10px 0;
  ${props => props.$width ? `width: ${props.$width};` : ''}
`;

const SettingsBlockTitle = styled.p`
  margin: 10px 0;
  font-weight: bold;
`;

const TooltipText = styled.p`
  font-size: 14px;
`;

const DurationPicker = styled(Input)`
  margin: 0 10px;
  width: 15%;
`;

const HalfWidthInput = styled(Input)`
  width: 45%;
`;

const Row = styled(Grid)`
  margin: 15px 0;
`;

const EventNotChosen = styled(Grid)`
  height: 100%;
  background-color: white;
`;

const OnlineURL = styled.a`
  color: #1e8cf8;

  :hover {
    color: #5babfa;
  }
`;

const MapWrapper = styled(Grid)`
  & [aria-label="Map"] {
    ${props => props.readOnly ? 'pointer-events: none;': ''}
  }
`;

const DefaultLocation = { lat: 49.843625, lng: 24.026442};
const DefaultZoom = 10;

const TooltipToggleButton = forwardRef(
  ({ TooltipProps, ...props }, ref) => {
    return (
      <Tooltip {...TooltipProps}>
        <ToggleButton ref={ref} {...props} />
      </Tooltip>
    );
  }
);

const Settings = ({
  translate: __,
  language,
  militaryTime,
  eventData,
  eventDataBackup,
  userCalendars,
  onChangeOwnEventLocally,
  onSaveChangesOwnEvent,
  onDeleteOwnEvent,
  onRejectInvitation,
  onInviteAttendee,
  onDeleteInvitation,
  onFindAutomatically,
 }) => {
  const [zoom, setZoom] = useState(DefaultZoom);
  const [open, setOpen] = useState(false);
  const [autoFindProps, setAutoFindProps] = useState({});
  const [autoFindError, setAutoFindError] = useState('');
  const [attendeeFindError, setAttendeeFindError] = useState('');
  const [keywordToLookFor, setKeywordToLookFor] = useState('');
  const [placesToChoose, setPlacesToChoose] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [selectedRange, setSelectedRange] = useState(0);

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const isInvitedEvent = !!(eventData && eventData.organizer);
  const readOnly = isInvitedEvent ? { InputProps: { readOnly: true }} : {};
  const selectionRanges = [[0,4], [5,7], [8,10], [11,13], [14,16], [17,19]];

  const now = new Date();

  now.setMinutes(now.getMinutes() + 1);

  const startDateTime = eventData && new Date(eventData.startTime);
  const endDateTime = eventData && new Date(eventData.endTime);

  const datesAreValid = eventData && startDateTime <= endDateTime;

  const location = eventData && eventData.latitude && eventData.longitude ? {
    lat: parseFloat(eventData.latitude),
    lng: parseFloat(eventData.longitude)
  } : DefaultLocation;

  const timedelta = endDateTime - startDateTime;

  let daysLong = Math.trunc( timedelta / OneDay);
  let hoursLong = Math.trunc( (timedelta - daysLong * OneDay) / OneHour);
  let minutesLong = Math.trunc((timedelta - daysLong * OneDay - hoursLong * OneHour) / OneMinute);

  if (hoursLong === 23 && minutesLong === 59) {
    daysLong += 1;
    hoursLong = 0;
    minutesLong = 0;
  }

  const linkedToExistingCalendar = userCalendars && eventData && userCalendars.find(calendar => calendar.id === eventData.googleCalendarId);
  const googleTokenExpired = getGoogleTokenExpired();

  const handleArrowPressed = (event, key, addValue = 0) => {
    event.preventDefault();
    let { value } = event.target;
    const ampm = value.slice(-2);
    if (ampm === 'ДП' || ampm === 'ПП') value = value.replace('ДП', 'AM').replace('ПП', 'PM');
    let date = new Date(value);

    switch (selectedRange) {
      case 0:
        date.setFullYear(date.getFullYear() + addValue);
        break;
      case 1:
        date.setMonth(date.getMonth() + addValue);
        break;
      case 2:
        date.setDate(date.getDate() + addValue);
        break;
      case 3:
        date.setHours(date.getHours() + addValue);
        break;
      case 4:
        date.setMinutes(date.getMinutes() + addValue);
        break;
      case 5:
        date.setHours(date.getHours() + ((ampm === 'AM' || ampm === 'ДП') ? 12 : -12));
        break;
      default: break;
    }

    if (key === 'startTime') {
      if (eventData.endTime) {
        const startDate = new Date(date.getTime());
        startDate.setDate(startDate.getDate() + daysLong);
        startDate.setHours(startDate.getHours() + hoursLong);
        startDate.setMinutes(startDate.getMinutes() + minutesLong);

        onChangeOwnEventLocally({
          ...eventData,
          startTime: formatDateString(date),
          endTime: formatDateString(startDate),
        });
      } else {
        onChangeOwnEventLocally({
          ...eventData,
          startTime: formatDateString(date),
          endTime: formatDateString(date),
        });
      }
    } else {
      onChangeOwnEventLocally({ ...eventData, [key]: formatDateString(date) });
    }

    setTimeout(() => event.target.setSelectionRange(...selectionRanges[selectedRange]), 0);
  };

  const handleDateTimeClick = (event) => {
    const {
      target: { selectionStart }
    } = event;

    const foundRangeIndex = selectionRanges.findIndex(([start, end]) => (
      start <= selectionStart && selectionStart <= end
    ));
    const foundRange = selectionRanges[foundRangeIndex];

    if (foundRange) {
      event.target.setSelectionRange(...foundRange);
      setSelectedRange(foundRangeIndex);
    }
  };

  const handleKeyDown = (event, key, readOnly = false) => {
    const { code } = event;

    if ( code === 'Tab') {
      event.preventDefault();
      const newRangeIndex = (selectedRange + 1) % selectionRanges.length;
      const newRange = selectionRanges[newRangeIndex];

      if (newRange) {
        event.target.setSelectionRange(...newRange);
        setSelectedRange(newRangeIndex);
      }
    } else if ( code === 'ArrowUp') {
      handleArrowPressed(event, key, 1);
    } else if ( code === 'ArrowDown') {
      handleArrowPressed(event, key, -1);
    } else if (readOnly) {
      event.preventDefault();
    }
  };

  const handleChangeLocation = async (lat, lng) => {
    const latitude = roundFloat(lat,7);
    const longitude = roundFloat(lng,7);

    const { results } = await findNearbyLocation({ location: `${latitude},${longitude}`, language });
    const placesFound = results.filter(place => place.business_status);
    const updatedEventData = {...eventData, latitude, longitude };

    setPlacesToChoose(placesFound);

    onChangeOwnEventLocally(updatedEventData);
    onSaveChangesOwnEvent(updatedEventData);
  };

  const handleChooseLocation = (place) => {
    const updatedEventData = { ...eventData, ...place };

    onChangeOwnEventLocally(updatedEventData);
    onSaveChangesOwnEvent(updatedEventData);
    setPlacesToChoose([]);
  };

  const handleChangeZoom = (newZoom) => {
    setZoom(newZoom);
  }

  const handleBlur = (key) => {
    if (!isInvitedEvent && (!eventDataBackup || (eventData && eventData[key] !== eventDataBackup[key] && !eventData.recurrentEventId))) {
      onSaveChangesOwnEvent(eventData);
    }
  }

  const handleUnlinkEvent = () => {
    const updatedEventData = { ...eventData, googleId: null, googleCalendarId: null };

    onChangeOwnEventLocally(updatedEventData);
    onSaveChangesOwnEvent(updatedEventData);
  };

  useEffect(() => {
    setShowMap(false);
  }, [language])

  useEffect(() => {
    if (!showMap) {
      setTimeout(() => setShowMap(true),0);
    }
  }, [showMap])

  const EventDateTimePicker = (eventData && eventData.isFullDay) ? DatePicker : DateTimePicker ;

  const dayOfWeek = eventData && eventData.startTime && new Date(eventData.startTime).getDay();
  const indexOfDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const defaultDay = EnglishDays[indexOfDay] ? (EnglishDays[indexOfDay].slice(0, 2).toUpperCase()) : '';

  const startOfMonth = eventData && new Date(eventData.startTime.slice(0,7));
  const endOfMonth = eventData && new Date(eventData.startTime.slice(0,7));
  let defaultUntilDate = new Date();
  if (eventData) {
    const startDate = new Date(eventData.startTime);
    switch (eventData.repeatFreq) {
      case REPEAT_FREQ.DAILY:
        startDate.setDate(startDate.getDate() + (eventData.repeatInterval || 1));
        break;
      case REPEAT_FREQ.WEEKLY:
        startDate.setDate(startDate.getDate() + (eventData.repeatInterval || 1) * 7);
        break;
      case REPEAT_FREQ.MONTHLY:
        startDate.setMonth(startDate.getMonth() + (eventData.repeatInterval || 1));
        break;
      case REPEAT_FREQ.YEARLY:
        startDate.setFullYear(startDate.getFullYear() + (eventData.repeatInterval || 1));
        break;
      default: break;
    }
    ({ dayEnd: defaultUntilDate } = getDayBounds(startDate));

    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(endOfMonth.getDate() - 1);
  }
  const daysCountFromMonthStart = eventData && countCertainDay(dayOfWeek, startOfMonth, new Date(eventData.startTime));
  const daysCountToMonthEnd = eventData && countCertainDay(dayOfWeek, new Date(eventData.startTime), endOfMonth) - 1;

  return (
    <Container container direction="column" justifyContent="flex-start">
      <ColumnHeader
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <ColumnTitle>{__('Settings')}</ColumnTitle>
        {isInvitedEvent ? (
          <Button
            style={{ fontSize: 13 }}
            onClick={() => {
              onRejectInvitation(eventData.id);
            }}
          >
            <CloseIcon /> {__('Reject invite')}
          </Button>
        ) : (
          <Button disabled={!eventData} onClick={() => {
            onDeleteOwnEvent(eventData.id);
          }}>
            <DeleteIcon /> {__('Remove')}
          </Button>
        )}
      </ColumnHeader>
      <ScrollArea>
        {eventData ? (
          <ScrollContentWrapper
            container
            direction="column"
            alignItems="stretch"
          >
            <Grid container alignItems="center">
              <SettingsBlockTitle>{__('General info')}</SettingsBlockTitle>
              {!!eventData.googleId && (
                  <Grid
                    item
                    container
                    alignItems="center"
                    justifyContent="flex-end"
                    style={{ flex: 1 }}
                  >
                    <Tooltip
                      disableFocusListener={!!linkedToExistingCalendar}
                      disableHoverListener={!!linkedToExistingCalendar}
                      disableTouchListener={!!linkedToExistingCalendar}
                      title={googleTokenExpired ? (
                        <TooltipText>
                          {__('You are not logged in with Google')}
                          <br />
                          {__('Please, open settings on the top bar to log in')}
                        </TooltipText>
                      ) : (!linkedToExistingCalendar && (
                        <TooltipText>
                          {__('Your event is linked to another Google account or calendar which doesn\'t not exist anymore. Please, login with other Google account or unlink this event to sync data')}
                        </TooltipText>
                      ))}
                    >
                      <Grid
                        item
                        container
                        alignItems="center"
                        justifyContent="flex-end"
                        style={{ flex: 1, opacity: linkedToExistingCalendar ? 1 : 0.26, userSelect: 'none' }}
                      >
                        <span>{__('Linked to')}</span>
                        <img
                          src={googleIcon}
                          alt="google sync"
                          style={{ width: 20, marginLeft: 5 }}
                          draggable={false}
                        />
                      </Grid>
                    </Tooltip>
                    <IconButton disabled={googleTokenExpired} onClick={handleUnlinkEvent}>
                      <LinkOff />
                    </IconButton>
                  </Grid>
              )}
            </Grid>
            <Input
              {...readOnly}
              label={__('Title')}
              value={eventData.name || ''}
              onChange={(event) => {
                onChangeOwnEventLocally({
                  ...eventData, name: event.target.value,
                });
              }}
              onBlur={() => handleBlur('name')}
            />
            <Input
              {...readOnly}
              label={__('Description')}
              value={eventData.description || ''}
              onChange={(event) => {
                onChangeOwnEventLocally({
                  ...eventData, description: event.target.value,
                });
              }}
              onBlur={() => handleBlur('description')}
            />
            {(!isInvitedEvent || (isInvitedEvent && eventData.url)) && (
              <div style={{ position: 'relative' }}>
                <Input
                  disabled={isInvitedEvent}
                  style={{ width: '100%' }}
                  label={__('Online meet url')}
                  value={isInvitedEvent ? ' ' : eventData.url || ''}
                  onChange={(event) => {
                    onChangeOwnEventLocally({
                      ...eventData, url: event.target.value,
                    });
                  }}
                  onBlur={() => handleBlur('url')}
                />
                {isInvitedEvent && (
                  <div style={{ position: 'absolute', top: 32 }}>
                    <OnlineURL href={eventData.url} target="_blank">{eventData.url}</OnlineURL>
                  </div>
                )}
              </div>
            )}
            <ParticipantsBlock
              container
              direction="column"
              alignItems="stretch"
            >
              <Grid container alignItems="center" justifyContent="space-between">
                <SettingsBlockTitle>{__('Participants')}</SettingsBlockTitle>
                {!isInvitedEvent && (<FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={!!eventData.isGuestListPublic}
                      onBlur={() => handleBlur('isGuestListPublic')}
                      onChange={(event) => {
                        onChangeOwnEventLocally({
                          ...eventData,
                          isGuestListPublic: event.target.checked,
                        });
                      }}
                    />
                  }
                  label={__('list is visible to others')}
                />)}
              </Grid>
              {eventData && eventData.attendees
                && eventData.attendees.length ?
                  eventData.attendees.map((attendee, index) => (
                    <Participant
                      key={attendee.id}
                      isOrganiser={index === 0}
                      isYou={isInvitedEvent ? attendee.isYou : index === 0}
                      userInfo={attendee}
                      eventId={eventData.id}
                      onDeleteInvitation={!isInvitedEvent && onDeleteInvitation}/>
                  )) : <Participant noAttendees />
              }
              {isInvitedEvent && !eventData.isGuestListPublic ? (
                <Participant listIsHidden />
              ) : null}
              {!isInvitedEvent && (
                <React.Fragment>
                  <Input
                    label={__('Input username or email')}
                    value={keywordToLookFor || ''}
                    onChange={(event) => {
                      setKeywordToLookFor(event.target.value);
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      const result = await onInviteAttendee({
                        keywordToLookFor, eventId: eventData.id
                      });

                      if (!result) {
                        setAttendeeFindError(__("Cannot find user with given username or user is already invited"))
                      } else {
                        setAttendeeFindError('');
                        setKeywordToLookFor('');
                      }
                    }}
                  >
                    <AddIcon /> {__('Add participant')}
                  </Button>
                  {attendeeFindError && (
                    <Alert severity="error" style={{ margin: '10px 0'}} onClose={() => setAttendeeFindError('')}>
                      {attendeeFindError}
                    </Alert>
                  )}
                </React.Fragment>
              )}
            </ParticipantsBlock>
            <SettingsBlockTitle>{__('Date and time')}</SettingsBlockTitle>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={!!eventData.isFullDay}
                  onBlur={() => handleBlur('isFullDay')}
                  onChange={(event) => {
                    if (!isInvitedEvent) {
                      const date = new Date();
                      const dateString = `${date.getFullYear()}-` +
                        `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
                        `${date.getDate().toString().padStart(2, '0')}`;

                      if (!eventDataBackup.isFullDay && eventData.isFullDay && !event.target.checked) {
                        onChangeOwnEventLocally({
                          ...eventData,
                          isFullDay: false,
                          startTime: eventDataBackup.startTime,
                          endTime: eventDataBackup.endTime,
                        });
                      } else {
                        if (!event.target.checked) {
                          const startTime = new Date();
                          const endTime = new Date();
                          endTime.setHours(endTime.getHours() + 1);

                          onChangeOwnEventLocally({
                            ...eventData,
                            isFullDay: event.target.checked,
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                          });
                        } else {
                          const startTime =
                            (eventData.startTime || dateString)
                              .split('T')[0] + 'T00:00';
                          const endTime =
                            (eventData.endTime || dateString)
                              .split('T')[0] + 'T23:59';

                          onChangeOwnEventLocally({
                            ...eventData,
                            isFullDay: event.target.checked,
                            startTime,
                            endTime,
                          });
                        }
                      }
                    }
                  }}
                />
              }
              label={__('Full day event')}
            />
            <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
              {(!isInvitedEvent || (isInvitedEvent && eventData.startTime)) && (
                <EventDateTimePicker
                  variant="inline"
                  ampm={!militaryTime}
                  label={eventData.isFullDay ? __('Start date') : __('Start date&time')}
                  readOnly={isInvitedEvent}
                  value={eventData.startTime ? new Date(eventData.startTime) : new Date()}
                  format={`yyyy/MM/dd${eventData.isFullDay ? '' : (militaryTime ? ' HH:mm' : ' hh:mm a')}`}
                  onBlur={() => handleBlur('startTime')}
                  onClose={() => handleBlur('startTime')}
                  onClick={handleDateTimeClick}
                  onKeyDown={(event) => handleKeyDown(event, 'startTime', (isInvitedEvent || (!militaryTime && language !== LANGUAGE.EN)))}
                  onChange={(value) => {
                    if (eventData.endTime) {
                      let startDate = new Date(eventData.endTime);

                      if (value && (value instanceof Date)) {
                        startDate = new Date(value);
                        startDate.setDate(startDate.getDate() + daysLong);
                        startDate.setHours(startDate.getHours() + hoursLong);
                        startDate.setMinutes(startDate.getMinutes() + minutesLong);
                      }

                      onChangeOwnEventLocally({
                        ...eventData,
                        startTime: formatDateString(value),
                        endTime: formatDateString(startDate),
                      });
                    } else {
                      onChangeOwnEventLocally({
                        ...eventData,
                        startTime: value,
                        endTime: value,
                      });
                    }
                  }}
                />
              )}
              {(!isInvitedEvent || (isInvitedEvent && eventData.endTime)) && (
                <EventDateTimePicker
                  variant="inline"
                  readOnly={isInvitedEvent}
                  ampm={!militaryTime}
                  label={eventData.isFullDay ? __('End date') : __('End date&time')}
                  value={eventData.endTime ? new Date(eventData.endTime) : new Date()}
                  format={`yyyy/MM/dd${eventData.isFullDay ? '' : (militaryTime ? ' HH:mm' : ' hh:mm a')}`}
                  onBlur={() => handleBlur('endTime')}
                  onClose={() => handleBlur('endTime')}
                  onClick={handleDateTimeClick}
                  onKeyDown={(event) => handleKeyDown(event, 'endTime', (isInvitedEvent || (!militaryTime && language !== LANGUAGE.EN)))}
                  onChange={(value) => {
                    const formatedValue = formatDateString(value);

                    onChangeOwnEventLocally({
                      ...eventData,
                      endTime: formatedValue,
                      startTime: eventData.startTime || formatedValue,
                    });
                  }}
                />
              )}
            </MuiPickersUtilsProvider>
            {!datesAreValid && (
              <Alert severity="error" style={{ margin: '10px 0'}}>
                {__('End time should be after start time')}
              </Alert>
            )}
            {!isInvitedEvent && (
              <Row
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                {__('Duration')}:
                <DurationPicker
                  type="number"
                  label={__('Days')}
                  value={daysLong}
                  InputProps={{ inputProps: { min: 0, max: 9999 } }}
                  onBlur={() => handleBlur('endTime')}
                  onChange={(event) => {
                    if (event.target.value) {
                      const startDate = new Date(eventData.startTime)
                      startDate.setDate(startDate.getDate() + parseInt(event.target.value, 10));
                      startDate.setHours(startDate.getHours() + hoursLong);
                      startDate.setMinutes(startDate.getMinutes() + minutesLong);
                      onChangeOwnEventLocally({
                        ...eventData,
                        endTime: formatDateString(startDate),
                      });
                    }
                  }} />
                <DurationPicker
                  disabled={eventData.isFullDay}
                  type="number"
                  label={__('Hours')}
                  value={hoursLong}
                  InputProps={{ inputProps: { min: 0, max: 9999 } }}
                  onBlur={() => handleBlur('endTime')}
                  onChange={(event) => {
                    if (event.target.value) {
                      const startDate = new Date(eventData.startTime);
                      startDate.setDate(startDate.getDate() + daysLong);
                      startDate.setHours(startDate.getHours() + parseInt(event.target.value, 10));
                      startDate.setMinutes(startDate.getMinutes() + minutesLong);
                      onChangeOwnEventLocally({
                        ...eventData,
                        endTime: formatDateString(startDate),
                      });
                    }
                  }} />
                <DurationPicker
                  disabled={eventData.isFullDay}
                  type="number"
                  label={__('Minutes')}
                  value={minutesLong}
                  InputProps={{ inputProps: { min: 0, max: 9999 } }}
                  onBlur={() => handleBlur('endTime')}
                  onChange={(event) => {
                    if (event.target.value) {
                      const startDate = new Date(eventData.startTime)
                      startDate.setDate(startDate.getDate() + daysLong)
                      startDate.setHours(startDate.getHours() + hoursLong);
                      startDate.setMinutes(startDate.getMinutes() + parseInt(event.target.value, 10));
                      onChangeOwnEventLocally({
                        ...eventData,
                        endTime: formatDateString(startDate)
                      });
                    }
                  }} />
              </Row>
            )}
            {!isInvitedEvent && !eventData.isFullDay && (
              <Grid container direction="row" style={{ marginBottom: 5 }}>
                <Button
                  style={{ flex: 1 }}
                  color="primary"
                  variant="contained"
                  onClick={ async () => {
                    const result = onFindAutomatically({
                      event: eventData.id,
                      duration: daysLong* 24*60 + hoursLong*60 + minutesLong,
                      ...autoFindProps
                    })
                    if (!await result) {
                      setAutoFindError(
                        __("Cannot find free time in chosen range. Please update find conditions"))
                    } else {
                      setAutoFindError('')
                    }
                    handleBlur('startTime');
                  }}
                >
                  <SearchIcon /> {__('Auto find free time')}
                </Button>
                <IconButton
                  style={{ padding: 0, marginLeft: 10 }}
                  onClick={() => {
                    setOpen(true);
                  }}>
                  <SettingsIcon />
                </IconButton>
                {autoFindError && (
                  <Alert severity="error" style={{ margin: '10px 0'}} onClose={() => setAutoFindError('')}>
                    {autoFindError}
                  </Alert>
                )}
                <AutoFindModal
                  open={open}
                  autoFindProps={autoFindProps}
                  onClose={() => {setOpen(false);}}
                  setAutoFindProps={setAutoFindProps} />
              </Grid>
            )}
              <SettingsBlockTitle>{__('Repeat')}</SettingsBlockTitle>
              {!isInvitedEvent && (<FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={!!eventData.repeatEnabled}
                    onBlur={() => handleBlur('repeatEnabled')}
                    onChange={(event) => {
                      if (!isInvitedEvent) {
                        const otherFields = {};
                        if (event.target.checked) {
                          otherFields.repeatInterval = eventData.repeatEnabled || 1;
                          otherFields.repeatFreq = eventData.repeatFreq || REPEAT_FREQ.WEEKLY;
                          otherFields.repeatByDay = eventData.repeatByDay || defaultDay;
                        }

                        onChangeOwnEventLocally({
                          ...eventData,
                          ...otherFields,
                          repeatEnabled: event.target.checked,
                        });
                      }
                    }}
                  />
                }
                label={__('Repeat event')}
              />)}
              <Grid container alignItems="center">
                <p style={{ marginRight: 5, color: eventData.repeatEnabled ? 'black' : 'rgba(0,0,0,0.38)' }}>
                  {((!eventData.repeatInterval || eventData.repeatInterval === 1) ? __('Repeat every') : __('Repeat every ')).trim()}
                </p>
                <Input
                  {...readOnly}
                  type="number"
                  disabled={!eventData.repeatEnabled}
                  style={{ width: 60, marginRight: 5 }}
                  inputProps={{ style: { textAlign: 'center' } }}
                  value={eventData.repeatInterval || 1}
                  onBlur={() => handleBlur('repeatInterval')}
                  onChange={(event) => {
                    if (!isInvitedEvent) {
                      onChangeOwnEventLocally({
                        ...eventData,
                        repeatInterval: Math.max(Math.min(parseInt(event.target.value, 10), 1000), 1),
                      });
                    }
                  }}
                />
                <Select
                  disabled={!eventData.repeatEnabled}
                  value={eventData.repeatFreq || REPEAT_FREQ.WEEKLY}
                  onBlur={() => handleBlur('repeatFreq')}
                  onChange={(event) => {
                    if (!isInvitedEvent) {
                      if (eventDataBackup && eventDataBackup.repeatFreq === event.target.value) {
                        onChangeOwnEventLocally({
                          ...eventData,
                          repeatFreq: event.target.value,
                          repeatByDay: eventDataBackup.repeatByDay || event.target.value === REPEAT_FREQ.WEEKLY ? defaultDay : '',
                        });
                      } else {
                        onChangeOwnEventLocally({
                          ...eventData,
                          repeatFreq: event.target.value,
                          repeatByDay: event.target.value === REPEAT_FREQ.WEEKLY ? defaultDay : '',
                        });
                      }
                    }
                  }}
                >
                  {REPEAT_FREQ_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      {__(REPEAT_FREQ_LABEL[type] + getPluralizePeriodsSuffix(eventData.repeatInterval)).trim()}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              {eventData.repeatFreq === REPEAT_FREQ.WEEKLY && (
                <ToggleButtonGroup
                  color="primary"
                  value={(eventData.repeatByDay || '').split(',').filter(Boolean)}
                  onBlur={() => handleBlur('repeatByDay')}
                  onChange={(e, value) => {
                    // todo: update event start day when event start date's day of week is missing in byday field
                    if (value.length && !isInvitedEvent) {
                      onChangeOwnEventLocally({
                        ...eventData,
                        repeatByDay: value.join(','),
                      });
                    }
                  }}
                >
                  {EnglishDays.map((day, index) => (
                    <TooltipToggleButton
                      key={day}
                      TooltipProps={{ title: language === LANGUAGE.EN ? day : UkrainianDays[index] }}
                      value={day.slice(0, 2).toUpperCase()}
                    >
                      {(language === LANGUAGE.EN ? day : UkrainianDays[index])[0]}
                    </TooltipToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
              {eventData.repeatFreq === REPEAT_FREQ.MONTHLY && (
                <Select
                  disabled={!eventData.repeatEnabled}
                  value={isMonthlyByDayValue(eventData.repeatByDay) ? eventData.repeatByDay : 'onDay'}
                  onBlur={() => handleBlur('repeatByDay')}
                  onChange={(event) => {
                    if (!isInvitedEvent) {
                      onChangeOwnEventLocally({
                        ...eventData,
                        repeatByDay: event.target.value,
                      });
                    }
                  }}
                >
                  <MenuItem value="onDay">
                    {__('Monthly on day')} {new Date(eventData.startTime).getDate()}{language === LANGUAGE.UK && '-го числа'}
                  </MenuItem>
                  {daysCountFromMonthStart !== 5 && (
                    <MenuItem value={`${daysCountFromMonthStart}${EnglishDays[indexOfDay].slice(0, 2).toUpperCase()}`}>
                      {__(`Monthly on the`)} {__(ORDINAL_NUMBERS[daysCountFromMonthStart] + ' ')}{daysCountFromMonthStart === 3 ? __(EnglishDays[indexOfDay] + '') : __(EnglishDays[indexOfDay])}
                    </MenuItem>
                  )}
                  {daysCountToMonthEnd === 0 && (
                    <MenuItem value={`-1${EnglishDays[indexOfDay].slice(0, 2).toUpperCase()}`}>
                      {__('Monthly on the')} {__('last ')}{__(EnglishDays[indexOfDay] + ' ')}
                    </MenuItem>
                  )}
                </Select>
              )}
              <p style={{ color: eventData.repeatEnabled ? 'black' : 'rgba(0,0,0,0.38)' }}>{__('Ends')}</p>
              <FormControlLabel
                control={
                  <Radio
                    color="primary"
                    disabled={!eventData.repeatEnabled}
                    checked={!eventData.repeatUntil && !eventData.repeatCount}
                    onBlur={() => {
                      handleBlur('repeatUntil')
                      handleBlur('repeatCount')
                    }}
                    onChange={() => {
                      if (!isInvitedEvent) {
                        onChangeOwnEventLocally({
                          ...eventData,
                          repeatUntil: null,
                          repeatCount: null,
                        });
                      }
                    }}
                  />
                }
                label={__('Never')}
              />
              <Grid container alignItems="center">
                <FormControlLabel
                  control={
                    <Radio
                      color="primary"
                      disabled={!eventData.repeatEnabled}
                      checked={!!eventData.repeatUntil && !eventData.repeatCount}
                      onBlur={() => {
                        handleBlur('repeatUntil')
                        handleBlur('repeatCount')
                      }}
                      onChange={() => {
                        if (!isInvitedEvent) {
                          const startDate = new Date(eventData.startTime);
                          switch (eventData.repeatFreq) {
                            case REPEAT_FREQ.DAILY:
                              startDate.setDate(startDate.getDate() + (eventData.repeatInterval || 1));
                              break;
                            case REPEAT_FREQ.WEEKLY:
                              startDate.setDate(startDate.getDate() + (eventData.repeatInterval || 1) * 7);
                              break;
                            case REPEAT_FREQ.MONTHLY:
                              startDate.setMonth(startDate.getMonth() + (eventData.repeatInterval || 1));
                              break;
                            case REPEAT_FREQ.YEARLY:
                              startDate.setFullYear(startDate.getFullYear() + (eventData.repeatInterval || 1));
                              break;
                            default:
                              break;
                          }
                          const { dayEnd } = getDayBounds(startDate);

                          onChangeOwnEventLocally({
                            ...eventData,
                            repeatUntil: dayEnd,
                            repeatCount: null,
                          });
                        }
                      }}
                    />
                  }
                  label={__('On')}
                />
                <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
                  <DatePicker
                    $width="145px"
                    disabled={!eventData.repeatEnabled || !eventData.repeatUntil}
                    variant="inline"
                    format="yyyy/MM/dd"
                    value={eventData.repeatUntil ? new Date(eventData.repeatUntil) : defaultUntilDate}
                    onBlur={() => handleBlur('repeatUntil')}
                    onClose={() => handleBlur('repeatUntil')}
                    onChange={(newDate) => {
                      if (!isInvitedEvent) {
                        const { dayEnd } = getDayBounds(newDate);

                        console.log(dayEnd);
                        onChangeOwnEventLocally({
                          ...eventData,
                          repeatUntil: dayEnd,
                          repeatCount: null,
                        });
                      }
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid container alignItems="center">
                <FormControlLabel
                  control={
                    <Radio
                      color="primary"
                      disabled={!eventData.repeatEnabled}
                      checked={!eventData.repeatUntil && !!eventData.repeatCount}
                      onBlur={() => {
                        handleBlur('repeatUntil')
                        handleBlur('repeatCount')
                      }}
                      onChange={() => {
                        onChangeOwnEventLocally({
                          ...eventData,
                          repeatUntil: null,
                          repeatCount: 1,
                        });
                      }}
                    />
                  }
                  label={__('After')}
                />
                <Input
                  type="number"
                  disabled={!eventData.repeatEnabled || !eventData.repeatCount}
                  style={{ width: 60, marginRight: 5 }}
                  inputProps={{ style: { textAlign: 'center' } }}
                  value={eventData.repeatCount || 1}
                  onBlur={() => handleBlur('repeatCount')}
                  onChange={(event) => {
                    onChangeOwnEventLocally({
                      ...eventData,
                      repeatCount: Math.max(Math.min(parseInt(event.target.value, 10), 1000), 1),
                    });
                  }}
                />
                <p style={{ color: (eventData.repeatEnabled && eventData.repeatCount) ? 'black' : 'rgba(0,0,0,0.38)' }}>
                  {__('occurrence' + getPluralizePeriodsSuffix(eventData.repeatCount || 1)).trim()}
                </p>
              </Grid>
            {(!isInvitedEvent || (eventData.latitude && eventData.longitude)) && (
              <SettingsBlockTitle>{__('Venue')}</SettingsBlockTitle>
            )}
            {(!isInvitedEvent || (eventData.latitude && eventData.longitude)) && (
              <Grid container direction="row" justifyContent="space-between">
                <HalfWidthInput
                  {...readOnly}
                  label={__('Latitude')}
                  type="number"
                  value={eventData.latitude || ''}
                  onBlur={() => handleBlur('latitude')}
                  onChange={(event) => {
                    onChangeOwnEventLocally({
                      ...eventData, latitude: event.target.value || null,
                    });
                  }}
                />
                <HalfWidthInput
                  {...readOnly}
                  label={__('Longitude')}
                  type="number"
                  value={eventData.longitude || ''}
                  onBlur={() => handleBlur('longitude')}
                  onChange={(event) => {
                    onChangeOwnEventLocally({
                      ...eventData, longitude: event.target.value || null,
                    });
                  }}
                />
              </Grid>
            )}
            {(!isInvitedEvent || eventData.placeName) && (
              <Input
                {...readOnly}
                label={__('Place name')}
                value={eventData.placeName || ''}
                onBlur={() => handleBlur('placeName')}
                onChange={(event) => {
                  onChangeOwnEventLocally({
                    ...eventData, placeName: event.target.value,
                  });
                }}
              />
            )}
            {(!isInvitedEvent || eventData.address) && (
              <Input
                {...readOnly}
                label={__('Address')}
                value={eventData.address || ''}
                onBlur={() => handleBlur('address')}
                onChange={(event) => {
                  onChangeOwnEventLocally({
                    ...eventData, address: event.target.value,
                  });
                }}
              />
            )}
            {(!isInvitedEvent || (eventData.latitude && eventData.longitude)) && googleMapsApiKey && showMap
              && (
                <MapWrapper readOnly={isInvitedEvent}>
                  <MapPicker
                    defaultLocation={location}
                    zoom={zoom}
                    style={{
                      height: '350px',
                    }}
                    onChangeLocation={isInvitedEvent ? () => {} : handleChangeLocation}
                    onChangeZoom={handleChangeZoom}
                    apiKey={googleMapsApiKey}
                  />
                </MapWrapper>
              )}
            <ChooseLocationDialog
              placesToChoose={placesToChoose}
              onClose={() => { setPlacesToChoose([]); }}
              onSubmit={handleChooseLocation}
            />
          </ScrollContentWrapper>
        ) : (
          <EventNotChosen
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <h2>{__('Choose any event to continue')}</h2>
            <br/><br/>
          </EventNotChosen>
        )}
      </ScrollArea>
    </Container>
  );
};

export default withSettings(Settings);