import * as d3 from 'd3';
import {getTooltipOffset} from './topologyGraphHelperFunc';
import {getGraphData, setHoverOnContextBtn, setHoverOutContextBtn} from './TopologyGraph';
import Constant from '../../../../constants/common';

const {colors} = Constant;
const animationDuration = 250;

const NodePopupDialogIndex = {
    INFO: 0,
    STATISTIC: 1,
    SETTINGS: 2,
    MAINTENANCE: 3,
    SECURITY: 4,
};

export const contextMenuSettings = {
    btnRadius: 12,
    iconSize: 14,
    delayBtwItems: 50,
    type: {
        link: {
            offset: 25,
            startAngle: -90,
            angleOffset: 0,
            items: [
                {
                    id: 'blocklink',
                    icon: 'blocklink', // the svg filename store in resource folder
                    tooltipKey: 'eliminatelink',
                    tooltipDirection: 'top', // [top, left, bottom, right]
                    scale: 1,
                    onClick: () => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.link.menuFunc.blocklink(rightClickMenuId);
                    },
                    subItems: null,
                },
            ],
        },
        node: {
            offset: 40,
            startAngle: -90,
            angleOffset: 45,
            items: [
                {
                    id: 'info',
                    icon: 'info',
                    tooltipKey: 'info',
                    tooltipDirection: 'top',
                    scale: 0.8,
                    onClick: ({pos}) => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openDraggableBox(
                            rightClickMenuId, NodePopupDialogIndex.INFO, pos);
                    },
                    subItems: null,
                },
                {
                    id: 'statistic',
                    icon: 'statistic',
                    tooltipKey: 'statistic',
                    tooltipDirection: 'right',
                    scale: 1,
                    onClick: ({pos}) => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openDraggableBox(
                            rightClickMenuId, NodePopupDialogIndex.STATISTIC, pos);
                    },
                    subItems: null,
                },
                {
                    id: 'settings',
                    icon: 'settings',
                    tooltipKey: 'settings',
                    tooltipDirection: 'right',
                    scale: 1,
                    onClick: ({pos}) => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openDraggableBox(
                            rightClickMenuId, NodePopupDialogIndex.SETTINGS, pos);
                    },
                    subItems: null,
                },
                {
                    id: 'maintenance',
                    icon: 'maintenance',
                    tooltipKey: 'maintenance',
                    tooltipDirection: 'right',
                    scale: 1,
                    onClick: ({pos}) => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openDraggableBox(
                            rightClickMenuId, NodePopupDialogIndex.MAINTENANCE, pos);
                    },
                    subItems: null,
                },
                {
                    id: 'security',
                    icon: 'security',
                    tooltipKey: 'security',
                    tooltipDirection: 'bottom',
                    scale: 1,
                    onClick: ({pos}) => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openDraggableBox(
                            rightClickMenuId, NodePopupDialogIndex.SECURITY, pos);
                    },
                    subItems: null,
                },
                {
                    id: 'networkTools',
                    icon: 'networkTools',
                    tooltipKey: 'networkTools',
                    tooltipDirection: 'left',
                    conditionsToShow: ({firmwareVersion}) => {
                        if (firmwareVersion) {
                            const verArr = firmwareVersion.replace('v', '').split('.').map(num => parseInt(num, 10));
                            // Support AX50
                            if (verArr[0] > 1) {
                                return true;
                            }
                            return verArr[1] >= 2;
                        }
                        return false;
                    },
                    scale: 0.8,
                    onClick: null,
                    subItems: {
                        subBtnRadius: 10,
                        subIconSize: 12,
                        subBtnAngleOffset: 40,
                        subBtnTotalAnimationTime: 250,
                        items: [
                            {
                                id: 'linkalignment',
                                icon: 'linkalignment',
                                tooltipKey: 'linkalignment',
                                tooltipDirection: 'bottom',
                                scale: 1.4,
                                onClick: () => {
                                    const {toolHandler, rightClickMenuId} = getGraphData();
                                    toolHandler.node.menuFunc.openLinkAlignment(rightClickMenuId);
                                },
                            },
                            {
                                conditionsToShow: ({firmwareVersion, model}) => {
                                    if (model) {
                                        const verArr = firmwareVersion.replace('v', '').split('.')
                                            .map(num => parseInt(num, 10));

                                        if (model.match(/^[X][2]/g)) {
                                            return verArr[1] > 4 || (verArr[1] === 4 && verArr[2] >= 172);
                                        }
                                        // Support AX50
                                        if (verArr[0] > 1) {
                                            return true;
                                        }
                                        return verArr[1] >= 4;
                                    }
                                    return false;
                                },
                                id: 'spectrumscan',
                                icon: 'spectrumscan',
                                tooltipKey: 'spectrumscan',
                                tooltipDirection: 'bottom',
                                scale: 1,
                                onClick: () => {
                                    const {toolHandler, rightClickMenuId} = getGraphData();
                                    toolHandler.node.menuFunc.openSpectrumScan(rightClickMenuId);
                                },
                            },
                            {
                                conditionsToShow: ({firmwareVersion, isHostNode}) => {
                                    // if (!isHostNode) {
                                    //     return false;
                                    // }
                                    if (firmwareVersion) {
                                        const verArr = firmwareVersion.replace('v', '').split('.').map(num => parseInt(num, 10));

                                        // Support AX50
                                        if (verArr[0] > 1) {
                                            return true;
                                        }

                                        return verArr[1] > 6 || (verArr[1] >= 6 && verArr[2] >= 55);
                                    }
                                    return false;
                                },
                                id: 'noderecovery',
                                icon: 'noderecovery',
                                tooltipKey: 'noderecovery',
                                tooltipDirection: 'right',
                                scale: 1.8,
                                onClick: () => {
                                    const {toolHandler, rightClickMenuId} = getGraphData();
                                    toolHandler.node.menuFunc.openNodeRecovery(rightClickMenuId);
                                },
                            },
                        ],
                    },
                },
                {
                    id: 'rssi',
                    icon: 'rssi',
                    tooltipKey: 'rssi',
                    tooltipDirection: 'left',
                    conditionsToShow: ({firmwareVersion}) => {
                        if (firmwareVersion) {
                            const verArr = firmwareVersion.replace('v', '').split('.').map(num => parseInt(num, 10));
                            // Support AX50
                            if (verArr[0] > 1) {
                                return false;
                            }
                            return verArr[1] < 2;
                        }
                        return false;
                    },
                    scale: 1,
                    onClick: () => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.openRssiBox(rightClickMenuId);
                    },
                    subItems: null,
                },
            ],
        },
        nodeUnmanaged: {
            offset: 40,
            startAngle: -90,
            angleOffset: 0,
            items: [
                {
                    id: 'add',
                    icon: 'add',
                    tooltipKey: 'add',
                    tooltipDirection: 'top',
                    scale: 1,
                    onClick: () => {
                        const {toolHandler, rightClickMenuId} = getGraphData();
                        toolHandler.node.menuFunc.addDeviceToList(rightClickMenuId);
                    },
                    subItems: null,
                },
            ],
        },
    },
};

