import React, {useEffect, useState} from 'react';
import styled from "styled-components";

import {Grid, Popover} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  ColumnHeader, Container, ScrollArea, ScrollContentWrapper,
} from "./Events";
import TimelineEventBar from "./TimelineEventBar";
import { HourHeight, UkrainianMonths } from '../../constants/config';
import withSettings from '../HOCs/withSettings';
import {LANGUAGE, LOCALE} from '../../constants/enums';
import Button from "@material-ui/core/Button";

import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {extendCollisionList} from "../../utils/helpers";

export const ColumnTitle = styled.h3`
  margin: 7.5px;
  text-align: center;
  font-size: 15px;
`;

const HourContainer = styled.div`
  height: ${HourHeight}px;
`;

const HourLabel = styled.p`
  color: #555;
  font-size: 10px;
  margin: 0 5px 0 0;
`

const HourLine = styled.div`
  background-color: #555;
  margin: 10px 0;
  width: calc(100% - 17px);
  height: 1px;
`

const ClockArrow = styled.div`
  background-color: orangered;
  position: absolute;
  height: 3px;
  border-radius: 1px;
  width: calc(100% - 37px);
  margin: 0 16px;
  top: ${props => props.minute*0.7+19}px;
`;

const TimelineDateLabel = styled(Button)`
  margin: 0;
  font-size: 15px;
  padding: 0 5px;
`;

const DateArrow = styled(IconButton)`
  width: 24px;
  padding: 0;
`;

const Timeline = ({ ownEvents, invitedEvents, setChosenEvent, setColumnShown, militaryTime, translate: __, language }) => {
  const dateNow = new Date();
  const [now, setNow] = useState({
    hour: dateNow.getHours(), minute: dateNow.getMinutes()
  });

  const [chosenDate, setChosenDate] = useState(dateNow);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const timer = setTimeout(()=>{
      const dateNow = new Date();
      setNow({
        hour: dateNow.getHours(), minute: dateNow.getMinutes()
      });
    },1000)
    return () => clearTimeout(timer);
  },[now]);

  const [month, dayNumber, year] = chosenDate.toDateString().split(' ').slice(-3);
  const ukrMonth = UkrainianMonths[chosenDate.getMonth()].slice(0,3);
  const chosenDateString = language === LANGUAGE.EN
    ? `${month} ${dayNumber}, ${year}`
    : `${dayNumber} ${ukrMonth} ${year}`;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const collisionMap = {};

  if (ownEvents) {
    ownEvents.forEach((eventToLookFor, index) => {
      extendCollisionList(eventToLookFor, ownEvents.filter((_, i) => i !== index), collisionMap);
      if (invitedEvents) {
        extendCollisionList(eventToLookFor, invitedEvents, collisionMap);
      }
    });
  }
  if (invitedEvents) {
    invitedEvents.forEach((eventToLookFor, index) => {
      extendCollisionList(eventToLookFor, invitedEvents.filter((_, i) => i !== index), collisionMap);
      if (ownEvents) {
        extendCollisionList(eventToLookFor, ownEvents, collisionMap);
      }
    });
  }
  Object.values(collisionMap).forEach(list => list.sort());

  return (
    <Container container direction="column" justifyContent="flex-start">
      <ColumnHeader container direction="row" justifyContent="space-between" alignItems="center">
        <ColumnTitle>{__('Timeline')}</ColumnTitle>
        <div style={{ flex: 1 }} />
        <DateArrow onClick={() => {
          const date = new Date(chosenDate);
          date.setDate(date.getDate() - 1)
          setChosenDate(date);
        }}>
          <ChevronLeftIcon />
        </DateArrow>
        <TimelineDateLabel onClick={handleClick}>{chosenDateString}</TimelineDateLabel>
        <DateArrow
          onClick={() => {
            const date = new Date(chosenDate);
            date.setDate(date.getDate() + 1)
            setChosenDate(date);
          }}>
          <ChevronRightIcon />
        </DateArrow>
      </ColumnHeader>
      <ScrollArea>
        <ScrollContentWrapper container direction="column" alignItems="stretch">
          {Array.from(Array(24).keys()).map(hour => (
            <HourContainer key={hour}>
              <Grid container direction="row" alignItems="center">
                <HourLabel>{hour.toString().padStart(2, '0')}</HourLabel>
                <HourLine />
              </Grid>
            </HourContainer>
          ))}
          <Grid container direction="row" alignItems="center">
            <HourLabel>00</HourLabel>
            <HourLine />
          </Grid>
          {ownEvents && ownEvents.map(event => (
            <TimelineEventBar
              key={event.id}
              eventData={event}
              chosenDate={chosenDate}
              collisionMap={collisionMap}
              militaryTime={militaryTime}
              setChosenEvent={setChosenEvent}
              setColumnShown={setColumnShown} />
          ))}
          {invitedEvents && invitedEvents.map(event => (
            <TimelineEventBar
              key={event.id}
              eventData={event}
              chosenDate={chosenDate}
              collisionMap={collisionMap}
              militaryTime={militaryTime}
              setChosenEvent={setChosenEvent}
              setColumnShown={setColumnShown}
            />
          ))}
          <ClockArrow
            minute={now.hour*60+now.minute}
            hidden={chosenDate.toDateString() !== new Date().toDateString()} />
        </ScrollContentWrapper>
      </ScrollArea>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={LOCALE[language]}>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          <DatePicker
            autoOk
            variant="static"
            value={chosenDate}
            onChange={setChosenDate}
          />
        </Popover>
      </MuiPickersUtilsProvider>
    </Container>
  );
};

export default withSettings(Timeline);