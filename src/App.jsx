import React, {useState} from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { loadStorageItem, saveItemInStorage, deleteStorageItem } from './utils/localStorage';
import Header from "./components/Header";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import EventDashboard from "./components/EventDashboard";
import PublicRoute from "./components/Router/PublicRoute";
import PrivateRoute from "./components/Router/PrivateRoute";
import withSettings from './components/HOCs/withSettings';
import { GOOGLE_CLIENT_ID } from "./constants/config";
import { googleOAuthLogout } from "./actions/settingsAction";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Snackbar } from "@material-ui/core";

const Footer = styled.div`
  text-align: center;
  font-size: 13px;
  margin: 5px;
`

const App = ({ translate: __, actions, snackbarMessage }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!loadStorageItem("user"));

  const handleLogout = history => {
    setIsLoggedIn(false);
    deleteStorageItem('user');
    actions.googleOAuthLogout();
    history.push('/');
  }

  const handleLogin = (token, history) => {
    setIsLoggedIn(true);
    saveItemInStorage('user', token);
    history.push('/');
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Switch>
          <Route path="/" exact component={Home} />
          <PublicRoute path="/sign-in" component={() => <SignIn onLogin={handleLogin} />} />
          <PublicRoute path="/sign-up" component={() => <SignUp onLogin={handleLogin} />} />
          <PrivateRoute path="/profile" component={Profile} />
          <PrivateRoute path="/event-dashboard" component={EventDashboard} />
        </Switch>
        <Footer>{new Date().getFullYear()} &copy; {__('Andrii Kushka')}</Footer>
      </Router>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={!!snackbarMessage}
        message={snackbarMessage}
      />
    </GoogleOAuthProvider>
  );
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    googleOAuthLogout,
  }, dispatch),
});

export default compose(
  withSettings,
  connect(null, mapDispatchToProps)
)(App);