const contextMenuStatus = {
    tooltips: false,
    subMenuOpen: false,
};

export function closeMenu() { // close popup menu
    const graphData = getGraphData();
    graphData.rightClickMenu = false;
    graphData.rightClickMenuId = '';
    const menuWrapper = d3.select('#menu-wrapper');
    menuWrapper.selectAll('#sub-menu-circle').transition()
        .duration(animationDuration)
        .attr('r', 1)
        .remove();
    menuWrapper.selectAll("image[id*='sub-menu-icon']").transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
    menuWrapper.selectAll('#sub-menu-wrapper').transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
    menuWrapper.selectAll('#menu-circle').transition()
        .duration(animationDuration)
        .attr('r', 1)
        .remove();
    menuWrapper.selectAll("image[id*='menu-id']").transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
    menuWrapper.selectAll('.menu-button-wrapper')
        .transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
    d3.select('#menu-button-tooltip').select('#tooltip-content').remove();
    contextMenuStatus.subMenuOpen = false;
    contextMenuStatus.tooltips = false;
}

const showTooltip = (obj, tooltipKey, tooltipDirection, btnRadius) => {
    if (contextMenuStatus.tooltips) return;
    const {t} = getGraphData();
    const graphScale = parseFloat(
        d3.select('#all').attr('transform').split('scale(')[1].match(/[\d|.|-]+/g)[0], 10);
    const circlrPos = d3.select(obj).select('#menu-circle').node().getBoundingClientRect();
    const menuButtonTooltipWrapper = d3.select('#menu-button-tooltip');
    const tooltipWrapper = menuButtonTooltipWrapper.append('div');
    tooltipWrapper.attr('id', 'tooltip-content')
        .html(`<div class="menu-button-content">${t(tooltipKey)}</div>`);
    const tooltipContent = tooltipWrapper.node().getBoundingClientRect();
    const tooltipOffset =
        getTooltipOffset(tooltipContent, graphScale, btnRadius, tooltipDirection);
    menuButtonTooltipWrapper.style('left', `${circlrPos.left + (tooltipOffset.x)}px`)
        .style('top', `${circlrPos.top + -48 + (tooltipOffset.y)}px`);
    tooltipWrapper.transition()
        .duration(animationDuration)
        .style('opacity', 1);
    contextMenuStatus.tooltips = true;
};


