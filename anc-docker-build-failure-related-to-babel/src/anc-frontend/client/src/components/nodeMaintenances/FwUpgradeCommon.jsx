import React from 'react';
import {Trans} from 'react-i18next';
import i18n from '../../I18n';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgressBar from '../../components/common/LinearProgressBar';
import Constant from '../../constants/common';
import {isFwSupport} from '../../util/common';

const {colors} = Constant;

const collapseBtnStyle = {
    justifyContent: 'space-around',
    width: '290px',
    padding: '6px 0px',
};
const collpaseItemStyle = {
    fontFamily: 'roboto',
    width: '280px',
    marginBottom: '5px',
    color: 'rgba(0, 0, 0, 0.54)',
};
const collpaseStyle = {
    maxHeight: '300px',
    overflowY: 'auto',
};

export const reachableStr = (
    <div
        style={{
            color: 'green',
            fontWeight: 'bold',
        }}
    >
        {i18n.t('reachable')}
    </div>
);

export const unreachableStr = (
    <div
        style={{
            color: 'red',
            fontWeight: 'bold',
        }}
    >
        {i18n.t('unreachable')}
    </div>
);


export const warningVersionTitle = (
    <div>
        {i18n.t('version')}
        <Tooltip
            title={i18n.t('fwoutdate')}
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
            >{i18n.t('error')}</i>
        </Tooltip>
    </div>
);

export const normalVersionTitle = (
   <div>{i18n.t('version')}</div>
);

export const titleCompoGenerator = tkey => (
    <div>{i18n.t(tkey)}</div>
);

export const upgradeConfirmationContent = (
    <span>
        <span style={{marginBottom: '5px', display: 'block'}}>
            {i18n.t('cwFwAllDevUpNoti')}
        </span>
        <Trans i18nKey="cwFwNoTurnOff">
            <b>&nbsp;</b>
        </Trans>
        <br />
        <Trans i18nKey="cwFwNoNavi">
            <b>&nbsp;</b>
        </Trans>
    </span>
);

export const uploadOrUpgradeErrorContent = (errArr, type) => {
    const errMsgs = errArr.map((errMsg, idx) => {
        const reKey = `${idx}_err`;
        return (
            <span style={{display: 'block'}} key={reKey} >
                - {errMsg}
            </span>
        );
    });
    return (
        <span>
            <span style={{marginBottom: '5px', display: 'block'}}>
                {i18n.t('cwFwUpErr', {type})}
            </span>
            {errMsgs}
        </span>
    );
};

export function getStatusContent(device, t) {
    let returnVal = '';
    if (device.status === 'unreachable') {
        returnVal =
        (
            <div
                style={{
                    color: 'red',
                    fontWeight: 'bold',
                }}
            >
                {t('unreachable')}
            </div>
        );
    } else if (device.status === 'reachable') {
        returnVal =
        (
            <div
                style={{
                    color: 'green',
                    fontWeight: 'bold',
                }}
            >{t('reachable')}
            </div>
        );
    } else if (device.status === 'mismatch') {
        returnVal =
        (
            <div
                style={{
                    color: 'red',
                    fontWeight: 'bold',
                }}
            >
                {t('authErr')}
            </div>
        );
    } else if (device.status === 'onUpgrade') {
        let message = t('progressBarOnProgress');
        let isError = false;
        let percentageNum = device.detail.percentage;
        const {error, success} = device.detail;
        if (error) {
            percentageNum = 100;
            isError = true;
            message = t('progressBarError') + error;
        } else if (success) {
            percentageNum = 100;
            message = t('progressBarSuccess');
        } else {
            percentageNum = device.detail.percentage;
            message = t('progressBarOnProgress');
        }
        returnVal = (
            <LinearProgressBar
                message={message}
                percentage={percentageNum}
                isError={isError}
                t={t}
            />
        );
    }
    return returnVal;
}

function hasTwoCase(a, b, c) {
    return a ? (b || c) : (b && c);
}

