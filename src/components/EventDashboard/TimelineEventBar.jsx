import React from 'react';
import styled from "styled-components";
import {HourHeight, OneHour} from "../../utils/constants";
import {formatEventTime} from "../../utils/helpers";
import ScheduleIcon from "@material-ui/icons/Schedule";
import {Bubble} from "./Event";
import Tooltip from "@material-ui/core/Tooltip";

const EventBar = styled.div`
    position: absolute;
    border-radius: 5px;
    width: calc(100% - 57px);
    margin: 0 26px;
    padding: 10px;
    box-sizing: border-box;
    box-shadow: white 1px 1px;
    background-color: #ffa500;
    font-weight: bold;
    font-size: 10px;
    color: white;
    overflow: hidden;
    ${props => `
        top: ${props.$top + 21}px;
        height: ${props.$height}px;
        ${props.$completed ? 'text-decoration: line-through;' : '' };
    `};
`;

const TimelineEventBar = ({ eventData, chosenDate, setChosenEvent, setColumnShown}) => {
    const { start_time, end_time, is_full_day, completed } = eventData || {};

    const dayStart = new Date(chosenDate);
    dayStart.setHours(0)
    dayStart.setMinutes(0)
    dayStart.setSeconds(0)
    dayStart.setMilliseconds(0)
    const dayEnd = new Date(chosenDate);
    dayEnd.setHours(23)
    dayEnd.setMinutes(59)
    dayEnd.setSeconds(0)
    dayEnd.setMilliseconds(0)

    const startTime = eventData && new Date(eventData.start_time);
    startTime.setSeconds(0)
    startTime.setMilliseconds(0)
    const endTime = eventData && new Date(eventData.end_time);
    endTime.setSeconds(0)
    endTime.setMilliseconds(0)

    let height = 0;
    let top = 0;

    if (!eventData || !eventData.start_time || !eventData.end_time || startTime > dayEnd || endTime < dayStart) {
        return null;
    } else if(startTime <= dayStart && dayEnd <= endTime ) {
        height = HourHeight*24;
    } else if(startTime < dayStart) {
        height = (endTime - dayStart) / OneHour * HourHeight;
    } else if(dayEnd < endTime ) {
        top = (startTime - dayStart) / OneHour * HourHeight;
        height = (dayEnd - startTime) / OneHour * HourHeight;
    } else {
        top = (startTime - dayStart) / OneHour * HourHeight;
        height = (endTime - startTime) / OneHour * HourHeight;
    }

    const dateString = formatEventTime(start_time, end_time, is_full_day);

    return (
        <Tooltip
            title={
                <React.Fragment>
                    {eventData.name}
                    <Bubble small><ScheduleIcon fontSize="inherit" /> {dateString}</Bubble>
                </React.Fragment>
            }
        >

                <EventBar
                    $height={height}
                    $top={top}
                    $completed={completed}
                    onClick={() => {
                        setChosenEvent(eventData.id);
                        setColumnShown('settings')
                    }}
                >
                    {height>=35 ? (<React.Fragment>
                        {eventData.name}
                        <Bubble small><ScheduleIcon fontSize="inherit" /> {dateString}</Bubble>
                    </React.Fragment>): (<div />)}
                </EventBar>
        </Tooltip>
    );
};

export default TimelineEventBar;