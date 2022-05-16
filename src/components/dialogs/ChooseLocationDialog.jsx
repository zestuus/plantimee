import React, {useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import withSettings from '../HOCs/withSettings';
import {Radio, RadioGroup} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";

const ChooseLocationDialog = ({ placesToChoose, onClose, onSubmit, translate: __ }) => {
  const [locationChosen, setLocationChosen] = useState('');

  return (
    <Dialog open={!!placesToChoose.length} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{__('Choose location you are looking for')}</DialogTitle>
      <DialogContent>
        <Grid style={{ margin: '10px 0' }} container direction="column">
          <RadioGroup
            name="radio-buttons-group"
            value={locationChosen}
            onChange={(event) => { setLocationChosen(event.target.value); }}
          >
            {placesToChoose.map(place => {
              const label = (
                <Grid container direction="column" style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: 0 }}>{place.name}</h4>
                  <h5 style={{ margin: 0 }}>{place.vicinity}</h5>
                </Grid>
              );

              return (
                <FormControlLabel key={place.place_id} value={place.place_id} control={<Radio />} label={label} />
              );
            })}

          </RadioGroup>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              const placeChosen = placesToChoose.find(place => place.place_id === locationChosen);

              if (placeChosen) {
                const {
                  name: placeName,
                  vicinity: address,
                  geometry: { location: { lat: latitude, lng: longitude } }
                } = placeChosen;
                onSubmit({ placeName, address, latitude, longitude });
              } else {
                onClose();
              }
            }}
          >
            {__('Submit')}
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default withSettings(ChooseLocationDialog);