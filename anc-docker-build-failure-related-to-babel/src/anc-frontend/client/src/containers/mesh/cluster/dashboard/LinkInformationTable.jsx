import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {ReactComponent as FunnelOutlineIcon} from '../../../../icon/svg/ic_funnel_outline2.svg';
import {ReactComponent as ExportIcon} from '../../../../icon/svg/ic_export.svg';
import saveAs from '../../../../util/nw/saveAs';
import LinkInformationCell from './LinkInformationCell';
import LinkInformationEthCell from './LinkInformationEthCell';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import P2Table from '../../../../components/common/P2Table';
import P2Tooltip from '../../../../components/common/P2Tooltip';
import SliderDialog from '../../../../components/common/SliderDialog';
import Constant from '../../../../constants/common';
import {setRssiFliter} from '../../../../redux/dashboard/dashboardActions';
import {toggleSnackBar} from '../../../../redux/common/commonActions';
import {convertIpToMac, getBitRate} from '../../../../util/formatConvertor';
import {sortByString, sortByNum, sortByType} from '../../../../util/commonFunc';
import {filterRange} from '../../../../redux/dashboard/dashboardConstants';
import CommonConstant from '../../../../constants/common';
import {getOemNameOrAnm} from '../../../../util/common';

const {colors, defaultQuickStagingProjectName} = CommonConstant;

const {rssiColor} = Constant;

const sortingMenuItemsArr = [
    'hostnameA', 'hostnameB', 'rssiA', 'rssiB', 'macA', 'macB', 'linkType',
];

const linkTypeOpts = [
    'both', 'eth', 'radio',
];

const getEmptyTable = text => (
    <div
        style={{
            height: '200px',
            width: '100%',
            color: 'rgba(33, 33, 33, 0.21)',
            fontSize: '60px',
            fontFamily: 'Roboto',
            textAlign: 'center',
        }}
    >
        <div style={{paddingTop: '50px'}} >
            {text}
        </div>
    </div>
);

const tblToggle = {
    enableFooter: true,
    enableHeader: false,
    enableSort: false,
    enableSelect: false,
    enableHighlight: false,
    enablePaper: false,
    enableRadioSelect: false,
    enableContextMenu: true,
};

const tblHeaders = {
    parentHeaders: [],
    Headers: [
        {
            header: 'linkInfo',
            headerLabel: 'Link Information',
            canSort: false,
        },
    ],
    sortBy: '',
    sorting: '',
};

const tableStyle = {
    padding: {
        tableCell: '',
    },
    toolbar: {
        minHeight: '',
        paddingLeft: '',
    },
    fontSize: {
        header: '',
        body: '',
        description: '',
    },
    footer: {
        height: '100%',
    },
};

const tblFunction = {
    handleRequestSort: () => {},
    handleSelectAllClick: () => {},
    handleSelectClick: () => {},
    handleChangeItemsPerPage: () => {},
    handleChangePage: () => {},
    handleContextMenu: () => {},
    handleSelectRadioClick: () => {},
    handleRowSelectClick: () => {},
};

function getRadioShortForm(radio) {
    if (radio.includes('0')) {
        return 'R0';
    } else if (radio.includes('1')) {
        return 'R1';
    } else if (radio.includes('2')) {
        return 'R2';
    }
    return '-';
}

function rssiLevelToInt(signalLevel) {
    return parseInt(signalLevel.replace(' dBm', ''), 10);
}

function isLinkInRange(level, max, min) {
    return (level <= max && level >= min);
}

const csvHeader = [
    'Hostname (A)', 'MAC (A)', 'Ethernet (A)', 'Radio (A)', 'RSSI (A)', 'TX Power (A)', 'Is Host Node (A)',
    'Hostname (B)', 'MAC (B)', 'Ethernet (B)', 'Radio (B)', 'RSSI (B)', 'TX Power (B)', 'Is Host Node (B)',
    'Duplex', 'Speed', 'Data Rate (A -> B)', 'Data Rate (B -> A)', 'Channel', 'Central Frequency', 'Channel Bandwidth',
];

const duplexDisplay = {
    halfDuplex: 'Half Duplex',
    fullDuplex: 'Full Duplex',
    unknown: '-',
};

