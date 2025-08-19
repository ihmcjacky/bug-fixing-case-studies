import * as d3 from 'd3';
import Constant from '../../../../constants/common';
import {iff} from '../../../../util/commonFunc';
import {getBitRate} from '../../../../util/formatConvertor';

const {colors, rssiColor} = Constant;

export const getNodeColor = (isManaged, isReachable, isANM, hoverLeft, hoverRight, connectedToEth) => {
    if (isANM) return colors.managedIcon;
    if (!isManaged) return colors.unmanagedIcon;
    if (hoverLeft || hoverRight) {
        if (hoverLeft) return colors.activeGreen;
        return colors.hoverGreen;
    }
    if (!isReachable) return colors.inactiveRed;
    if (connectedToEth) return colors.topologyMdopRing;
    return colors.managedIcon;
};

export const getNodeIconImage = (isAuth, isReachable, isManaged, isANM, isMobile, operationMode, preloadIcon) => {
    // if (isAuth === 'unknown' && isReachable && isManaged) return preloadIcon.cloudOffline.src;
    if (isANM) return preloadIcon.anm.src;
    if (isAuth === 'no' && isReachable && isManaged) return preloadIcon.notAuthAp.src;
    if (operationMode === 'meshMobile') return preloadIcon.meshMobile.src;
    if (operationMode === 'meshOnly') return preloadIcon.meshOnly.src;
    if (operationMode === 'meshStatic') return preloadIcon.meshStatic.src;
    if (operationMode === 'mobileOnly') return preloadIcon.mobileOnly.src;
    if (operationMode === 'staticOnly') return preloadIcon.staticOnly.src;
    if (operationMode === 'disable') return preloadIcon.disable.src;
    return preloadIcon.meshOnly.src;
};

export const getIconWidth = (isAuth, isReachable, isManaged, isANM, operationMode) => {

};

export const getAnmNode = (currentPos) => {
    const pos = currentPos['127.0.0.1'];
    if (pos) {
        return {
            ...pos,
            id: 'A-NM',
        };
    }
    // eslint-disable-next-line no-param-reassign
    currentPos['127.0.0.1'] = {x: 0, y: 0};
    return {
        x: 0,
        y: 0,
        id: 'A-NM',
    };
};

export const getAnmLink = hostNode => ({
    id: 'A-NM',
    type: 'A-NM',
    source: 'A-NM',
    target: hostNode,
    linkIndex: 0,
    totalLink: 1,
});

export const margin = {
    top: 0, right: 0, bottom: 0, left: 0,
};

export const ipToIdName = ip => ip.split('.').join('-');

export const linkToId = id => id.split('.').join('-');

export const curveMap = [
    [0],
    [-3.5, 3.5],
    [-4, 0, 4],
    [-7, -2.5, 2.5, 7],
    [-6, -2.5, 0, 2.5, 6],
    [-6, -2.5, -1.5, 1.5, 2.5, 6],
    [-5, -2.5, -1.7, 0, 1.7, 2.5, 5],
];


const shortFrom = {
    radio0: 'R0',
    radio1: 'R1',
    radio2: 'R2',
    eth0: 'ETH0',
    eth1: 'ETH1',
    unmanaged: '-',
    undefined: '-',
};

export const getLinklabel = (linkInfo, leftNodeDevice, rightNodeDevice) => {
    const leftRadio = leftNodeDevice === '' ? 'undefined' : leftNodeDevice;
    const rightRadio = rightNodeDevice === '' ? 'undefined' : rightNodeDevice;
    if (linkInfo.type === 'RadioLink') {
        let displayChannel = '';
        if (linkInfo.info.band === '5') {
            displayChannel = `CH ${linkInfo.info.channel} (${linkInfo.info.frequency})`;
        } else {
            displayChannel = `(${linkInfo.info.frequency})`;
        }
        return `${shortFrom[leftRadio]} --- ${displayChannel} --- ${shortFrom[rightRadio]}`;
    }
    return `${shortFrom[leftRadio]} --- ${getBitRate(linkInfo.info.speed)} --- ${shortFrom[rightRadio]}`;
};


