import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Cookies from 'js-cookie';
import {
    curveMap, margin,
    getNodeColor, getNodeIconImage,
    getAnmNode, getAnmLink, getLinkColor,
    ipToIdName, linkToId, linkLabelContent,
    getStartPosition,
    isFlip, loadImage,
    getNodeGraphCenter,
    hasNodesOutMap,
    getTooltipOffset,
} from './topologyGraphHelperFunc';
import '../../../../css/topologyGraph.css';
import P2Dialog from '../../../../components/common/P2Dialog';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import {openMenu, closeMenu} from './topologyGraphContextMenu';
import {
    drawResizeNode, updateDragToResizeNotePosition,
    fixDimensionView, adjustMapOpacityPreview,
    setViewport, setBackgroundColor,
    resetMapSize, resetToDefault,
} from './topologyAdjustMode';
import Constant from '../../../../constants/common';
import store from '../../../../redux/store';
import {iff} from '../../../../util/commonFunc';
import {convertIpToMac} from '../../../../util/formatConvertor';


export const networkGraphHandler = {
    zoomToFit: () => {},
    moveNode: () => {},
    moveToCenter: () => {},
    nodesPos: {},
    background: {},
    image: {},
};
export const adjustModeHandler = {
    getImageCenterPos: () => {},
    adjustMapReset: () => {},
    backgroundTemp: {},
    adjustMapOpacity: () => {},
    fixDimensionView: () => {},
    setViewport: () => {},
    resetToDefault: () => {},
    resetMapSize: () => {},
    setBackgroundColor: () => {},
    resizeOnDrag: {
        dragged: false,
        position: '',
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        imageX: 0,
        imageY: 0,
    },
    nodesStartPos: {},
};
const {colors} = Constant;
const graphWrapper = {
    mainWrapper: null,
    backgroundWrapper: null,
    linksWrapper: null,
    linksEnter: null,
    nodesWrapper: null,
    nodesEnter: null,
    menuWrapper: null,
    mismatchToolTips: null,
    isAuthUnknownTooltips: null
};
const graphData = {
    t: () => {},
    isInit: true,
    fullGraph: {},
    nodes: [],
    links: [],
    mapContextMenu: false,
    adjustMode: false,
    simulation: null,
    rssiColor: {},
    graphLinkInfo: {},
    graphNodeInfo: {},
    rightClickMenu: false,
    rightClickMenuId: '',
    showLinkLabel: false,
    showEthLink: true,
    mdopTable: {},
    ethernetDirectEnabledList: {},
    isDragging: false,
    hoverNode: {
        id: '',
        connectedLink: [],
    },
    hoverMdopLabel: '',
    mdopCardEnabled: false,
    blinkTimer: null,
    blinkStart: false,
    hoverLink: {
        id: '',
        leftNode: '',
        rightNode: '',
    },
    hoverOnItems: false,
    hoverOnContextBtn: {
        hover: false,
        onClick: () => {},
    },
    movingNode: [],
    toolHandler: null,
    preloadIcon: {
        blocklink: null,
        info: null,
        statistic: null,
        settings: null,
        maintenance: null,
        security: null,
        linkalignment: null,
        spectrumscan: null,
        rssi: null,
        anm: null,
        notAuthAp: null,
        router: null,
        add: null,
        networkTools: null,
        back: null,
        noderecovery: null,
        meshMobile: null,
        meshOnly: null,
        meshStatic: null,
        mobileOnly: null,
        staticOnly: null,
        disable: null,
        cloudOffline: null,
        historicalData: null,
    },
    backgroundImage: null,
};
const animationDuration = 250;

export const getGraphData = () => graphData;

export const setHoverOnContextBtn = (onClick) => {
    graphData.hoverOnContextBtn = {
        hover: true,
        onClick,
    };
};
export const setHoverOutContextBtn = () => {
    graphData.hoverOnContextBtn = {
        hover: false,
        onClick: () => {},
    };
};

function updateLinkLabel(id, data) {
    if (id) {
        const {graphLinkInfo, nodes, showLinkLabel} = graphData;
        const linkText = linkLabelContent(data, graphLinkInfo, nodes, showLinkLabel);
        graphWrapper.linksEnter.select(`#link-label-${linkToId(id)}`).text(linkText);
        graphWrapper.linksEnter.select(`#link-label-shadow-${linkToId(id)}`).text(linkText);
        return;
    }
    graphWrapper.linksEnter.each((link) => {
        const {graphLinkInfo, nodes, showLinkLabel} = graphData;
        const linkText = linkLabelContent(link, graphLinkInfo, nodes, showLinkLabel);
        graphWrapper.linksEnter.select(`#link-label-${linkToId(link.id)}`).text(linkText);
        graphWrapper.linksEnter.select(`#link-label-shadow-${linkToId(link.id)}`).text(linkText);
    });
}

function updateDebugJson() {
    const debugJson = {};
    graphWrapper.nodesEnter.each((node) => {
        const circle = d3.select(`#node-${ipToIdName(node.id)}`).select('.node-circle');
        if (!circle.empty()) {
            const circleRect = circle.node().getBoundingClientRect();
            if (node.id === 'A-NM') {
                debugJson['127.0.0.1'] = {
                    nodes: {
                        x: circleRect.x + (circleRect.width / 2),
                        y: circleRect.y + (circleRect.height / 2) + -48,
                    },
                };
            } else {
                debugJson[node.id] = {
                    nodes: {
                        x: circleRect.x + (circleRect.width / 2),
                        y: circleRect.y + (circleRect.height / 2) + -48,
                    },
                    links: [],
                };
            }
        }
    });
    graphWrapper.linksEnter.each((link) => {
        if (link.id === 'A-NM') return;
        const linkSvg = graphWrapper.linksEnter.select(`#link-${linkToId(link.id)}`);
        if (linkSvg.empty()) {
            return;
        }
        const linkColor = linkSvg.style('stroke');
        if (debugJson[link.to]) {
            debugJson[link.to].links.push(linkColor);
            debugJson[link.to].links.push(link.id);
        }
        if (debugJson[link.from]) {
            debugJson[link.from].links.push(linkColor);
            debugJson[link.from].links.push(link.id);
        }
    });
    graphData.toolHandler.updateDebugJson(debugJson);
}

function updateLinkColor() { // rssi indicator color
    Object.keys(graphData.graphLinkInfo).forEach((linkId) => {
        const path = d3.select(`#link-${linkToId(linkId)}`);
        path.style('stroke',
            l => getLinkColor(graphData.rssiColor, graphData.graphLinkInfo[l.id], graphData.nodes)
        );
    });
}

function checkIfConnectedToEthLink(nodeIp) {
    // do not show stoke ring when show eth link
    if (!graphData?.fullGraph?.links) {
        return false;
    }
    if (graphData.showEthLink) {
        return false;
    }
    return graphData.fullGraph.links.some(
        (link) => {
            if (
                (link.from === nodeIp || link.to === nodeIp) && link.type === 'EthernetLink'
            ) {
                return true;
            }
            return false
        }
    );
}

function updateBackground(reset, cb) { // re-draw background reset key for adjust mode reset all
    if (graphData.adjustMode && !reset) return;
    if (reset) adjustModeHandler.backgroundTemp = JSON.parse(JSON.stringify(networkGraphHandler.background));
    const {set, id, timestamp} = networkGraphHandler.image;
    if (graphWrapper.nodesEnter) {
        const color = networkGraphHandler.background.show && set ?
            networkGraphHandler.background.color : '#e5e5e5';
        d3.select('#node-A-NM').select('.node-circle')
            .style('fill', '#e5e5e5');
        d3.select('#topology-graph').style('background', color);
    }

    graphWrapper.backgroundWrapper.style('visibility',
        networkGraphHandler.background.show || reset ? 'visible' : 'hidden');
    if (!networkGraphHandler.background.show) return;
    if (!set) {
        graphWrapper.backgroundWrapper.attr('xlink:href', '');
        return;
    }
    const projectId = Cookies.get('projectId');
    // const imgUrl = `/api/django/media/${projectId}/${id}?t=${timestamp}`;

    // const [hostname, port] = window.nw.App.argv;

    const {hostname, port} = store.getState().common.hostInfo;
    const imgUrl = `http://${hostname}:${port}/media/${projectId}/${id}?t=${timestamp}`;

    loadImage(imgUrl).then((img) => {
        const {
            pos: {x, y},
            opacity,
            imgSize, viewSize,
        } = networkGraphHandler.background;
        graphData.backgroundImage = img;
        d3.select('#background-image-wrapper').datum({x, y, opacity});
        graphWrapper.backgroundWrapper.attr('xlink:href', img.src);
        graphWrapper.backgroundWrapper.transition().duration(reset ? animationDuration : 0)
            .attr('transform', `translate(${x}, ${y})
                scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`)
            .attr('opacity', opacity);
        if (typeof cb === 'function') cb();
    }).catch((err) => {
        console.log('update image fail:', err);
        if (typeof cb === 'function') cb();
    });
}

function arcPath(d) { // calculate and return path line commands
    const start = d.start === d.source.id ? d.source : d.target;
    const end = d.start === d.source.id ? d.target : d.source;
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    const curve = curveMap[d.totalLink - 1][d.linkIndex];
    const side = curve > 0 ? 1 : 0;
    const dr = Math.sqrt((dx * dx) + (dy * dy)) * (curve);
    return `M${start.x} ${start.y} A${dr} ${dr} 0 0 ${side} ${end.x} ${end.y}`;
}
function flipArcPath(d) { // flip arc path for flipped text
    const start = d.start !== d.source.id ? d.source : d.target;
    const end = d.start !== d.source.id ? d.target : d.source;
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    const curve = curveMap[d.totalLink - 1][d.linkIndex];
    const side = curve > 0 ? 0 : 1;
    const dr = Math.sqrt((dx * dx) + (dy * dy)) * (curve);
    return `M${start.x} ${start.y} A${dr} ${dr} 0 0 ${side} ${end.x} ${end.y}`;
}
function centralizeLinkLabel(d) { // centralize the link text label
    if (d.id === 'A-NM') return '';
    const {source, target} = d;
    const dx = source.x - target.x;
    const dy = source.y - target.y;
    const dr = Math.sqrt((dx * dx) + (dy * dy));
    const cos = dx / dr;
    const sin = dy / dr;
    let translateStr = '';
    if (cos / sin > 0) { // sin and cos regent
        let xOffset = 4;
        let yOffset = 4;
        if (cos < 0) xOffset *= -1;
        if (sin > 0) yOffset *= -1;
        translateStr = `translate(${sin * yOffset}, ${cos * xOffset})`;
    } else { // all and tan regent
        let xOffset = -4;
        let yOffset = -4;
        if (cos > 0) xOffset *= -1;
        if (sin > 0) yOffset *= -1;
        translateStr = `translate(${sin * yOffset}, ${cos * xOffset})`;
    }
    return translateStr;
}

