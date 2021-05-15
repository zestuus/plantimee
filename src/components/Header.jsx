import React from 'react';
import {Grid} from "@material-ui/core";

import Logo from "./Logo";
import styled from "styled-components";

const Container = styled(Grid)`
    max-width: 1280px; 
`

const MenuLink = styled.h3`
    color: #2354b6;
    margin: 10px;
`

const Menu = styled.div`
    padding-right: 20px;
`

const Header = () => {
    return (
        <Grid container justify="center">
            <Container container alignItems="center" justify="space-between">
                <Logo />
                <Menu>
                    <Grid item container alignItems="center" justify="flex-end">
                        <MenuLink>Sign In</MenuLink>
                        <MenuLink>Sign Up</MenuLink>
                    </Grid>
                </Menu>
            </Container>
        </Grid>
    );
};

export default Header;