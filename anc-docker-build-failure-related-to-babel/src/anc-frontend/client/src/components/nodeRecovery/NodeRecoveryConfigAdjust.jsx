import React, {useState, useEffect, useCallback} from 'react'
import PropTypes from 'prop-types'
import {useSelector, useDispatch} from 'react-redux';
import {
    RadioGroup,
    Radio,
    FormControlLabel,
    Button,
    IconButton,
} from '@material-ui/core';
import {
    VisibilityOff,
    Visibility,
} from '@material-ui/icons';
import {saveRecoveryResult} from '../../redux/nodeRecovery/nodeRecoveryActions';
import useGetConfig from '../../util/useGetConfig';
import useGetOptions from '../../util/useGetOptions';
import {getOptionsFromGetConfigObj, isObjectEmpty} from '../../util/commonFunc';
import {Typography} from '@material-ui/core';
import useValidator from '../../util/useValidator';
import useDiscrepancy from '../../util/useDiscrepancy';
import NodeRecoveryDiscrepanciesDialog from './NodeRecoveryDiscrepanciesDialog';
import NodeRecoveryConfigAdjustBasic from './NodeRecoveryConfigAdjustBasic';
import NodeRecoveryConfigAdjustAdvance from './NodeRecoveryConfigAdjustAdvance';
import {wrapper} from '../../util/commonFunc';
import {setConfig} from '../../util/apiCall';
import Constant from '../../constants/common'
import P2Tooltip from '../common/P2Tooltip';;

const {
    colors,
    nodeRecoverySecondConfigDelay,
} = Constant;

const syncDiscrepanciesValue = (diff, discrepancies) => {
    if (isObjectEmpty(discrepancies)) {
        return diff;
    }
    const {discrepanciesValue, legacySyncValue} = discrepancies;
    const newDiff = JSON.parse(JSON.stringify(diff));
    newDiff.meshSettings = {};
    if (Object.keys(discrepanciesValue).length !== 0) {
        Object.keys(discrepanciesValue).forEach(key => {
            newDiff.meshSettings[key] = discrepanciesValue[key];
        })
    }
    if (Object.keys(legacySyncValue).length !== 0) {
        Object.keys(legacySyncValue).forEach(key => {
            newDiff.meshSettings[key] = legacySyncValue[key];
        })
    }
    return newDiff;
}

const updateConfigOfLostNodeAsDesiredDefault = ({
    lostNodeIp, lostNodeRadio, updateConfigData, nodeInfo
}) => {
    updateConfigData(draft => {
        Object.keys(draft.radioSettings[lostNodeIp][lostNodeRadio]).forEach(opt => {
            // default adjust x20 series max nbr per radio to 3 and x30 series to 6
            const isX20 = /^(x|X)2[0-9]/.test(nodeInfo[lostNodeIp].model);
            // also adjust x10 to 3
            const isX30 = /^(x|X)3[0-9]/.test(nodeInfo[lostNodeIp].model);
            // also adjust x10 to 3
            const isX10 = /^(x|X)1[0-9]/.test(nodeInfo[lostNodeIp].model);
            // adjust ax50 to 3
            const isAX50 = /^(ax|AX)5[0-9]/.test(nodeInfo[lostNodeIp].model);
            
            if (opt === 'maxNbr' && (isX20 || isX10 || isAX50)) {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 3;
            } else if (opt === 'maxNbr' && isX30) {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 6;
            }
        });
    });
}

const syncLostNodewithControlNode = ({
    configData, controlNodeIp, controlNodeRadio, lostNodeIp,
    lostNodeRadio, updateConfigData
}) => {
    updateConfigData(draft => {
        draft.profileSettings[controlNodeIp].nbr['1'].maxNbr = 'disable';
        Object.keys(draft.radioSettings[controlNodeIp][controlNodeRadio]).forEach(opt => {
            if (opt === 'txpower') {
                // hard set txpower to auto
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 'auto'
            } else if (['channel', 'channelBandwidth', 'band', 'centralFreq'].includes(opt)) {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] =
                    configData.radioSettings[controlNodeIp][controlNodeRadio][opt];
            } else if (opt === 'acl') {
                // default remove neighbor acl
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = {type: "none"}
                draft.radioSettings[controlNodeIp][controlNodeRadio][opt] = {type: "none"}
            } else if (opt === 'rssiFilterTolerance') {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 5;
            } else if (opt === 'rssiFilterLower') {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 255;
            } else if (opt === 'rssiFilterUpper') {
                draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 255;
            } else if (opt === 'operationMode') {
                switch(draft.radioSettings[controlNodeIp][controlNodeRadio][opt]) {
                    case 'mesh':
                        draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 'mesh';
                        break;
                    case 'mobile':
                        draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 'static';
                        break;
                    case 'static':
                        draft.radioSettings[lostNodeIp][lostNodeRadio][opt] = 'mobile';
                        break;
                    default:
                }
            }
        })
    })
}