function getCollpaseContent(arr, open, onClickFn, title, classes) {
    return arr.length ?
        <span style={{display: 'inline-block', verticalAlign: 'top', paddingRight: '10px'}}>
            <Button
                onClick={() => onClickFn('sameVer')}
                style={collapseBtnStyle}
                fullWidth
                className={classes.button}
                classes={{
                    label: classes.label,
                }}
            >
                <span>
                    {title}
                </span>
                {
                    open ?
                        <ExpandLess style={{paddingRight: '13px'}} /> :
                        <ExpandMore style={{paddingRight: '13px'}} />
                }
            </Button>
            <Collapse
                in={open}
                timeout="auto"
                unmountOnExit
                style={collpaseStyle}
            >
                {arr.map(e => (
                    <div
                        key={e.hostname}
                        style={collpaseItemStyle}
                    >
                        <div
                            style={{
                                display: 'inline-block',
                                backgroundColor: 'rgba(0, 0, 0, 0.54)',
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                marginLeft: '3px',
                                transform: 'translateY(-9px)',
                            }}
                        />
                        <div style={{fontSize: '13px', display: 'inline-block', paddingLeft: '7px'}}>
                            <div style={{fontWeight: 'bold'}}>{e.hostname}</div>
                            <div>{`${e.mac} (${e.firmwareVersion})`}</div>
                        </div>
                    </div>
                ))}
            </Collapse>
        </span> : null;
}


