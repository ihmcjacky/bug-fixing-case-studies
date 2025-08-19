import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import SettingsIcon from '@material-ui/icons/Settings';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Constant from '../../constants/common';
import {resetClusterInformation} from '../../redux/dashboard/dashboardActions';
import {
    closeNodeRecoveryDialog,
    resetNodeRecoveryData,
    startNodeRecovery,
    recoverNodeClosed,
    stopNodeRecovery,
    nodeRecoveryCompleted,
    clearCurrentRecoveryData,
} from '../../redux/nodeRecovery/nodeRecoveryActions';
import {
    getNodeRecoveryConfig,
    searchDisplayValue,
    nodeRecoveryErrHandler,
} from './nodeRecoveryHelperFunc';
import P2Dialog from '../../components/common/P2Dialog';
// import NodeRecoveryNote from './NodeRecoveryNote';
import NodeRecoverySettingsDialog from './NodeRecoverySettingsDialog';
import NodeRecoveryScanningStep from './NodeRecoveryScanningStep';
import NodeRecoveryRecoverStep from './NodeRecoveryRecoverStep';
import NodeRecoveryConfigStep from './NodeRecoveryConfigStep';
import NodeRecoveryCompletedStep from './NodeRecoveryCompletedStep';
import LockLayer from '../../components/common/LockLayer';
import {
    cancelScanNearbyNeighbor,
    nodeRecovery,
    cancelRecovery,
    extendRecoveryTimeout,
    updateManagedDevList,
} from '../../util/apiCall';
import Constants from '../../constants/common';
import store from '../../redux/store';

const {colors} = Constants;

const {themeObj} = Constant;
const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
    },
    wrapper: {
        backgroundColor: '#E5E5E5',
        fontFamily: 'Roboto',
        padding: 24,
    },
    cardWrapper: {
        width: 'auto',
        minHeight: 'calc(100vh - 152px)',
        overflowY: 'auto',
        padding: '20px 40px',
    },
    titleChip: {
        borderRadius: '4px',
        margin: '0 8px',
        backgroundColor: themeObj.primary.light,
        color: 'white',
        fontWeight: 'bolder',
        height: '23px',
    },
    noteGrid: {
        fontSize: 14,
        marginTop: '20px',
    },
    noteTitle: {
        marginBottom: '10px',
        fontSize: '14px',
    },
    noteItem: {
        fontWeight: 400,
        fontSize: 12,
    },
    stepperRoot: {
        padding: '24px 0px',
    },
    settingsBtn: {
        float: 'right',
    },
    stepperLabel: {
        fontSize: 16,
        position: 'relative'
    },
    stepperSubLabel: {
        position: 'absolute',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.54)',
    },
});
const useStyles = makeStyles(styles);

const StepEnum = {
    CHOOSE_TYPE: 0,
    CHOOSE_NODE: 1,
    ADJUST_CONFIG: 2,
    RECOVERY_COMPLETED: 3,
};

