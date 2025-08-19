import Cookies from 'js-cookie';
import moment from 'moment';
import Constants from './meshTopologyConstants';
import {
    // mockGetMeshTopology,
    getMeshTopology,
    getNodeInfo,
    getNetworkDeviceStat,
    getLinkInfo,
    getConfig,
    getEthLinkSegments,
    restartCNPipe
} from '../../util/apiCall';
import commonConstants from '../../constants/common';

const {linkGraphColor} = commonConstants;

function topologyChecker(res, currentGraph, isLocking, projectId) {
    const notiftyDeviceList = [];
    const savedRecogizeNodes = Cookies.get(`allRecognizeNodes-${projectId}`);
    const savedUnrecogizeNodes = Cookies.get(`unrecognizeNodes-${projectId}`);
    const allRecognizeNodes = savedRecogizeNodes ? JSON.parse(savedRecogizeNodes) : [];
    const unrecognizeNodes = savedUnrecogizeNodes ? JSON.parse(savedUnrecogizeNodes) : [];
    const newNodes = [];
    const curNodes = currentGraph.nodes;
    let unmanagedHostnode = false;
    let newUnmanagedNode = false;
    let lock = true;

    Object.keys(res).forEach((ip) => {
        if (res[ip].isHostNode && res[ip].isReachable) {
            lock = false;
        }
        if (res[ip].isHostNode && !res[ip].isManaged) {
            unmanagedHostnode = true;
        }
        unrecognizeNodes.forEach(
            (node) => {
                if (node === ip && !res[ip].isManaged && res[ip].isReachables) {
                    if (!allRecognizeNodes.includes(ip)) {
                        newUnmanagedNode = true;
                    }
                }
            }
        );

        const exist = curNodes.find(node => node.id === ip);
        if (!exist) {
            if (!allRecognizeNodes.includes(ip)) {
                if (res[ip].isReachable && !res[ip].isManaged) {
                    notiftyDeviceList.push(ip);
                }
                newNodes.push(ip);
            }
        }
    });
    const newUnrecognizeNodes = [];
    newNodes.forEach((ip) => {
        if (res[ip].isReachable && !res[ip].isManaged) {
            newUnmanagedNode = true;
            if (!allRecognizeNodes.includes(ip)) {
                allRecognizeNodes.push(ip);
            }
        }
    });
    Cookies.set(`allRecognizeNodes-${projectId}`, allRecognizeNodes);
    Cookies.set(`unrecognizeNodes-${projectId}`, newUnrecognizeNodes);

    return {
        lock: isLocking === lock ? undefined : lock,
        unmanagedHostnode,
        newUnmanagedNode,
        notiftyDeviceList,
    };
}

