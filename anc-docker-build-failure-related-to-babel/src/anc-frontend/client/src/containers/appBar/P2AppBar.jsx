import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import {makeStyles} from '@material-ui/core/styles';
import AboutIcon from '@material-ui/icons/InfoOutlined';
import ConfigIcon from '@material-ui/icons/Settings';
import DashboardIcon from '@material-ui/icons/DesktopMac';
import GuidelineIcon from '@material-ui/icons/HelpOutline';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import LanguageIcon from '@material-ui/icons/Language';
import MaintenanceIcon from '@material-ui/icons/Build';
import NotificationIcon from '@material-ui/icons/NotificationsOutlined';
import ProjectIcon from '@material-ui/icons/Assignment';
import AppBar from '@material-ui/core/AppBar';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {ReactComponent as TopologyIcon} from '../../icon/svg/ic_mesh.svg';
import {ReactComponent as SettingsIcon} from '../../icon/svg/ic_settings.svg';
import ProgressBar from '../../components/common/ProgressBar';
import NotificationCenter from '../../components/notificationCenter/NotificationCenter';
import {logoutAnm, setLanguage} from '../../util/apiCall';
import {openSettingsDialog, openGuidelineDialog} from '../../redux/common/commonActions';
import {changeOnView, changeToStaging, logoutProjectAndChangeView} from '../../redux/projectManagement/projectActions';
import {openNotificCenter, closeNotificCenter} from '../../redux/notificationCenter/notificationActions';
import P2Tooltip from '../../components/common/P2Tooltip';
import P2Dialog from '../../components/common/P2Dialog';
import InfoDialog from '../../components/common/InfoDialog';
import {iff} from '../../util/commonFunc';
import CommonConstant from '../../constants/common';
import ProjectConstant from '../../constants/project';
import SettingsWrapper from './settings/SettingsWrapper';
import GuidelineDialog from './GuidelineDialog';
import DeviceList from './deviceListDialog/DeviceDialog';
import {closeDeviceListDialog} from '../../redux/common/commonActions';
import {changeLang} from '../../I18n';
import {setLang} from '../../redux/common/commonActions';

const {theme, colors, langList} = CommonConstant;
const {project: {quickStagingName}} =  ProjectConstant;

