/**
 * @Author: mango
 * @Date:   2018-04-27T14:21:27+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T11:05:51+08:00
 */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import P2PointsToNote from './P2PointsToNote';
import P2Dialog from '../common/P2Dialog';
import {factoryReset} from '../../util/apiCall';
import Constant from '../../constants/common';


const {theme} = Constant;


const FactoryReset = ({nodeIp, close, pollingHandler, updateIsLock}) => {
    const {csrf, labels} = useSelector(store => store.common);
    const {t: _t, ready} = useTranslation('node-maintenance-factory-reset');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    const [checkedNotes, setCheckedNotes] = useState(false);
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        submitTitle: t('submitTitle'),
        submitFn: () => null,
        cancelTitle: '',
        cancelFn: () => null,
    });

    if (!ready) {
        return <span />;
    }

    const handleDialogOnClose = (lock) => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: false,
        }));
        if (typeof lock !== 'boolean') {
            updateIsLock(false);
        }
    };

    const handleResetSuccess = () => {
        console.log('kyle_debug: handleResetSuccess -> handleResetSuccess');
        // Pop Up Success Message
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('resetSuccessTitle'),
            content: t('resetSuccessContent'),
            submitTitle: t('submitBtn'),
            submitFn: () => {
                handleDialogOnClose();
                close(nodeIp);
            },
            cancelTitle: '',
            cancelFn: handleDialogOnClose,
        }));
    };

    const handleResetError = () => {
        // Pop Up Error Message
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('resetFailTitle'),
            content: t('resetFailContent'),
            submitTitle: t('submitBtn'),
            submitFn: () => {
                handleDialogOnClose();
                close(nodeIp);
            },
            cancelTitle: '',
            cancelFn: handleDialogOnClose,
        }));
    };

    const handleChange = () => {
        setCheckedNotes(prevCheckedNotes => !prevCheckedNotes);
    };

    const clickReset = () => {
        console.log('kyle_debug: clickReset -> clickReset');
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('resetConfirmTitle'),
            content: t('resetConfirmContent'),
            submitTitle: t('submitBtn'),
            submitFn: onFactoryReset,
            cancelTitle: t('cancelBtn'),
            cancelFn: handleDialogOnClose,
        }));
        updateIsLock(true);
    };

    const onFactoryReset = () => {
        const resetObj = {};
        resetObj.nodes = [nodeIp];

        handleDialogOnClose(true);
        pollingHandler.stopInterval();

        const projectId = Cookies.get('projectId');

        // const sleep = (sec) => {
        //     return new Promise((resolve, reject) => {
        //         setTimeout(() => resolve(), sec * 1000)
        //     })
        // };
        // sleep(5).then((value) => {

        const p = factoryReset(csrf, projectId, resetObj);
        p.then((value) => {
            handleResetSuccess(value);
        }).catch((error) => {
            handleResetError(error);
        }).finally(() => {
            pollingHandler.restartInterval();
            updateIsLock(false);
        });
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
    const checkedNote = (
        <div style={{marginLeft: '-15px'}}>
            <Checkbox
                checked={checkedNotes}
                onChange={handleChange}
                value="checkedNotes"
                color="secondary"
                style={{color: theme.palette.secondary.main}}
            />
            <Typography
                color="secondary"
                style={{display: 'inline'}}
                variant="body2"
            >
                {t('agreement')}
            </Typography>
        </div>
    );

    const resetPanel = (
        <div>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={clickReset}
                disabled={!checkedNotes}
                style={{float: 'right', marginBottom: '20px'}}
            >
                {t('proceedBtn')}
            </Button>
        </div>
    );

    return (
        <div>
            {noteCtx}
            {checkedNote}
            {resetPanel}
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


};

FactoryReset.propTypes = {
    nodeIp: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
};

export default FactoryReset;
