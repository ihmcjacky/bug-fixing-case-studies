import moment from 'moment';
import Constants from './linkAlignmentConstants';
import store from '../store';

const emptyBitrate = {
    local: 0,
    remote: 0,
};

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const deepClone = object => JSON.parse(JSON.stringify(object));

export function toggleAlignmentDialog(open, ip = '', resetData = false) {
    const {
        nodeInfo,
    } = store.getState().meshTopology;
    if (!open) {
        return {
            type: Constants.TOGGLE_LINK_ALIGNMENT_DIALOG,
            data: {
                open,
                ip,
                resetData,
            },
        };
    }

    const modelTemp = nodeInfo[ip].model;
    const isZ500OrX10 = modelTemp.match(/^[X][1]/g) || modelTemp.match(/^[Z][5][0][0]/g);
    return {
        type: Constants.TOGGLE_LINK_ALIGNMENT_DIALOG,
        data: {
            open,
            ip,
            resetData,
            isZ500OrX10,
        },
    };
}

export function radioInfoPolling(start) {
    return {
        type: Constants.SET_RADIOINFO_POLLING_STATUS,
        start,
    };
}

export function clearCurrentGraphData() {
    return {
        type: Constants.RESTART_RADIO_INFO,
    };
}

function getOutRangeDataIndex(data, startTime) {
    if (data.length) {
        let cutOff = 0;
        const timeLimit = new Date(startTime);
        data.some((d, index) => {
            const pointTime = new Date(d.timestamp);
            if (pointTime.getTime() >= timeLimit.getTime()) {
                cutOff = index;
                return true;
            }
            return false;
        });
        return cutOff;
    }
    return 0;
}

