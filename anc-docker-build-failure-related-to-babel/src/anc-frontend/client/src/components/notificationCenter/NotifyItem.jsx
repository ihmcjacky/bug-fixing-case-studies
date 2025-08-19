import React, {forwardRef, useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {makeStyles} from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import DoneOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Button from '@material-ui/core/Button';
import TimeIcon from '@material-ui/icons/AccessTime';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import Typography from '@material-ui/core/Typography';
import CommonConstants from '../../constants/common';
import {convertIpToMac} from '../../util/formatConvertor';
import NotificationConstants from '../../constants/notificationCenter';

const {notificationType, notificationIconType} = NotificationConstants;
const {theme, colors} = CommonConstants;

const styles = {
    notifyIcon: {
        fontSize: '58px',
        margin: 'auto',
        transform: 'rotate(180deg)',
    },
    warningIcon: {
        fontSize: '58px',
        margin: 'auto',
        color: theme.palette.error.main,
    },
    processingIcon: {
        color: 'white',
        margin: 'auto',
    },
    doneIcon: {
        fontSize: '58px',
        margin: 'auto',
        color: colors.activeGreen,
    },
    notifyIconWrapper: {
        opacity: 0.78,
        display: 'flex',
    },
    wrapper: {
        borderTop: `1px ${theme.palette.primary.light} solid`,
        borderBottom: `1px ${theme.palette.primary.light} solid`,
        color: 'white',
        width: '375px',
        textAlign: 'left',
        height: '122px',
    },
    itemWrapper: {
        paddingTop: '7px',
    },
    notifyTitle: {
        // opacity: 0.78,
        fontSize: '14px',
        color: 'white',
        height: '20px',
        fontWeight: 'bold',
        wordWrap: 'break-word',
        display: 'inline',
    },
    notifyContent: {
        // opacity: 0.78,
        fontSize: '12px',
        color: 'white',
        height: '60px',
        paddingRight: '10px',
        // wordWrap: 'break-word',
        overflowY: 'auto',
    },
    notifyFooter: {
        height: '20px',
        width: '100%',
        // textAlign: 'justify',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentWrapper: {
    },
    timeLabel: {
        opacity: 0.78,
        fontSize: '10px',
        color: 'white',
        // display: 'inline',
    },
    timeIcon: {
        fontSize: '10px',
        margin: 'auto',
    },
    button: {
        opacity: 1,
        color: '#FFFFFF',
        fontSize: '10px',
        padding: '0px',
        minWidth: '0px',
        minHeight: '0px',
        textAlign: 'right',
        paddingRight: '10px',
    },
    closeBtn: {
        minWidth: '0px',
        minHeight: '0px',
    },
    titleWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

const useStyles = makeStyles(styles);

const NotifyItem = forwardRef((props, refs) => {
    const classes = useStyles();
    const [confirm, setConfirm] = useState(false);
    const {
        t,
        id, time,
        actionConfirmBtn,  cannotRemove,
        info, type, iconType,
        removeFunc, onClickFn,
        nodeInfo,
    } = props;

    const getTitle = () => {
        let title = '';
        switch (type) {
            // case 'HOSTNODE_UNMANAGED':
            //     return t('hostnodeUnmanagedTitle');
            case notificationType.newUnmanagedDevice:
                title = `${info.deviceList.length} ${t('newUmanagedDeviceTitle')}`;
                break;
            // case 'DEVICE_DISCONNECTED':
            //     return `${info.deviceList.length} ${t('disconnectedTitle')}`;
            // case 'DEVICE_SECRET_MISMATCH':
            //     return `${info.deviceList.length} ${t('secretMismatchTitle')}`;
            // case 'HOSTNODE_UNREACHABLE':
            //     return t('hostnodeUnreachable');
            // case notificationType.deviceRebootRequired:
            //     title = t('deviceRebootNeeded');
            //     break;
            default:
                title = '';
        }
        return (
            <div className={classes.titleWrapper}>
                <Typography classes={{root: classes.notifyTitle}}>
                    {title}
                </Typography>
                {cannotRemove ? null : <Button
                    classes={{root: classes.closeBtn}}
                    style={{color: 'transparent'}}
                    onClick={removeFunc}
                >
                    <CloseIcon style={{width: '18px', height: '18px', color: '#FFF'}} />
                </Button>}
            </div>
        );
    };

    const getContent = () => {
        switch (type) {
            // case 'HOSTNODE_UNMANAGED':
            //     return (
            //         <span>
            //             <b>{`${info.deviceList[0].hostname}(${info.deviceList[0].mac}) `}</b>
            //             {t('hostnodeUnmanagedContent')}
            //             <br />
            //             {t('newUmanagedDeviceContent2')}
            //         </span>
            //     );
            case notificationType.newUnmanagedDevice: {
                if (info.deviceList.length > 1) {
                    const strArr = info.deviceList.map(nodeIp => `${nodeInfo[nodeIp] ?
                        nodeInfo[nodeIp].hostname : '-'}
                        (${nodeInfo[nodeIp] ? nodeInfo[nodeIp].mac : convertIpToMac(nodeIp)})`);
                    return (
                        <span
                            style={{
                                wordWrap: 'break-word',
                            }}
                        >
                            <b>{strArr.join(', ')} </b>
                            {t('newUmanagedDeviceContent')}
                            <br />
                            {t('newUmanagedDeviceContent2')}
                        </span>
                    );
                }
                return (
                    <span>
                        <b>{nodeInfo[info.deviceList[0]] ? nodeInfo[info.deviceList[0]].hostname : '-'}
                            ({nodeInfo[info.deviceList[0]] ?
                                nodeInfo[info.deviceList[0]].mac : convertIpToMac(info.deviceList[0])}) </b>
                        {t('newUmanagedDeviceContent')}
                        <br />
                        {t('newUmanagedDeviceContent3')}
                    </span>
                );
            }
            // case 'DEVICE_DISCONNECTED': {
            //     if (info.deviceList.length > 1) {
            //         const strArr = info.deviceList.map(
            //             device => `${device.hostname}(${device.mac})`
            //         );
            //         return (
            //             <span>
            //                 <b>{strArr.join(', ')} </b>
            //                 {t('disconnectedContent')}
            //             </span>
            //         );
            //     }
            //     return (
            //         <span>
            //             <b>{info.deviceList[0].hostname}({info.deviceList[0].mac}) </b>
            //             {t('disconnectedContent')}
            //         </span>
            //     );
            // }
            // case 'DEVICE_SECRET_MISMATCH':
            //     return t('secretMismatchContent');
            // case 'HOSTNODE_UNREACHABLE':
            //     return (
            //         <span>
            //             <b>{info.deviceList[0].hostname}({info.deviceList[0].mac})</b>
            //             <br />
            //             {t('hostnodeUnreachableContent')}
            //         </span>
            //     );
            // case notificationType.deviceRebootRequired:
            //     if (info.status === 'pending') {
            //         return (
            //             <span>
            //                 <b>{nodeInfo[info.deviceList[0]] ? nodeInfo[info.deviceList[0]].hostname : '-'} (
            //                     {nodeInfo[info.deviceList[0]] ?
            //                         nodeInfo[info.deviceList[0]].mac : convertIpToMac(info.deviceList[0])}) </b>
            //                 {t('rebootRequiredContent')}
            //             </span>
            //         );
            //     } else if (info.status === 'onReboot') {
            //         return (
            //             <span>
            //                 {t('onRebootContent')}
            //             </span>
            //         );
            //     } else if (info.status === 'success') {
            //         return (
            //             <span>
            //                 <b>{nodeInfo[info.deviceList[0]] ? nodeInfo[info.deviceList[0]].hostname : '-'} (
            //                     {nodeInfo[info.deviceList[0]] ?
            //                         nodeInfo[info.deviceList[0]].mac : convertIpToMac(info.deviceList[0])}) </b>
            //                 {t('rebootSuccessContent')}
            //             </span>
            //         );
            //     } else if (info.status === 'error') {
            //         return (
            //             <span>
            //                 <b>{nodeInfo[info.deviceList[0]] ? nodeInfo[info.deviceList[0]].hostname : '-'} (
            //                     {nodeInfo[info.deviceList[0]] ?
            //                         nodeInfo[info.deviceList[0]].mac : convertIpToMac(info.deviceList[0])}) </b>
            //                 {t('rebootFailedContent')}
            //             </span>
            //         );
            //     }
            //     return '';
            default:
                return '';
        }
    };

    const getActionBtn = () => {
        switch (type) {
            // case 'HOSTNODE_UNMANAGED':
            //     return t('viewManagedDeviceList');
            case notificationType.newUnmanagedDevice:
                if (info.status === 'success') {
                    return (
                        <div />
                    );
                }
                return (
                    <Button
                        className={classes.button}
                        onClick={onClickFn}
                    >
                        {t('viewManagedDeviceList')}
                    </Button>
                );
            // case 'DEVICE_SECRET_MISMATCH':
            //     return t('fixSecretMismatch');
            // case notificationType.deviceRebootRequired:
            //     if (info.status === 'success' || info.status === 'onReboot') {
            //         return (
            //             <div />
            //         );
            //     }
            //     return (
            //         <Button
            //             className={classes.button}
            //             onClick={() => setConfirm(true)}
            //         >
            //             {t('deviceRebootNeededAction')}
            //         </Button>
            //     );
            default:
                return (
                    <div />
                );
        }
    };

    const getNotifyIcon = () => {
        switch (iconType) {
            case notificationIconType.loading:
                return (<CircularProgress
                    classes={{root: classes.processingIcon}}
                    size={48}
                />);
            case notificationIconType.success:
                return (<DoneOutlineIcon classes={{root: classes.doneIcon}} />);
            case notificationIconType.warning:
                return (<ErrorOutlineIcon classes={{root: classes.warningIcon}} />);
            default:
                return (<ErrorOutlineIcon classes={{root: classes.notifyIcon}} />);
        }
    };

    const getTimeDiff = () => {
        const currentTime = moment();
        if (currentTime.diff(time, 'minutes') <= 60) {
            return ` ${moment().diff(time, 'minutes')} ${t('minAgo')}`;
        } else if (currentTime.diff(time, 'hours') <= 24) {
            return ` ${moment().diff(time, 'hours')} ${t('hourAgo')}`;
        }
        return ` ${moment().diff(time, 'days')} ${t('dayAgo')}`;
    };

    return (
        <div className={classes.wrapper} ref={refs} key={`notify_${id}`}>
            <Grid className={classes.itemWrapper} container spacing={0} alignItems="flex-start">
                <Grid
                    item
                    xs={3}
                    className={classes.notifyIconWrapper}
                    style={{paddingTop: iconType === 'LOADING' ? '5px' : '0px'}}
                >
                    {getNotifyIcon()}
                </Grid>
                <Grid className={classes.contentWrapper} item xs={9}>
                    {getTitle()}
                    <Typography classes={{root: classes.notifyContent}}>
                        {getContent()}
                    </Typography>
                    <div className={classes.notifyFooter}>
                        <Typography classes={{root: classes.timeLabel}}>
                            <TimeIcon classes={{root: classes.timeIcon}} />
                            {getTimeDiff()}
                        </Typography>
                        {confirm ? <Grow in={confirm} timeout={{enter: 500, exit: 0}}>
                            <div>
                                <Button
                                    className={classes.button}
                                    onClick={() => {
                                        setConfirm(false);
                                    }}
                                >
                                    {t('back')}
                                </Button>
                                <Button
                                    className={classes.button}
                                    onClick={() => {
                                        setConfirm(false);
                                        onClickFn();
                                    }}
                                >
                                    {t('confirm')}
                                </Button>
                            </div>
                        </Grow> : null}
                        {actionConfirmBtn && confirm ? null : (
                            <Grow in timeout={{enter: 500, exit: 0}}>
                                {getActionBtn()}
                            </Grow>
                        )}
                    </div>
                </Grid>
            </Grid>
        </div>
    )
});

NotifyItem.defaultProps = {
    onClickFn: () => {},
    actionConfirmBtn: false,
    cannotRemove: false,
    nodeInfo: {},
};

NotifyItem.propTypes = {
    t: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    iconType: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    info: PropTypes.object.isRequired, // eslint-disable-line
    onClickFn: PropTypes.func,
    actionConfirmBtn: PropTypes.bool,
    removeFunc: PropTypes.func.isRequired,
    cannotRemove: PropTypes.bool,
    nodeInfo: PropTypes.objectOf(PropTypes.shape({
        hostname: PropTypes.string,
        max: PropTypes.string,
    })),
};

export default NotifyItem;