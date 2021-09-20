import React, {useEffect, useState} from 'react';
import {Container} from "./SignIn";
import Grid from "@material-ui/core/Grid";
import {getProfile} from "../api/user";
import TextField from "@material-ui/core/TextField";
import withSettings from './HOCs/withSettings';

const Profile = ({ translate: __ }) => {
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setProfileData(profile);
      } catch (err) {
        setProfileData(null);
      }
    })();
  },[]);

  return (
    <Grid container justify="center">
      <Container item container md={9} xs={10}>
        {profileData === null ? <p>{__('Cannot get your profile info')}</p> : (
          <Grid container direction="column">
            <h1>{__('Profile')}</h1>
            <h3>{__('Username')}</h3>
            <TextField InputProps={{ readOnly: true }} value={profileData.username || ''} />
            <h3>{__('Full name')}</h3>
            <TextField InputProps={{ readOnly: true }} value={profileData.full_name || ''} />
            <h3>Email</h3>
            <TextField InputProps={{ readOnly: true }} value={profileData.email || ''} />
          </Grid>
        )}
      </Container>
    </Grid>
  );
};

export default withSettings(Profile);