class LinkInformationTable extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.handleSelect = this.handleSelect.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.getTblData = this.getTblData.bind(this);
        this.getLinkColor = this.getLinkColor.bind(this);
        this.handleSliderDialogOpen = this.handleSliderDialogOpen.bind(this);
        this.handleSliderDialogConfirm = this.handleSliderDialogConfirm.bind(this);
        this.handleSliderDialogOnClose = this.handleSliderDialogOnClose.bind(this);
        this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleSortMenuOnOff = this.handleSortMenuOnOff.bind(this);
        this.handleSortClick = this.handleSortClick.bind(this);
        this.handleSelectLinkTypeOnChange = this.handleSelectLinkTypeOnChange.bind(this);

        tblFunction.handleSelectRadioClick = this.handleSelect;
        tblFunction.handleRowSelectClick = this.handleSelect;
        tblFunction.handleContextMenu = this.handleContextMenu;
        tblFunction.handleChangeItemsPerPage = this.handleChangeItemsPerPage;
        tblFunction.handleChangePage = this.handleChangePage;

        this.state = {
            tblData: [],
            checkboxArr: [],
            tblFooter: {
                totalItems: 0,
                itemsPerPage: 5,
                currentPage: 0,
                rowsPerPageOptions: [1, 5, 10, 15, 20],
            },
            tblSelector: {
                selectedId: [],
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
                selectedLinkType: 'both',
                open: false,
            },
            displayLinkType: 'both',
            displayLinkTypeTemp: 'both',
            sortBy: 'hostnameA',
            sortOrder: 'asc',
            sortMenuOpen: false,
        };
    }

    getLinkColor(level, nextRssiColorObj, hasUnmanaged) {
        let returnColor = rssiColor.default;
        const rssiColorTemp = nextRssiColorObj || this.props.rssiColorObj;

        if (hasUnmanaged) {
            returnColor = rssiColor.unmanaged;
        } else if (rssiColorTemp && rssiColorTemp.enable) {
            let maxLv;
            let minLv;
            if (rssiColorTemp) {
                maxLv = rssiColorTemp.color.max;
                minLv = rssiColorTemp.color.min;
            } else {
                maxLv = this.props.rssiColorObj.color.max;
                minLv = this.props.rssiColorObj.color.min;
            }

            if (maxLv === minLv) {
                if (maxLv === 0) {
                    if (level >= maxLv) returnColor = rssiColor.fair;
                    else returnColor = rssiColor.poor;
                } else if (maxLv === -95) {
                    if (level >= maxLv) returnColor = rssiColor.good;
                    else returnColor = rssiColor.fair;
                }
                if (level >= maxLv) returnColor = rssiColor.good;
                else returnColor = rssiColor.poor;
            } else if (level >= maxLv) {
                returnColor = rssiColor.good;
            } else if (level >= minLv) {
                returnColor = rssiColor.fair;
            } else {
                returnColor = rssiColor.poor;
            }
        }
        return returnColor;
    }

    getTblData() {
        const {
            linkInfo,
            nodeInfo,
            graph: {
                edges,
                nodes,
            },
            rssiColorObj,
        } = this.props;
        const tblData = [];
        const sortingTemp = {};
        // const linkId = Object.keys(linkInfo);
        let has49GHz = false;
        edges.forEach((e) => {
            const link = linkInfo[e.id];
            if (link) {
                const {selectedLinkType} = this.state.filterDialog;
                const dataRow = {};
                const nodesIp = Object.keys(link.nodes);
                const nodeAData = nodes.find(n => n.id === nodesIp[0]);
                const nodeBData = nodes.find(n => n.id === nodesIp[1]);
                if (!link.type.includes('Ethernet')) {
                    const {
                        channel,
                        frequency,
                        channelBandwidth,
                        band,
                    } = link.info;
                    if (band === '4.9') {
                        has49GHz = true;
                    }
                    if (channel !== 'invalid' && frequency !== 'invalid' &&
                        (selectedLinkType === 'both' || selectedLinkType === 'radio') &&
                        (nodeAData.isManaged || nodeBData.isManaged)
                    ) {
                        let lowRssiLevel;
                        if (nodeAData.isManaged && nodeBData.isManaged) {
                            lowRssiLevel = rssiLevelToInt(link.nodes[nodesIp[0]].signalLevel);
                            if (!lowRssiLevel) {
                                lowRssiLevel = rssiLevelToInt(link.nodes[nodesIp[1]].signalLevel);
                            } else if (lowRssiLevel > rssiLevelToInt(link.nodes[nodesIp[1]].signalLevel)) {
                                lowRssiLevel = rssiLevelToInt(link.nodes[nodesIp[1]].signalLevel);
                            }
                        } else if (nodeAData.isManaged) {
                            lowRssiLevel = rssiLevelToInt(link.nodes[nodesIp[0]].signalLevel);
                        } else if (nodeBData.isManaged) {
                            lowRssiLevel = rssiLevelToInt(link.nodes[nodesIp[1]].signalLevel);
                        }

                        const rssiFilter = this.state.filterDialog.rssi;
                        const channelFilter = this.state.filterDialog.channel;
                        const centralFreqFilter = this.state.filterDialog.centralFreq;
                        if (isLinkInRange(lowRssiLevel, rssiFilter.max, rssiFilter.min) &&
                            ((band === '5' &&
                                isLinkInRange(parseInt(channel, 10), channelFilter.max, channelFilter.min)) ||
                            (band === '4.9' &&
                                isLinkInRange(parseInt(frequency.replace('MHz', ''), 10),
                                    centralFreqFilter.max, centralFreqFilter.min)))
                        ) {
                            const nodeA = {
                                ip: nodesIp[0],
                                hostname: nodeInfo[nodesIp[0]] ?
                                    nodeInfo[nodesIp[0]].hostname : this.t('hyphen'),
                                isAuth: nodeAData ? nodeAData.isAuth : false,
                                isReachable: nodeAData ? nodeAData.isReachable : false,
                                operationMode: nodeAData ? nodeAData.operationMode : 'meshOnly',
                                mac: nodeInfo[nodesIp[0]] ?
                                    nodeInfo[nodesIp[0]].mac : convertIpToMac(nodesIp[0]),
                                radio: getRadioShortForm(link.nodes[nodesIp[0]].radio),
                                isHostNode: nodeAData ? nodeAData.isHostNode : false,
                                isManaged: nodeAData ? nodeAData.isManaged : false,
                                bitrate: link.nodes[nodesIp[0]].bitrate ?
                                    getBitRate(link.nodes[nodesIp[0]].bitrate) : this.t('n/a'),
                                rssi: link.nodes[nodesIp[0]].signalLevel ?
                                    link.nodes[nodesIp[0]].signalLevel : this.t('n/a'),
                                txPower: link.nodes[nodesIp[0]].txpower ?
                                    link.nodes[nodesIp[0]].txpower : this.t('n/a'),
                            };
                            const nodeB = {
                                ip: nodesIp[1],
                                hostname: nodeInfo[nodesIp[1]] ?
                                    nodeInfo[nodesIp[1]].hostname : this.t('hyphen'),
                                isAuth: nodeBData ? nodeBData.isAuth : false,
                                isReachable: nodeBData ? nodeBData.isReachable : false,
                                operationMode: nodeBData ? nodeBData.operationMode : 'meshOnly',
                                mac: nodeInfo[nodesIp[1]] ?
                                    nodeInfo[nodesIp[1]].mac : convertIpToMac(nodesIp[1]),
                                radio: getRadioShortForm(link.nodes[nodesIp[1]].radio),
                                isHostNode: nodeBData ? nodeBData.isHostNode : false,
                                isManaged: nodeBData ? nodeBData.isManaged : false,
                                bitrate: link.nodes[nodesIp[1]].bitrate ?
                                    getBitRate(link.nodes[nodesIp[1]].bitrate) : this.t('n/a'),
                                rssi: link.nodes[nodesIp[1]].signalLevel ?
                                    link.nodes[nodesIp[1]].signalLevel : this.t('n/a'),
                                txPower: link.nodes[nodesIp[1]].txpower ?
                                    link.nodes[nodesIp[1]].txpower : this.t('n/a'),
                            };

                            const linkColor = this.getLinkColor(lowRssiLevel, rssiColorObj,
                                (nodeAData && !nodeAData.isManaged) || (nodeBData && !nodeBData.isManaged)
                            );
                            dataRow.linkInfo = (
                                <LinkInformationCell
                                    type="radioLink"
                                    channel={channel}
                                    frq={frequency}
                                    bandwidth={channelBandwidth}
                                    nodeA={nodeA}
                                    nodeB={nodeB}
                                    linkColor={linkColor}
                                    preloadIcon={this.props.preloadIcon}
                                    handleContextMenuOpen={this.props.handleContextMenuOpen}
                                    linkId={e.id}
                                />
                            );
                            dataRow.id = e.id;
                            sortingTemp[e.id] = {
                                hostnameA: nodeInfo[nodesIp[0]] ?
                                    nodeInfo[nodesIp[0]].hostname : this.t('hyphen'),
                                macA: nodeInfo[nodesIp[0]] ?
                                    nodeInfo[nodesIp[0]].mac : convertIpToMac(nodesIp[0]),
                                rssiA: nodeAData.isManaged && link.nodes[nodesIp[0]].signalLevel ?
                                    parseInt(link.nodes[nodesIp[0]].signalLevel.replace(' dBm', ''), 10) :
                                    this.t('hyphen'),
                                hostnameB: nodeInfo[nodesIp[1]] ?
                                    nodeInfo[nodesIp[1]].hostname : this.t('hyphen'),
                                macB: nodeInfo[nodesIp[1]] ?
                                    nodeInfo[nodesIp[1]].mac : convertIpToMac(nodesIp[1]),
                                rssiB: nodeBData.isManaged && link.nodes[nodesIp[1]].signalLevel ?
                                    parseInt(link.nodes[nodesIp[1]].signalLevel.replace(' dBm', ''), 10) :
                                    this.t('hyphen'),
                                linkType: 'radio',
                            };
                        }
                    }
                } else if ((selectedLinkType === 'both' || selectedLinkType === 'eth') &&
                    (nodeAData.isManaged || nodeBData.isManaged) && link.type.includes('Ethernet')) {
                    const nodeA = {
                        ip: nodesIp[0],
                        hostname: nodeInfo[nodesIp[0]] ?
                            nodeInfo[nodesIp[0]].hostname : this.t('hyphen'),
                        mac: nodeInfo[nodesIp[0]] ?
                            nodeInfo[nodesIp[0]].mac : convertIpToMac(nodesIp[0]),
                        eth: link.nodes[nodesIp[0]].eth ? link.nodes[nodesIp[0]].eth : this.t('n/a'),
                        isHostNode: nodeAData ? nodeAData.isHostNode : false,
                        isManaged: nodeAData ? nodeAData.isManaged : false,
                        isAuth: nodeAData ? nodeAData.isAuth : false,
                        isReachable: nodeAData ? nodeAData.isReachable : false,
                        operationMode: nodeAData ? nodeAData.operationMode : 'meshOnly',
                    };
                    const nodeB = {
                        ip: nodesIp[1],
                        hostname: nodeInfo[nodesIp[1]] ?
                            nodeInfo[nodesIp[1]].hostname : this.t('hyphen'),
                        mac: nodeInfo[nodesIp[1]] ?
                            nodeInfo[nodesIp[1]].mac : convertIpToMac(nodesIp[1]),
                        eth: link.nodes[nodesIp[1]].eth ? link.nodes[nodesIp[1]].eth : this.t('n/a'),
                        isHostNode: nodeBData ? nodeBData.isHostNode : false,
                        isManaged: nodeBData ? nodeBData.isManaged : false,
                        isAuth: nodeBData ? nodeBData.isAuth : false,
                        isReachable: nodeBData ? nodeBData.isReachable : false,
                        operationMode: nodeBData ? nodeBData.operationMode : 'meshOnly',
                    };
                    dataRow.linkInfo = (
                        <LinkInformationEthCell
                            type="ethLink"
                            speed={link.info.speed}
                            duplex={link.info.duplexStatus}
                            nodeA={nodeA}
                            nodeB={nodeB}
                            preloadIcon={this.props.preloadIcon}
                            handleContextMenuOpen={this.props.handleContextMenuOpen}
                        />
                    );
                    dataRow.id = e.id;
                    sortingTemp[e.id] = {
                        hostnameA: nodeInfo[nodesIp[0]] ?
                            nodeInfo[nodesIp[0]].hostname : this.t('hyphen'),
                        macA: nodeInfo[nodesIp[0]] ?
                            nodeInfo[nodesIp[0]].mac : convertIpToMac(nodesIp[0]),
                        rssiA: 'eth',
                        hostnameB: nodeInfo[nodesIp[1]] ?
                            nodeInfo[nodesIp[1]].hostname : this.t('hyphen'),
                        macB: nodeInfo[nodesIp[1]] ?
                            nodeInfo[nodesIp[1]].mac : convertIpToMac(nodesIp[1]),
                        rssiB: 'eth',
                        linkType: 'eth',
                    };
                }
                if (dataRow.id) {
                    tblData.push(dataRow);
                }
            }
        });
        return {
            data: tblData.sort((row1, row2) => {
                const {sortBy} = this.state;
                if (sortBy === 'hostnameA' || sortBy === 'hostnameB' || sortBy === 'macA' || sortBy === 'macB') {
                    return sortByString(sortingTemp[row1.id][sortBy], sortingTemp[row2.id][sortBy],
                        this.state.sortOrder);
                } else if (sortBy === 'linkType') {
                    return sortByType(sortingTemp[row1.id][sortBy], sortingTemp[row2.id][sortBy],
                        this.state.sortOrder);
                }
                return sortByNum(sortingTemp[row1.id][sortBy], sortingTemp[row2.id][sortBy],
                    this.state.sortOrder);
            }),
            has49GHz,
        };
    }

    handleSortClick(e) {
        let temp = this.state.sortOrder;
        if (this.state.sortBy === e.target.id) {
            temp = temp === 'asc' ? 'desc' : 'asc';
        } else {
            temp = 'asc';
        }
        this.setState({
            ...this.state,
            sortBy: e.target.id,
            sortOrder: temp,
        });
    }

    handleSortMenuOnOff(arg) {
        this.setState({
            ...this.state,
            sortMenuOpen: typeof arg === 'boolean' ? arg : !this.state.sortMenuOpen,
        });
    }

    handleSelect(e, id) {
        if (e.nativeEvent.target.type !== 'radio') {
            return;
        }
        this.setState({
            ...this.state,
            tblSelector: {
                selectedId: [id],
            },
        });
    }

    handleContextMenu(e, id) {
        console.log('handleContextMenu');
        e.preventDefault();
        this.setState({
            ...this.state,
            tblSelector: {
                selectedId: [id],
            },
        });
    }

    handleSliderDialogOpen() {
        this.setState({
            ...this.state,
            filterDialog: {
                ...this.state.filterDialog,
                open: !this.state.filterDialog.open,
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
                selectedLinkType: this.state.displayLinkType,
                open: false,
            },
            displayLinkTypeTemp: this.state.displayLinkType,
        }, () => {
            this.props.setRssiFliter('linkInfoRssiFliter', newFilter);
        });
    }

    handleSliderDialogOnClose() {
        this.setState({
            ...this.state,
            filterDialog: {
                ...this.state.filterDialog,
                open: false,
            },
            displayLinkType: this.state.displayLinkTypeTemp,
        });
    }

    handleChangeItemsPerPage(e) {
        this.setState({
            ...this.state,
            tblFooter: {
                ...this.state.tblFooter,
                currentPage: 0,
                itemsPerPage: e.target.value,
            },
        });
    }

    handleChangePage(e, page) {
        this.setState({
            ...this.state,
            tblFooter: {
                ...this.state.tblFooter,
                currentPage: page,
            },
        });
    }

    handleExport() {
        const projectName = this.props.projectIdToNameMap[this.props.projectID];
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
        const regex = / +/g;
        const fileName = `${namePrefix}_${projectName}_link-info_${currentTime}.csv`;
        const data = [csvHeader];
        const tblData = this.getTblData().data;
        tblData.forEach((row) => {
            const {
                nodeA, nodeB, type,
            } = row.linkInfo.props;
            const {linkInfo} = row;
            const temp = [];
            const isEthLink = type === 'ethLink';
            temp.push(nodeA.hostname !== this.t('hyphen') ? nodeA.hostname : this.t('n/a'));
            temp.push(nodeA.mac !== this.t('hyphen') ? nodeA.mac : this.t('n/a'));
            temp.push(isEthLink && nodeA.eth !== this.t('hyphen') ?
                nodeA.eth.replace('e', 'E') : this.t('n/a'));
            temp.push(!isEthLink && nodeA.isManaged && nodeA.radio !== this.t('hyphen') ?
                nodeA.radio : this.t('n/a'));
            temp.push(!isEthLink && nodeA.isManaged && nodeA.rssi !== this.t('hyphen') ?
                nodeA.rssi : this.t('n/a'));
            temp.push(!isEthLink && nodeA.isManaged && nodeA.txPower !== this.t('hyphen') ?
                nodeA.txPower : this.t('n/a'));
            temp.push(nodeA.isHostNode ? 'Yes' : 'No');

            temp.push(nodeB.hostname !== this.t('hyphen') ? nodeB.hostname : this.t('n/a'));
            temp.push(nodeB.mac !== this.t('hyphen') ? nodeB.mac : this.t('n/a'));
            temp.push(isEthLink && nodeB.isManaged && nodeB.eth !== this.t('hyphen') ?
                nodeB.eth.replace('e', 'E') : this.t('n/a'));
            temp.push(!isEthLink && nodeB.isManaged && nodeB.radio !== this.t('hyphen') ?
                nodeB.radio : this.t('n/a'));
            temp.push(!isEthLink && nodeB.isManaged && nodeB.rssi !== this.t('hyphen') ?
                nodeB.rssi : this.t('n/a'));
            temp.push(!isEthLink && nodeB.isManaged && nodeB.txPower !== this.t('hyphen') ?
                nodeB.txPower : this.t('n/a'));
            temp.push(nodeB.isHostNode ? 'Yes' : 'No');

            temp.push(isEthLink ? duplexDisplay[linkInfo.props.duplex] : this.t('n/a'));
            temp.push(isEthLink ? getBitRate(linkInfo.props.speed) : this.t('n/a'));
            temp.push(!isEthLink && nodeA.isManaged && nodeA.bitrate !== this.t('hyphen') ?
                getBitRate(nodeA.bitrate) : this.t('n/a'));
            temp.push(!isEthLink && nodeB.isManaged && nodeB.bitrate !== this.t('hyphen') ?
                getBitRate(nodeB.bitrate) : this.t('n/a'));
            temp.push(!isEthLink ? linkInfo.props.channel : this.t('n/a'));
            temp.push(!isEthLink ? linkInfo.props.frq : this.t('n/a'));
            temp.push(!isEthLink ? linkInfo.props.bandwidth : this.t('n/a'));

            data.push(temp);
        });

        const dataUrl = 'data:text/csv;charset=utf-8,' + data.join('\n');
        saveAs(dataUrl, fileName).then((res) => {
            if (res.success) {
                this.props.toggleSnackBar(this.t('downloadCompleted'));
            }
        });
    }

    handleSelectLinkTypeOnChange(e) {
        this.setState({
            ...this.state,
            displayLinkType: e.target.value,
        });
    }

    render() {
        const {classes} = this.props;
        const tblData = this.getTblData().data;

        const cardContent = (
            <div className={classes.wrapper} >
                <div className={classes.tableWrapper} >
                    {
                        tblData.length === 0 ?
                            getEmptyTable(this.props.graph.edges.length === 0 ?
                                this.t('noLinkInfo') : this.t('noMatchLinkInfo'))
                            : <P2Table
                                tblToggle={tblToggle}
                                tblHeaders={tblHeaders}
                                tblFooter={{
                                    ...this.state.tblFooter,
                                    totalItems: tblData.length,
                                    helper: (
                                        <Typography
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                float: 'left',
                                                marginTop: '20px',
                                                marginLeft: '20px',
                                            }}
                                            variant="body2"
                                        >
                                            * {this.t('hostNode')}
                                        </Typography>
                                    )
                                }}
                                tblData={tblData}
                                tblDataKey="linkId"
                                tblSelector={this.state.tblSelector}
                                tblFunction={tblFunction}
                                style={tableStyle}
                                rowHoverEffect
                                menuPosition={this.props.menuPosition}
                            />
                    }
                </div>
            </div>
        );
        let title = this.t('linkInformationTittle');
        const filterTitle = [];
        let hasFilter = false;
        const {
            rssi,
            channel,
            centralFreq,
            selectedLinkType,
        } = this.state.filterDialog;

        if (selectedLinkType !== 'both') {
            hasFilter = true;
            filterTitle.push(this.t(selectedLinkType));
        }
        if (rssi.max !== filterRange.rssi.max || rssi.min !== filterRange.rssi.min) {
            hasFilter = true;
            filterTitle.push(`${rssi.min} dBm ~ ${rssi.max} dBm`);
        }
        if (channel.max !== filterRange.channel.max || channel.min !== filterRange.channel.min) {
            hasFilter = true;
            filterTitle.push(`CH ${channel.min} ~ CH ${channel.max}`);
        }
        if (centralFreq.max !== filterRange.centralFreq.max || centralFreq.min !== filterRange.centralFreq.min) {
            hasFilter = true;
            filterTitle.push(`${centralFreq.min} MHz ~ ${centralFreq.max} MHz`);
        }

        if (hasFilter) title += ` (${filterTitle.join(', ')})`;

        const tools = [
            (<div key="sortingIconButton">
                <P2Tooltip
                    title={this.t('sortBy')}
                    content={(
                        <div>
                            <IconButton
                                style={{padding: '7px'}}
                                key="sortingButton"
                                id="sortingIconButton"
                                aria-label="remove"
                                onClick={this.handleSortMenuOnOff}
                            >
                                <i
                                    className="material-icons"
                                    style={{fontSize: '20px'}}
                                >
                                    sort
                                </i>
                            </IconButton>
                        </div>
                    )}
                />
                <Popover
                    open={this.state.sortMenuOpen}
                    onClose={() => this.handleSortMenuOnOff(false)}
                    anchorEl={() => document.getElementById('sortingIconButton')}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {sortingMenuItemsArr.map(e => (
                        <MenuItem key={e} id={e} onClick={this.handleSortClick} style={{paddingRight: '42px'}}>
                            <TableSortLabel active={this.state.sortBy === e} direction={this.state.sortOrder} />
                            {this.t(e)}
                        </MenuItem>
                    ))}
                </Popover>
            </div>),
            (<P2Tooltip
                key="funnelIconButtonTooltip"
                id="funnelIconButtonTooltip"
                title={this.t('fliter')}
                content={(
                    <IconButton
                        style={{
                            padding: '7px',
                            paddingTop: '5px',
                            width: '30px',
                            height: '30px',
                        }}
                        key="funnelIconButton"
                        id="funnelIconButton"
                        aria-label="sort"
                        onClick={this.handleSliderDialogOpen}
                    >
                        <FunnelOutlineIcon
                            style={{paddingTop: '3px'}}
                            stroke={colors.popupMenuItem}
                            strokeWidth="1.5px"
                            fill={hasFilter || this.state.filterDialog.selectedLinkType !== 'both' ?
                                colors.popupMenuItem : '#ffffff00'
                            }
                        />
                    </IconButton>
                )}
            />),
            (<div key="export" >
                <P2Tooltip
                    title={this.t('export')}
                    content={
                        <IconButton
                            style={{
                                padding: '7px',
                                paddingTop: '5px',
                                width: '30px',
                                height: '30px',
                            }}
                            key="exportIconButton"
                            id="exportIconButton"
                            aria-label="remove"
                            onClick={this.handleExport}
                        >
                            <ExportIcon fill={colors.popupMenuItem} />
                        </IconButton>
                    }
                />
            </div>),
        ];

        const sliderItems = [];
        sliderItems.push({
            title: 'rssi',
            ...this.state.filterDialog.rssi,
        });
        sliderItems.push({
            title: 'channel',
            ...this.state.filterDialog.channel,
        });
        if (tblData.has49GHz) {
            sliderItems.push({
                title: 'centralFreq',
                ...this.state.filterDialog.centralFreq,
            });
        }

        const linkTypeSelect = (
            <div
                style={{
                    paddingBottom: '50px',
                }}
            >
                <div
                    style={{
                        userSelect: 'none',
                        fontFamily: 'roboto',
                        paddingBottom: '10px',
                        marginLeft: '-10px',
                    }}
                >
                    {this.t('linkTypeFilter')}
                </div>
                <Select
                    style={{
                        width: '102%',
                        marginLeft: '-10px',
                    }}
                    value={this.state.displayLinkType}
                    renderValue={() => this.t(this.state.displayLinkType)}
                    MenuProps={{style: {zIndex: 1500}}}
                    onChange={this.handleSelectLinkTypeOnChange}
                >
                    {linkTypeOpts.map(opts => (
                        <MenuItem
                            key={opts}
                            id={opts}
                            value={opts}
                        >
                            {this.t(opts)}
                        </MenuItem>))
                    }
                </Select>
            </div>
        );

        return (
            <React.Fragment>
                <P2CardContainer
                    key="card-5"
                    cardTitle={title}
                    cardTitleLimit={80}
                    cardContent={cardContent}
                    cardTools={tools}
                    minWidth="1240px"
                    minHeight="200px"
                    showHelperTooltip={false}
                />
                {
                    this.state.filterDialog.open ? <SliderDialog
                        t={this.t}
                        open={this.state.filterDialog.open}
                        confirmFunc={this.handleSliderDialogConfirm}
                        closeFunc={this.handleSliderDialogOnClose}
                        title={this.t('linkInformationFlitterTittle')}
                        subTitle={this.t('linkInfomationSubtittle')}
                        sliderItems={sliderItems}
                        nonSliderItems={linkTypeSelect}
                        selectedLinkType={this.state.displayLinkType}
                    /> : null
                }
            </React.Fragment>
        );
    }
}

