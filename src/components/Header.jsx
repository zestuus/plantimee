import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { useGoogleLogin } from '@react-oauth/google';

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
import Button from "@material-ui/core/Button";

import { PRIMARY_COLOR } from "../constants/config";
import {
  changeLanguage,
  googleOAuthLogin,
  googleOAuthLogout,
  switchTimeFormat
} from '../actions/settingsAction';
import { GOOGLE_API_USER_SCOPE, LANGUAGE } from '../constants/enums';
import withSettings from './HOCs/withSettings';
import Logo from "./Logo";
import googleIcon from '../images/google.svg';
import { getGoogleTokenExpired } from "../utils/helpers";
import { getUserInfo } from "../api/google_calendar";

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
`;

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

export const Control = styled(FormControl)`
  margin: 15px;
`;

const Label = styled(FormLabel)`
  margin: 10px 0;
`;

const ProfilePicture = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const Header = ({
  translate: __, actions, isLoggedIn, onLogout, language, militaryTime, googleOAuthToken, googleOAuthTokenExpireDate,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const history = useHistory();

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: codeResponse => {
      if (codeResponse) {
        const { access_token: accessToken } = codeResponse;
        const expireDate = new Date();

        expireDate.setSeconds(expireDate.getSeconds() + parseInt(codeResponse.expires_in, 10))

        actions.googleOAuthLogin(accessToken, expireDate);
      }
    },
    scope: Object.values(GOOGLE_API_USER_SCOPE).join(' '),
  });

  const commonMenuItems = [
    { key: 'Settings', event: (event) => setSettingsAnchorEl(event.currentTarget), title: (
        <Grid container justifyContent="center" alignItems="center">
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
        <Grid container justifyContent="center" alignItems="center">
          {__('Event Dashboard')}
          <EventIcon />
        </Grid>
      )},
    { key: 'Profile', event: () => history.push('/profile'), title: (
      <Grid container justifyContent="center" alignItems="center">
        {__('Profile')}
        <ProfileIcon />
      </Grid>
    )},
    { key: 'Logout', event: () => onLogout(history), title: (
      <Grid container justifyContent="center" alignItems="center">
        {__('Logout')}
        <LogoutIcon />
      </Grid>
    )}
  ];


  const googleTokenExpired = getGoogleTokenExpired(googleOAuthToken, googleOAuthTokenExpireDate);

  useEffect(() => {
    (async () => {
      if (!googleTokenExpired) {
        const userInfo = await getUserInfo(googleOAuthToken);

        if (userInfo) {
          setUserInfo(userInfo);
        }
      }
    })()
  }, [googleOAuthToken])

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Container container alignItems="center" justifyContent="space-between">
          <Logo />
          <MenuBlock>
            <Grid item container alignItems="center" justifyContent="flex-end">
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
                    <DropdownMenuItem
                      key={item.key}
                      onClick={event => {
                        item.event(event);
                        handleClose();
                      }}
                    >
                      {item.title}
                    </DropdownMenuItem>
                  )) : publicMenuItems.map(item => (
                    <DropdownMenuItem
                      key={item.title}
                      onClick={event => {
                        item.event(event);
                        handleClose();
                      }}
                    >
                      {item.title}
                    </DropdownMenuItem>
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
                    onChange={(e, value) => value && actions.changeLanguage(value)}
                  >
                    <ToggleButton value={LANGUAGE.EN}>EN</ToggleButton>
                    <ToggleButton value={LANGUAGE.UK}>UK</ToggleButton>
                  </ToggleButtonGroup>
                  {isLoggedIn && (
                    <React.Fragment>
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
                      <Label component="legend">Google</Label>
                      {!googleTokenExpired && !!userInfo && (
                        <Grid container alignItems="center" justifyContent="space-between" style={{ padding: '0 10px' }}>
                          <ProfilePicture src={userInfo.picture || ''} alt={userInfo.name}/>
                          <p style={{ margin: 5, textAlign: 'center' }}>
                            {__('Signed in as:')}
                            <br/>
                            <span style={{ fontWeight: 'bold' }}>{userInfo.name}</span>
                          </p>
                          <IconButton onClick={actions.googleOAuthLogout}>
                            <LogoutIcon />
                          </IconButton>
                        </Grid>
                      )}
                      {googleTokenExpired && (
                        <Button
                          onClick={() => {
                            handleGoogleSignIn();
                          }}
                        >
                          <img src={googleIcon} alt="google sign in" style={{width: 30, marginRight: 5}}/>
                          {__('Sign in')}
                        </Button>
                      )}
                    </React.Fragment>
                  )}
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

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    changeLanguage,
    switchTimeFormat,
    googleOAuthLogin,
    googleOAuthLogout,
  }, dispatch),
});

export default compose(
  withSettings,
  connect(null, mapDispatchToProps)
)(Header);
