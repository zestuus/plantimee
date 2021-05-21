import React from 'react';
import styled from "styled-components";

import { Grid } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import CheckIcon from '@material-ui/icons/Check';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';

const EventCard = styled(Grid)`
    border-radius: 10px;
    background-color: #2751a5;
    margin: 5px 0;
    padding: 5px;
    color: white;
`;

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
`

const EventInfo = styled(Grid)`
    width: calc(100% - 44px);
`

const Event = ({ name, description }) => {
    return (
        <EventCard container direction="row" alignItems="center">
            <Checkbox
                icon={<CircleUnchecked htmlColor="white" />}
                checkedIcon={<CheckIcon htmlColor="white" />}
            />
            <EventInfo container direction="column">
                <EventTitle>{name}</EventTitle>
                <EventDescription>{description}</EventDescription>
            </EventInfo>
        </EventCard>
    );
};

export default Event;