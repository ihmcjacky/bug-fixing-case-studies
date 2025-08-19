import React, {useRef, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation, Trans} from 'react-i18next';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import P2PointsToNote from './P2PointsToNote';
import P2Stepper from '../common/P2Stepper';
import P2DevTbl from '../common/P2DevTbl';
import P2FileUpload from '../common/P2FileUpload';
import {firmwareUpgradeErrorDeterminer} from '../../util/errorValidator';
import P2ErrorObject from '../../util/P2ErrorObject';
import FwUpgradeDialog, {
    getBinVerContent,
    getStatusContent,
} from './FwUpgradeCommon';
import P2Dialog from '../common/P2Dialog';
import {
    toggleSnackBar,
    updateProgressBar,
} from '../../redux/common/commonActions';
import {
    setUpFwStatus,
    updateDeviceFwStatus,
} from '../../redux/firmwareUpgrade/firmwareUpgradeActions';
import {
    clearStorage,
    uploadFirmware,
    upgradeFirmware,
    getVersion,
} from '../../util/apiCall';
import Constants from '../../constants/common';
import {seriesDeterminer} from '../../util/common'

const {colors} = Constants;

const FWUpgradeApp = (props) => {
    const fwUpgradeContainer = useRef();
    const dispatch = useDispatch();
    
    const {
        common: {csrf, labels},
        firmwareUpgrade: {devices, hasNodeUpgrading},
        meshTopology: {
            nodeInfo,
            graph: {nodes},
        },
    } = useSelector(store => store);
    const {t: _t, ready} = useTranslation('node-maintenance-firmware-upgrade');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const {
        nodeIp,
        updateIsLock,
        pollingHandler,
    } = props;

    const didmountFunc = () => {
        dispatch(setUpFwStatus({
            [nodeIp]: {status: nodeInfo[nodeIp] ? 'reachable' : 'unreachable'},
        }));
        getVersion(csrf).then((res) => {
            setAnmVersion(res.version);
        });
    };
    useEffect(didmountFunc, []);

    const [fileSelect, setFileSelect] = useState({
        lock: false,
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
        nonTextContent: <span />,
    });
    const [fwUpgradeDialog, setFwUpgradeDialog] = useState({
        open: false,
        shouldForceReset: false,
        checkboxContent: t('forceResetCheckbox'),
        title: '',
        warningContent: null,
        upgradeContent: <div />,
        warningContentList: null,
        collapseBool: {
            downgrade: true,
            incompatible: true,
            sameVer: true,
        },
    });
    const [aNMVersion, setAnmVersion] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [resetCheckbox, setResetCheckbox] = useState(false);
    const [confirmDisable, setConfirmDisable] = useState(true);
    const [resetDisable, setResetDisable] = useState(false);
    const [stepper1, setStepper1] = useState({isStepActive: true, isStepCompleted: false});
    const [stepper2, setStepper2] = useState({isStepActive: false, isStepCompleted: false});
    const [stepper3, setStepper3] = useState({isStepActive: false, isStepCompleted: false});

    const handleReset = () => {
        setFileSelect({
            lock: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        document.getElementById('firmware-upgrade-select').value = null;
        setConfirmDisable(true);
        setResetDisable(false);
        updateIsLock(false);
        setStepper1({isStepActive: true, isStepCompleted: false});
        setStepper2({isStepActive: false, isStepCompleted: false});
        setStepper3({isStepActive: false, isStepCompleted: false});
        setUpdateSuccess(false);
        dispatch(updateProgressBar(false));

        dispatch(setUpFwStatus({
            [nodeIp]: {status: nodeInfo[nodeIp] ? 'reachable' : 'unreachable'},
        }));
    };

    const errorHandler = (err) => {
        let title = t('fwUpTitleFail');
        let content = t('runtimeErr');
        let errObjArr;
        let isHostNodeError = false;
        if (err?.data?.type === 'errors') {
            errObjArr = err.data.data.map(errObj => new P2ErrorObject(errObj));
        } else if (err?.data?.type === 'specific' && err.data.data[nodeIp]) {
            errObjArr = err.data.data[nodeIp].errors.map(errObj => new P2ErrorObject(errObj));
        } else if (err?.data?.type === 'specific') {
            // refs-8589
            // check if error is not occurred on host node
            const hostNodeIp = nodes.filter(node => node.isHostNode)[0].id;
            const ipList = Object.keys(err.data.data);
            ipList.forEach(ip => {
                const errObj = err.data.data[ip];
                if (errObj.errors) {
                    if (ip === hostNodeIp) {
                        isHostNodeError = true;
                    }
                    errObjArr = errObj.errors.map(errObj => new P2ErrorObject(errObj));
                }
            });
        }
        
        if (errObjArr) {
            const errArr = errObjArr.map(errObj => firmwareUpgradeErrorDeterminer(errObj, t));
            if (errArr[0] === t('magicbitErr')) {
                title = t('magicbitErrorTitle');
                content = errArr[0];
            } else if (isHostNodeError && errArr[0] === t('nodeinsufficientspaceErr')) {
                // refs-8589
                // check if hostnode has insufficient space
                content = t('hostNodeinsufficientspaceErr');
            } else {
                content = errArr[0];
            }
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
                dispatch(updateProgressBar(false));
                pollingHandler.restartInterval();
            },
            cancelActTitle: '',
            cancelActFn: () => {},
        });
        return content;
    };

    const handleFwUpgradeDialogCollapse = (type) => {
        setFwUpgradeDialog({
            ...fwUpgradeDialog,
            collapseBool: {
                ...fwUpgradeDialog.collapseBool,
                [type]: !fwUpgradeDialog.collapseBool[type],
            },
        });
    };

    const handleUpgrade = () => {
        const temp = {};
        temp[nodeIp] = {
            status: 'onUpgrade',
            detail: {
                percentage: 20,
            },
        };
        dispatch(updateDeviceFwStatus([temp]));
        const projectId = Cookies.get('projectId');
        upgradeFirmware(csrf, projectId,  {nodes: [nodeIp], reset: resetCheckbox}).then(() => {
            const temp = {};
            temp[nodeIp] = {
                status: 'onUpgrade',
                detail: {
                    percentage: 100,
                    success: true,
                },
            };
            dispatch(updateDeviceFwStatus([temp]));
            setDialog({
                ...dialog,
                open: true,
                title: t('fwUpOkTitle'),
                content: t('upgradeSuccess'),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                    setFileSelect({
                        lock: false,
                        file: '',
                        fileName: '',
                        fileSize: '',
                    });
                    document.getElementById('firmware-upgrade-select').value = null;
                    setConfirmDisable(true);
                    setResetDisable(false);
                    updateIsLock(false);
                    setStepper1({isStepActive: true, isStepCompleted: true});
                    setStepper2({isStepActive: true, isStepCompleted: true});
                    setStepper3({isStepActive: true, isStepCompleted: true});
                    dispatch(updateProgressBar(false));
                    setUpdateSuccess(true);
                    pollingHandler.restartInterval();
                    props.close();
                },
                cancelActTitle: '',
                cancelActFn: () => {},
                nonTextContent: <span />,
            });
        }).catch((err) => {
            const errMsg = errorHandler(err);
            const newStatus = {};
            newStatus[nodeIp] = {
                status: 'onUpgrade',
                detail: {
                    error: errMsg,
                    percentage: 100,
                },
            };
            dispatch(updateDeviceFwStatus([newStatus]));
            pollingHandler.restartInterval();
        });
    };

    const fwUpgradeDialogOnClose = () => {
        setFwUpgradeDialog({
            ...fwUpgradeDialog,
            open: false,
        });
    };

    const fwUpgradeDialogOnCheck = () => {
        setResetCheckbox(!resetCheckbox);
    };

    const handleFwUpgradeDialogActionFunc = () => {
        fwUpgradeDialogOnClose();
        handleUpgrade()
    };

    const handleFwUpgradeDialogCancelFunc = () => {
        fwUpgradeDialogOnClose();
        handleReset();
        pollingHandler.restartInterval();
    }

    const handleUpload = async () => {
        pollingHandler.stopInterval();
        dispatch(toggleSnackBar(t('fwuping'), 5000));
        dispatch(updateProgressBar(true));

        setStepper1({isStepActive: true, isStepCompleted: true});
        setStepper2({isStepActive: true, isStepCompleted: false});
        setStepper3({isStepActive: false, isStepCompleted: false});

        updateIsLock(true);
        const formObj = new FormData();
        formObj.append('firmware', fileSelect.file);
        const projectId = Cookies.get('projectId');

        try {
            await clearStorage(csrf, projectId, {nodes: [nodeIp]});
        } catch (e) {
            console.log('--- clearStorage failed ---');
        }

        uploadFirmware(csrf, projectId, formObj).then((res) => {
            setStepper1({isStepActive: true, isStepCompleted: true});
            setStepper2({isStepActive: true, isStepCompleted: true});
            setStepper3({isStepActive: false, isStepCompleted: false});
            console.log(res);
            const {binVer} = res;
            const dialogContent = getBinVerContent(binVer, [nodeIp], nodeInfo, t, aNMVersion);
            setFwUpgradeDialog({
                ...fwUpgradeDialog,
                open: true,
                title: t('cwUpConfirm'),
                checkboxContent: t('forceResetCheckbox'),
                shouldForceReset: dialogContent.shouldForceReset,
                warningContent: dialogContent.warningContent,
                upgradeContent: dialogContent.upgradeContent,
                warningContentList: dialogContent.warningContentList,
            })
        }).catch(errorHandler);
    };

    const popupConfirmDialog = () => {
        setDialog({
            open: true,
            title: t('fwupTitle'),
            content: (
                <span>
                    <span style={{marginBottom: '5px', display: 'block'}}>
                        {t('cwFwDevUpNoti')}
                    </span>
                    <span dangerouslySetInnerHTML={{__html: t('cwFwNoTurnOff')}} />
                    <br />
                    <span dangerouslySetInnerHTML={{__html: t('cwFwNoNavi')}} />
                </span>
            ),
            actionTitle: t('proceed'),
            actionFn: () => {
                handleDialogOnClose();
                handleUpload();
            },
            cancelActTitle: t('cancel'),
            cancelActFn: handleDialogOnClose,
            nonTextContent: (
                resetCheckbox ? <Typography style={{color: colors.inactiveRed}}>
                    <br />
                    <b>{t('isResetDialogContentB')}</b>
                    {t('isResetDialogContentC')}
                </Typography> : null
            ),
        });
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
        if (typeof file === 'undefined') return;
        const filename = file.name;
        const size = Math.round((file.size / 1024 / 1024) * 100, 2) / 100;
        const FW_SIZE_LIMIT = Constants.fwSizeLimit;
        const {model} = props.nodes[0];
        const series = seriesDeterminer(model);
        
        if (size !== '' && series !== false && size > FW_SIZE_LIMIT[series]) {
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
        setStepper1({isStepActive: true, isStepCompleted: true});
        setStepper2({isStepActive: true, isStepCompleted: false});
        setFileSelect({
            file,
            fileName: filename,
            fileSize: `, ${size} ${t('mb')}`,
        });
    };

    if (!ready) return <span />;

    const headerLabel = (content) => (
        <div style={{color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.75rem'}}>
            {content}
        </div>
    );

    const Headers = [
        {
            id: 'nodeIp',
            HeaderLabel: headerLabel(t('ipaddr')),
            isSorted: true,
            sortType: 0,
            canSort: false,
        },
        {
            id: 'model',
            HeaderLabel:headerLabel(t('model')),
            isSorted: false,
            sortType: 0,
            canSort: false,
        },
        {
            id: 'version',
            HeaderLabel:  updateSuccess ? (
                <div>
                    {t('version')}
                    <Tooltip
                        title={t('fwoutdate')}
                        disableFocusListener
                        disableTouchListener
                    >
                        <i
                            className="material-icons"
                            style={{
                                position: 'relative',
                                top: '3px',
                                left: '5px',
                                fontSize: '16px',
                                color: colors.inactiveRed,
                            }}
                        >
                            error
                        </i>
                    </Tooltip>
                </div>
            ) : headerLabel(t('version')),
            isSorted: false,
            sortType: 0,
            canSort: false,
        },
        {
            id: 'results',
            HeaderLabel: headerLabel(t('results')),
            isSorted: false,
            sortType: 0,
            canSort: false,
        },
    ];
    const setupStore = devices[nodeIp];
    const nodeData = nodeInfo[nodeIp];
    const rowData = [];
    rowData.push({
        type: 'string',
        ctx: nodeIp,
    });
    rowData.push({
        type: 'string',
        ctx: setupStore && nodeData ? nodeData.model : '-',
    });
    rowData.push({
        type: 'string',
        ctx: setupStore && nodeData ? nodeData.firmwareVersion : '-',
    });
    rowData.push({
        type: 'component',
        ctx: setupStore && nodeData ? getStatusContent(setupStore, t) : (
            <div style={{fontWeight: 'bold'}} >
                -
            </div>
        ),
    });

    return (
        <div ref={fwUpgradeContainer}>
            <P2PointsToNote
                noteTitle={t('noteTitle')}
                noteCtxArr={[
                    {ctx: t('nodeFwNote1'), key: t('nodeFwNote1')},
                    {ctx: t('nodeFwNote2'), key: t('nodeFwNote2')},
                    // {ctx: this.t('nodeFwNote3'), key: this.t('nodeFwNote3')},
                    {ctx: t('nodeFwNote4'), key: t('nodeFwNote4')},
                    {ctx: t('nodeFwNote5'), key: t('nodeFwNote5')},
                ]}
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
            <P2Stepper
                stepperItemLbl={[
                    t('stepperLbl1'),
                    t('stepperLbl2'),
                    t('stepperLbl3'),
                ]}
                stepperItems={[
                    {stepLbl: t('stepperLbl1'), ...stepper1},
                    {stepLbl: t('stepperLbl2'), ...stepper2},
                    {stepLbl: t('stepperLbl3'), ...stepper3},
                ]}
                style={{
                    stepper: {padding: '12px 0px 12px 0px'},
                    fontSize: {label: 12},
                }}
            />
            <P2DevTbl
                tblHeaders={{Headers}}
                tblData={[rowData]}
                disableFooter
                disableSelect
                disableSearch
                disablePaper
            />
            <div style={{marginTop: '10px'}}>
                <P2FileUpload
                    inputId="firmware-upgrade-select"
                    selectFileHandler={selectFileHandler}
                    fileName={fileSelect.fileName}
                    disabledSelectFile={fileSelect.lock || !(setupStore && nodeData) || hasNodeUpgrading}
                    fileSize={fileSelect.fileSize}
                    placeholder={t('fwupPlaceHolder')}
                    acceptType=".bin"
                />
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={popupConfirmDialog}
                    style={{
                        float: 'right',
                        marginBottom: '20px',
                        marginTop: '15px',
                    }}
                    disabled={confirmDisable}
                >
                    {t('btnConfirm')}
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
                    {t('btnReset')}
                </Button>
            </div>
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
                nonTextContent={dialog.nonTextContent}
            />
            <FwUpgradeDialog
                t={t}
                open={fwUpgradeDialog.open}
                shouldForceReset={fwUpgradeDialog.shouldForceReset}
                checkboxContent={fwUpgradeDialog.checkboxContent}
                title={fwUpgradeDialog.title}
                warningContent={fwUpgradeDialog.warningContent}
                upgradeContent={fwUpgradeDialog.upgradeContent}
                warningContentList={fwUpgradeDialog.warningContentList}
                onCloseFn={fwUpgradeDialogOnClose}
                actionFn={handleFwUpgradeDialogActionFunc}
                cancelFn={handleFwUpgradeDialogCancelFunc}
                onCheckFn={fwUpgradeDialogOnCheck}
                checked={resetCheckbox}
                collapseFn={handleFwUpgradeDialogCollapse}
                collapseBool={fwUpgradeDialog.collapseBool}
            />
        </div>
    );
};

FWUpgradeApp.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    nodeIp: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    updateIsLock: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape({
        restartInterval: PropTypes.func.isRequired,
        stopInterval: PropTypes.func.isRequired,
    }).isRequired,
};

export default FWUpgradeApp;
