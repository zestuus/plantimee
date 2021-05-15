import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import axios from 'axios';

import Header from "./components/Header";
import { APP_URL } from "./utils/constants";

const HeaderBorder = styled.hr`
    border-color: #2354b6;
    margin: 0;
`

const App = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get(APP_URL).then(result => {
            setUsers(result.data);
        }).catch(err => {
            console.error(err);
        });
    }, []);

    console.log(users);
    return (
        <React.Fragment>
            <Header/>
            <HeaderBorder/>
        </React.Fragment>
    );
}

export default App;
