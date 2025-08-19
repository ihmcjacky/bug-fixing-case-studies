import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import {getBitRate} from '../../util/formatConvertor';
import '../../css/rssiLinkGraph.css';

const margin = {
    top: 30, right: 90, bottom: 60, left: 50,
};

const thresholdLinesColorMap = {
    radio0: '#009588',
    radio1: '#FFA400',
    radio2: '#4285F4',
};

const existingLink = [];

const timeRange = 60;

const timeSpacing = 6;

let xAxisEndTime;
let xAxisStartTime;

const tooltipsData = {
    hoverout: true,
};

const getDomain = function (currentTime) {
    const endTime = new Date(currentTime);
    const startTime = d3.timeSecond.offset(endTime, -(timeRange));
    const arr = [startTime];
    xAxisEndTime = endTime;
    xAxisStartTime = startTime;
    return [...arr, endTime];
};

const getDomainValue = function (currentTime) {
    if (currentTime === '') {
        return [];
    }
    const endTime = new Date(currentTime);
    const arr = [];
    for (let i = -(timeRange); i < 0; i += timeSpacing) {
        arr.push(
            d3.timeSecond.offset(endTime, i)
        );
    }
    return [...arr, endTime];
};

const parseRssiData = function (rssi) {
    if (rssi) {
        const returnVal = typeof rssi === 'string' ? parseInt(rssi.replace(' dBm', ''), 10) : rssi;
        return returnVal;
    }
    return null;
};

const inDomain = function (timestamp, lessThan) {
    const compareTime = new Date(timestamp);
    const startTime = new Date(xAxisStartTime);
    const endTime = new Date(xAxisEndTime);
    return lessThan ? compareTime.getTime() >= startTime.getTime() :
        compareTime.getTime() >= startTime.getTime() && compareTime.getTime() <= endTime.getTime();
};

const mouseover = function () {
    tooltipsData.hoverout = false;
    // d3.selectAll('.hoverPoint')
    //     .transition()
    //     // .duration(200)
    //     .style('opacity', 1);
    // d3.select('.tooltipTop')
    //     .transition()
    //     // .duration(200)
    //     .style('opacity', 1);
};

const mouseout = function () {
    tooltipsData.hoverout = true;
    d3.selectAll('.hoverPoint')
        // .transition()
        // .duration(200)
        .style('opacity', 0);
    d3.select('.tooltipTop')
        // .transition()
        // .duration(200)
        .style('opacity', 0);
};

const getData = function (data, selectedRadio, targetIp) {
    let returnData = [];
    if (data[selectedRadio] && data[selectedRadio][targetIp]) {
        const targetData = [...data[selectedRadio][targetIp]];
        let endAt = -1;
        let startAt = -1;
        targetData.some((d, index) => {
            if (inDomain(d.timestamp)) {
                startAt = index;
                return true;
            }
            return false;
        });
        targetData.reverse().some((d, index) => {
            if (inDomain(d.timestamp)) {
                endAt = index;
                return true;
            }
            return false;
        });
        targetData.reverse();
        returnData = [
            ...targetData.slice(startAt, targetData.length - endAt),
        ];
    }
    return returnData;
};

let w;
const h = 600 - margin.top - margin.bottom - 50;
const yAxis = d3.scaleLinear()
    .domain([-100, 0])
    .range([h, 0]);

const xAxis = d3.scaleTime();

const bisectTime = d3.bisector(d => new Date(d.timestamp)).left;

const parseTimeToIndex = (data, targetTime) => {
    let index = -1;
    const timeTemp = new Date(targetTime).toTimeString();
    data.some((d, i) => {
        const dataTimestamp = new Date(d.timestamp).toTimeString();
        if (dataTimestamp === timeTemp) index = i;
        return dataTimestamp === timeTemp;
    });
    return index;
};

const getNearestTime = (data, time) => {
    const i = bisectTime(data, time);
    if (i === 0) {
        return -1;
    }
    const i0 = data[i - 1];
    const i1 = data[i];
    if (!i0 || !i1) return -1;
    const tempI0 = new Date(time) - new Date(i0.timestamp);
    const tempI1 = -(new Date(time) - new Date(i1.timestamp));
    return tempI0 < tempI1 ? i0.timestamp : i1.timestamp;
};

