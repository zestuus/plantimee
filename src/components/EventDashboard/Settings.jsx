import React, {useState} from 'react';
import styled from "styled-components";
import MapPicker from "react-google-map-picker";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import Grid from "@material-ui/core/Grid";

import {ColumnTitle} from "./Timeline";
import {ColumnHeader, Container, ScrollArea, ScrollContentWrapper} from "./Events";
import {formatDateString} from "../../utils/helpers";
import {GOOGLE_MAPS_API_KEY} from "../../utils/constants";

const Input = styled(TextField)`
    margin: 10px 0;
`;

const HalfWidthInput = styled(Input)`
    width: 45%;
`

const Row = styled(Grid)`
    margin: 15px 0;
`;

const DefaultLocation = { lat: 49.843625, lng: 24.026442};
const DefaultZoom = 10;

const Setting = ({
    eventData, onChangeOwnEventLocally, onSaveChangesOwnEvent, onDeleteOwnEvent, onRejectInvitation
}) => {
    const [zoom, setZoom] = useState(DefaultZoom);

    const isInvitedEvent = !!(eventData && eventData.organizer);
    const readOnly = isInvitedEvent ? { InputProps: { readOnly: true }} : {};

    const startDateString = eventData && formatDateString(eventData.start_time);
    const endDateString = eventData && formatDateString(eventData.end_time);

    const startTime = eventData && new Date(eventData.start_time);
    const endTime = eventData && new Date(eventData.end_time);

    const datesAreValid = eventData && startTime <= endTime;

    const location = (eventData && eventData.latitude && eventData.longitude
        && { lat: parseFloat(eventData.latitude), lng: parseFloat(eventData.longitude)}) || DefaultLocation;

    const handleChangeLocation = (lat, lng) => {
        onChangeOwnEventLocally({...eventData, latitude: lat, longitude: lng });
    }

    const handleChangeZoom = (newZoom) => {
        setZoom(newZoom);
    }

    return (
        <Container container direction="column" justify="flex-start">
            <ColumnHeader container direction="row" justify="space-between" alignItems="center">
                <ColumnTitle>Settings</ColumnTitle>
                {isInvitedEvent ? (
                    <Button onClick={() => {
                        onRejectInvitation(eventData.id);
                    }}>
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
            {eventData && (
                <ScrollArea>
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
                                value={eventData.is_full_day ? startDateString.split('T')[0] : startDateString}
                                error={!datesAreValid}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, start_time: event.target.value });
                                }}
                            />
                        )}
                        {(!isInvitedEvent || (isInvitedEvent && eventData.end_time)) && (
                            <Input
                                {...readOnly}
                                label="End date&time"
                                type={eventData.is_full_day ? "date" : "datetime-local"}
                                value={eventData.is_full_day ? endDateString.split('T')[0] : endDateString}
                                error={!datesAreValid}
                                helperText={!datesAreValid && "End time should be after start time"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, end_time: event.target.value });
                                }}
                            />
                        )}
                        <Row container direction="row" justify="space-between">
                            <HalfWidthInput
                                label="Latitude"
                                value={eventData.latitude || ''}
                                InputProps={{
                                    readOnly: true
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, latitude: event.target.value });
                                }} />
                            <HalfWidthInput
                                label="Longitude"
                                value={eventData.longitude || ''}
                                InputProps={{
                                    readOnly: true
                                }}
                                onChange={(event) => {
                                    onChangeOwnEventLocally({...eventData, longitude: event.target.value });
                                }} />
                        </Row>
                        <MapPicker
                            defaultLocation={location}
                            zoom={zoom}
                            style={{height:'350px'}}
                            onChangeLocation={handleChangeLocation}
                            onChangeZoom={handleChangeZoom}
                            apiKey={GOOGLE_MAPS_API_KEY}/>
                        {!isInvitedEvent && (
                            <Row container direction="row" justify="flex-end">
                                <Button
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
                </ScrollArea>
            )}
        </Container>
    );
};

export default Setting;