const FwUpgradeDialog = (props) => {
    const {
        onCloseFn,
        actionFn,
        cancelFn,
        shouldForceReset,
        checked,
        onCheckFn,
        collapseFn,
        collapseBool,
        checkboxContent,
        title,
        warningContent,
        warningContentList,
        upgradeContent,
        open,
        t,
        classes,
    } = props;
    return (
        <Dialog
            open={open}
            onClose={onCloseFn}
            maxWidth="md"
            disableBackdropClick
            disableEscapeKeyDown
        >
            <DialogTitle
                style={{
                    padding: '16px 24px 10px 24px',
                }}
            >
                <div
                    style={{
                        fontWeight: 'bold',
                        display: 'inline-block',
                    }}
                >
                    {title}
                </div>
            </DialogTitle>
            <DialogContent
                style={{
                    padding: '0px 24px',
                }}
            >
                <DialogContentText>
                    {warningContent}
                    {upgradeContent}
                </DialogContentText>
                {warningContentList ?
                    <div style={{width: '912px'}}>
                        {getCollpaseContent(
                            warningContentList.downgradeDeviceList,
                            collapseBool.downgrade,
                            () => collapseFn('downgrade'),
                            t('downgradeCollapseTitle'),
                            classes
                        )}
                        {getCollpaseContent(
                            warningContentList.sameVerDeviceList,
                            collapseBool.sameVer,
                            () => collapseFn('sameVer'),
                            t('sameVerCollapseTitle'),
                            classes
                        )}
                    </div> : null
                }
                {
                    shouldForceReset ?
                        <FormControlLabel
                            style={{
                                color: '#de357c',
                                paddingTop: '10px',
                            }}
                            control={
                                <Checkbox
                                    checked={checked}
                                    onChange={onCheckFn}
                                    style={{
                                        color: '#de357c',
                                    }}
                                />
                            }
                            label={checkboxContent}
                        /> : null
                }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={cancelFn}
                    color="primary"
                    autoFocus
                    style={{display: 'inline'}}
                    disableRipple
                >
                    {t('cancel')}
                </Button>
                <Button
                    onClick={actionFn}
                    disabled={shouldForceReset && !checked}
                    color="primary"
                    autoFocus
                    disableRipple
                >
                    {t('ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// return true if the upgrade version is older than or equal to the current version or
// unknown version exists on both versions
export function versionCompare(upgradeVer, currentVer, anmVersion) {
    const upgradeVerArr = upgradeVer.replace('v', '').split('.').map(i => parseInt(i, 10));
    const currentVerArr = currentVer.replace('v', '').split('.').map(i => parseInt(i, 10));

    const result = {}

    // Unknown new version
    if (!isFwSupport(upgradeVer, anmVersion)) {
        result['incompatibleWarning'] = true;
    }
    // Same version
    if (upgradeVer === currentVer) {
        result['sameVersionWarning'] = true;
    }
    // Others
    for (let i = 0; i < 3; i++) {
        if (upgradeVerArr[i] > currentVerArr[i]) {
            result['downgradeWarning'] = false;
            break;
        } else if (upgradeVerArr[i] < currentVerArr[i]) {
            result['downgradeWarning'] = true;
            break;
        }
    }
    return result;
}

export const getBinVerContent = (binVer, nodes, nodeInfo, t, anmVersion) => {
    let shouldWarning = false;
    let shouldForceReset = false;
    const downgradeDeviceList = [];
    const sameVerDeviceList = [];
    const incompatibleDeviceList = [];
    nodes.forEach((nodeIp) => {
        const nodeData = nodeInfo[nodeIp];
        if (nodeData) {
            const versionCompareResult = versionCompare(binVer, nodeData.firmwareVersion, anmVersion);
            if (versionCompareResult.downgradeWarning) {
                shouldWarning = true;
                shouldForceReset = true;
                downgradeDeviceList.push({
                    hostname: nodeData.hostname,
                    mac: nodeData.mac,
                    firmwareVersion: nodeData.firmwareVersion,
                });
            } 
            if (versionCompareResult.incompatibleWarning) {
                shouldWarning = true;
                incompatibleDeviceList.push({
                    hostname: nodeData.hostname,
                    mac: nodeData.mac,
                    firmwareVersion: nodeData.firmwareVersion,
                });
            } 
            if (versionCompareResult.sameVersionWarning) {
                shouldWarning = true;
                sameVerDeviceList.push({
                    hostname: nodeData.hostname,
                    mac: nodeData.mac,
                    firmwareVersion: nodeData.firmwareVersion,
                });
            }
        }
    });
    let warningContent = <span />;
    if (shouldWarning) {
        let warningContentKey;
        if (hasTwoCase(downgradeDeviceList.length, sameVerDeviceList.length, incompatibleDeviceList.length)) {
            warningContentKey = 'multipeSitiationWarning';
        } else if (downgradeDeviceList.length) {
            warningContentKey = 'downgradeWarning';
        } else if (sameVerDeviceList.length) {
            warningContentKey = 'sameVersionUpgradeWarning';
        } else if (incompatibleDeviceList.length) {
            warningContentKey = 'verIncompatibility';
        }
        warningContent = (
            <span>
                <span style={{marginBottom: '10px', display: 'block'}}>
                    {' '}
                </span>
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '3px',
                    backgroundColor: colors.warningBackground,
                    padding: '12px',
                    marginBottom: '15px',
                    marginTop: '-10px',
                }}
                >
                    <i
                        className="material-icons"
                        style={{
                            fontSize: '40px',
                            paddingRight: '16px',
                            color: colors.warningColor,
                        }}
                    >error_outline</i>
                    <span dangerouslySetInnerHTML={{__html: t(warningContentKey)}} />
                </span>
            </span>
        );
    }
    const upgradeContent = (<span>
        <span style={{marginBottom: '10px', display: 'block'}}>
            {t('cwAllUpProceed')}
        </span>
        <span style={{marginBottom: '10px', display: 'block'}}>
            {t('verToUp')}&nbsp;
            <span style={{fontSize: '24px', color: Constant.themeObj.primary.main}}>{binVer} </span>
        </span>
    </span>);

    return {
        warningContent,
        warningContentList: {
            sameVerDeviceList,
            downgradeDeviceList,
        },
        shouldForceReset,
        upgradeContent,
    };
};

FwUpgradeDialog.propTypes = {
    onCloseFn: PropTypes.func.isRequired,
    actionFn: PropTypes.func.isRequired,
    cancelFn: PropTypes.func.isRequired,
    shouldForceReset: PropTypes.bool.isRequired,
    checked: PropTypes.bool.isRequired,
    checkboxContent: PropTypes.string,
    onCheckFn: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    warningContent: PropTypes.element,
    warningContentList: PropTypes.shape({
        downgradeDeviceList: PropTypes.arrayOf(
            PropTypes.shape({
                hostname: PropTypes.string,
                mac: PropTypes.string,
                firmwareVersion: PropTypes.string,
            })
        ),
        sameVerDeviceList: PropTypes.arrayOf(
            PropTypes.shape({
                hostname: PropTypes.string,
                mac: PropTypes.string,
                firmwareVersion: PropTypes.string,
            })
        ),
    }),
    upgradeContent: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    collapseFn: PropTypes.func.isRequired,
    collapseBool: PropTypes.shape({
        sameVer: PropTypes.bool.isRequired,
        incompatible: PropTypes.bool.isRequired,
        downgrade: PropTypes.bool.isRequired,
    }).isRequired,
    t: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

FwUpgradeDialog.defaultProps = {
    warningContent: null,
    warningContentList: {
        downgradeDeviceList: [],
        sameVerDeviceList: [],
    },
    checkboxContent: '',
};

const styles = {
    button: {
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    label: {
        justifyContent: 'space-between',
    },
};

export default withStyles(styles)(FwUpgradeDialog);
