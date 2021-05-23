import React, {useEffect, useState} from 'react';
import styled from "styled-components";

import {Grid} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {ColumnHeader, Container, ScrollArea, ScrollContentWrapper} from "./Events";
import TimelineEventBar from "./TimelineEventBar";
import {HourHeight} from "../../utils/constants";

export const ColumnTitle = styled.h3`
    margin: 7.5px;
    text-align: center;
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
`

const TimelineDateRow = styled(Grid)`
    width: calc(100% - 95px);
`;

const TimelineDateLabel = styled.h3`
    margin: 0;
`;

const DateArrow = styled(IconButton)`
    width: 24px;
    padding: 0;
`;

const Timeline = ({ ownEvents, invitedEvents, setChosenEvent, setColumnShown }) => {
    const dateNow = new Date();
    const [now, setNow] = useState({
        hour: dateNow.getHours(), minute: dateNow.getMinutes()
    });

    const [chosenDate, setChosenDate] = useState(dateNow);

    useEffect(() => {
        setTimeout(()=>{
            const dateNow = new Date();
            setNow({
                hour: dateNow.getHours(), minute: dateNow.getMinutes()
            });
        },1000)
    },[now]);

    const [month, dayNumber, year] = chosenDate.toDateString().split(' ').slice(-3);
    const chosenDateString = `${month} ${dayNumber}, ${year}`;

    return (
        <Container container direction="column" justify="flex-start">
            <ColumnHeader container direction="row" justify="space-between" alignItems="center">
                <ColumnTitle>Timeline</ColumnTitle>
                <TimelineDateRow container direction="row" justify="flex-end" alignItems="center">
                    <DateArrow onClick={() => {
                        const date = new Date(chosenDate);
                        date.setDate(date.getDate() - 1)
                        setChosenDate(date);
                    }}>
                        <ChevronLeftIcon />
                    </DateArrow>
                    <TimelineDateLabel>{chosenDateString}</TimelineDateLabel>
                    <DateArrow
                        onClick={() => {
                        const date = new Date(chosenDate);
                        date.setDate(date.getDate() + 1)
                        setChosenDate(date);
                    }}>
                        <ChevronRightIcon />
                    </DateArrow>
                </TimelineDateRow>
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
                        {ownEvents.map(event => (
                            <TimelineEventBar
                                key={event.id}
                                eventData={event}
                                chosenDate={chosenDate}
                                setChosenEvent={setChosenEvent}
                                setColumnShown={setColumnShown} />
                        ))}
                        {invitedEvents.map(event => (
                            <TimelineEventBar
                                key={event.id}
                                eventData={event}
                                chosenDate={chosenDate}
                                setChosenEvent={setChosenEvent}
                                setColumnShown={setColumnShown} />
                        ))}
                        <ClockArrow
                            minute={now.hour*60+now.minute}
                            hidden={chosenDate.toDateString() !== new Date().toDateString()} />
                    </ScrollContentWrapper>
                </ScrollArea>
        </Container>
    );
};

export default Timeline;