function udpateRadioInfoResponse(radioResponse) {
    const {lastTimestamp} = radioResponse;
    const state = store.getState().linkAlignment;
    const {graphNodeInfo} = store.getState().meshTopology;
    const sliceFrom = getOutRangeDataIndex(state.radioData, moment(lastTimestamp).subtract(180, 'minutes'));
    const mergeData = state.radioData.length > 0 ?
        state.radioData[state.radioData.length - 1].timestamp === lastTimestamp : false;
    const sliceTo = mergeData ? state.radioData.length - 1 : state.radioData.length;
    const actionData = radioResponse.data;
    const newData = [...state.radioData.slice(sliceFrom, sliceTo),
        {...actionData, timestamp: lastTimestamp}];
    let selectedLink = deepClone(state.selectedLink);
    let focusedLink = deepClone(state.focusedLink);
    const {tableRadioData} = state;
    console.log('kyle_debug: linkAlignmentReducer -> tableRadioData(before)', tableRadioData);
    const graphRadioData = deepClone(state.graphRadioData);
    Object.keys(actionData).forEach((nodeIp) => {
        if (nodeIp !== 'timestamp') {
            console.log('if (nodeIp !== ) ');
            graphRadioData[nodeIp] = graphRadioData[nodeIp] || {};
            tableRadioData[nodeIp] = tableRadioData[nodeIp] || {};
            Object.keys(actionData[nodeIp]).forEach((radioName) => {
                graphRadioData[nodeIp][radioName] = graphRadioData[nodeIp][radioName] || {};
                tableRadioData[nodeIp][radioName] = tableRadioData[nodeIp][radioName] || {};
                Object.keys(actionData[nodeIp][radioName]).forEach((opt) => {
                    if (opt === 'radioNeighbors') {
                        tableRadioData[nodeIp][radioName][opt] =
                            tableRadioData[nodeIp][radioName][opt] || {};
                        Object.keys(actionData[nodeIp][radioName][opt])
                            .forEach((neighborsNodeIp) => {
                                graphRadioData[nodeIp][radioName][neighborsNodeIp] =
                                    graphRadioData[nodeIp][radioName][neighborsNodeIp] || [];
                                const tempGraphRadioData = graphRadioData[nodeIp][radioName][neighborsNodeIp];
                                const tempActionData = actionData[nodeIp][radioName][opt][neighborsNodeIp];
                                const newGraphData = {
                                    bitrate: tempActionData.bitrate && tempActionData.isConnected ?
                                        tempActionData.bitrate : emptyBitrate,
                                    rssi: {
                                        local: tempActionData.rssi.local && tempActionData.isConnected ?
                                            tempActionData.rssi.local : -95,
                                        remote: tempActionData.rssi.remote && tempActionData.isConnected ?
                                            tempActionData.rssi.remote : -95,
                                    },
                                    chainData: {
                                        rssiChain0: tempActionData.isConnected && typeof tempActionData.linkRssiChain0 === 'number' ?
                                            tempActionData.linkRssiChain0 : null,
                                        rssiChain1: tempActionData.isConnected && typeof tempActionData.linkRssiChain1 === 'number' ?
                                            tempActionData.linkRssiChain1 : null,
                                    },
                                    nodeTimestamp: tempActionData.timestamp,
                                    timestamp: lastTimestamp,
                                    source: radioResponse.source,
                                    isConnected: tempActionData.isConnected,
                                };
                                const lastData = tempGraphRadioData[tempGraphRadioData.length - 1];

                                if ((lastData && lastData.nodeTimestamp === tempActionData.timestamp)) {
                                    // do nothing
                                } else if ((lastData && lastData.timestamp === lastTimestamp)) {
                                    tempGraphRadioData[tempGraphRadioData.length - 1] = newGraphData;
                                } else {
                                    tempGraphRadioData.push(newGraphData);
                                }
                                const from = getOutRangeDataIndex(tempGraphRadioData,
                                    moment(lastTimestamp).subtract(180, 'minutes'));
                                graphRadioData[nodeIp][radioName][neighborsNodeIp] =
                                    tempGraphRadioData.slice(from, tempGraphRadioData.length);
                                tableRadioData[nodeIp][radioName][opt][neighborsNodeIp] =
                                    actionData[nodeIp][radioName][opt][neighborsNodeIp];
                                const lastTableDataTimeStamp = get(state.tableRadioData,
                                    [nodeIp, radioName, opt, neighborsNodeIp, 'timestamp']);
                                if (lastTableDataTimeStamp && lastTableDataTimeStamp ===
                                    actionData[nodeIp][radioName][opt][neighborsNodeIp].timestamp
                                ) {
                                    tableRadioData[nodeIp][radioName][opt][neighborsNodeIp].rssi = {
                                        local: '-95',
                                        remote: '-95',
                                    };
                                } else if (tableRadioData[nodeIp][radioName][opt][neighborsNodeIp]
                                        .rssi.remote === null) {
                                    tableRadioData[nodeIp][radioName][opt][neighborsNodeIp].rssi.remote =
                                        get(state.tableRadioData, [nodeIp, radioName, opt,
                                            neighborsNodeIp, 'rssi', 'remote']) || '0';
                                }
                            });
                    }
                });
            });
        }
    });
    console.log('kyle_debug: linkAlignmentReducer -> tableRadioData(after)', tableRadioData);
    const canGetRadioNeighborAmongRadio = state.selectedRadio.some(radio =>
        get(tableRadioData, [state.ip, radio, 'radioNeighbors']));
    if (canGetRadioNeighborAmongRadio &&
    selectedLink.length === 0) {
        // const alignedRadioData = get(tableRadioData,
        //     [state.ip, state.selectedRadio, 'radioNeighbors']) || {};
        // console.log('kyle_debug: linkAlignmentReducer -> alignedRadioData', alignedRadioData);
        // const data = Object.keys(alignedRadioData).length === 0 ? [] :
        //     Object.keys(alignedRadioData).map(neighborNodeIp => ({
        //         nodeIp: neighborNodeIp,
        //         id: alignedRadioData[neighborNodeIp].linkId,
        //         mac: alignedRadioData[neighborNodeIp].mac,
        //         rssiLocal: alignedRadioData[neighborNodeIp].rssi.local,
        //         rssiRemote: alignedRadioData[neighborNodeIp].rssi.remote,
        //     }));
        const data = state.selectedRadio.reduce((accumulator, radio) => {
            console.log('kyle_debug: LinkAlignmentTableContainer -> convertNeighborTableData -> radio', radio);
            const alignedRadioData = get(tableRadioData, [state.ip, radio, 'radioNeighbors']) || {};
            const alignedGraphRadioData = get(graphRadioData, [state.ip, radio]) || {};

            const radioDataArray = Object.keys(alignedGraphRadioData).length === 0 ? [] :
                Object.keys(alignedGraphRadioData).map((neighborNodeIp) => {
                    console.log('kyle_debug: neighborNodeIp', neighborNodeIp);
                    const alignedGraphRadioDataNeighbor = get(alignedGraphRadioData, [neighborNodeIp]) || [];
                    const selectedTimeResp = alignedGraphRadioDataNeighbor
                        .find(timeResp => timeResp.timestamp === state.graphCurrentTime);
                    return {
                        nodeIp: neighborNodeIp,
                        radioDevice: radio,
                        radio,
                        id: alignedRadioData[neighborNodeIp].linkId,
                        hostname: get(graphNodeInfo, [neighborNodeIp, 'hostname']) || '-',
                        mac: alignedRadioData[neighborNodeIp].mac,
                        model: get(graphNodeInfo, [neighborNodeIp, 'model']) || '-',
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

        const sorting = (order, orderBy) => (order === 'desc' ?
            (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
            :
            (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        );
        data.sort(
            sorting(state.sorting, state.sortBy)
        );
        selectedLink = data.length > 0 ? [{
            radio: data[0].radio,
            linkId: data[0].id,
            mac: data[0].mac,
            nodeIp: data[0].nodeIp,
            colors: {
                local: '#122d54',
                remote: '#de357c',
            },
        }] : [];
        focusedLink = data.length > 0 ? [{
            radio: data[0].radio,
            linkId: data[0].id,
            mac: data[0].mac,
            nodeIp: data[0].nodeIp,
        }] : [];
    }
    return {
        type: Constants.UPDATE_RADIO_INFO_RES,
        data: {
            radioData: newData,
            tableRadioData,
            graphRadioData,
            lastTimestamp,
            selectedLink,
            focusedLink,
        },
        lastTimestamp: moment().format(),
        source: 'restful',
        success: true,
    };
}

export function handleRadioInfoRes(data) {
    console.log('----handleRadioInfoRes', data);
    const lastTimestamp = moment().format();
    if (!data.success && data?.data?.type === 'specific') {
        const temp = {};
        let hasUpdate = false;
        Object.keys(data.data.data).forEach((nodeIp) => {
            const node = data.data.data[nodeIp];
            if (node.success) {
                temp[nodeIp] = node.data;
                hasUpdate = true;
            } else if (node.specific) {
                temp[nodeIp] = node.specific;
                hasUpdate = true;
            } else {
                const currentData = store.getState().linkAlignment.radioData;
                if (currentData.length > 0) {
                    temp[nodeIp] = currentData[currentData.length - 1][nodeIp];
                    hasUpdate = true;
                }
            }
        });
        if (hasUpdate) {
            return udpateRadioInfoResponse({data: temp, lastTimestamp, source: 'restful'});
        }
    } else if (data.success) {
        return udpateRadioInfoResponse({data: data.data, lastTimestamp, source: 'restful'});
    }
    return {
        type: Constants.UPDATE_RADIO_INFO_RES,
        success: false,
    };
}

export function handleRadioInfoWebsocketRes(data) {
    const lastTimestamp = moment().format();
    const {radioData, ip} = store.getState().linkAlignment;
    const nodeIp = ip;
    const target = data[nodeIp];
    const newData = JSON.parse(JSON.stringify(radioData[radioData.length - 1]));
    if (newData[nodeIp]) {
        Object.keys(newData[nodeIp]).forEach((radioName) => {
            if (target && target[radioName]) {
                Object.keys(target[radioName].radioNeighbors).forEach((neiIp) => {
                    newData[nodeIp][radioName].radioNeighbors[neiIp] = {
                        ...target[radioName].radioNeighbors[neiIp],
                        rssi: {
                            local: target[radioName].radioNeighbors[neiIp].rssi.local,
                            remote: target[radioName].radioNeighbors[neiIp].rssi.remote,
                        },
                        bitrate: target[radioName].radioNeighbors[neiIp].bitrate,
                    };
                });
            }
        });
        // return {
        //     type: Constants.UPDATE_RADIO_INFO_RES,
        //     data: newData,
        //     lastTimestamp: moment().format(),
        //     source: 'websocket',
        //     success: true,
        // };
        return udpateRadioInfoResponse({data: newData, lastTimestamp, source: 'websocket'});
    }
    // no target node data
    return {
        type: Constants.UPDATE_RADIO_INFO_RES,
        source: 'websocket',
        success: false,
    };
}

export function clearRadioInfoData() {
    return {
        type: Constants.CLEAR_RADIO_INFO_ARRAY,
    };
}

export function setRadio(data) {
    const {graphNodeInfo} = store.getState().meshTopology;
    return {
        type: Constants.SET_RADIO,
        data,
        graphNodeInfo,
    };
}

export function setFilter(data) {
    return {
        type: Constants.SET_FILTER,
        data,
    };
}

export function setSearchKey(data) {
    return {
        type: Constants.SET_SEARCH_KEY,
        data,
    };
}

export const toggleColumn = (column) => (dispatch, getState) => {
    if (column === 'all') {
        dispatch({
            type: Constants.TOGGLE_COLUMN,
            data: [
                'indicator',
                'radioDevice',
                'hostname',
                'mac',
                'model',
                'rssiLocal',
                'rssiChain',
                'bitRateLocal',
                'rssiRemote',
                'bitRateRemote',
            ],
        })
        return;
    }
    const {linkAlignment: {customizedColumn}} = getState();
    const newCustomizedColumn = deepClone(customizedColumn);
    if (newCustomizedColumn.includes(column)) {
        newCustomizedColumn.splice(newCustomizedColumn.indexOf(column), 1);
        if (newCustomizedColumn.length === 0) {
            return;
        }
        dispatch({
            type: Constants.TOGGLE_COLUMN,
            data: newCustomizedColumn,
        })
        return;
    }
    newCustomizedColumn.push(column);
    dispatch({
        type: Constants.TOGGLE_COLUMN,
        data: newCustomizedColumn,
    })

};


export const toggleSearch = (resetSearch = false) => (dispatch, getState) => {
    const {linkAlignment: {enableSearch}} = getState();
    dispatch({
        type: Constants.TOGGLE_SEARCH,
        data: !resetSearch && !enableSearch,
    });
};


export const updateFocusedLink = (event, id, {nodeIp, mac, radio} = {}) => dispatch =>
    dispatch({
        type: Constants.UPDATE_FOCUSED_LINK,
        data: [{
            linkId: id,
            nodeIp,
            mac,
            radio,
        }],
    });

export const setSorting = (sortBy, sorting) => dispatch =>
    dispatch({
        type: Constants.SET_SORTING,
        data: {
            sortBy,
            sorting,
        },
    });

export const updateSelectededLink = (multipleSelect, id, {nodeIp, mac, radio}) => (dispatch, getState) => {
    const colorPool = [
        {
            local: '#122d54',
            remote: '#de357c',
        },
        {
            local: '#349d7e',
            remote: '#cb202d',
        },
        {
            local: '#205ba6',
            remote: '#ed7124',
        },
        {
            local: '#00838f',
            remote: '#f9a825',
        },
        {
            local: '#7e2981',
            remote: '#b6d234',
        },
        {
            local: '#3da9f4',
            remote: '#f680ab',
        },
    ];
    const pickColor = (rowSelectedId) => {
        let selectedColor = {};
        colorPool.some((color) => {
            const colorSelectedIndex = rowSelectedId
                .findIndex(selected => selected.colors.local === color.local);
            if (colorSelectedIndex === -1) {
                selectedColor = color;
                return true;
            }
            return false;
        });
        return selectedColor;
    };
    const {linkAlignment: {selectedLink: rowSelectedId}} = getState();
    let newRowSelectedId = [];
    // const rowSelectedIdIndex = rowSelectedId.indexOf(id);
    if (!multipleSelect) {
        newRowSelectedId = [
            {
                linkId: id,
                colors: colorPool[0],
                nodeIp,
                mac,
                radio,
            },
        ];
    } else {
        const rowSelectedIdIndex = rowSelectedId.findIndex(selected => selected.linkId === id);
        if (rowSelectedIdIndex === -1) {
            newRowSelectedId = newRowSelectedId.concat(rowSelectedId,
                {
                    linkId: id,
                    colors: pickColor(rowSelectedId),
                    nodeIp,
                    mac,
                    radio,
                });
        } else if (rowSelectedIdIndex === 0) {
            newRowSelectedId = newRowSelectedId.concat(rowSelectedId.slice(1));
        } else if (rowSelectedIdIndex === rowSelectedId.length - 1) {
            newRowSelectedId = newRowSelectedId.concat(rowSelectedId.slice(0, -1));
        } else if (rowSelectedIdIndex > 0) {
            newRowSelectedId = newRowSelectedId.concat(
                rowSelectedId.slice(0, rowSelectedIdIndex),
                rowSelectedId.slice(rowSelectedIdIndex + 1)
            );
        }
    }

    dispatch({
        type: Constants.UPDATE_SELECTED_LINK,
        data: newRowSelectedId,
    });
};

export function setLinkAlignmentChartData(data) {
    return {
        type: Constants.UPDATE_RSSI_GRAPH_CHART_DATA,
        data,
    };
}

export function setLinkAlignmentConfigProcessStatus(processing) {
    return {
        type: Constants.CONFIG_IN_PROCESS,
        processing,
    };
}
