import Constants from './meshTopologyConstants';
import {getOperationModeValue, getOperationModeList} from './meshTopologyActions';

const INITIAL_STATE = {
    graph: {
        edges: [],
        nodes: [],
    },
    nodeInfo: {},
    nodeStat: {},
    linkInfo: {},
    lastUpdateTime: {
        graph: '',
        nodeInfo: '',
        linkInfo: '',
        nodeStat: '',
    },
    image: {
        set: false,
        id: '',
        timestamp: '',
    },
    initState: {
        graph: false,
        nodeInfo: false,
        linkInfo: false,
        nodeStat: false,
    },
    macToIpMap: {},
    macToHostnameMap: {},
    ipToMacMap: {},
    ipToHostnameMap: {},
    linkColorMap: {},
    adjustMode: false,
    graphUpdate: true,
    // count the number of unreachable nodes, more than 2 would be considered as hostnode unreachable
    hostnodeUnreachableCount: 0,
    shouldShowHostnodeUnreachableDialog: true,
};

function uiSettingsReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.UPDATE_GRAPH: {
            return {
                ...state,
                graph: action.graph,
                lastUpdateTime: {
                    ...state.lastUpdateTime,
                    graph: action.timestamp,
                },
                initState: {
                    ...state.initState,
                    graph: true,
                },
                hostnodeUnreachableCount: action.hostnodeUnreachableCount,
                shouldShowHostnodeUnreachableDialog: action.shouldShowHostnodeUnreachableDialog,
            };
        }
        case Constants.UPDATE_SHOULD_SHOW_HOSTNODE_UNREACHABLE_DIALOG: {
            return {
                ...state,
                shouldShowHostnodeUnreachableDialog: action.shouldShow,
            };
        }
        case Constants.UPDATE_ETH_LINK_SEGMENTS: {
            const graph = state.graph;
            const nodes = action.nodes;
            // console.log('UPDATE_ETH_LINK_SEGMENTS');
            // console.log(graph);
            const newTable = {};
            if (graph.mdopTable) {
                const {mdopTable} = graph;
                const mdopSegments = {};
                Object.keys(nodes).forEach(
                    (nodeIp) => {
                        if (nodes[nodeIp].mdopSegments) {
                            Object.keys(nodes[nodeIp].mdopSegments).forEach(
                                (mdopId) => {
                                    mdopSegments[mdopId] = nodes[nodeIp].mdopSegments[mdopId];
                                }
                            );
                        }

                    }
                );

                Object.keys(mdopTable).map(
                    (mdopId) => {
                        newTable[mdopId] = {
                            ...mdopTable[mdopId],
                            neighbors: {},
                        };
                        Object.keys(mdopTable[mdopId].neighbors).map(
                            (mdopMember) => {
                                if (mdopSegments[mdopId]) {
                                    newTable[mdopId].neighbors[mdopMember] = {
                                        ...mdopTable[mdopId].neighbors[mdopMember],
                                        eth: mdopSegments[mdopId][mdopMember].ethernet,
                                    };
                                } else {
                                    // whether should show previous eth
                                    newTable[mdopId].neighbors[mdopMember] = {
                                        ...mdopTable[mdopId].neighbors[mdopMember],
                                        eth: undefined,
                                    };
                                }
                            }
                        );
                    }
                );
                const newNodes = graph.nodes.map(
                    (node) => {
                        if (!node.hasMdop) return node;

                        const {mdopIdList} = node.mdopInfo;
                        const modeLabelList = {
                            eth0: '',
                            eth1: '',
                        };
                        mdopIdList.forEach(
                            (mdopId) => {
                                if (
                                    newTable[mdopId] &&
                                    newTable[mdopId].neighbors[node.id].eth !== undefined
                                ) {
                                    if (newTable[mdopId].neighbors[node.id].eth === 0) {
                                        modeLabelList.eth0 = mdopId;
                                    } else {
                                        modeLabelList.eth1 = mdopId;
                                    }
                                }
                            }
                        );

                        return {
                            ...node,
                            mdopInfo: {
                                ...node.mdopInfo,
                                modeLabelList,
                            }
                        };

                    }
                );
                // console.log('newNode');
                // console.log(newNodes);
                return {
                    ...state,
                    graph: {
                        ...graph,
                        nodes: newNodes,
                        mdopTable: newTable,
                    },
                };
            }
            return {...state};
        }
        case Constants.UPDATE_OPERATION_MODE: {
            const {graph} = state;
            const {config} = action;
            const operationModeList = getOperationModeList(config.radioSettings);
            const newGraph = {
                ...graph,
                nodes: graph.nodes.map(
                    (node) => {
                        return {
                            ...node,
                            operationMode: getOperationModeValue(operationModeList[node.id], node.operationMode),
                        };
                    }
                ),
            }
            return {
                ...state,
                graph: newGraph,
                lastUpdateTime: {
                    ...state.lastUpdateTime,
                    graph: action.timestamp,
                },
                initState: {
                    ...state.initState,
                    graph: true,
                },
            };
        }
        case Constants.UPDATE_NODE_INFO: {
            const {
                updateInfo,
                macToIpMap,
                macToHostnameMap,
                ipToMacMap,
                ipToHostnameMap,
            } = action.data;
            return {
                ...state,
                nodeInfo: updateInfo,
                macToIpMap,
                macToHostnameMap,
                ipToMacMap,
                ipToHostnameMap,
                lastUpdateTime: {
                    ...state.lastUpdateTime,
                    nodeInfo: action.timestamp,
                },
                initState: {
                    ...state.initState,
                    nodeInfo: true,
                },
            };
        }
        case Constants.UPDATE_NETWORK_DEVICE_STAT: {
            console.log('------------fetch node stat---------');
            // const currentNodeInfo = Object.assign({}, state.graphNodeInfo);
            const currentNodeStat = Object.assign({}, state.nodeStat);
            // const nodes = action.data;
            const get = (o, p) =>
                p.reduce(
                    (xs, x) =>
                        ((xs && xs[x]) ?
                            xs[x] : null), o);
            // console.log(action);
            let currentDate = '';
            // console.log('currentNodeStat 1', JSON.parse(JSON.stringify(currentNodeStat)))

            Object.keys(currentNodeStat).forEach((ip) => {
                currentNodeStat[ip].latestUpdate = false;
            });
            // console.log('currentNodeStat 2', JSON.parse(JSON.stringify(currentNodeStat)))

            Object.keys(action.nodeStat).forEach((ip) => {
                currentNodeStat[ip] = action.nodeStat[ip];
                currentNodeStat[ip].latestUpdate = true;
                currentNodeStat[ip].latestUpdateTime = action.nodeStat[ip].lastUpdateTime;
            });
            // console.log('currentNodeStat 3', JSON.parse(JSON.stringify(currentNodeStat)))

            const newNodeStat = JSON.parse(JSON.stringify(currentNodeStat));
            if (Object.keys(newNodeStat).length !== 0) {
                
                Object.keys(newNodeStat).forEach((nodeIp) => {

                    currentDate = new Date(get(newNodeStat, [nodeIp, 'latestUpdateTime']));

                    Object.keys(newNodeStat[nodeIp]).forEach((opt) => {

                        // skip lastUpdateTime
                        if (opt === 'lastUpdateTime') return;

                        if (
                            (opt.startsWith('radio') || opt.startsWith('eth')) &&
                            get(newNodeStat, [nodeIp, 'latestUpdate']) &&
                            get(state.nodeStat, [nodeIp, 'latestUpdateTime'])
                        ) {

                            const lastUpdateTime = new Date(get(state.nodeStat, [nodeIp, 'latestUpdateTime']));
                            // console.log('currentDate', currentDate.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));
                            // console.log('lastUpdateTime', lastUpdateTime.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));
                            const delta = (currentDate.getTime() - lastUpdateTime.getTime()) / 1000;

                            // if there is no update, keep orginal speed
                            if (delta <= 0) {
                                newNodeStat[nodeIp][opt].speed = {
                                    tx: {
                                        ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.tx),
                                        runtime: state.nodeStat[nodeIp][opt].speed.tx.runtime,
                                    },
                                    rx: {
                                        ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.rx),
                                        runtime: state.nodeStat[nodeIp][opt].speed.rx.runtime,
                                    },
                                };
                                return;
                            };
                            
                            const txSpeed = Math.round(((newNodeStat[nodeIp][opt].txBytes * 8)
                                - (state.nodeStat[nodeIp][opt].txBytes * 8)) / delta);
                            const rxSpeed = Math.round(((newNodeStat[nodeIp][opt].rxBytes * 8)
                                - (state.nodeStat[nodeIp][opt].rxBytes * 8)) / delta);
                            newNodeStat[nodeIp][opt].speed = {
                                tx: {
                                    ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.tx),
                                    // eslint-disable-next-line no-restricted-globals
                                    runtime: isNaN(txSpeed) ? '-' : txSpeed.toString(),
                                },
                                rx: {
                                    ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.rx),
                                    // eslint-disable-next-line no-restricted-globals
                                    runtime: isNaN(rxSpeed) ? '-' : rxSpeed.toString(),
                                },
                            };
                            console.log(nodeIp, ' ', opt, ' ', 'delta', delta, ' txSpeed', txSpeed, ' rxSpeed', rxSpeed);

                        
                        //  For the first time, the speed is not available
                        } else if (!opt.startsWith('latestUpdate')) {
                            newNodeStat[nodeIp][opt].speed = {
                                tx: {
                                    ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.tx),
                                    runtime: '-',
                                },
                                rx: {
                                    ...(opt.startsWith('eth') && newNodeStat[nodeIp][opt].speed.rx),
                                    runtime: '-',
                                },
                            };
                        }
                    });
                });
            }
            return {
                ...state,
                nodeStat: newNodeStat,
                lastUpdateTime: {
                    ...state.lastUpdateTime,
                    nodeStat: action.timestamp,
                },
                initState: {
                    ...state.initState,
                    nodeStat: true,
                },
                ...(currentDate && {nodeStatTime: currentDate}),
            };
        }
        case Constants.UPDATE_LINK_INFO: {
            return {
                ...state,
                graph: {
                    ...state.graph,
                    ethernetDirectEnabledList: action.data.ethernetDirectEnabledList,
                },
                linkInfo: action.data.updateLinkInfo,
                linkColorMap: action.data.updateColorMap,
                lastUpdateTime: {
                    ...state.lastUpdateTime,
                    linkInfo: action.timestamp,
                },
                initState: {
                    ...state.initState,
                    linkInfo: true,
                },
            }
        }
        case Constants.STOP_GRAPH_UPDATE: {
            return {
                ...state,
                graphUpdate: false,
            };
        }
        case Constants.RESUME_GRAPH_UPDATE: {
            return {
                ...state,
                graphUpdate: true,
            };
        }
        case Constants.INIT_BACKGROUND: {
            return {
                ...state,
                image: {
                    ...action.image,
                    timestamp: '',
                },
            };
        }
        case Constants.UPDATE_BACKGROUND_ID: {
            return {
                ...state,
                image: action.imgObj,
            };
        }
        case Constants.ADJUST_MODE_ONOFF: {
            return {
                ...state,
                adjustMode: action.open,
            };
        }
        default: {
            return state;
        }
    }
}

export default uiSettingsReducer;
