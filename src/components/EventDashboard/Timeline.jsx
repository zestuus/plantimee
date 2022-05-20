import React, {useEffect, useMemo, useState} from 'react';
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
import {extendCollisionList, filterEventsByDate} from "../../utils/helpers";

export const ColumnTitle = styled.h3`
  margin: 5px 7.5px 7.5px 7.5px;
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

  const [collisionMap, ownEventsToday, invitedEventsToday] = useMemo(() => {
    const ownEventsToday = filterEventsByDate(ownEvents, chosenDate);
    const invitedEventsToday = filterEventsByDate(invitedEvents, chosenDate);

    const collisionMap = {};

    if (ownEventsToday) {
      ownEventsToday.forEach((eventToLookFor, index) => {
        extendCollisionList(eventToLookFor, ownEventsToday.filter((_, i) => i !== index), collisionMap);
        if (invitedEventsToday) {
          extendCollisionList(eventToLookFor, invitedEventsToday, collisionMap);
        }
      });
    }
    if (invitedEventsToday) {
      invitedEventsToday.forEach((eventToLookFor, index) => {
        extendCollisionList(eventToLookFor, invitedEventsToday.filter((_, i) => i !== index), collisionMap);
        if (ownEventsToday) {
          extendCollisionList(eventToLookFor, ownEventsToday, collisionMap);
        }
      });
    }
    Object.values(collisionMap).forEach(list => list.sort((a, b) => a.startTime - b.startTime));
    Object.entries(collisionMap).forEach(([id, list]) => {
      list.forEach(event => {
        event.collisions = collisionMap[event.id]
          .filter(e => parseInt(id, 10) !== e.id);
      });
    });
    Object.entries(collisionMap).forEach(([id, list]) => {
      collisionMap[id] = list.filter((value, index, self) => (
        index === self.findIndex((t) => (
          !t.collisions.find(e => e.id === value.id)
        ))
      ));
    });

    return [collisionMap, ownEventsToday, invitedEventsToday];
  }, [ownEvents, invitedEvents, chosenDate]);

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
          {ownEventsToday && ownEventsToday.map(event => (
            <TimelineEventBar
              key={event.id}
              eventData={event}
              chosenDate={chosenDate}
              collisionMap={collisionMap}
              militaryTime={militaryTime}
              setChosenEvent={setChosenEvent}
              setColumnShown={setColumnShown} />
          ))}
          {invitedEventsToday && invitedEventsToday.map(event => (
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
          id={anchorEl ? "simple-popover" : undefined}
          open={!!anchorEl}
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