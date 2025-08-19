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
import {getBitRate} from '../../util/formatConvertor';
import {iff} from '../../util/commonFunc';
import {
    duration, fade, fadeOrg,
    getLoadingWrapper, StyledDivider,
    styles,
} from './linkInfoCardHelperFunc';

const useStyle = makeStyles(styles);

const EthLinkInfoCard = (props) => {
    const {
        t,
        isEmpty,
        x, y,
        linkData,
        nodeA, nodeB,
        color,
    } = props;
    const showData = nodeA.isManaged || nodeB.isManaged;

    const classes = useStyle();

    const linkInfoCard = (
        <Card
            style={{width: '430px', zIndex: '1000'}}
        >
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
                                style={{
                                    paddingTop: '10px',
                                }}
                                className={classes.duplex}
                                variant="body2"
                            >
                                <b>{t('speed')}: </b>{isEmpty ?
                                    t('hyphen') : iff(showData, getBitRate(linkData.info.speed), t('n/a'))
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
                        <div className={classes.iconWrapperLeft}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeA.isManaged ? classes.nodeAColor : classes.unmanagedNodeColor,
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
                                style={{paddingTop: '10px'}}
                                className={classes.duplex}
                                variant="body2"
                            >
                                <b>{t('duplex')}: </b>{isEmpty ?
                                    t('hyphen') : iff(showData, t(linkData.info.duplexStatus), t('n/a'))
                                }
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs >
                        <div className={classes.iconWrapperRight}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeB.isManaged ? classes.nodeBColor : classes.unmanagedNodeColor,
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
                        <div className={classes.bottom}>
                            <Typography variant="body2" style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                <b>{isEmpty ? t('hyphen') :
                                    iff(nodeA.isManaged, linkData.nodes[nodeA.ip].eth, t('n/a'))}</b>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={2} />
                    <Grid item xs>
                        <div className={classes.bottom}>
                            <Typography variant="body2" style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                <b>{isEmpty ? t('hyphen') :
                                    iff(nodeB.isManaged, linkData.nodes[nodeB.ip].eth, t('n/a'))}</b>
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

EthLinkInfoCard.propTypes = {
    t: PropTypes.func.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    linkData: PropTypes.shape({
        info: PropTypes.shape({
            duplexStatus: PropTypes.string,
            speed: PropTypes.oneOfType(
                [
                    PropTypes.string,
                    PropTypes.number,
                ]
            ),
        }),
        nodes: PropTypes.objectOf(
            PropTypes.shape({
                eth: PropTypes.string,
            })
        ),
    }).isRequired,
    nodeA: PropTypes.shape({
        ip: PropTypes.string,
        hostName: PropTypes.string,
        isManaged: PropTypes.bool,
    }).isRequired,
    nodeB: PropTypes.shape({
        ip: PropTypes.string,
        hostName: PropTypes.string,
        isManaged: PropTypes.bool,
    }).isRequired,
    color: PropTypes.string.isRequired,
};

export default EthLinkInfoCard;
