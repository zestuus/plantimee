import React from 'react';
import styled from "styled-components";
import {Link, useHistory} from "react-router-dom";
import {Grid} from "@material-ui/core";

import Logo from "./Logo";
import {PRIMARY_COLOR} from "../utils/constants";

const Container = styled(Grid)`
    max-width: 1280px; 
`;

const MenuLink = styled(Link)`
    color: ${PRIMARY_COLOR};
    font-weight: bold;
    margin: 10px;
    text-decoration: none;
`;

const LogoutLink = styled.p`
    color: ${PRIMARY_COLOR};
    font-weight: bold;
    margin: 10px;
    cursor: pointer;
`

const Menu = styled.div`
    padding-right: 20px;
`;

const Border = styled.hr`
    border-top: 2px solid ${PRIMARY_COLOR};
    margin: 0;
`;

const Header = ({isLoggedIn, onLogout}) => {
    const history = useHistory();

    return (
        <React.Fragment>
            <Grid container justify="center">
                <Container container alignItems="center" justify="space-between">
                    <Logo />
                    <Menu>
                        <Grid item container alignItems="center" justify="flex-end">
                            {isLoggedIn ? (
                                <React.Fragment>
                                    <MenuLink to="/profile">Profile</MenuLink>
                                    <LogoutLink onClick={() => {
                                        onLogout(history);
                                    }}>Logout</LogoutLink>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <MenuLink to="/sign-up">Sign Up</MenuLink>
                                    <MenuLink to="/sign-in">Sign In</MenuLink>
                                </React.Fragment>
                            )}
                        </Grid>
                    </Menu>
                </Container>
            </Grid>
            <Border />
        </React.Fragment>
    );
};

export default Header;