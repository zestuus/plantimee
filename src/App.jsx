import React, {useState} from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route } from 'react-router';

import Header from "./components/Header";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import PublicRoute from "./components/Router/PublicRoute";
import PrivateRoute from "./components/Router/PrivateRoute";
import Profile from "./components/Profile";
import EventDashboard from "./components/EventDashboard";

const Footer = styled.div`
  text-align: center;
  font-size: 13px;
  margin: 5px;
`

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));

  const handleLogout = history => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    history.push('/');
  }

  const handleLogin = (token, history) => {
    setIsLoggedIn(true);
    localStorage.setItem('user', token);
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
      <Footer>2021 &copy; Andrii Kushka</Footer>
    </Router>
  );
}

export default App;
