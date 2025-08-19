import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Dialog from '@material-ui/core/Dialog';
import TransitionEff from '../../../../components/common/Transition';
import {closeNodeRecoveryDialog} from '../../../../redux/nodeRecovery/nodeRecoveryActions';
import NodeRecoveryDialog from '../../../../components/nodeRecovery/NodeRecoveryDialog';

const useStyles = makeStyles({
    paperStyle: {
        overflowY: 'hidden',
    },
});

const NodeRecoveryWrapper = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const {open} = useSelector(store => store.nodeRecovery);

    const handleClose = () => {
        dispatch(closeNodeRecoveryDialog());
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
            <NodeRecoveryDialog />
        </Dialog>
    );
};

export default NodeRecoveryWrapper;
