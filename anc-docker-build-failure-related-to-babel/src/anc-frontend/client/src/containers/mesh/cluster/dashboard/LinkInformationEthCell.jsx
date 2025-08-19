import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import {getBitRate} from '../../../../util/formatConvertor';
import Constant from '../../../../constants/common';
import {getNodeColor, getNodeIconImage} from '../topology/topologyGraphHelperFunc';
import P2Tooltip from '../../../../components/common/P2Tooltip';

const StyledDivider = withStyles({
    root: props => ({
        borderTop: `2px solid ${props.color}`,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0)',
    }),
})(Divider);

const {rssiColor, theme} = Constant;

const createHostnameElement = (mac, hostname, isHostNode, isAuth, isReachable, isManaged, operationMode, preloadIcon, pos) => {
    return (hostname.length > 20 ?
        (<P2Tooltip
            direction="right"
            title={<div style={{
                fontSize: '12px',
                padding: '2px',
            }}
            >
                {hostname}
            </div>}
            content={
                <div 
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                        flexDirection: pos === 'left' ? 'row' : 'row-reverse'
                    }}
                >
                    <div
                        style={{
                            width: '35px',
                            height: '35px',
                            backgroundColor: getNodeColor(isManaged, isReachable, false , false, false, false),
                            borderRadius: '50%',
                            marginLeft: '15px',
                        }}
                    >
                        <img
                            src={
                                getNodeIconImage(isAuth, isReachable, isManaged, false, false, operationMode, preloadIcon)
                            }
                            alt="node-icon"
                            style={{
                                width: '24px',
                                height: '24px',
                                marginLeft: '1px',
                                marginTop: '4px',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            marginTop: '5px',
                            // marginLeft: '10px',
                            width: '200px',
                            textAlign: 'center'
                        }}
                    >
                        {`${hostname.substring(0, 18)}...`}{isHostNode &&
                        (
                            <span style={{color: theme.palette.primary.main, paddingLeft: '2px'}}>
                                *
                            </span>
                        )}
                        <br/>
                        {`${mac}`}
                    </div>
                </div>
            }
        />) :
        (<div
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                cursor: 'pointer',
                flexDirection: pos === 'left' ? 'row' : 'row-reverse'
            }}
        >
            <div
                style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: getNodeColor(isManaged, isReachable, false , false, false, false),
                    borderRadius: '50%',
                    marginLeft: '15px',
                }}
            >
                <img
                    src={
                        getNodeIconImage(isAuth, isReachable, isManaged, false, false, operationMode, preloadIcon)
                    }
                    alt="node-icon"
                    style={{
                        width: '24px',
                        height: '24px',
                        marginLeft: '1px',
                        marginTop: '4px',
                    }}
                />
            </div>
            <div
                style={{
                    marginTop: '5px',
                    // marginLeft: '10px',
                    width: '200px',
                    flexBasis: 'max-content',
                }}
            >
                {hostname}{isHostNode &&
                (
                    <span style={{color: theme.palette.primary.main, paddingLeft: '2px'}}>
                        *
                    </span>
                )}
                <br/>
                {`${mac}`}
            </div>
        </div>));
}

