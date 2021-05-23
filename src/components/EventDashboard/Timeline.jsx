import React from 'react';
import styled from "styled-components";

import {ColumnHeader, Container, ScrollArea, ScrollContentWrapper} from "./Events";
import {Grid} from "@material-ui/core";

export const ColumnTitle = styled.h3`
    margin: 5px;
    text-align: center;
`;

const HourContainer = styled.div`
    height: 40px;
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

const Timeline = () => {

    return (
        <Container container direction="column" justify="flex-start">
            <ColumnHeader container direction="row" justify="space-between" alignItems="center">
                <ColumnTitle>Timeline</ColumnTitle>
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
                    </ScrollContentWrapper>
                </ScrollArea>
        </Container>
    );
};

export default Timeline;