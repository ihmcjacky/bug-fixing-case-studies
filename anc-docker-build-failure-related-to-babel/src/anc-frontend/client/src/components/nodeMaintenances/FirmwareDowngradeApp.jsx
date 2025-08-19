import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import P2Dialog from '../common/P2Dialog';
import P2FileUpload from '../common/P2FileUpload';
import P2PointsToNote from './P2PointsToNote';
import FwDowngradeDialog from '../../containers/appBar/settings/FwDowngradeDialog';
import {
    clearStorage,
    uploadPtosFirmware,
    downgradePtosFirmware,
} from '../../util/apiCall';
import Constant from '../../constants/common';
import {firmwareUpgradeErrorDeterminer} from '../../util/errorValidator';
import P2ErrorObject from '../../util/P2ErrorObject';
import {seriesDeterminer} from '../../util/common'

const useStyles = makeStyles({
    formControllLabelRoot: {
        padding: '5px 10px',
        color: '#de357c',
    },
    formControllLabelLabel: {
        fontSize: '13px',
        paddingLeft: '5px',
    },
});

const FirmwareDowngrade = (props) => {
    const {
        nodes,
        nodeIp, close,
        pollingHandler,
        updateIsLock,
    } = props;
    const classes = useStyles();
    const {csrf, labels} = useSelector(store => store.common);
    const {t: _t, ready} = useTranslation('node-maintenance-fw-downgrade');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const [understandCheckbox, setUnderstandCheckbox] = useState(false);
    const [passwordInputDialog, setPasswordInputDialog] = useState(false);
    const [confirmDisable, setConfirmDisable] = useState(true);
    const [resetDisable, setResetDisable] = useState(false);
    const [fileSelect, setFileSelect] = useState({
        lock: true,
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: t('ok'),
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });

    const checkboxOnClick = () => {
        if (!understandCheckbox) {
            setPasswordInputDialog(true);
        }
        setUnderstandCheckbox(!understandCheckbox);
    };

    const handleDialogOnClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const selectFileHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const file = event.target.files[0];
        const filename = typeof file === 'undefined' ? '' : file.name;
        const size = typeof file === 'undefined' ? '' : Math.round((file.size / 1024 / 1024) * 100, 2) / 100;
        const FW_SIZE_LIMIT = Constant.fwSizeLimit;
        const {model} = nodes[0];
        const series = seriesDeterminer(model);
        
        if (size !== '' && 
            series !== false &&
            series !== 'ax50' && // ax50 series have no downgrade
            size > FW_SIZE_LIMIT[series]
        ) {
            setDialog({
                open: true,
                title: t('fileExceedErrTitle'),
                content: t('fileExceedErrContent'),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                    handleReset();
                },
                cancelActTitle: '',
                cancelActFn: () => {},
            })
            return;
        }

        let disabledRestoreBtn = false;

        if (typeof file === 'undefined') {
            disabledRestoreBtn = true;
        }

        setConfirmDisable(disabledRestoreBtn);
        setFileSelect({
            file,
            fileName: filename,
            fileSize: `, ${size} ${t('mb')}`,
        });
    };

    const getUploadDialogContent = (binVer) => {
        return (
            <span style={{marginBottom: '5px', display: 'block'}}>
                <span style={{marginBottom: '10px', display: 'block'}}>
                    {t('fwDConfirmContent')}
                </span>
                <span style={{display: 'block'}}>
                    {t('verToUp')}&nbsp;
                    <span style={{fontSize: '24px', color: Constant.themeObj.primary.main}}>{binVer} </span>
                </span>
            </span>
        );
    };

    const errorHandler = (err) => {
        let title = t('fwDFailTitle');
        let content = t('runtimeErr');
        let errObjArr;
        if (err?.data?.type === 'errors') {
            errObjArr = err.data.data.map(errObj => new P2ErrorObject(errObj));
        } else if (err?.data?.type === 'specific') {
            errObjArr = err.data.data[nodeIp].errors.map(errObj => new P2ErrorObject(errObj));
        }
        if (errObjArr) {
            const errArr = errObjArr.map(errObj => firmwareUpgradeErrorDeterminer(errObj, t));
            if (errArr[0] === t('magicbitErr')) {
                title = t('magicbitErrorTitle');
            }
            content = errArr[0];
        }
        setDialog({
            ...dialog,
            open: true,
            title,
            content,
            actionTitle: t('ok'),
            actionFn: () => {
                setDialog({...dialog, open: false});
                setConfirmDisable(true);
                updateIsLock(false);
                pollingHandler.restartInterval();
            },
            cancelActTitle: '',
            cancelActFn: () => {},
        });
    };

    const handleDowngrade = () => {
        const projectId = Cookies.get('projectId');
        downgradePtosFirmware(csrf, projectId, {nodes: [nodeIp]}).then((res) => {
            setConfirmDisable(true);
            updateIsLock(false);
            setDialog({
                ...dialog,
                open: true,
                title: t('fwDSuccessTitle'),
                content: t('upgradeSuccess'),
                actionTitle: t('confirm'),
                actionFn: () => {
                    handleDialogOnClose();
                    close(nodeIp);
                    pollingHandler.restartInterval();
                },
                cancelActTitle: '',
                cancelActFn: () => {},
            });
        }).catch(errorHandler);
    };

    const handleUpload = async () => {
        pollingHandler.stopInterval();
        updateIsLock(true);
        const formObj = new FormData();
        formObj.append('firmware', fileSelect.file);
        const projectId = Cookies.get('projectId');

        try {
            await clearStorage(csrf, projectId, {nodes: [nodeIp]});
        } catch (e) {
            console.log('--- clearStorage failed ---');
        }

        uploadPtosFirmware(csrf, projectId, formObj).then((res) => {
            const {binVer} = res;
            setDialog({
                open: true,
                title: t('fwDConfirmTitle'),
                content: getUploadDialogContent(binVer),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                    handleDowngrade();
                },
                cancelActTitle: t('cancel'),
                cancelActFn: () => {
                    handleDialogOnClose();
                    updateIsLock(false);
                },
            });
        }).catch(errorHandler);
    };

    const handleReset = () => {
        setFileSelect({
            lock: true,
            fileName: '',
            fileSize: '',
        });
        document.getElementById('firmware-downgrade-select').value = null;
        setUnderstandCheckbox(false);
        setConfirmDisable(true);
        setResetDisable(false);
    };

    const handleAllowDowngrade = () => {
        setPasswordInputDialog(false);
        setFileSelect({
            ...fileSelect,
            lock: false,
        });
        setUnderstandCheckbox(true);
    };

    const handleDowngradeOnClose = () => {
        setPasswordInputDialog(false);
        setUnderstandCheckbox(false);
        setFileSelect({
            ...fileSelect,
            lock: true,
        });
    };

    if (!ready) return <span />;

    const checkbox = <Checkbox
        checked={understandCheckbox}
        onChange={checkboxOnClick}
        style={{
            color: '#de357c',
            padding: '0px',
        }}
    />;
    return (
        <div>
            <P2PointsToNote
                noteTitle={t('noteTitle')}
                noteCtxArr={t('noteCtxArr', {returnObjects: true})}
                style={{
                    fwNoteGrid: {fontSize: 12},
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
            <FormControlLabel
                classes={{
                    root: classes.formControllLabelRoot,
                    label: classes.formControllLabelLabel,
                }}
                control={checkbox}
                label={t('agreement')}
            />
            <div style={{marginTop: '10px'}}>
                <P2FileUpload
                    inputId="firmware-downgrade-select"
                    selectFileHandler={selectFileHandler}
                    fileName={fileSelect.fileName}
                    disabledSelectFile={fileSelect.lock}
                    fileSize={fileSelect.fileSize}
                    placeholder={t('fileUpPlaceholder')}
                    acceptType=".bin"
                />
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleUpload}
                    style={{
                        float: 'right',
                        marginBottom: '20px',
                        marginTop: '15px',
                    }}
                    disabled={confirmDisable}
                >
                    {t('confirm')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleReset}
                    style={{
                        float: 'right',
                        marginRight: '5px',
                        marginBottom: '20px',
                        marginTop: '15px',
                    }}
                    disabled={resetDisable}
                >
                    {t('reset')}
                </Button>
            </div>
            <FwDowngradeDialog
                t={t}
                csrf={csrf}
                open={passwordInputDialog}
                content={t('dialogContent')}
                handleSubmit={handleAllowDowngrade}
                handleCancel={handleDowngradeOnClose}
            />
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
            />
        </div>
    );
};

FirmwareDowngrade.propTypes = {
    close: PropTypes.func.isRequired,
    nodeIp: PropTypes.string.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
};

export default FirmwareDowngrade;
