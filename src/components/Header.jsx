import React, {useState} from 'react';
import styled from "styled-components";
import {Link, useHistory} from "react-router-dom";

import {Grid} from "@material-ui/core";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from '@material-ui/icons/Menu';

import Logo from "./Logo";
import {PRIMARY_COLOR} from "../utils/constants";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const Container = styled(Grid)`
    max-width: 1280px; 
`;

const MenuLink = styled(Link)`
    color: ${PRIMARY_COLOR};
    font-weight: bold;
    margin: 10px;
    text-decoration: none;
    :hover {
       text-decoration: underline;
    }
`;

const DropdownMenuItem = styled(MenuItem)`
    color: ${PRIMARY_COLOR};
    font-weight: bold;
`;

const LogoutLink = styled.p`
    color: ${PRIMARY_COLOR};
    font-weight: bold;
    margin: 10px;
    cursor: pointer;
    :hover {
       text-decoration: underline;
    }
`

const MenuBlock = styled.div`
    margin-right: 20px;
    @media (max-width: 600px) {
      margin-right: 0;
    }
`;

const Border = styled.hr`
    border-top: 2px solid ${PRIMARY_COLOR};
    margin: 0;
`;

const Header = ({isLoggedIn, onLogout}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const publicMenuItems = [
        { event: () => history.push('/sign-up'), title: 'Sign Up' },
        { event: () => history.push('/sign-in'), title: 'Sign In' }
    ];

    const privateMenuItems = [
        { event: () => history.push('/event-dashboard'), title: 'Event Dashboard' },
        { event: () => history.push('/profile'), title: 'Profile' },
        { event: () => onLogout(history), title: 'Logout' }
    ];

    return (
        <React.Fragment>
            <Grid container justify="center">
                <Container container alignItems="center" justify="space-between">
                    <Logo />
                    <MenuBlock>
                        <Grid item container alignItems="center" justify="flex-end">
                            <Hidden xsDown>
                                {isLoggedIn ? (
                                    <React.Fragment>
                                        <MenuLink to="/event-dashboard">Event Dashboard</MenuLink>
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
                            </Hidden>
                            <Hidden smUp>
                                <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    onClick={handleClick}
                                >
                                    <MenuIcon fontSize="large" color="primary"/>
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    {isLoggedIn ? privateMenuItems.map(item => (
                                            <DropdownMenuItem key={item.title} onClick={()=> {
                                                handleClose();
                                                item.event();
                                            }}>{item.title}</DropdownMenuItem>
                                        )) : publicMenuItems.map(item => (
                                            <DropdownMenuItem key={item.title} onClick={()=> {
                                                handleClose();
                                                item.event();
                                            }}>{item.title}</DropdownMenuItem>
                                        ))
                                    }
                                </Menu>
                            </Hidden>
                        </Grid>
                    </MenuBlock>
                </Container>
            </Grid>
            <Border />
        </React.Fragment>
    );
};

export default Header;