const NodeRecoveryDialog = () => {
    const classes = useStyles();
    const {
        common: { csrf, labels },
        projectManagement: {projectId},
        nodeRecovery: {
            ip,
            changedSecret,
            recoverState: {
                recoveryStatus,
                recoveryResult,
            },
            scanningState: {
                recoverSettings,
                scanningStatus,
            },
        },
        meshTopology: {
            graph: {nodes},
            nodeInfo: nodeInfoInStore,
        },
    } = useSelector(store => store);
    const dispatch = useDispatch();
    const timeoutRef = useRef();
    const { t: _t, ready } = useTranslation('node-recovery');
    const t = useCallback((tKey, options) => _t(tKey, {...labels, ...options}), [_t, labels]);
    const [currentStep, setCurrentStep] = useState(StepEnum.CHOOSE_TYPE);
    const [lockState, setLockState] = useState({
        loading: true,
        message: '',
    });
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [encKeyRegex, setEncKeyRegex] = useState('');
    const [radioOpts, setRadioOpts] = useState([]);
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: '',
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });
    const [recoveryBody, setRecoveryBody] = useState({});
    const [lostNodeIsManaged, setLostNodeIsManaged] = useState(false);
    const [unmanagedDevicesTemp, setUnmanagedDevicesTemp] = useState([]);
    const [extendTimeoutDialog, setExtendTimeoutDialog] = useState({
        open: false,
    });

    const nodeInfo = nodeInfoInStore[ip] || {};

    const handleStopRecoverNode = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const body = {
            controlNode: {
                nodeIp: ip,
            },
        };
        return cancelRecovery(csrf, projectId, body)
            .then(res => res)
            .catch((err) => { throw err; });
    }, [csrf, recoveryBody]);

    /**
     * component didmount function
     * get update config and check is any discrepancy, disabled radio or 4.9Ghz radio
     *
     * popup error dialog when the node is discrepancy or all radio is disabled or 4.9Ghz
     */
    const didmountFunc = () => {
        dispatch(resetClusterInformation());
        const radioSettings = {[ip]: {}};
        console.log(Constant.modelOption);
        console.log(nodeInfo.model);
        Object.keys(Constant.modelOption[nodeInfo.model].radioSettings).forEach((radio) => {
            radioSettings[ip][radio] = {};
            radioSettings[ip][radio] = Constant.modelOption[nodeInfo.model].radioSettings[radio];
        });
        getNodeRecoveryConfig(csrf, radioSettings, {nodes: [ip]}, ip).then((data) => {
            let all49 = true;
            let allDisable = true;
            let noValidRadio = true;
            const radioArr = [];
            const {meshSettings: {discrepancy}} = data.config;
            if (discrepancy && discrepancy[ip]) {
                throw new Error('nodeClusterConfigNotInSync');
            }

            setEncKeyRegex(data.encKeyRegex);

            Object.keys(data.actualValue).forEach((radio) => {
                const centralFreq = searchDisplayValue(
                    data.actualValue[radio].centralFreq,
                    data.displayValue[radio].centralFreq);
                const centeralInt = parseInt(centralFreq.replace(' MHz', ''), 10);

                const isDisabled = data.actualValue[radio].status === 'disable';
                const is49Radio = centeralInt <= 4999;

                if (isDisabled) {
                    radioArr.push({
                        key: radio,
                        disabled: 'disabled',
                    });
                } else if (is49Radio) {
                    radioArr.push({
                        key: radio,
                        disabled: 'is49GHz',
                    });
                } else {
                    if (!isDisabled) {
                        allDisable = false;
                    }
                    if (!is49Radio) {
                        all49 = false;
                    }
                    noValidRadio = false;
                    radioArr.push({
                        key: radio,
                    });
                }
            });
            if (allDisable) throw new Error('allDisabled');
            if (all49) throw new Error('all49GHz');
            if (noValidRadio) throw new Error('noValidRadio');

            setRadioOpts(radioArr);
            setLockState({
                loading: false,
                message: '',
            });
        }).catch((e) => {
            console.log('node recovery get config error', e);
            setLockState({
                loading: false,
                message: '',
            });
            let title = t('getConfigFailTitle');
            let content = t('getConfigFailContent');
            if (e?.message === 'all49Ghz') {
                title = t('all49GhzTitle');
                content = t('all49GhzContent');
            } else if (e?.message === 'allDisabled') {
                title = t('allDisabledTitle');
                content = t('allDisabledContent');
            } else if (e?.message === 'nodeClusterConfigNotInSync') {
                title = t('configNotInSyncTitle');
                content = t('configNotInSyncContent');
            } else if (e?.message === 'noValidRadio') {
                title = t('noValidRadioTitle');
                content = t('noValidRadioContent');
            }
            setDialog({
                ...dialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionFn: () => { dispatch(closeNodeRecoveryDialog()); },
            });
        });
        return () => {
            if (timeoutRef.current) {
                console.log('----handleStopRecoverNode, didmountFunc');
                handleStopRecoverNode().catch((e) => {
                    console.log('---- stop recovery err', e);
                });
            }
            dispatch(resetNodeRecoveryData());
        };
    };
    useEffect(didmountFunc, []);

    const handleUnreachableNodeInfo = useCallback((list) => {
        const body = {
            del: [...unmanagedDevicesTemp, ...list],
        };
        updateManagedDevList(csrf, projectId, body).catch((e) => {
            console.log('---- node recovery unmount remove managedDevList err', e);
        });

        setUnmanagedDevicesTemp([...unmanagedDevicesTemp, ...list]);
    }, [setUnmanagedDevicesTemp, unmanagedDevicesTemp, csrf, projectId]);

    const handleRecoveryResult = () => {
        if (recoveryStatus === 'error' || recoveryStatus === 'closed' || recoveryStatus === 'completed') {
            console.log('----handleStopRecoverNode, handleRecoveryResult');
            handleStopRecoverNode().catch((e) => {
                console.log('---- stop recovery', e);
            });
            if (currentStep !== StepEnum.CHOOSE_NODE && recoveryStatus === 'error') {
                setDialog({
                    ...dialog,
                    open: true,
                    title: t('extendRecoverNodeErrorTitle'),
                    content: t('extendRecoverNodeErrorContent'),
                    actionTitle: t('ok'),
                    actionFn: () => { dispatch(closeNodeRecoveryDialog()); },
                });
            }
        }
    };
    useEffect(handleRecoveryResult, [recoveryResult, recoveryStatus]);

    const handleRecoveryTimeout = useCallback(() => {
        setExtendTimeoutDialog({open: true});
    }, [setExtendTimeoutDialog]);

    const handleRecoveryTimeoutDialogOnClose = useCallback(() => {
        setExtendTimeoutDialog({open: false});
    }, [setExtendTimeoutDialog]);

    const handleDialogOnClose = useCallback(() => {
        setDialog((prevState) => ({...prevState, open: false}));
    }, []);

    const handleNodeRecoveryCompleted = useCallback(() => {
        dispatch(nodeRecoveryCompleted());
    }, [dispatch]);

    const NodeRecoveryConfigStepNextFunc = useCallback(() => {
        handleNodeRecoveryCompleted();
        setCurrentStep(StepEnum.RECOVERY_COMPLETED);
    }, [handleNodeRecoveryCompleted])

    const NodeRecoveryConfigStepBackFunc= useCallback(() => {
            console.log('----handleStopRecoverNode, NodeRecoveryConfigStepBackFunc');
            handleStopRecoverNode().then(() => {
                dispatch(stopNodeRecovery());
                setCurrentStep(StepEnum.CHOOSE_NODE);
            }).catch((err) => {
                console.log('---- stop err, should not be here', err);
            });
        },
        [dispatch, handleStopRecoverNode],
    )

    const restartRecovery = useCallback(() => {
        dispatch(resetNodeRecoveryData(true));
        setCurrentStep(StepEnum.CHOOSE_TYPE);
    }, []);

    if (!ready) return <span />;


    const handleClose = () => {
        let content;
        if (changedSecret) {
            content = (
                <span>
                    {t('closeDialogChangedSecretWarningContent')}
                    <br />
                    <br />
                    {t('closeDialogWarningContent')}
                </span>
            );
        } else {
            content = (
                <span>
                    {t('closeDialogWarningContent')}
                </span>
            );
        }
        setDialog({
            ...dialog,
            open: true,
            title: t('closeDialogWarningTitle'),
            content,
            actionTitle: t('ok'),
            actionFn: () => {
                handleDialogOnClose();
                if (scanningStatus === 'scanning') {
                    const body = {
                        node: ip,
                        radio: recoverSettings.controlNodeRadio,
                    };
                    cancelScanNearbyNeighbor(csrf, projectId, body).catch((e) => {
                        console.log('---- cancel scan unmount err', e);
                    });
                } else if (currentStep === StepEnum.RECOVERY_COMPLETED) {
                    const body = {
                        add: unmanagedDevicesTemp,
                    };
                    updateManagedDevList(csrf, projectId, body).catch((e) => {
                        console.log('---- node recovery unmount remove managedDevList err', e);
                    });

                } else if (currentStep === StepEnum.ADJUST_CONFIG) {
                    const body = {
                        del: lostNodeIsManaged ? [] : [recoveryResult.info.nodeIp],
                        add: unmanagedDevicesTemp,
                    };
                    updateManagedDevList(csrf, projectId, body).catch((e) => {
                        console.log('---- node recovery unmount remove managedDevList err', e);
                    });
                }
                dispatch(closeNodeRecoveryDialog());
            },
            cancelActTitle: t('cancel'),
            cancelActFn: handleDialogOnClose,
        });
    };

    const handleSettingsDialogOpen = () => {
        setSettingsDialogOpen(true);
    };

    const handlePopoverClose = () => {
        setSettingsDialogOpen(false);
    };

    const handleExtendRecoveryTimeout = (body) => {
        if (!store.getState().nodeRecovery.settings.resumeWhenTimeout) {
            dispatch(clearCurrentRecoveryData());
            handleRecoveryTimeout();
            return;
        }
        extendRecoveryTimeout(csrf, projectId, body).then(() => {
            timeoutRef.current = setTimeout(() => {
                const timeoutBody = {
                    controlNode: {
                        nodeIp: ip,
                    },
                };
                handleExtendRecoveryTimeout(timeoutBody);
            }, 55000);
        }).catch((err) => {
            dispatch(stopNodeRecovery());
            const {title, content} = nodeRecoveryErrHandler(err?.data?.data[0], t, true);

            setDialog((prevDialog) => ({
                ...prevDialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                    setLockState({
                        loading: false,
                        message: '',
                    });
                    setCurrentStep(StepEnum.CHOOSE_NODE);
                },
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            }));
        });;
    };

    const handleRecoverNodeApiCall = (body, firstTime = false) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        return nodeRecovery(csrf, projectId, body).then((res) => {
            if (firstTime) {
                dispatch(startNodeRecovery({
                    controlNode: body.controlNode,
                    lostNode: body.neighborInfo,
                }));
            }
            timeoutRef.current = setTimeout(() => {
                const timeoutBody = {
                    controlNode: {
                        nodeIp: ip,
                    },
                };
                handleExtendRecoveryTimeout(timeoutBody);
            }, 55000);
            return res;
        }).catch((err) => {
            const {title, content} = nodeRecoveryErrHandler(err.data.data[0], t);
            setDialog((prevDialog) => ({
                ...prevDialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            }));
            throw err;
        });
    }

    const handleStartRecoverNode = (body) => {
        setLostNodeIsManaged(false);
        setRecoveryBody(body);
        const lostNodeMac = body.neighborInfo.mac;
        const lostNodeIp = Object.keys(nodeInfoInStore).find((ip) => {
            console.log(nodeInfoInStore[ip]);
            return nodeInfoInStore[ip].mac === lostNodeMac;
        });
        if (lostNodeIp) {
            nodes.some((node) => {
                if (node.id === lostNodeIp) {
                    if (node.isManaged) {
                        setLostNodeIsManaged(true);
                    }
                    return true;
                }
                return false
            })
        }
        console.log(lostNodeIp)
        return handleRecoverNodeApiCall(body, true);
    };

    const handleUpdateTopologyFailed = () => {
        const body = {
            del: lostNodeIsManaged ? [] : [recoveryResult.info.nodeIp],
            add: unmanagedDevicesTemp,
        };
        updateManagedDevList(csrf, projectId, body).catch((e) => {
            console.log('---- node recovery unmount remove managedDevList err', e);
        });
        dispatch(stopNodeRecovery());
        console.log('----handleStopRecoverNode, handleStartRecoverNode');
        handleStopRecoverNode().catch((e) => {
            console.log(e);
        });
        setDialog((prevState) => ({
            ...prevState,
            open: true,
            title: t('updateTopologyFailedTitle'),
            content: t('updateTopologyFailedContent'),
            actionTitle: t('ok'),
            actionFn: () => {
                handleDialogOnClose();
                setCurrentStep(StepEnum.CHOOSE_NODE);
            },
            cancelActTitle: '',
            cancelActFn: handleDialogOnClose,
        }));
    };

    const steps = [
        {
            key: 'choose_type',
            label: t('chooseTypeLabel'),
            subLabel: t('chooseTypeSubLabel'),
            component: (
                <NodeRecoveryScanningStep
                    t={t}
                    handleLockLayerUpdate={setLockState}
                    handleNextFunc={() => {
                        setCurrentStep(StepEnum.CHOOSE_NODE);
                    }}
                    handleSetDialog={setDialog}
                    handleDialogOnClose={handleDialogOnClose}
                    radioOpts={radioOpts}
                />
            )
        },
        {
            key: 'choose_node',
            label: t('chooseNodeLabel'),
            subLabel: t('chooseNodeSubLabel'),
            component: (
                <NodeRecoveryRecoverStep
                    t={t}
                    encKeyRegex={encKeyRegex}
                    handleLockLayerUpdate={setLockState}
                    handleStartRecoverNode={handleStartRecoverNode}
                    handleUpdateTopologyFailed={handleUpdateTopologyFailed}
                    handleUnreachableNodeInfo={handleUnreachableNodeInfo}
                    handleDialogPopup={setDialog}
                    handleDialogOnClose={handleDialogOnClose}
                    setUnmanagedDevicesTemp={setUnmanagedDevicesTemp}
                    handleBackFunc={() => {
                        setCurrentStep(StepEnum.CHOOSE_TYPE);
                    }}
                    handleNextFunc={() => {
                        setCurrentStep(StepEnum.ADJUST_CONFIG)
                    }}
                />
            )
        },
        {
            key: 'adjust_config',
            label: t('adjustConfigLabel'),
            subLabel: t('adjustConfigSubLabel'),
            component: (
                <NodeRecoveryConfigStep
                    t={t}
                    skip={currentStep !== StepEnum.ADJUST_CONFIG}
                    handleLockLayerUpdate={setLockState}
                    handleDialogPopup={setDialog}
                    handleUnreachableNodeInfo={handleUnreachableNodeInfo}
                    handleUpdateTopologyFailed={handleUpdateTopologyFailed}
                    handleDialogOnClose={handleDialogOnClose}
                    handleBackFunc={NodeRecoveryConfigStepBackFunc}
                    handleNextFunc={NodeRecoveryConfigStepNextFunc}
                    handleStopRecoverNode={handleStopRecoverNode}
                />
            )
        },
        {
            key:  'recovery_Completed',
            label: t('recoveryCompletedLabel'),
            subLabel: t('recoveryCompletedSubLabel'),
            component: (
                <NodeRecoveryCompletedStep
                    t={t}
                    restartRecovery={restartRecovery}
                    handleReturnTopology={handleClose}
                />
            )
        }
    ];

    return (
        <>
            <AppBar className={classes.appBar} position="fixed" >
                <Toolbar>
                    <IconButton
                        edge="start"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {`${nodeInfo.hostname} - ${t('nodeRecoveryTitle')}`}
                    </Typography>
                </Toolbar>
            </AppBar>
            <DialogContent className={classes.wrapper}>
                <Card
                    classes={{root: classes.cardWrapper}}
                    elevation={0}
                >
                    {/* <NodeRecoveryNote t={t} /> */}
                    <div className={classes.settingsBtn}>
                        <IconButton onClick={handleSettingsDialogOpen} >
                            <SettingsIcon />
                        </IconButton>
                    </div>
                    <Stepper
                        orientation="vertical"
                        activeStep={currentStep}
                        classes={{root: classes.stepperRoot}}
                    >
                        {steps.map((step, index) => (
                            <Step key={step.key}>
                                <StepLabel classes={{label: classes.stepperLabel}}>
                                    {step.label}
                                    <br />
                                    {currentStep !== index ? (
                                        <span className={classes.stepperSubLabel} >
                                            {step.subLabel}
                                        </span>
                                    ) : <span />}
                                </StepLabel>
                                <StepContent>
                                    {step.component}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Card>
                <Dialog open={settingsDialogOpen} onClose={handlePopoverClose} >
                    <NodeRecoverySettingsDialog
                        t={t}
                        closeDialog={handlePopoverClose}
                    />
                </Dialog>
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
                <P2Dialog
                    open={extendTimeoutDialog.open}
                    handleClose={handleRecoveryTimeoutDialogOnClose}
                    title={t('recoveryTimeoutDialogTitle')}
                    content=""
                    nonTextContent={
                        <Typography style={{color: colors.dialogText}}>
                            {t('recoveryTimeoutDialogContent')}
                            <SettingsIcon style={{fontSize: '1rem', marginBottom: '-2px'}} />
                        </Typography>
                    }
                    actionTitle={t('backToStep1')}
                    actionFn={() => {
                        setExtendTimeoutDialog({open: false});
                        setCurrentStep(StepEnum.CHOOSE_TYPE);
                    }}
                />
                <LockLayer
                    zIndex={1150}
                    display={lockState.loading}
                    message={lockState.message}
                />
            </DialogContent>
        </>
    );
};

export default NodeRecoveryDialog;