const updateTooltips = function (selectedLink, dataSource, graphWidth, t) {
    d3.selectAll('.hoverPoint').remove();
    d3.selectAll('#tooltipTopContents').remove();
    if (tooltipsData.refTime === -1 || tooltipsData.hoverout) {
        mouseout();
        return;
    }
    let hasDataOnTime = false;
    const tooltipContents = [];
    let highest = -100;

    const time = d3.timeFormat('%H:%M:%S')(new Date(tooltipsData.refTime));
    tooltipContents.push(
        `<div style="padding-bottom: 5px">
            ${t('graphTooltipsTitle')} ${time}
            <div style="font-size: 12px; padding-top: 3px">
                ${dataSource.local ? `<div style="width: 110px; text-align:left; display:inline-block" >
                    <div style="text-align:center; color:rgba(33, 33, 33, 0.37)">
                        ${t('graphTooltipsLabelLocal')}
                    </div>
                </div>` : ''}
                ${dataSource.remote ? `<div style="width: 110px; text-align:right; display:inline-block" >
                    <div style="text-align:center; color:rgba(33, 33, 33, 0.37); font-size: ">
                        ${t('graphTooltipsLabelRemote')}
                    </div>
                </div>` : ''}
            </div>
        </div>`
    );

    let refData = [];
    let refIndex = -1;
    selectedLink.forEach((link) => {
        const {
            colors,
            linkId,
        } = link;
        const data = tooltipsData[linkId];
        const dataIndex = parseTimeToIndex(data, new Date(tooltipsData.refTime));
        if (dataIndex !== -1) {
            hasDataOnTime = true;
            if (refData.length < data.length) {
                refIndex = dataIndex;
                refData = data;
            }
            let localTemp =
                `<div style="width: 110px; height: 54px; padding:3px; text-align:left; display:inline-block" >
                </div>`;
            let remoteTemp =
                `<div style="width: 110px; height: 54px; padding:3px; text-align:right; display:inline-block" >
                </div>`;

            if (data[dataIndex] &&
                parseRssiData(data[dataIndex].rssi.local) && dataSource.local) {
                d3.select('#rssi_mainArea')
                    .append('circle')
                    .datum({...data[dataIndex], timestamp: tooltipsData.time})
                    .attr('class', 'hoverPoint')
                    .attr('cx', () => xAxis(new Date(data[dataIndex].timestamp)))
                    .attr('cy', d => yAxis(parseRssiData(d.rssi.local)))
                    .attr('r', 5)
                    .attr('stroke', colors.local)
                    .attr('stroke-width', 3)
                    .attr('fill', colors.local)
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout);

                if (highest < parseRssiData(data[dataIndex].rssi.lcoal)) {
                    highest = parseRssiData(data[dataIndex].rssi.local);
                }
                localTemp =
                    `<div style="width: 110px; height: 54px; padding:3px; text-align:left; display:inline-block">
                        <div style="text-align:center">
                            <div
                                class="dotLarge"
                                style="background-color:${colors.local};
                                    display:inline-block;
                                    margin-right: 5px;
                                    margin-bottom: 5px"
                            ></div>
                            <div style="color:${colors.local}; display:inline-block">
                                <div >${data[dataIndex].rssi.local}</div>
                                <div style="width: 100%; height: 1px; border-bottom: 1px solid ${colors.local}">
                                </div>
                                <div>${getBitRate(data[dataIndex].bitrate.local)}</div>
                            </div>
                        </div>
                    </div>`;
            }
            if (data[dataIndex] &&
                parseRssiData(data[dataIndex].rssi.remote) && dataSource.remote) {
                d3.select('#rssi_mainArea')
                    .append('circle')
                    .datum({...data[dataIndex], timestamp: tooltipsData.time})
                    .attr('class', 'hoverPoint')
                    .attr('cx', () => xAxis(new Date(data[dataIndex].timestamp)))
                    .attr('cy', d => yAxis(parseRssiData(d.rssi.remote)))
                    .attr('r', 5)
                    .attr('stroke', colors.remote)
                    .attr('stroke-width', 3)
                    .attr('fill', colors.remote)
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout);

                if (highest < parseRssiData(data[dataIndex].rssi.remote)) {
                    highest = parseRssiData(data[dataIndex].rssi.remote);
                }

                remoteTemp =
                `<div style="width: 110px; height: 54px; padding:3px; text-align:right; display:inline-block">
                    <div style="text-align:center">
                        <div
                            class="dotLarge"
                            style="background-color:${colors.remote};
                                display:inline-block;
                                margin-right: 5px;
                                margin-bottom: 5px"
                        ></div>
                        <div style="color:${colors.remote}; display:inline-block">
                            <div >${data[dataIndex].rssi.remote}</div>
                            <div style="width: 100%; height: 1px; border-bottom: 1px solid ${colors.remote}">
                            </div>
                            <div>${getBitRate(data[dataIndex].bitrate.remote)}</div>
                        </div>
                    </div>
                </div>`;
            }
            tooltipContents.push(`<div>
                ${dataSource.local ? localTemp : ''}${dataSource.remote ? remoteTemp : ''}
            </div>`);
        }
    });
    if (!hasDataOnTime || tooltipContents.length < 2) {
        mouseout();
        return;
    }

    let toolTipX = 0;
    if (refData.length < 61) {
        toolTipX = graphWidth - ((((61 - refData.length) + refIndex) / 61) * graphWidth);
    } else {
        toolTipX = ((61 - refIndex) / 61) * graphWidth;
    }

    const toolTipStyle = {};
    if (toolTipX < graphWidth / 2) {
        toolTipStyle.right = toolTipX + 90;
    } else {
        toolTipStyle.right = toolTipX - 295;
    }
    if (highest > -20) {
        toolTipStyle.top = (h * ((highest) / -100)) + 85;
    } else {
        toolTipStyle.top = (h * ((highest) / -100)) - ((tooltipContents.length - 1) * 48);
    }
    d3.select('.tooltipTop')
        .append('div')
        .attr('id', 'tooltipTopContents')
        .style('text-align', 'center')
        .html(
            tooltipContents.join('')
        );
    d3.select('.tooltipTop')
        .style('right', `${toolTipStyle.right}px`)
        .style('top', `${toolTipStyle.top}px`)
        // .transition()
        // .duration(300)
        .style('opacity', 1);

    d3.selectAll('.threshold-line').raise();
    d3.selectAll('.rssi-level-line').raise();
    d3.selectAll('.hoverPoint').raise();
    d3.select('.overlay').raise();
};