export function parseTopologyToGraph(meshTopology, currentGraph) {
    const edges = [];
    const nodes = [];
    const currentNodesOperationMode = {};
    const currentNodes = {};
    const mdopTable = {};
    let newTable = {};
    const mdopMap = {};
    const mdopLinks = {};
    const currentMdopTable = currentGraph.mdopTable;
    const ethernetDirectEnabledList = currentGraph.ethernetDirectEnabledList;

    console.log('kenny_debug parseTopologyToGraph');
    console.log('meshTopology');
    console.log(meshTopology);
    console.log(currentGraph);
    currentGraph.nodes.forEach(
        (node) => {
            console.log('node.operationMode');
            console.log(node.operationMode);
            currentNodes[node.id] = node;
            if (node.operationMode) {
                currentNodesOperationMode[node.id] = node.operationMode;
            } else {
                currentNodesOperationMode[node.id] = 'unknown';
            }
        }
    );
    
    Object.keys(meshTopology).forEach((nodeIp) => {
        const nodeData = meshTopology[nodeIp];
        if (nodeData.isVirtualNode && nodeData.isReachable) {
            mdopTable[nodeIp] = {
                neighbors: nodeData.neighbors,
                leader: nodeData.masterIp
            };
            const neighbors = nodeData.neighbors;
            Object.keys(neighbors).forEach(
                (neiIp) => {
                    const links = neighbors[neiIp].links;
                    Object.keys(links).forEach(
                        (linkId) => {
                            mdopLinks[linkId] = nodeIp;
                        }
                    );
                }
            );
            return;
        }
    });
    if (currentMdopTable) {
        console.log('currentMdopTable');
        console.log(currentMdopTable);
        console.log('mdopTable');
        console.log(mdopTable);

        Object.keys(mdopTable).forEach(
            (mdopId) => {
                // console.log('mdopId');
                // console.log(mdopId);
                newTable[mdopId] = {
                    ...mdopTable[mdopId],
                };

                Object.keys(mdopTable[mdopId].neighbors).map(
                    (mdopMember) => {
                        // console.log('mdopMember');
                        // console.log(mdopMember);
                        if(currentMdopTable[mdopId] && currentMdopTable[mdopId].neighbors[mdopMember]) {
                            newTable[mdopId].neighbors[mdopMember] = {
                                ...mdopTable[mdopId].neighbors[mdopMember],
                                eth: currentMdopTable[mdopId].neighbors[mdopMember].eth,
                            }
                        }
                    }
                );
                
                


            }
        );
    } else {
        newTable = mdopTable;
    }
    
    Object.keys(newTable).forEach((mdopId) => {
        console.log('mdopId');
        console.log(mdopId);
        const mdopData = newTable[mdopId];
        const neiList = Object.keys(mdopData.neighbors);
        console.log('neiList');
        console.log(neiList);
        neiList.forEach(
            (mdopMember) => {
                if (mdopMap[mdopMember]) {
                    mdopMap[mdopMember].push(mdopId);
                } else {
                    mdopMap[mdopMember] = [mdopId];
                }
            }
        );
    });
    
    Object.keys(meshTopology).forEach((nodeIp) => {
        const nodeData = meshTopology[nodeIp];
        if (nodeData.isVirtualNode) {
            // console.log('kenny_debug isVirtualNode');
            // console.log('nodeData');
            // console.log(nodeData);
            // mdopTable[nodeIp] = {neighbors: nodeData.neighbors};
            return;
            
        }
        if (!nodeData.isManaged && !nodeData.isReachable) return;
        const {neighbors} = nodeData;

        const hasMdop =  mdopMap[nodeIp] ? true : false;
        const mdopInfo = {};
        if (mdopMap[nodeIp]) {
            mdopInfo.mdopIdList = mdopMap[nodeIp];
        } else {
            mdopInfo.mdopIdList = [];
        }
        // console.log('kenny modeLabelList');
        // console.log(currentNodes[nodeIp]);
        if (currentNodes[nodeIp] && currentNodes[nodeIp].mdopInfo) {
            mdopInfo.modeLabelList = currentNodes[nodeIp].mdopInfo.modeLabelList;
        }
        if (!neighbors || Object.keys(neighbors).length === 0 || !nodeData.isReachable) {
            if (!nodeData.isManaged && !nodeData.isHostNode) return;
            nodes.push({
                id: nodeIp,
                isManaged: nodeData.isManaged,
                isReachable: nodeData.isReachable,
                isHostNode: nodeData.isHostNode,
                isAuth: nodeData.isAuth,
                isDataGateway: nodeData.isDataGateway,
                isMobile: nodeData.isMobile,
                isStatic: nodeData.isStatic,
                activeNeiNum: 0,
                totalNeiNum: 0,
                operationMode: currentNodesOperationMode[nodeIp] ? currentNodesOperationMode[nodeIp] : 'unknown',
                hasMdop,
                mdopInfo,
            });
            return;
        }
        const neiList = Object.keys(neighbors);
        let activeNeiNum = 0;
        let mdopLink = [];
        neiList.forEach((neiIp) => {
            const neiData = neighbors[neiIp];
            if (meshTopology[neiIp].isManaged && meshTopology[neiIp].isReachable) {
                activeNeiNum += 1;
            } else if (!meshTopology[neiIp].isReachable) {
                return;
            }
            const {links} = neiData;
            const linksList = Object.keys(links);
            linksList.forEach((linkId, index) => {
                console.log();
                if (mdopLinks[linkId]) {
                    // mdopLink = [
                    //     ...mdopLink,
                    //     {

                    //     }
                    // ]
                    return;
                }
                if (!edges.find(link => link.id === linkId)) {
                    edges.push({
                        id: linkId,
                        from: nodeIp,
                        to: neiIp,
                        status: links[linkId].status,
                        type: links[linkId].type,
                        linkIndex: index,
                        totalLink: linksList.length,
                    });
                }
            });
        });
        nodes.push({
            id: nodeIp,
            isManaged: nodeData.isManaged,
            isHostNode: nodeData.isHostNode,
            isReachable: nodeData.isReachable,
            isAuth: nodeData.isAuth,
            isDataGateway: nodeData.isDataGateway,
            isMobile: nodeData.isMobile,
            isStatic: nodeData.isStatic,
            activeNeiNum,
            totalNeiNum: neiList.length,
            operationMode: currentNodesOperationMode[nodeIp] ? currentNodesOperationMode[nodeIp] : 'unknown',
            mdopInfo,
            hasMdop,
        });
    });

    return {edges, nodes, mdopTable: newTable, ethernetDirectEnabledList};
}