function updateLinkDirection(linkData) { // set link lebal to arc or flipped arc
    const flip = isFlip(linkData);
    d3.select(`#link-label-shadow-${linkToId(linkData.id)}`).attr('xlink:href',
        flip ? `#link-flip-path-${linkToId(linkData.id)}` : `#link-${linkToId(linkData.id)}`);
    d3.select(`#link-label-${linkToId(linkData.id)}`).attr('xlink:href',
        flip ? `#link-flip-path-${linkToId(linkData.id)}` : `#link-${linkToId(linkData.id)}`);
    d3.select(`#link-label-wrapper-${linkToId(linkData.id)}`).attr('transform', centralizeLinkLabel);
    updateLinkLabel(linkData.id, linkData);
}

function ticked() { // function for update node position and link path after new graph or drag
    graphWrapper.linksEnter.selectAll('.link-path').transition().duration(0).attr('d', arcPath)
        .on('end', updateLinkDirection);
    graphWrapper.linksEnter.selectAll('.link-flip-path').attr('d', flipArcPath);
    graphWrapper.linksEnter.selectAll('.link-event-path').attr('d', arcPath);
    graphWrapper.nodesEnter.attr('transform', d => `translate(${d.x}, ${d.y})`);
}

function nodeMoveTicked(movingNodeIp, duration = 0) { // ticked function for move node
    graphWrapper.linksEnter.selectAll('.link-path').transition()
        .duration(duration)
        .attr('d', arcPath)
        .on('end', updateLinkDirection);
    graphWrapper.linksEnter.selectAll('.link-flip-path').transition()
        .duration(duration)
        .attr('d', flipArcPath)
        .on('end', (d) => {
            d3.select(`#link-label-wrapper-${linkToId(d.id)}`).attr('transform', centralizeLinkLabel);
            updateLinkLabel(d.id, d);
        });
    graphWrapper.linksEnter.selectAll('.link-event-path').transition()
        .duration(duration)
        .attr('d', arcPath);
    graphWrapper.nodesEnter.transition()
        .duration(duration)
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .on('end', (d) => { // remove the moving node from list
            if (d.id === movingNodeIp) graphData.movingNode = graphData.movingNode.filter(node => node !== d.id);
        });
}

function moveNode(nodeIp, xDisplacement, yDisplacement, duration = 0) {
    if (!graphData.movingNode.includes(nodeIp)) graphData.movingNode.push(nodeIp);
    else return;
    const targetNode = graphWrapper.nodesEnter.data().find(d => d.id === nodeIp);
    targetNode.x += xDisplacement;
    targetNode.y += yDisplacement;
    networkGraphHandler.nodesPos[nodeIp].x = targetNode.x;
    networkGraphHandler.nodesPos[nodeIp].y = targetNode.y;
    nodeMoveTicked(nodeIp, duration);
    graphData.toolHandler.updateUiProjectSettings(networkGraphHandler.nodesPos);
}
// node drag handler
const dragHandler = d3.drag()
    .on('start', (d) => {
        console.log('drag');
        graphData.mdopCardEnabled = false;
        graphData.toolHandler.node.onMdopLeave();
        graphData.rightClickMenu = false;
        graphData.rightClickMenuId = '';
        closeMenu();
        graphData.toolHandler.map.closeContextMenu();
        if (graphData.movingNode.includes(d.id)) return;
        graphData.isDragging = true;
        if (d.id !== 'A-NM') graphData.toolHandler.node.onHoverLeave();
    })
    .on('drag', (d) => {
        if (graphData.movingNode.includes(d.id)) return;
        // eslint-disable-next-line no-param-reassign
        d.x = d3.event.x;
        // eslint-disable-next-line no-param-reassign
        d.y = d3.event.y;
        ticked();
    })
    .on('end', (d) => {
        if (graphData.movingNode.includes(d.id)) return;
        graphData.isDragging = false;
        updateDebugJson();
        if (d.id !== 'A-NM') {
            networkGraphHandler.nodesPos[d.id].x = d3.event.x;
            networkGraphHandler.nodesPos[d.id].y = d3.event.y;
            if (!graphData.adjustMode) {
                graphData.toolHandler.node
                    .onHover(d.id, {x: d3.event.sourceEvent.pageX, y: d3.event.sourceEvent.pageY});
            }
            updateLinkLabel();
        } else {
            networkGraphHandler.nodesPos['127.0.0.1'].x = d3.event.x;
            networkGraphHandler.nodesPos['127.0.0.1'].y = d3.event.y;
        }
        ticked();
        if (!graphData.adjustMode) graphData.toolHandler.updateUiProjectSettings(networkGraphHandler.nodesPos);
    });

const zoomHandler = d3.zoom().on('zoom', () => { // topology graph zoom handler
    if (graphData.hoverOnContextBtn.hover &&
        (!d3.event.sourceEvent || d3.event.sourceEvent.type !== 'wheel')) return;
    graphData.rightClickMenu = false;
    graphData.rightClickMenuId = '';
    closeMenu(); // close popup menu when zooming the graph
    graphData.toolHandler.map.closeContextMenu();
    graphWrapper.mainWrapper.attr('transform', d3.event.transform);
})
.on('end', () => {
    if (graphData.hoverOnContextBtn.hover && d3.event.sourceEvent) {
        graphData.hoverOnContextBtn.onClick();
    } else {
        updateDebugJson();
        if (!graphData.adjustMode) {
            const {k, x, y} = d3.event.transform;
            const {background, nodesPos} = networkGraphHandler;
            background.wrapperStyle = {
                scale: k,
                translate: {x, y},
            };
            graphData.toolHandler.updateUiProjectSettings(nodesPos, background);
        }
    }
});

function blinkNodes(list) {
    d3.selectAll(`.node-circle`)
    .style('animation', 'none')
    graphData.blinkEthRingTimer = setTimeout(
        () => {
            list.forEach(
            (id) => {

                d3.select(`#node-circle-${ipToIdName(id)}`)
                .style('animation', 'blink-stroke 1s 1');

            }
        )}, 1000
    )
}

function nodeOnHoverHandler(e) {
    graphData.hoverOnItems = true;
    if (graphData.movingNode.includes(e.id) || graphData.adjustMode || graphData.mapContextMenu) return;
    if (graphData.isDragging || graphData.rightClickMenu) return; // do nothing when is dragging or show popup menu
    d3.select(`#node-${ipToIdName(e.id)}`).raise();
    if (e.id === 'A-NM') return; // no action for ANM node
    const graphScale = parseFloat(
        d3.select('#all').attr('transform').split('scale(')[1].match(/[\d|.|-]+/g)[0], 10);
    const circlrPos = d3.select(`#node-${ipToIdName(e.id)}`).select('.node-circle').node().getBoundingClientRect();
    const tooltipContent = graphWrapper.mismatchToolTips.node().getBoundingClientRect();
    const tooltipOffset =
        getTooltipOffset(tooltipContent, graphScale, 20, 'top');
    if (e.isAuth === 'no') {
        graphWrapper.mismatchToolTips.style('left', `${circlrPos.left + (tooltipOffset.x)}px`)
            .style('opacity', 1)
            .style('top', `${circlrPos.top + -30 + (tooltipOffset.y)}px`);
    } else {
        if (e.isAuth === 'unknown') {
            graphWrapper.isAuthUnknownTooltips.style('left', `${circlrPos.left + (tooltipOffset.x)}px`)
            .style('opacity', 1)
            .style('top', `${circlrPos.top + -30 + (tooltipOffset.y)}px`);
        }
        graphData.toolHandler.node.onHover(e.id, {x: d3.event.pageX, y: d3.event.pageY}); // show node info card
        graphData.hoverNode.id = e.id;
        d3.select(`#node-${ipToIdName(e.id)}`).raise();
        d3.select(`#node-${ipToIdName(e.id)}`).select('.node-circle').transition() // animation for the node circle
            .duration(animationDuration)
            .style('fill', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
                graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id))
            .style('stroke-width', '7px')
            .style('stroke', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
                graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id)));
        graphWrapper.linksEnter.each(function (link) { // highlight the connected links but not A-NM link
            if (link.source.id === 'A-NM' || link.target.id === 'A-NM') return;

            if (link.source.id === e.id || link.target.id === e.id) {
                graphData.hoverNode.connectedLink.push(link.id);
                d3.select(`#node-${ipToIdName(e.id)}`).raise();
                d3.select(`#node-${ipToIdName(e.id)}`).select(`#link-${linkToId(link.id)}`).transition()
                    .duration(animationDuration)
                    .style('stroke-width', '4px');
                }
                
            });
            
        // if node is connected to eth link, blink the node ring
        const ethConnectedNodes = {};

        graphData.fullGraph.links.forEach(
            (link) => {
                if (!graphData.showEthLink && link.type === 'EthernetLink') {
                    // console.log('link');
                    // console.log(link);
                    if (link.from === e.id || link.to === e.id) {
                        if (link.from === e.id) {
                            ethConnectedNodes[link.to] = true;
                        }
                        if (link.to === e.id) {
                            ethConnectedNodes[link.from] = true;
                        }
                    }

                }
            }
        );

        if (Object.keys(ethConnectedNodes).length > 0) {
            ethConnectedNodes[e.id] = true;
            blinkNodes(Object.keys(ethConnectedNodes));
        }

    }
}