const styles = {
    menu: {
        position: 'absolute',
        top: 43,
        left: 0,
    },
    langMenuItem: {
        color: 'white',
        backgroundColor: `${theme.palette.primary.main} !important`,
        fontSize: '13px',
        '&:hover': {
            backgroundColor: `${theme.palette.primary.light} !important`,
        },
        justifyContent: 'center !important',
    },
    langMenuPaper: {
        marginLeft: 'calc(100vw - 365px)',
        borderRadius: '3px',
        width: '150px',
        backgroundColor: 'transparent',
    },
    langSelectedMenuItem: {
        color: 'white',
        backgroundColor: `${theme.palette.primary.light} !important`,
    },
    guidelineStepper: {
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    guidelineStepperDot: {
        margin: '0 5px',
    },
    dialogWidth: {
        width: '958px',
        height: '651px',
    },
    appBarRoot: {
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
    },
    notificationMenuPaper: {
        marginLeft: 'calc(100vw - 405px)',
        borderRadius: '3px',
        height: '500px',
        width: '380px',
        backgroundColor: theme.palette.primary.main,
    },
    badge: {
        backgroundColor: '#DC4639',
        height: '13px',
        minWidth: '13px',
        fontSize: '9px',
        top: '20px',
        right: '5px',
    },
    topologyIcon: {
        width: '48px',
        height: '48px',
    },
    popoverPaper: {
        background: colors.main,
        borderRadius: '0px',
    },
    popoverNotiPaper: {
        background: colors.main,
        // borderRadius: '13px 13px 0 0',
        borderRadius: '0px',
        marginLeft: '16px',
    },
    popoverProjectPaper: {
        background: colors.main,
        borderRadius: '0px',
        marginLeft: '-16px',
    },
    projectPopoverRoot: {
        left: 0,
    },
    menuItem: {
        minWidth: '130px',
        padding: '14px',
        color: 'white',
        backgroundColor: `${colors.appBarMenuItem} !important`,
        fontSize: '13px',
        '&:hover': {
            backgroundColor: `${colors.appBarMenuItemHover} !important`,
        },
    },
    selectedMenuItem: {
        color: 'white',
        backgroundColor: `${colors.appBarMenuItemHover} !important`,
    },
};
const useStyles = makeStyles(styles);

const popoverCommonStyle = {
    boxShadow: `0px 5px 5px -3px rgba(0,0,0,0.2),
        0px 8px 10px 1px rgba(0,0,0,0.14),
        0px 3px 14px 2px rgba(0,0,0,0.12)`,
    position: 'fixed',
    zIndex: 1400,
};

const PROJECT_MENU = 'porjectMenu';
const LANG_MENU = 'langMenu';
const NOTIFICATION_CENTER = 'notificationCenter';

let hoveronPopover = false;
let hoveronBtn = false;

const P2AppBar = () => {
    const {t, ready} = useTranslation('appbar');
    const history = useHistory();
    const classes = useStyles();
    const dispatch = useDispatch();
    const notifyBtnRef = useRef();
    const langBtnRef = useRef();
    const projectBtnRef = useRef();

    const {
        common: {
            csrf,
            meshView,
            anm: {username},
            lang,
            deviceListDialog,
        },
        projectManagement: {projectName},
        notificationCenter,
    } = useSelector(store => store);

    const [pathname, setPathname] = useState(history.location.pathname);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState('');
    const [infoDialog, setInfoDialog] = useState(false);
    const [hoverBtn, setHoverBtn] = useState(false);

    const handlePathOnChange = (location) => {
        console.log('app bar location');
        console.log(location);
        setPathname(location.pathname);
    };

    const didMountFunc = () => {
        history.listen(handlePathOnChange);

        const mouseOnClickHandler = () => {
            if (hoveronBtn || hoveronPopover) return;
            setPopoverOpen('');
        };
        const mouseOnContextmenuHandler = () => {
            if (hoveronPopover) return;
            setPopoverOpen('');
        };
        document.addEventListener('click', mouseOnClickHandler);
        document.addEventListener('contextmenu', mouseOnContextmenuHandler);
        return () => {
            history.listen(null);

            document.removeEventListener('click', mouseOnClickHandler);
            document.removeEventListener('contextmenu', mouseOnContextmenuHandler);
        };
    };
    useEffect(didMountFunc, []);

    const logoutOnClick = () => {
        logoutAnm(csrf).then(() => {
            Cookies.remove('projectId');
            Cookies.remove('quickStagingLoginRequest');
            history.push('/login');
            window.location.assign(`${window.location.origin}/index.html`);
        }).catch(() => { /* handled in apiCall */ });
    };

    const notLoggedIn = Cookies.get('quickStagingLoginRequest') === 'true';

    const projectBtn = (
        <IconButton
            ref={projectBtnRef}
            color="inherit"
            id="project-menu-btn"
            onClick={() => {
                if (popoverOpen === PROJECT_MENU) {
                    setPopoverOpen('');
                } else {
                    setPopoverOpen(PROJECT_MENU);
                }
            }}
            onMouseOver={() => {
                setHoverBtn(PROJECT_MENU);
                hoveronBtn = PROJECT_MENU;
            }}
            onMouseLeave={() => {
                setHoverBtn(false);
                hoveronBtn = false;
            }}
        >
            <ProjectIcon />
        </IconButton>
    );

    const topologyViewBtn = (
        <IconButton
            color="inherit"
            id="topology-menu-btn"
            classes={{root: meshView === 'topology' ? classes.topologyIcon : null}}
            onClick={() => {
                if (pathname === '/') return;
                setPathname('/');
                history.push('/');
            }}
        >
            {meshView === 'topology' ?
                <TopologyIcon
                    style={{fill: pathname === '/' ? theme.palette.secondary.main : 'white'}}
                />
                :
                <DashboardIcon
                    style={{fill: pathname === '/' ? theme.palette.secondary.main : 'white'}}
                />
            }
        </IconButton>
    );

    const configBtn = (
        <div style={{cursor: notLoggedIn ? 'not-allowed': 'default'}} >
            <IconButton
                color="inherit"
                disabled={notLoggedIn}
                id="config-menu-btn"
                onClick={() => {
                    if (pathname === '/config') return;
                    Cookies.set('meshConfigActiveTab', 1);
                    setPathname('/config');
                    history.push('/config');
                }}
            >
                <ConfigIcon
                    style={{
                        fill: pathname === '/config' ?
                            theme.palette.secondary.main : iff(notLoggedIn, colors.disableIcon, 'white'),
                    }}
                />
            </IconButton>
        </div>
    );

    const maintenanceBtn = (
        <div style={{cursor: notLoggedIn ? 'not-allowed': 'default'}} >
            <IconButton
                color="inherit"
                id="maintenance-menu-btn"
                disabled={notLoggedIn}
                onClick={() => {
                    if (pathname === '/maintenance') return;
                    Cookies.set('MeshWideMaintenanceActiveTab', 1);
                    setPathname('/maintenance');
                    history.push('/maintenance');
                }}
            >
                <MaintenanceIcon
                    style={{
                        fill: pathname === '/maintenance' ?
                            theme.palette.secondary.main : iff(notLoggedIn, colors.disableIcon, 'white'),
                    }}
                />
            </IconButton>
        </div>
    );

    const changeLangBtn = (
        <IconButton
            ref={langBtnRef}
            color="inherit"
            id="change-lang-btn"
            onClick={() => {
                if (popoverOpen === LANG_MENU) {
                    setPopoverOpen('');
                } else {
                    setPopoverOpen(LANG_MENU);
                }
            }}
            onMouseOver={() => {
                setHoverBtn(LANG_MENU);
                hoveronBtn = LANG_MENU;
            }}
            onMouseLeave={() => {
                setHoverBtn(false);
                hoveronBtn = false;
            }}
        >
            <LanguageIcon />
        </IconButton>
    );

    const guidelineBtn = (
        <IconButton
            color="inherit"
            id="guideline-menu-btn"
            onClick={() => { dispatch(openGuidelineDialog()); }}
        >
            <GuidelineIcon />
        </IconButton>
    );

    const notifyBtn = (
        <IconButton
            ref={notifyBtnRef}
            id="notification-center-btn"
            color="inherit"
            onClick={() => {
                if (popoverOpen === NOTIFICATION_CENTER) {
                    setPopoverOpen('');
                } else {
                    setPopoverOpen(NOTIFICATION_CENTER);
                }
                dispatch(openNotificCenter());
            }}
            onMouseOver={() => {
                setHoverBtn(NOTIFICATION_CENTER);
                hoveronBtn = NOTIFICATION_CENTER;
            }}
            onMouseLeave={() => {
                setHoverBtn(false);
                hoveronBtn = false
            }}
        >
            <Badge
                color="secondary"
                badgeContent={notificationCenter.unread.length}
                classes={{badge: classes.badge}}
                invisible={notificationCenter.unread.length === 0}
                anchororigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <NotificationIcon />
            </Badge>
        </IconButton>
    );

    const settingsBtn = (
        <IconButton
            color="inherit"
            id="settings-menu-btn"
            classes={{root: classes.topologyIcon}}
            onClick={() => { dispatch(openSettingsDialog()); }}
        >
            <SettingsIcon
                style={{
                    fill: 'white',
                    strokeWidth: '10px',
                }}
            />
        </IconButton>
    );

    const logoutBtn = (
        <IconButton
            color="inherit"
            id="logout-menu-btn"
            onClick={() => { setLogoutDialogOpen(true); }}
        >
            <LogoutIcon />
        </IconButton>
    );

    const aboutBtn = (
        <IconButton
            color="inherit"
            id="about-menu-btn"
            onClick={() => { setInfoDialog(true); }}
        >
            <AboutIcon />
        </IconButton>
    );
    
    if (!ready) return <span />;
    return (
        <div style={{minWidth: '600px'}}>
            <ProgressBar />
            <AppBar
                position="static"
                color="primary"
                style={{height: '48px'}}
                classes={{root: classes.appBarRoot}}
            >
                <Toolbar style={{minHeight: 'auto', padding: '0px 10px 0px 10px'}}>
                    <Tooltip
                        title={t('projectTooltip')}
                        key="project-menu-btn"
                        open={hoverBtn === PROJECT_MENU && popoverOpen !== PROJECT_MENU}
                    >
                        {projectBtn}
                    </Tooltip>
                    <P2Tooltip
                        title={meshView === 'topology' ? t('clusterTopoTooltip') : t('dashboard')}
                        content={topologyViewBtn}
                        key="topology-on-view-btn"
                    />
                    <P2Tooltip
                        title={notLoggedIn ? t('clusterConfigTooltipDisable') : t('clusterConfigTooltip')}
                        content={configBtn}
                        key="config-btn"
                    />
                    <P2Tooltip
                        title={notLoggedIn ? t('clusterMaintainTooltipDisable') : t('clusterMaintainTooltip')}
                        content={maintenanceBtn}
                        key="maintenance-btn"
                    />
                    <Typography variant="body2" style={{flex: 1}} />
                    <FormControl style={{minWidth: '100px', textAlign: 'center'}}>
                        <Typography
                            variant="subtitle1"
                            color="inherit"
                            style={{fontWeight: 'bold'}}
                        >
                            <span id={`project-menu-name`}>{projectName === quickStagingName ? t('quickStagingID') : projectName}</span>
                        </Typography>
                    </FormControl>
                    <Typography variant="body2" style={{flex: 1}} />
                    <Typography variant="body2" style={{width: '48px'}} />
                    <Typography variant="body2" style={{width: '48px'}} />
                    <Button
                        color="inherit"
                        disabled
                        style={{color: 'white', display: 'none'}}
                    >
                        <i
                            className="material-icons"
                            style={{paddingRight: '5px'}}
                        >
                            account_circle
                        </i>
                        {username}
                    </Button>
                    <Tooltip
                        title={t('languagemenuTooltip')}
                        key="change-lang-btn"
                        open={hoverBtn === LANG_MENU && popoverOpen !== LANG_MENU}
                    >
                        {changeLangBtn}
                    </Tooltip>
                    <P2Tooltip
                        title={t('guidelineTooltip')}
                        content={guidelineBtn}
                        key="guideline-btn"
                    />
                    <Tooltip
                        title={t('notiftyTooltip')}
                        key="notification-btn"
                        open={hoverBtn === NOTIFICATION_CENTER && popoverOpen !== NOTIFICATION_CENTER}
                    >
                        {notifyBtn}
                    </Tooltip>
                    <P2Tooltip
                        title={t('settingsTooltip')}
                        content={settingsBtn}
                        key="settings-btn"
                    />
                    <P2Tooltip
                        title={t('logoutTooltip')}
                        content={logoutBtn}
                        key="logout-btn"
                    />
                    <P2Tooltip
                        title={t('aboutTooltip')}
                        content={aboutBtn}
                        key="about-btn"
                    />
                </Toolbar>
            </AppBar>
            <Grow
                in={popoverOpen === PROJECT_MENU}
                unmountOnExit
            >
                <div
                    className={classes.popoverPaper}
                    style={{
                        ...popoverCommonStyle,
                        top: projectBtnRef.current ? projectBtnRef.current.getBoundingClientRect().top + 48 : 0,
                        left: projectBtnRef.current ? projectBtnRef.current.getBoundingClientRect().left - 10 : 0,
                    }}
                    onMouseEnter={() => { hoveronPopover = true; }}
                    onMouseLeave={() => { hoveronPopover = false; }}
                >
                    <MenuItem
                        key="change-porject-menu-item"
                        onClick={() => {
                            dispatch(changeOnView('list'));
                            setPopoverOpen('');
                        }}
                        classes={{
                            root: classes.menuItem,
                            selected: classes.selectedMenuItem,
                        }}
                    >
                        <div dangerouslySetInnerHTML={{__html: t('changeProjectLabel')}} />
                    </MenuItem>
                    <MenuItem
                        key="quick-staging-menu-item"
                        onClick={() => {
                            if (projectName === quickStagingName) {
                                dispatch(changeOnView('save'));
                            } else {
                                dispatch(changeToStaging());
                            }
                            setPopoverOpen('');
                        }}
                        classes={{
                            root: classes.menuItem,
                            selected: classes.selectedMenuItem,
                        }}
                    >
                        <div
                            dangerouslySetInnerHTML={{
                                __html: projectName === quickStagingName ? t('saveProjectLabel') : t('quickStagingLabel')
                            }}
                        />
                    </MenuItem>
                </div>
            </Grow>
            <Grow
                in={popoverOpen === LANG_MENU}
                unmountOnExit
            >
                <div
                    className={classes.popoverPaper}
                    style={{
                        ...popoverCommonStyle,
                        top: langBtnRef.current ? langBtnRef.current.getBoundingClientRect().top + 48 : 0,
                        left: langBtnRef.current ? langBtnRef.current.getBoundingClientRect().left - 45 : 0,
                    }}
                    onMouseEnter={() => { hoveronPopover = true; }}
                    onMouseLeave={() => { hoveronPopover = false; }}
                >
                    {langList.map((langCode) => (
                        <MenuItem
                            key={`change-lang-${langCode}-menu-item`}
                            classes={{
                                root: classes.menuItem,
                                selected: classes.selectedMenuItem,
                            }}
                            onClick={() => {
                                setLanguage(csrf, {language: langCode}).then(() => {
                                    changeLang(langCode)
                                    dispatch(setLang(langCode));
                                    setPopoverOpen('');
                                    
                                    const isInClusterConf = window.location.pathname.split("/").indexOf('config') < 0 ? false : true;
                                    const isInClusterMaintenance = window.location.pathname.split("/").indexOf('maintenance') < 0 ? false : true;
                                   
                                    // language change redirection
                                    if (isInClusterConf) {
                                        // redirect hack
                                        history.push('/maintenance') // tmp
                                        history.push('/config'); // destination
                                    } else if (isInClusterMaintenance) {
                                        // redirect hack
                                        history.push('/config') // tmp
                                        history.push('/maintenance'); // real destination
                                    }
                                });
                            }}
                        >
                            <div
                                style={{
                                    textAlign: 'center',
                                    width: '100%',
                                }}
                                dangerouslySetInnerHTML={{__html: t(langCode)}}
                            />
                        </MenuItem>
                    ))}
                </div>
            </Grow>
            <Grow
                in={popoverOpen === NOTIFICATION_CENTER}
                unmountOnExit
                onExited={() => {
                    dispatch(closeNotificCenter());
                }}
            >
                <div
                    className={classes.popoverNotiPaper}
                    style={{
                        ...popoverCommonStyle,
                        top: notifyBtnRef.current ? notifyBtnRef.current.getBoundingClientRect().top + 48 : 0,
                        left: notifyBtnRef.current ? notifyBtnRef.current.getBoundingClientRect().left - 194 : 0,
                    }}
                    onMouseEnter={() => { hoveronPopover = true; }}
                    onMouseLeave={() => { hoveronPopover = false; }}
                >
                    <NotificationCenter />
                </div>
            </Grow>
            <SettingsWrapper />
            <GuidelineDialog />
            <InfoDialog
                t={t}
                closeFunc={() => { setInfoDialog(false); }}
                open={infoDialog}
            />
            {deviceListDialog.open && <DeviceList
                close={() => {
                    // this.props.resumeGraphUpdate();
                    // this.props.closeManagedDeviceList();
                    // this.props.startPolling();
                    // this.props.pollingOnce(true);
                    dispatch(closeDeviceListDialog());
                    console.log('DeviceList close');
                }}
                open={deviceListDialog.open}
            />}
            <P2Dialog
                id="logout-dialog"
                open={logoutDialogOpen}
                title={t('logoutTitle')}
                content={t('logoutContent')}
                actionTitle={t('logoutSubmitTitle')}
                actionFn={logoutOnClick}
                handleClose={() => { setLogoutDialogOpen(false); }}
                cancelActTitle={t('logoutCancelTitle')}
                cancelActFn={() => { setLogoutDialogOpen(false); }}
            />
        </div>
    );
};

export default P2AppBar;