const LinkInformationEthCell = function (props) {
    const {
        classes,
        speed,
        duplex,
        nodeA,
        nodeB,
        t,
        preloadIcon,
        handleContextMenuOpen,
    } = props;

    return (
        <div
            styles={{
                width: '100%',
                minWidth: '700px',
                hight: '80px',
            }}
        >
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                spacing={0}
            >
                <Grid
                    item xs={2}
                    onContextMenu={(e) => {
                        if (nodeA.isAuth !== 'yes') {
                            return;
                        } 
                        handleContextMenuOpen(e, nodeA.ip, nodeA.isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');}
                    }
                >
                    {/* <div
                        style={{
                            display: 'flex',
                            justifyContent: 'start',
                            cursor: 'pointer'
                        }}
                        onContextMenu={(e) => {
                            if (nodeA.isAuth !== 'yes') {
                                return;
                            } 
                            handleContextMenuOpen(e, nodeA.ip, nodeA.isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');}
                        }
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: getNodeColor(nodeA.isManaged, nodeA.isReachable, false , false, false, false),
                                borderRadius: '50%',
                                marginLeft: '30px',
                                marginRight: '30px',
                            }}
                        >
                            <img
                                src={
                                    getNodeIconImage(nodeA.isAuth, nodeA.isReachable, nodeA.isManaged, false, false, nodeA.operationMode, preloadIcon)
                                }
                                alt="node-icon"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    marginLeft: '0px',
                                    marginTop: '6px',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginLeft: '10px',
                            }}
                        >
                            <div>
                                {nodeA.hostname}{nodeA.isHostNode ? (
                                    <span style={{color: 'rgb(18, 45, 84)'}}>
                                        *
                                    </span>
                                ) : ''
                                }
                            </div>
                            <div>
                                {`(${nodeA.mac})`}
                            </div>
                        </div>
                    </div> */}
                    {
                        createHostnameElement(
                            nodeA.mac,
                            nodeA.hostname,
                            nodeA.isHostNode,
                            nodeA.isAuth,
                            nodeA.isReachable,
                            nodeA.isManaged,
                            nodeA.operationMode,
                            preloadIcon,
                            'left',
                        )
                    }
                </Grid>
                <Grid item xs>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item xs={1}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeA.isManaged ? classes.nodeAStyle : classes.unmanagedNodeAStyle,
                                    label: classes.fabLabel,
                                }}
                                size="small"
                                disableRipple
                            >
                                {nodeA.isManaged ? nodeA.eth : t('hyphen')}
                            </Fab>
                        </Grid>
                        <Grid item xs>
                            <div>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="flex-end"
                                    style={{
                                        height: '50px',
                                        padding: '0px 5px',
                                    }}
                                >
                                    <Grid item xs={3} />
                                    <Grid item xs={6}>
                                        <div className={classes.middleTop}>
                                            <Typography variant="body2" >
                                                <b>{t('speed')}: </b> {nodeA.isManaged || nodeB.isManaged ?
                                                    getBitRate(speed) : t('hyphen')}
                                            </Typography>
                                        </div>
                                    </Grid>
                                    <Grid item xs={3} />
                                </Grid>
                                <StyledDivider
                                    color={!nodeA.isManaged || !nodeB.isManaged ?
                                        rssiColor.unmanaged : rssiColor.default}
                                />
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="flex-start"
                                    style={{
                                        height: '45px',
                                        padding: '0px 5px',
                                    }}
                                >
                                    <Grid item xs={3} />
                                    <Grid item xs={6}>
                                        <div className={classes.middle}>
                                            <Typography
                                                style={{paddingTop: '5px'}}
                                                variant="body2"
                                            >
                                                <b>{t('duplex')}: </b> {nodeA.isManaged || nodeB.isManaged ?
                                                    t(duplex) : t('hyphen')}
                                            </Typography>
                                        </div>
                                    </Grid>
                                    <Grid item xs={3} />
                                </Grid>
                            </div>
                        </Grid>
                        <Grid item xs={1}>
                            <Fab
                                color="primary"
                                classes={{
                                    root: nodeB.isManaged ? classes.nodeBStyle : classes.unmanagedNodeBStyle,
                                    label: classes.fabLabel,
                                }}
                                size="small"
                                disableRipple
                            >
                                {nodeB.isManaged ? nodeB.eth : t('hyphen')}
                            </Fab>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    item xs={2}
                    onContextMenu={(e) => {
                        if (nodeB.isAuth !== 'yes') {
                            return;
                        } 
                        handleContextMenuOpen(e, nodeB.ip, nodeB.isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
                    }}
                >
                    {/* <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            cursor: 'pointer'
                        }}
                        onContextMenu={(e) => {
                            if (nodeB.isAuth !== 'yes') {
                                return;
                            } 
                            handleContextMenuOpen(e, nodeB.ip, nodeB.isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
                        }}
                    > */}
                        {/* <div
                            style={{
                                marginLeft: '10px',
                            }}
                        >
                            <div>
                                {nodeB.hostname}{nodeB.isHostNode ? (
                                    <span style={{color: 'rgb(18, 45, 84)'}}>
                                        *
                                    </span>
                                ) : ''
                                }
                            </div>
                            <div>
                                {`(${nodeB.mac})`}
                            </div>
                        </div>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: getNodeColor(nodeB.isManaged, nodeB.isReachable, false , false, false, false),
                                borderRadius: '50%',
                                marginRight: '30px',
                                marginLeft: '30px',
                            }}
                        >
                            <img
                                src={
                                    getNodeIconImage(nodeB.isAuth, nodeB.isReachable, nodeB.isManaged, false, false, nodeB.operationMode, preloadIcon)
                                }
                                alt="node-icon"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    marginLeft: '0px',
                                    marginTop: '6px',
                                }}
                            />
                        </div>
                    </div> */}
                    {
                        createHostnameElement(
                            nodeB.mac,
                            nodeB.hostname,
                            nodeB.isHostNode,
                            nodeB.isAuth,
                            nodeB.isReachable,
                            nodeB.isManaged,
                            nodeB.operationMode,
                            preloadIcon,
                            'right'
                        )
                    }
                </Grid>
            </Grid>
        </div>
    );
};

const styles = {
    unmanagedNodeAStyle: {
        float: 'right',
        display: 'inline-block',
        pointerEvents: 'none',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        backgroundColor: Constant.rssiColor.unmanaged,
    },
    unmanagedNodeBStyle: {
        float: 'left',
        display: 'inline-block',
        pointerEvents: 'none',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        backgroundColor: Constant.rssiColor.unmanaged,
    },
    nodeAStyle: {
        float: 'right',
        display: 'inline-block',
        pointerEvents: 'none',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
    },
    contentStyle: {
        width: '100%',
        display: 'inline-block',
    },
    nodeBStyle: {
        float: 'left',
        display: 'inline-block',
        pointerEvents: 'none',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
    },
    fabLabel: {
        fontSize: '12px',
        marginTop: '4px',
    },
    diverRoot: {
        borderTop: '2px dashed #425581',
        width: '100%',
    },
    left: {
        float: 'left',
        display: 'inline-block',
    },
    middle: {
        textAlign: 'center',
        fontSize: '10px',
    },
    middleTop: {
        paddingBottom: '10px',
    },
    right: {
        float: 'right',
        display: 'inline-block',
    },
};
LinkInformationEthCell.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line
    speed: PropTypes.number.isRequired,
    duplex: PropTypes.string.isRequired,
    nodeA: PropTypes.shape({
        hostname: PropTypes.string.isRequired,
        mac: PropTypes.string.isRequired,
        eth: PropTypes.string.isRequired,
        isHostNode: PropTypes.bool,
        isManaged: PropTypes.bool.isRequired,
    }).isRequired,
    nodeB: PropTypes.shape({
        hostname: PropTypes.string.isRequired,
        mac: PropTypes.string.isRequired,
        eth: PropTypes.string.isRequired,
        isHostNode: PropTypes.bool,
        isManaged: PropTypes.bool.isRequired,
    }).isRequired,
};

// export default MeshInfoCard;
export default compose(
    withTranslation(['cluster-topology-link-info-card']),
    withStyles(styles))(LinkInformationEthCell);