const radioOrder = {
    radio0: 0,
    radio1: 1,
    radio2: 2,
};

const sortLineByValueAndRadioNum = (lines) => { // sort all lines by value and radio device
    lines.sort((a, b) => {
        if (a.value === b.value) {
            return radioOrder[b.radio] - radioOrder[a.value];
        }
        return b.value - a.value;
    });
};

const groupTheOverlapLine = (lines) => { // group the line which may has overlap area
    const groupedLine = [{
        lineArr: [lines[0]],
        offset: 0,
    }];
    let currentGp = 0;
    lines.forEach((line, index) => {
        if (index === 0) return;

        if (lines[index - 1].value - line.value < 3) groupedLine[currentGp].lineArr.push(line);
        else {
            currentGp += 1;
            groupedLine.push({
                lineArr: [line],
                offset: 0,
            });
        }
    });
    return groupedLine;
};

const checkThresholdLabelOverlapped = (lines) => {
    sortLineByValueAndRadioNum(lines);

    const groupedLine = groupTheOverlapLine(lines);

    if (groupedLine.length === lines.length) return;
    /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["group", "line"] }] */
    groupedLine.forEach((group) => { // add separate to the line
        const {lineArr} = group;
        if (lineArr.length === 1) return;
        lineArr.forEach((line, index) => {
            if (index === lineArr.length - 1 || !line.show) {
                line.separate = 0;
                return;
            }
            const diff = line.value - lineArr[index + 1].value;
            let transitionY = 0;
            if (line.radio === lineArr[index + 1].radio) {
                lineArr[index + 1].show = false;
                transitionY = -diff * 2;
            } else if (diff === 0) {
                transitionY = 5;
            } else if (diff === 1) {
                transitionY = 3;
            } else if (diff === 2) {
                transitionY = 1;
            }
            line.separate = -transitionY;
            group.offset -= transitionY;
        });
        lineArr.forEach((line) => {
            line.levelOffset = group.offset;
            group.offset -= line.separate * 2;
        });
    });
};