export function getOperationModeList(radioSettings) {
    const result = {};
    Object.keys(radioSettings).map(
        (nodeIp) => {
            const nodeRadioSettings = radioSettings[nodeIp];
            result[nodeIp] = Object.keys(nodeRadioSettings).map(
                (radio) => {
                    return nodeRadioSettings[radio].operationMode;
                }
            );
            return radioSettings[nodeIp];
        }
    );
    return result;
}

export function getOperationModeValue(list, oldValue) {
    // console.log('getOperationModeValue');
    // console.log(oldValue);
    if (!list && !oldValue) return 'meshOnly';
    if (!list && oldValue) return oldValue;

    let numberOfMesh = 0;
    let numberOfStatic = 0;
    let numberOfMobile = 0;

    list.forEach(
        (item) => {
            if (item === 'mesh') numberOfMesh += 1;
            else if (item === 'static') numberOfStatic += 1;
            else if (item === 'mobile') numberOfMobile += 1;
        }
    );

    if (numberOfMobile === 0 && numberOfMesh === 0 && numberOfStatic === 0) {
        return 'disable';
    }
    if (numberOfStatic === 0 && numberOfMobile === 0) {
        return 'meshOnly';
    }
    if (numberOfMesh === 0 && numberOfMobile === 0) {
        return 'staticOnly';
    }
    if (numberOfMesh === 0 && numberOfStatic === 0) {
        return 'mobileOnly';
    }
    if (numberOfStatic === 0 && numberOfMesh > 0 && numberOfMobile > 0) {
        return 'meshMobile';
    }
    if (numberOfMobile === 0 && numberOfMesh > 0 && numberOfStatic > 0) {
        return 'meshStatic';
    }

    return 'meshOnly';
}

