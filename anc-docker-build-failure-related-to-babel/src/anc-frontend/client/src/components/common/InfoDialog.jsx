import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import CloseIcon from '@material-ui/icons/Close';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {getVersion} from '../../util/apiCall';
import { checkFwVersion } from '../../util/commonFunc';
import CommonConstants from '../../constants/common';
import EnableDevModeDialogWrapper from '../devMode/EnableDevModeDialogWrapper';

const { theme } = CommonConstants;
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
        userSelect: 'none',
    },
});

const InfoDialog = (props) => {
    const {
        closeFunc,
        open,
        t,
    } = props;
    const classes = useStyles();

    // const {location, env} = useSelector(store => store.common);
    const {
        location,
        anm: {loggedin},
        labels
    } = useSelector(store => store.common);
    const timeoutRef = useRef();

    const [verInfo, setVerInfo] = useState({
        version: '',
        build: '',
        error: false,
    });
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [onTime, setOnTime] = useState(false);
    const [mouseClickCounter, setMouseClickCounter] = useState(0);
    const [enableDevModeDialog, setEnableDevModeDialog] = useState(false);

    useEffect(() => {
        getVersion().then((res) => {
            const displayVer = checkFwVersion(res.version);
            setVerInfo({
                version: displayVer,
                build: res.build,
                error: false,
            });
        }).catch((e) => {
            setVerInfo({
                version: '-',
                build: '-',
                error: true,
            });
        });
    }, []);

    const onKeyDown = (e) => {
        if (e.key === 'Control') {
            setIsCtrlPressed(true);
        }
    };

    const onKeyUp = (e) => {
        if (e.key === 'Control') {
            setIsCtrlPressed(false);
            setMouseClickCounter(0);
            clearTimeout(timeoutRef.current);
            setOnTime(false);
        }
    };

    const onDialogOnOffFunc = () => {
        if (open) {
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp)
        } else {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp)
        }
    };

    useEffect(onDialogOnOffFunc, [open]);

    const startClickTimer = () => {
        setOnTime(true);
        timeoutRef.current = setTimeout(() => {
            setOnTime(false);
        }, 5000);
    };

    const handleTitleOnClick = () => {
        if (!loggedin) return;

        if (isCtrlPressed) {
            if (mouseClickCounter === 0) {
                startClickTimer();
            }
            if (mouseClickCounter < 4) {
                setMouseClickCounter(mouseClickCounter + 1);
            } else if (mouseClickCounter === 4 && onTime) {
                setEnableDevModeDialog(true);
            }
        }
    };

    // console.log('-----isCtrlPressed', isCtrlPressed);

    const uiVersion = process.env.REACT_APP_UI_DISPLAY_VER ?? 'dev';
    const uiVersionArr = process.env.REACT_APP_UI_DISPLAY_VER ?
        uiVersion.replace('v', '').split('.') : [uiVersion];
    const fullVersion = `${verInfo.version}.${uiVersionArr[uiVersionArr.length - 1]}`;
    const commonStyle = {paddingTop: '10px'}

    return (
        <Dialog onClose={closeFunc} open={open}>
            <DialogTitle
                style={{
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    width: '400px',
                    height: '30px',
                }}
            >
                <Typography
                    data-testid="info-dialog-title"
                    color="inherit"
                    className={classes.title}
                    variant="body2"
                    onClick={handleTitleOnClick}
                >
                    {`${t('infoDialogTitle', labels)} (${fullVersion})`}
                </Typography>
                <IconButton
                    color="inherit"
                    onClick={closeFunc}
                    classes={{root: classes.closeBtn}}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent style={{paddingBottom: '24px'}}>
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                >
                    {`${t('version')}: `}
                    <span style={{fontWeight: 500}}>
                        {`${verInfo.version} (${t('build')}: ${verInfo.build})`}
                    </span>
                </Typography>
                
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                    style={commonStyle}
                >
                    {`${t('uiVersion')}: `}
                    <span style={{fontWeight: 500}}>
                        {uiVersion}
                    </span>
                </Typography>
                
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                    style={commonStyle}
                >
                    {`${t('country')}: `}
                    <span style={{fontWeight: 500}}>
                        {location}
                    </span>
                </Typography>
                
                <Typography
                    align='right'
                    variant="body2"
                    style={{
                        ...commonStyle,
                        color: theme.palette.txt.halfOpa,
                        fontSize: theme.palette.footer.fontSize
                    }}
                >
                    <span style={{ fontWeight: 400 }}>
                        {t('translate:poweredBy')}
                    </span>
                </Typography>
                {/* <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                >
                    {`${t('aosVersion')}: ${env.AOS_SUPPORTED_VER}`}
                </Typography>
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                >
                    {`${t('ntpServerVersion')}: ${env.NTP_SERVER_VER}`}
                </Typography>
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                >
                    {`${t('cmVersion')}: ${env.CM_VER}`}
                </Typography>
                <Typography
                    variant="body2"
                    color={verInfo.error ? 'error' : 'textSecondary'}
                >
                    {`${t('caVersion')}: ${env.CA_VER}`}
                </Typography> */}
                <Typography
                    variant="body2"
                    style={{
                        display: 'none',
                        alignItems: 'center',
                    }}
                >
                    <Icon color="primary" style={{padding: '10px'}}>
                        <i className="material-icons">check_circle</i>
                    </Icon>
                    {t('upToDate')}
                </Typography>
            </DialogContent>
            {
                loggedin ? <EnableDevModeDialogWrapper
                    open={enableDevModeDialog}
                    closeFunc={() => {
                        setEnableDevModeDialog(false);
                    }}
                /> : null
            }
        </Dialog>
    );
};

InfoDialog.propTypes = {
    t: PropTypes.func.isRequired,
    closeFunc: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default InfoDialog;