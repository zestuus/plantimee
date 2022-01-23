import React, {useState} from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route } from 'react-router';

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

const Footer = styled.div`
  text-align: center;
  font-size: 13px;
  margin: 5px;
`

const App = ({ translate: __ }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!loadStorageItem("user"));

  const handleLogout = history => {
    setIsLoggedIn(false);
    deleteStorageItem('user');
    history.push('/');
  }

  const handleLogin = (token, history) => {
    setIsLoggedIn(true);
    saveItemInStorage('user', token);
    history.push('/');
  }

  return (
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
  );
}

export default withSettings(App);
