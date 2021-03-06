import React from 'react';
import styled from "styled-components";
import {Link} from "react-router-dom";

import { Grid } from '@material-ui/core';

import logo from '../logo.svg';
import {PRIMARY_COLOR} from "../utils/constants";

const LogoImage = styled.img`
    height: 32px;
`;

const LogoBlock = styled(Link)`
    width: 150px;
    border: 2px solid ${PRIMARY_COLOR};
    border-radius: 5px;
    padding: 5px;
    margin: 15px 20px;
    text-decoration: none;
`;

const LogoHeader = styled.h2`
    margin: 0;
    color: ${PRIMARY_COLOR};
`;

const Logo = () => (
    <LogoBlock to="/">
        <Grid container alignItems="center">
            <LogoImage src={logo} alt=""/>
            <LogoHeader>plantimee</LogoHeader>
        </Grid>
    </LogoBlock>
);

export default Logo;