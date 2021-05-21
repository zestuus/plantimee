import React from 'react';
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";

import {ColumnTitle} from "./Timeline";
import Event from "./Event";

const ScrollArea = styled(Grid)`
  padding: 5px; 
  height: calc(100% - 52px);
  overflow: auto;
`;

const Events = ({ ownEvents }) => {

    return (
        <Grid container justify="center" style={{ height: '100%'}}>
            <ColumnTitle>Events</ColumnTitle>
            <ScrollArea container direction="column">
                <Grid container direction="column">
                    {ownEvents.map(event => (
                        <Event key={event.id} {...event}/>
                    ))}
                </Grid>
            </ScrollArea>
        </Grid>
    );
};

export default Events;