function nodeOnHoverOutHandler(e) { // node hover out handler, recovery all the node and link effect
    if (graphData.blinkEthRingTimer) {
        clearTimeout(graphData.blinkEthRingTimer);
        graphData.blinkEthRingTimer = null;
    }
    graphWrapper.mismatchToolTips.style('opacity', 0);
    graphWrapper.isAuthUnknownTooltips.style('opacity', 0);
    graphData.hoverOnItems = false;
    if (graphData.movingNode.includes(e.id) || graphData.adjustMode || graphData.isDragging || e.id === 'A-NM') return;

    graphData.hoverNode = {id: '', connectedLink: []};
    graphData.toolHandler.node.onHoverLeave();
    d3.select(`#node-${ipToIdName(e.id)}`).select('.node-circle').transition()
        .duration(animationDuration)
        .style('stroke-width', '7px');
    d3.selectAll('.link-path').transition()
        .duration(animationDuration)
        .style('stroke-width', '2px');
}

function nodeOnContextMenu(e) {
    const targetNode = graphData.graph.nodes.find((node) => node.id === e.id);
    d3.event.preventDefault();
    graphData.mdopCardEnabled = false;
    graphData.toolHandler.node.onMdopLeave();
    if (graphData.mapContextMenu) {
        graphData.mapContextMenu = false;
        graphData.toolHandler.map.closeContextMenu();
    }
    if (graphData.movingNode.includes(e.id) || graphData.adjustMode || graphData.rightClickMenuId === e.id) return;
    if (targetNode.isReachable && targetNode.isManaged && !targetNode.isAuth) return ;
    graphData.rightClickMenu = false;
    graphData.rightClickMenuId = '';
    closeMenu();
    if (e.id === 'A-NM') return;

    graphData.toolHandler.node.onHoverLeave();
    const circleCenter = d3.select(this).attr('transform').match(/[\d|.|-]+/g).map(str => parseFloat(str, 10));
    const pos = {
        x: circleCenter[0],
        y: circleCenter[1],
    };
    if (e.isManaged && graphData.graphNodeInfo[e.id] && e.isReachable) {
        graphData.rightClickMenu = true;
        graphData.rightClickMenuId = e.id;
        openMenu('node', pos, graphData.graphNodeInfo[e.id], e);
    } else if (!e.isManaged) {
        graphData.rightClickMenu = true;
        graphData.rightClickMenuId = e.id;
        openMenu('nodeUnmanaged', pos);
    }
}

function linkOnHoverHandler(e) {
    graphData.hoverOnItems = true;
    if (graphData.isDragging || graphData.adjustMode || graphData.mapContextMenu) return;
    if (e.id === 'A-NM' || graphData.rightClickMenu) return;
    let [nodeAIp, nodeBIp] = [e.source.id, e.target.id];
    if (graphData.movingNode.includes(nodeAIp) || graphData.movingNode.includes(nodeBIp)) return;
    if (e.target.x < e.source.x) [nodeAIp, nodeBIp] = [nodeBIp, nodeAIp]; // find the left node and right node
    graphData.toolHandler.link.onHover(
        {
            id: e.id,
            nodeAIp,
            nodeBIp,
            linkColor: graphWrapper.linksEnter.select(`#link-${linkToId(e.id)}`).style('stroke'),
            linkType: e.type,
        },
        {x: d3.event.pageX, y: d3.event.pageY},
        d3.select('#topology-svg-wrapper').node().getBoundingClientRect().width
    );
    d3.select(this).raise();
    graphWrapper.linksEnter.select(`#link-${linkToId(e.id)}`).transition() // highlight link
        .duration(animationDuration)
        .style('stroke-width', '4px');
    const sourceColor = e.source.isManaged ? // highlight connected nodes
        iff(e.source.x > e.target.x, colors.hoverGreen, colors.activeGreen) : colors.unmanagedIcon;
    const targetColor = e.target.isManaged ?
        iff(e.source.x > e.target.x, colors.activeGreen, colors.hoverGreen) : colors.unmanagedIcon;
    const nodeA = d3.select(`#node-${ipToIdName(e.source.id)}`);
    const nodeB = d3.select(`#node-${ipToIdName(e.target.id)}`);
    graphData.hoverLink.id = e.id;
    graphData.hoverLink.leftNode = nodeAIp;
    graphData.hoverLink.rightNode = nodeBIp;
    nodeA.raise();
    nodeB.raise();
    nodeA.select('.node-circle')
        .transition()
        .duration(animationDuration)
        .style('stroke-width', '7px')
        .style('color', getNodeColor(e.source.isManaged, e.source.isReachable, e.id === 'A-NM'))
        .style('fill', sourceColor)
        .style('stroke', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
        graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id)));
    nodeB.select('.node-circle').transition()
        .duration(animationDuration)
        .style('stroke-width', '7px')
        .style('color', getNodeColor(e.source.isManaged, e.source.isReachable, e.id === 'A-NM'))
        .style('fill', targetColor)
        .style('stroke', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
        graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id)));

    d3.selectAll(`.mdop-rect-pos-0`)
    .   style('animation', 'none')
    d3.selectAll(`.mdop-rect-pos-1`)
        .style('animation', 'none')
}

function linkOnHoverOutHandler(e) {
    graphData.hoverOnItems = false;
    if (graphData.movingNode.length &&
        (graphData.movingNode.includes(e.source.id) || graphData.movingNode.includes(e.target.id))) return;
    if (graphData.isDragging || e.id === 'A-NM' || graphData.adjustMode) return;

    graphData.toolHandler.link.onHoverLeave();
    graphData.hoverLink = {
        id: '',
        leftNode: '',
        rightNode: '',
    };
    graphWrapper.linksEnter.select(`#link-${linkToId(e.id)}`).transition() // recovery node and link effect
        .duration(animationDuration)
        .style('stroke-width', '2px');
    d3.select(`#node-${ipToIdName(e.source.id)}`).select('.node-circle').transition()
        .duration(animationDuration)
        .style('stroke-width', '7px')
        .style('color', getNodeColor(e.source.isManaged, e.source.isReachable, e.id === 'A-NM'))
        .style('fill', getNodeColor(e.source.isManaged, e.source.isReachable, e.id === 'A-NM'))
        .style('stroke', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
        graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id)));
    d3.select(`#node-${ipToIdName(e.target.id)}`).select('.node-circle').transition()
        .duration(animationDuration)
        .style('stroke-width', '7px')
        .style('color', getNodeColor(e.source.isManaged, e.source.isReachable, e.id === 'A-NM'))
        .style('fill', getNodeColor(e.target.isManaged, e.target.isReachable, e.id === 'A-NM'))
        .style('stroke', n => getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
        graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id)));
}

function linkOnContextMenu(e) {
    d3.event.preventDefault();
    graphData.mdopCardEnabled = false;
    graphData.toolHandler.node.onMdopLeave();
    if (graphData.mapContextMenu) {
        graphData.mapContextMenu = false;
        graphData.toolHandler.map.closeContextMenu();
    }
    if (graphData.movingNode.includes(e.source.id) || graphData.movingNode.includes(e.target.id) ||
        graphData.adjustMode || graphData.rightClickMenuId === e.id || e.id === 'A-NM' || e.type === 'EthernetLink') return;
    graphData.rightClickMenu = false;
    graphData.rightClickMenuId = '';
    closeMenu();
    let nodeA;
    let nodeB;
    graphData.nodes.some((node) => {
        if (node.id === e.from) nodeA = node;
        else if (node.id === e.to) nodeB = node;
        return nodeA && nodeB;
    });
    if (!nodeA.isManaged || !nodeB.isManaged || nodeA.isAuth === 'no' || nodeB.isAuth === 'no') return;

    const coords = d3.mouse(this);
    const pos = {
        x: coords[0],
        y: coords[1],
    };

    graphData.rightClickMenu = true;
    graphData.rightClickMenuId = e.id;
    openMenu('link', pos);
}

function onClickHandler(dataBoundToNode) { // topology graph on click handker
    console.log(graphData.hoverMdopLabel);
    if (graphData.hoverMdopLabel === '') {
        graphData.mdopCardEnabled = false;
        graphData.toolHandler.node.onMdopLeave();
    }

    if (graphData.hoverOnContextBtn.hover) return;
    graphData.rightClickMenu = false;
    graphData.rightClickMenuId = '';
    closeMenu();
    if (graphData.mapContextMenu) {
        graphData.mapContextMenu = false;
        graphData.toolHandler.map.closeContextMenu();
    }

    // check current node icon status, only serve when data exists
    if (dataBoundToNode) {
        // only run when isAuth is unknown
        if (dataBoundToNode.isAuth === "unknown") {
            const restartIpArr = [dataBoundToNode.id];
            graphData.toolHandler.node.onLeftClickNode(restartIpArr);
        }
    }
}

function updateNodeLabel() {
    Object.keys(graphData.graphNodeInfo).forEach((nodeIp) => {
        const nodeLabel = graphWrapper.nodesEnter.select(`#node-label-${ipToIdName(nodeIp)}`);
        nodeLabel.text(graphData.graphNodeInfo[nodeIp].hostname);
        const nodeLabelShadow = graphWrapper.nodesEnter.select(`#node-label-shadow-${ipToIdName(nodeIp)}`);
        nodeLabelShadow.text(graphData.graphNodeInfo[nodeIp].hostname);
    });
}

function mdopPos0LabelHover(e) {
    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        if (modeLabelList.eth0 === '') mdopId = modeLabelList.eth1;
        else mdopId = modeLabelList.eth0;
    }
    clearTimeout(graphData.blinkTimer);
    d3.selectAll(`.mdop-rect-pos-0`)
    .style('animation', 'none')
    graphData.blinkTimer = setTimeout(
        () => {
            d3.selectAll(`.mdop-rect-pos-${ipToIdName(mdopId)}`)
            .style('animation', 'blink 1s 1')

            
        }, 1000
    );
    graphData.hoverNode.id = e.id;
    graphData.hoverMdopLabel = 0;
    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-pos-0').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1)  translate(4 -4)')
    .attr("width", 70)
    .attr("height", 15);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-hover-area-pos-0')
    // .transition()
    // .duration(animationDuration)
    .attr("width", 60)
    .attr("height", 30);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-0').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1.5) translate(-2 6)');

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-0').transition()
    .duration(animationDuration)
    .delay(200)
    .text((node) => {
        const {modeLabelList} = node.mdopInfo;
        if (modeLabelList.eth0 !== '') {
            return graphData.t('mdopEth0Label');
        } else {
            return graphData.t('mdopEth1Label');
        }
    });
}

