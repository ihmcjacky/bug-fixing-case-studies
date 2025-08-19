import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import {withStyles} from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {ReactComponent as FunnelOutlineIcon} from '../../../../icon/svg/ic_funnel_outline2.svg';
import LinkInfoCardCtrl from '../../cluster/topology/LinkInfoCardCtrl';
import SliderDialog from '../../../../components/common/SliderDialog';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import AreaChart from './AreaChart';
import {rssiLevelCompare} from '../../../../util/commonFunc';
import {setRssiFliter} from '../../../../redux/dashboard/dashboardActions';
import P2Tooltip from '../../../../components/common/P2Tooltip';
import {filterRange} from '../../../../redux/dashboard/dashboardConstants';
import CommonConstant from '../../../../constants/common';

const {colors} = CommonConstant;

class LinkDistributionGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            linkInfo: {},
            hiddenLink: {},
            linkInfoCard: {
                x: 99999,
                y: 99999,
                linkId: '',
                nodeAIp: '',
                nodeBIp: '',
            },
            filterDialog: {
                rssi: {
                    max: this.props.rssiFliter.rssi.max,
                    min: this.props.rssiFliter.rssi.min,
                },
                channel: {
                    max: this.props.rssiFliter.channel.max,
                    min: this.props.rssiFliter.channel.min,
                },
                centralFreq: {
                    max: this.props.rssiFliter.centralFreq.max,
                    min: this.props.rssiFliter.centralFreq.min,
                },
                linkType: {
                    radio: true,
                    eth: true,
                },
                open: false,
            },
            areaChartWidth: 0,
            view: '5GHz',
            has49GHz: false,
        };
        this.linkColorMap = {};
        this.t = this.props.t;
        this.handlePopUpLinkInfoCardOpen = this.handlePopUpLinkInfoCardOpen.bind(this);
        this.handlePopUpLinkInfoCardClose = this.handlePopUpLinkInfoCardClose.bind(this);
        this.handleSliderDialogConfirm = this.handleSliderDialogConfirm.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);
        this.setFilteredData = this.setFilteredData.bind(this);
        // this.getFilteredData = this.getFilteredData.bind(this);
        this.onResize = this.onResize.bind(this);
    }
    componentDidMount() {
        window.addEventListener('resize', this.onResize);
        if (!this.props.linkInfoInit) return;
        this.setFilteredData(this.props.linkInfo, this.props.nodes, this.props.edges);
    }

    componentWillReceiveProps(nextProps) {
        if (Object.keys(nextProps.linkInfo).length === 0) return;
        this.setFilteredData(nextProps.linkInfo, nextProps.nodes, nextProps.edges);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    onResize() {
        const width = document.getElementById('area-wrapper');
        this.setState({
            ...this.state,
            areaChartWidth: width.offsetWidth,
        });
    }

    setFilteredData(linkInfo, nodes, edges) {
        const hiddenLink = {};
        let has49GHz = false;
        const sortedLinkInfo = {};

        Object.keys(linkInfo).filter(link => !linkInfo[link].type.includes('Ethernet')).forEach((id) => {
            const linkData = linkInfo[id];
            const ipList = Object.keys(linkData.nodes);
            const nodeA = nodes.find(n => n.id === ipList[0]);
            const nodeB = nodes.find(n => n.id === ipList[1]);

            if (!nodeA || !nodeB) {
                return;
            }
            if (typeof linkData.info.frequency === 'undefined') {
                hiddenLink[id] = true;
            } else {
                const is49 = linkData.info.band === '4.9';
                if (is49) {
                    has49GHz = true;
                }
                if (edges.find(e => e.id === id)) {
                    if (nodeA && !nodeA.isManaged && nodeB && !nodeB.isManaged) {
                        hiddenLink[id] = true;
                    } else {
                        const level = rssiLevelCompare(
                            linkData.nodes[ipList[0]].signalLevel, linkData.nodes[ipList[1]].signalLevel);
                        if (!is49 && this.state.view === '5GHz') {
                            const channel = parseInt(linkData.info.channel, 10);
                            // apply filter options
                            if (channel >= this.state.filterDialog.channel.min &&
                                channel <= this.state.filterDialog.channel.max &&
                                level >= this.state.filterDialog.rssi.min &&
                                level <= this.state.filterDialog.rssi.max) {
                                hiddenLink[id] = false;
                            } else {
                                hiddenLink[id] = true;
                            }
                        } else if (is49 && this.state.view === '4.9GHz') {
                            const centralFreq = parseInt(linkData.info.frequency.replace('MHz', ''), 10);
                            // apply filter options
                            if (centralFreq >= this.state.filterDialog.centralFreq.min &&
                                centralFreq <= this.state.filterDialog.centralFreq.max &&
                                level >= this.state.filterDialog.rssi.min &&
                                level <= this.state.filterDialog.rssi.max) {
                                hiddenLink[id] = false;
                            } else {
                                hiddenLink[id] = true;
                            }
                        } else {
                            hiddenLink[id] = true;
                        }
                    }
                } else {
                    hiddenLink[id] = true;
                }
            }

            sortedLinkInfo[id] = {
                ...linkData,
                nodeAIsManaged: nodeA.isManaged,
                nodeBIsManaged: nodeB.isManaged,
            };
        });

        this.setState({
            ...this.state,
            linkInfo: sortedLinkInfo,
            hiddenLink,
            has49GHz,
            view: this.state.view === '4.9GHz' && !has49GHz ? '5GHz' : this.state.view,
        });
    }

    handleChangeView(e) {
        if (this.state.view === e.target.value) return;
        this.setState({
            ...this.state,
            view: e.target.value,
        }, () => {
            this.setFilteredData(this.props.linkInfo, this.props.nodes, this.props.edges);
        });
    }

    handlePopUpLinkInfoCardOpen(id, x, y) {
        const nodesIp = Object.keys(this.props.linkInfo[id].nodes);
        this.setState({
            ...this.state,
            linkInfoCard: {
                ...this.state.linkInfoCard,
                x,
                y,
                nodeAIp: nodesIp[0],
                nodeBIp: nodesIp[1],
                linkId: id,
            },
        });
    }

    handlePopUpLinkInfoCardClose() {
        this.setState({
            ...this.state,
            linkInfoCard: {
                ...this.state.linkInfoCard,
                open: false,
                nodeAIp: '',
                nodeBIp: '',
                linkId: '',
            },
        });
    }

    handleSliderDialogConfirm(value) {
        const newFilter = {};
        value.forEach((v) => {
            const {title, max, min} = v;
            newFilter[title] = {max, min};
        });
        this.setState({
            ...this.state,
            filterDialog: {
                ...this.state.filterDialog,
                ...newFilter,
                open: false,
            },
        }, () => {
            this.props.setRssiFliter('linkDistRssiFliter', newFilter);
        });
    }

    handleSliderDialogOnOff(bool) {
        this.setState({
            ...this.state,
            filterDialog: {
                ...this.state.filterDialog,
                open: bool,
            },
        });
    }

    render() {
        const {classes} = this.props;

        const cardContent = (
            <div
                className={classes.wrapper}
                id="area-wrapper"
                style={{width: '100%'}}
            >
                <AreaChart
                    data={this.state.linkInfo}
                    linkColorMap={this.props.linkColorMap}
                    popUpLinkInfoCardOpen={this.handlePopUpLinkInfoCardOpen}
                    popUpLinkInfoCardClose={this.handlePopUpLinkInfoCardClose}
                    band={this.state.view}
                    hiddenLink={this.state.hiddenLink}
                    width={this.state.areaChartWidth}
                />
                <LinkInfoCardCtrl
                    x={this.state.linkInfoCard.x}
                    y={this.state.linkInfoCard.y}
                    linkId={this.state.linkInfoCard.linkId}
                    nodeAIp={this.state.linkInfoCard.nodeAIp}
                    nodeBIp={this.state.linkInfoCard.nodeBIp}
                    linkType="RadioLink"
                    isDashboardView
                />
            </div>
        );

        let title = this.t('linkDistributionTittle');
        const filterTitle = [this.t(this.state.view)];
        let hasFilter = false;
        const {rssi, channel, centralFreq} = this.state.filterDialog;

        if (rssi.max !== filterRange.rssi.max || rssi.min !== filterRange.rssi.min) {
            hasFilter = true;
            filterTitle.push(`${rssi.min} dBm ~ ${rssi.max} dBm`);
        }
        if (this.state.view === '5GHz') {
            if (channel.max !== filterRange.channel.max || channel.min !== filterRange.channel.min) {
                hasFilter = true;
                filterTitle.push(`CH ${channel.min} ~ CH ${channel.max}`);
            }
        } else if (centralFreq.max !== filterRange.centralFreq.max || centralFreq.min !== filterRange.centralFreq.min) {
            hasFilter = true;
            filterTitle.push(`${centralFreq.min} MHz ~ ${centralFreq.max} MHz`);
        }

        title += ` (${filterTitle.join(', ')})`;

        const tools = [
            (<div
                key="viewSelect"
                id="viewSelect"
                style={{display: this.state.has49GHz ? 'block' : 'none'}}
            >
                <Select
                    style={{width: '95px'}}
                    value={this.state.view}
                    onChange={this.handleChangeView}
                >
                    <MenuItem value="4.9GHz" >{this.t('49GHz')}</MenuItem>
                    <MenuItem value="5GHz" >{this.t('5GHz')}</MenuItem>
                </Select>
            </div>),
            (<P2Tooltip
                key="funnelIconButton"
                id="funnelIconButton"
                title={this.t('fliter')}
                content={(
                    <IconButton
                        style={{padding: '7px'}}
                        aria-label="remove"
                        onClick={() => { this.handleSliderDialogOnOff(true); }}
                    >
                        <FunnelOutlineIcon
                            style={{paddingTop: '3px'}}
                            stroke={colors.popupMenuItem}
                            strokeWidth="1.5px"
                            fill={hasFilter ? colors.popupMenuItem : '#ffffff00'}
                        />
                    </IconButton>
                )}
            />),
        ];
        const sliderItems = [];
        sliderItems.push({
            title: 'rssi',
            ...this.state.filterDialog.rssi,
        });
        if (this.state.view === '5GHz') {
            sliderItems.push({
                title: 'channel',
                ...this.state.filterDialog.channel,
            });
        } else {
            sliderItems.push({
                title: 'centralFreq',
                ...this.state.filterDialog.centralFreq,
            });
        }

        return (
            <React.Fragment>
                <P2CardContainer
                    key="card-5"
                    cardTitle={title}
                    cardTitleLimit={80}
                    cardContent={cardContent}
                    minWidth="1240px"
                    minHeight="200px"
                    showHelperTooltip={false}
                    cardTools={tools}
                />
                {
                    this.state.filterDialog.open ? <SliderDialog
                        t={this.t}
                        open={this.state.filterDialog.open}
                        confirmFunc={this.handleSliderDialogConfirm}
                        closeFunc={() => this.handleSliderDialogOnOff(false)}
                        title={this.t('linkDistributionFliterTittle')}
                        subTitle={this.t('linkDistributionSubtittle')}
                        sliderItems={sliderItems}
                    /> : null
                }
            </React.Fragment>
        );
    }
}

