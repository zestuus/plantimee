import React, {useEffect, useState} from 'react';
import styled from "styled-components";

import {ColumnHeader, Container, ScrollArea, ScrollContentWrapper} from "./Events";
import {Grid} from "@material-ui/core";

export const ColumnTitle = styled.h3`
    margin: 7.5px;
    text-align: center;
`;

const HourContainer = styled.div`
    height: 42px;
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
`

const Timeline = () => {
    const dateNow = new Date();
    const [now, setNow] = useState({
        hour: dateNow.getHours(), minute: dateNow.getMinutes()
    });

    useEffect(() => {
        setTimeout(()=>{
            const dateNow = new Date();
            setNow({
                hour: dateNow.getHours(), minute: dateNow.getMinutes()
            });
        },1000)
    },[now]);

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
                        <ClockArrow minute={now.hour*60+now.minute} />
                    </ScrollContentWrapper>
                </ScrollArea>
        </Container>
    );
};

export default Timeline;