const showSubTooltip = (obj, tooltipKey, tooltipDirection, btnRadius) => {
    const {t} = getGraphData();
    const graphScale = parseFloat(
        d3.select('#all').attr('transform').split('scale(')[1].match(/[\d|.|-]+/g)[0], 10);
    const circlrPos = d3.select(obj).select('#sub-menu-circle').node().getBoundingClientRect();
    const menuButtonTooltipWrapper = d3.select('#sub-menu-button-tooltip');
    const tooltipWrapper = menuButtonTooltipWrapper.append('div');
    tooltipWrapper.attr('id', 'tooltip-content')
        .html(`<div class="menu-button-content">${t(tooltipKey)}</div>`);
    const tooltipContent = tooltipWrapper.node().getBoundingClientRect();
    const tooltipOffset =
        getTooltipOffset(tooltipContent, graphScale, btnRadius, tooltipDirection);
    menuButtonTooltipWrapper.style('left', `${circlrPos.left + (tooltipOffset.x)}px`)
        .style('top', `${circlrPos.top + -48 + (tooltipOffset.y)}px`);
    tooltipWrapper.transition()
        .duration(animationDuration)
        .style('opacity', 1);
    contextMenuStatus.tooltips = true;
};

function pathTween(path) {
    const length = path.node().getTotalLength();
    const r = d3.interpolate(0, length);
    return function (t) {
        const nextPoint = path.node().getPointAtLength(r(t));
        d3.select(this).attr('cx', nextPoint.x).attr('cy', nextPoint.y);
    };
}

function imgPathTween(path, iconAlignCenter, scale) {
    const length = path.node().getTotalLength();
    const r = d3.interpolate(0, length);
    return function (t) {
        const nextPoint = path.node().getPointAtLength(r(t));
        d3.select(this).style('transform',
            `translate(${(nextPoint.x + iconAlignCenter)}px, ${(nextPoint.y + iconAlignCenter)}px) scale(${scale})`);
    };
}

