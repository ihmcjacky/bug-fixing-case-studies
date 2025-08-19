import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import {getRadioRange} from './tools';

const linkIdTolineId = (linkId) => {
    const id = linkId.split('.').join('');
    return `line${id}`;
};

const channelList = [
    36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108,
    112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165,
];

const channelFor49XXMz = [4940, 4945, 4950, 4955, 4960, 4965, 4970, 4975, 4980, 4985, 4990];

function getRssi(linkData) {
    const nodeA = Object.keys(linkData.nodes)[0];
    const nodeB = Object.keys(linkData.nodes)[1];
    if (linkData.nodes[nodeA].signalLevel === '' || !linkData.nodeAIsManaged) {
        if (linkData.nodes[nodeB].signalLevel === '') return 5;
        return parseInt(linkData.nodes[nodeB].signalLevel.replace(' dBm', ''), 10) + 100;
    } else if (linkData.nodes[nodeB].signalLevel === '' || !linkData.nodeBIsManaged) {
        if (linkData.nodes[nodeA].signalLevel === '') return 5;
        return parseInt(linkData.nodes[nodeA].signalLevel.replace(' dBm', ''), 10) + 100;
    }
    const nodeARssi = parseInt(linkData.nodes[nodeA].signalLevel, 10);
    const nodeBRssi = parseInt(linkData.nodes[nodeB].signalLevel, 10);
    if (nodeARssi > nodeBRssi) return nodeBRssi + 100;
    return nodeARssi + 100;
}

function toGraphData(rssi, range) {
    return [[range[0], 0], [range[1], rssi], [range[2], 0]];
}

function getData(linkInfo) {
    const radioData = [];
    const idList = Object.keys(linkInfo);
    for (let i = 0; i < idList.length; i += 1) {
        const linkData = linkInfo[idList[i]];
        if (linkData.info.frequency) {
            const {channel, channelBandwidth, frequency} = linkData.info;
            const result = getRadioRange(channel, channelBandwidth, frequency);
            const rssi = getRssi(linkData);
            radioData.push({
                id: idList[i],
                rssi,
                range: result,
                graphData: toGraphData(rssi, result),
            });
        }
    }
    return radioData;
}

const margin = {
    top: 30, right: 30, bottom: 40, left: 30,
};
const h = 400 - margin.top - margin.bottom - 50;
const yAxis = d3.scaleLinear()
    .domain([0, 100])
    .range([h, 0]);

const xAxis = d3.scaleLinear();

