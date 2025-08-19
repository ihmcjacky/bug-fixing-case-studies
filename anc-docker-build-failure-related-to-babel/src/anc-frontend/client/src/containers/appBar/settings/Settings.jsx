import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie';
import moment from 'moment';
import ArrowBackIOS from '@material-ui/icons/ArrowBackIos';
import SettingsIcon from '@material-ui/icons/Settings';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import P2Tooltip from '../../../components/common/P2Tooltip';
import P2Dialog from '../../../components/common/P2Dialog';
import AccountBox from './AccountBox';
import AdvancedBox from './AdvancedBox';
import AppearancesBox from './AppearancesBox';
import Pollingbox from './PollingBox';
import InternalSettingsBox from './InternalSettingsBox';
import AccountSettingsCard from './AccountSettingsCard';
import FwDowngradeDialog from './FwDowngradeDialog';
import LockLayer from '../../../components/common/LockLayer';
import {closeSettingsDialog, changeMeshView} from '../../../redux/common/commonActions';
import {
    setUiProjectSettingsItem,
    syncProjectUiSettings,
} from '../../../redux/uiProjectSettings/uiProjectSettingsActions';
import {
    setUiSettingsItem,
    syncUiSettings,
} from '../../../redux/uiSettings/uiSettingsActions';
import {
    updateInternalSettings,
    updateInternalSettingsFromDB,
    syncInternalSettings
} from '../../../redux/internalSettings/internalSettingsActions';
import useWindowOnChange from '../../../components/common/useWindowOnChange';
import CommonConstants from '../../../constants/common';
import {
    updateUserPassword,
    logoutAnm,
    setNtpServer,
    setLanguage,
} from '../../../util/apiCall';
import {changeLang as changeLangi18nFunc} from '../../../I18n';
import {setLang} from '../../../redux/common/commonActions';
import {useHistory} from 'react-router-dom';

const {colors, zIndexLevel} = CommonConstants;

let timeInterval = null;

