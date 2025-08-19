/**
 * @Author: mango
 * @Date:   2018-03-28T13:53:17+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T15:23:13+08:00
 */
import React from 'react';
import Draggable from 'react-draggable';
import moment from 'moment';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
// import Card, {CardHeader, CardContent} from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {withStyles} from '@material-ui/core/styles';
import SecuritiesBox from './SecuritiesBox';
import ConfigurationBox from './ConfigurationBox';
import MaintenancesBox from './MaintenancesBox';
import StatisticBox from '../statistics/StatisticBox';
import OverviewBox from '../nodeMaintenances/OverviewBox';
import LockLayer from '../common/LockLayer';
import Constant from '../../constants/common';
import LinearProgress from '@material-ui/core/LinearProgress';

const {
    colors,
    themeObj,
} = Constant;

const modelHeader = {
    padding: '15px 20px 15px 25px',
    backgroundColor: themeObj.primary.main,
};

const getHeaderStyle = (isReachable) => {
    if (isReachable) {
        return {
            padding: '15px 20px 15px 25px',
            backgroundColor: themeObj.primary.main,
        };
    }
    return {
        padding: '15px 20px 15px 25px',
        backgroundColor: themeObj.error.main,
    };
};

// const wrapper = {
//     width: '520px',
// };
const nav = {
    width: '100%',
};
const transparentNav = {
    opacity: 0,
    width: '100%',
};
class DraggableModel extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.state = {
            value: props.initIndex,
            nodeInfo: props.nodeInfo,
            style: {
                // opacity: 1,
                width: '800px',
                // transition: 'all 0.3s ease-in',
            },
            isLock: false,
            onDragging: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.clickTitle = this.clickTitle.bind(this);
        // this.mountStyle = this.mountStyle.bind(this);
        // this.unMountStyle = this.unMountStyle.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.shouldDisableTabForNotAccessableNode = this.shouldDisableTabForNotAccessableNode.bind(this);
        this.isNodeReachable = this.isNodeReachable.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.close = this.close.bind(this);
        this.updateIsLock = this.updateIsLock.bind(this);
        this.modelState = [];
    }
    
    componentDidMount() {
        // setTimeout(this.mountStyle, 10);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            {
                nodeInfo: nextProps.nodeInfo,
            }
        );
    }

    shouldDisableTabForNotAccessableNode() {
        const {graphNodeData} = this.props;
        if (!graphNodeData) {
            return true;
        }
        if (graphNodeData && graphNodeData.isReachable && graphNodeData.isAuth === 'yes') {
            return false;
        }
        return true;
    }

    isNodeReachable() {
        const {graphNodeData} = this.props;
        if (graphNodeData && graphNodeData.isReachable) {
            return true;
        }
        return false;
    }

    getClassName() {
        return `${this.state.modelState.map(
            i => this.props[i]
        ).join(' ')}`;
    }

    updateIsLock(isLock) {
        this.setState({
            isLock,
        });
    }

    // unMountStyle() { // css for unmount animation
    //     this.setState({
    //         style: {
    //             width: '800px',
    //             opacity: 0,
    //             overflow: 'hidden',
    //             transition: 'all 1s ease-in',
    //         },
    //     });
    // }

    // mountStyle() { // css for mount animation
    //     this.setState({
    //         style: {
    //             width: '800px',
    //             opacity: 1,
    //             transition: 'all 0.3s ease-in',
    //         },
    //     });
    //     setTimeout(
    //         () => {
    //             this.setState({
    //                 style: {
    //                     width: '800px',
    //                     opacity: 1,
    //                 },
    //             });
    //         }, 500
    //     );
    // }
    close() {
        this.props.close(this.props.nodes[0].ipv4);
    }
    clickTitle() {
        this.props.handleClickTitle(this.props.nodes[0].ipv4);

    }
    handleChange(event, value) {
        this.setState({value});
    }
    handleDragStart() {
        this.setState(
            {
                onDragging: true,
            }
        );
    }
    handleDragEnd() {
        this.setState(
            {
                onDragging: false,
            }
        );
    }
    render() {
        const {classes} = this.props;
        const {graphNodeData} = this.props;
        const {onDragging} = this.state;
        return (
            <Draggable
                bounds=".mesh-container"
                defaultPosition={{x: parseInt(this.props.initPos.x, 10), y: parseInt(this.props.initPos.y, 10)}}
                handle=".draggable"
                onMouseDown={this.clickTitle}
                // defaultClassNameDragging={classes.onDragStyle}
                onStart={this.handleDragStart}
                onStop={this.handleDragEnd}
            >
                <Paper className={onDragging ? classes.notShowContent : classes.showContent}>
                    <LockLayer
                        display={this.state.isLock}
                        top={false}
                        left={false}
                        zIndex={200}
                        opacity={1}
                        color={colors.lockLayerBackground}
                        hasCircularProgress
                        circularMargin="-40px"
                    />
                    <div
                        style={{
                            ...getHeaderStyle(
                                this.isNodeReachable()
                            ),
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        className="model-header draggable"
                        id={`${this.state.nodeInfo.hostname}-${this.state.nodeInfo.sn}`}
                    >
                        {
                            this.shouldDisableTabForNotAccessableNode() && this.isNodeReachable() ? (
                                <div class={classes.LoadingBar}>
                                    <LinearProgress/>
                                </div>
                            )  : null
                        }
                        <div>
                            <Typography classes={{h5: classes.headerTitle}} variant="h5">
                                {this.state.nodeInfo.hostname}
                            </Typography>
                            
                            <Typography classes={{h6: classes.subHeaderTitle}} variant="h6">
                                ({this.state.nodeInfo.mac})
                            </Typography>
                        </div>
                        
                        <Typography
                            classes={{subtitle2: classes.lastUpdateTimeTitle}}
                            variant='subtitle2'
                            style={{marginLeft: 'auto', marginRight: '6px'}}
                        >
                            {this.t('lastUpdateTimeTitle')} {this.props.nodeInfo && moment(this.props.nodeInfo.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss') || ''}
                        </Typography>

                        <div
                            role="presentation"
                            onKeyPress={() => {}}
                            onClick={this.close}
                            className={classes.close}
                        >
                            <CloseIcon />
                        </div>
                    </div>
                    <div className={onDragging ? classes.notShowNav : classes.nav}>
                        <AppBar position="static" color="default" style={{height: '34px'}}>
                            <Tabs
                                value={this.state.value}
                                indicatorColor="secondary"
                                textColor="inherit"
                                onChange={this.handleChange}
                                variant="fullWidth"
                                style={{minHeight: '34px'}}
                                data-test-id={`${this.state.nodeInfo.hostname}-${this.state.nodeInfo.sn}-tabpanel`}
                            >
                                <Tab
                                    label={this.t('overviewTabLabel')}
                                    classes={{root: classes.root}}
                                    style={
                                        {
                                            backgroundColor: this.isNodeReachable() ? themeObj.primary.light : themeObj.error.light,
                                        }
                                    }
                                />
                                <Tab
                                    label={this.t('statTabLabel')}
                                    classes={{root: classes.root, disabled: classes.disabledTab}}
                                    disabled={this.shouldDisableTabForNotAccessableNode()}
                                    style={
                                        {
                                            backgroundColor: this.isNodeReachable() ? themeObj.primary.light : themeObj.error.light,
                                        }
                                    }
                                />
                                <Tab
                                    label={this.t('configTabLabel')}
                                    classes={{root: classes.root}}
                                    style={
                                        {
                                            backgroundColor: this.isNodeReachable() ? themeObj.primary.light : themeObj.error.light,
                                        }
                                    }
                                />
                                <Tab
                                    label={this.t('maintainTabLabel')}
                                    classes={{root: classes.root, disabled: classes.disabledTab}}
                                    disabled={this.shouldDisableTabForNotAccessableNode()}
                                    style={
                                        {
                                            backgroundColor: this.isNodeReachable() ? themeObj.primary.light : themeObj.error.light,
                                        }
                                    }
                                />
                                <Tab
                                    label={this.t('securityTabLabel')}
                                    classes={{root: classes.root, disabled: classes.disabledTab}}
                                    disabled={this.shouldDisableTabForNotAccessableNode()}
                                    style={
                                        {
                                            backgroundColor: this.isNodeReachable() ? themeObj.primary.light : themeObj.error.light,
                                        }
                                    }
                                />
                            </Tabs>
                        </AppBar>
                    </div>
                    <div className={onDragging ? classes.notShowModelContent : classes.modelContent}>
                        <SwipeableViews
                            axis="x"
                            index={this.state.value}
                        >
                            {
                                this.state.value === 0 ?
                                    <div
                                        dir="x"
                                        className={classes.tabContent}
                                        style={{background: colors.overviewBoxBackground}}
                                    >
                                        <OverviewBox
                                            nodes={[{
                                                ...this.props.nodes[0],
                                                mac: this.props.nodeInfo.mac,
                                            }]}
                                            close={this.props.close}
                                            initData={this.props.initData}
                                        />
                                    </div>
                                    :
                                    <div />
                            }
                            {
                                this.state.value === 1 ?
                                    <div dir="x" className={classes.statTabContent}>
                                        <StatisticBox
                                            ip={this.props.nodes[0].ipv4}
                                            hostname={this.state.nodeInfo.hostname}
                                            close={this.close}
                                        />
                                    </div>
                                    :
                                    <div />
                            }
                            {
                                this.state.value === 2 ?
                                    <div dir="x" className={classes.tabContent}>
                                        <ConfigurationBox
                                            nodes={[{
                                                ...this.props.nodes[0],
                                                mac: this.props.nodeInfo.mac,
                                            }]}
                                            close={this.props.close}
                                            pollingHandler={this.props.pollingHandler}
                                            updateIsLock={this.updateIsLock}
                                            disabled={this.shouldDisableTabForNotAccessableNode()}
                                        />
                                    </div>
                                    :
                                    <div />
                            }
                            {
                                this.state.value === 3 ?
                                    <div dir="x" className={classes.tabContent}>
                                        <MaintenancesBox
                                            nodes={[{
                                                ...this.props.nodes[0],
                                                mac: this.props.nodeInfo.mac,
                                            }]}
                                            close={this.close}
                                            pollingHandler={this.props.pollingHandler}
                                            updateIsLock={this.updateIsLock}
                                        />
                                    </div>
                                    :
                                    <div />
                            }
                            {
                                this.state.value === 4 ?
                                    <div dir="x" className={classes.tabContent}>
                                        <SecuritiesBox
                                            nodes={[{
                                                ...this.props.nodes[0],
                                                mac: this.props.nodeInfo.mac,
                                            }]}
                                            close={this.props.close}
                                            pollingHandler={this.props.pollingHandler}
                                            updateIsLock={this.updateIsLock}
                                        />
                                    </div>
                                    :
                                    <div />
                            }
                        </SwipeableViews>
                    </div>
                </Paper>
            </Draggable>
        );
    }
}
const styles = {
    onDragStyle: {
        border: '5px solid rgba(255, 0, 0, .5)',
    },
    notShow: {
        opacity: 0,
    },
    notShowContent: {
        width: '800px',
        opacity: '0.4',
    },
    showContent: {
        width: '800px',
        opacity: 1,
    },
    show: {
        opacity: 1,
    },
    base: {
        transition: `all ${100}ms`,
    },
    nav: {
        width: '100%',
    },
    notShowNav :{
        opacity: 0,
        width: '100%',
    },
    root: {
        minWidth: 0,
        backgroundColor: themeObj.primary.light,
        color: 'white',
        fontWeight: 'bold',
        height: '34px',
        fontSize: '12px',
        minHeight: '34px',
        opacity: 1,
    },
    modelContent: {
        width: '100%',
        height: '77vh;',
        maxHeight: '539px',
        backgroundColor: colors.background,
    },
    notShowModelContent: {
        // display: 'none',
        width: '100%',
        height: '77vh;',
        maxHeight: '539px',
        backgroundColor: 'colors.background',
        opacity: 0,
    },
    tabContent: {
        height: '77vh;',
        maxHeight: '539px',
        overflowY: 'auto',
    },
    statTabContent: {
        height: '77vh;',
        maxHeight: '539px',
        overflowY: 'auto',
    },
    headerTitle: {
        color: 'white',
        fontSize: '18px',
        display: 'inline',
        fontWeight: 'bold',
    },
    subHeaderTitle: {
        color: 'white',
        fontSize: '14px',
        display: 'inline',
        paddingLeft: '5px',
    },
    lastUpdateTimeTitle: {
        color: 'white',
        fontSize: '12px',
        fontStyle: 'italic',
    },
    labelContainer: {
    },
    close: {
        cursor: 'pointer',
        color: 'white',
        fontSize: '18px',
    },
    disabledTab: {
        cursor: 'not-allowed !important',
        pointerEvents: 'auto !important',
    },
    statusLabel: {
        display: 'inline-block',
        marginRight: '10px',
        borderRadius: '8%',
        backgroundColor: '#dc4639',
        padding: '5px',
        color: 'white',
        marginLeft: '12px',
        fontStyle: 'italic',
        fontWeight: 600,
        border: 'solid 1px white',
        fontSize: '12px'
    },
    LoadingBar: {
        position: 'absolute',
        top: '51px',
        left: '0',
        width: '100%',
        zIndex: '100',
    },
};

/* eslint-disable */
DraggableModel.propTypes = {
    classes: PropTypes.object.isRequired,
    lastUpdateTime: PropTypes.object,
    close: PropTypes.func.isRequired,
    nodeInfo: PropTypes.any.isRequired,
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
        })
    ).isRequired,
    handleClickTitle: PropTypes.func.isRequired,
    initPos: PropTypes.shape(
        {
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }
    ).isRequired,
    initIndex: PropTypes.number.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ),
    t: PropTypes.func.isRequired,
};


export default compose(
    withTranslation(['node-dialog']),
    withStyles(styles)
)(DraggableModel);
``