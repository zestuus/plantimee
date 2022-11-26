import React from 'react';

import {
  Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button,
} from '@material-ui/core';

const RootDialog = ({
  isOpen, title, children, onClose, onSubmit, submitLabel, closeLabel, submitButtonStyle, ...rest
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    aria-labelledby="form-dialog-title"
    {...rest}
  >
    <DialogTitle id="form-dialog-title" disableTypography>
      <Typography variant="h6">{ title }</Typography>
    </DialogTitle>
    <DialogContent>
      { children }
    </DialogContent>
    <DialogActions>
      { onSubmit && (
        <Button onClick={() => {
          onSubmit();
          onClose();
        }} color="primary" style={submitButtonStyle}>
          { submitLabel }
        </Button>
      )}
      <Button onClick={onClose}>
        { closeLabel }
      </Button>
    </DialogActions>
  </Dialog>
);

export default RootDialog;
