import React, { useEffect, useState } from 'react';
import MapPicker from 'react-google-map-picker';

import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';

import {Container} from "./SignIn";
import withSettings from './HOCs/withSettings';
import MFADialog from './dialogs/MFADialog';
import ConfirmDialog from './dialogs/ConfirmDialog';
import { getProfile, disableMfa, enableMfa, updateProfile } from "../api/user";
import { GOOGLE_MAPS_API_KEY } from '../constants/config';
import { DefaultLocation, DefaultZoom } from './EventDashboard/Settings';
import { roundFloat } from '../utils/helpers';

const Profile = ({ translate: __ }) => {
  const [profileData, setProfileData] = useState({});
  const [profileDataBackup, setProfileDataBackup] = useState({});
  const [qrCode, setQrCode] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(DefaultZoom);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();

        setProfileData(profile);
        setProfileDataBackup({ ...profile });
      } catch (err) {
        setProfileData(null);
      }
    })();
  },[]);

  const disableMFA = async () => {
    const disabled = await disableMfa();

    if (disabled) {
      const profile = await getProfile();

      setProfileData(profile);
      setQrCode('');
      setConfirmDialogOpen(false);
    }
  };

  const enableMFA = async () => {
    const { qrcode } = await enableMfa();

    if (qrcode) {
      const profile = await getProfile();

      setProfileData(profile);
      setQrCode(qrcode);
    }
  };

  const handleClose = () => {
    setQrCode('');
  };

  const handleChangeLocation = async (lat, lng) => {
    const latitude = roundFloat(lat,7);
    const longitude = roundFloat(lng,7);

    const profile = await getProfile();
    const newProfileData = { ...profile, latitude, longitude };

    setProfileData(newProfileData);
    setProfileDataBackup({ ...newProfileData });
    await updateProfile(newProfileData);
  };


  const location = profileData && profileData.latitude && profileData.longitude ? {
      lat: parseFloat(profileData.latitude),
      lng: parseFloat(profileData.longitude)
  } : DefaultLocation;

  const handleBlur = async (key) => {
    if (profileDataBackup[key] !== profileData[key]) {
      await updateProfile(profileData);
    }
  }

  return (
    <Grid container justifyContent="center">
      <Container item container md={9} xs={10}>
        {profileData === null ? <p>{__('Cannot get your profile info')}</p> : (
          <Grid container direction="column">
            <Grid container justifyContent="space-between" alignItems="center">
              <h1>{__('Profile')}</h1>
              <Button
                variant="contained"
                onClick={profileData.mfaEnabled ? () => setConfirmDialogOpen(true) : enableMFA}
                style={profileData.mfaEnabled ? { color: 'red' } : {}}
              >
                {profileData.mfaEnabled ? __('Disable') : __('Enable')} {__('multi-factor authentication')}
              </Button>
            </Grid>
            <h3>{__('Username')}</h3>
            <TextField InputProps={{ readOnly: true }} value={profileData.username || ''} />
            <h3>{__('Full name')}</h3>
            <TextField
              value={profileData.full_name || ''}
              onBlur={() => handleBlur('full_name')}
              onChange={event => {
                setProfileData({ ...profileData, full_name: event.target.value });
              }}
            />
            <h3>Email</h3>
            <TextField
              value={profileData.email || ''}
              type="email"
              onBlur={() => handleBlur('email')}
              onChange={event => {
                setProfileData({ ...profileData, email: event.target.value });
              }}
            />
            <h3>{__('Home address')}</h3>
            <Grid container direction="row">
              <TextField
                label={__('Latitude')}
                type="number"
                value={profileData.latitude || ''}
                style={{ marginRight: 20 }}
                onBlur={() => handleBlur('latitude')}
                onChange={(event) => {
                  const newValue = Math.max(Math.min(event.target.value, 90), -90);
                  setProfileData({ ...profileData, latitude: newValue });
                }}
              />
              <TextField
                label={__('Longitude')}
                type="number"
                value={profileData.longitude || ''}
                onBlur={() => handleBlur('longitude')}
                onChange={(event) => {
                  const newValue = Math.max(Math.min(event.target.value, 180), -180);
                  setProfileData({ ...profileData, longitude: newValue });
                }}
              />
            </Grid>
            <TextField
              label={__('Address')}
              value={profileData.address || ''}
              style={{ margin: '20px 0' }}
              onBlur={() => handleBlur('address')}
              onChange={(event) => {
                setProfileData({ ...profileData, address: event.target.value });
              }}
            />
            {/*{profileData && profileData.username && (*/}
            {/*  <MapPicker*/}
            {/*    defaultLocation={location}*/}
            {/*    zoom={zoom}*/}
            {/*    style={{*/}
            {/*      height: '350px',*/}
            {/*    }}*/}
            {/*    onChangeLocation={handleChangeLocation}*/}
            {/*    onChangeZoom={setZoom}*/}
            {/*    apiKey={GOOGLE_MAPS_API_KEY}*/}
            {/*  />*/}
            {/*)}*/}
            <MapPicker
              defaultLocation={location}
              zoom={zoom}
              style={{
                height: '350px',
              }}
              onChangeLocation={handleChangeLocation}
              onChangeZoom={setZoom}
              apiKey={GOOGLE_MAPS_API_KEY}
            />
            <br />
          </Grid>
        )}
        <MFADialog
          isOpen={!!qrCode}
          qrCode={qrCode}
          onSubmit={()=>setConfirmDialogOpen(true)}
          onClose={handleClose}
        />
        <ConfirmDialog
          isOpen={confirmDialogOpen}
          submitButtonStyle={{ color: 'red' }}
          onSubmit={disableMFA}
          onClose={()=>setConfirmDialogOpen(false)}
          message={__('Do you really want to disable multi-factor authentication?')}
        />
      </Container>
    </Grid>
  );
};

export default withSettings(Profile);