function mdopPos0LabelHoverOut(e) {
    clearTimeout(graphData.blinkTimer);
    // graphData.toolHandler.node.onMdopLeave();
    graphData.hoverNode.id = '';
    graphData.hoverMdopLabel = '';
    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-pos-0').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1)  translate(0, 0)')
    .attr("width", 12)
    .attr("height", 12);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-hover-area-pos-0')
    // .transition()
    // .duration(animationDuration)
    .attr("width", 30)
    .attr("height", 30);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-0').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1) translate(0 0)')
    // .style('font-size', '7px')
    .text('M');

    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        if (modeLabelList.eth0 === '') mdopId = modeLabelList.eth1;
        else mdopId = modeLabelList.eth0;
    }

    d3.selectAll(`.mdop-${ipToIdName(mdopId)}`)
    .style('stroke', (n) => {
        return getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM', graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id));
    })

}


function mdopPos1LabelHover(e) {
    clearTimeout(graphData.blinkTimer);
    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        mdopId = modeLabelList.eth1;
    }
    d3.selectAll(`.mdop-rect-pos-1`)
    .style('animation', 'none')
    graphData.blinkTimer = setTimeout(
        () => {
            d3.selectAll(`.mdop-rect-pos-${ipToIdName(mdopId)}`)
            .style('animation', 'blink 1s 1')

            
        }, 1000
    );
    graphData.hoverNode.id = e.id;
    graphData.hoverMdopLabel = 1;
    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-pos-1').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1)  translate(4 -4)')
    .attr("width", 70)
    .attr("height", 15);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-hover-area-pos-1')
    // .transition()
    // .duration(animationDuration)
    .attr('transform', 'translate(0, -4)')
    .attr("width", 60)
    .attr("height", 30);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-1').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1.5) translate(-2 -9)');

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-1').transition()
    .duration(animationDuration)
    .delay(200)
    .text(graphData.t('mdopEth1Label'));
}

function mdopPos1LabelHoverOut(e) {
    clearTimeout(graphData.blinkTimer);
    // graphData.toolHandler.node.onMdopLeave();
    graphData.hoverNode.id = '';
    graphData.hoverMdopLabel = '';
    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-pos-1').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1)  translate(0, 0)')
    .attr("width", 12)
    .attr("height", 12);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-hover-area-pos-1')
    // .transition()
    // .duration(animationDuration)
    .attr('transform', 'translate(0, 0)')
    .attr("width", 30)
    .attr("height", 30);

    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-label-text-1').transition()
    .duration(animationDuration)
    .attr('transform', 'scale(1) translate(0 0)')
    // .style('font-size', '7px')
    .text('M');

    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        if (modeLabelList.eth0 === '') mdopId = modeLabelList.eth1;
        else mdopId = modeLabelList.eth0;
    }

    d3.selectAll(`.mdop-${ipToIdName(mdopId)}`)
    .style('stroke', (n) => {
        return getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM', graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id));
    })
}

function mdopLabel0Click(e) {
    graphData.mdopCardEnabled = true;
    d3.select(`#node-${ipToIdName(e.id)}`).select('.mdop-rect-hover-area-pos-0')
    .attr('transform', 'translate(0, -4)')
    .attr("width", 100)
    .attr("height", 100);
    
    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        if (modeLabelList.eth0 === '') mdopId = modeLabelList.eth1;
        else mdopId = modeLabelList.eth0;
    }
    // graphData.toolHandler.node.onMdopClick(e.id, {x: coords.x, y: coords.y}, mdopId);
    graphData.toolHandler.node.onMdopClick(e.id, {x: d3.event.pageX, y: d3.event.pageY}, mdopId);

}
function mdopLabel1Click(e) {
    graphData.mdopCardEnabled = true;
    let mdopId = '';
    if (e.mdopInfo && e.mdopInfo.modeLabelList) {
        const modeLabelList = e.mdopInfo.modeLabelList;
        mdopId = modeLabelList.eth1;
    }
    graphData.toolHandler.node.onMdopClick(e.id, {x: d3.event.pageX, y: d3.event.pageY}, mdopId);
}

function drawMdopLabel() {

    // Hover Area
    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            // console.log('node-kenny')
            // console.log(node)
            const {modeLabelList} = node.mdopInfo;
            // console.log('modeLabelList');
            // console.log(node);
            // console.log(modeLabelList);
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' && modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('svg:rect').attr('class', 'mdop-rect-hover-area-pos-0')
    .attr('x', 12)
    .attr('y', -40)
    .attr('rx', 15)
    .attr('ry', 15)
    .attr('width',
        n => {
            return (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 60 : 30)
        }
    )
    .attr('height', 30)
    .style('opacity', '0')
    // .attr('transform', n => (n.id === graphData.hoverNode.id ? '2px' : '0px'))
    .on('mouseenter', mdopPos0LabelHover)
    .on('mouseleave', mdopPos0LabelHoverOut)
    .on('click', mdopLabel0Click);

    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' || modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('svg:rect').attr('class', 'mdop-rect-hover-area-pos-1')
    .attr("x", 8)
    .attr("y", 15)
    .attr("rx", 15)
    .attr("ry", 15)
    .attr('width', n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? 60 : 30))
    .attr("height", 30)
    .style('opacity', '0')
    .on('mouseenter', mdopPos1LabelHover)
    .on('mouseleave', mdopPos1LabelHoverOut)
    .on('click', mdopLabel1Click);

    // display label
    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' && modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('svg:rect').attr('class',
        (node) => {
            const {modeLabelList} = node.mdopInfo;
            if (modeLabelList.eth0 !== '') {
                return `mdop-rect-pos-0 mdop-rect-pos-${ipToIdName(modeLabelList.eth0)}`;
            } else if (modeLabelList.eth1 !== '') {
                return `mdop-rect-pos-0 mdop-rect-pos-${ipToIdName(modeLabelList.eth1)}`;
            }
            return 'mdop-rect-pos-0';
        }
    )
    // .attr('id', d => `mdop-label-pos0-${ipToIdName(d.id)}`)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("x", 16)
    .attr("y", -28)
    .attr("width", n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 70 : 12))
    .attr("height", n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 15 : 12))
    .attr('transform',
        n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 'scale(1)  translate(4 -4)' : 'scale(1)  translate(0, 0)')
    )
    .style('pointer-events', 'none')
    .style('fill', '#8994a9');

    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' || modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('svg:rect')
    // .attr('class', 'mdop-rect-pos-1')
    .attr('class',
        (node) => {
            const {modeLabelList} = node.mdopInfo;
            if (modeLabelList.eth1 !== '' && modeLabelList.eth0 !== '' ) {
                return `mdop-rect-pos-1 mdop-rect-pos-${ipToIdName(modeLabelList.eth1)}`;
            }
            return 'mdop-rect-pos-1';
        }
    )
    // .attr('id', d => `mdop-label-pos0-${ipToIdName(d.id)}`)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("x", 16)
    .attr("y", 18)
    .attr("width", n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? 70 : 12))
    .attr("height", n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? 15 : 12))
    .attr('transform',
        n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? 'scale(1)  translate(4 -4)' : 'scale(1)  translate(0, 0)')
    )
    .style('fill', '#8994a9')
    .style('pointer-events', 'none');

    // text on label
    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' && modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('text').attr('class', 'mdop-label-text-0')
    .attr('text-anchor', 'start')
    .attr('y', -20)
    .attr('x', 19)
    .attr('fill', '#FFFFFF')
    .style('font-size', '7px')
    .style('pointer-events', 'none')
    .attr('transform',
        n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 'scale(1.5) translate(-2 6)' : 'scale(1)  translate(0, 0)')
    )
    .text(
        n => {
            if (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0) {
                const {modeLabelList} = n.mdopInfo;
                if (modeLabelList.eth0 !== '') {
                    return graphData.t('mdopEth0Label');
                } else {
                    return graphData.t('mdopEth1Label');
                }
            } else {
                return 'M';
            }
            // return (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 0 ? 'MDOP' : 'M')
        }
    );

    graphWrapper.nodesEnter.filter(
        (node) => {
            if (node.id === 'A-NM' || !node.hasMdop) {
                return false;
            }
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' || modeLabelList.eth1 === '') {
                return false;
            }
            return true;
        }
    )
    .append('text').attr('class', 'mdop-label-text-1')
    .attr('text-anchor', 'start')
    .attr('y', 26)
    .attr('x', 19)
    .attr('fill', '#FFFFFF')
    .style('font-size', '7px')
    .style('pointer-events', 'none')
    .attr('transform',
        n => (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? 'scale(1.5) translate(-2 -9)' : 'scale(1)  translate(0, 0)')
    )
    .text(
        n => {
            return (n.id === graphData.hoverNode.id && graphData.hoverMdopLabel === 1 ? graphData.t('mdopEth1Label') : 'M')
        }
    );

}

