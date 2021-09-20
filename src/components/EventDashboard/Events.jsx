import React, {useState} from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ExpandMore from "@material-ui/icons/ExpandMore";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import AddIcon from '@material-ui/icons/Add';

import {ColumnTitle} from "./Timeline";
import Event, {EventCard} from "./Event";
import withSettings from '../HOCs/withSettings';

export const Container = styled(Grid)`
  height: 100%;
`

export const ColumnHeader = styled(Grid)`
  padding: 0 7px 0 5px;
`;

export const ScrollArea = styled.div`
  width: 100%;
  height: calc(100% - 37px);
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 0.5em;
  }
  &::-webkit-scrollbar-track {
    background-color: #97a5c1;
  },
  &::-webkit-scrollbar-thumb {
    background: #556e9e;
  }
`;

export const ScrollContentWrapper = styled(Grid)`
  background-color: white;
  padding: 10px;
  min-height: 100%;
  position: relative;
`;

const GroupSwitch = styled(Button)`
  text-transform: none;
`;

const Events = ({
  ownEvents, invitedEvents, chosenEvent, setChosenEvent, openColumn, onCreateNewEvent, onChangeOwnEvent, translate: __
}) => {
  const [showInvitedEvents, setShowInvitedEvents] = useState(true);
  const [showActiveEvents, setShowActiveEvents] = useState(true);
  const [showCompletedEvents, setShowCompletedEvents] = useState(true);

  const [ownActive, ownCompleted] = (ownEvents || []).reduce((grouped, event) => {
    if (event.completed) {
      grouped[1].push(event);
    } else {
      grouped[0].push(event);
    }

    return grouped;
  }, [[],[]])

  return (
    <Container container direction="column" justify="flex-start">
      <ColumnHeader container direction="row" justify="space-between" alignItems="center">
        <ColumnTitle>{__('Events')}</ColumnTitle>
        <Button
          style={{ paddingLeft: 0 }}
          onClick={() => {
            onCreateNewEvent();
            openColumn('settings');
          }}
        >
          <AddIcon />{__('Create new')}
        </Button>
      </ColumnHeader>
      <ScrollArea>
        <ScrollContentWrapper container direction="column" alignItems="flex-start">
          <GroupSwitch onClick={() => {
            setShowInvitedEvents(!showInvitedEvents)
          }}>
            {showInvitedEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__("Events you're invited to")}
          </GroupSwitch>
          {showInvitedEvents && ( invitedEvents.length ? (
            <Grid container direction="column">
              {invitedEvents.map(event => (
                <Event
                  invited
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  openColumn={openColumn}
                  setChosenEvent={setChosenEvent}
                />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no invited events')}</EventCard>)}
          <GroupSwitch onClick={() => {
            setShowActiveEvents(!showActiveEvents)
          }}>
            {showActiveEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__('Your own active events')}
          </GroupSwitch>
          {showActiveEvents && ( ownActive.length ? (
            <Grid container direction="column">
              {ownActive.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  openColumn={openColumn}
                  onChangeOwnEvent={onChangeOwnEvent} />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no own active events')}</EventCard>)}
          <GroupSwitch onClick={() => {
            setShowCompletedEvents(!showCompletedEvents)
          }}>
            {showCompletedEvents ? <KeyboardArrowRightIcon/> : <ExpandMore/>}
            {__('Completed events')}
          </GroupSwitch>
          {showCompletedEvents && ( ownCompleted.length ? (
            <Grid container direction="column">
              {ownCompleted.map(event => (
                <Event
                  key={event.id}
                  eventData={event}
                  isChosen={chosenEvent === event.id}
                  setChosenEvent={setChosenEvent}
                  openColumn={openColumn}
                  onChangeOwnEvent={onChangeOwnEvent} />
              ))}
            </Grid>
          ) : <EventCard>{__('You have no completed events')}</EventCard>)}
        </ScrollContentWrapper>
      </ScrollArea>
    </Container>
  );
};

export default withSettings(Events);