export function linkLabelContent(d, graphLinkInfo, nodes, showLinkLabel) {
    if (graphLinkInfo[d.id] && showLinkLabel) {
        const dx = d.source.x - d.target.x;
        const dy = d.source.y - d.target.y;
        const dr = Math.sqrt((dx * dx) + (dy * dy));
        let nodeA = null;
        let nodeB = null;
        nodes.some((node) => {
            if (node.id === d.source || node.id === d.source.id) nodeA = node;
            else if (node.id === d.target || node.id === d.target.id) nodeB = node;
            return nodeA && nodeB;
        });
        if (!nodeA || !nodeB ||
            (!nodeA.isManaged && !nodeB.isManaged)) return '';
        if (dr < 250) return '- - -';

        if (d.source.x > d.target.x) [nodeA, nodeB] = [nodeB, nodeA];
        const linkInfo = graphLinkInfo[d.id];
        const leftNodeInterface = !nodeA.isManaged ? 'unmanaged' :
            iff(linkInfo.type.includes('Eth'), linkInfo.nodes[nodeA.id].eth, linkInfo.nodes[nodeA.id].radio);
        const rightNodeInterface = !nodeB.isManaged ? 'unmanaged' :
            iff(linkInfo.type.includes('Eth'), linkInfo.nodes[nodeB.id].eth, linkInfo.nodes[nodeB.id].radio);
        return getLinklabel(linkInfo, leftNodeInterface, rightNodeInterface);
    }
    return '';
}

// export const scaleConverter = (scale) => {
//     // if (scale < 0.8) return 0.6 / scale;
//     // else if (scale < 2.5) return 1 / scale;
//     // else if (scale < 5) return 1.5 / scale;
//     console.log('scl');
//     return 1 / scale;
// };

// eslint-disable-next-line max-len
// for (let i = 0, n = Math.ceil(Math.log(graphData.simulation.alphaMin()) / Math.log(1 - graphData.simulation.alphaDecay())); i < n; i += 1) {
//     graphData.simulation.tick();
// }

// const curve = curveMap[d.totalLink - 1][d.linkIndex] * 20;

// const start = d.target;
// const end = d.source;
// const dx = end.x - start.x;
// const dy = end.y - start.y;
// const dr = Math.sqrt((dx * dx) + (dy * dy));
// // if (leftHand) curve *= -1;
// // let side = 0;
// // if (curve > 0) side = 1;
// // const dr = Math.sqrt((dx * dx) + (dy * dy)) * (curve);
// // return `M${start.x},${start.y}A${dr},${dr} 0 0,${side} ${end.x},${end.y}`;
// const center = {
//     x: (start.x + end.x) / 2,
//     y: (start.y + end.y) / 2,
// };

// const angel = Math.acos(dx / dr) * (180 / Math.PI);
// const curvePoint = {
//     x: center.x + (Math.cos(angel * (Math.PI / 180)) * curve),
//     y: center.y + (Math.sin(angel * (Math.PI / 180)) * curve),
// };
// console.log('-----------------arcPath', curve);
// console.log(center);
// console.log(curvePoint);
// console.log(start);
// console.log(end);
// console.log(angel);
// console.log((Math.sin(angel * (Math.PI / 180)) * curve));
// console.log((Math.cos(angel * (Math.PI / 180)) * curve));
// return `M${start.x},${start.y} Q${curvePoint.x},${curvePoint.y} ${end.x},${end.y}`;

function signalLevelToInt(level) {
    if (level === '') return 0;
    return parseInt(level.replace(' dBm', ''), 10);
}