function drawNode() {
    graphWrapper.nodesEnter.append('text').attr('class', 'node-label-shadow') // node label
        .attr('id', d => `node-label-shadow-${ipToIdName(d.id)}`)
        .attr('text-anchor', 'middle')
        .attr('y', 40)
        .style('opacity', d => (d.newNode ? 0 : 1))
        .text((d) => {
            if (d.id === 'A-NM') return graphData.t('anmLabel');
            else if (graphData.graphNodeInfo[d.id]) return graphData.graphNodeInfo[d.id].hostname;
            return convertIpToMac(d.id);
        })
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 1000 : 0))
        .style('opacity', 1);
    graphWrapper.nodesEnter.append('text').attr('class', 'node-label')
        .attr('id', d => `node-label-${ipToIdName(d.id)}`)
        .attr('text-anchor', 'middle')
        .attr('y', 40)
        .style('opacity', d => (d.newNode ? 0 : 1))
        .text((d) => {
            if (d.id === 'A-NM') return graphData.t('anmLabel');
            else if (graphData.graphNodeInfo[d.id]) return graphData.graphNodeInfo[d.id].hostname;
            return convertIpToMac(d.id);
        })
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 1000 : 0))
        .style('opacity', 1);
    graphWrapper.nodesEnter.append('text').attr('class', 'node-label-shadow') // host node label
        .attr('id', 'host-node-shadow-label')
        .attr('text-anchor', 'middle')
        .attr('y', 55)
        .style('opacity', d => (d.newNode ? 0 : 1))
        .text(d => (d.isHostNode ? `(${graphData.t('hnLbl')})` : ''))
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 1000 : 0))
        .style('opacity', 1);
    graphWrapper.nodesEnter.append('text').attr('class', 'node-label')
        .attr('id', 'host-node-label')
        .attr('text-anchor', 'middle')
        .attr('y', 55)
        .style('opacity', d => (d.newNode ? 0 : 1))
        .text(d => (d.isHostNode ? `(${graphData.t('hnLbl')})` : ''))
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 1000 : 0))
        .style('opacity', 1);
        // if (isAuth === 'unknown' && isReachable && isManaged)
    graphWrapper.nodesEnter.filter(
            (n) => n.isAuth === 'unknown' && n.isReachable && n.isManaged
        )
        .append('svg:circle')
        .attr('id', n => `node-circle-outer-${ipToIdName(n.id)}`) // node circle
        .attr('r', d => (d.newNode ? 1 : 22))
        .attr('class', (n) => {
            return 'progress__value loading-spinner';
        })
        .style('fill', n => (n.id === 'A-NM' ?
            '#e5e5e5' : getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
                graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id)))
        .style('stroke-dasharray', '100')
        .style('stroke-dashoffset', '200')
        .style('stroke-width', '11px')
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 800 : 0))
        .attr('r', 24)
        .transition()
        .duration(d => (d.newNode ? 200 : 0))
        .attr('r', 20);

    graphWrapper.nodesEnter.append('svg:circle')
        .attr('id', n => `node-circle-${ipToIdName(n.id)}`) // node circle
        .attr('r', d => (d.newNode ? 1 : 20))
        .attr('class', (n) => {
            if (n.hasMdop && n.mdopInfo && n.mdopInfo.modeLabelList) {
                // console.log('kenny-blink');
                // console.log(n);
                const modeLabelList = n.mdopInfo.modeLabelList;
                const list = Object.keys(modeLabelList).map(eth => modeLabelList[eth]);
                return `node-circle ${list.map(m => `mdop-${ipToIdName(m)}`).join(' ')}`;
            }
            return 'node-circle';
        })
        .style('fill', n => (n.id === 'A-NM' ?
            '#e5e5e5' : getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM',
                graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id)))
        .style('stroke', 
            n => {
                if (n.id === 'A-NM') {
                    // return 'url(#gradient)';
                    return colors.managedIcon;
                }
                // if (checkIfConnectedToEthLink(n.id)) {
                //     return '#8994a9';
                // } 
                return getNodeColor(n.isManaged, n.isReachable, n.id === 'A-NM', graphData.hoverLink.leftNode === n.id, graphData.hoverLink.rightNode === n.id, checkIfConnectedToEthLink(n.id));
            }
        )
        // .style('stroke-width', n => (n.id === graphData.hoverNode.id || n.id === 'A-NM' ? '2px' : '7px'))
        .style('stroke-width', n => (n.id === 'A-NM' ? '2px' : '7px'))
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 800 : 0))
        .attr('r', 24)
        .transition()
        .duration(d => (d.newNode ? 200 : 0))
        .attr('r', 20);
    graphWrapper.nodesEnter.append('image').attr('class', 'node-image') // router icon
        .attr('id', n => `node-image-${ipToIdName(n.id)}`) // node circle
        // .attr('x', '-12')
        // .attr('y', '-12')
        .attr('x', (n) => {
            if (n.id === 'A-NM')  return '-18';
            return '-12';
        })
        .attr('y', (n) => {
            if (n.id === 'A-NM')  return '-18';
            return '-12';
        })
        .attr('height', (n) => {
            if (n.id === 'A-NM')  return 36;
            return 24;
        })
        .attr('width', (n) => {
            if (n.id === 'A-NM')  return 36;
            return 24;
        })
        // .attr('height', 24)
        // .attr('width', 24)
        .style('opacity', d => (d.newNode ? 0 : 1))
        .attr('xlink:href',
            n => getNodeIconImage(n.isAuth, n.isReachable, n.isManaged, n.id === 'A-NM', n.isMobile, n.operationMode, graphData.preloadIcon))
        .transition() // animation for new node appear
        .duration(d => (d.newNode ? 1000 : 0))
        .style('opacity', 1)
        .on('end', (d) => {
            d3.select(`#node-${ipToIdName(d.id)}`).on('click', onClickHandler)
                // .on('mouseenter', nodeOnHoverHandler)
                // .on('mouseleave', nodeOnHoverOutHandler)
                .on('contextmenu', nodeOnContextMenu);
            
            d3.select(`#node-image-${ipToIdName(d.id)}`)
                .on('mouseenter', nodeOnHoverHandler)
                .on('mouseleave', nodeOnHoverOutHandler);
            d3.select(`#node-circle-${ipToIdName(d.id)}`)
                .on('mouseenter', nodeOnHoverHandler)
                .on('mouseleave', nodeOnHoverOutHandler);
        });

        drawMdopLabel();
}

function initNodes(nodes) { //  pass data to nodes Wrapper
    graphWrapper.nodesWrapper = graphWrapper.mainWrapper.append('g').attr('id', 'nodes-wrapper')
        .attr('opacity', 1)
        .selectAll('g.node')
        .data(nodes);
    graphWrapper.nodesWrapper.exit().remove();
    graphWrapper.nodesEnter = graphWrapper.nodesWrapper.enter().append('g')
        .attr('id', d => `node-${ipToIdName(d.id)}`)
        .attr('class', 'node-wrapper');
}

function linkTransitionInterrupt(path) {
    if (!path.newLink) return;
    d3.select(this).transition()
        .duration(1000)
        .style('stroke-dasharray', (path.type === 'RadioLink' ? '0.5, 5' : 'none'))
        .on('interrupt', linkTransitionInterrupt);
}

function drawLink() {
    const {graphLinkInfo, nodes, showLinkLabel} = graphData;
    graphWrapper.linksEnter.append('path').attr('class', 'link-path') // draw link path
        .attr('id', d => `link-${linkToId(d.id)}`)
        .style('stroke',
            l => getLinkColor(graphData.rssiColor, graphData.graphLinkInfo[l.id], graphData.nodes))
        .style('fill', 'none')
        .style('stroke-linecap', 'round')
        .style('stroke-width', l => (l.id === graphData.hoverLink.id ||
            graphData.hoverNode.connectedLink.indexOf(l.id) !== -1 ? '4px' : '2px'))
        .style('stroke-dasharray', d => (d.newLink ? '1, 1000' : iff(d.type === 'RadioLink', '0.5, 5', 'none')))
        .transition()
        .duration(d => (d.newLink ? 1000 : 0))
        .style('stroke-dasharray', d => (d.type === 'RadioLink' ? '0.5, 5' : 'none'))
        .on('interrupt', linkTransitionInterrupt);
    graphWrapper.linksEnter.append('path').attr('class', 'link-flip-path')
        .attr('id', d => `link-flip-path-${linkToId(d.id)}`)
        .style('stroke', 'rgb(0, 0, 0, 0)')
        .style('fill', 'none');
    const label = graphWrapper.linksEnter.append('text').attr('class', 'link-label-wrapper') // link label
        .attr('id', d => `link-label-wrapper-${linkToId(d.id)}`);
    label.append('textPath').attr('class', 'link-label-shadow')
        .attr('id', d => `link-label-shadow-${linkToId(d.id)}`)
        .attr('xlink:href',
            d => (isFlip(d) ? `#link-flip-path-${linkToId(d.id)}` : `#link-${linkToId(d.id)}`))
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .style('opacity', d => (d.newLink ? 0 : 1))
        .text(link => linkLabelContent(link, graphLinkInfo, nodes, showLinkLabel))
        .transition()
        .duration(d => (d.newLink ? 1000 : 0))
        .style('opacity', 1);
    label.append('textPath').attr('class', 'link-label')
        .attr('id', d => `link-label-${linkToId(d.id)}`)
        .attr('xlink:href',
            d => (isFlip(d) ? `#link-flip-path-${linkToId(d.id)}` : `#link-${linkToId(d.id)}`))
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .style('opacity', d => (d.newLink ? 0 : 1))
        .text(link => linkLabelContent(link, graphLinkInfo, nodes, showLinkLabel))
        .transition()
        .duration(d => (d.newLink ? 1000 : 0))
        .style('opacity', 1);
    graphWrapper.linksEnter.append('path').attr('class', 'link-event-path') // overlay link for event listener
        .attr('id', d => `link-event-${linkToId(d.id)}`)
        .style('stroke', 'rgb(0, 0, 0, 0)')
        .style('fill', 'none')
        .style('stroke-width', d => (d.newLink ? '0px' : '12px'))
        .transition()
        .duration(d => (d.newLink ? 1000 : 0))
        .style('stroke-width', '12px')
        .on('end', (d) => {
            d3.select(`#link-wrapper-${linkToId(d.id)}`)
                .on('click', onClickHandler)
                .on('mouseenter', linkOnHoverHandler)
                .on('mouseleave', linkOnHoverOutHandler)
                .on('contextmenu', linkOnContextMenu);
        });
}

function initLinks(links) { // pass link data to linksWrapper
    graphWrapper.linksWrapper = graphWrapper.mainWrapper.append('g').attr('id', 'links-wrapper')
        .attr('opacity', 1)
        .selectAll('link-event-path')
        .data(links);
    graphWrapper.linksWrapper.exit().remove();
    graphWrapper.linksEnter = graphWrapper.mainWrapper.enter().append('g').attr('class', 'link-wrapper')
        .attr('id', d => `link-wrapper-${linkToId(d.id)}`);
}

