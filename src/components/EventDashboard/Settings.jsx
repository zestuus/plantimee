import React, {useEffect, useState} from 'react';
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
import { formatDateString, getGoogleTokenExpired, roundFloat } from '../../utils/helpers';
import {
  OneDay, OneHour, OneMinute
} from '../../constants/config';
import Participant from './Participant';
import AutoFindModal from '../dialogs/AutoFindModal';
import withSettings from '../HOCs/withSettings';
import {findNearbyLocation} from "../../api/maps";
import ChooseLocationDialog from "../dialogs/ChooseLocationDialog";

import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {LANGUAGE, LOCALE} from "../../constants/enums";
import DateFnsUtils from "@date-io/date-fns";
import googleIcon from "../../images/google.svg";
import Tooltip from "@material-ui/core/Tooltip";
import { LinkOff } from "@material-ui/icons";

const Input = styled(TextField)`
    margin: 10px 0;
`;

const ParticipantsBlock = styled(Grid)`
  margin: 10px 0;
`;

const DateTimePicker = styled(KeyboardDateTimePicker)`
  margin: 10px 0;
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
  const [usernameToLookFor, setUsernameToLookFor] = useState('');
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
    if (!isInvitedEvent && (!eventDataBackup || (eventData && eventData[key] !== eventDataBackup[key]))) {
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
              <SettingsBlockTitle>{__('Participants')}</SettingsBlockTitle>
              {eventData && eventData.attendees
                && eventData.attendees.length ?
                  eventData.attendees.map(attendee => (
                    <Participant
                      key={attendee.id}
                      userInfo={attendee}
                      eventId={eventData.id}
                      onDeleteInvitation={!isInvitedEvent && onDeleteInvitation}/>
                  )) : <Participant noAttendees />
              }
              {!isInvitedEvent && (
                <React.Fragment>
                  <Input
                    label={__('Input username')}
                    value={usernameToLookFor || ''}
                    onChange={(event) => {
                      setUsernameToLookFor(event.target.value);
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      const result = await onInviteAttendee({
                        usernameToLookFor, eventId: eventData.id
                      });

                      if (!result) {
                        setAttendeeFindError(__("Cannot find user with given username or user is already invited"))
                      } else {
                        setAttendeeFindError('');
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
                  }}
                />
              }
              label={__('Full day event')}
            />
            <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
              {(!isInvitedEvent || (isInvitedEvent && eventData.startTime)) && (
                <DateTimePicker
                  variant="inline"
                  ampm={!militaryTime}
                  readOnly={isInvitedEvent}
                  value={eventData.startTime ? new Date(eventData.startTime) : new Date()}
                  format={`yyyy/MM/dd ${militaryTime ? 'HH:mm' : 'hh:mm a'}`}
                  onBlur={() => handleBlur('startTime')}
                  onClose={() => handleBlur('startTime')}
                  onClick={handleDateTimeClick}
                  onKeyDown={(event) => handleKeyDown(event, 'startTime', (isInvitedEvent || (!militaryTime && language !== LANGUAGE.EN)))}
                  onChange={(value) => {
                    if (eventData.endTime) {
                      let startDate = new Date(eventData.endTime);
                      if (value && !(value instanceof Date)) {
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
                <DateTimePicker
                  variant="inline"
                  readOnly={isInvitedEvent}
                  ampm={!militaryTime}
                  value={eventData.endTime ? new Date(eventData.endTime) : new Date()}
                  format={`yyyy/MM/dd ${militaryTime ? 'HH:mm' : 'hh:mm a'}`}
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
            {!isInvitedEvent && (
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
            <SettingsBlockTitle>{__('Venue')}</SettingsBlockTitle>
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