const drawSubBtn = (startPos, animationTime, iconSettings, path) => {
    const wrapper = d3.select('#sub-menu-wrapper').append('g')
        .attr('class', 'sub-button')
        .style('pointer-events', 'none')
        .style('opacity', 1);
    const {x, y} = startPos;
    const {
        id,
        scale,
        icon,
        onClick,
        tooltipKey,
        tooltipDirection,
        subBtnRadius,
        subIconSize,
    } = iconSettings;
    const iconAlignCenter = -((subIconSize * scale) / 2);
    // const src = preloadIcon[icon];
    const {preloadIcon} = getGraphData();
    const src = preloadIcon[icon].src;

    wrapper.append('svg:circle').attr('id', 'sub-menu-circle')
        .style('fill', colors.popupMenuItem)
        .attr('r', subBtnRadius)
        .attr('cx', x)
        .attr('cy', y)
        .style('opacity', 0)
        .transition()
        .ease(d3.easeLinear)
        .duration(animationTime)
        .style('pointer-events', 'auto')
        .style('opacity', 1)
        // eslint-disable-next-line prefer-arrow-callback
        .tween('pathTween', function () { return pathTween(path); });
    wrapper.append('image').attr('id', `${id}-sub-menu-icon`)
        .style('transform',
            `translate(${(x + iconAlignCenter)}px, ${(y + iconAlignCenter)}px) scale(${scale})`)
        .style('fill', 'white')
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .attr('height', subIconSize)
        .attr('width', subIconSize)
        .attr('xlink:href', src)
        .transition() // animation to popup the button
        .ease(d3.easeLinear)
        .duration(animationTime)
        .style('opacity', 1)
        // eslint-disable-next-line prefer-arrow-callback
        .tween('pathTween', function () { return imgPathTween(path, iconAlignCenter, scale); })
        .on('end', () => { // set eventlistener to button after animation
            path.remove();
            wrapper.style('cursor', 'pointer')
                .style('pointer-events', 'auto')
                .on('click', () => {
                    setHoverOnContextBtn(() => {
                        const {rightClickMenuId} = getGraphData();
                        if (rightClickMenuId === '') {
                            setHoverOutContextBtn();
                            return;
                        }
                        onClick();
                        closeMenu();
                    });
                })
                .on('mouseenter', function () { // show hover tooltips
                    showSubTooltip(this, tooltipKey, tooltipDirection, subBtnRadius);
                    setHoverOnContextBtn(() => {
                        const {rightClickMenuId} = getGraphData();
                        if (rightClickMenuId === '') {
                            setHoverOutContextBtn();
                            return;
                        }
                        onClick();
                        closeMenu();
                    });
                })
                .on('mouseleave', () => {
                    d3.select('#sub-menu-button-tooltip').selectAll('#tooltip-content').remove();
                    setHoverOutContextBtn();
                });
        });
};

const focusOn = (targetId, animationTime) => {
    d3.selectAll('.menu-button-wrapper').each(function () {
        if (this.id === targetId) return;
        const wrapper = d3.select(this);
        wrapper.transition().duration(animationTime)
            .style('opacity', 0)
            .on('end', function () {
                d3.select(this).style('visibility', 'hidden');
            });
        const circle = wrapper.select('#menu-circle');
        circle.transition().duration(animationTime).attr('r', 8);
    });
};

const focusOut = () => {
    d3.selectAll('.menu-button-wrapper').each(function () {
        const wrapper = d3.select(this);
        wrapper.style('visibility', null).transition().duration(animationDuration)
            .style('opacity', 1);
        const circle = wrapper.select('#menu-circle');
        circle.transition().duration(animationDuration).attr('r', contextMenuSettings.btnRadius);
    });
};

const getAnimationPath = (startX, startY, r, endX, endY, largeArcFlag) =>
    `M${startX} ${startY} A${r},${r} 0 ${largeArcFlag} 0 ${endX} ${endY}`;