function updateGraph(graph) {
    let hostnodeId = '';
    graphWrapper.nodesEnter.each((node) => { // remove not existing nodes / links
        if (node.id === 'A-NM') return;
        if (!graph.nodes.find(d => node.id === d.id)) {
            if (node.id === graphData.hoverNode.id) { // close node info card if is opened
                graphData.hoverNode = {id: '', connectedLink: []};
                graphData.toolHandler.node.onHoverLeave();
            }
            graphData.nodes = graphData.nodes.filter(d => d.id !== node.id);
        }
    });
    const currentNodeArr = graphData.nodes.map(d => d.id);
    graph.nodes.forEach((node) => {
        const currentIndex = currentNodeArr.indexOf(node.id);
        if (node.isHostNode) hostnodeId = node.id;
        if (currentIndex === -1) {
            const nodeStartPos = getStartPosition(networkGraphHandler.nodesPos, node.id);
            networkGraphHandler.nodesPos[node.id] = {x: nodeStartPos.x, y: nodeStartPos.y};
            graphData.nodes.push({
                ...JSON.parse(JSON.stringify(node)),
                x: nodeStartPos.x,
                y: nodeStartPos.y,
                newNode: true,
            });
        } else {
            graphData.nodes[currentIndex].isAuth = node.isAuth;
            graphData.nodes[currentIndex].isManaged = node.isManaged;
            graphData.nodes[currentIndex].isReachable = node.isReachable;
            graphData.nodes[currentIndex].isHostNode = node.isHostNode;
            graphData.nodes[currentIndex].operationMode = node.operationMode;
            graphData.nodes[currentIndex].hasMdop = node.hasMdop;
            graphData.nodes[currentIndex].mdopInfo = node.mdopInfo;
            graphData.nodes[currentIndex].newNode = false;
        }
    });
    graphWrapper.linksEnter.each((link) => {
        if (link.id === 'A-NM') {
            // eslint-disable-next-line no-param-reassign
            link.target = hostnodeId;
        } else if (!graph.links.find(d => link.id === d.id)) {
            if (link.id === graphData.hoverLink.id) { // close link info card if is opened
                graphData.toolHandler.link.onHoverLeave();
                graphData.hoverLink = {
                    id: '',
                    leftNode: '',
                    rightNode: '',
                };
            }
            graphData.links = graphData.links.filter(d => d.id !== link.id);
        }
    });
    const currentLinkArr = graphData.links.map(d => d.id);
    graph.links.forEach((link) => {
        const currentIndex = currentLinkArr.indexOf(link.id);
        if (currentIndex === -1) {
            graphData.links.push({
                ...JSON.parse(JSON.stringify(link)),
                source: link.from,
                target: link.to,
                newLink: true,
                start: link.from,
            });
        } else {
            graphData.links[currentIndex].status = link.status;
            graphData.links[currentIndex].type = link.type;
            graphData.links[currentIndex].linkIndex = link.linkIndex;
            graphData.links[currentIndex].totalLink = link.totalLink;
            graphData.links[currentIndex].newLink = false;
        }
    });

    graphData.links = [...graphData.links].map(
        (link, idx) => {
            if (link.id === "A-NM") return link;

            const fromToTmpList = [];

            const totalLink = graphData.links.reduce(
                (count, currentValue) => {
                    if (currentValue.id === link.id) return count;
                    if (
                        (
                            currentValue.from === link.from &&
                            currentValue.to === link.to
                        ) || (
                            currentValue.from === link.to &&
                            currentValue.to === link.from
                        )
                    ) {
                        return count + 1;
                    }
                    return count;
                }, 1
            );

            let linkIndex = 0;

            graphData.links.some(
                (l, lIdx) => {
                    if (lIdx === idx) return true;

                    if (
                        (
                            l.from === link.from &&
                            l.to === link.to
                        ) || (
                            l.from === link.to &&
                            l.to === link.from
                        )
                    ) {
                        linkIndex += 1;
                    }

                    return false;
                }
            );
            // console.log(link.id);
            // console.log('linkIndex');
            // console.log(linkIndex);
            return {
                ...link,
                totalLink,
                linkIndex,
            };
        }
    );

    d3.selectAll('.node-wrapper').remove(); // remove old node
    // update nodes wrapper data
    graphWrapper.nodesWrapper = graphWrapper.nodesWrapper.data(graphData.nodes);
    graphWrapper.nodesEnter = graphWrapper.nodesWrapper.enter().append('g').attr('class', 'node-wrapper')
        .attr('id', d => `node-${ipToIdName(d.id)}`)
        .attr('opacity', 1);
    graphWrapper.nodesWrapper.merge(graphWrapper.nodesEnter);
    drawNode();

    d3.selectAll('.link-wrapper').remove(); // remove old link
    // update links wrapper data
    graphWrapper.linksWrapper = graphWrapper.linksWrapper.data(graphData.links);
    graphWrapper.linksEnter = graphWrapper.linksWrapper.enter().append('g')
        .attr('class', 'link-wrapper')
        .attr('id', d => `link-wrapper-${linkToId(d.id)}`);
    graphWrapper.linksWrapper.merge(graphWrapper.linksEnter);
    drawLink();

    graphData.simulation.nodes(graphData.nodes).on('tick', ticked);
    graphData.simulation.force('link').links(graphData.links);
    graphData.simulation.restart();
    dragHandler(graphWrapper.nodesEnter);
    ticked();
    updateDebugJson();
}