const draw = (props, t) => {
    const {band} = props;
    const w = document.getElementById('area-wrapper').offsetWidth - margin.left - margin.right;
    // draw the main canvas
    const svg = d3.select('.areaChart')
        .style('padding-left', '10px')
        .style('padding-bottom', '15px')
        .append('svg')
        .attr('height', h + margin.top + margin.bottom + 30)
        .attr('width', `${w}px`)
        .attr('id', 'svg-areaChart')
        .attr('color', 'rgba(33, 33, 33, 0.37)')
        .append('g')
        .attr('id', 'linkChart-mainArea')
        .attr('transform', `translate(${margin.left},${margin.top + 20})`);

    // Y axis
    d3.select('#linkChart-mainArea')
        .append('g')
        .call(
            d3.axisLeft(yAxis)
            .tickSize(w)
            .tickValues([20, 40, 60, 80, 100])
            .tickFormat(d => d - 100)
        )
        .style('color', 'rgba(33, 33, 33, 0.37)')
        .attr('id', 'yAxis')
        .attr('transform', `translate(${w}, 0)`)
        .select('.domain')
        .remove();

    // Y axis tittle
    svg.append('text')
        .attr('id', 'yAxisTittle')
        .attr('text-anchor', 'end')
        .attr('y', -35)
        .attr('x', 15)
        .style('fill', 'rgba(33, 33, 33, 0.37)')
        .style('font-family', 'Roboto')
        .style('font-size', '15px')
        .text('RSSI');
    svg.append('text')
        .attr('id', 'yAxisTittle2')
        .attr('text-anchor', 'end')
        .attr('y', -15)
        .attr('x', 20)
        .style('fill', 'rgba(33, 33, 33, 0.37)')
        .style('font-family', 'Roboto')
        .style('font-size', '15px')
        .text('(dBm)');

    // X axis
    if (band === '5Ghz') {
        xAxis.domain([32, 68, 98, 169]).range([0, w * 0.4, w * 0.4, w]);
        svg.append('g')
            .attr('transform', `translate(0,${h})`)
            .style('color', 'rgba(33, 33, 33, 0.37)')
            .call(
                d3.axisBottom(xAxis)
                    .tickValues(channelList)
            )
            .attr('id', 'xAxis');

        svg.append('text')
            .attr('id', 'xAxisTittle')
            .attr('text-anchor', 'end')
            .attr('y', h + 45)
            .attr('x', w / 2)
            .style('fill', 'rgba(33, 33, 33, 0.37)')
            .style('font-family', 'Roboto')
            .style('font-size', '15px')
            .text(t('channel'));
    } else {
        xAxis.domain([4937, 4993]).range([0, w]);
        svg.append('g')
            .attr('transform', `translate(0,${h})`)
            .style('color', 'rgba(33, 33, 33, 0.37)')
            .call(
                d3.axisBottom(xAxis).tickValues(channelFor49XXMz)
                    .tickFormat(d => `${d}`)
            )
            .attr('id', 'xAxis')
            .style('font-size', '10px');

        svg.append('text')
            .attr('id', 'xAxisTittle')
            .attr('text-anchor', 'end')
            .attr('y', h + 45)
            .attr('x', w / 2)
            .style('fill', 'rgba(33, 33, 33, 0.37)')
            .style('font-family', 'Roboto')
            .style('font-size', '15px')
            .text('Central Frequency');
    }
};

const updateGraph = (props, selectedLink, setSelectedLink, t) => {
    const {linkColorMap, width} = props;
    const w = width === 0 ? document.getElementById('area-wrapper').offsetWidth - margin.left - margin.right :
        width - margin.left - margin.right;

    const radioData = getData(props.data);

    let svg = d3.select('.areaChart');

    if (props.band === '5GHz') {
        svg.select('#xAxisTittle')
        .text(t('channel'));
        xAxis.domain([32, 68, 98, 169]).range([0, w * 0.4, w * 0.4, w]);
        svg.select('#xAxis')
            .call(
                d3.axisBottom(xAxis)
                    .tickValues(channelList)
            );
    } else {
        svg.select('#xAxisTittle')
        .text('Central Frequency');

        xAxis.domain([4937, 4993]).range([0, w]);
        svg.select('#xAxis')
            .call(
                d3.axisBottom(xAxis).tickValues(channelFor49XXMz)
                    .tickFormat(d => `${d}`)
            );
    }

    radioData.sort((l1, l2) => l2.rssi - l1.rssi).forEach(
        (rD, index) => {
            svg = d3.select('.areaChart');
            const areaColor = linkColorMap[rD.id] ? linkColorMap[rD.id] : '#69b3a2';
            let area = svg.select(`#${linkIdTolineId(rD.id)}`);
            if (area.empty() && !props.hiddenLink[rD.id]) {
                svg = d3.select('#linkChart-mainArea');
                svg.append('path')
                .attr('id', linkIdTolineId(rD.id))
                .attr('class', 'area')
                .attr('fill', areaColor)
                .attr('opacity', '.6')
                .attr('z-index', index)
                .datum(rD.graphData)
                .attr('d', d3.area()
                .curve(d3.curveCardinal.tension(0))
                .x(d => xAxis(d[0]))
                .y0(yAxis(0))
                .y1(d => yAxis(d[1])))
                .on('mouseenter', (nodes, zero, elem) => {
                    const pos = elem[0].getBBox();
                    let returnPos = pos.x + pos.width + 40;
                    if (returnPos > document.getElementById('area-wrapper').offsetWidth / 2) {
                        returnPos = pos.x - 450;
                    }
                    d3.select(`#${linkIdTolineId(rD.id)}`)
                        .attr('stroke', 'rgba(0, 174, 239, 1)')
                        .attr('stroke-width', 6)
                        .attr('fill', 'rgba(0, 174, 239, 0.3)');
                    setSelectedLink(rD.id);
                    props.popUpLinkInfoCardOpen(rD.id, returnPos, 100);
                })
                .on('mouseleave', () => {
                    d3.select(`#${linkIdTolineId(rD.id)}`)
                        .attr('stroke-width', 0)
                        .attr('fill', areaColor)
                        .attr('opacity', '.6');
                    setSelectedLink('');
                    props.popUpLinkInfoCardClose();
                });
                area = svg.select(`#${linkIdTolineId(rD.id)}`);
                area.transition()
                    .styleTween('opacity', () => d3.interpolate(0, 0.6))
                    .duration(800);
            } else if (props.hiddenLink[rD.id]) {
                area.remove();
            } else {
                area.data([rD.graphData]);
                area.enter()
                    .append('path')
                    .attr('id', linkIdTolineId(rD.id))
                    .merge(area)
                    .attr('z-index', index)
                    .attr('fill', rD.id === selectedLink ? 'rgba(0, 174, 239, 0.3)' : areaColor)
                    .transition()
                    .duration(800)
                    .attr('d',
                            d3.area().curve(d3.curveCardinal.tension(0))
                                .x(d => xAxis(d[0]))
                                .y0(yAxis(0))
                                .y1(d => yAxis(d[1]))
                        )
                    .style('opacity', '.6');
                area.raise();
            }
        }
    );
};

