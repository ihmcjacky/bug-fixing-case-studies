import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import P2Dialog from '../common/P2Dialog';
import {RebootDialogStatus} from '../../constants/common';
import {changeRebootDialogStatus} from '../../redux/notificationCenter/notificationActions';

function RebootDialog(props) {
    const dispatch = useDispatch();
    const {rebootDialog: {status, deviceInfo}} = useSelector(store => store.notificationCenter);
    const {t} = props;

    const dialogProps = {
        open: false,
        handleClose: () => dispatch(changeRebootDialogStatus(RebootDialogStatus.CLOSE)),
        title: t('rebootDialogTitle'),
        content: '',
        nonTextContent: <div />,
        actionTitle: '',
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    };

    switch (status) {
        case RebootDialogStatus.CLOSE: {
            dialogProps.open = false;
            break;
        }
        case RebootDialogStatus.SUCCESS: {
            dialogProps.open = true;
            dialogProps.title = t('rebootSuccessTitle');
            dialogProps.content = `${deviceInfo.hostname} (${deviceInfo.mac}) ${t('rebootSuccessContent')}`;
            dialogProps.actionTitle = t('close');
            dialogProps.actionFn = () => {
                dispatch(changeRebootDialogStatus(RebootDialogStatus.CLOSE));
            };
            break;
        }
        case RebootDialogStatus.ERROR: {
            dialogProps.open = true;
            dialogProps.title = t('rebootFailTitle');
            dialogProps.content = `${deviceInfo.hostname} (${deviceInfo.mac}) ${t('rebootFailContent')}`;
            dialogProps.actionTitle = t('close');
            dialogProps.actionFn = () => {
                dispatch(changeRebootDialogStatus(RebootDialogStatus.CLOSE));
            };
            break;
        }
        default: break;
    }
    return (
        <P2Dialog
            {...dialogProps}
            maxWidth="md"
        />
    );
}

RebootDialog.propTypes = {
    t: PropTypes.func.isRequired,
};

export default RebootDialog;
