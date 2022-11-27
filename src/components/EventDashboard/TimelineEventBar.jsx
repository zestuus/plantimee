import React from 'react';
import styled from "styled-components";
import {HourHeight, OneHour, OneMinute} from "../../constants/config";
import {formatEventTime, getDayBounds, getOtherEventHasSeparateCollisionsBefore} from "../../utils/helpers";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { BubbleInline } from "./Event";
import Tooltip from "@material-ui/core/Tooltip";
import {AVAILABILITY_STATUS} from "../../constants/enums";

const EventBar = styled.div`
  position: ${props => props.$fullDay ? 'inherit' : 'absolute'};
  ${props => props.$fullDay === 'yes' ? 'flex: 1;' : ''}
  border: 2px solid rgba(255, 255, 255, 0.76);
  border-radius: 5px;
  width: calc(${props => props.$width ? props.$width : '100%'} - 55px);
  left: calc(${props => props.$left ? props.$left : 0} - 15px);
  z-index: ${props => props.$zIndex ? props.$zIndex : 0};
  margin: 0 ${props => props.$fullDay ? '' : ' 26px'};
  box-sizing: border-box;
  box-shadow: ${props => props.$fullDayEventsTodayCount > 1 ? '#ffa500 3px 3px' : 'white 1px 1px'};
  background-color: ${props => props.bgColor ? props.bgColor : '#ffa500'};
  font-weight: bold;
  font-size: 10px;
  color: ${props => props.bgColor && props.bgColor.length === 9 && props.bgColor.slice(-2) !== 'ff' ? '#484848' : 'white'};
  overflow: hidden;
  ${props => `
    top: ${props.$top + 21}px;
    height: ${props.$height < 5 ? 5 : props.$height}px;
    ${props.$completed ? 'text-decoration: line-through;' : ''};
    ${props.$height < 35 ? 'padding: 0;' : 'padding: 10px;'};
  `};
`;

const TimelineEventBar = ({
  eventData, collisionMap, chosenDate, setChosenEvent, militaryTime, fullDayEventsTodayCount
}) => {
  if (!eventData) return null;

  const { startTime, endTime, isFullDay, completed } = eventData;
  const { dayStart, dayEnd } = getDayBounds(chosenDate);

  const startDateTime = new Date(eventData.startTime);
  if (startDateTime) {
    startDateTime.setSeconds(0);
    startDateTime.setMilliseconds(0);
  }
  const endDateTime = new Date(eventData.endTime);
  if (endDateTime) {
    endDateTime.setSeconds(0);
    endDateTime.setMilliseconds(0);
  }

  let height;
  let top = 0;

  if (isFullDay) {
    height = 38;
  } else if (startDateTime <= dayStart && dayEnd <= endDateTime) {
    height = HourHeight*24;
  } else if (startDateTime < dayStart) {
    height = (endDateTime - dayStart) / OneHour * HourHeight;
  } else if (dayEnd < endDateTime ) {
    top = (startDateTime - dayStart) / OneHour * HourHeight - 1;
    height = (dayEnd - startDateTime) / OneHour * HourHeight;
  } else {
    top = (startDateTime - dayStart) / OneHour * HourHeight - 1;
    height = (endDateTime - startDateTime) / OneHour * HourHeight;
  }

  const zIndex = Math.round((startDateTime - dayStart) / OneMinute);

  const dateString = formatEventTime(startTime, endTime, isFullDay, militaryTime);

  let bgColor = '#ffa500';
  if (eventData.availability) {
    bgColor = '#0095ff'
  }
  if (completed || (eventData.availability === AVAILABILITY_STATUS.CANNOT_ATTEND)) {
    bgColor += 'aa';
  }

  const collisionList = (collisionMap[eventData.id]) || [];
  const rowLength = collisionList.length + 1;
  let trigger = false;
  const index = collisionList.length && collisionList.findIndex(otherEvent => {
    otherEvent.startDateTime.setSeconds(0)
    otherEvent.startDateTime.setMilliseconds(0)
    const otherEventHasSeparateCollisionBefore = getOtherEventHasSeparateCollisionsBefore(otherEvent, collisionList);
    if (otherEventHasSeparateCollisionBefore) trigger = true;
    return otherEventHasSeparateCollisionBefore || (startDateTime.getTime() === otherEvent.startDateTime.getTime() ? (
      eventData.id < otherEvent.id
    ) : (
      startDateTime < otherEvent.startDateTime
    ));
  });
  let secondIndex = -1;
  if (trigger && index !== -1) {
    const concurrentEvents = collisionList[index].collisions.filter(event => !!collisionList.find(e => e.id === event.id));

    concurrentEvents.sort((a,b) => a.startDateTime - b.startDateTime);
    secondIndex = concurrentEvents.findIndex(otherEvent => (
      startDateTime.getTime() === otherEvent.startDateTime.getTime() ? (
        eventData.id < otherEvent.id
      ) : (
        startDateTime < otherEvent.startDateTime
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
        $fullDay={isFullDay}
        $fullDayEventsTodayCount={isFullDay ? fullDayEventsTodayCount : 0}
        $height={height}
        $top={top}
        $completed={completed}
        $left={`${left}%${(rowLength !== 1 && indexInRow === collisionList.length) ? ' - 12px' : ''}`}
        $width={`${width}%${rowLength !== 1 ? ' + 55px' : ''}`}
        $zIndex={Math.max(zIndex, 0)}
        bgColor={bgColor}
        onClick={() => {
          setChosenEvent(eventData);
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