const roundOfRating = num => (parseInt(num, 10) + 0.5);

const updateThresholdLines = (lines) => {
    const wrapper = d3.select('#rssi_mainArea');
    d3.selectAll('.threshold-line').remove();
    checkThresholdLabelOverlapped(lines);

    lines.forEach((line) => {
        const {
            value,
            displayRadio, radio,
            levelOffset, show,
        } = line;
        const lineWrapper = wrapper.append('g')
            .call(
                d3.axisLeft(yAxis)
                    .tickSize(w - margin.left - margin.right)
                    .tickValues([value])
            )
            .style('color', thresholdLinesColorMap[radio])
            .attr('class', 'threshold-line')
            .attr('id', `${radio}-threshold-line`)
            .style('font-size', '12px')
            .on('mouseover', function () {
                d3.select(this).raise();
            });

        const tickWrapper = lineWrapper.selectAll('g.tick');
        tickWrapper.each(function () { // to avoid the line blurry move the y pos must be XX.5
            const thisLine = d3.select(this);
            const currentTransform = thisLine.attr('transform');
            const translateArr = currentTransform.match(/[\d|.|-]+/g);
            thisLine.attr('transform', `translate(${translateArr[0]}, ${roundOfRating(translateArr[1])})`);
        });
        tickWrapper.select('line')
            .attr('transform', `translate(${parseInt(w - margin.left - margin.right, 10)}, 0)`);

        tickWrapper.select('text')
            .attr('class', 'threshold-line-level-text')
            .style('padding-top', '10px')
            .attr('transform', `translate(${w - margin.left - margin.right - -1}, 0)`);
        if (show) {
            tickWrapper.append('text')
                .attr('class', 'threshold-line-key-text')
                .style('padding-top', '10px')
                .attr('transform', `translate(${w - margin.right}, ${3 + levelOffset})`)
                .attr('fill', thresholdLinesColorMap[radio])
                .text(displayRadio);
        }
        d3.select('.domain').remove();
    });
};

const initGraph = (t) => {
    const svg = d3.select('.rssiLineChart')
        .style('padding-left', '10px')
        .style('padding-bottom', '15px')
        .append('svg')
        .attr('height', h + margin.top + margin.bottom + 30)
        .attr('width', `calc(${w}px - 0.5vw - 25px)`)
        .attr('id', 'svg-RssiLineChart')
        .attr('color', 'rgba(33, 33, 33, 0.875)')
        .append('g')
        .attr('id', 'rssi_mainArea')
        .attr('transform', `translate(${margin.left},${margin.top + 20})`);
    // Y axis
    svg.append('g')
        .call(
            d3.axisLeft(yAxis)
            .tickSize(w - margin.left - margin.right)
            .tickValues([-100, -80, -60, -40, -20, 0])
        )
        .style('color', 'rgba(33, 33, 33, 0.875)')
        .attr('id', 'yAxis')
        .style('font-size', '12px');

    d3.selectAll('.rssiLineChart g.tick')
        .select('line')
        .attr('transform', `translate(${w - margin.left - margin.right},0)`)
        .style('opacity', '0.3');

    d3.selectAll('.rssiLineChart g.tick')
        .select('text')
        .style('padding-top', '10px')
        .attr('transform', `translate(${w - margin.left - margin.right - 20},0)`);

    // Y axis tittle
    svg.append('text')
        .attr('id', 'yAxisTittle')
        .attr('text-anchor', 'end')
        .attr('y', -35)
        .attr('x', 15)
        .style('fill', '#4d4d4d')
        .style('font-family', 'Roboto')
        .style('font-size', '15px')
        .attr('transform', 'translate(-25, 0)')
        .text(() => t('graphAxisLabelRSSI'));

    svg.append('text')
        .attr('id', 'yAxisTittle2')
        .attr('text-anchor', 'end')
        .attr('y', -15)
        .attr('x', 20)
        .style('fill', '#4d4d4d')
        .style('font-family', 'Roboto')
        .style('font-size', '15px')
        .attr('transform', 'translate(-25, 0)')
        .text(() => t('graphAxisUnitDbm'));

    svg.append('g')
        .attr('transform', `translate(0,${h + 10})`)
        .style('color', 'rgba(33, 33, 33, 0.875)')
        .attr('id', 'xAxis')
        .style('font-size', '12px')
        .selectAll('text')
        .attr('transform', 'translate(0, 20)');

    // X axis tittle
    svg.append('text')
        .attr('id', 'xAxisTittle')
        .attr('text-anchor', 'end')
        .attr('y', h + 20)
        .attr('x', w / 2)
        .style('fill', '#4d4d4d')
        .style('font-family', 'Roboto')
        .style('font-size', '15px')
        .attr('transform', 'translate(0, 25)')
        .text(() => t('graphAxisUnitTime'));

    d3.select('.rssiLineChart')
        .append('div')
        .attr('class', 'legendMainWrapper')
        .style('position', 'absolute')
        .style('bottom', '0px')
        .style('right', '25px');

    d3.select('.rssiLineChart')
        .append('div')
        .attr('class', 'tooltipTop')
        .style('opacity', 0);
};

