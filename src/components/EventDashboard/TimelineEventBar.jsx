import React from 'react';
import styled from "styled-components";
import {HourHeight, OneHour, OneMinute} from "../../constants/config";
import {formatEventTime, getDayBounds, getOtherEventHasSeparateCollisionsBefore} from "../../utils/helpers";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { BubbleInline } from "./Event";
import Tooltip from "@material-ui/core/Tooltip";
import {AVAILABILITY_STATUS} from "../../constants/enums";

const EventBar = styled.div`
  position: absolute;
  border: 2px solid white;
  border-radius: 5px;
  width: calc(${props => props.$width ? props.$width : '100%' } - 55px);
  left: calc(${props => props.$left ? props.$left : 0} - 15px);
  z-index: ${props => props.$zIndex ? props.$zIndex : 0};
  margin: 0 26px;
  box-sizing: border-box;
  box-shadow: white 1px 1px;
  background-color: ${props => props.bgColor ? props.bgColor : '#ffa500'};
  font-weight: bold;
  font-size: 10px;
  color: ${props => props.bgColor && props.bgColor.length === 9 && props.bgColor.slice(-2) !== 'ff' ? '#484848' : 'white'};
  overflow: hidden;
  ${props => `
    top: ${props.$top + 21}px;
    height: ${props.$height < 5 ? 5 : props.$height}px;
    ${props.$completed ? 'text-decoration: line-through;' : '' };
    ${props.$height < 35 ? 'padding: 0;' : 'padding: 10px;' };
  `};
`;

const TimelineEventBar = ({ eventData, collisionMap, chosenDate, setChosenEvent, setColumnShown, militaryTime}) => {
  const { start_time, end_time, is_full_day, completed } = eventData || {};

  const [dayStart, dayEnd] = getDayBounds(chosenDate);

  const startTime = eventData && new Date(eventData.start_time);
  startTime.setSeconds(0)
  startTime.setMilliseconds(0)
  const endTime = eventData && new Date(eventData.end_time);
  endTime.setSeconds(0)
  endTime.setMilliseconds(0)

  let height;
  let top = 0;

  if (startTime <= dayStart && dayEnd <= endTime) {
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

  const zIndex = Math.round((startTime - dayStart) / OneMinute);

  const dateString = formatEventTime(start_time, end_time, is_full_day, militaryTime);

  let bgColor = '#ffa500';
  if (eventData.availability) {
    bgColor = '#0095ff'
  }
  if (completed || eventData.availability === AVAILABILITY_STATUS.CANNOT_ATTEND) {
    bgColor += 'aa';
  }

  const collisionList = collisionMap[eventData.id] || [];
  const rowLength = collisionList.length + 1;
  let trigger = false;
  const index = collisionList.length && collisionList.findIndex(otherEvent => {
    otherEvent.startTime.setSeconds(0)
    otherEvent.startTime.setMilliseconds(0)
    const otherEventHasSeparateCollisionBefore = getOtherEventHasSeparateCollisionsBefore(otherEvent, collisionList);
    if (otherEventHasSeparateCollisionBefore) trigger = true;
    return otherEventHasSeparateCollisionBefore || (startTime.getTime() === otherEvent.startTime.getTime() ? (
      eventData.id < otherEvent.id
    ) : (
      startTime < otherEvent.startTime
    ));
  });
  let secondIndex = -1;
  if (trigger && index !== -1) {
    const concurrentEvents = collisionList[index].collisions.filter(event => !!collisionList.find(e => e.id === event.id));

    concurrentEvents.sort((a,b) => a.startTime - b.startTime);
    secondIndex = concurrentEvents.findIndex(otherEvent => (
      startTime.getTime() === otherEvent.startTime.getTime() ? (
        eventData.id < otherEvent.id
      ) : (
        startTime < otherEvent.startTime
      )
    ))
  }
  const indexInRow = index === -1 ? collisionList.length : (secondIndex !== -1 ? secondIndex + 1 : index);

  const left = indexInRow*((100-6) / rowLength) - ((indexInRow === 0) ? -6 : 6);
  const width = ((100-6) / rowLength) + 6;

  return (
    <Tooltip
      title={
        <React.Fragment>
          <div style={completed ? { textDecoration: 'line-through' } : {}}>
            {eventData.name}
            <BubbleInline small><ScheduleIcon fontSize="inherit" /> {dateString}</BubbleInline>
          </div>
        </React.Fragment>
      }
    >
      <EventBar
        $height={height}
        $top={top}
        $completed={completed}
        $left={`${left}%${(rowLength !== 1 && indexInRow === collisionList.length) ? ' - 12px' : ''}`}
        $width={`${width}%${rowLength !== 1 ? ' + 55px' : ''}`}
        $zIndex={Math.max(zIndex, 0)}
        bgColor={bgColor}
        onClick={() => {
          setChosenEvent(eventData.id);
          setColumnShown('settings')
        }}
      >
        {height>=35 ? (<React.Fragment>
          {eventData.name}
          <BubbleInline small><ScheduleIcon fontSize="inherit" /> {dateString}</BubbleInline>
        </React.Fragment>): (<div />)}
      </EventBar>
    </Tooltip>
  );
};

export default TimelineEventBar;