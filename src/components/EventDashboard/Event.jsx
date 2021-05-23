import React, {useState} from 'react';
import styled from "styled-components";

import { Grid } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import CheckIcon from '@material-ui/icons/Check';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import {formatEventTime} from "../../utils/helpers";

export const EventCard = styled(Grid)`
    border-radius: 10px;
    background-color: #2751a5;
    margin: 5px 0;
    padding: 10px;
    color: white;
    opacity: 1;
    transition: opacity 0.2s ease-out;
    ${props => props.updating ? 'opacity: 0' : ''};
    ${props => props.$isChosen ? 'background-color: #2c4b87': ''};
`;

const EventInfo = styled(Grid)`
width: calc(100% - 46px);
    ${props => props.completed && 'text-decoration: line-through'};
`

const EventTitle = styled.h4`
    margin: 5px;
    max-height: 38px;
    overflow: hidden;
`

const EventDescription = styled.p`
    margin: 5px;
    font-size: 13px;
    max-height: 45px;
    overflow: hidden;
`;

const BubbleWrapper = styled.p`
    margin: 5px 0;
`;

const Bubble = styled.span`
    margin: 5px;
    padding: 5px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    vertical-align: middle;
    background-color: #ffffff22;
`

const Event = ({ invited, eventData, isChosen, setChosenEvent, openColumn, onChangeOwnEvent }) => {
    const { id, name, description, completed, start_time, end_time, latitude, longitude, is_full_day } = eventData;
    const { username: organizer } = eventData.organizer || {};
    const [completedLocal, setCompletedLocal] = useState(!!completed);

    const dateString = formatEventTime(start_time, end_time, is_full_day);

    return (
        <EventCard
            container
            direction="row"
            alignItems="center"
            $isChosen={isChosen}
            updating={(completedLocal && !completed) || (!completedLocal && completed) ? 'true' : undefined}
            onClick={()=> { setChosenEvent(id); openColumn('settings'); }}
            >
            {!invited && <Checkbox
                checked={completedLocal}
                icon={<CircleUnchecked htmlColor="white" />}
                checkedIcon={<CheckIcon htmlColor="white" />}
                onChange={() => {
                    setCompletedLocal(!completedLocal);
                    setTimeout(() => {
                        onChangeOwnEvent({...eventData, completed: !completedLocal});
                    }, 200);
                }}
                onClick={event => {event.preventDefault(); event.stopPropagation();}}
            />}
            <EventInfo completed={completed ? 'true' : undefined} container direction="column">
                <EventTitle>{name}</EventTitle>
                {description && <EventDescription>{description}</EventDescription>}
                {dateString && (
                    <BubbleWrapper>
                        <Bubble><ScheduleIcon fontSize="inherit" /> {dateString}</Bubble>
                    </BubbleWrapper>
                )}
                {latitude && longitude && (
                    <BubbleWrapper>
                        <Bubble><LocationOnIcon fontSize="inherit" /> {latitude}, {longitude}</Bubble>
                    </BubbleWrapper>
                )}
                {invited && organizer && (
                    <BubbleWrapper>
                        <Bubble><AccountCircleIcon fontSize="inherit" /> organizer: {organizer}</Bubble>
                    </BubbleWrapper>
                )}
            </EventInfo>
        </EventCard>
    );
};

export default Event;