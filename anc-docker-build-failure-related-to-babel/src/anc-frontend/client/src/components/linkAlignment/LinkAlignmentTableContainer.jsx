/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-09-10 11:29:11
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-29 16:08:54
 * @ Description:
 */

import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import StarIcon from '@material-ui/icons/Stars';
import {IconButton} from '@material-ui/core';
import {
    updateFocusedLink,
    updateSelectededLink,
    setSorting,
    setFilter,
    setSearchKey,
    toggleSearch,
    toggleColumn,
} from '../../redux/linkAlignment/linkAlignmentActions';
import Constant from '../../constants/common';
import {updateManagedDevList} from '../../util/apiCall';

const checkRssiChain = (rssiChain) => {
    if (typeof rssiChain === 'number' && rssiChain !== 0) {
        return rssiChain.toString();
    }
    return '-';
};


class LinkAlignmentTableContainer extends Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'convertNeighborTableBar',
            'convertNeighborTable',
            'convertNeighborTableData',
            'handleRequestSortFn',
            'sortByHeader',
            'handleDialogOnClose',
            'updateSelectededLink',
            'updateFocusedLink',
            'createAddButton',
            'handleAdd',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;
        this.timeout = 0;
        this.state = {
            dialog: {
                open: false,
                handleClose: this.handleDialogOnClose,
                title: '',
                content: '',
                submitButton: 'OK',
                submitAction: this.handleDialogOnClose,
            },
            table: {
                tblHeaders: {
                    parentHeaders: [],
                    Headers: [
                        {
                            header: 'indicator',
                            headerLabel: this.t('neiTblLabelIndicator'),
                            canSort: false,
                        },
                        {
                            header: 'radioDevice',
                            headerLabel: this.t('neiTblLabelRadioDevice'),
                            canSort: true,
                        },
                        {
                            header: 'hostname',
                            headerLabel: this.t('neiTblLabelHostname'),
                            canSort: true,
                        },
                        {
                            header: 'mac',
                            headerLabel: this.t('neiTblLabelMac'),
                            canSort: true,
                        },
                        {
                            header: 'model',
                            headerLabel: this.t('neiTblLabelModel'),
                            canSort: true,
                        },
                        {
                            header: 'rssiLocal',
                            headerLabel: this.t('neiTblLabelRssiLocal'),
                            canSort: true,
                        },
                        {
                            header: 'rssiChain',
                            headerLabel: this.t('neiTblLabelRssiChain'),
                            canSort: true,
                        },
                        {
                            header: 'bitRateLocal',
                            headerLabel: this.t('neiTblLabelBitRateLocal'),
                            canSort: true,
                        },
                        {
                            header: 'rssiRemote',
                            headerLabel: this.t('neiTblLabelRssiRemote'),
                            canSort: true,
                        },
                        {
                            header: 'bitRateRemote',
                            headerLabel: this.t('neiTblLabelBitRateRemote'),
                            canSort: true,
                        },
                        // {
                        //     header: 'action',
                        //     headerLabel: 'Action',
                        //     canSort: false,
                        // },
                    ],
                },
                tblFunction: {
                    handleRequestSort: this.handleRequestSortFn,
                    handleSelectRadioClick: this.updateFocusedLink,
                    handleRowSelectClick: this.updateSelectededLink,
                },
                tblToggle: {
                    enableSort: true,
                    // enableFooter: true,
                    enableHeader: true,
                    enableSelect: true,
                    // enablePaper: true,
                    // enableContextMenu: true,
                    enableRadioSelect: true,
                    enableRowSelectClick: true,
                    customRadioButtonIcon: <StarIcon />,
                    noContentWording: this.t('noContentWording'),
                },
            },
        };
    }

    createAddButton(nodeIP) {
        console.log('createAddButton: ', this.props);
        return (
            <IconButton
                color="primary"
                // onClick={() => this.handleAdd(nodeIP)}
                aria-label="add"
                id={nodeIP}
            >
                <i
                    className="material-icons"
                >add_circle</i>
            </IconButton>
        );
    }

    async handleAdd(nodeIP) {
        try {
            const projectId = Cookies.get('projectId');
            await updateManagedDevList(this.props.csrf, projectId, {add: [nodeIP]});
            this.toggleSnackBar(true, this.t('addSnackBar'));
            // hide the notification
            if (this.mounted) {
                this.timer = setTimeout(() => {
                    this.toggleSnackBar(false, '');
                }, Constant.timeout.success);
            }
        } catch (error) {
            console.log('add device error');
            console.log(error);
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: 'add Error',
                    content: 'add Error',
                    submitButton: 'OK then',
                    submitAction: this.handleDialogOnClose,
                },
            });
        }
    }



    convertNeighborTableBar() {
        const {
            selectedRadio, enableSearch,
            filterKey, importRadioData,
            toggleSearch, customizedColumn, toggleColumn
        } = this.props;

        const radioInfo = selectedRadio.reduce((accumulator, radio, index) => {
            const selectedRadioData = importRadioData?.[radio] ?? '';
            const channelBandwidth = selectedRadioData ? selectedRadioData.channelBandwidth : '-';
            const channel = selectedRadioData ? selectedRadioData.channel : '-';
            const band = selectedRadioData ? selectedRadioData.band : '';
            const prefix = band === '5' ? 'CH: ' : ' MHz';
            const channelOrCentralFreq = band === '5' ? `${prefix}${channel}` : channel;
            const seperator = index === 0 ? '' : ' | ';
            return accumulator
                .concat(`${seperator}${this.t('menuItemLabel', {returnObjects: true})[radio]}` +
                `, ${channelBandwidth}, ${channelOrCentralFreq}`);
        }, '');

        return {
            radioInfo,
            handleFilter: this.props.setFilter,
            handleSearch: (newSearchKey) => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    this.props.setSearchKey(newSearchKey);
                }, 500);
            },
            filterKey,
            enableSearch,
            toggleSearch,
            customizedColumn,
            toggleColumn,
        };
    }

    updateFocusedLink(event, id, rowData) {
        const {selectedLink} = this.props;
        if (selectedLink.find(Link => Link.linkId === id) === undefined) {
            if (selectedLink.length >= 6) {
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('warningTitle'),
                        content: this.t('excessivedLinkContent'),
                    },
                });
            } else {
                this.props.updateFocusedLink(event, id, rowData);
                this.props.updateSelectededLink(event.ctrlKey, id, rowData);
            }
        } else if (event.ctrlKey) {
            this.props.updateFocusedLink(event, id, rowData);
        } else {
            this.props.updateFocusedLink(event, id, rowData);
            this.props.updateSelectededLink(false, id, rowData);
        }
    }

    updateSelectededLink(event, id, idMap, rowData) {
        const {selectedLink, focusedLink} = this.props;
        if (selectedLink.length >= 6 &&
            selectedLink.find(Link => Link.linkId === id) === undefined) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('warningTitle'),
                    content: this.t('excessivedLinkContent'),
                },
            });
        } else if (focusedLink.find(Link => Link.linkId === id) && event.ctrlKey) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('warningTitle'),
                    content: this.t('favoriteLinkContent'),
                },
            });
        } else if (event.ctrlKey) {
            this.props.updateSelectededLink(true, id, rowData);
        } else {
            this.props.updateSelectededLink(false, id, rowData);
            this.props.updateFocusedLink(event, id, rowData);
        }
    }

    convertNeighborTableData() {
        const {
            radioData, nodeIp, selectedRadio, selectedLink,
            filterKey, focusedLink, graphRadioData, currentTime,
            nodeInfo, enableSearch, searchKey,
        } = this.props;
        const {tblToggle} = this.state.table;

        const getColor = (Link, id) => {
            const newSelected = Link.find(selected => selected.linkId ===
                id);
            if (newSelected) {
                return newSelected.colors;
            }
            return '';
        };

        const filterData = (data, key) => {
            switch (key) {
                case 'all':
                    return data;
                case 'selected':
                    return data
                        .filter(radioNeighbor => selectedLink
                            .some(link => radioNeighbor.id === link.linkId));
                case 'focused':
                    return data
                        .filter(radioNeighbor => radioNeighbor.id === focusedLink[0].linkId);
                default:
                    return data;
            }
        };

        const searchData = (Data, searchKey) => {
            const lowSearchKey = searchKey.toLowerCase();
            if (lowSearchKey === '') {
                return Data;
            }
            return Data.filter(obj =>
                Object.keys(obj).some((key) => {
                    if (key === 'id' || key === 'nodeIp' ||
                        key === 'indicator' || key === 'radio') {
                        return false;
                    } else {
                        let included = false;
                        if (typeof obj[key] === 'number') {
                            included = obj[key].toString().toLowerCase().includes(lowSearchKey);
                        } else if (typeof obj[key] === 'string'){
                            included = obj[key].toLowerCase().includes(lowSearchKey);
                        }
                        return included;
                    }
                })
            );
        }

        const data = selectedRadio.reduce((accumulator, radio) => {
            // console.log('kyle_debug: LinkAlignmentTableContainer -> convertNeighborTableData -> radio', radio);
            const alignedRadioData = radioData?.[nodeIp]?.[radio]?.radioNeighbors ?? {};
            const alignedGraphRadioData = graphRadioData?.[nodeIp]?.[radio] ?? {};

            const radioDataArray = Object.keys(alignedGraphRadioData).length === 0 ? [] :
                Object.keys(alignedGraphRadioData).map((neighborNodeIp) => {
                    // console.log('kyle_debug: neighborNodeIp', neighborNodeIp);
                    const alignedGraphRadioDataNeighbor = alignedGraphRadioData?.[neighborNodeIp] ?? [];
                    const selectedTimeResp = alignedGraphRadioDataNeighbor
                        .find(timeResp => timeResp.timestamp === currentTime);
                    // console.log('kyle_debug: convertNeighborTableData -> linkId',
                        // alignedRadioData[neighborNodeIp].linkId);
                    // console.log('kyle_debug: LinkAlignmentTableContainer -> convertNeighborTableData -> selectedLink',
                        // selectedLink);
                    // console.log('kyle_debug: getColor(selectedLink, alignedRadioData[neighborNodeIp].linkId)',
                        // getColor(selectedLink, alignedRadioData[neighborNodeIp].linkId));
                    return {
                        nodeIp: neighborNodeIp,
                        radioDevice: this.t('menuItemLabel', {returnObjects: true})[radio],
                        radio,
                        id: alignedRadioData[neighborNodeIp].linkId,
                        hostname: nodeInfo?.[neighborNodeIp]?.hostname ?? '-',
                        mac: alignedRadioData[neighborNodeIp].mac,
                        model: nodeInfo?.[neighborNodeIp]?.model ?? '-',
                        indicator: getColor(selectedLink, alignedRadioData[neighborNodeIp].linkId),
                        rssiChain: selectedTimeResp ?
                        `${checkRssiChain(selectedTimeResp.chainData.rssiChain0)}/${checkRssiChain(selectedTimeResp.chainData.rssiChain1)}` :
                        '-/-',
                        rssiLocal: selectedTimeResp ? selectedTimeResp.rssi.local :
                            alignedRadioData[neighborNodeIp].rssi.local,
                        bitRateLocal: selectedTimeResp ? selectedTimeResp.bitrate.local / 1000000 :
                            alignedRadioData[neighborNodeIp].bitrate.local / 1000000,
                        rssiRemote: selectedTimeResp ? selectedTimeResp.rssi.remote :
                            alignedRadioData[neighborNodeIp].rssi.remote,
                        bitRateRemote: selectedTimeResp ? selectedTimeResp.bitrate.remote / 1000000 :
                            alignedRadioData[neighborNodeIp].bitrate.remote / 1000000,
                        // action: 'addNode',
                    };
                });
            return accumulator.concat(radioDataArray);
        }, []);
        // console.log('kyle_debug: LinkAlignmentTableContainer -> convertNeighborTableData -> data', data);
        if (tblToggle.enableSort) {
            this.sortByHeader(data);
        }
        let filteredData = filterData(data, filterKey);

        if (enableSearch) {
            filteredData = searchData(filteredData, searchKey);
        }

        const createColorElement = (colors) => {
            if (colors) {
                return (
                    <span style={{display: 'flex', justifyContent: 'center'}}>
                        <span style={{
                            width: '33px',
                            height: '13px',
                            backgroundColor: colors.local,
                            marginRight: '2px',
                        }}
                        />
                        <span style={{
                            width: '33px',
                            height: '13px',
                            backgroundColor: colors.remote,
                            marignLeft: '2px',
                        }}
                        />
                    </span>
                );
            }
            return (
                <span style={{display: 'flex', justifyContent: 'center'}}>
                    <span style={{
                        width: '33px',
                        height: '13px',
                        backgroundColor: Constant.colors.footerTxt,
                        marginRight: '2px',
                    }}
                    />
                    <span style={{
                        width: '33px',
                        height: '13px',
                        backgroundColor: Constant.colors.footerTxt,
                        marignLeft: '2px',
                    }}
                    />
                </span>
            );
        };
        // console.log('data: ', data);
        return filteredData.map(radioNeighbor => ({
            ...radioNeighbor,
            indicator: createColorElement(radioNeighbor.indicator),
            // action: this.createAddButton(radioNeighbor.nodeIp),
        }));
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    convertNeighborTable() {
        const {
            focusedLink, selectedLink, sorting, sortBy,
            customizedColumn
        } = this.props;
        const tblData = this.convertNeighborTableData();
        const selectedId = focusedLink.map(focused => focused.linkId);
        const rowSelectedId = selectedLink.map(focused => focused.linkId);
        return {
            ...this.state.table,
            tblHeaders: {
                ...this.state.table.tblHeaders,
                sortBy,
                sorting,
                Headers: this.state.table.tblHeaders.Headers.filter(Header =>
                    customizedColumn.includes(Header.header)),
            },
            tblData,
            tblSelector: {
                selectedId,
                rowSelectedId,
            },
        };
    }

    handleRequestSortFn(event, property) {
        const {sorting, sortBy} = this.props;

        let sort = 'asc';
        if (sortBy === property && sorting === 'asc') {
            sort = 'desc';
        }
        this.props.setSorting(property, sort);
    }

    sortByHeader(data) {
        const {sorting, sortBy} = this.props;
        const dataSorting = (order, orderBy) => (order === 'desc' ?
            (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
            :
            (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        );
        data.sort(
            dataSorting(sorting, sortBy)
        );
    }

    render() {
        return this.props.children({
            neighborTableBar: this.convertNeighborTableBar(),
            neighborTableData: this.convertNeighborTable(),
            dialog: this.state.dialog,
            style: {
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
                    height: '',
                },
                tableRow: {
                    height: '60px',
                },
            },
        });
    }
}

LinkAlignmentTableContainer.propTypes = {
    importRadioData: PropTypes.object.isRequired,   // eslint-disable-line
    csrf: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    radioData: PropTypes.array.isRequired,  // eslint-disable-line
    radioDataHistory: PropTypes.array.isRequired,  // eslint-disable-line
    nodeIp: PropTypes.string.isRequired,
    selectedRadio: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateFocusedLink: PropTypes.func.isRequired,
    updateSelectededLink: PropTypes.func.isRequired,
    setSorting: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    setSearchKey: PropTypes.func.isRequired,
    toggleSearch: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    filterKey: PropTypes.string.isRequired,
    searchKey: PropTypes.string.isRequired,
    customizedColumn: PropTypes.arrayOf(PropTypes.string).isRequired,
    enableSearch: PropTypes.bool.isRequired,
    focusedLink: PropTypes.arrayOf(PropTypes.shape({
        linkId: PropTypes.string,
        colors: PropTypes.shape({
            local: PropTypes.string,
            remote: PropTypes.string,
        }),
        nodeIp: PropTypes.string,
        mac: PropTypes.string,
        radio: PropTypes.string,
    })).isRequired,
    selectedLink: PropTypes.arrayOf(PropTypes.shape({
        linkId: PropTypes.string,
        colors: PropTypes.shape({
            local: PropTypes.string,
            remote: PropTypes.string,
        }),
        nodeIp: PropTypes.string,
        mac: PropTypes.string,
        radio: PropTypes.string,
    })).isRequired,
    currentTime: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    graphRadioData: PropTypes.object.isRequired,
    sortBy: PropTypes.string.isRequired,
    sorting: PropTypes.string.isRequired,
    nodeInfo: PropTypes.object.isRequired, // eslint-disable-line
};


function mapStateToProps(store) {
    return {
        csrf: store.common.csrf,
        selectedRadio: store.linkAlignment.selectedRadio,
        nodeIp: store.linkAlignment.ip,
        radioData: store.linkAlignment.tableRadioData,
        radioDataHistory: store.linkAlignment.radioData,
        focusedLink: store.linkAlignment.focusedLink,
        selectedLink: store.linkAlignment.selectedLink,
        isPolling: store.linkAlignment.isPolling,
        filterKey: store.linkAlignment.filterKey,
        searchKey: store.linkAlignment.searchKey,
        enableSearch: store.linkAlignment.enableSearch,
        customizedColumn: store.linkAlignment.customizedColumn,
        graphRadioData: store.linkAlignment.graphRadioData,
        sortBy: store.linkAlignment.sortBy,
        sorting: store.linkAlignment.sorting,
        nodeInfo: store.meshTopology.nodeInfo,
    };
}

export default compose(
    connect(
        mapStateToProps,
        {
            updateFocusedLink,
            updateSelectededLink,
            setSorting,
            setFilter,
            setSearchKey,
            toggleSearch,
            toggleColumn,
        }
    ),
    withTranslation(['link-alignment'])
)(LinkAlignmentTableContainer);
