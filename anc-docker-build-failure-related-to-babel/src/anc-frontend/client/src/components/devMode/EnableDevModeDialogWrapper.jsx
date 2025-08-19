import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import EnableDevModeDialog from './EnableDevModeDialog';

const EnableDevModeDialogWrapper = (props) => {
    const {open, closeFunc} = props;

    return (
        <Dialog onClose={closeFunc} open={open}>
            <EnableDevModeDialog closeFunc={closeFunc}/>
        </Dialog>
    );
};

EnableDevModeDialogWrapper.propTypes = {
    open: PropTypes.bool.isRequired,
    closeFunc: PropTypes.func.isRequired,
};

export default EnableDevModeDialogWrapper;
