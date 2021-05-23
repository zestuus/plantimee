import React, {useEffect, useState} from 'react';
import {Container} from "./SignIn";
import Grid from "@material-ui/core/Grid";
import {getProfile} from "../api/user";
import TextField from "@material-ui/core/TextField";

const Profile = () => {
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
                {profileData === null ? <p>Cannot get your profile info</p> : (
                    <Grid container direction="column">
                        <h1>Profile</h1>
                        <h3>Username</h3>
                        <TextField InputProps={{ readOnly: true }} value={profileData.username || ''} />
                        <h3>Full name</h3>
                        <TextField InputProps={{ readOnly: true }} value={profileData.full_name || ''} />
                        <h3>Email</h3>
                        <TextField InputProps={{ readOnly: true }} value={profileData.email || ''} />
                    </Grid>
                )}
            </Container>
        </Grid>
    );
};

export default Profile;