import React from 'react';
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";

export const ColumnTitle = styled.h3`
    margin: 5px 0 15px 0;
`;

const Timeline = () => {

    return (
        <Grid container justify="center">
            <ColumnTitle>Timeline</ColumnTitle>
        </Grid>
    );
};

export default Timeline;