export function fetchConfig() {
    return async (dispatch, getState) => {
        const {
            common: {csrf, lock},
            projectManagement: {projectId},
            meshTopology: {graph},
        } = getState();
        const {nodes} = graph;
        const pollingNodeList = nodes.map(
            (node) => {
                if (node.isAuth === 'yes' && node.isReachable) {
                    return node.id;
                }
                return null;
            }
        ).filter(n => n);

        return getConfig(csrf, projectId, {nodes: pollingNodeList}).then((res) => {
            
            // const {checksums, radioSettings, ethernetSettings} = res;

            // const operationModeList = getOperationModeList(radioSettings);
            // const newGraph = {
            //     ...graph,
            //     nodes: graph.nodes.map(
            //         (node) => {
            //             return {
            //                 ...node,
            //                 operationMode: getOperationModeValue(operationModeList[node.id], node.operationMode),
            //             };
            //         }
            //     ),
            // }
            // console.log('kenny-newGraph');
            // console.log(newGraph);
            // const topologyStatus = topologyChecker(res, graph, lock, projectId);
            // const newGraph = parseTopologyToGraph(res);

            dispatch({
                type: Constants.UPDATE_OPERATION_MODE,
                config: res,
                timestamp: moment().format(),
            });
            return {
                // status: topologyStatus,
                // graph: newGraph,
                res,
            };
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    };
}

const restartCnPipeIfIsAuthUnknown = async (nodes, csrf, projectId) => {
    if (!nodes || nodes.length === 0) {
        return;
    }

    let nodeIpArr = [];
    let restartResult = null;

    for(let i=0; i<nodes.length; i++) {
        if (nodes[i].isAuth === 'unknown' && nodes[i].isReachable) {
            nodeIpArr.push(nodes[i].id);
        }
    }
    
    if (nodeIpArr.length > 0) {
        restartResult = await restartCNPipe(csrf, projectId, {nodes: nodeIpArr});
    }
    
    return restartResult;
}

export function fetchMeshTopology() {
    return async (dispatch, getState) => {
        const {
            common: {csrf, lock},
            projectManagement: {projectId},
            meshTopology: {graph},
        } = getState();
        
        return getMeshTopology(csrf, projectId).then((res) => {
            console.log(res)
            const topologyStatus = topologyChecker(res, graph, lock, projectId);
            const newGraph = parseTopologyToGraph(res, graph);
            
            restartCnPipeIfIsAuthUnknown(newGraph.nodes, csrf, projectId);
            dispatch({
                type: Constants.UPDATE_GRAPH,
                graph: newGraph,
                // seq: res.seq,
                timestamp: moment().format(),
            });
            return {
                status: topologyStatus,
                graph: newGraph,
                res,
                // seq: res.seq,
            };
        }).catch((err) => {
            console.log('Checkpoint 2', JSON.stringify(err))
            throw err;
        });
    };
}

const getNewMdopTable = function(res, mdopTable) {
    const newTable = {};
    const mdopSegments = {};
    // const ethernetDirectEnabledList = {};
    Object.keys(res).forEach(
        (nodeIp) => {
            if (res[nodeIp].mdopSegments) {
                Object.keys(res[nodeIp].mdopSegments).forEach(
                    (mdopId) => {
                        mdopSegments[mdopId] = res[nodeIp].mdopSegments[mdopId];
                    }
                );
            }
            // if (res[nodeIp].ethernetLinkSegments) {
            //     Object.keys(res[nodeIp].ethernetLinkSegments).forEach(
            //         (ethernetLinkSegment) => {
            //             res[nodeIp].ethernetLinkSegments[ethernetLinkSegment].forEach(
            //                 (node) => {
            //                     const {ethernet, nodeIp, mac} = node;
            //                     if (ethernetDirectEnabledList[nodeIp]) {
            //                         ethernetDirectEnabledList[nodeIp] = {
            //                             ...ethernetDirectEnabledList[nodeIp],
            //                             [ethernet]: true,
            //                         };
            //                     } else {
            //                         ethernetDirectEnabledList[nodeIp] = {
            //                             [ethernet]: true,
            //                         }
            //                     }
            //                 }
            //             );
            //         }
            //     );
            // }
        }
    );
    console.log('mdopSegments-kenny')
    console.log(mdopSegments)
    Object.keys(mdopTable).map(
        (mdopId) => {
            // console.log('mdopId');
            // console.log(mdopId);
            newTable[mdopId] = {
                ...mdopTable[mdopId],
                neighbors: {},
            };
            Object.keys(mdopTable[mdopId].neighbors).map(
                (mdopMember) => {
                    // console.log('mdopMember');
                    // console.log(mdopMember);
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
    return {newTable};
}

export function fetchEthLinkSegments() {
    return async (dispatch, getState) => {
        const {
            common: {csrf, lock},
            projectManagement: {projectId},
            meshTopology: {graph},
        } = getState();
        const leaderList = Object.keys(graph.mdopTable).map(
            (mdopId) => {
                return graph.mdopTable[mdopId].leader;
            }
        );
        // return getEthLinkSegments(csrf, projectId, {nodes: ['127.2.68.65', '127.2.36.2', '127.162.68.65']}).then((res) => {
        return getEthLinkSegments(csrf, projectId, {nodes: leaderList}).then((res) => {
            console.log('kenny getEthLinkSegments');


            // const newTable = {};
            // if (graph.mdopTable) {
            //     const {mdopTable} = graph;
            //     const mdopSegments = {};
            //     // const ethernetDirectEnabledList = {};
            //     Object.keys(res).forEach(
            //         (nodeIp) => {
            //             if (res[nodeIp].mdopSegments) {
            //                 Object.keys(res[nodeIp].mdopSegments).forEach(
            //                     (mdopId) => {
            //                         mdopSegments[mdopId] = res[nodeIp].mdopSegments[mdopId];
            //                     }
            //                 );
            //             }
            //             // if (res[nodeIp].ethernetLinkSegments) {
            //             //     Object.keys(res[nodeIp].ethernetLinkSegments).forEach(
            //             //         (ethernetLinkSegment) => {
            //             //             res[nodeIp].ethernetLinkSegments[ethernetLinkSegment].forEach(
            //             //                 (node) => {
            //             //                     const {ethernet, nodeIp, mac} = node;
            //             //                     if (ethernetDirectEnabledList[nodeIp]) {
            //             //                         ethernetDirectEnabledList[nodeIp] = {
            //             //                             ...ethernetDirectEnabledList[nodeIp],
            //             //                             [ethernet]: true,
            //             //                         };
            //             //                     } else {
            //             //                         ethernetDirectEnabledList[nodeIp] = {
            //             //                             [ethernet]: true,
            //             //                         }
            //             //                     }
            //             //                 }
            //             //             );
            //             //         }
            //             //     );
            //             // }
            //         }
            //     );

            //     Object.keys(mdopTable).map(
            //         (mdopId) => {
            //             // console.log('mdopId');
            //             // console.log(mdopId);
            //             newTable[mdopId] = {
            //                 ...mdopTable[mdopId],
            //                 neighbors: {},
            //             };
            //             Object.keys(mdopTable[mdopId].neighbors).map(
            //                 (mdopMember) => {
            //                     // console.log('mdopMember');
            //                     // console.log(mdopMember);
            //                     if (mdopSegments[mdopId]) {
            //                         newTable[mdopId].neighbors[mdopMember] = {
            //                             ...mdopTable[mdopId].neighbors[mdopMember],
            //                             eth: mdopSegments[mdopId][mdopMember].ethernet,
            //                         };
            //                     } else {
            //                         // whether should show previous eth
            //                         newTable[mdopId].neighbors[mdopMember] = {
            //                             ...mdopTable[mdopId].neighbors[mdopMember],
            //                             eth: undefined,
            //                         };
            //                     }
            //                 }
            //             );
            //         }
            //     );
            //     const newNodes = graph.nodes.map(
            //         (node) => {
            //             if (!node.hasMdop) return node;

            //             const {mdopIdList} = node.mdopInfo;
            //             const modeLabelList = {
            //                 eth0: '',
            //                 eth1: '',
            //             };
            //             mdopIdList.forEach(
            //                 (mdopId) => {
            //                     if (
            //                         newTable[mdopId] &&
            //                         newTable[mdopId].neighbors[node.id].eth !== undefined
            //                     ) {
            //                         if (newTable[mdopId].neighbors[node.id].eth === 0) {
            //                             modeLabelList.eth0 = mdopId;
            //                         } else {
            //                             modeLabelList.eth1 = mdopId;
            //                         }
            //                     }
            //                 }
            //             );

            //             return {
            //                 ...node,
            //                 mdopInfo: {
            //                     ...node.mdopInfo,
            //                     modeLabelList,
            //                 }
            //             };

            //         }
            //     );
            //     console.log('newNode');
            //     console.log(newNodes);
            //     dispatch({
            //         type: Constants.UPDATE_ETH_LINK_SEGMENTS,
            //         // graph: {
            //         //     ...graph,
            //         //     nodes: newNodes,
            //         //     // ethernetDirectEnabledList,
            //         //     mdopTable: newTable,
            //         // },
            //         nodes: res,
            //     });
            //     return {
            //         res,
            //     };
            // }
            dispatch({
                type: Constants.UPDATE_ETH_LINK_SEGMENTS,
                // graph: {
                //     ...graph,
                //     nodes: newNodes,
                //     // ethernetDirectEnabledList,
                //     mdopTable: newTable,
                // },
                nodes: res,
            });
        }).catch((err) => {
            if (graph.mdopTable) {
                // only update success node and keep orginal eth number for fail node
                if (err?.data?.type === 'specific') {
                    const successNode = {};
                    Object.keys(err.data.data).forEach((nodeIp) => {
                        if (err.data.data[nodeIp].success) {
                            successNode[nodeIp] = err.data.data[nodeIp].data;
                        }
                    });
                    // console.log('successNode');
                    // console.log(successNode);
                    // const {mdopTable} = graph;
                    // const {newTable} = getNewMdopTable(successNode, mdopTable);
                    dispatch({
                        type: Constants.UPDATE_ETH_LINK_SEGMENTS,
                        nodes: successNode,
                    });
                }
            }
            throw err; 
        });
    };
}

function handleNodeInfoRes(newNodeInfo, currentNodeInfo) {
    const updateInfo = JSON.parse(JSON.stringify(currentNodeInfo));
    const macToIpMap = {};
    const macToHostnameMap = {};
    const ipToMacMap = {};
    const ipToHostnameMap = {};
    Object.keys(updateInfo).forEach((nodeIp) => {
        updateInfo[nodeIp].latestUpdate = false;
    });
    Object.keys(newNodeInfo).forEach((nodeIp) => {
        updateInfo[nodeIp] = {
            ...updateInfo[nodeIp],
            ...newNodeInfo[nodeIp],
            latestUpdate: true,
        };
        ipToMacMap[nodeIp] = newNodeInfo[nodeIp].mac;
        ipToHostnameMap[nodeIp] = newNodeInfo[nodeIp].hostname;
        macToIpMap[newNodeInfo[nodeIp].mac] = nodeIp;
        macToHostnameMap[newNodeInfo[nodeIp].mac] = newNodeInfo[nodeIp].hostname;
    });

    return {
        updateInfo,
        macToIpMap,
        macToHostnameMap,
        ipToMacMap,
        ipToHostnameMap,
    };
}

export function fetchNodeInfo() {
    return async (dispatch, getState) => {
        const {
            common: {csrf},
            projectManagement: {projectId},
            meshTopology: {
                graph: {nodes},
                nodeInfo,
            },
        } = getState();
        const list = nodes.flatMap((node) => {
            if (node.isManaged) {
                return [node.id];
            }
            return [];
        });

        if (list.length === 0) {
            throw new Error('noAvailableNode');
        }

        const body = {nodes: list};
        return getNodeInfo(csrf, projectId, body).then((res) => {
            const nodeInfoObj = handleNodeInfoRes(res, nodeInfo);
            dispatch({
                type: Constants.UPDATE_NODE_INFO,
                data: nodeInfoObj,
                timestamp: moment().format(),
            });
            return res;
        }).catch((err) => {
            console.warn(err)
            if (err?.data?.type === 'specific') {
                const successNode = {};
                Object.keys(err.data.data).forEach((nodeIp) => {
                    if (err.data.data[nodeIp].success) {
                        successNode[nodeIp] = err.data.data[nodeIp].data;
                    }
                });
                const nodeInfoObj = handleNodeInfoRes(successNode, nodeInfo);
                dispatch({
                    type: Constants.UPDATE_NODE_INFO,
                    data: nodeInfoObj,
                    timestamp: moment().format(),
                });
            }
            throw err;
        });
    };
}

export function fetchNetworkStat() {
    return async (dispatch, getState) => {
        const {
            common: {csrf},
            projectManagement: {projectId},
            meshTopology: {
                graph: {nodes},
            },
        } = getState();
        const list = nodes.filter(node => node.isReachable === true).map(node => node.id);
        if (list.length === 0) {
            throw new Error('noAvailableNode');
        }

        const body = {nodes: list};
        return getNetworkDeviceStat(csrf, projectId, body).then((res) => {
            dispatch({
                type: Constants.UPDATE_NETWORK_DEVICE_STAT,
                nodeStat: res,
                timestamp: moment().format(),
            });
            return res;
        }).catch((err) => { throw err; });
    };
}

function getUnusedColor(usedColorMap) {
    let returnValue = '#00V9A5';
    let minLen = 0;
    Object.keys(usedColorMap).some(
        (cc) => {
            if (usedColorMap[cc].length < 1) {
                returnValue = cc;
                return true;
            } else if (usedColorMap[cc].length < minLen) {
                minLen = usedColorMap[cc].length;
                returnValue = cc;
            }
            return false;
        }
    );
    return returnValue;
};

function handleLinkInfoRes(newLinkInfo, currentLinkInfo, colorMap, edges) {
    // console.log('handleLinkInfoRes');
    // console.log(newLinkInfo);
    // console.log(currentLinkInfo);
    // console.log(edges);
    const updateLinkInfo = JSON.parse(JSON.stringify(currentLinkInfo));
    const updateColorMap = colorMap;
    const usedColorMap = {};
    const ethernetDirectEnabledList = {};
    linkGraphColor.forEach((color) => {
        usedColorMap[color] = [];
    });
    Object.keys(updateColorMap).forEach((linkId) => {
        const colorCode = updateColorMap[linkId];
        usedColorMap[colorCode] = [
            ...usedColorMap[colorCode],
            colorCode,
        ];
    });

    Object.keys(updateLinkInfo).forEach((id) => {
        updateLinkInfo[id].latestUpdate = false;
    });

    Object.keys(newLinkInfo).forEach((id) => {
        if (!updateColorMap[id]) {
            const cc = getUnusedColor(usedColorMap);
            updateColorMap[id] = cc;
            usedColorMap[cc] = [...usedColorMap[cc], id];
        }
        updateLinkInfo[id] = {
            ...updateLinkInfo[id],
            ...newLinkInfo[id],
            type: edges.find(e => (e.id === id)).type,
            latestUpdate: true,
        }
        if (edges.find(e => (e.id === id)).type === 'EthernetLink') {
            const ethNumberMap = {
                'eth0': 0,
                'eth1': 1,
            };
            const {nodes} = newLinkInfo[id];
            Object.keys(nodes).forEach((ip) => {
                const {eth} = nodes[ip];
                if (eth) {
                    if (ethernetDirectEnabledList[ip]) {
                        ethernetDirectEnabledList[ip] = {
                            ...ethernetDirectEnabledList[ip],
                            [ethNumberMap[eth]]: true,
                        };
                    } else {
                        ethernetDirectEnabledList[ip] = {
                            [ethNumberMap[eth]]: true,
                        }
                    }
                }
            });
        }


    });

    return {updateLinkInfo, updateColorMap, ethernetDirectEnabledList};
}

export function fetchLinkInfo() {
    return async (dispatch, getState) => {
        const {
            common: {csrf},
            projectManagement: {projectId},
            meshTopology: {
                graph: {edges},
                linkInfo,
                linkColorMap,
            },
        } = getState();
        const list = edges.map(edge => edge.id);
        if (list.length === 0) {
            throw new Error('noAvailableLink');
        }

        const body = {links: list};
        return getLinkInfo(csrf, projectId, body).then((res) => {
            const linkInfoObj = handleLinkInfoRes(res, linkInfo, linkColorMap, edges);
            dispatch({
                type: Constants.UPDATE_LINK_INFO,
                data: linkInfoObj,
                timestamp: moment().format(),
            });
            return res;
        }).catch((err) => {
            if (err?.data?.type === 'specific') {
                const successlink = {};
                Object.keys(err.data.data).forEach((linkIp) => {
                    console.log(err.data.data[linkIp]);
                    if (err.data.data[linkIp].success) {
                        successlink[linkIp] = err.data.data[linkIp].data;
                    } else if (
                        err.data.data[linkIp].data &&
                        err.data.data[linkIp].data.info &&
                        err.data.data[linkIp].data.nodes
                    ) {
                        successlink[linkIp] = err.data.data[linkIp].data;
                    }
                });
                // console.log('kenny');
                // console.log(err.data);
                // console.log(successlink);
                const linkInfoObj = handleLinkInfoRes(successlink, linkInfo, linkColorMap, edges);
                dispatch({
                    type: Constants.UPDATE_LINK_INFO,
                    data: linkInfoObj,
                    timestamp: moment().format(),
                });
            }
            throw err;
        });
    };
}

export function stopGraphUpdate() {
    return {
        type: Constants.STOP_GRAPH_UPDATE,
    };
}

export function resumeGraphUpdate() {
    return {
        type: Constants.RESUME_GRAPH_UPDATE,
    };
}

export function initBackground(image) {
    return {
        type: Constants.INIT_BACKGROUND,
        image,
    };
}

export function updateBackgroundId(imgObj) {
    return {
        type: Constants.UPDATE_BACKGROUND_ID,
        imgObj,
    };
}

export function adjustMapOnOff(open) {
    return {
        type: Constants.ADJUST_MODE_ONOFF,
        open,
    };
}