const updateGraph = (props, t) => {
    let svg = d3.select('.rssiLineChart');
    const {
        selectedLink,
        dataSource,
        lastTimestamp,
        startTime,
    } = props;
    const currentTime = startTime !== '' ? startTime : lastTimestamp;

    d3.selectAll('.overlay').remove();

    xAxis.domain(getDomain(currentTime))
        .range([0, w - margin.left - margin.right]);
    svg.call(g => g.selectAll('.domain').remove());
    svg.select('#xAxis')
        // .transition()
        // .ease(d3.easeLinear)
        // .duration(1000)
        .call(
            d3.axisBottom(xAxis)
            .tickSize(0)
            .tickFormat(
                d => `${d3.timeFormat('%H:%M:%S')(d)}`
            )
            .tickValues(getDomainValue(currentTime))
        )
        .selectAll('.domain')
        .remove();

    svg.selectAll('.legendWrapper').remove();

    // remove the unselected link
    existingLink.forEach((id) => {
        let targetIndex;
        if (!selectedLink.find((link, index) => {
            if (link.linkId === id) {
                targetIndex = index;
                return true;
            }
            return false;
        })) {
            existingLink.splice(targetIndex, targetIndex);
            svg.select(`#link_${id.split('.').join('')}_local`).remove();
            svg.select(`#link_${id.split('.').join('')}_remote`).remove();
        } else {
            if (!dataSource.local) {
                svg.select(`#link_${id.split('.').join('')}_local`).remove();
            }
            if (!dataSource.remote) {
                svg.select(`#link_${id.split('.').join('')}_remote`).remove();
            }
        }
    });

    if (selectedLink.length === 0) return;
    let refData = [];

    // draw the update link
    selectedLink.forEach((link) => {
        const {
            linkId,
            colors,
            nodeIp,
            mac,
            radio,
        } = link;
        existingLink.push(linkId);
        const data = getData(props.data, radio, nodeIp);
        tooltipsData[linkId] = data;
        if (data.length > refData.length) {
            refData = data;
        }
        const wrapper = d3.select('.legendMainWrapper')
            .append('div')
            .attr('class', 'legendWrapper')
            .style('display', 'inline-block')
            .style('padding-left', '5px');

        let temp;
        if (dataSource.local) {
            temp = wrapper.append('div')
                .style('padding-top', '5px');
            let localLineWrapper = svg.select(`#link_${linkId.split('.').join('')}_local`);
            const localLine = d3.line()
                .defined(d => d.rssi.local !== null && d.rssi.local !== '0')
                .x(d => xAxis(new Date(d.timestamp)))
                .y(d => yAxis(parseRssiData(d.rssi.local)));
            // localLine.curve(d3.curveStepAfter);
            if (localLineWrapper.empty()) {
                const line = d3.line()
                    .defined(d => d.rssi.local !== null)
                    .x(d => xAxis(new Date(d.timestamp)))
                    .y(d => yAxis(parseRssiData(d.rssi.local)));
                // line.curve(d3.curveStepAfter);
                svg = d3.select('#rssi_mainArea');
                svg.append('path')
                    .attr('id', `link_${linkId.split('.').join('')}_local`)
                    .attr('class', 'rssi-level-line')
                    .datum(data.filter(localLine.defined()))
                    .attr('fill', 'none')
                    .attr('stroke', colors.local)
                    .attr('stroke-width', 3)
                    .attr('d', line);

                localLineWrapper = svg.select(`#link_${linkId.split('.').join('')}_local`);
                // localLineWrapper.transition()
                //     .ease(d3.easeLinear)
                //     .duration(1000);
            } else {
                localLineWrapper.data([data]);
                localLineWrapper.enter()
                    .append('path')
                    .attr('class', 'rssi-level-line')
                    .merge(localLineWrapper)
                    .attr('stroke', colors.local)
                    // .transition()
                    // .ease(d3.easeLinear)
                    // .duration(1000)
                    .attr('d', localLine);
            }
            temp.append('div')
                .style('display', 'inline-block')
                .style('background-color', colors.local)
                .style('height', '9px')
                .style('width', '9px')
                .style('border-radius', '50%');
            temp.append('div')
                .style('padding-left', '10px')
                .style('display', 'inline-block')
                .style('color', colors.local)
                .style('font-size', '12px')
                .text(`${props.mac} ${t('graphLegendLabelR')}`);
        }

        if (dataSource.remote) {
            temp = wrapper.append('div')
                .style('padding-top', '5px');
            let remoteLineWrapper = svg.select(`#link_${linkId.split('.').join('')}_remote`);
            const remoteLine = d3.line()
                .defined(d => d.rssi.remote !== null && d.rssi.remote !== '0')
                .x(d => xAxis(new Date(d.timestamp)))
                .y(d => yAxis(parseRssiData(d.rssi.remote)));
            // remoteLine.curve(d3.curveStepAfter);
            if (remoteLineWrapper.empty()) {
                const line = d3.line()
                    .defined(d => d.rssi.remote !== null || d.rssi.remote !== 0 || d.rssi.remote !== -95)
                    .x(d => xAxis(new Date(d.timestamp)))
                    .y(d => yAxis(parseRssiData(d.rssi.remote)));
                // line.curve(d3.curveStepAfter);
                svg = d3.select('#rssi_mainArea');
                svg.append('path')
                    .attr('id', `link_${linkId.split('.').join('')}_remote`)
                    .attr('class', 'rssi-level-line')
                    .datum(data.filter(remoteLine.defined()))
                    .attr('fill', 'none')
                    .attr('stroke', colors.remote)
                    .attr('stroke-width', 3)
                    .attr('d', line);
                remoteLineWrapper = svg.select(`#link_${linkId.split('.').join('')}_remote`);
                // remoteLineWrapper.transition()
                //     .ease(d3.easeLinear)
                //     .duration(1000);
            } else {
                remoteLineWrapper.data([data]);
                remoteLineWrapper.enter()
                    .append('path')
                    .attr('class', 'rssi-level-line')
                    .merge(remoteLineWrapper)
                    .attr('stroke', colors.remote)
                    // .transition()
                    // .ease(d3.easeLinear)
                    // .duration(1000)
                    .attr('d', remoteLine);
            }

            temp.append('div')
                .style('display', 'inline-block')
                .style('background-color', colors.remote)
                .style('height', '9px')
                .style('width', '9px')
                .style('border-radius', '50%');
            temp.append('div')
                .style('padding-left', '10px')
                .style('display', 'inline-block')
                .style('color', colors.remote)
                .style('font-size', '12px')
                .text(`${mac} ${t('graphLegendLabelR')}`);
        }
    });
    // const refData = getData(props.data, props.selectedRadio, selectedLink[0].nodeIp);

    // overlay for finding the tooltip position
    d3.select('#rssi_mainArea')
        .append('rect')
        .attr('class', 'overlay')
        .style('opacity', 0)
        .attr('width', w - margin.left - margin.right)
        .attr('height', h)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mousemove', function () {
            tooltipsData.hoverout = false;
            d3.selectAll('.hoverPoint').remove();
            d3.selectAll('#tooltipTopContents').remove();
            const mousePositX = d3.mouse(this)[0];
            const x0 = new Date(xAxis.invert(mousePositX));
            const refTime = getNearestTime(refData, x0);
            tooltipsData.mousePositX = mousePositX;
            tooltipsData.refTime = refTime;
            // the value used to calucate the tooltip y positson
            const graphWidth = d3.select('.overlay').node().getBoundingClientRect().width;
            updateTooltips(selectedLink, dataSource, graphWidth, t);
        })
        .on('mouseout', mouseout)
        .on('mouseover', mouseover);
    const graphWidth = d3.select('.overlay').node().getBoundingClientRect().width;

    const x0 = new Date(xAxis.invert(tooltipsData.mousePositX));
    const refTime = getNearestTime(refData, x0);
    tooltipsData.refTime = refTime;
    updateTooltips(selectedLink, dataSource, graphWidth, t);
};

