import React, {useState} from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles} from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Typography from '@material-ui/core/Typography';
import {convertIpToMac} from '../../util/formatConvertor';
import {
    get,
    iff,
    alignmentFAB,
    adJustFAB,
    getStatDataLine,
} from './linkAlignmentHelperFunc';

const styles = {
    nodeInfoWrapper: {
        width: '100%',
    },
    dotdot: {
        minWidth: '0px',
    },
    rssiData: {
        fontSize: '1.5vw',
        paddingTop: '0.3vw',
    },
    fab: {
        // minHeight: '24px',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        width: '1.3vw',
        height: '1.3vw',
        minHeight: '1.3vw',
    },
    icon: {
        fontSize: '0.9vw',
    },
};
const useStyles = makeStyles(styles);

const LinkAlignmentNodeDetail = (props) => {
    const {
        t, openFullPage, openSwipeableMenu,
        startRadioInfoInterval, stopRadioInfoInterval,
        focusedLink, neiData,
        linkData, graphNodeInfo,
        stateTitle,
        displayData, localNodeColor, remoteNodeColor,
        shouldShowLocalData, shouldShowRemoteData,
        isPolling, starting,
        displayFrq,
        disableAdjustConfig,
    } = props;
    const [state, setState] = useState({nodeInfoMenuIndex: 0, dotNum: 0});
    const classes = useStyles();
    const started = isPolling || starting;
    const hasNodeData = focusedLink.length > 0 && graphNodeInfo[focusedLink[0].nodeIp];
    const hasLinkData = Object.keys(linkData).length > 0 && focusedLink.length > 0;
    return (
        <Card
            classes={{root: classes.nodeInfoWrapper}}
            elevation={0}
        >
            <Grid
                container
                spacing={0}
                justify="space-between"
                alignItems="center"
            >
                <Grid item sm={1} >
                    <IconButton
                        aria-label="left"
                        className={classes.margin}
                        size="small"
                        onClick={() => {
                            setState({nodeInfoMenuIndex: state.nodeInfoMenuIndex - 1});
                        }}
                        disabled={state.nodeInfoMenuIndex === 0}
                    >
                        <KeyboardArrowLeftIcon fontSize="large" />
                    </IconButton>
                </Grid>
                <Grid item sm={10} >
                    <SwipeableViews
                        enableMouseEvents
                        index={state.nodeInfoMenuIndex}
                        onSwitching={index => setState({nodeInfoMenuIndex: index})}
                    >
                        <Grid
                            container
                            spacing={0}
                            justify="space-around"
                            alignItems="center"
                            style={{
                                marginTop: '15px',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>MAC</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)'}}>
                                    {neiData.mac ?
                                        neiData.mac : iff(focusedLink.length > 0,
                                            convertIpToMac(get(focusedLink[0], ['nodeIp'])), '-')}
                                </Typography>
                            </Grid>
                            <Divider
                                orientation="vertical"
                                style={{
                                    height: '35px',
                                    border: '0.5px solid #CCCCCC',
                                }}
                            />
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>{t('hostname')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)', size: '22px'}}>
                                    {hasNodeData ? graphNodeInfo[focusedLink[0].nodeIp].hostname : '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={0}
                            justify="space-around"
                            alignItems="center"
                            style={{
                                marginTop: '15px',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>{t('model')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)', size: '22px'}}>
                                    {hasNodeData ? graphNodeInfo[focusedLink[0].nodeIp].model : '-'}
                                </Typography>
                            </Grid>
                            <Divider
                                orientation="vertical"
                                style={{
                                    height: '35px',
                                    border: '0.5px solid #CCCCCC',
                                }}
                            />
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>
                                    {t('channel-freq')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)'}}>
                                    {displayFrq}
                                </Typography>
                            </Grid>
                            <Divider
                                orientation="vertical"
                                style={{
                                    height: '35px',
                                    border: '0.5px solid #CCCCCC',
                                }}
                            />
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>
                                    {t('bandwidth')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)', size: '22px'}}>
                                    {hasLinkData ? linkData.info.channelBandwidth : '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={0}
                            justify="space-around"
                            alignItems="center"
                            style={{
                                marginTop: '15px',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>
                                    {t('radio')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)'}}>
                                    {hasLinkData ? t(linkData.nodes[focusedLink[0].nodeIp].radio) : '-'}
                                </Typography>
                            </Grid>
                            <Divider
                                orientation="vertical"
                                style={{
                                    height: '35px',
                                    border: '0.5px solid #CCCCCC',
                                }}
                            />
                            <Grid item>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.785)'}}>
                                    {t('txpower')}</Typography>
                                <Typography style={{color: 'rgba(33, 33, 33, 0.37)', size: '22px'}}>
                                    {hasLinkData && linkData.nodes[focusedLink[0].nodeIp].txpower ?
                                        linkData.nodes[focusedLink[0].nodeIp].txpower : '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </SwipeableViews>
                </Grid>
                <Grid item sm={1} >
                    <IconButton
                        aria-label="delete"
                        className={classes.margin}
                        size="small"
                        onClick={() => {
                            setState({nodeInfoMenuIndex: state.nodeInfoMenuIndex + 1});
                        }}
                        disabled={state.nodeInfoMenuIndex === 2}
                    >
                        <KeyboardArrowRightIcon fontSize="large" />
                    </IconButton>
                </Grid>
            </Grid>
            <div
                style={{textAlign: 'center'}}
            >
                <Button
                    className={classes.dotdot}
                    style={{backgroundColor: 'transparent'}}
                    disableFocusRipple
                    disableRipple
                    onClick={() => { setState({nodeInfoMenuIndex: 0}); }}
                >
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '5px',
                            height: '5px',
                            background: state.nodeInfoMenuIndex === 0 ? '#122D54' : 'rgba(33, 33, 33, 0.21)',
                        }}
                    />
                </Button>
                <Button
                    className={classes.dotdot}
                    style={{backgroundColor: 'transparent'}}
                    disableFocusRipple
                    disableRipple
                    onClick={() => { setState({nodeInfoMenuIndex: 1}); }}
                >
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '5px',
                            height: '5px',
                            background: state.nodeInfoMenuIndex === 1 ? '#122D54' : 'rgba(33, 33, 33, 0.21)',
                        }}
                    />
                </Button>
                <Button
                    className={classes.dotdot}
                    style={{backgroundColor: 'transparent'}}
                    disableFocusRipple
                    disableRipple
                    onClick={() => { setState({nodeInfoMenuIndex: 2}); }}
                >
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '5px',
                            height: '5px',
                            background: state.nodeInfoMenuIndex === 2 ? '#122D54' : 'rgba(33, 33, 33, 0.21)',
                        }}
                    />
                </Button>
            </div>
            <div
                style={{
                    width: '100%',
                    textAlign: 'right',
                }}
            >
                <IconButton
                    style={{
                        size: '8px',
                    }}
                    onClick={openFullPage}
                >
                    <i className="material-icons">
                        launch
                    </i>
                </IconButton>
            </div>
            <Grid
                container
                spacing={0}
                justify="space-around"
                alignItems="center"
                style={{
                    width: '100%',
                    textAlign: 'center',
                    paddingBottom: '25px',
                }}
            >
                <Grid>
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '12vw',
                            height: '12vw',
                            background: localNodeColor,
                            margin: '5px',
                        }}
                    >
                        <div
                            style={{
                                color: '#FFFFFF',
                                height: '100%',
                                transform: 'translateY(11%)',
                            }}
                        >
                            <div style={{fontSize: '1.6vw'}}>{t('local')}</div>
                            <div
                                style={{
                                    fontSize: '5vw',
                                    paddingRight: shouldShowLocalData && displayData.local.rssi !== 0 ?
                                        '0.8vw' : '0px',
                                }}
                            >
                                {displayData.local.rssi}</div>
                            {shouldShowLocalData ? <div style={{fontSize: '1.5vw'}}>{t('dBm')}</div> : ''}
                        </div>
                    </div>
                </Grid>
                <Grid>
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '12vw',
                            height: '12vw',
                            background: remoteNodeColor,
                            margin: '5px',
                        }}
                    >
                        <div
                            style={{
                                color: '#FFFFFF',
                                height: '100%',
                                transform: 'translateY(11%)',
                            }}
                        >
                            <div style={{fontSize: '1.6vw'}}>{t('remote')}</div>
                            <div
                                style={{
                                    fontSize: '5vw',
                                    paddingRight: shouldShowRemoteData && displayData.remote.rssi !== 0 ?
                                        '0.8vw' : '0px',
                                }}
                            >
                                {displayData.remote.rssi}</div>
                            {shouldShowRemoteData ? <div style={{fontSize: '1.5vw'}}>{t('dBm')}</div> : ''}
                        </div>
                    </div>
                </Grid>
            </Grid>
            <div
                style={{
                    borderRadius: '10px',
                    background: '#F1EEEE',
                    margin: '10px 1.5vw',
                    fontSize: '1.5vw',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        height: '2vw',
                        paddingTop: '0.1vw',
                        paddingLeft: '0.1vw',
                        textAlign: !isPolling && !starting ? 'center' : 'left',
                    }}
                >
                    <span
                        style={{
                            fontWeight: 450,
                            paddingTop: '0.6vw',
                            paddingLeft: isPolling ?
                                '0.5vw' : iff(!starting, '1vw', '8vw'),
                        }}
                    >
                        {stateTitle}
                    </span>
                    <div style={{display: 'inline-block', float: 'right', paddingRight: '0.2vw'}}>
                        <div style={{display: 'inline-block'}}>
                            {adJustFAB(classes, t('adjustConfigBtn'), openSwipeableMenu,
                                disableAdjustConfig)}
                        </div>
                        <div style={{display: 'inline-block', paddingLeft: '0.2vw'}}>
                            {alignmentFAB(classes, started ?
                                t('stopAlignmentBtn') : t('startAlignmentBtn'),
                            started ? stopRadioInfoInterval : startRadioInfoInterval,
                            starting, started)}
                        </div>
                    </div>
                </div>
                <Grid container style={{paddingBottom: '5px'}}>
                    {getStatDataLine(classes.rssiData, {localNodeColor, remoteNodeColor},
                        {shouldShowLocalData, shouldShowRemoteData},
                        {local: displayData.local.min, remote: displayData.remote.min}, t('graphDetailLabelMin'), t)}
                    {getStatDataLine(classes.rssiData, {localNodeColor, remoteNodeColor},
                        {shouldShowLocalData, shouldShowRemoteData},
                        {local: displayData.local.max, remote: displayData.remote.max}, t('graphDetailLabelMax'), t)}
                    {getStatDataLine(classes.rssiData, {localNodeColor, remoteNodeColor},
                        {shouldShowLocalData, shouldShowRemoteData},
                        {local: displayData.local.avg, remote: displayData.remote.avg}, t('graphDetailLabelAvg'), t)}
                </Grid>
            </div>
        </Card>
    );
};

