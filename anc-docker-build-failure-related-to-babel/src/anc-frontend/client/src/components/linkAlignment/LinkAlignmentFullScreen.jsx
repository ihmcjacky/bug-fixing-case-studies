import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import VolumeOnIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import Transition from '../common/Transition';
import SoundIndicator from './SoundIndicator';
import {
    alignmentFAB,
    adJustFAB,
    getFullScreenDataDispaly,
    getStatDataLine,
    iff,
    parseDbmToIndicatorSettings,
} from './linkAlignmentHelperFunc';

// using 1920*1080 as reference to resize the font size, width and height
// the min resolution is 1280*720
const useStyle = makeStyles({
    appBar: {
        position: 'relative',
        height: '64px',
    },
    title: {
        flex: 1,
    },
    fullScreenRssiData: {
        fontSize: width => `${58 * (width / 1920)}px`,
        paddingTop: '0.5px',
        paddingBottom: '0.2px',
    },
    wrapper: {
        backgroundColor: '#E5E5E5',
        fontFamily: 'Roboto',
    },
    dialogWrapper: {
        backgroundColor: '#E5E5E5',
        height: height => `${height - 64}px`,
    },
    cardWrapper: {
        margin: '20px',
        height: 'calc(100% - 40px)',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'center',
        height: '100%',
        overflowY: 'auto',
    },
    volumeIconWrapper: {
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        width: width => `${56 * (width / 1920)}px`,
        height: width => `${56 * (width / 1920)}px`,
        minHeight: width => `${56 * (width / 1920)}px`,
        backgroundColor: 'transparent',
        '&:hover, &:focus': {
            boxShadow: '0px 0px rgba(0,0,0,0.0)',
            backgroundColor: 'transparent',
        },
    },
    volumeIcon: {
        fontSize: width => `${56 * (width / 1920)}px`,
        color: 'white',
    },
    rssiDisplayCircleWrapper: {
        borderRadius: '50%',
        width: width => `${400 * (width / 1920)}px`,
        height: width => `${400 * (width / 1920)}px`,
        margin: '20px 20px 40px 20px',
    },
    rssiDisplayContentWrapper: {
        height: '100%',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    rssiDisplayUnitWrapper: {
        fontSize: width => `${45 * (width / 1920)}px`,
        float: 'right',
        paddingTop: width => `${93 * (width / 1920)}px`,
        paddingRight: width => `${18 * (width / 1920)}px`,
    },
    rssiDisplayTittle: {
        marginTop: width => `${45 * (width / 1920)}px`,
        fontSize: width => `${65 * (width / 1920)}px`,
    },
    rssiDisplayLevelWrapper: {
        marginBottom: width => `${38 * (width / 1920)}px`,
    },
    rssiDisplayHasData: {
        fontSize: width => `${150 * (width / 1920)}px`,
        fontWeight: 'bold',
        marginLeft: width => `${55 * (width / 1920)}px`,
    },
    rssiDisplayNoData: {
        fontSize: width => `${150 * (width / 1920)}px`,
        fontWeight: 'bold',
        marginLeft: '0px',
    },
    iconWrapper: {
        marginBottom: width => `${7 * (width / 1920)}px`,
    },
    fab: {
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        width: width => `${48 * (width / 1920)}px`,
        height: width => `${48 * (width / 1920)}px`,
        minHeight: width => `${48 * (width / 1920)}px`,
    },
    icon: {
        fontSize: width => `${36 * (width / 1920)}px`,
    },
});

let soundIndicator = null;

const LinkAlignmentFullScreen = function (props) {
    const {
        t,
        open,
        displayData,
        displayNodeInfo,
        focusedLink,
        handlePollingFunc,
        handleOpenConfigBoxFunc,
        handleFullDialogClose,
        pollingStatus,
        width,
        height,
        initialRadioData,
        disableAdjustConfig,
    } = props;
    const classes = useStyle(width, height);

    const [state, setState] = React.useState({
        radioSelectMenuOpen: false,
        soundSource: '',
    });

    useEffect(() => {
        soundIndicator = new SoundIndicator(0, 0, 0);
        return () => {
            if (soundIndicator.isPlaying()) {
                soundIndicator.stop();
            }
            soundIndicator = null;
        };
    }, []);

    const handleDataChange = () => {
        if (state.soundSource !== '') {
            const amp = parseDbmToIndicatorSettings(displayData[state.soundSource].rssi);
            soundIndicator.changeConfig(amp);
            if (!soundIndicator.isPlaying() && pollingStatus.isPolling) {
                soundIndicator.start();
            }
        } else {
            soundIndicator.stop();
        }
    };
    useEffect(handleDataChange, [displayData]);

    const handleSoundIndicatorOnOff = (target) => {
        if (target !== '') {
            const amp = parseDbmToIndicatorSettings(displayData[target].rssi);
            soundIndicator.changeConfig(amp);
            if (pollingStatus.isPolling && !soundIndicator.isPlaying()) {
                soundIndicator.start();
            }
        } else {
            soundIndicator.stop();
        }
        setState({
            ...state,
            soundSource: target,
        });
    };

    const getSoundIndicatorIcon = target => (
        <Fab
            disableRipple
            disableFocusRipple
            className={classes.volumeIconWrapper}
            onClick={() => handleSoundIndicatorOnOff(state.soundSource === target ? '' : target)}
        >
            {state.soundSource === target ?
                <VolumeOnIcon className={classes.volumeIcon} /> : <VolumeOffIcon className={classes.volumeIcon} />}
        </Fab>
    );

    const getMenuItem = (radioNum) => {
        if (initialRadioData[radioNum]) {
            return (
                <div>
                    <p style={{display: 'inline'}}>
                        {t(radioNum)}
                    </p>
                    <p
                        style={{
                            display: 'inline',
                            opacity: '55%',
                            fontSize: '14px',
                            paddingLeft: '10px',
                        }}
                    >
                        {`${initialRadioData[radioNum].band === '5' ? 'CH: ' : ''}${initialRadioData[radioNum].channel}
                         | ${initialRadioData[radioNum].channelBandwidth} | ${initialRadioData[radioNum].txpower}`}
                    </p>
                </div>
            );
        }
        return (
            <div>
                <p style={{display: 'inline'}}>
                    {t(radioNum)}
                </p>
                <p
                    style={{
                        display: 'inline',
                        opacity: '55%',
                        fontSize: '14px',
                        paddingLeft: '10px',
                    }}
                >
                    - | - | -
                </p>
            </div>
        );
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleFullDialogClose}
            TransitionComponent={Transition}
            className={classes.wrapper}
        >
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleFullDialogClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <div className={classes.title}>
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                            style={{fontSize: '24px', fontFamily: 'Roboto', fontWeight: 'bold'}}
                        >
                            <Grid style={{display: 'inline'}}>
                                <span style={{padding: '5px'}}>{displayNodeInfo.local.hostname}</span>
                                <span style={{fontSize: '14px'}} >
                                    <span style={{padding: '3px'}}>{displayNodeInfo.local.model} /</span>
                                    <span style={{padding: '3px 10px 3px 3px'}}>{displayNodeInfo.local.mac}</span>
                                    <span style={{padding: '5px', border: 'solid 1px'}}>{t('local')}</span>
                                </span>
                            </Grid>
                            <Grid>
                                <Grid
                                    container
                                    direction="row"
                                    justify="flex-start"
                                    alignItems="center"
                                    style={{padding: '15px'}}
                                >
                                    <div
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '5px solid transparent',
                                            borderRight: '10px solid #fff',
                                            borderBottom: '5px solid transparent',
                                        }}
                                    />
                                    <div
                                        style={{
                                            display: 'inline',
                                            background: '#fff',
                                            width: '150px',
                                            height: '4px',
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '5px solid transparent',
                                            borderLeft: '10px solid #fff',
                                            borderBottom: '5px solid transparent',
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid style={{display: 'inline'}}>
                                <span>
                                    <span style={{padding: '5px'}}>
                                        {displayNodeInfo.remote.hostname}
                                    </span>
                                    <span style={{fontSize: '14px'}} >
                                        <span style={{padding: '3px'}}>
                                            {displayNodeInfo.remote.model} /
                                        </span>
                                        <span style={{padding: '3px 10px 3px 3px'}}>
                                            {displayNodeInfo.remote.mac}
                                        </span>
                                        <span style={{padding: '5px', border: 'solid 1px'}}>{t('remote')}</span>
                                    </span>
                                </span>
                            </Grid>
                        </Grid>
                    </div>
                    <div>
                        <div style={{display: 'inline-block', paddingLeft: '5px'}}>
                            {getMenuItem(focusedLink.radio)}
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <DialogContent className={classes.dialogWrapper}>
                <Card classes={{root: classes.cardWrapper}} >
                    <div className={classes.cardContent}>
                        <Grid
                            container
                            spacing={0}
                            justify="space-around"
                            alignItems="center"
                            style={{
                                textAlign: 'center',
                                marginTop: 'auto',
                            }}
                        >
                            <Grid>
                                {getFullScreenDataDispaly(classes, displayData.local.color, displayData.local.rssi,
                                    displayData.local.shouldShow, getSoundIndicatorIcon('local'), t('local'), t)}
                            </Grid>
                            <Grid>
                                {getFullScreenDataDispaly(classes, displayData.remote.color, displayData.remote.rssi,
                                    displayData.remote.shouldShow, getSoundIndicatorIcon('remote'), t('remote'), t)}
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={0}
                            justify="space-around"
                            alignItems="center"
                            style={{
                                textAlign: 'right',
                                marginBottom: 'auto',
                            }}
                        >
                            <Grid
                                container
                                style={{
                                    width: `${1000 * (width / 1920)}px`,
                                    borderRadius: '10px',
                                    backgroundColor: 'rgb(241, 238, 238)',
                                    marginBottom: '20px',
                                }}
                            >
                                <Grid
                                    item
                                    xs={10}
                                    style={{
                                        paddingLeft: '1px',
                                        textAlign: !pollingStatus.isPolling && !pollingStatus.isStarting ?
                                            'center' : 'left',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 450,
                                            fontSize: `${60 * (width / 1920)}px`,
                                            paddingLeft: !pollingStatus.isPolling ?
                                                iff(pollingStatus.isStarting,
                                                    `${350 * (width / 1920)}px`, `${210 * (width / 1920)}px`) :
                                                `${35 * (width / 1920)}px`,
                                        }}
                                    >
                                        {pollingStatus.pollingStatusTitle}
                                    </span>
                                </Grid>
                                <Grid item xs={2} >
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            float: 'right',
                                            padding: `${10 * (width / 1920)}px`,
                                        }}
                                    >
                                        <div style={{display: 'inline-block'}}>
                                            {adJustFAB(classes, t('adjustConfigBtn'), handleOpenConfigBoxFunc,
                                                disableAdjustConfig)}
                                        </div>
                                        <div style={{display: 'inline-block', paddingLeft: '10px'}}>
                                            {alignmentFAB(classes, pollingStatus.isPolling || pollingStatus.isStarting ?
                                                t('stopAlignmentBtn') : t('startAlignmentBtn'),
                                            () => {
                                                handlePollingFunc();
                                                if (pollingStatus.isPolling && soundIndicator.isPlaying()) {
                                                    soundIndicator.stop();
                                                } else if (state.soundSource !== '' && pollingStatus.isPolling) {
                                                    soundIndicator.start();
                                                }
                                            }, pollingStatus.isStarting,
                                            pollingStatus.isPolling || pollingStatus.isStarting)}
                                        </div>
                                    </div>
                                </Grid>
                                {getStatDataLine(classes.fullScreenRssiData,
                                    {
                                        localNodeColor: displayData.local.color,
                                        remoteNodeColor: displayData.remote.color,
                                    }, {
                                        shouldShowLocalData: displayData.local.shouldShow,
                                        shouldShowRemoteData: displayData.remote.shouldShow,
                                    },
                                    {local: displayData.local.min, remote: displayData.remote.min}, t('graphDetailLabelMin'), t)}
                                {getStatDataLine(classes.fullScreenRssiData,
                                    {
                                        localNodeColor: displayData.local.color,
                                        remoteNodeColor: displayData.remote.color,
                                    }, {
                                        shouldShowLocalData: displayData.local.shouldShow,
                                        shouldShowRemoteData: displayData.remote.shouldShow,
                                    },
                                    {local: displayData.local.max, remote: displayData.remote.max}, t('graphDetailLabelMax'), t)}
                                {getStatDataLine(classes.fullScreenRssiData,
                                    {
                                        localNodeColor: displayData.local.color,
                                        remoteNodeColor: displayData.remote.color,
                                    }, {
                                        shouldShowLocalData: displayData.local.shouldShow,
                                        shouldShowRemoteData: displayData.remote.shouldShow,
                                    },
                                    {local: displayData.local.avg, remote: displayData.remote.avg}, t('graphDetailLabelAvg'), t)}
                            </Grid>
                        </Grid>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