const resizeGraph = (props, t) => {
    d3.selectAll('#svg-RssiLineChart').remove();
    d3.selectAll('.legendMainWrapper').remove();
    d3.selectAll('.tooltipTop').remove();
    if (props.animationState === 'entered') {
        w = props.totalWidth * 0.7;
    } else if (props.animationState === 'exited') {
        w = props.totalWidth;
    }
    initGraph(t);
    updateGraph(props, t);
    updateThresholdLines(props.thresholdLines);
};

const RssiLineChart = (props) => {
    const [t, ready] = useTranslation('link-alignment');

    const didmountFunc = () => {
        w = props.totalWidth * 0.7;
        initGraph(t);
    };
    useEffect(didmountFunc, []);
    const updateThresholdLinesListener = () => {
        if (props.stopGraphUpdate) return;
        updateThresholdLines(props.thresholdLines);
    };
    useEffect(updateThresholdLinesListener, [props.thresholdLines]);
    const updateGraphListener = () => {
        if (props.stopGraphUpdate) return;
        updateGraph(props, t);
    };
    useEffect(updateGraphListener, [props.dataSource, props.startTime, props.selectedLink, props.stopGraphUpdate]);
    const resizeGraphListener = () => {
        if (props.stopGraphUpdate) return;
        resizeGraph(props, t);
    };
    useEffect(resizeGraphListener, [props.totalWidth, props.animationState]);

    return (
        <div
            className="rssiLineChart"
            id="rssiLineChart"
            style={{height: '100%', position: 'relative', minWidth: '770px'}}
        />
    );
};

RssiLineChart.propTypes = {
    // dataLength: PropTypes.number.isRequired,
    data: PropTypes.object, /* eslint-disable-line */
    selectedLink: PropTypes.array.isRequired, /* eslint-disable-line */
    // selectedRadio: PropTypes.arrayOf(PropTypes.string).isRequired, /* eslint-disable-line */
    lastTimestamp: PropTypes.string.isRequired, /* eslint-disable-line */
    dataSource: PropTypes.object.isRequired, // eslint-disable-line
    startTime: PropTypes.string.isRequired,
    mac: PropTypes.string.isRequired, // eslint-disable-line
    animationState: PropTypes.string.isRequired,
    totalWidth: PropTypes.number.isRequired, // eslint-disable-line
    stopGraphUpdate: PropTypes.bool.isRequired,
    thresholdLines: PropTypes.arrayOf(PropTypes.shape({
        radio: PropTypes.string,
        displayRadio: PropTypes.string,
        value: PropTypes.number,
    })).isRequired,
};

RssiLineChart.defaultProps = {
    data: {},
};

export default RssiLineChart;