export const getLinkColor = (rssiColorObj, linkData, nodeList) => {
    if (!linkData || linkData.type.includes('Eth')) return rssiColor.default;

    const {nodes} = linkData;
    const connectedNode = Object.keys(nodes);
    let nodeA = null;
    let nodeB = null;
    nodeList.some((node) => {
        if (node.id === connectedNode[0]) nodeA = node;
        else if (node.id === connectedNode[1]) nodeB = node;
        return nodeA && nodeB;
    });
    if (!nodeA.isManaged || !nodeB.isManaged) return rssiColor.unmanaged;
    if (!rssiColorObj.enable) return rssiColor.default;

    const rssiLevel = Math.min(
        signalLevelToInt(nodes[connectedNode[0]].signalLevel),
        signalLevelToInt(nodes[connectedNode[1]].signalLevel));
    if (Number.isNaN(rssiLevel)) return rssiColor.default;

    const {max, min} = rssiColorObj.color;
    let returnColor = rssiColor.default;
    if (max === min) {
        if (max === 0) {
            if (rssiLevel >= max) returnColor = rssiColor.fair;
            else returnColor = rssiColor.poor;
        } else if (max === -95) {
            if (rssiLevel >= max) returnColor = rssiColor.good;
            else returnColor = rssiColor.fair;
        }
        if (rssiLevel >= max) returnColor = rssiColor.good;
        else returnColor = rssiColor.poor;
    } else if (rssiLevel >= max) {
        returnColor = rssiColor.good;
    } else if (rssiLevel >= min) {
        returnColor = rssiColor.fair;
    } else if (typeof rssiLevel === 'number') {
        returnColor = rssiColor.poor;
    }
    return returnColor;
};

    // const leftHand = d.target.x > d.source.x;
    // const start = leftHand ? d.source : d.target;
    // const end = leftHand ? d.target : d.source;
    // const dx = end.x - start.x;
    // const dy = end.y - start.y;
    // let curve = curveMap[d.totalLink - 1][d.linkIndex];
    // if (leftHand) curve *= -1;
    // let side = 0;
    // if (curve > 0) side = 1;
    // const dr = Math.sqrt((dx * dx) + (dy * dy)) * (curve);
    // // eslint-disable-next-line no-param-reassign
    // d.start = start.id;
    // return `M${start.x} ${start.y} A${dr} ${dr} 0 0 ${side} ${end.x} ${end.y}`;

export const _getStartPosition = (currentPos, nodeIp) => {
    if (currentPos[nodeIp]) {
        return currentPos[nodeIp];
    }

    const savedNodeList = Object.keys(currentPos);
    if (savedNodeList.length === 1) { // in case the graph just has the A-NM node
        const anmPos = currentPos['127.0.0.1'];
        // eslint-disable-next-line no-param-reassign
        currentPos[nodeIp] = {x: anmPos.x + 75, y: anmPos.y};
        return currentPos[nodeIp];
    } else if (savedNodeList.length === 2) {
        const anmPos = currentPos['127.0.0.1'];
        // eslint-disable-next-line no-param-reassign
        currentPos[nodeIp] = {x: anmPos.x + 400, y: anmPos.y};
        return currentPos[nodeIp];
    }
    const centerPoint = {x: 0, y: 0, nodeCounter: 0};
    const distributed = {x: 0, y: 0};
    savedNodeList.forEach((ip) => {
        if (ip === '127.0.0.1') return;
        centerPoint.x = ((centerPoint.x * centerPoint.nodeCounter) + currentPos[ip].x) /
            (centerPoint.nodeCounter + 1);
        centerPoint.y = ((centerPoint.y * centerPoint.nodeCounter) + currentPos[ip].y) /
            (centerPoint.nodeCounter + 1);
        centerPoint.nodeCounter += 1;
        if (currentPos[ip].x < centerPoint.x) distributed.x -= 1;
        else distributed.x += 1;

        if (currentPos[ip].y < centerPoint.y) distributed.y -= 1;
        else distributed.y += 1;
    });
    // eslint-disable-next-line no-param-reassign
    currentPos[nodeIp] = {
        x: centerPoint.x + (125 * distributed.x),
        y: centerPoint.y + (125 * distributed.y),
    };
    return currentPos[nodeIp];
};

export const getStartPosition = (currentPos, nodeIp) => {
    const maxNodesInRow = 10;
    const distanceBetweenNodes = 125; 

    if (currentPos[nodeIp]) {
        return currentPos[nodeIp];
    }

    const savedNodeList = Object.keys(currentPos);
    if (savedNodeList.length === 1) { 
        const anmPos = currentPos['127.0.0.1'];
        currentPos[nodeIp] = {x: anmPos.x + 75, y: anmPos.y};
        return currentPos[nodeIp];
    } 

    // Calculate the position for the new node
    const newNodeIndex = savedNodeList.length - 1; // Subtract 1 for A-NM node
    const row = Math.floor(newNodeIndex / maxNodesInRow);
    const column = newNodeIndex % maxNodesInRow;

    // Calculate the x and y positions for the new node
    const x = column * distanceBetweenNodes;
    const y = row * distanceBetweenNodes;

    currentPos[nodeIp] = {
        x: x,
        y: y
    };
    
    return currentPos[nodeIp];
};