LinkAlignmentFullScreen.propTypes = {
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    displayData: PropTypes.shape({
        local: PropTypes.shape({
            shouldShow: PropTypes.bool.isRequired,
            rssi: PropTypes.string.isRequired,
            min: PropTypes.string.isRequired,
            max: PropTypes.string.isRequired,
            avg: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
        }).isRequired,
        remote: PropTypes.shape({
            shouldShow: PropTypes.bool.isRequired,
            rssi: PropTypes.string.isRequired,
            min: PropTypes.string.isRequired,
            max: PropTypes.string.isRequired,
            avg: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    displayNodeInfo: PropTypes.shape({
        local: PropTypes.shape({
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            mac: PropTypes.string,
        }).isRequired,
        remote: PropTypes.shape({
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            mac: PropTypes.string,
        }).isRequired,
    }).isRequired,
    focusedLink: PropTypes.shape({
        radio: PropTypes.string.isRequired,
    }).isRequired,
    // handleRadioDeviceChange: PropTypes.func.isRequired,
    handlePollingFunc: PropTypes.func.isRequired,
    handleOpenConfigBoxFunc: PropTypes.func.isRequired,
    handleFullDialogClose: PropTypes.func.isRequired,
    pollingStatus: PropTypes.shape({
        isPolling: PropTypes.bool.isRequired,
        isStarting: PropTypes.bool.isRequired,
        pollingStatusTitle: PropTypes.string.isRequired,
    }).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    initialRadioData: PropTypes.object.isRequired, // eslint-disable-line
    disableAdjustConfig: PropTypes.bool.isRequired,
};

export default LinkAlignmentFullScreen;