const NodeRecoveryConfigAdjust = ({
    t, skip, setIsLostNodeAuth, lostNodeIp,
    handleNextFunc, handleBackFunc, getConfigLockFunc, unlockFunc,
    getOptionsLockFunc, setConfigLockFunc, handleDialogPopup, handleDialogOnClose, handleStopRecoverNode
}) => {
    const {
        nodeRecovery: {
            recoverState: {
                recoveryInfo: {
                    controlNode: {radio: controlNodeRadio},
                    lostNode: {radio: lostNodeRadio},
                }
            },
            ip: controlNodeIp,
        },
        common: {csrf},
        projectManagement: {projectId},
        meshTopology: {
            nodeInfo,
            graph:{nodes: nodeList},
        },
    } = useSelector(store => store);
    const dispatch = useDispatch();
    const [adjustType, setAdjustType] = useState('BASIC')
    const [isLostNodeSync, setIsLostNodeSync] = useState(false);
    const [isDiscrepancyDialogOpen, setIsDiscrepancyDialogOpen] = useState(false);
    const [removeNeighborAcl, setRemoveNeighborAcl] = useState(true);
    const [showPreviousConfig, setShowPreviousConfig] = useState(true);
    const [discrepancies, setDiscrepancies] = useState({});

    const allManagedNodeIp = nodeList.filter(n => n.isManaged).map(n => n.id)

    const [configData, {
        error: getConfigError, updateError: updateGetConfigError, updateConfigData, updateAction,
        diff, action, checksums, loadData, clearData}] = useGetConfig({
        nodeIp: JSON.stringify([controlNodeIp, ...lostNodeIp ? [lostNodeIp] : []]),
        lockFunc: getConfigLockFunc,
        withGetOptions: true,
        unlockFunc, skip,
    });

    const [configOptions, {
        error: getOptionsError, updateError: updateGetOptionsError, updateConfigOptions}] = useGetOptions({
        skip: skip || isObjectEmpty(configData) || !isLostNodeSync,
        options: JSON.stringify(getOptionsFromGetConfigObj(configData)),
        sourceConfig: JSON.stringify(configData),
        lockFunc: getOptionsLockFunc,
        unlockFunc, action, withGetConfig: true,
    });

    const [errorStatus] = useValidator({
        skip: skip || isObjectEmpty(configData) || !isLostNodeSync || isObjectEmpty(configOptions),
        nodeIp: JSON.stringify([controlNodeIp, ...lostNodeIp ? [lostNodeIp] : []]),
        configData: JSON.stringify(configData),
        configOptions: JSON.stringify(configOptions),
    });

    const [discrepanciesList, updateDiscrepancies] = useDiscrepancy();

    // Sync control settings with lost node Settings
    useEffect(() => {
        if (!(skip || isObjectEmpty(configData) || isLostNodeSync)) {
            console.log('kyle_debug ~ file: NodeRecoveryConfigAdjust.jsx ~ line 59 ~ useEffect ~ callSync')
            if ('discrepancies' in configData.meshSettings) {
                const discrepancies = updateDiscrepancies(configData, controlNodeIp);
                setDiscrepancies(discrepancies);
                setIsDiscrepancyDialogOpen(true)
            }
            syncLostNodewithControlNode({
                configData, controlNodeIp, controlNodeRadio, lostNodeIp,
                lostNodeRadio, updateConfigData,
            });
            setIsLostNodeSync(true)
            updateConfigOfLostNodeAsDesiredDefault({lostNodeIp, lostNodeRadio, updateConfigData, nodeInfo});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(configData), skip, isLostNodeSync, controlNodeIp,
    controlNodeRadio, lostNodeIp, lostNodeRadio, updateConfigData, updateDiscrepancies])


    useEffect(() => {
        if (getOptionsError || getConfigError) {
            handleDialogPopup(prevState => ({
                ...prevState,
                open: true,
                title: 'Get Config/Options Error',
                content: 'Something go wrong',
                actionTitle: 'OK',
                actionFn: () => {
                    updateGetConfigError(false);
                    updateGetOptionsError(false);
                    handleDialogOnClose();
                },

            }))
        }
    }, [
        getOptionsError, getConfigError, updateGetConfigError, updateGetOptionsError,
        handleDialogPopup, handleDialogOnClose,
    ])


    // initial flow:  useGetConfig -> trigger Sync useEffect -> useGetOption -> useValidator
    // config data change flow : useGetOption -> useValidator

    // console.log('kyle_debug ~ file: NodeRecoveryConfigStep.jsx ~ line 37 ~ configData', configData)
    // console.log('kyle_debug ~ file: NodeRecoveryConfigStep.jsx ~ line 49 ~ configOptions', configOptions)
    // console.log('kyle_debug ~ file: NodeRecoveryConfigAdjust.jsx ~ line 69 ~ errorStatus', errorStatus)
    // console.log('kyle_debug ~ file: NodeRecoveryConfigAdjust.jsx ~ line 22 ~ checksums', checksums)
    // console.log('kyle_debug ~ file: NodeRecoveryConfigAdjust.jsx ~ line 92 ~ discrepanciesList', discrepanciesList)

    const onSwitchChange = useCallback(
        (event) => {
            const removeAcl =  event.target.checked;
            updateAction(draft => 'UPDATE');
            updateConfigData(draft => {
                if (removeAcl) {
                    draft.radioSettings[lostNodeIp][lostNodeRadio].acl = {type: "none"}
                    draft.radioSettings[controlNodeIp][controlNodeRadio].acl = {type: "none"}
                } else {
                    draft.radioSettings[lostNodeIp][lostNodeRadio].acl =
                        loadData.radioSettings[lostNodeIp][lostNodeRadio].acl
                    draft.radioSettings[controlNodeIp][controlNodeRadio].acl =
                        loadData.radioSettings[controlNodeIp][controlNodeRadio].acl
                }
            })
            setRemoveNeighborAcl(prevState => !prevState);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            // eslint-disable-next-line react-hooks/exhaustive-deps
            updateConfigData, JSON.stringify(loadData), updateAction,
            lostNodeIp, lostNodeRadio, controlNodeIp, controlNodeRadio
        ],
    )

    const setConfigHandler = useCallback(
        (success, noBlocking) => {
            if (noBlocking) {
                dispatch(saveRecoveryResult(success))
                unlockFunc();
                // clearData()
                // updateConfigOptions(draft => {});
                // setIsLostNodeSync(false)
                // handleNextFunc();                
            } else {
                dispatch(saveRecoveryResult(success))
                unlockFunc();
                clearData()
                updateConfigOptions(draft => {});
                setIsLostNodeSync(false)
                handleNextFunc();
            }
        },
        [handleNextFunc, unlockFunc, dispatch, clearData, updateConfigOptions],
    )

    const onSubmitPress = useCallback(async () => {
        console.log('onSubmitPress');
        // return;
        setConfigLockFunc();
        handleDialogOnClose();
        if (isObjectEmpty(diff) && isObjectEmpty(discrepancies)) {
            setTimeout(() => {
                setConfigHandler(true)
            }, 5000);
        } else {
            const newDiff = syncDiscrepanciesValue(diff, discrepancies)
            console.log('onSubmitPress');
            console.log(newDiff);
            const ctrlNodeDiff = {};
            const lostNodeDiff = {};
            let shouldCtrlNodeSet = false;
            let isMeshSettings = false;
            // return;
            Object.keys(newDiff).forEach(
                (section) => {
                    if (section === 'meshSettings') {
                        // no meshSettings on ctrl node
                        // ctrlNodeDiff['meshSettings'] = newDiff['meshSettings'];
                        isMeshSettings = true;
                        lostNodeDiff['meshSettings'] = newDiff['meshSettings'];
                    }
                    if (newDiff[section][controlNodeIp]) {
                        ctrlNodeDiff[section] = {
                            [controlNodeIp]: newDiff[section][controlNodeIp],
                        }
                        shouldCtrlNodeSet = true;
                    }
                    if (newDiff[section][lostNodeIp]) {
                        lostNodeDiff[section] = {
                            [lostNodeIp]: newDiff[section][lostNodeIp],
                        }
                    }
                }
            );
            
            const controlNodeChecksum = {
                [controlNodeIp]: checksums[controlNodeIp],
            };

            const lostNodeChecksum = {
                [lostNodeIp]: checksums[lostNodeIp],
            };

            const controlNodeOnlyBodyMsg = {
                diff: ctrlNodeDiff,
                checksums: controlNodeChecksum,
                options: {
                    isResetRadio: false,
                }
            }

            const lostNodeOnlyBodyMsg = {
                diff: lostNodeDiff,
                checksums: isMeshSettings ? checksums : lostNodeChecksum,
                options: {
                    isResetRadio: false,
                }
            }

            // return;
            const bodyMsg = {
                diff: newDiff,
                checksums,
                options: {
                    isResetRadio: false,
                }
            }
            console.log('lostNodeOnlyBodyMsg');
            console.log(lostNodeOnlyBodyMsg);
            console.log('controlNodeOnlyBodyMsg');
            console.log(controlNodeOnlyBodyMsg);
            // return;
            const {data, error} = await wrapper(setConfig(csrf, projectId, lostNodeOnlyBodyMsg))
            if (error) {
                setConfigHandler(false)
            } else if (shouldCtrlNodeSet) {
                handleStopRecoverNode().catch((e) => {
                    console.log('---- stop recovery err', e);
                });
                setTimeout(
                    () => {
                        wrapper(setConfig(csrf, projectId, controlNodeOnlyBodyMsg)).then(
                            (setControlNodedata) => {
                                if (setControlNodedata.error) {
                                    setConfigHandler(false)
                                } else {
                                    setTimeout(() => {
                                        setConfigHandler(true)
                                    }, setControlNodedata.rtt * 1000);
                                }
                            }
                        );
                    }, nodeRecoverySecondConfigDelay
                );
            } else {
                setTimeout(() => {
                    setConfigHandler(true)
                }, data.rtt * 1000);
            }
        }
    }, [
        setConfigHandler, handleDialogOnClose, discrepancies,
        csrf, diff, checksums, projectId, setConfigLockFunc,
    ]);


    const clusterConfigMismatchButton = (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
        }}>
            <P2Tooltip
                direction="right"
                title={(
                    <div style={{
                        fontSize: '12px',
                        padding: '2px',
                        textAlign: 'left',
                        // width: '250px'
                    }}>
                        {t(`showPreviousConfigTooltip`)}
                    </div>
                )}
                content={(
                    <IconButton
                style={{padding: '0px 10px'}}
                onClick={() => setShowPreviousConfig(prevState => !prevState)}
            >
                {showPreviousConfig ?
                    <Visibility style={{color: colors.dataTitle}}  /> :
                    <VisibilityOff style={{color: colors.dataTitle}} />
                }
            </IconButton>)}
            />
            {(discrepanciesList.length > 0) && <P2Tooltip
                direction="right"
                title={(
                    <div style={{
                        fontSize: '12px',
                        padding: '2px',
                        textAlign: 'left',
                        width: '250px'
                    }}>
                        {t(`clusterMismatchTooltip`)}
                    </div>
                )}
                content={(
                    <IconButton
                    style={{padding: '0px 10px'}}
                    onClick={() => setIsDiscrepancyDialogOpen(true)}
                >
                    <i
                        className="material-icons"
                        style={{
                            color: colors.warningColor,
                            fontSize: '25px',
                            marginLeft: '5px',
                            marginTop: '2px',
                        }}
                    >error</i>
                </IconButton>)}
            />}
        </div>
    );

    const adjustConfigRadioGroup = (
        <RadioGroup
            id="adjustType"
            aria-label="adjustType"
            name="adjustType"
            value={adjustType}
            onChange={e => setAdjustType(e.target.value)}
            style={{
                margin: '20px 0px 20px 0px',
                display: 'flex',
                flexDirection: 'row',

            }}
        >
            <FormControlLabel
                value="BASIC"
                control={<Radio color="primary" style={{height: '36px'}} />}
                label={t('basicAdjustmentTitle')}
                style={{flexBasis: '50%', marginRight: 0}}
            />
            <FormControlLabel
                value="ADVANCED"
                control={<Radio color="primary" style={{height: '36px'}} />}
                label={`${t('adcancedAdjustmentTitle')}`}
                style={{flexBasis: '50%', marginRight: 0}}
                // disabled
            />
        </RadioGroup>
    );

    const clusterSyncWarningBeforeSetConfig = useCallback(
        () => {
            // handleDialogPopup, handleDialogOnClose,

            handleDialogPopup(prevState => ({
                ...prevState,
                open: true,
                title: t('clusterSyncWarningBeforeSetConfigTitle'),
                content: (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                        backgroundColor: colors.warningBackground,
                        padding: '12px',
                    }}
                    >
                        <i
                            className="material-icons"
                            style={{
                                fontSize: '40px',
                                paddingRight: '16px',
                                color: colors.warningColor,
                            }}
                        >error</i>
                        <span style={{
                            fontSize: 14,
                            lineHeight: '140%',
                            color: colors.warningColor,
                            fontWeight: '500',
                        }}>
                            {t('clusterSyncWarningBeforeSetConfigContent')}
                        </span>
                    </span>
                    ),
                actionTitle: t('clusterSyncWarningBeforeSetConfigActionBtn'),
                actionFn: onSubmitPress,
                cancelActTitle: t('cancel'),
                cancelActFn: handleDialogOnClose,
            }))
        },
        [handleDialogPopup, onSubmitPress, handleDialogOnClose, t],
    )

    const validationBeforeSetConfig = useCallback(
        () => {
            console.log('validationBeforeSetConfig');
            const {radioSettings} = configData;
            let isSameRadioChannel = false;

            const networkConfigTabNoLostNode = Object.keys(radioSettings[lostNodeIp]).length;
            const networkConfigTabNoControlNode = Object.keys(radioSettings[controlNodeIp]).length;
            if (networkConfigTabNoLostNode === 2
                && radioSettings[lostNodeIp].radio0.status !== 'disable'
                && radioSettings[lostNodeIp].radio1.status !== 'disable'
                && radioSettings[lostNodeIp].radio0.channel === radioSettings[lostNodeIp].radio1.channel) {
                isSameRadioChannel = true;
            } else if (networkConfigTabNoLostNode === 3 && (
                (radioSettings[lostNodeIp].radio0.status !== 'disable'
                && radioSettings[lostNodeIp].radio1.status !== 'disable'
                && radioSettings[lostNodeIp].radio0.channel === radioSettings[lostNodeIp].radio1.channel) ||
                (radioSettings[lostNodeIp].radio0.status !== 'disable'
                && radioSettings[lostNodeIp].radio2.status !== 'disable'
                && radioSettings[lostNodeIp].radio0.channel === radioSettings[lostNodeIp].radio2.channel) ||
                (radioSettings[lostNodeIp].radio1.status !== 'disable'
                && radioSettings[lostNodeIp].radio2.status !== 'disable'
                && radioSettings[lostNodeIp].radio1.channel === radioSettings[lostNodeIp].radio2.channel)
            )) {
                isSameRadioChannel = true;
            }

            if (networkConfigTabNoControlNode === 2
                && radioSettings[controlNodeIp].radio0.status !== 'disable'
                && radioSettings[controlNodeIp].radio1.status !== 'disable'
                && radioSettings[controlNodeIp].radio0.channel === radioSettings[controlNodeIp].radio1.channel) {
                isSameRadioChannel = true;
            } else if (networkConfigTabNoControlNode === 3 && (
                (radioSettings[controlNodeIp].radio0.status !== 'disable'
                && radioSettings[controlNodeIp].radio1.status !== 'disable'
                && radioSettings[controlNodeIp].radio0.channel === radioSettings[controlNodeIp].radio1.channel) ||
                (radioSettings[controlNodeIp].radio0.status !== 'disable'
                && radioSettings[controlNodeIp].radio2.status !== 'disable'
                && radioSettings[controlNodeIp].radio0.channel === radioSettings[controlNodeIp].radio2.channel) ||
                (radioSettings[controlNodeIp].radio1.status !== 'disable'
                && radioSettings[controlNodeIp].radio2.status !== 'disable'
                && radioSettings[controlNodeIp].radio1.channel === radioSettings[controlNodeIp].radio2.channel)
            )) {
                isSameRadioChannel = true;
            }


            if (isSameRadioChannel) {
                handleDialogPopup(prevState => ({
                    ...prevState,
                    open: true,
                    title: t('sameRadioWarningTitle'),
                    content: t('sameRadioWarningContent'),
                    actionTitle: 'OK',
                    actionFn: handleDialogOnClose,
                }))
            } else {
                clusterSyncWarningBeforeSetConfig()
            }
        },
        [configData, clusterSyncWarningBeforeSetConfig, t, handleDialogOnClose, handleDialogPopup, controlNodeIp, lostNodeIp],
    )

    const saveRecoveryButton = useCallback((disabled = false) => (
        <Button
            color="primary"
            variant="contained"
            onClick={validationBeforeSetConfig}
            disabled={disabled}
        >
            {t('saveRecoveryTitle')}
        </Button>
    ), [t, validationBeforeSetConfig])

    if (isObjectEmpty(configData) || isObjectEmpty(configOptions) || isObjectEmpty(errorStatus)) {
        return (
            <>
                <span>Something go wrong</span>
                <div style={{float: 'right'}} >
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            setIsLostNodeAuth('INITIALIZED')
                            handleBackFunc();
                        }}
                    >
                        Back to Step 2
                    </Button>
                </div>
            </>
        )
    } else {
        let configurationPanel = <span />;
        switch (adjustType) {
            case 'BASIC':
                configurationPanel = (
                    <NodeRecoveryConfigAdjustBasic
                        t={t}
                        configData={JSON.stringify(configData)}
                        loadData={JSON.stringify(loadData)}
                        errorStatus={JSON.stringify(errorStatus)}
                        configOptions={JSON.stringify(configOptions)}
                        lostNodeIp={lostNodeIp}
                        lostNodeRadio={lostNodeRadio}
                        updateConfigData={updateConfigData}
                        updateAction={updateAction}
                        clusterConfigMismatchButton={clusterConfigMismatchButton}
                        saveRecoveryButton={saveRecoveryButton}
                        showPreviousConfig={showPreviousConfig}
                    />
                )
                break;
            case 'ADVANCED':
                configurationPanel = (
                    <NodeRecoveryConfigAdjustAdvance
                        t={t}
                        configData={JSON.stringify(configData)}
                        loadData={JSON.stringify(loadData)}
                        errorStatus={JSON.stringify(errorStatus)}
                        configOptions={JSON.stringify(configOptions)}
                        lostNodeIp={lostNodeIp}
                        lostNodeRadio={lostNodeRadio}
                        controlNodeIp={controlNodeIp}
                        controlNodeRadio={controlNodeRadio}
                        updateConfigData={updateConfigData}
                        updateAction={updateAction}
                        clusterConfigMismatchButton={clusterConfigMismatchButton}
                        saveRecoveryButton={saveRecoveryButton}
                        onSwitchChange={onSwitchChange}
                        removeNeighborAcl={removeNeighborAcl}
                        showPreviousConfig={showPreviousConfig}
                    />
                )
                break;
            default:
                configurationPanel = <Typography>BASIC</Typography>;
        };
        return (
            <>
                <Typography
                    style={{
                        color: '#828282',
                        opacity: '0.87'
                    }}
                >
                    {t('adjustConfigTitle')}
                </Typography>
                {adjustConfigRadioGroup}
                {configurationPanel}
                <NodeRecoveryDiscrepanciesDialog
                    open={
                        isDiscrepancyDialogOpen &&
                        !isObjectEmpty(configOptions) &&
                        discrepanciesList.length > 0
                    }
                    setOpen={setIsDiscrepancyDialogOpen}
                    t={t}
                    discrepanciesList={JSON.stringify(discrepanciesList)}
                    configOptions={JSON.stringify(configOptions)}
                />
            </>
        )
    }

}

NodeRecoveryConfigAdjust.propTypes = {
    t: PropTypes.func.isRequired,
    skip: PropTypes.bool.isRequired,
    lostNodeIp: PropTypes.string.isRequired,
    handleBackFunc: PropTypes.func.isRequired,
    handleNextFunc: PropTypes.func.isRequired,
    setIsLostNodeAuth: PropTypes.func.isRequired,
    getConfigLockFunc: PropTypes.func.isRequired,
    getOptionsLockFunc: PropTypes.func.isRequired,
    setConfigLockFunc: PropTypes.func.isRequired,
    unlockFunc: PropTypes.func.isRequired,
    handleDialogPopup: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    handleStopRecoverNode: PropTypes.func.isRequired,
}

export default React.memo(NodeRecoveryConfigAdjust)