const drawSubMenu = (subBtnObj, nodeInformation) => {
    const {
        items,
        angle,
        popupPos,
        mainPos: {x, y},
        subBtnTotalAnimationTime, subBtnAngleOffset,
        subBtnRadius, subIconSize,
        radiusBtwMainPopup,
    } = subBtnObj;
    const wrapper = d3.select('#menu-wrapper').append('g').attr('id', 'sub-menu-wrapper');
    const totalBtn = items.length;
    items.forEach((subBtn, index) => {
        const {conditionsToShow} = subBtn;
        if (typeof conditionsToShow !== 'undefined') {
            if (!conditionsToShow(nodeInformation)) {
                return;
            }
        }
        const btnObj = {
            ...subBtn,
            subBtnRadius,
            subIconSize,
        };
        const popupAngle = angle - (subBtnAngleOffset * (index + 1));
        const endOffsetX = Math.cos((popupAngle * Math.PI) / 180) * radiusBtwMainPopup;
        const endOffsetY = Math.sin((popupAngle * Math.PI) / 180) * radiusBtwMainPopup;
        const animationPath = wrapper.append('path')
            .style('fill', 'none')
            .style('stroke', 'none')
            .attr('d', () =>
                getAnimationPath(popupPos.x, popupPos.y, radiusBtwMainPopup, x + endOffsetX, y + endOffsetY,
                    popupAngle <= angle - 180 ? 1 : 0));
        const animationTime = (subBtnTotalAnimationTime / totalBtn) * (index + 1);
        drawSubBtn(popupPos, animationTime, btnObj, animationPath);
    });
};

const closeSubMenu = () => {
    const subMenuWrapper = d3.select('#sub-menu-wrapper');
    subMenuWrapper.selectAll('#sub-menu-circle').transition()
        .duration(animationDuration)
        .attr('r', 1)
        .remove();
    subMenuWrapper.selectAll('image[id*=sub-menu-icon]').transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
    subMenuWrapper.transition()
        .duration(animationDuration)
        .style('opacity', 0)
        .remove();
};

function openSubMenu(ele, btnSettings, mainBtnObj, nodeInformation) {
    const {btnRadius} = contextMenuSettings;
    const {
        tooltipKey,
        tooltipDirection,
    } = mainBtnObj;
    showTooltip(ele, tooltipKey, tooltipDirection, btnRadius);
    drawSubMenu(btnSettings, nodeInformation);
    focusOn(ele.id, 250);
}

const MenuOnClick = (ele, iconObj, subItems, pos, nodeInformation) => {
    const {rightClickMenuId, preloadIcon} = getGraphData();
    if (rightClickMenuId === '') {
        setHoverOutContextBtn();
        return;
    }
    const {
        src, id,
        onClick,
        tooltipKey, tooltipDirection,
        scale, angle,
        endX, endY,
        radiusBtwMainPopup,
    } = iconObj;

    if (subItems) {
        if (contextMenuStatus.subMenuOpen) {
            contextMenuStatus.subMenuOpen = false;
            d3.select(ele).select(`#${id}-menu-icon`).attr('xlink:href', src);
            closeSubMenu();
            focusOut();
        } else {
            contextMenuStatus.subMenuOpen = true;
            d3.select(ele).select(`#${id}-menu-icon`).attr('xlink:href', preloadIcon.back.src);
            const {x, y} = pos;
            const subBtnObj = {
                ...subItems,
                mainPos: {x, y},
                popupPos: {
                    x: endX,
                    y: endY,
                },
                scale,
                angle,
                radiusBtwMainPopup,
            };
            const mainBtnObj = {
                tooltipKey,
                tooltipDirection,
                ...iconObj,
            };
            openSubMenu(ele, subBtnObj, mainBtnObj, nodeInformation);
        }
    } else if (!subItems) {
        onClick({pos});
        closeMenu();
        setHoverOutContextBtn();
    }
}