LinkAlignmentNodeDetail.propTypes = {
    t: PropTypes.func.isRequired,
    openFullPage: PropTypes.func.isRequired,
    openSwipeableMenu: PropTypes.func.isRequired,
    stopRadioInfoInterval: PropTypes.func.isRequired,
    startRadioInfoInterval: PropTypes.func.isRequired,
    stateTitle: PropTypes.string.isRequired,
    focusedLink: PropTypes.arrayOf(PropTypes.shape({
        nodeIp: PropTypes.string,
    })).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    neiData: PropTypes.object.isRequired,
    displayData: PropTypes.shape({
        local: PropTypes.shape({
            min: PropTypes.string,
            max: PropTypes.string,
            avg: PropTypes.string,
            rssi: PropTypes.string,
        }),
        remote: PropTypes.shape({
            min: PropTypes.string,
            max: PropTypes.string,
            avg: PropTypes.string,
            rssi: PropTypes.string,
        }),
    }).isRequired,
    shouldShowLocalData: PropTypes.bool.isRequired,
    shouldShowRemoteData: PropTypes.bool.isRequired,
    localNodeColor: PropTypes.string.isRequired,
    remoteNodeColor: PropTypes.string.isRequired,
    displayFrq: PropTypes.string.isRequired,
    isPolling: PropTypes.bool.isRequired,
    starting: PropTypes.bool.isRequired,
    // radioDevice: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkData: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    graphNodeInfo: PropTypes.object.isRequired,
    disableAdjustConfig: PropTypes.bool.isRequired,
};

export default LinkAlignmentNodeDetail;