const initGraph = (props) => {
    const {
        graph: {nodes, links},
        rssiColor,
        showLinkLabel,
        showEthLink,
        background: {wrapperStyle: {translate, scale}},
    } = props;
    graphData.rssiColor = rssiColor;
    const isNewProject = typeof networkGraphHandler.nodesPos['127.0.0.1'] === 'undefined' || scale === null;
    const anmNode = getAnmNode(networkGraphHandler.nodesPos); // init anm pos default is (0, 0)
    networkGraphHandler.nodesPos['127.0.0.1'] = {x: anmNode.x, y: anmNode.y};
    graphData.nodes.push(anmNode);
    // sort the hostNoe at first position of the array
    graphData.nodes.push(...nodes.sort((a, b) => (a.isHostNode === b.isHostNode ? 1 : iff(a.isHostNode, -1, 1)))
        .map((node) => { // get init position
            const nodeStartPos = getStartPosition(networkGraphHandler.nodesPos, node.id);
            networkGraphHandler.nodesPos[node.id] = {x: nodeStartPos.x, y: nodeStartPos.y};
            return {
                ...JSON.parse(JSON.stringify(node)),
                x: nodeStartPos.x,
                y: nodeStartPos.y,
                newNode: false,
            };
        }));
    graphData.links.push(getAnmLink(nodes.find(node => node.isHostNode).id));
    graphData.links.push(...links.map((link, idx) => {
        // filter eth link by settings
        if (!showEthLink && link.type === 'EthernetLink') {
            return false;
        }
        const totalLink = graphData.links.reduce(
            (count, currentValue) => {
                if (currentValue.id === link.id) return count;
                if (
                    (
                        currentValue.from === link.from &&
                        currentValue.to === link.to
                    ) || (
                        currentValue.from === link.to &&
                        currentValue.to === link.from
                    )
                ) {
                    return count + 1;
                }
                return count;
            }, 1
        );

        let linkIndex = 0;

        graphData.links.some(
            (l, lIdx) => {
                if (lIdx === idx) return true;

                if (
                    (
                        l.from === link.from &&
                        l.to === link.to
                    ) || (
                        l.from === link.to &&
                        l.to === link.from
                    )
                ) {
                    linkIndex += 1;
                }

                return false;
            }
        );

        const linkData = JSON.parse(JSON.stringify(link));
        linkData.totalLink = totalLink;
        linkData.linkIndex = linkIndex;
        linkData.source = linkData.from;
        linkData.target = linkData.to;
        linkData.newLink = false;
        linkData.start = linkData.from;
        return linkData;
    }).filter(l => l));
    graphData.showLinkLabel = showLinkLabel;
    graphData.showEthLink = showEthLink;
    // all svg element wrapper
    const svg = d3.select('#topology-graph').append('svg')
        .attr('id', 'topology-svg-wrapper')
        .attr('width', `calc(100% - ${margin.left}px - ${margin.right}px)`)
        .attr('height', `calc(100% - ${margin.top}px - ${margin.bottom}px)`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .on('click', onClickHandler)
        .on('contextmenu', () => {
            d3.event.preventDefault();
            graphData.mdopCardEnabled = false;
            graphData.toolHandler.node.onMdopLeave();
            if (!graphData.hoverOnItems) {
                graphData.rightClickMenu = false;
                graphData.rightClickMenuId = '';
                closeMenu();
                graphData.mapContextMenu = true;
                graphData.toolHandler.map.openContextMenu({x: d3.event.pageX, y: d3.event.pageY});
            }
        });
    graphWrapper.mainWrapper = svg.append('g').attr('id', 'all');
    // function to move whole graph to window center and scale it
    function fitCanvas(paddingPercent = 0.6, transitionDiration = 300) {
        let displayPrecent = paddingPercent;
        let displayWrapper = graphWrapper.mainWrapper.node().getBBox();
        const bounds = {
            width: displayWrapper.width,
            height: displayWrapper.height,
            x: displayWrapper.x,
            y: displayWrapper.y,
        };
        const {background, image} = networkGraphHandler;
        if (!graphData.isInit && background) {
            if (background.show && image.set) { // change the percent to 1 when show and set image
                if (!hasNodesOutMap(graphData.nodes, background)) {
                    displayPrecent = 1;
                    bounds.width = background.viewSize.width;
                    bounds.height = background.viewSize.height;
                    bounds.x = background.pos.x;
                    bounds.y = background.pos.y;
                }
            } else if (!background.show) { // just fit all the node when the map not show
                displayWrapper = d3.select('#nodes-wrapper').node().getBBox();
                bounds.width = displayWrapper.width;
                bounds.height = displayWrapper.height;
                bounds.x = displayWrapper.x;
                bounds.y = displayWrapper.y;
            }
        }
        // const bounds = displayWrapper.node().getBBox();
        const parent = d3.select('#topology-svg-wrapper').node();
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const _width = bounds.width;
        const _height = bounds.height;
        const midX = bounds.x + (_width / 2);
        const midY = bounds.y + (_height / 2);
        if (_width === 0 || _height === 0) return;
        let minScale = 1;
        if (bounds.height < 300 && bounds.width < 300) {
            minScale = Math.max(bounds.height, bounds.width) / 300;
        }
        const displayScale = (minScale * displayPrecent) / Math.max(_width / fullWidth, _height / fullHeight);
        const dislayTranslate = [(fullWidth / 2) - (displayScale * midX), (fullHeight / 2) - (displayScale * midY)];
        svg.transition()
            .duration(transitionDiration)
            .call(
                zoomHandler.transform,
                d3.zoomIdentity.translate(dislayTranslate[0], dislayTranslate[1]).scale(displayScale))
            .on('end', () => {
                svg.on('dblclick.zoom', null);
                const [x, y, k] = graphWrapper.mainWrapper.attr('transform').match(/[\d|.|-]+/g);
                networkGraphHandler.background.wrapperStyle = {
                    scale: k,
                    translate: {x, y},
                };
                graphData.toolHandler.updateUiProjectSettings(
                    networkGraphHandler.nodesPos, networkGraphHandler.background);
            });
    }

    function zoomToNode(nodeIp) {
        graphData.mdopCardEnabled = true;
        graphData.toolHandler.node.onMdopLeave();
        console.log('zoomToNode');
        const selectedNode = graphData.nodes.filter(n => n.id === nodeIp)[0];
        console.log(selectedNode);

        let displayPrecent = 0.6;
        let displayWrapper = graphWrapper.mainWrapper.node().getBBox();
        const bounds = {
            width: displayWrapper.width,
            height: displayWrapper.height,
            x: displayWrapper.x,
            y: displayWrapper.y,
        };

        const parent = d3.select('#topology-svg-wrapper').node();
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const _width = bounds.width;
        const _height = bounds.height;
        if (_width === 0 || _height === 0) return;
        let minScale = 1;
        if (bounds.height < 300 && bounds.width < 300) {
            minScale = Math.max(bounds.height, bounds.width) / 300;
        }
        const displayScale = ((minScale * displayPrecent) / Math.max(_width / fullWidth, _height / fullHeight)) * 2;

        svg.transition()
        .duration(500)
        .call(
            zoomHandler.transform,
            d3.zoomIdentity.translate(
                (fullWidth / 2) - (selectedNode.x * displayScale),
                (fullHeight / 2) - (selectedNode.y * displayScale),
            ).scale(displayScale)
        ).on('end', () => {
            svg.on('dblclick.zoom', null);
            const [x, y, k] = graphWrapper.mainWrapper.attr('transform').match(/[\d|.|-]+/g);
            networkGraphHandler.background.wrapperStyle = {
                scale: k,
                translate: {x, y},
            };
            graphData.toolHandler.updateUiProjectSettings(
                networkGraphHandler.nodesPos, networkGraphHandler.background);
        });


    }

    // function to move the background image to window center and scale it
    function moveImageToCenter(displayScale, transitionDiration = 300) {
        const bounds = d3.select('#background-image-wrapper').node().getBBox();
        const parent = d3.select('#background-image-wrapper').node().parentElement;
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const _width = bounds.width;
        const _height = bounds.height;
        const midX = bounds.x;
        const midY = bounds.y;
        if (_width === 0 || _height === 0) return;
        const displayTranslate = [(fullWidth / 2) - (displayScale * midX), (fullHeight / 2) - (displayScale * midY)];
        svg.transition()
            .duration(transitionDiration)
            .call(
                zoomHandler.transform,
                d3.zoomIdentity.translate(displayTranslate[0], displayTranslate[1]).scale(displayScale));
    }
    networkGraphHandler.zoomToFit = fitCanvas;
    networkGraphHandler.zoomToNode = zoomToNode;
    networkGraphHandler.moveToCenter = moveImageToCenter;

    const initEndCallBack = (fit) => {
        setTimeout(() => {
            if (fit) {
                networkGraphHandler.zoomToFit(0.6, 0);
            }

            function wrapperTransitionOnInterrupt() {
                d3.select(this).transition().duration(400)
                    .style('opacity', 1)
                    .on('end', () => {
                        graphData.isInit = false;
                    });
            }

            d3.select('#background-image-wrapper').transition().duration(400)
                .style('opacity', 1)
                .on('interrupt', wrapperTransitionOnInterrupt)
                .on('end', () => {
                    graphData.isInit = false;
                });
            d3.select('#nodes-wrapper').transition().duration(400)
                .attr('opacity', 1)
                .on('interrupt', wrapperTransitionOnInterrupt)
                .on('end', () => {
                    graphData.isInit = false;
                });
            d3.select('#links-wrapper').transition().duration(400)
                .attr('opacity', 1)
                .on('interrupt', wrapperTransitionOnInterrupt)
                .on('end', () => {
                    graphData.isInit = false;
                });
        }, 100);
    };

    graphData.simulation = d3.forceSimulation(graphData.nodes) // Force algorithm is applied to data.nodes
        .force('charge', d3.forceManyBody())
        .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(300))
        .alphaDecay(1)
        .on('tick', ticked)
        .on('end', () => {
            if (graphData.isInit) {
                graphData.simulation.alphaDecay(0.5);
                if (networkGraphHandler.image.set) {
                    graphData.backgroundImage = new Image();
                    const projectId = Cookies.get('projectId');
                    const {id, timestamp} = networkGraphHandler.image;
                    // const imgUrl = `/api/django/media/${projectId}/${id}?t=${timestamp}`;
                    // const [hostname, port] = window.nw.App.argv;
                    const {hostname, port} = store.getState().common.hostInfo;

                    const imgUrl = `http://${hostname}:${port}/media/${projectId}/${id}?t=${timestamp}`;

                    loadImage(imgUrl).then((img) => {
                        graphData.backgroundImage = img;
                        updateBackground();
                        initEndCallBack(isNewProject);
                    }).catch((err) => {
                        console.log('update image fail:', err);
                        updateBackground();
                        initEndCallBack(isNewProject);
                    });
                } else {
                    initEndCallBack(isNewProject);
                }
                updateDebugJson();
            }
        });

    graphWrapper.backgroundWrapper = graphWrapper.mainWrapper.append('g').attr('id', 'background-image-wrapper')
        .style('opacity', 0);
    graphWrapper.backgroundWrapper = d3.select('#background-image-wrapper')
        .append('image');
    initLinks(graphData.links);
    drawLink();
    initNodes(graphData.nodes);
    drawNode();
    graphWrapper.menuWrapper = graphWrapper.mainWrapper.append('g').attr('id', 'menu-wrapper');
    d3.select('#topology-graph').append('div')
        .attr('id', 'menu-button-tooltip')
        .attr('class', 'menu-button-tooltip-wrapper')
        .style('position', 'absolute');
    d3.select('#topology-graph').append('div')
        .attr('id', 'sub-menu-button-tooltip')
        .attr('class', 'menu-button-tooltip-wrapper')
        .style('position', 'absolute');
    graphWrapper.mismatchToolTips = d3.select('#topology-graph').append('div')
        .attr('id', 'mismatch-tooltip-wrapper')
        .attr('class', 'menu-button-tooltip-wrapper')
        .style('position', 'absolute');
    graphWrapper.mismatchToolTips.html(`<div class="menu-button-content">${graphData.t('secretMismatch')}</div>`);
    graphWrapper.isAuthUnknownTooltips = d3.select('#topology-graph').append('div')
        .attr('id', 'isAuthUnknown-tooltip-wrapper')
        .attr('class', 'menu-button-tooltip-wrapper')
        .style('position', 'absolute');
    graphWrapper.isAuthUnknownTooltips.html(`<div class="menu-button-content">${graphData.t('isNoAuth')}</div>`);
    dragHandler(graphWrapper.nodesEnter);
    zoomHandler(svg);

    if (!scale) {
        svg.call(zoomHandler.transform,
            d3.zoomIdentity.translate(0, 0).scale(1));
    } else {
        svg.call(zoomHandler.transform,
            d3.zoomIdentity.translate(translate.x, translate.y).scale(scale));
    }
};

