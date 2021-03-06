import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import MapPicker from "react-google-map-picker";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import Alert from '@material-ui/lab/Alert';

import {ColumnTitle} from "./Timeline";
import {ColumnHeader, Container, ScrollArea, ScrollContentWrapper} from "./Events";
import {formatDateString} from "../../utils/helpers";
import {GOOGLE_MAPS_API_KEY, OneDay, OneHour, OneMinute} from "../../utils/constants";
import Participant from "./Participant";
import {getAllUsers} from "../../api/user";
import AutoFindModal from "./AutoFindModal";

const Input = styled(TextField)`
    margin: 10px 0;
`;

const ParticipantsBlock = styled(Grid)`
    margin: 10px 0;
`;

const ParticipantSelect = styled(Select)`
    margin: 10px 0;
`;

const ParticipantsTitle = styled.p`
    margin: 10px 0 5px 0;
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
`

const DefaultLocation = { lat: 49.843625, lng: 24.026442};
const DefaultZoom = 10;

const Setting = ({
    eventData,
    onChangeOwnEventLocally,
    onSaveChangesOwnEvent,
    onDeleteOwnEvent,
    onRejectInvitation,
    onInviteAttendee,
    onDeleteInvitation,
    onFindAutomatically
}) => {
    const [zoom, setZoom] = useState(DefaultZoom);
    const [open, setOpen] = useState(false);
    const [autoFindProps, setAutoFindProps] = useState({});
    const [autoFindError, setAutoFindError] = useState('');
    const [users, setUsers] = useState([]);
    const [chosenUser, setChosenUser] = useState(null);

    const isInvitedEvent = !!(eventData && eventData.organizer);
    const readOnly = isInvitedEvent ? { InputProps: { readOnly: true }} : {};

    const now = new Date();

    now.setMinutes(now.getMinutes() + 1);

    const startDateString = eventData && formatDateString(eventData.start_time);
    const endDateString = eventData && formatDateString(eventData.end_time);

    const startTime = eventData && new Date(eventData.start_time);
    const endTime = eventData && new Date(eventData.end_time);

    const datesAreValid = eventData && startTime <= endTime;

    const location = (eventData && eventData.latitude && eventData.longitude
        && { lat: parseFloat(eventData.latitude), lng: parseFloat(eventData.longitude)}) || DefaultLocation;

    const timedelta = endTime - startTime;

    let daysLong = Math.trunc( timedelta/ OneDay);
    let hoursLong = Math.trunc( (timedelta - daysLong*OneDay)/ OneHour);
    let minutesLong = Math.trunc( (timedelta - daysLong*OneDay - hoursLong*OneHour)/ OneMinute);

    if (hoursLong === 23 && minutesLong === 59) {
        daysLong += 1;
        hoursLong = 0;
        minutesLong = 0;
    }

    const startDateStringFinal = eventData && eventData.is_full_day ?
        startDateString.split('T')[0] : startDateString;
    const endDateStringFinal = eventData && eventData.is_full_day ?
        endDateString.split('T')[0] : endDateString;

    const handleChangeLocation = (lat, lng) => {
        onChangeOwnEventLocally({...eventData, latitude: lat, longitude: lng });
    }

    const handleChangeZoom = (newZoom) => {
        setZoom(newZoom);
    }

    useEffect(() => {
        (async () => {
            try {
                const users = await getAllUsers();
                setUsers(users);
            } catch (err) {
                setUsers([]);
            }
        })();
    }, [])

    const notInvited = eventData && eventData.attendees ? users
        .filter(user => !eventData.attendees.find(attendee => attendee.id === user.id)) : [];

    return (
        <Container container direction="column" justify="flex-start">
            <ColumnHeader container direction="row" justify="space-between" alignItems="center">
                <ColumnTitle>Settings</ColumnTitle>
                {isInvitedEvent ? (
                    <Button
                        style={{ fontSize: 13 }}
                        onClick={() => {
                            onRejectInvitation(eventData.id);
                        }}
                    >
                        <CloseIcon /> Reject invite
                    </Button>
                ) : (
                    <Button disabled={!eventData} onClick={() => {
                        onDeleteOwnEvent(eventData.id);
                    }}>
                        <DeleteIcon /> Remove
                    </Button>
                )}
            </ColumnHeader>
            <ScrollArea>
                {eventData ? (
                    <ScrollContentWrapper container direction="column" alignItems="stretch">
                        <Input
                            {...readOnly}
                            label="Title"
                            value={eventData.name || ''}
                            onChange={(event) => {
                                onChangeOwnEventLocally({...eventData, name: event.target.value });
                            }} />
                        <Input
                            {...readOnly}
                            label="Description"
                            value={eventData.description || ''}
                            onChange={(event) => {
                                onChangeOwnEventLocally({...eventData, description: event.target.value });
                            }}
                        />
                        {(!isInvitedEvent || (isInvitedEvent && eventData.url)) && (
                            <React.Fragment>
                                <Input
                                    {...readOnly}
                                    label="Online meet url"
                                    value={eventData.url || ''}
                                    onChange={(event) => {
                                        onChangeOwnEventLocally({...eventData, url: event.target.value });
                                    }}
                                />
                            </React.Fragment>
                        )}
                        {!isInvitedEvent && (
                            <ParticipantsBlock container direction="column" alignItems="stretch">
                                <ParticipantsTitle>Participants</ParticipantsTitle>
                                {eventData && eventData.attendees && eventData.attendees.length ?
                                    eventData.attendees.map(attendee => (
                                        <Participant
                                            key={attendee.id}
                                            userInfo={attendee}
                                            eventId={eventData.id}
                                            onDeleteInvitation={onDeleteInvitation}/>
                                    )) :
                                    <Participant noAttendees />
                                }
                                {notInvited.length ? (
                                    <React.Fragment>
                                        <ParticipantSelect
                                            label="Users"
                                            id="demo-simple-select"
                                            value={chosenUser || ''}
                                            onChange={event => {
                                                setChosenUser(event.target.value);
                                            }}
                                        >
                                            {notInvited.map(user => (
                                                <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                                            ))}
                                        </ParticipantSelect>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={() => {
                                                if (chosenUser){
                                                    const userData = users.find(user => user.id = chosenUser);
                                                    onInviteAttendee({...userData, eventId: eventData.id});
                                                }
                                            }}
                                        >
                                            <AddIcon /> Add participant
                                        </Button>
                                    </React.Fragment>
                                ): null}
                            </ParticipantsBlock>
                        )}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={!!eventData.is_full_day}
                                    onChange={(event) => {
                                        const date = new Date();
                                        const dateString = `${date.getFullYear()}-` +
                                            `${(date.getMonth()+1).toString().padStart(2,'0')}-` +
                                            `${date.getDate().toString().padStart(2,'0')}`;

                                        const start_time =
                                            (eventData.start_time || dateString).split('T')[0] + 'T00:00';
                                        const end_time =
                                            (eventData.end_time || dateString).split('T')[0] + 'T23:59';
                                        onChangeOwnEventLocally({
                                            ...eventData,
                                            is_full_day: event.target.checked,
                                            start_time,
                                            end_time,
                                        });
                                    }}
                                />
                            }
                            label="Full day event"
                        />
                        {(!isInvitedEvent || (isInvitedEvent && eventData.start_time)) && (
                            <Input
                                {...readOnly}
                                label="Start date&time"
                                type={eventData.is_full_day ? "date" : "datetime-local"}
                                value={eventData.start_time ? startDateStringFinal: ''}
                                error={!datesAreValid}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({
                                        ...eventData,
                                        start_time: event.target.value,
                                        end_time: eventData.end_time ? eventData.end_time : event.target.value,
                                    });
                                }}
                            />
                        )}
                        {(!isInvitedEvent || (isInvitedEvent && eventData.end_time)) && (
                            <Input
                                {...readOnly}
                                label="End date&time"
                                type={eventData.is_full_day ? "date" : "datetime-local"}
                                value={eventData.end_time ? endDateStringFinal : ''}
                                error={!datesAreValid}
                                helperText={!datesAreValid && "End time should be after start time"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({
                                        ...eventData,
                                        end_time: event.target.value,
                                        start_time: eventData.start_time ? eventData.start_time : event.target.value,
                                    });
                                }}
                            />
                        )}
                        {!isInvitedEvent && (
                            <Row container direction="row" justify="flex-start" alignItems="center">
                                Duration:
                                <DurationPicker
                                    type="number"
                                    label="Days"
                                    value={daysLong}
                                    InputProps={{ inputProps: { min: 0, max: 9999 } }}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            const startDate = new Date(eventData.start_time)
                                            startDate.setDate(startDate.getDate() + parseInt(event.target.value))
                                            startDate.setHours(startDate.getHours() + hoursLong)
                                            startDate.setMinutes(startDate.getMinutes() + minutesLong)
                                            onChangeOwnEventLocally({
                                                ...eventData,
                                                end_time: formatDateString(startDate)
                                            });
                                        }
                                    }} />
                                <DurationPicker
                                    type="number"
                                    label="Hours"
                                    value={hoursLong}
                                    InputProps={{ inputProps: { min: 0, max: 9999 } }}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            const startDate = new Date(eventData.start_time);
                                            startDate.setDate(startDate.getDate() + daysLong)
                                            startDate.setHours(startDate.getHours() + parseInt(event.target.value))
                                            startDate.setMinutes(startDate.getMinutes() + minutesLong)
                                            onChangeOwnEventLocally({
                                                ...eventData,
                                                end_time: formatDateString(startDate)
                                            });
                                        }

                                    }} />
                                <DurationPicker
                                    type="number"
                                    label="Minutes"
                                    value={minutesLong}
                                    InputProps={{ inputProps: { min: 0, max: 9999 } }}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            const startDate = new Date(eventData.start_time)
                                            startDate.setDate(startDate.getDate() + daysLong)
                                            startDate.setHours(startDate.getHours() + hoursLong)
                                            startDate.setMinutes(startDate.getMinutes() + parseInt(event.target.value))
                                            onChangeOwnEventLocally({
                                                ...eventData,
                                                end_time: formatDateString(startDate)
                                            });
                                        }
                                    }} />
                            </Row>
                        )}
                        {!isInvitedEvent && (
                            <Grid container direction="row">
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
                                            setAutoFindError("Cannot find free time in chosen range. Please update conditions")
                                        } else {
                                            setAutoFindError('')
                                        }
                                    }}
                                >
                                    <SearchIcon /> Auto find free time
                                </Button>
                                <IconButton
                                    style={{ padding: 0, marginLeft: 10 }}
                                    onClick={() => {
                                        setOpen(true);
                                    }}>
                                    <SettingsIcon />
                                </IconButton>
                                {autoFindError && (
                                    <Alert severity="error" style={{ margin: '10px 0'}}>
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
                        <Row container direction="row" justify="space-between">
                            <HalfWidthInput
                                {...readOnly}
                                label="Latitude"
                                type="number"
                                value={eventData.latitude || ''}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, latitude: event.target.value });
                                }}
                            />
                            <HalfWidthInput
                                {...readOnly}
                                label="Longitude"
                                type="number"
                                value={eventData.longitude || ''}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, longitude: event.target.value });
                                }}
                            />
                        </Row>
                        {(!isInvitedEvent || (eventData.latitude && eventData.longitude) ) && (
                            <MapPicker
                                disabled={isInvitedEvent}
                                defaultLocation={location}
                                zoom={zoom}
                                style={{height: '350px'}}
                                onChangeLocation={handleChangeLocation}
                                onChangeZoom={handleChangeZoom}
                                apiKey={GOOGLE_MAPS_API_KEY}/>
                        )}
                        {!isInvitedEvent && (
                            <Row container direction="row" justify="flex-end">
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        onSaveChangesOwnEvent(eventData);
                                    }}
                                >
                                    <SaveIcon/> Save
                                </Button>
                            </Row>
                        )}
                    </ScrollContentWrapper>
                ) : (
                    <EventNotChosen container direction="column" justify="center" alignItems="center">
                        <h2>Choose any event to continue</h2>
                        <br/><br/>
                    </EventNotChosen>
                )}
            </ScrollArea>
        </Container>
    );
};

export default Setting;