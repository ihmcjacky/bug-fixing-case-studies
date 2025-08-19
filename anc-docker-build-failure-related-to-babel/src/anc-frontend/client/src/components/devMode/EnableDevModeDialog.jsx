import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Error';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DevOptionRow from './DevOptionRow';
import commonConstant from '../../constants/common';
import {
    switchBoundlessConfigOnOff,
    switchDebugCountryOnOff,
    switchBatchFwUpgradeOnOff,
    switchWatchdogConfigOnOff,
    switchExportAnmRawLogOnOff,
    switchGraphicSettingsOnOff,
} from '../../redux/devMode/devModeActions';

const {colors} = commonConstant;

const useStyles = makeStyles({
    dialogTitle: {
        userSelect: 'none',
        padding: '0px 0px 0px',
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
    title: {
        flex: 1,
        fontWeight: 500,
        fontSize: '24px',
        paddingTop: '20px',
        paddingLeft: '20px',
    },
    subTitle: {
        flex: 1,
        fontWeight: 500,
        fontSize: '16px',
        color: 'rgba(0, 0, 0, 0.54)',
    },
    warningContent: {
        fontSize: '16px',
        color: colors.inactiveRed,
    },
});

const EnableDevModeDialog = (props) => {
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('enable-dev-mode-dialog');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const dispatch = useDispatch();
    const {closeFunc} = props;
    const classes = useStyles();
    const {
        enableBoundlessConfig,
        enableDebugCountry,
        enableBatchFwUpgrade,
        enableWatchdogConfig,
        enableExportAnmRawLog,
        enableGraphicSettings,
    } = useSelector(store => store.devMode);
    const [boundlessConfigChecked, setBoundlessConfigChecked] = useState(enableBoundlessConfig);
    const [debugCountryChecked, setDebugCountryChecked] = useState(enableDebugCountry);
    const [batchFwUpgradeChecked, setBatchFwUpgradeChecked] = useState(enableBatchFwUpgrade);
    const [watchdogConfigChecked, setWatchdogConfigChecked] = useState(enableWatchdogConfig);
    const [exportAnmRawLogChecked, setExportAnmRawLogChecked] = useState(enableExportAnmRawLog);
    const [graphicSettingsChecked, setGraphicSettingsChecked] = useState(enableGraphicSettings);

    const hasChanged = (
        boundlessConfigChecked !== enableBoundlessConfig ||
        debugCountryChecked !== enableDebugCountry ||
        batchFwUpgradeChecked !== enableBatchFwUpgrade ||
        watchdogConfigChecked !== enableWatchdogConfig ||
        exportAnmRawLogChecked !== enableExportAnmRawLog ||
        graphicSettingsChecked !== enableGraphicSettings
    );

    const handleConfirmOnClick = () => {
        if (boundlessConfigChecked !== enableBoundlessConfig) {
            if (boundlessConfigChecked) {
                Cookies.set('enableBoundlessConfigDev', true);
            } else {
                Cookies.remove('enableBoundlessConfigDev');
            }
            dispatch(switchBoundlessConfigOnOff(boundlessConfigChecked));
        }

        if (debugCountryChecked !== enableDebugCountry) {
            if (debugCountryChecked) {
                Cookies.set('enableDebugCountryDev', true);
            } else {
                Cookies.remove('enableDebugCountryDev');
            }
            dispatch(switchDebugCountryOnOff(debugCountryChecked));
        }

        if (batchFwUpgradeChecked !== enableBatchFwUpgrade) {
            if (batchFwUpgradeChecked) {
                Cookies.remove('enableBatchFwUpgradeDev');
            } else {
                Cookies.set('enableBatchFwUpgradeDev', false);
            }
            dispatch(switchBatchFwUpgradeOnOff(batchFwUpgradeChecked));
        }

        if (watchdogConfigChecked !== enableWatchdogConfig) {
            if (watchdogConfigChecked) {
                Cookies.set('enableWatchdogConfigDev', true);
            } else {
                Cookies.remove('enableWatchdogConfigDev');
            }
            dispatch(switchWatchdogConfigOnOff(watchdogConfigChecked));
        }
        
        if (exportAnmRawLogChecked !== enableExportAnmRawLog) {
            if (exportAnmRawLogChecked) {
                Cookies.set('enableExportAnmRawLogDev', true);
            } else {
                Cookies.remove('enableExportAnmRawLogDev');
            }
            dispatch(switchExportAnmRawLogOnOff(exportAnmRawLogChecked));
        }

        if (graphicSettingsChecked !== enableGraphicSettings) {
            if (graphicSettingsChecked) {
                Cookies.set('enableGraphicSettingsDev', true);
            } else {
                Cookies.remove('enableGraphicSettingsDev');
            }
            dispatch(switchGraphicSettingsOnOff(graphicSettingsChecked));
        }
    };

    const handleResetOnClick = () => {
        setBoundlessConfigChecked(enableBoundlessConfig);
        setDebugCountryChecked(enableDebugCountry);
        setWatchdogConfigChecked(enableWatchdogConfig);
        setExportAnmRawLogChecked(enableExportAnmRawLog);
        setGraphicSettingsChecked(enableGraphicSettings);
    }

    if (!ready) {
        return <span />;
    }
    return (
        <>
            <DialogTitle classes={{root: classes.dialogTitle}} >
                <IconButton
                    color="inherit"
                    onClick={closeFunc}
                    classes={{root: classes.closeBtn}}
                >
                    <CloseIcon />
                </IconButton>
                <Typography
                    data-testid="proj-list-main-title"
                    color="inherit"
                    className={classes.title}
                    variant="body2"
                >
                    {t('enableDevModeTitle')}
                </Typography>
            </DialogTitle>
            <DialogContent style={{paddingBottom: '30px'}}>
                <Typography classes={{root: classes.subTitle}}>
                    {t('enableDevModeSubeTitle')}
                </Typography>
                <div
                    style={{
                        marginTop: '10px',
                        border: `solid ${colors.inactiveRed} 1px`,
                    }}
                >
                    <div
                        style={{
                            margin: '8px',
                            display: 'flex',
                        }}
                    >
                        <WarningIcon
                            fontSize="large"
                            style={{
                                marginRight: '6px',
                                fontSize: '30px',
                                color: colors.inactiveRed,
                            }}
                        />
                        <Typography classes={{root: classes.warningContent}} >
                            {t('enableDevModeWarning1')}
                            {t('enableDevModeWarning2')}
                        </Typography>
                    </div>
                </div>
                <DevOptionRow
                    title={t('enableBoundkessConfigCheckBoxTitle')}
                    subtitle={t('enableBoundkessConfigCheckBoxSubTitle')}
                    checked={boundlessConfigChecked}
                    switchOnChangeFunc={() => {
                        setBoundlessConfigChecked(!boundlessConfigChecked);
                    }}
                />
                <DevOptionRow
                    title={t('enableDebugCountryCheckBoxTitle')}
                    subtitle={t('enableDebugCountryCheckBoxSubTitle')}
                    checked={debugCountryChecked}
                    switchOnChangeFunc={() => {
                        setDebugCountryChecked(!debugCountryChecked);
                    }}
                />
                <DevOptionRow
                    title={t('enableBatchFwUpgradeTitle')}
                    subtitle={t('enableBatchFwUpgradeSubTitle')}
                    checked={batchFwUpgradeChecked}
                    switchOnChangeFunc={() => {
                        setBatchFwUpgradeChecked(!batchFwUpgradeChecked);
                    }}
                />
                <DevOptionRow
                    title={t('enableWatchdogConfigTitle')}
                    subtitle={t('enableWatchdogConfigSubTitle')}
                    checked={watchdogConfigChecked}
                    switchOnChangeFunc={() => {
                        setWatchdogConfigChecked(!watchdogConfigChecked);
                    }}
                />
                <DevOptionRow
                    title={t('enableExportAnmRawLogTitle')}
                    subtitle={t('enableExportAnmRawLogSubTitle')}
                    checked={exportAnmRawLogChecked}
                    switchOnChangeFunc={() => {
                        setExportAnmRawLogChecked(!exportAnmRawLogChecked);
                    }}
                />
                <DevOptionRow
                    title={t('enableGraphicSettingsTitle')}
                    subtitle={t('enableGraphicSettingsSubTitle')}
                    checked={graphicSettingsChecked}
                    switchOnChangeFunc={() => {
                        setGraphicSettingsChecked(!graphicSettingsChecked);
                    }}
                />
            </DialogContent>
            <DialogActions style={{paddingBottom: '15px'}}>
                <Button
                    onClick={handleResetOnClick}
                    color="primary"
                    autoFocus
                    style={{display: 'inline'}}
                    disableRipple
                >
                    {t('reset')}
                </Button>
                <Button
                    onClick={() => {
                        handleConfirmOnClick();
                        closeFunc();
                    }}
                    style={!hasChanged ? {} : {color: colors.inactiveRed}}
                    autoFocus
                    disableRipple
                    disabled={!hasChanged}
                >
                    {t('confirm')}
                </Button>
            </DialogActions>
        </>
    );
};

EnableDevModeDialog.propTypes = {
    closeFunc: PropTypes.func.isRequired,
};

export default EnableDevModeDialog;