LinkDistributionGraph.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    linkColorMap: PropTypes.objectOf(PropTypes.string).isRequired,
    linkInfo: PropTypes.object.isRequired, /* eslint-disable-line */
    t: PropTypes.func.isRequired,
    rssiFliter: PropTypes.shape({
        rssi: PropTypes.shape({
            max: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
        }).isRequired,
        channel: PropTypes.shape({
            max: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
        }).isRequired,
        centralFreq: PropTypes.shape({
            max: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
    setRssiFliter: PropTypes.func.isRequired,
    linkInfoInit: PropTypes.bool.isRequired,
    // nodeInfoInit: PropTypes.bool.isRequired,
    // nodeStatInit: PropTypes.bool.isRequired,
    nodes: PropTypes.array.isRequired, // eslint-disable-line
    edges: PropTypes.array.isRequired, // eslint-disable-line
};

const styles = {
    wrapper: {
        width: '100%',
        position: 'relative',
        overflowX: 'auto',
    },
    chartTittle: {
        width: '300px',
        fontWeight: 500,
        fontSize: '20px',
        // lineHeight: '28px',
        left: '0px',
        marginLeft: '-10px',
    },
};
function mapStateToProps(store) {
    return {
        linkInfo: store.meshTopology.linkInfo,
        linkColorMap: store.meshTopology.linkColorMap,
        rssiFliter: store.dashboard.linkDistRssiFliter,
        linkInfoInit: store.meshTopology.initState.linkInfo,
        // nodeInfoInit: store.meshTopology.initState.graphNodeInfo,
        // nodeStatInit: store.meshTopology.initState.nodeStat,
        nodes: store.meshTopology.graph.nodes,
        edges: store.meshTopology.graph.edges,
    };
}
export default compose(
    withTranslation(['dashboard']),
    connect(
        mapStateToProps,
        {setRssiFliter}
    ),
    withStyles(styles))(LinkDistributionGraph);
