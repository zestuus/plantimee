import React from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CloseIcon from '@material-ui/icons/Close';

import {PRIMARY_COLOR} from "../../constants/config";
import IconButton from "@material-ui/core/IconButton";
import withSettings from '../HOCs/withSettings';
import {AVAILABILITY_ATTENDEE_LABEL, AVAILABILITY_COLOR} from "../../constants/enums";

const ParticipantContainer = styled.div`
  margin: 5px 0;
  padding: 5px;
  box-sizing: border-box;
  border: 2px solid ${PRIMARY_COLOR};
  border-radius: 5px;
`;

const ParticipantInfoBlock = styled(Grid)`
  flex: 1;
`;

const ParticipantInfo = styled.p`
  margin: 5px 3px;
  font-size: 12px;
`;

const AvailabilityInfo = styled.p`
  padding: 5px;
  border-radius: 5px;
  background-color: ${PRIMARY_COLOR}ed;
  margin: 5px 3px;
  font-size: 12px;
  ${props => props.color ? `
    color: ${props.color};
    font-weight: bold;
  ` : ''}
`;

const Participant = ({ userInfo, noAttendees, eventId, onDeleteInvitation, translate: __ }) => {
  return (
    <ParticipantContainer >
      {noAttendees ? __('There are no participants in the event. Do you want to add some?') : (
        <Grid container direction="row" alignItems="center">
          <AccountCircleIcon fontSize="large"/>
          <ParticipantInfoBlock container direction="column">
            <ParticipantInfo>{userInfo.username}</ParticipantInfo>
            <ParticipantInfo>{userInfo.full_name}</ParticipantInfo>
            <ParticipantInfo>{userInfo.email}</ParticipantInfo>
            {!!userInfo.availability && (
              <AvailabilityInfo color={AVAILABILITY_COLOR[userInfo.availability]}>
                {__(AVAILABILITY_ATTENDEE_LABEL[userInfo.availability])}
              </AvailabilityInfo>
            )}
          </ParticipantInfoBlock>
          {!noAttendees && onDeleteInvitation && (
            <IconButton onClick={() => {
              onDeleteInvitation({ userId: userInfo.id, eventId})
            }}>
              <CloseIcon />
            </IconButton>
          )}
        </Grid>
      ) }
    </ParticipantContainer>
  );
};

export default withSettings(Participant);