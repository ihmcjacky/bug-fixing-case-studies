// import moment from 'moment';
import Constants from './linkAlignmentConstants';
// import {get} from '../../util/common';

const INITIAL_STATE = {
    open: false,
    ip: '',
    radioData: [],
    tableRadioData: [],
    graphRadioData: {},
    focusedLink: [],
    selectedLink: [],
    selectedRadio: ['radio0'],
    isPolling: false,
    numOfTotalRes: 0,
    lastTimestamp: '',
    graphCurrentTime: '',
    filterKey: 'all',
    searchKey: '',
    enableSearch: false,
    sortBy: 'mac',
    sorting: 'asc',
    customizedColumn : [
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
    configProcessing: false,
};

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

// const initStatData = {
//     local: {
//         items: 0,
//         accum: '-',
//         max: '-',
//         min: '-',
//     },
//     remote: {
//         items: 0,
//         accum: '-',
//         max: '-',
//         min: '-',
//     },
// };

// function getMax(oldVal, newVal) {
//     return oldVal > newVal ? oldVal : newVal;
// }

// function getMin(oldVal, newVal) {
//     return oldVal < newVal ? oldVal : newVal;
// }

// function calStatObj(currentData, newData, type) {
//     if (!newData[type]) return currentData[type];
//     const temp = typeof newData[type] === 'string' ?
//         parseInt(newData[type].replace(' dBm', ''), 10) : newData[type];
//     const max = getMax(currentData[type].max, temp);
//     const min = getMin(currentData[type].min, temp);
//     return {
//         items: currentData[type].items + 1,
//         accum: currentData[type].accum === '-' ?
//             temp : temp + currentData.local.accum,
//         max: currentData[type].max === '-' ? temp : max,
//         min: currentData[type].min === '-' ? temp : min,
//     };
// }

// function isInTimeDomain(timestamp, startTime) {
//     const compareTime = new Date(timestamp);
//     const rangeLimit = new Date(startTime);
//     return compareTime.getTime() >= rangeLimit.getTime();
// }

// function getOutRangeDataIndex(data, startTime) {
//     if (data.length >= 1) {
//         let cutOff = 0;
//         data.some((d, index) => {
//             if (isInTimeDomain(d.timestamp, startTime)) {
//                 cutOff = index - 1;
//                 return true;
//             }
//             return false;
//         });
//         return cutOff;
//     }
//     return -1;
// }

function linkAlignmentReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.TOGGLE_LINK_ALIGNMENT_DIALOG: {
            if (action.data === undefined) {
                return {...state, open: !state.open};
            }
            const {isZ500OrX10} = action.data;
            const defaultRadio = isZ500OrX10 ? ['radio1'] : ['radio0'];
            return {
                ...state,
                open: action.data.open,
                ip: action.data.ip ? action.data.ip : state.ip,
                radioData: action.data.resetData ? [] : state.radioData,
                tableRadioData: action.data.resetData ? [] : state.tableRadioData,
                focusedLink: action.data.resetData ? [] : state.focusedLink,
                selectedLink: action.data.resetData ? [] : state.selectedLink,
                selectedRadio: action.data.resetData ? defaultRadio : state.selectedRadio,
                graphRadioData: action.data.resetData ? {} : state.graphRadioData,
            };
        }
        case Constants.RESTART_RADIO_INFO: {
            return {
                ...state,
                graphRadioData: {},
                radioData: [],
                tableRadioData: [],
            };
        }
        case Constants.SET_RADIOINFO_POLLING_STATUS: {
            return {
                ...state,
                isPolling: action.start,
            };
        }
        case Constants.UPDATE_RADIO_INFO_RES: {
            if (!action.success) {
                return {
                    ...state,
                };
            }
            return {
                ...state,
                numOfTotalRes: state.numOfTotalRes + 1,
                ...action.data,
            };
            // return {
            //     ...state,
            //     radioData: newData,
            //     tableRadioData,
            //     graphRadioData,
            //     numOfTotalRes: state.numOfTotalRes + 1,
            //     lastTimestamp,
            //     selectedLink,
            //     focusedLink,
            // }
        }
        case Constants.CLEAR_RADIO_INFO_ARRAY: {
            return {
                ...state,
                radioData: [],
                numOfTotalRes: 0,
                isPolling: false,
            };
        }
        case Constants.SET_RADIO: {
            const deepClone = object => JSON.parse(JSON.stringify(object));
            const {
                graphRadioData,
                tableRadioData,
                ip,
            } = state;
            let selectedLink = deepClone(state.selectedLink);
            let focusedLink = deepClone(state.focusedLink);
            const canGetRadioNeighborAmongRadio = action.data.some(radio =>
                get(tableRadioData, [ip, radio, 'radioNeighbors']));
            const getAtLeastOneSelectedLink = action.data.some(radio =>
                selectedLink.some(link => link.radio === radio));
            if (canGetRadioNeighborAmongRadio &&
                (selectedLink.length === 0 || !getAtLeastOneSelectedLink)) {
                // const alignedRadioData = get(tableRadioData,
                //     [ip, action.data, 'radioNeighbors']) || {};
                // console.log('kyle_debug: linkAlignmentReducer -> alignedRadioData', alignedRadioData);
                // const data = Object.keys(alignedRadioData).length === 0 ? [] :
                //     Object.keys(alignedRadioData).map(neighborNodeIp => ({
                //         nodeIp: neighborNodeIp,
                //         id: alignedRadioData[neighborNodeIp].linkId,
                //         mac: alignedRadioData[neighborNodeIp].mac,
                //         rssiLocal: alignedRadioData[neighborNodeIp].rssi.local,
                //         rssiRemote: alignedRadioData[neighborNodeIp].rssi.remote,
                //     }));
                // const sorting = (order, orderBy) => (order === 'desc' ?
                //     (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
                //     :
                //     (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
                // );
                // data.sort(
                //     sorting(state.sorting, state.sortBy)
                // );
                // selectedLink = data.length > 0 ? [{
                //     linkId: data[0].id,
                //     mac: data[0].mac,
                //     nodeIp: data[0].nodeIp,
                //     colors: {
                //         local: '#122d54',
                //         remote: '#de357c',
                //     },
                // }] : [];
                // focusedLink = data.length > 0 ? [{
                //     linkId: data[0].id,
                //     mac: data[0].mac,
                //     nodeIp: data[0].nodeIp,
                // }] : [];
                const data = action.data.reduce((accumulator, radio) => {
                    console.log('kyle_debug: LinkAlignmentTableContainer -> convertNeighborTableData -> radio', radio);
                    const alignedRadioData = get(tableRadioData, [ip, radio, 'radioNeighbors']) || {};
                    const alignedGraphRadioData = get(graphRadioData, [ip, radio]) || {};

                    const radioDataArray = Object.keys(alignedGraphRadioData).length === 0 ? [] :
                        Object.keys(alignedGraphRadioData).map((neighborNodeIp) => {
                            console.log('kyle_debug: neighborNodeIp', neighborNodeIp);
                            const alignedGraphRadioDataNeighbor = get(alignedGraphRadioData, [neighborNodeIp]) || [];
                            const selectedTimeResp = alignedGraphRadioDataNeighbor
                                .find(timeResp => timeResp.timestamp === state.graphCurrentTime);
                            return {
                                nodeIp: neighborNodeIp,
                                radio,
                                id: alignedRadioData[neighborNodeIp].linkId,
                                hostname: get(action.graphNodeInfo, [neighborNodeIp, 'hostname']) || '-',
                                mac: alignedRadioData[neighborNodeIp].mac,
                                model: get(action.graphNodeInfo, [neighborNodeIp, 'model']) || '-',
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
                ...state,
                selectedRadio: action.data,
                selectedLink,
                focusedLink,
                autoSelect: true,
            };
        }
        case Constants.SET_FILTER: {
            return {
                ...state,
                filterKey: action.data,
                // autoSelect: false,
            };
        }
        case Constants.SET_SEARCH_KEY: {
            return {
                ...state,
                searchKey: action.data,
            };
        }
        case Constants.TOGGLE_SEARCH: {
            return {
                ...state,
                enableSearch: action.data,
            };
        }
        case Constants.TOGGLE_COLUMN: {
            return {
                ...state,
                customizedColumn: action.data,
            }
        }
        case Constants.UPDATE_FOCUSED_LINK: {
            return {
                ...state,
                focusedLink: action.data,
                // autoSelect: false,
            };
        }
        case Constants.UPDATE_SELECTED_LINK: {
            return {
                ...state,
                selectedLink: action.data,
                autoSelect: false,
            };
        }
        case Constants.SET_SORTING: {
            return {
                ...state,
                sorting: action.data.sorting,
                sortBy: action.data.sortBy,
            };
        }
        case Constants.UPDATE_RSSI_GRAPH_CHART_DATA: {
            return {
                ...state,
                graphRadioData: action.data.graphRadioData,
                graphCurrentTime: action.data.graphTime,
            };
        }
        case Constants.CONFIG_IN_PROCESS: {
            return {
                ...state,
                configProcessing: action.processing,
            };
        }
        default:
            return state;
    }
}

export default linkAlignmentReducer;
