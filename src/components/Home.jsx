import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import {Container} from './SignIn';
import largeLogo from '../images/logo_large.png';
import {PRIMARY_COLOR} from '../constants/config';
import withSettings from './HOCs/withSettings';

const LogoWrapper = styled(Grid)`
  padding: 5px;
`;

const LargeLogo = styled.img`
  width: 100%;
  @media (max-width: 960px) {
    margin: auto;
    max-width: 340px;
  }
`;

const WelcomeBlock = styled(Grid)`
  padding: 22px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 48px;
  @media (max-width: 960px) {
    margin: 10px 0;
    font-size: 40px;
  }
`;

const SecondTitle = styled.h3`
  font-size: 35px;
  margin: 10px 0;
  @media (max-width: 960px) {
    margin: 5px 0;
    font-size: 25px;
  }
`;

const Name = styled.span`
  color: ${PRIMARY_COLOR};
`;

const Description = styled.p`
  font-size: 20px;
  line-height: 25px;
`;

const Home = ({translate: __}) => {
  return (
    <Grid container justifyContent="center">
      <Container item container md={9} sm={11} alignItems="center">
        <LogoWrapper item container md={6}>
          <LargeLogo src={largeLogo} alt="plantimee large logo"/>
        </LogoWrapper>
        <WelcomeBlock item container md={6} direction="column" alignItems="center">
          <Title>{__('Welcome')}</Title>
          <SecondTitle>{__("It's")} <Name>plantimee</Name> &ndash; <br /> {__('automatic event planner.')}</SecondTitle>
          <Description>
            {__('Automatic system can analyze your agenda and agendas of all participants ')}
            {__('to make predictions when and where your event can happen.')}
          </Description>
        </WelcomeBlock>
      </Container>
    </Grid>
  );
};

export default withSettings(Home);