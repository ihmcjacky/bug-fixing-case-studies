import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie'
import {useTranslation} from 'react-i18next';
import SwipeableViews from 'react-swipeable-views';
import FlipMove from 'react-flip-move';
import {makeStyles} from '@material-ui/core/styles';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import RefreshIcon from '@material-ui/icons/Refresh';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import P2Tooltip from '../common/P2Tooltip';
import RebootDialog from './RebootDialog';
import NotifyItem from './NotifyItem';
import {openDeviceListDialog} from '../../redux/common/commonActions';
import {
    changeTab,
    clearAllByType,
    refreshNotificationCenter,
    markAllAsRead,
    markAsRead,
    removeNotify,
    closeNotificCenter,
    updateNotify,
    changeRebootDialogStatus,
} from '../../redux/notificationCenter/notificationActions';
import {syncProjectUiSettings} from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import {reboot} from '../../util/apiCall';
import NotificationConstants from '../../constants/notificationCenter';
import {RebootDialogStatus} from '../../constants/common';

const {notificationActionType, notificationIconType} = NotificationConstants;

const tabType = {
    read: 0,
    unread: 1,
};
const styles = {
    paperWrapper: {
        width: '380px',
        height: '500px',
        backgroundColor: 'inherit',
        zIndex: 1000,
        overflow: 'hidden',
        fontFamily: 'Roboto',
    },
    onTopWrapper: {
        display: 'inline',
        paddingLeft: '14px',
        color: '#FFFFFF',
        userSelect: 'none',
        fontSize: '12px',
        paddingTop: '4px',
        fontWeight: 'bold',
    },
    onTabWrapper: {
        paddingRight: '14px',
        paddingTop: '2px',
        color: '#FFFFFF',
        userSelect: 'none',
        fontSize: '12px',
    },
    menuWrapperStyle: {
        height: 'auto',
        width: '350px',
        maxHeight: '430px',
        overFlowY: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyTabStyle: {
        userSelect: 'none',
        color: '#FFFFFF',
        opacity: 0.62,
        paddingTop: '20px',
        textAlign: 'center',
    },
    tabButton: {
        fontSize: '10px',
        padding: '0px',
        minWidth: '55px',
        minHeight: '18px',
        fontWeight: 800,
        backgroundColor: 'rgba(136, 180, 247, 0.39)',
        '&:hover': {
            backgroundColor: 'rgba(136, 180, 247, 0.39)',
        },
    },
    tabButtonUnselect: {
        fontSize: '10px',
        padding: '0px',
        minWidth: '55px',
        minHeight: '18px',
        fontWeight: 400,
    },
    tabContenter: {
        maxHeight: '460px',
        height: '460px',
    },
    icon: {
        color: '#FFF',
        height: '15px',
        width: '15px',
    },
    badge: {
        backgroundColor: '#DC4639',
        right: '-4px',
        top: '1px',
    },
    whiteFont: {
        color: 'rgb(255, 255, 255)',
    },
};

const useStyles = makeStyles(styles);

let markAsReadTemp = [];

const NotificationCenter = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const {
        common: {csrf, labels},
        notificationCenter: {
            read, unread,
            notifyArr,
            curTab,
            open,
        },
        meshTopology: {nodeInfo},
    } = useSelector(store =>  store);
    const {t: _t, ready} = useTranslation('notification-center');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    const [isRefreshing, setRefresh] = useState(false);

    const handleCenterOnOff = () => {
        markAsReadTemp = unread;
        return () => {
            if (curTab === 'unread' && unread.length > 0) {
                dispatch(markAllAsRead());
            } else if (curTab === 'read' && markAsReadTemp.length > 0) {
                dispatch(markAsRead(markAsReadTemp));
            }
            markAsReadTemp = [];
            dispatch(syncProjectUiSettings());
        }
    };
    useEffect(handleCenterOnOff, []);

    const refreshFunc = () => {
        if (isRefreshing) return;

        setRefresh(true);
        dispatch(refreshNotificationCenter());
        setTimeout(() => {
            setRefresh(false);
        }, 200);
    };

    const getNotifyFn = (action, info, id) => {
        switch (action) {
            case notificationActionType.openManagedDeviceList:
                return () => {
                    Cookies.set('notificationCloseManagedDeviceListObj', {id, info});
                    dispatch(openDeviceListDialog());
                    dispatch(closeNotificCenter());
                };
            case notificationActionType.reboot:
                return () => {
                    dispatch(updateNotify(id, {
                        iconType: notificationIconType.loading,
                        onClickAction: '',
                        info: {
                            ...info,
                            status: 'onReboot',
                        },
                    }));
                    reboot(csrf, {nodes: info.deviceList}).then(() => {
                        dispatch(updateNotify(id, {
                            iconType: 'SUCCESS',
                            onClickAction: '',
                            info: {
                                ...info,
                                status: 'success',
                            },
                            cannotRemove: false,
                        }));
                        dispatch(
                            changeRebootDialogStatus(
                                RebootDialogStatus.SUCCESS, {hostname: info.hostname, mac: info.mac})
                        );
                    }).catch(() => {
                        dispatch(updateNotify(id, {
                            iconType: 'WARNING',
                            onClickAction: 'reboot',
                            info: {
                                ...info,
                                status: 'error',
                            },
                        }));
                        dispatch(
                            changeRebootDialogStatus(
                                RebootDialogStatus.ERROR, {hostname: info.hostname, mac: info.mac})
                        );
                    });
                };
            default:
                return () => {};
        }
    };

    const hasNewUnread = markAsReadTemp.length !== unread.length && curTab === 'read';

    const clearAllBtn = (
        <IconButton
            style={{
                minWidth: '20px',
                color: 'transparent',
            }}
            onClick={() => dispatch(clearAllByType(curTab))}
        >
            <ClearAllIcon className={classes.icon} />
        </IconButton>
    );

    const refreshBtn = (
        <IconButton
            style={{
                minWidth: '20px',
                color: 'transparent',
                paddingLeft: '0px',
            }}
            onClick={refreshFunc}
        >
            <RefreshIcon className={classes.icon} />
        </IconButton>
    );

    const readTabBtn = (
        <Button
            className={curTab === 'read' ? classes.tabButton : classes.tabButtonUnselect}
            disableRipple
            onClick={() => {
                if (curTab === 'read') return;
                dispatch(changeTab('read'));
            }}
        >
            <span style={{color: '#fff', opacity: curTab === 'read' ? 1 : 0.62}}>
                {t('read')}
            </span>
        </Button>
    );

    const unreadTabBtn = (
        <Button
            className={curTab === 'unread' ? classes.tabButton : classes.tabButtonUnselect}
            disableRipple
            onClick={() => {
                if (curTab === 'unread') return;
                dispatch(changeTab('unread'));
            }}
        >
            <Badge
                color="secondary"
                variant="dot"
                classes={{badge: classes.badge}}
                invisible={!hasNewUnread}
            >
                <span style={{color: '#fff', opacity: curTab === 'unread' ? 1 : 0.62}}>
                    {t('unread')}
                </span>
            </Badge>
        </Button>
    );

    const emptyPage = (
        <div
            key="empty"
            className={classes.emptyTabStyle}
        >
            {t('emptyTabMessage')}
        </div>
    );

    const readTab = open ? (
        <div
            key="read-tab-content"
            id="read-tab-content"
            className={classes.tabContenter}
        >
            {isRefreshing ? <span /> : (
                <FlipMove
                    duration={isRefreshing ? 200 : 500}
                    enterAnimation="fade"
                    leaveAnimation="fade"
                >
                    {read.length === 0 ? emptyPage : read.map((index) => {
                        const {
                            onClickAction,
                            info,
                            id,
                        } = notifyArr[index];
                        return (
                            <NotifyItem
                                t={t}
                                key={id}
                                onClickFn={getNotifyFn(onClickAction,info, id)}
                                removeFunc={() => dispatch(removeNotify(id))}
                                nodeInfo= {nodeInfo}
                                {...notifyArr[index]}
                            />
                        )
                    })}
                </FlipMove>
            )}
        </div>
    ) : <span key="read-tab-content" />;

    const unreadTab = open ? (
        <div
            key="unread-tab-content"
            id="unread-tab-content"
            className={classes.tabContenter}
        >
            {isRefreshing ? <span /> : (
                <FlipMove
                    duration={isRefreshing ? 100 : 500}
                    enterAnimation="fade"
                    leaveAnimation="fade"
                >
                    {unread.length === 0 ? emptyPage : unread.map((index) => {
                        const {
                            onClickAction,
                            info,
                            id,
                        } = notifyArr[index];
                        return (
                            <NotifyItem
                                t={t}
                                key={id}
                                onClickFn={getNotifyFn(onClickAction,info, id)}
                                removeFunc={() => dispatch(removeNotify(id))}
                                nodeInfo= {nodeInfo}
                                {...notifyArr[index]}
                            />
                        )
                    })}
                </FlipMove>
            )}
        </div>
    ) : <span key="unread-tab-content" />;

    return (
        <div>
            <Paper
                className={classes.paperWrapper}
                classes={{root: classes.whiteFont}}
                elevation={0}
            >
                <div className={classes.header}>
                    <div>
                        <Typography className={classes.onTopWrapper}>
                            {t('notification')}
                        </Typography>
                        <P2Tooltip
                            direction="bottom"
                            title={t('clearAll')}
                            content={clearAllBtn}
                        />
                        <P2Tooltip
                            direction="bottom"
                            title={t('refresh')}
                            content={refreshBtn}
                        />
                    </div>
                    <Typography className={classes.onTabWrapper}>
                        {readTabBtn}
                        {unreadTabBtn}
                    </Typography>
                </div>
                <SwipeableViews index={tabType[curTab]} >
                    {[readTab, unreadTab]}
                </SwipeableViews>
            </Paper>
            <RebootDialog t={t}/>
        </div>
    );
};

export default NotificationCenter;