export const isFlip = (linkData) => {
    const startNode = linkData.start === linkData.source.id ? linkData.source : linkData.target;
    const endNode = linkData.start === linkData.source.id ? linkData.target : linkData.source;
    return startNode.x > endNode.x;
};

export const getTooltipOffset = (content, graphScale, radius, position) => {
    const returnObj = {};
    switch (position) {
        case 'top': {
            returnObj.x = -(content.width / 2) + ((2 * radius * graphScale) / 2);
            returnObj.y = (-2 * radius) - (5 * graphScale);
            break;
        }
        case 'bottom': {
            returnObj.x = -(content.width / 2) + ((2 * radius * graphScale) / 2);
            returnObj.y = (2 * radius * graphScale) + (5 * graphScale);
            break;
        }
        case 'left': {
            returnObj.x = -(radius * graphScale) +
                -content.width + (5 * graphScale);
            returnObj.y = ((-2 * radius) + (2 * radius * graphScale)) / 2;
            break;
        }
        case 'right': {
            returnObj.x = (2 * radius * graphScale) + (5 * graphScale);
            returnObj.y = ((-2 * radius) + (2 * radius * graphScale)) / 2;
            break;
        }
        default: {
            returnObj.x = 0;
            returnObj.y = 0;
        }
    }
    return returnObj;
};

// function to load the image with url and return Image object
export async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const temp = new Image();
        temp.onload = () => {
            resolve(temp);
        };
        temp.onerror = (err) => {
            console.log(err);
            reject('loadImageFail');
        };
        temp.src = url;
    });
}

export function getNodeGraphCenter(nodes) {
    let xMax;
    let xMin;
    let yMax;
    let yMin;
    Object.keys(nodes).forEach((nodeIp) => {
        const pos = nodes[nodeIp];
        if (!xMax) {
            xMax = pos.x;
            xMin = pos.x;
            yMax = pos.y;
            yMin = pos.y;
        } else {
            if (pos.x > xMax) xMax = pos.x;
            else if (pos.x < xMin) xMin = pos.x;

            if (pos.y > yMax) yMax = pos.y;
            else if (pos.y < yMin) yMin = pos.y;
        }
    });
    return {
        x: (xMax + xMin) / 2,
        y: (yMax + yMin) / 2,
    };
}

export function getNodeGraphSize(nodes) {
    let xMax;
    let xMin;
    let yMax;
    let yMin;
    Object.keys(nodes).forEach((nodeIp) => {
        const pos = nodes[nodeIp];
        if (!xMax) {
            xMax = pos.x;
            xMin = pos.x;
            yMax = pos.y;
            yMin = pos.y;
        } else {
            if (pos.x > xMax) xMax = pos.x;
            else if (pos.x < xMin) xMin = pos.x;

            if (pos.y > yMax) yMax = pos.y;
            else if (pos.y < yMin) yMin = pos.y;
        }
    });
    return {
        width: (xMax - xMin) + 80,
        height: (yMax - yMin) + 100,
    };
}

export function hasNodesOutMap(nodes, background) { // fucntion to check has nodes out of map
    let xMax;
    let xMin;
    let yMax;
    let yMin;
    console.log(nodes);
    Object.keys(nodes).forEach((nodeIndex) => {
        const ip = nodes[nodeIndex].id;
        const nodeData = d3.select(`#node-${ip.split('.').join('-')}`);
        const {width, height} = nodeData.node().getBBox();
        const pos = nodes[nodeIndex];
        // the pos is set at the center of the circle
        // use the position and node wrapper widht, height to check the node
        if (!xMax) {
            xMax = pos.x + (width / 2);
            xMin = pos.x - (width / 2);
            yMax = pos.y + (height - 20);
            yMin = pos.y - 20;
        } else {
            if (pos.x + (width / 2) > xMax) xMax = pos.x + (width / 2);
            else if (pos.x - (width / 2) < xMin) xMin = pos.x - (width / 2);

            if (pos.y + (height - 20) > yMax) yMax = pos.y + (height - 20);
            else if (pos.y - 20 < yMin) yMin = pos.y - 20;
        }
    });

    if (background.pos.x > xMin) return true;
    if (background.pos.x + background.viewSize.width < xMax) return true;
    if (background.pos.y > yMin) return true;
    if (background.pos.y + background.viewSize.height < yMax) return true;
    return false;
}
