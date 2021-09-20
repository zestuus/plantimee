import React, {useState} from 'react';
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { Grid } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import FormControl from '@material-ui/core/FormControl';
import FormLabel from "@material-ui/core/FormLabel";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";

import MenuIcon from '@material-ui/icons/Menu';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import ProfileIcon from '@material-ui/icons/AccountCircle';
import EventIcon from '@material-ui/icons/Event';
import SettingsIcon from '@material-ui/icons/Settings';

import Logo from "./Logo";
import { PRIMARY_COLOR } from "../constants/config";
import * as settingsActions from '../actions/settingsAction';
import { LANGUAGE } from '../constants/enums';
import withSettings from './HOCs/withSettings';

const Container = styled(Grid)`
  max-width: 1280px; 
`;

const MenuLink = styled.div`
  color: ${PRIMARY_COLOR};
  font-weight: bold;
  margin: 10px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`

const DropdownMenuItem = styled(MenuItem)`
  color: ${PRIMARY_COLOR};
  font-weight: bold;
`;

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

const Control = styled(FormControl)`
  margin: 15px;
`;

const Label = styled(FormLabel)`
  margin: 10px 0;
`;

const Header = ({ translate: __, actions, isLoggedIn, onLogout, language, militaryTime }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const history = useHistory();

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const commonMenuItems = [
    { key: 'Settings', event: (event) => setSettingsAnchorEl(event.currentTarget), title: (
        <Grid container justify="center" alignItems="center">
          {__('Settings')}
          <SettingsIcon />
        </Grid>
      )}
  ];

  const publicMenuItems = [
    ...commonMenuItems,
    { key: 'Sign Up', event: () => history.push('/sign-up'), title: __('Sign Up') },
    { key: 'Sign In', event: () => history.push('/sign-in'), title: __('Sign In') }
  ];

  const privateMenuItems = [
    ...commonMenuItems,
    { key: 'Event Dashboard', event: () => history.push('/event-dashboard'), title: (
        <Grid container justify="center" alignItems="center">
          {__('Event Dashboard')}
          <EventIcon />
        </Grid>
      )},
    { key: 'Profile', event: () => history.push('/profile'), title: (
      <Grid container justify="center" alignItems="center">
        {__('Profile')}
        <ProfileIcon />
      </Grid>
    )},
    { key: 'Logout', event: () => onLogout(history), title: (
      <Grid container justify="center" alignItems="center">
        {__('Logout')}
        <LogoutIcon />
      </Grid>
    )}
  ];

  return (
    <React.Fragment>
      <Grid container justify="center">
        <Container container alignItems="center" justify="space-between">
          <Logo />
          <MenuBlock>
            <Grid item container alignItems="center" justify="flex-end">
              <Hidden xsDown>
                {isLoggedIn ? privateMenuItems.map(item => (
                  <MenuLink key={item.key} onClick={item.event}>{item.title}</MenuLink>
                )) : publicMenuItems.map(item => (
                  <MenuLink key={item.title} onClick={item.event}>{item.title}</MenuLink>
                ))}
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
                  anchorEl={menuAnchorEl}
                  keepMounted
                  open={Boolean(menuAnchorEl)}
                  onClose={handleClose}
                >
                  {isLoggedIn ? privateMenuItems.map(item => (
                    <DropdownMenuItem key={item.key} onClick={event => {
                      item.event(event);
                      handleClose();
                    }}>{item.title}</DropdownMenuItem>
                  )) : publicMenuItems.map(item => (
                    <DropdownMenuItem key={item.title} onClick={event => {
                      item.event(event);
                      handleClose();
                    }}>{item.title}</DropdownMenuItem>
                  ))}
                </Menu>
              </Hidden>
              <Menu
                id="simple-menu"
                anchorEl={settingsAnchorEl}
                keepMounted
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                open={Boolean(settingsAnchorEl)}
                onClose={() => setSettingsAnchorEl(null)}
              >
                <Control component="fieldset" variant="standard">
                  <Label component="legend">{__('Language')}</Label>
                  <ToggleButtonGroup
                    color="primary"
                    value={language}
                    exclusive
                    onChange={(e, value) => actions.changeLanguage(value)}
                  >
                    <ToggleButton value={LANGUAGE.EN}>EN</ToggleButton>
                    <ToggleButton value={LANGUAGE.UK}>UK</ToggleButton>
                  </ToggleButtonGroup>
                  <Label component="legend">{__('Time format')}</Label>
                  <ToggleButtonGroup
                    color="primary"
                    value={militaryTime}
                    exclusive
                    onChange={actions.switchTimeFormat}
                  >
                    <ToggleButton value={false}>12 {__('hours')}</ToggleButton>
                    <ToggleButton value={true}>24 {__('hours')}</ToggleButton>
                  </ToggleButtonGroup>
                </Control>
              </Menu>
            </Grid>
          </MenuBlock>
        </Container>
      </Grid>
      <Border />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  ...state.settings,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...settingsActions
  }, dispatch),
});

export default compose(
  withSettings,
  connect(mapStateToProps, mapDispatchToProps)
)(Header);