const Settings = ({t}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const {width} = useWindowOnChange();
    const {
        csrf,
        anm: {username},
        lang,
        labels
    } = useSelector(store => store.common);
    const {
        ntpServerLastSyncTime,
        pollingIntervalOnTopologyView,
        pollingIntervalOnDashboardView,
    } = useSelector(store => store.uiProjectSettings);
    const {
        landingView,
        enableFwDowngrade,
        rssiColor: {
            enable,
            color: {max, min},
        },
        pixiSettings: pixiSettingsOnStore,
        needInitialSetup,
    } = useSelector(store => store.uiSettings);
    const {
        graph: {nodes},
        nodeInfo,
    } = useSelector(store => store.meshTopology);
    const {projectId} = useSelector(store => store.projectManagement)
    const {
        interval
    } = useSelector(store => store.polling);
    const {
        settingsValue: internalSettingsOnStore,
    } = useSelector(store => store.internalSettings);

    const [internalSettings, setInternalSettings] = useState(internalSettingsOnStore);
    const [newIntervalOnTopologyView, setNewIntervalOnTopologyView] = useState(pollingIntervalOnTopologyView);
    const [newIntervalOnDashboardView, setNewIntervalOnDashboardView] = useState(pollingIntervalOnDashboardView);
    const [lock, setLock] = useState(false);
    const [changeLang, setChangelang] = useState(lang);
    const [changelandingView, setChangeLandingView] = useState(landingView);
    const [changeRssiColor, setChangeRssiColor] = useState({
        range: [min, max],
        enable,
    });
    const [pixiSettings, setPixiSettings] = useState(pixiSettingsOnStore);

    const [accountCardState, setAccountCardState] = useState({
        open: false,
        currentPassword: '',
        newPassword: '',
        hasChanged: false,
        ableToSend: false,
        reset: 0,
    });
    const [enableDowngrade, setEnableDowngrade] = useState({
        enable: enableFwDowngrade,
        dialogOpen: false,
    });
    const [ntpServerState, setNtpServerState] = useState({
        hasChanged: false,
        support: false,
        timeDiff: '---',
        resetIpInput: 0,
    });
    const [dialogState, setDialogState] = useState({
        open: false,
        title: '',
        content: '',
        nooTextContent: <span />,
        actionTitle: '',
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });

    useEffect(
        () => {
            setChangelang(lang);
        }, [lang]
    );

    const getUpdateTimeDiff = () => {
        let timeDiff = '---';
        if (ntpServerLastSyncTime !== '---') {
            const currentTime = moment();
            const lastSyncTime = moment(ntpServerLastSyncTime);
            const secDiff = currentTime.diff(lastSyncTime, 'seconds');
            if (secDiff < 60) {
                timeDiff = t('justNow');
            } else {
                const minDiff = currentTime.diff(lastSyncTime, 'minutes');
                if (minDiff < 60) {
                    timeDiff = `${minDiff} ${t('timeDiffUnitMinute')}`;
                } else {
                    const hourDiff = currentTime.diff(lastSyncTime, 'hours');
                    if (hourDiff < 24) {
                        timeDiff = `${hourDiff} ${t('timeDiffUnitHour')}`;
                    } else {
                        timeDiff = `${currentTime.diff(lastSyncTime, 'days')} ${t('timeDiffUnitDay')}`;
                    }
                }
            }
        }
        return timeDiff;
    };

    /**
     * Checker func when setting dialog open
     * check the fw version that support ntp server for render ntp server box and start interval
     */
    const checkingOnOpen = () => {
        const hostNode = nodes.find((node) => node.isHostNode);
        let support = false;
        if (hostNode && nodeInfo[hostNode.id]) {
            const {firmwareVersion} = nodeInfo[hostNode.id];
            const verArr = firmwareVersion.replace('v', '').split('.')
                .map(num => parseInt(num, 10));
            if (verArr[0] > 1 || verArr[1] > 4 || (verArr[1] === 4 && verArr[2] >= 92)) {
                support = true;
            }
        }
        if (support) {
            setNtpServerState({
                ...ntpServerState,
                timeDiff: getUpdateTimeDiff(),
                support,
            });
            timeInterval = setInterval(() => {
                setNtpServerState({
                    ...ntpServerState,
                    timeDiff: getUpdateTimeDiff(),
                    support,
                });
            }, 60000);
        } else {
            setNtpServerState({
                ...ntpServerState,
                timeDiff: '---',
                support: false,
            });
        }

        //retrieve internal settings and save to store
        dispatch(updateInternalSettingsFromDB());
        return () => {
            clearInterval(timeInterval);
            timeInterval = null;
        }
    }
    useEffect(checkingOnOpen, []);

    useEffect(() => {
        console.log('internalSettingsOnStore change', internalSettingsOnStore)
        setInternalSettings(internalSettingsOnStore);
    }, [internalSettingsOnStore]);

    const accountBoxRef = document.getElementById('AccountSettingCard');

    const settingsNotChange = accountCardState.open ?
        (accountCardState.open && !accountCardState.ableToSend) :
        (
            changeLang === lang &&
            changelandingView === landingView &&
            ((enable === changeRssiColor.enable || (enable &&
                (changeRssiColor.range[0] === max && changeRssiColor.range[1] === min))) &&
            !ntpServerState.hasChanged &&
            enableDowngrade.enable === enableFwDowngrade
        )
    );

    const isPixiSettingsChanged = (oldState, newState) => {
        return (
            oldState.performanceMode !== newState.performanceMode ||
            oldState.antialias !== newState.antialias ||
            oldState.resolution !== newState.resolution ||
            oldState.maxFPS !== newState.maxFPS ||
            oldState.minFPS !== newState.minFPS ||
            oldState.clearBeforeRender !== newState.clearBeforeRender ||
            oldState.preference !== newState.preference
        );
    };

    const isInternalSettingsChanged = (oldState, newState) => {
        // Loop through all the keys in the new state
        for (let key of Object.keys(newState)) {
            // Check if the old state has the same key
            if (oldState.hasOwnProperty(key)) {
                // Handle case where the value is an object (with intervals)
                if (typeof newState[key].value === 'object' && newState[key].value !== null) {
                    if (
                        newState[key].value.interval_for_last_run_success !== oldState[key].value.interval_for_last_run_success ||
                        newState[key].value.interval_for_last_run_fail !== oldState[key].value.interval_for_last_run_fail
                    ) {
                        return true;
                    }
                } else {
                    // Handle case where the value is not an object (e.g., NODE_LOGIN_QUEUE_SIZE)
                    if (newState[key].value !== oldState[key].value) {
                        return true;
                    }
                }
            } else {
                // If the key doesn't exist in the old state, it's considered a change
                return true;
            }
        }
        // If no relevant values have changed, return false
        return false;
    };

    const isIntervalSettingsValid = (state) => {
        // Loop through all the keys in the state
        for (let key of Object.keys(state)) {
            const value = state[key].value;
    
            // Check if 'value' is an object with interval fields
            if (typeof value === 'object' && value !== null) {
                const { interval_for_last_run_success, interval_for_last_run_fail } = value;
    
                // Check if 'interval_for_last_run_success' is out of the valid range
                if (interval_for_last_run_success < 1 || interval_for_last_run_success > 300) {
                    return false;
                }
    
                // Check if 'interval_for_last_run_fail' is out of the valid range
                if (interval_for_last_run_fail < 1 || interval_for_last_run_fail > 300) {
                    return false;
                }
            } else {
                // Check if 'value' is a standalone number (e.g., NODE_LOGIN_QUEUE_SIZE)
                if (key === 'NODE_LOGIN_QUEUE_SIZE' && (value < 2 || value > 300)) {
                    return false;
                }
            }
        }
        // If all values are within the range, return true
        return true;
    };

    const saveEnable = accountCardState.open ?
        (accountCardState.open && accountCardState.ableToSend) :
        (
            changeLang !== lang ||
            changelandingView !== landingView ||
            enable !== changeRssiColor.enable ||
            (
                changeRssiColor.enable && (changeRssiColor.range[0] !== min || changeRssiColor.range[1] !== max)
            ) ||
            enableDowngrade.enable !== enableFwDowngrade ||
            newIntervalOnTopologyView !== pollingIntervalOnTopologyView ||
            newIntervalOnDashboardView !== pollingIntervalOnDashboardView ||
            (isIntervalSettingsValid(internalSettings) && isInternalSettingsChanged(internalSettings, internalSettingsOnStore)) ||
            isPixiSettingsChanged(pixiSettingsOnStore, pixiSettings) ||
            needInitialSetup
        );

    const resetAllState = () => {
        setDialogState({
            ...dialogState,
            open: false,
        });
        setAccountCardState({
            ...accountCardState,
            open: false,
            reset: accountCardState.reset + 1,
        });
        setChangeLandingView(landingView);
        setChangelang(lang);
        setChangeRssiColor({
            range: [min, max],
            enable,
        });
        setEnableDowngrade({
            ...enableDowngrade,
            enable: enableFwDowngrade,
        });
        setNtpServerState({
            ...ntpServerState,
            hasChanged: false,
            resetIpInput: ntpServerState.resetIpInput + 1,
        });
        setNewIntervalOnTopologyView(pollingIntervalOnTopologyView);
        setNewIntervalOnDashboardView(pollingIntervalOnDashboardView);
        setPixiSettings(pixiSettingsOnStore);
    };

    const handleClose = () => {
        if (!settingsNotChange) {
            setDialogState({
                ...dialogState,
                open: true,
                title: t('quitDialogTittle'),
                content: t('quitDialogContent'),
                nonTextContent: <span />,
                actionTitle: t('ok'),
                actionFn: () => {
                    resetAllState();
                    dispatch(closeSettingsDialog());
                },
                cancelActTitle: t('cancel'),
                cancelActFn: () => {
                    setDialogState((prevState) => ({
                        ...prevState,
                        open: false,
                    }));
                },
            });
        } else {
            resetAllState();
            dispatch(closeSettingsDialog());
        }
    };

    const handleSettingsOnSave = (_reload) => {
        let reload = _reload;
        let updatedUiSettings = false;
        let updatedUiProjectSettings = false;

        if (needInitialSetup) {
            dispatch(setUiSettingsItem('needInitialSetup', false));
            updatedUiSettings = true;
        }

        if (changelandingView !== landingView) {
            dispatch(setUiSettingsItem('landingView', changelandingView));
            if (projectId === '') {
                dispatch(changeMeshView(changelandingView));
            }
            updatedUiSettings = true;
        }
        if (changeRssiColor.enable !== enable ||
            (changeRssiColor.enable &&
                (changeRssiColor.range[0] !== min || changeRssiColor.range[1] !== max))) {
            const updateData = {
                enable: changeRssiColor.enable,
                color: {
                    max: changeRssiColor.range[1],
                    min: changeRssiColor.range[0],
                },
            };
            dispatch(setUiSettingsItem('rssiColor', updateData));
            updatedUiSettings = true;
        }
        if (isPixiSettingsChanged(pixiSettingsOnStore, pixiSettings)) {
            dispatch(setUiSettingsItem('pixiSettings', pixiSettings));
            updatedUiSettings = true;
            reload = true;
        }
        if (enableDowngrade.enable !== enableFwDowngrade) {
            dispatch(setUiSettingsItem('enableFwDowngrade', enableDowngrade.enable));
            updatedUiSettings = true;
        }
        if (newIntervalOnTopologyView !== pollingIntervalOnTopologyView) {
            dispatch(setUiProjectSettingsItem('pollingIntervalOnTopologyView', newIntervalOnTopologyView));
            updatedUiProjectSettings = true;
        }
        if (newIntervalOnDashboardView !== pollingIntervalOnDashboardView) {
            dispatch(setUiProjectSettingsItem('pollingIntervalOnDashboardView', newIntervalOnDashboardView));
            updatedUiProjectSettings = true;
        }

        if (updatedUiSettings) {
            dispatch(syncUiSettings());
        }
        if (updatedUiProjectSettings) {
            dispatch(syncProjectUiSettings());
        }
        if (isInternalSettingsChanged(internalSettings, internalSettingsOnStore)) {
            dispatch(updateInternalSettings(internalSettings));
            dispatch(syncInternalSettings());
        }
        if (reload) {
            // window.location.reload();
            // window.nw.Window.get().reload();
            window.location.assign(`${window.location.origin}/index.html`);
        } else {
            dispatch(closeSettingsDialog());
        }
    };

    const handleSaveOnClick = () => {
        if (accountCardState.open) {
            const body = new FormData();
            body.append('username', username);
            body.append('currentPassword', accountCardState.currentPassword);
            body.append('updatePassword', accountCardState.newPassword);
            updateUserPassword(csrf, body).then(() => {
                setDialogState({
                    ...dialogState,
                    open: true,
                    title: t('saveSuccessTittle'),
                    content: t('saveSuccessContent'),
                    nonTextContent: <span />,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        logoutAnm(csrf, true).then(() => {
                            Cookies.remove('projectId');
                            Cookies.remove('quickStagingLoginRequest');
                            history.push('/login');

                            // window.location.reload();
                            // window.nw.Window.get().reloadIgnoringCache();
                            // window.location.assign(`${window.location.origin}/index.html/login`);
                        }).catch(() => {
                            Cookies.remove('projectId');
                            Cookies.remove('quickStagingLoginRequest');
                            // window.location.reload();
                            // window.nw.Window.get().reloadIgnoringCache();
                            history.push('/login');
                            window.location.assign(`${window.location.origin}/index.html`);
                        });
                    },
                    cancelActTitle: '',
                    cancelActFn: () => {},
                });
            }).catch((err) => {
                let title = t('saveFailTittle');
                let content = t('saveFailContent');
                if (err.data.data) {
                    const errType = err.data.data[0].type;
                    if (errType === 'updateuser.updatepassworderror') {
                        content = t('wrongCurrentPwd');
                    } else if (errType === 'timelimitreached') {
                        title = t('timelimitreachedErrTitle');
                        content = t('timelimitreachedeErrContent');
                    }
                }
                setDialogState({
                    ...dialogState,
                    open: true,
                    title,
                    content,
                    nonTextContent: <span />,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        setDialogState((prevstate) => ({
                            ...prevstate,
                            open: false,
                        }));
                    },
                    cancelActTitle: '',
                    cancelActFn: () => {},
                });
            });
        } else {
            if (changeLang !== lang) {
                setDialogState({
                    ...dialogState,
                    open: true,
                    title: t('changeLangDialogTittle'),
                    content: t('changeLangDialogContent', labels),
                    nonTextContent: <span />,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        setLanguage(csrf, {language: changeLang}).then(() => {
                            changeLangi18nFunc(changeLang);
                            dispatch(setLang(changeLang));
                            handleSettingsOnSave(false);
                        });
                    },
                    cancelActTitle: '',
                    cancelActFn: handleDialogOnClose,
                });

            } else {
                handleSettingsOnSave();
            }
        }
    };

    const handlePixiSettingsOnChange = (key, value) => {
        if (key === 'performanceMode' && value !== 'custom') {
            var profile = CommonConstants.pixiSettingsProfile[value];
            if (profile) {
                setPixiSettings({
                    ...pixiSettings,
                    ...profile,
                    performanceMode: value,
                });
                return;
            }
        }
        setPixiSettings({
            ...pixiSettings,
            [key]: value,
        });
    };

    const setUpTimeUpdateInterval = () => {
        timeInterval = setInterval(() => {
            setNtpServerState({
                ...ntpServerState,
                timeDiff: getUpdateTimeDiff(),
            });
        }, 60000);
    };

    const handleDialogOnClose = () => {
        setDialogState((prevState) => ({
            ...prevState,
            open: false,
        }));
    };

    const handleLangOnChange = (e) => {
        const langValue = e.target.value;
        setChangelang(langValue);
    };

    const handleLandingViewOnChange = (e) => {
        const landingValue = e.target.value;
        setChangeLandingView(landingValue);
    };

    const handleSliderEnableOnChange = () => {
        if (changeRssiColor.enable) {
            setChangeRssiColor({
                range: [min, max],
                enable: !changeRssiColor.enable,
            });
        } else {
            setChangeRssiColor({
                ...changeRssiColor,
                enable: !changeRssiColor.enable,
            });
        }
    };

    const handleSliderOnChange = (newValue) => {
        setChangeRssiColor({
            ...changeRssiColor,
            range: [
                Math.min(...newValue),
                Math.max(...newValue),
            ],
        });
    }

    const handleAccountSettingsCardClose = () => {
        if (accountCardState.hasChanged) {
            setDialogState({
                ...dialogState,
                open: true,
                title: t('quitDialogTittle'),
                content: t('quitDialogContent'),
                nonTextContent: <span />,
                actionTitle: t('ok'),
                actionFn: () => {
                    setAccountCardState({
                        ...accountCardState,
                        reset: accountCardState.reset + 1,
                        open: false,
                    });
                    handleDialogOnClose();
                },
                cancelActTitle: t('cancel'),
                cancelActFn: handleDialogOnClose,
            });
        } else {
            setAccountCardState({
                ...accountCardState,
                open: false,
                reset: accountCardState.reset + 1,
            });
        }
    };

    const handleAccountSettingsCardCallback = (update) => {
        setAccountCardState({
            ...accountCardState,
            ...update,
        });
    };

    const handleEnableDowngradeOnCheck = () => {
        if (!enableDowngrade.enable) {
            setEnableDowngrade({
                ...enableDowngrade,
                dialogOpen: true,
            });
        } else {
            setEnableDowngrade({
                ...enableDowngrade,
                enable: !enableDowngrade.enable,
            });
        }
    };

    const handleAllowDowngrade = () => {
        setEnableDowngrade({
            ...enableDowngrade,
            dialogOpen: false,
            enable: true,
        });
    };

    const handleDowngradeOnClose = () => {
        setEnableDowngrade({
            ...enableDowngrade,
            dialogOpen: false,
            enable: false,
        });
    };

    const ipInputCallback = (hasChanged) => {
        setNtpServerState({
            ...ntpServerState,
            hasChanged,
        });
    };

    const hanldeSetNtpServer = (ip) => {
        setLock(true);
        setNtpServer(csrf, {serverIp: ip}, projectId).then(() => {
            const currentTime = moment().format();
            dispatch(setUiProjectSettingsItem('ntpServerLastSyncTime', currentTime));
            dispatch(syncProjectUiSettings());
            clearInterval(timeInterval);
            setUpTimeUpdateInterval();
            setNtpServerState({
                ...ntpServerState,
                timeDiff: t('justNow'),
                hasChanged: false,
                resetIpInput: ntpServerState.resetIpInput + 1,
            });
            setDialogState({
                ...dialogState,
                open: true,
                title: t('syncTimeSuccessTitle'),
                content: t('syncTimeSuccessContent'),
                nonTextContent: <span />,
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            });
            setLock(false);
        }).catch(() => {
            setLock(false);
            setDialogState({
                ...dialogState,
                open: true,
                title: t('syncTimeFailedTitle'),
                content: t('syncTimeFailedContent'),
                nonTextContent: <span />,
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            });
        });
    };

    const handleNtpServerOnClick = (ip) => {
        if (getUpdateTimeDiff() === t('justNow')) {
            setDialogState({
                ...dialogState,
                open: true,
                title: t('syncTimeCooldownTitle'),
                content: t('syncTimeCooldownContent'),
                nonTextContent: <span />,
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                },
                cancelActTitle: '',
                cancelActFn: () => {},
            });
        } else {
            setDialogState({
                ...dialogState,
                open: true,
                title: t('syncTimeConfirmTitle'),
                content: '',
                nonTextContent: (
                    <Typography style={{color: colors.dialogText}}>
                        {t('syncTimeConfirmContent1')}
                        <br />
                        <br />
                        {t('syncTimeConfirmContent2')}
                        <SettingsIcon style={{fontSize: '1rem', marginBottom: '-2px'}} />
                        {t('syncTimeConfirmContent3')}
                    </Typography>
                ),
                actionTitle: t('ignoreAndContinue'),
                actionFn: () => {
                    hanldeSetNtpServer(ip);
                    handleDialogOnClose();
                },
                cancelActTitle: t('cancel'),
                cancelActFn: handleDialogOnClose,
            });
        }
    };

    const dialogCloseBtn = (
        <span>
            <IconButton
                color="inherit"
                onClick={handleClose}
                aria-label="Back"
                disabled={needInitialSetup}
            >
                <ArrowBackIOS />
            </IconButton>
        </span>
    );

    const dialogResetBtn = (
        <IconButton
            color="inherit"
            onClick={resetAllState}
            aria-label="Close"
        >
            <i className="material-icons">settings_backup_restore</i>
        </IconButton>
    );

    const dialogSaveBtn = (
        <div>
            <IconButton
                color="inherit"
                onClick={handleSaveOnClick}
                aria-label="Close"
                disabled={!saveEnable}
            >
                <i className="material-icons">save</i>
            </IconButton>
        </div>
    );

    return (
        <>
            <LockLayer display={lock} />
            <AppBar
                color="primary"
                style={{position: 'fixed'}}
            >
                <Toolbar style={{minHeight: 'auto', padding: '0px'}}>
                    <P2Tooltip
                        content={dialogCloseBtn}
                        title={t('close')}
                    />
                    <Typography
                        variant="h6"
                        color="inherit"
                        style={{flex: 1}}
                    >
                        {t('systemSettings')}
                    </Typography>
                    <P2Tooltip
                        content={dialogResetBtn}
                        title={t('resetToDefault')}
                    />
                    <P2Tooltip
                        content={dialogSaveBtn}
                        title={t('save')}
                    />
                </Toolbar>
            </AppBar>
            <div
                style={{
                    backgroundColor: colors.background,
                    padding: '30px 200px',
                    marginBottom: '30px',
                    overflowY: accountCardState.open ? 'hidden' : 'auto',
                    maxHeight: 'calc(100% - 108px)',
                    transform: 'translateY(48px)',
                }}
            >
                <AppearancesBox
                    t={t}
                    lang={changeLang}
                    handleLangOnChange={handleLangOnChange}
                    landingView={changelandingView}
                    handleLandingViewOnChange={handleLandingViewOnChange}
                    enableRssiColor={changeRssiColor.enable}
                    sliderValue={changeRssiColor.range}
                    handleSliderEnableOnChange={handleSliderEnableOnChange}
                    handleSliderOnChange={handleSliderOnChange}
                    pixiSettings={pixiSettings}
                    handlePixiSettingsOnChange={handlePixiSettingsOnChange}
                />
                <AccountBox
                    t={t}
                    handleSecurityCardOpen={() => {
                        setAccountCardState({
                            ...accountCardState,
                            open: true,
                        });
                    }}
                />
                <AdvancedBox
                    t={t}
                    csrf={csrf}
                    enableDownGrade={enableDowngrade.enable}
                    handleEnableDowngradeOnCheck={handleEnableDowngradeOnCheck}
                    supportNtpSer={ntpServerState.support}
                    timeDiff={ntpServerState.timeDiff}
                    handleInputCallback={ipInputCallback}
                    handleNtpServerOnClick={handleNtpServerOnClick}
                    resetIpInput={ntpServerState.resetIpInput}
                />
                <Pollingbox
                    t={t}
                    csrf={csrf}
                    newIntervalOnTopologyView={newIntervalOnTopologyView}
                    setNewIntervalOnTopologyView={setNewIntervalOnTopologyView}
                    newIntervalOnDashboardView={newIntervalOnDashboardView}
                    setNewIntervalOnDashboardView={setNewIntervalOnDashboardView}
                />
                <InternalSettingsBox
                    t={t}
                    internalSettings={internalSettings}
                    setInternalSettings={setInternalSettings}
                />
            </div>
            <AccountSettingsCard
                t={t}
                open={accountCardState.open}
                handleClose={handleAccountSettingsCardClose}
                inputCallback={handleAccountSettingsCardCallback}
                width={accountBoxRef ? accountBoxRef.getBoundingClientRect().width : 0}
                fullWidth={width}
                reset={accountCardState.reset}
            />
            <FwDowngradeDialog
                t={t}
                csrf={csrf}
                open={enableDowngrade.dialogOpen}
                handleSubmit={handleAllowDowngrade}
                handleCancel={handleDowngradeOnClose}
            />
            <P2Dialog
                open={dialogState.open}
                handleClose={() => {
                    setDialogState((prevState) => ({
                        ...prevState,
                        open: false,
                    }));
                }}
                title={dialogState.title}
                content={dialogState.content}
                nonTextContent={dialogState.nonTextContent}
                actionTitle={dialogState.actionTitle}
                actionFn={dialogState.actionFn}
                cancelActTitle={dialogState.cancelActTitle}
                cancelActFn={dialogState.cancelActFn}
                zIndex={zIndexLevel.mediumHigh}
            />
        </>
    );
};

export default Settings;
