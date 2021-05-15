import React from 'react';
import styled from "styled-components";

import Header from "./components/Header";

const HeaderBorder = styled.hr`
    border-color: #2354b6;
    margin: 0;
`

const App = () => (
    <React.Fragment>
        <Header />
        <HeaderBorder />
    </React.Fragment>
);

export default App;
