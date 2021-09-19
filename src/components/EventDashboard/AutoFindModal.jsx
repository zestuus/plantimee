import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const AutoFindModal = ({ open, autoFindProps, onClose, setAutoFindProps }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Auto find properties</DialogTitle>
      <DialogContent>
        <Grid style={{ margin: '10px 0' }} container direction="column">
          <TextField
            label="Find from date"
            type="date"
            value={autoFindProps.fromDate}
            InputLabelProps={{
              shrink: true
            }}
            onChange={event => {
              setAutoFindProps({
                ...autoFindProps, fromDate: event.target.value,
              });
            }}
          />
          <TextField
            label="Find to date"
            type="date"
            value={autoFindProps.toDate}
            InputLabelProps={{
              shrink: true
            }}
            onChange={event => {
              setAutoFindProps({
                ...autoFindProps, toDate: event.target.value,
              });
            }}
          />
          <TextField
            label="Find from time"
            type="time"
            value={autoFindProps.fromTime}
            InputLabelProps={{
              shrink: true
            }}
            onChange={event => {
              setAutoFindProps({
                ...autoFindProps, fromTime: event.target.value,
              });
            }}
          />
          <TextField
            label="Find to time"
            type="time"
            value={autoFindProps.toTime}
            InputLabelProps={{
              shrink: true
            }}
            onChange={event => {
              setAutoFindProps({
                ...autoFindProps, toTime: event.target.value,
              });
            }}
          />
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AutoFindModal;