import React from 'react';

import withSettings from "../HOCs/withSettings";
import RootDialog from "./RootDialog";

const ConfirmDialog = ({
  translate: __, isOpen, message, onClose, onSubmit, submitButtonStyle, submitLabel, closeLabel
}) => (
  <RootDialog
    isOpen={isOpen}
    onClose={onClose}
    onSubmit={onSubmit}
    submitButtonStyle={submitButtonStyle}
    submitLabel={submitLabel || __('Confirm')}
    closeLabel={closeLabel || __('Cancel')}
    title={__('Confirm the action')}
  >
    {message}
  </RootDialog>
);

export default withSettings(ConfirmDialog);
