/**
 * @Author: mango
 * @Date:   2018-04-27T17:04:23+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-09-13T17:21:17+08:00
 */
import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import Cookies from 'js-cookie';
import Button from '@material-ui/core/Button';
import P2PointsToNote from '../../components/nodeMaintenances/P2PointsToNote';
import LockLayer from '../../components/common/LockLayer';
import {reboot} from '../../util/apiCall';
import P2Dialog from '../../components/common/P2Dialog';
import Constant from '../../constants/common';

const {colors} = Constant;

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const SystemRestart = ({close, nodeIp}) => {
    const {csrf, labels} = useSelector(store => store.common);
    const {t: _t, ready} = useTranslation('node-maintenance-reboot');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    const [isLock, setIsLock] = useState(false);
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        submitTitle: t('submitTitle'),
        submitFn: () => null,
        cancelTitle: '',
        cancelFn: () => null,
    });

    const handleDialogOnClose = useCallback(() => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: false,
        }));
    }, []);

    if (!ready) {
        return <span />;
    }

    const onSystemRestart = async () => {
        const restartObj = {};
        restartObj.nodes = [nodeIp];

        handleDialogOnClose();
        setIsLock(false);

        // Call reboot api
        const projectId = Cookies.get('projectId');

        const {error} = await wrapper(reboot(csrf, projectId, restartObj));
        if (error) {
            setDialog(prevDialog => ({
                ...prevDialog,
                open: true,
                title: t('rebootFailTitle'),
                content: t('rebootFailContent'),
                submitTitle: t('submitTitle'),
                submitFn: () => {
                    handleDialogOnClose();
                    close(nodeIp);
                },
                cancelTitle: '',
                cancelFn: handleDialogOnClose,
            }));
            setIsLock(false);
            return;
        }
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('rebootSuccessTitle'),
            content: t('rebootSuccessContent'),
            submitTitle: t('submitTitle'),
            submitFn: () => {
                handleDialogOnClose();
                close(nodeIp);
            },
            cancelTitle: '',
            cancelFn: handleDialogOnClose,
        }));
        setIsLock(false);
    }

    const clickRestart = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('rebootConfirmTitle'),
            content: t('rebootConfirmContent'),
            submitTitle: t('submitTitle'),
            submitFn: onSystemRestart,
            cancelTitle: t('cancelTitle'),
            cancelFn: handleDialogOnClose,
        }));
    };

    const noteCtx = (
        <P2PointsToNote
            noteTitle={t('noteTitle')}
            noteCtxArr={t('noteCtxArr', {returnObjects: true})}
            style={{
                fwNoteGrid: {
                    fontSize: 12,
                },
                fwNoteTitle: {
                    marginBottom: '10px',
                    fontSize: '14px',
                },
                fwNoteItem: {
                    fontWeight: 400,
                    fontSize: 12,
                },
            }}
        />
    );

    const systemRestartPanel = (
        <div>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={clickRestart}
                style={{float: 'right', marginBottom: '20px'}}
            >
                {t('proceedTitle')}
            </Button>
        </div>
    );

    return (
        <div>
            <LockLayer
                display={isLock}
                left={false}
                zIndex={200}
                opacity={1}
                color={colors.lockLayerBackground}
                hasCircularProgress
                marginLeft="-30px"
                circularMargin="-40px"
            />
            {noteCtx}
            {systemRestartPanel}
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.submitTitle}
                actionFn={dialog.submitFn}
                cancelActTitle={dialog.cancelTitle}
                cancelActFn={dialog.cancelFn}
            />
        </div>
    );
}

SystemRestart.propTypes = {
    nodeIp: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
};

export default SystemRestart;