LinkInformationTable.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    linkInfo: PropTypes.object.isRequired, /* eslint-disable-line */
    nodeInfo: PropTypes.object.isRequired, /* eslint-disable-line */
    graph: PropTypes.object.isRequired, /* eslint-disable-line */
    t: PropTypes.func.isRequired,
    rssiColorObj: PropTypes.object.isRequired, // eslint-disable-line
    rssiFliter: PropTypes.object.isRequired, //eslint-disable-line
    setRssiFliter: PropTypes.func.isRequired,
    projectID: PropTypes.string.isRequired,
    menuPosition: PropTypes.object,
};

LinkInformationTable.defaultProps = {
    menuPosition: {
        open: false,
        top: 0,
        left: 0,
        ip: '',
        type: '',
    },
};


const styles = {
    wrapper: {
        width: '100%',
        // minWidth: '1200px',
        overflowX: 'auto',
    },
    tableWrapper: {
        // height: '590px',
    },
    chartTittle: {
        width: '300px',
        fontWeight: 500,
        fontSize: '20px',
        left: '0px',
        marginLeft: '-45px',
    },
};

function mapStateToProps(store) {
    return {
        linkInfo: store.meshTopology.linkInfo,
        nodeInfo: store.meshTopology.nodeInfo,
        graph: {
            nodes: store.meshTopology.graph.nodes,
            edges: store.meshTopology.graph.edges,
        },
        rssiColorObj: store.uiSettings.rssiColor,
        rssiFliter: store.dashboard.linkInfoRssiFliter,
        // nodeInfoInit: store.meshTopology.initState.graphNodeInfo,
        // nodeStatInit: store.meshTopology.initState.nodeStat,
        projectID: store.projectManagement.projectId,
        projectIdToNameMap: store.projectManagement.projectIdToNameMap
    };
}
export default compose(
    withTranslation(['dashboard']),
    connect(
        mapStateToProps,
        {
            setRssiFliter,
            toggleSnackBar,
        }
    ),
    withStyles(styles))(LinkInformationTable);
