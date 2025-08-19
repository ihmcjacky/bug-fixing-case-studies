import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Dialog from '@material-ui/core/Dialog';
import TransitionEff from '../../../../components/common/Transition';
import {closeSpectrumScanDialog} from '../../../../redux/spectrumScan/spectrumScanActions';
import SpectrumScanDialog from '../../../../components/spectrumScan/SpectrumScanDialog';

const useStyles = makeStyles({
    paperStyle: {
        overflowY: 'hidden',
    },
});

const SpectrumScanWrapper = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const {open} = useSelector(store => store.spectrumScan);

    const handleClose = () => {
        dispatch(closeSpectrumScanDialog(false));
    };

    return (
        <Dialog
            fullScreen
            disableBackdropClick
            open={open}
            onClose={handleClose}
            TransitionComponent={TransitionEff}
            classes={{paperFullScreen: classes.paperStyle}}
        >
            <SpectrumScanDialog />
        </Dialog>
    );
};

export default SpectrumScanWrapper;