// for re-size the graph
const reDrawGraph = (props, selectedLink, setSelectedLink, t) => {
    const w = props.width === 0 ?
        document.getElementById('area-wrapper').offsetWidth - margin.left - margin.right :
        props.width - margin.left - margin.right;
    const svg = d3.select('.areaChart');
    d3.select('#svg-areaChart')
        .attr('width', `${w}px`);
    svg.select('#xAxisTittle')
        .attr('x', w / 2);
    d3.select('#yAxis').remove();
    d3.select('#linkChart-mainArea')
        .append('g')
        .call(
            d3.axisLeft(yAxis)
            .tickSize(w)
            .tickValues([20, 40, 60, 80, 100])
            .tickFormat(d => d - 100)
        )
        .style('color', 'rgba(33, 33, 33, 0.37)')
        .attr('id', 'yAxis')
        .attr('transform', `translate(${w}, 0)`)
        .select('.domain')
        .remove();
    updateGraph(props, selectedLink, setSelectedLink, t);
};

const AreaChart = (props) => {
    const {t, ready} = useTranslation('dashboard');

    const [selectedLink, setSelectedLink] = React.useState('');

    const didmountFunc = () => { draw(props, t); };
    useEffect(didmountFunc, []);

    const updateGraphFunc = () => { updateGraph(props, selectedLink, setSelectedLink, t); };
    useEffect(updateGraphFunc, [props.data, props.hiddenLink, props.band]);

    const reDrawGraphFunc = () => { reDrawGraph(props, selectedLink, setSelectedLink, t); };
    useEffect(reDrawGraphFunc, [props.width]);

    return (
        <div
            className="areaChart"
            style={{
                width: `${props.width - 10}px`,
                minWidth: '1000px'
            }}
        />
    );
};

AreaChart.propTypes = {
    shapes: PropTypes.object, /* eslint-disable-line */
    data: PropTypes.object, /* eslint-disable-line */
    width: PropTypes.number, /* eslint-disable-line */
    height: PropTypes.number, /* eslint-disable-line */
    popUpLinkInfoCardOpen: PropTypes.func.isRequired,  /* eslint-disable-line */
    popUpLinkInfoCardClose: PropTypes.func.isRequired,  /* eslint-disable-line */
    linkColorMap: PropTypes.object, /* eslint-disable-line */
    band: PropTypes.string, /* eslint-disable-line */
    hiddenLink: PropTypes.object.isRequired, //eslint-disable-line
};

AreaChart.defaultProps = {
    shapes: {length: 0},
    width: 1600,
    height: 300,
    band: '5Ghz',
};

export default AreaChart;