const drawMenuBtn = (pos, delay, iconObj, subItems, nodeInformation) => {
    const {btnRadius, iconSize} = contextMenuSettings;
    const {
        id, src,
        tooltipKey, tooltipDirection,
        scale,
        endX, endY,
    } = iconObj;

    const wrapper = d3.select('#menu-wrapper').append('g')
        .attr('class', 'menu-button-wrapper')
        .attr('id', id);
    setTimeout(() => {
        const {x, y} = pos;
        const iconOffset = -((iconSize * scale) / 2);
        wrapper.append('svg:circle').attr('id', 'menu-circle')
            .style('fill', subItems ? colors.popupSubMenuMain : colors.popupMenuItem)
            .attr('r', 1)
            .attr('cx', x)
            .attr('cy', y)
            .style('opacity', 0)
            .transition()
            .duration(animationDuration)
            .style('pointer-events', 'auto')
            .style('opacity', 1)
            .attr('r', btnRadius)
            .attr('cx', endX)
            .attr('cy', endY);
        wrapper.append('image').attr('id', `${id}-menu-icon`)
            .style('transorm-origin', '50% 50%')
            .style('transform', `translate(${x - 1}px, ${y - 1}px) scale(0.1)`)
            .style('fill', 'white')
            .style('opacity', 0)
            .attr('height', iconSize)
            .attr('width', iconSize)
            .attr('xlink:href', src)
            .transition() // animation to popup the button
            .duration(animationDuration)
            .style('opacity', 1)
            .style('transform',
                `translate(${endX + iconOffset}px, ${endY + iconOffset}px) scale(${scale})`)
            .on('end', () => { // set eventlistener to button after animation
                wrapper.style('cursor', 'pointer')
                    .on('click', function () {
                        setHoverOnContextBtn(() => { MenuOnClick(this, iconObj, subItems, pos, nodeInformation); });
                    })
                    .on('mouseenter', function () { // show hover tooltips
                        showTooltip(this, tooltipKey, tooltipDirection, btnRadius);
                        setHoverOnContextBtn(() => { MenuOnClick(this, iconObj, subItems, pos, nodeInformation); });
                    })
                    .on('mouseleave', () => {
                        setHoverOutContextBtn();
                        if (!contextMenuStatus.subMenuOpen) {
                            d3.select('#menu-button-tooltip').selectAll('#tooltip-content').remove();
                            contextMenuStatus.tooltips = false;
                        }
                    });
            });
    }, delay);
};

export const openMenu = (type, pos, nodeInfo, topologyInfo) => {
    const {
        startAngle, angleOffset, offset,
        items,
    } = contextMenuSettings.type[type];
    const {delayBtwItems} = contextMenuSettings;
    let btnCounter = 0;
    items.forEach((btnObj) => {
        const {
            id, tooltipKey, icon,
            scale,
            conditionsToShow,
            onClick,
            tooltipDirection,
            subItems,
        } = btnObj;
        if (typeof conditionsToShow !== 'undefined') {
            if (!conditionsToShow({...nodeInfo, ...topologyInfo})) {
                return;
            }
        }
        const {preloadIcon} = getGraphData();

        const popupAngle = (startAngle) + (angleOffset * btnCounter);
        const offsetX = Math.cos((popupAngle * Math.PI) / 180) * offset;
        const offsetY = Math.sin((popupAngle * Math.PI) / 180) * offset;
        const iconObj = {
            id,
            tooltipKey,
            endX: pos.x + offsetX,
            endY: pos.y + offsetY,
            src: preloadIcon[icon].src,
            onClick,
            scale,
            tooltipDirection,
            angle: popupAngle,
            radiusBtwMainPopup: offset,
        };
        const nodeInformation = {
            ...nodeInfo,
            ...topologyInfo,
            version: nodeInfo ? nodeInfo.firmwareVersion : '',
            model: nodeInfo ? nodeInfo.model : '',
        };

        drawMenuBtn(pos, delayBtwItems * btnCounter, iconObj, subItems, nodeInformation);
        btnCounter += 1;
    });
};
