import React from 'react';
import PropTypes from 'prop-types';
import {Transition} from 'react-transition-group';
import {makeStyles} from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import RouterIcon from '@material-ui/icons/Router';
import {iff} from '../../util/commonFunc';
import {getBitRate} from '../../util/formatConvertor';
import {
    duration, fade, fadeOrg,
    getLoadingWrapper, StyledDivider,
    styles,
} from './linkInfoCardHelperFunc';
import CommonConstants from '../../constants/common';

const {radioShortForm} = CommonConstants;

const useStyle = makeStyles(styles);

const LinkInfoCard = (props) => {
    const {
        t,
        isEmpty, isDashboardView,
        x, y,
        linkData,
        nodeA, nodeB,
        color,
    } = props;
    const showData = nodeA.isManaged || nodeB.isManaged;

    const classes = useStyle();
    const is49 = isEmpty ? false : linkData.info.band !== '5';
    const channelTitle = is49 ? 'frequency' : 'channel';
    let displayChannel = '';
    if (!showData) displayChannel = t('n/a');
    else if (linkData.info.channel === 'invalid') displayChannel = t('n/a');
    else if (is49) displayChannel = `${linkData.info.frequency}`;
    else displayChannel = `${linkData.info.channel} (${linkData.info.frequency})`;

    const linkInfoCard = (
        <Card style={{width: '460px', zIndex: '1000'}} >
            {getLoadingWrapper(isEmpty, classes)}
            <CardContent classes={{root: classes.contentRoot}}>
                <Grid container spacing={0}>
                    <Grid item xs>
                        <Typography variant="body2" className={classes.paper}>
                            <b>{isEmpty ? t('hyphen') : nodeA.hostName}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={classes.center}>
                            <Typography
                                className={classes.duplex}
                                variant="body2"
                            >
                                <b>{t(channelTitle)}: </b>{isEmpty ?
                                    t('hyphen') : displayChannel}
                            </Typography>
                            <Typography
                                className={classes.duplex}
                                variant="body2"
                            >
                                <b>{t('bandwidth')}: </b>{isEmpty ?
                                    t('hyphen') : iff(showData, linkData.info.channelBandwidth, t('n/a'))
                                }
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="body2" className={classes.paper}>
                            <b>{isEmpty ? t('hyphen') : nodeB.hostName}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Grid
                    container
                    spacing={0}
                    justify="center"
                    alignItems="center"
                >
                    <Grid item xs >
                        <div className={classes.iconWrapperLeftRadio}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeA.isManaged ?
                                        iff(isDashboardView, classes.dashboardViewColor, classes.nodeAColor)
                                        : classes.unmanagedNodeColor,
                                }}
                                size="small"
                            >
                                <RouterIcon />
                            </Fab>
                        </div>
                    </Grid>
                    <Grid item xs={8} >
                        <div className={classes.middle}>
                            <StyledDivider
                                color={color}
                            />
                            <Typography
                                className={classes.dataRateBack}
                                variant="body2"
                            >
                                <i
                                    style={{
                                        width: '12px',
                                        height: '18px',
                                        position: 'relative',
                                        top: '3px',
                                        marginRight: '5px',
                                        fill: '#fff',
                                        fontSize: '15px',
                                        fontWeight: 'bold',
                                    }}
                                    className="material-icons"
                                >
                                    arrow_forward
                                </i>
                                <b>{`${t('dataRate')}: `}</b>{isEmpty ?
                                    t('hyphen') : iff(showData, getBitRate(linkData.nodes[nodeA.ip].bitrate), t('n/a'))
                                }
                            </Typography>
                            <Typography
                                className={classes.dataRateForward}
                                variant="body2"
                            >
                                <i
                                    style={{
                                        width: '12px',
                                        height: '18px',
                                        position: 'relative',
                                        top: '3px',
                                        marginRight: '5px',
                                        fill: '#fff',
                                        fontSize: '15px',
                                        fontWeight: 'bold',
                                    }}
                                    className="material-icons"
                                >
                                    arrow_back
                                </i>
                                <b>{`${t('dataRate')}: `}</b>{isEmpty ?
                                    t('hyphen') : iff(showData, getBitRate(linkData.nodes[nodeB.ip].bitrate), t('n/a'))
                                }
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs >
                        <div className={classes.iconWrapperRightRadio}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeB.isManaged ?
                                        iff(isDashboardView, classes.dashboardViewColor, classes.nodeBColor)
                                        : classes.unmanagedNodeColor,
                                }}
                                size="small"
                            >
                                <RouterIcon />
                            </Fab>
                        </div>
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs>
                        <div className={classes.bottomRadio}>
                            <Typography variant="body2" style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                <b>{isEmpty ? t('hyphen') :
                                    iff(nodeA.isManaged && nodeA.isAuth,
                                        radioShortForm[linkData.nodes[nodeA.ip].radio], t('n/a'))}</b>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={2} />
                    <Grid item xs>
                        <div className={classes.bottomRadio}>
                            <Typography variant="body2" style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                <b>{isEmpty ? t('hyphen') :
                                    iff(nodeB.isManaged && nodeB.isAuth,
                                        radioShortForm[linkData.nodes[nodeB.ip].radio], t('n/a'))}</b>
                            </Typography>
                        </div>
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs>
                        <div className={classes.radioRssiWrapper}>
                            <Typography variant="body2" style={{fontSize: '10px'}}>
                                <b>{t('rssi')}</b>: <b>{isEmpty || !nodeA.isAuth ?
                                    t('hyphen') : iff(linkData.nodes[nodeA.ip].signalLevel === '',
                                        t('hyphen'), linkData.nodes[nodeA.ip].signalLevel)}</b>
                            </Typography>
                            <Typography variant="body2" style={{fontSize: '10px'}}>
                                <b>{t('txPower')}</b>: <b>{isEmpty || !nodeA.isAuth ?
                                    t('hyphen') : iff(linkData.nodes[nodeA.ip].txpower === '',
                                        t('hyphen'), linkData.nodes[nodeA.ip].txpower)}</b>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs>
                        <div className={classes.radioRssiWrapper}>
                            <Typography variant="body2" style={{fontSize: '10px'}}>
                                <b>{t('rssi')}</b>: <b>{isEmpty || !nodeB.isAuth ?
                                    t('hyphen') : iff(linkData.nodes[nodeB.ip].signalLevel === '',
                                        t('hyphen'), linkData.nodes[nodeB.ip].signalLevel)}</b>
                            </Typography>
                            <Typography variant="body2" style={{fontSize: '10px'}}>
                                <b>{t('txPower')}</b>: <b>{isEmpty || !nodeB.isAuth ?
                                    t('hyphen') : iff(linkData.nodes[nodeB.ip].txpower === '',
                                        t('hyphen'), linkData.nodes[nodeB.ip].txpower)}</b>
                            </Typography>
                        </div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                zIndex: 100,
                pointerEvents: 'none',
            }}
        >
            <Transition in timeout={duration}>
                {state => (
                    <div
                        style={{
                            ...fadeOrg,
                            ...fade[state],
                        }}
                    >
                        {linkInfoCard}
                    </div>
                )}
            </Transition>
        </div>
    );
};

LinkInfoCard.propTypes = {
    t: PropTypes.func.isRequired,
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    y: PropTypes.number.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    linkData: PropTypes.shape({
        info: PropTypes.shape({
            band: PropTypes.string,
            channel: PropTypes.string,
            frequency: PropTypes.string,
            channelBandwidth: PropTypes.string,
        }),
        nodes: PropTypes.objectOf(
            PropTypes.shape({
                txpower: PropTypes.string,
                bitrate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                radio: PropTypes.string,
                signalLevel: PropTypes.string,
            })
        ),
    }).isRequired,
    nodeA: PropTypes.shape({
        ip: PropTypes.string,
        hostName: PropTypes.string,
        isManaged: PropTypes.bool,
        isAuth: PropTypes.bool,
    }).isRequired,
    nodeB: PropTypes.shape({
        ip: PropTypes.string,
        hostName: PropTypes.string,
        isManaged: PropTypes.bool,
        isAuth: PropTypes.bool,
    }).isRequired,
    color: PropTypes.string.isRequired,
    isDashboardView: PropTypes.bool.isRequired,
};

export default LinkInfoCard;
