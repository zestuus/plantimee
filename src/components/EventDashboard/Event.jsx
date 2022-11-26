import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { Grid } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import CheckIcon from '@material-ui/icons/Check';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { EventAvailable, Replay } from "@material-ui/icons";
import Tooltip from '@material-ui/core/Tooltip';

import {
  formatEventTime,
  getDayOfMonth,
  getEventRecurrenceEndDate,
  getPluralizePeriodsSuffix
} from '../../utils/helpers';
import withSettings from '../HOCs/withSettings';
import {
  AVAILABILITY_COLOR,
  AVAILABILITY_LABEL,
  LANGUAGE, ORDINAL_NUMBERS,
  REPEAT_FREQ,
  REPEAT_FREQ_LABEL
} from "../../constants/enums";
import { EnglishDays, UkrainianDays } from "../../constants/config";
import { TooltipText } from './Events';

export const EventCard = styled(Grid)`
  border-radius: 10px;
  background-color: #2751a5;
  margin: 5px 0;
  padding: 10px;
  color: white;
  opacity: 1;
  transition: opacity 0.2s ease-out;
  ${props => props.updating ? 'opacity: 0' : ''};
  ${props => props.$isChosen ? 'background-color: #2c4b87' : ''};
`;

const EventInfo = styled(Grid)`
  width: calc(100% - 46px);
  ${props => props.completed && 'text-decoration: line-through'};
`;

const EventTitle = styled.h4`
  margin: 5px;
  max-height: 38px;
  overflow: hidden;
`;

const EventDescription = styled.p`
  margin: 5px;
  font-size: 13px;
  max-height: 45px;
  overflow: hidden;
  ${props => props.color ? `
    color: ${props.color};
    font-weight: bold;
  ` : ''}
`;

export const BubbleWrapper = styled.p`
  margin: 5px 0;
`;

const BubbleStyles = css`
  margin: 5px;
  padding: 5px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  vertical-align: middle;
  background-color: #ffffff22;
  ${props => props.small ? 'font-size: 10px;' : ''}
`;

export const BubbleInline = styled.span`
  ${BubbleStyles}
`;

export const BubbleBlock = styled.p`
  ${BubbleStyles}
`;

const ReplayIcon = styled(Replay)`
  font-size: 12px;
`

const Event = ({
 invited, eventData, isChosen, setChosenEvent, openColumn, onChangeOwnEvent, militaryTime, language, translate: __
}) => {
  const {
    id,
    name,
    description,
    completed,
    startTime,
    endTime,
    latitude,
    longitude,
    placeName,
    address,
    isFullDay,
    availability,
    repeatEnabled,
    repeatInterval,
    repeatFreq,
    repeatByDay,
    organizer: eventOrganizer,
  } = eventData;
  const { username: organizer } = eventOrganizer || {};
  const [completedLocal, setCompletedLocal] = useState(!!completed);

  const dateString = formatEventTime(startTime, endTime, isFullDay, language, militaryTime);
  let timePassed = new Date(endTime) < new Date();
  if (repeatEnabled) {
    const eventRecurrenceEndDate = getEventRecurrenceEndDate(eventData);

    timePassed = eventRecurrenceEndDate && eventRecurrenceEndDate < new Date();
  }

  return (
    <EventCard
      container
      direction="row"
      alignItems="center"
      $isChosen={isChosen}
      updating={
        (completedLocal && !completed) || (!completedLocal && completed)
          ? 'true'
          : undefined
      }
      onClick={() => {
        setChosenEvent(id);
        openColumn('settings');
      }}
    >
      {!invited && <Checkbox
        checked={completedLocal}
        icon={<CircleUnchecked htmlColor="white" />}
        checkedIcon={<CheckIcon htmlColor="white" />}
        onChange={() => {
          setCompletedLocal(!completedLocal);
          setTimeout(() => {
            onChangeOwnEvent({ ...eventData, completed: !completedLocal });
          }, 200);
        }}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
      />}
      <EventInfo
        container
        direction="column"
        completed={completed ? 'true' : undefined}
      >
        <Grid container direction="row" alignItems="center">
          <EventTitle>
            {name}
          </EventTitle>
          {timePassed && (
            <Tooltip
              title={(
                <TooltipText>
                  {__('Event time passed, move it to done or reschedule it')}
                </TooltipText>
              )}
            >
              <EventAvailable fontSize="inherit"/>
            </Tooltip>
          )}
        </Grid>
        {!!description && <EventDescription>{description}</EventDescription>}
        {!!availability && !timePassed && <EventDescription color={AVAILABILITY_COLOR[availability]}>{__(AVAILABILITY_LABEL[availability])}</EventDescription>}
        {!!dateString && (
          <BubbleWrapper>
            <BubbleInline>
              <ScheduleIcon fontSize="inherit" /> {dateString}
            </BubbleInline>
          </BubbleWrapper>
        )}
        {!!repeatEnabled && (
          <BubbleBlock>
            <ReplayIcon />
            {([1, null].includes(repeatInterval) ? __('Repeat every') : __('Repeat every ')).trim()} {repeatInterval || 1} {__(REPEAT_FREQ_LABEL[repeatFreq] + getPluralizePeriodsSuffix(repeatInterval)).trim()}
          </BubbleBlock>
        )}
        {!!repeatEnabled && repeatByDay && repeatFreq === REPEAT_FREQ.WEEKLY && (
          <BubbleBlock>
            {repeatByDay.split(',').filter(Boolean).map(day => {
              const index = EnglishDays.findIndex(d => day === d.slice(0,2).toUpperCase());

              return language === LANGUAGE.EN ? EnglishDays[index] : UkrainianDays[index];
            }).join(', ')}
          </BubbleBlock>
        )}
        {!!repeatEnabled && repeatFreq === REPEAT_FREQ.MONTHLY && (
          <BubbleBlock>
            {!repeatByDay ? (
              `${__('On day')} ${new Date(startTime).getDate()}${language === LANGUAGE.UK && '-го числа'}`
            ) : ((getDayOfMonth(repeatByDay)[0] === -1) ? (
              `${__('On the')} ${__('last ')}${__(EnglishDays[getDayOfMonth(repeatByDay)[1]] + ' ')}`
            ) : (
              `${__('On the')} ${__(ORDINAL_NUMBERS[getDayOfMonth(repeatByDay)[0]] + ' ')}${getDayOfMonth(repeatByDay)[0] === 3 ? __(EnglishDays[getDayOfMonth(repeatByDay)[1]] + '') : __(EnglishDays[getDayOfMonth(repeatByDay)[1]])}`
            ))}
          </BubbleBlock>
        )}
        {!!(latitude && longitude) && (
          <BubbleBlock>
            <LocationOnIcon fontSize="inherit" /> {latitude}, {longitude} <br/> {placeName} <br/> {address}
          </BubbleBlock>
        )}
        {!!(invited && organizer) && (
          <BubbleWrapper>
            <BubbleInline>
              <AccountCircleIcon fontSize="inherit" /> {__('organizer')}: {organizer}
            </BubbleInline>
          </BubbleWrapper>
        )}
      </EventInfo>
    </EventCard>
  );
};

export default withSettings(Event);