function changeToAdjustMode(adjust) { // active adjust mode
    if (adjust) {
        const imageWrapper = d3.select('#background-image-wrapper');
        // copy the current background object
        // the graph will use the clone object to draw the background for previw
        adjustModeHandler.backgroundTemp = JSON.parse(JSON.stringify(networkGraphHandler.background));
        adjustModeHandler.nodesStartPos = JSON.parse(JSON.stringify(networkGraphHandler.nodesPos));
        const projectId = Cookies.get('projectId');
        const {id, timestamp} = networkGraphHandler.image;
        // const imgUrl = `/api/django/media/${projectId}/${id}?t=${timestamp}`;

        // const [hostname, port] = window.nw.App.argv;
        const {hostname, port} = store.getState().common.hostInfo;

        const imgUrl = `http://${hostname}:${port}/media/${projectId}/${id}?t=${timestamp}`;

        loadImage(imgUrl).then((img) => {
            const {
                pos: {x, y},
                opacity,
                imgSize, viewSize,
            } = adjustModeHandler.backgroundTemp;
            imageWrapper.datum({x, y, opacity});
            graphWrapper.backgroundWrapper.style('visibility', 'visible')
                .attr('xlink:href', img.src);
            graphWrapper.backgroundWrapper.attr('transform', `translate(${x}, ${y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`)
                .attr('opacity', opacity);
            networkGraphHandler.zoomToFit();
        }).catch((err) => { console.log('update image fail:', err); });
        d3.select('#topology-graph').style('background', adjustModeHandler.backgroundTemp.color);
        imageWrapper.style('cursor', 'all-scroll')
            .call(d3.drag().on('drag', () => { // background on drag listener
                const {imgSize, viewSize} = adjustModeHandler.backgroundTemp;
                const newPos = {x: d3.event.x, y: d3.event.y};
                adjustModeHandler.backgroundTemp.pos = newPos;
                imageWrapper.datum(newPos);
                graphWrapper.backgroundWrapper.attr('transform', `translate(${newPos.x}, ${newPos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(graphData.adjustMode);
            }));
        drawResizeNode(graphWrapper);
    } else {
        adjustModeHandler.backgroundTemp = {};
        d3.select('#background-image-wrapper').style('cursor', 'auto').on('mousedown.drag', null);
        d3.select('#background-image-wrapper').selectAll('.drag-to-resize-node').remove();
        d3.select('#background-image-wrapper').select('#resize-nodes-wrapper').remove();
        updateBackground();
    }
}

const resizeContainer = () => {
    // networkGraphHandler.zoomToFit();
};

const preLoadIconAtStart = () => {
    Object.keys(graphData.preloadIcon).forEach((icon) => {
        graphData.preloadIcon[icon] = new Image();
        graphData.preloadIcon[icon].src = `/img/icons/${icon}.svg`;
    });
}

const TopologyGraph = (props) => {

    const {lang} = useSelector(store => store.common);

    const didMountFunc = () => {
        window.addEventListener('resize', resizeContainer);
        networkGraphHandler.moveNode = moveNode;
        preLoadIconAtStart();
        graphData.t = props.t;
        networkGraphHandler.nodesPos = props.nodesPos;
        networkGraphHandler.background = props.background;
        initGraph(props);
        return () => {
            graphData.nodes = [];
            graphData.links = [];
            graphData.isInit = true;
            networkGraphHandler.zoomToFit = () => {};
            networkGraphHandler.moveNode = () => {};
            window.removeEventListener('resize', resizeContainer);
        };
    };
    useEffect(didMountFunc, []);

    const graphUpdate = () => {
        console.log('graphUpdate');
        if (!props.graphUpdate) return;
        const graph = {...props.graph};
        graphData.fullGraph = {
            ...graph,
            links: [...graph.links]
        };
        if (!graphData.showEthLink) {
            graph.links = props.graph.links.filter(l => l.type !== 'EthernetLink');
        }
        console.log('graph');
        console.log(graph);
        graphData.mdopTable = props.mdopTable;
        updateGraph(graph);
        graphData.graph = graph;

    };
    useEffect(graphUpdate, [props.lastUpdateTime.graph]);
    useEffect(graphUpdate, [props.graphUpdate]);
    useEffect(graphUpdate, [props.mdopTable]);
    useEffect(graphUpdate, [lang]);

    const ethLinkUpdate = () => {
        graphData.showEthLink = props.showEthLink;
        const graph = {...props.graph};
        graphData.fullGraph = {
            ...graph,
            links: [...graph.links]
        };
        if (!graphData.showEthLink) {
            graph.links = props.graph.links.filter(l => l.type !== 'EthernetLink');
        }
        console.log(graph);
        updateGraph(graph);
        graphData.graph = graph;
    };

    useEffect(ethLinkUpdate, [props.showEthLink]);

    const nodeUpdate = () => {
        if (!props.graphUpdate) return;
        graphData.graphNodeInfo = props.nodeInfo;
        updateNodeLabel();
    };
    useEffect(nodeUpdate, [props.lastUpdateTime.nodeInfo]);

    const linkUpdate = () => {
        if (!props.graphUpdate) return;
        graphData.graphLinkInfo = props.linkInfo;
        graphData.rssiColor = props.rssiColor;
        updateLinkLabel();
        updateLinkColor();
        updateDebugJson();
    };
    useEffect(linkUpdate, [props.lastUpdateTime.linkInfo]);

    const rssiColorUpdate = () => {
        if (!props.graphUpdate) return;
        graphData.rssiColor = props.rssiColor;
        updateLinkColor();
        updateDebugJson();
    };
    useEffect(rssiColorUpdate, [props.rssiColor]);

    const linkLabelUpdate = () => {
        if (!props.graphUpdate) return;
        graphData.showLinkLabel = props.showLinkLabel;
        updateLinkLabel();
    };
    useEffect(linkLabelUpdate, [props.showLinkLabel]);

    const backgroundUpdate = () => {
        networkGraphHandler.background = props.background;
        if (graphData.isInit) return;
        updateBackground();
    };
    useEffect(backgroundUpdate, [props.background]);

    const imageUpdate = () => {
        networkGraphHandler.image = props.image;
        if (graphData.isInit) return;
        updateBackground();
    };
    useEffect(imageUpdate, [props.image]);

    const adjustModeUpdate = () => {
        graphData.adjustMode = props.adjustMode;
        if (graphData.isInit) return;
        changeToAdjustMode(props.adjustMode);
    };
    useEffect(adjustModeUpdate, [props.adjustMode]);

    graphData.toolHandler = props.eventHandler;
    adjustModeHandler.getImageCenterPos = (width, height) => {
        const graphCenter = getNodeGraphCenter(graphData.nodes);
        return {
            x: graphCenter.x - (width / 2),
            y: graphCenter.y - (height / 2),
        };
    };
    adjustModeHandler.adjustMapReset = () => {
        graphWrapper.nodesEnter.each((node) => {
            const nodeId = node.id === 'A-NM' ? '127.0.0.1' : node.id;
            // eslint-disable-next-line no-param-reassign
            node.x = adjustModeHandler.nodesStartPos[nodeId].x;
            // eslint-disable-next-line no-param-reassign
            node.y = adjustModeHandler.nodesStartPos[nodeId].y;
        });
        ticked();
        networkGraphHandler.nodesPos = JSON.parse(JSON.stringify(adjustModeHandler.nodesStartPos));
        updateBackground(true);
        updateDragToResizeNotePosition(graphData.adjustMode, animationDuration);
        props.eventHandler.updateUiProjectSettings(networkGraphHandler.nodesPos, networkGraphHandler.background);
    };
    adjustModeHandler.adjustMapOpacity = (opacity) => {
        adjustMapOpacityPreview(opacity, graphWrapper.backgroundWrapper);
    };
    adjustModeHandler.fixDimensionView = fixDimensionView;
    adjustModeHandler.resetMapSize = () => { resetMapSize(graphWrapper); };
    adjustModeHandler.setViewport = () => { setViewport(graphWrapper); };
    adjustModeHandler.resetToDefault = () => {
        graphWrapper.nodesEnter.each((node) => {
            const nodeId = node.id === 'A-NM' ? '127.0.0.1' : node.id;
            // eslint-disable-next-line no-param-reassign
            node.x = adjustModeHandler.nodesStartPos[nodeId].x;
            // eslint-disable-next-line no-param-reassign
            node.y = adjustModeHandler.nodesStartPos[nodeId].y;
        });
        ticked();
        networkGraphHandler.nodesPos = JSON.parse(JSON.stringify(adjustModeHandler.nodesStartPos));
        resetToDefault(graphWrapper);
        props.eventHandler.updateUiProjectSettings(networkGraphHandler.nodesPos, networkGraphHandler.background);
    };
    adjustModeHandler.setBackgroundColor = setBackgroundColor;
    graphData.mapContextMenu = props.eventHandler.map.contextMenuOpen;

    return (
        <ClickAwayListener
            onClickAway={
                () => {
                    closeMenu();
                    graphData.mdopCardEnabled = false;
                    graphData.toolHandler.node.onMdopLeave();
                }}
            >
                <div
                    id="topology-graph"
                    style={{
                        width: '100vw',
                        height: '100%',
                        position: 'relative',
                        userSelect: 'none',
                        background: props.background.show && props.image.set ?
                            props.background.color : '#e5e5e5',
                    }}
                />
        </ClickAwayListener>
    );
};

TopologyGraph.propTypes = {
    t: PropTypes.func.isRequired,
    setDialog: PropTypes.func.isRequired,
    graphUpdate: PropTypes.bool.isRequired,
    graph: PropTypes.shape({
        nodes: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                isAuth: PropTypes.string,
                isManaged: PropTypes.bool,
                isReachable: PropTypes.bool,
                isHostNode: PropTypes.bool,
            })
        ).isRequired,
        links: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                from: PropTypes.string,
                to: PropTypes.string,
                status: PropTypes.number,
                type: PropTypes.string,
                linkIndex: PropTypes.number,
                totalLink: PropTypes.number,
            })
        ).isRequired,
    }).isRequired,
    nodeInfo: PropTypes.objectOf(
        PropTypes.shape({
            hostname: PropTypes.string,
        })).isRequired,
    linkInfo: PropTypes.objectOf(
        PropTypes.shape({
            info: PropTypes.shape({
                band: PropTypes.string,
                channel: PropTypes.string,
                frequency: PropTypes.string,
                channelBandwidth: PropTypes.string,
            }),
        })).isRequired,
    nodesPos: PropTypes.objectOf(
        PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })
    ).isRequired,
    background: PropTypes.shape({
        show: PropTypes.bool.isRequired,
        wrapperStyle: PropTypes.shape({
            scale: PropTypes.oneOfType([() => null, PropTypes.number.isRequired]),
            translate: PropTypes.shape({
                x: PropTypes.oneOfType([() => null, PropTypes.number.isRequired]),
                y: PropTypes.oneOfType([() => null, PropTypes.number.isRequired]),
            }).isRequired,
        }).isRequired,
        image: PropTypes.shape({
            set: PropTypes.bool.isRequired,
            id: PropTypes.string.isRequired,
        }).isRequired,
        imgSize: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
        }).isRequired,
        viewSize: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
        }).isRequired,
        pos: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        color: PropTypes.string,
    }).isRequired,
    image: PropTypes.shape({
        set: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    lastUpdateTime: PropTypes.shape({
        graph: PropTypes.string.isRequired,
        nodeInfo: PropTypes.string.isRequired,
        linkInfo: PropTypes.string.isRequired,
    }).isRequired,
    eventHandler: PropTypes.shape({
        map: PropTypes.shape({
            openContextMenu: PropTypes.func.isRequired,
            closeContextMenu: PropTypes.func.isRequired,
            contextMenuOpen: PropTypes.bool.isRequired,
        }).isRequired,
        node: PropTypes.shape({
            onHover: PropTypes.func.isRequired,
            onHoverLeave: PropTypes.func.isRequired,
            onMdopClick: PropTypes.func.isRequired,
            onMdopLeave: PropTypes.func.isRequired,
            menuFunc: PropTypes.shape({
                openDraggableBox: PropTypes.func.isRequired,
                openLinkAlignment: PropTypes.func.isRequired,
                openSpectrumScan: PropTypes.func.isRequired,
                openRssiBox: PropTypes.func.isRequired,
                addDeviceToList: PropTypes.func.isRequired,
            }).isRequired,
            onLeftClickNode: PropTypes.func.isRequired
        }).isRequired,
        link: PropTypes.shape({
            onHover: PropTypes.func.isRequired,
            onHoverLeave: PropTypes.func.isRequired,
            menuFunc: PropTypes.shape({
                blocklink: PropTypes.func.isRequired,
            }).isRequired,
        }).isRequired,
        updateUiProjectSettings: PropTypes.func.isRequired,
        updateDebugJson: PropTypes.func.isRequired,
    }).isRequired,
    rssiColor: PropTypes.shape({
        enable: PropTypes.bool.isRequired,
        color: PropTypes.shape({
            max: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
    showLinkLabel: PropTypes.bool.isRequired,
    adjustMode: PropTypes.bool.isRequired,
};

TopologyGraph.defaultProps = {};

export default TopologyGraph;
