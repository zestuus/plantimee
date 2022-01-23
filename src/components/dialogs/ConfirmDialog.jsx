import React from 'react';

import withSettings from "../HOCs/withSettings";
import RootDialog from "./RootDialog";

const ConfirmDialog = ({
  translate: __, isOpened, message, onClose, onSubmit, submitButtonStyle,
}) => (
  <RootDialog
    isOpened={isOpened}
    onClose={onClose}
    onSubmit={onSubmit}
    submitButtonStyle={submitButtonStyle}
    submitLabel={__('Confirm')}
    closeLabel={__('Cancel')}
    title={__('Confirm the action')}
  >
    {message}
  </RootDialog>
);

export default withSettings(ConfirmDialog);
