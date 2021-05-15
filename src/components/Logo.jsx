import React from 'react';
import styled from "styled-components";
import { Grid } from '@material-ui/core';

import logo from '../logo.svg';

const LogoImage = styled.img`
    height: 32px;
`;

const LogoBlock = styled.div`
    width: 150px;
    border: 2px solid #2354b6;
    border-radius: 5px;
    padding: 5px;
    margin: 15px 20px;
`;

const LogoHeader = styled.h2`
    margin: 0;
    color: #2354b6;
`;

const Logo = () => (
    <LogoBlock>
        <Grid container alignItems="center">
            <LogoImage src={logo} alt=""/>
            <LogoHeader>plantimee</LogoHeader>
        </Grid>
    </LogoBlock>
);

export default Logo;