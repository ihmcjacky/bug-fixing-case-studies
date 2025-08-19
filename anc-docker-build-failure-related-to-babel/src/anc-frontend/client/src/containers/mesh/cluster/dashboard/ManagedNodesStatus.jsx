import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Grid, Typography, Button} from '@material-ui/core';
// import {Grid, Typography, Button, IconButton} from '@material-ui/core';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import Constant from '../../../../constants/common';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import {updateStatusKey} from '../../../../redux/dashboard/dashboardActions';

const styles = {
    textAlignment: {
        textAlign: 'center',
    },
    buttonSize: {
        width: '100%',
        height: '100%',
    },
    buttonHeader: {
        fontSize: '36px',
        lineHeight: '42px',
    },
    buttonContent: {
        fontSize: '12px',
        lineHeight: '14px',
        padding: '10px 0',
    },
};

// const cardToolsStyles = {
//     fontSize: '16px',
//     color: Constant.colors.dataTxt,
// };

const theme1 = {
    color: Constant.colors.totalNodes,
};

const theme2 = {
    color: Constant.colors.appBarMenuItem,
};

const theme3 = {
    color: Constant.colors.inactiveRed,
};

const iconStyles = {
    borderWidth: '2px',
    borderStyle: 'solid',
    padding: '3px 3px',
    borderRadius: '20px',
};

const icon1 = {
    borderWidth: iconStyles.borderWidth,
    borderStyle: iconStyles.borderStyle,
    padding: iconStyles.padding,
    borderRadius: iconStyles.borderRadius,
    borderColor: theme1.color,
    color: theme1.color,
};

const icon2 = {
    borderWidth: iconStyles.borderWidth,
    borderStyle: iconStyles.borderStyle,
    padding: iconStyles.padding,
    borderRadius: iconStyles.borderRadius,
    borderColor: theme2.color,
    color: theme2.color,
};

const icon3 = {
    borderWidth: iconStyles.borderWidth,
    borderStyle: iconStyles.borderStyle,
    padding: iconStyles.padding,
    borderRadius: iconStyles.borderRadius,
    borderColor: theme3.color,
    color: theme3.color,
};

function ManagedNodesStatus(props) {
    const {nodes, classes} = props;
    const total = nodes.length - nodes.filter(node => !node.isManaged && !node.isReachable).length;
    const unmanaged = nodes.filter(node => !node.isManaged && node.isReachable).length;
    const reachable = nodes.filter(node => node.isReachable && node.isManaged).length;
    const unreachable = nodes.filter(node => node.isManaged && !node.isReachable).length;
    // const managedNodeCardTools = [
    //     (
    //         <IconButton style={{padding: '7px'}} key="tool-1" aria-label="remove">
    //             <i className="material-icons" style={cardToolsStyles}>
    //             remove_circle_outline
    //             </i>
    //         </IconButton>
    //     ),
    // ];
    const cardContent = (
        <Grid container spacing={0} style={{padding: '0 20px'}}>
            <Grid item xs={3} className={classes.textAlignment}>
                <Button
                    onClick={() => props.updateStatusKey('all')}
                    className={classes.buttonSize}
                >
                    <Grid>
                        <Typography
                            style={{
                                fontSize: '56px',
                                lineHeight: '64px',
                                color: Constant.colors.totalNodes,
                            }}
                            component="p"
                        >
                            {total}
                        </Typography>
                        <Typography
                            style={{
                                fontSize: '18px',
                                lineHeight: '21px',
                                padding: '10px 0',
                                color: Constant.colors.totalNodes,
                            }}
                            component="p"
                        >
                            {props.t('total')}
                        </Typography>
                    </Grid>
                </Button>
            </Grid>
            <Grid item xs={3} className={classes.textAlignment}>
                <Button
                    onClick={() => props.updateStatusKey('reachable')}
                    className={classes.buttonSize}
                >
                    <Grid>
                        <Typography className={classes.buttonHeader} style={theme2} component="p">
                            {reachable}
                        </Typography>
                        <Typography className={classes.buttonContent} style={theme2} component="p">
                            {props.t('reachable')}
                        </Typography>
                        <i style={icon2} className="material-icons">
                            router
                        </i>
                    </Grid>
                </Button>
            </Grid>
            <Grid item xs={3} className={classes.textAlignment}>
                <Button
                    onClick={() => props.updateStatusKey('unreachable')}
                    className={classes.buttonSize}
                    style={{borderLeft: '1px solid rgba(0, 0, 0, 0.12)', borderRight: '1px solid rgba(0, 0, 0, 0.12)'}}
                >
                    <Grid>
                        <Typography className={classes.buttonHeader} style={theme3} component="p">
                            {unreachable}
                        </Typography>
                        <Typography className={classes.buttonContent} style={theme3} component="p">
                            {props.t('unreachable')}
                        </Typography>
                        <i style={icon3} className="material-icons">
                            router
                        </i>
                    </Grid>
                </Button>
            </Grid>
            <Grid item xs={3} className={classes.textAlignment}>
                <Button
                    onClick={() => props.updateStatusKey('unmanaged')}
                    className={classes.buttonSize}
                >
                    <Grid>
                        <Typography className={classes.buttonHeader} style={theme1} component="p">
                            {unmanaged}
                        </Typography>
                        <Typography className={classes.buttonContent} style={theme1} component="p">
                            {props.t('unmanaged')}
                        </Typography>
                        <i style={icon1} className="material-icons">
                            router
                        </i>
                    </Grid>
                </Button>
            </Grid>
            <Grid item xs={12} style={{textAlign: 'left', display: 'flex', alignItems: 'flex-end'}}>
                <Typography
                    component="p"
                    style={{
                        fontSize: '10px',
                        fontFamily: 'Roboto',
                        lineHeight: '27px',
                        color: Constant.colors.footerTxt,
                    }}
                >
                    {props.t('footerTxt')}
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <P2CardContainer
            cardTitle={props.t('cardTitle')}
            cardTitleLimit={30}
            // cardTools={managedNodeCardTools}
            cardContent={cardContent}
            minWidth="400px"
            minHeight="200px"
            showHelperTooltip={false}
        />
    );
}

function mapStateToProps(store) {
    return {
        nodes: store.meshTopology.graph.nodes.filter(node => node.id !== '127.0.0.1'),
    };
}

ManagedNodesStatus.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    updateStatusKey: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    t: PropTypes.func.isRequired,
};

export default compose(
    connect(mapStateToProps, {updateStatusKey}),
    withTranslation(['managed-nodes-status']),
    withStyles(styles)
)(ManagedNodesStatus);
