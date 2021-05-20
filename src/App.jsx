import React, {useState} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route } from 'react-router';

import Header from "./components/Header";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./components/Profile";

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
            </Switch>
        </Router>
    );
}

export default App;
