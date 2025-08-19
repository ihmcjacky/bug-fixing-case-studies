import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import RainBow from 'rainbowvis.js';
import * as d3 from 'd3';
import {setColorMinMax} from '../../redux/spectrumScan/spectrumScanActions';
import '../../css/spectrumScan.css';
import Constant from '../../constants/common';


const {themeObj} = Constant;

let svg;
let xScale;
let xRefScale;
let xLabelScale;
let yScale;
let xLabelAxisCall;
let xRefAxisCall;
let yAxisCall;
// const tooltip;

const margin = {
    top: 30,
    right: 0,
    bottom: 50,
    left: 70,
};
const lowestFreq = 5170000;
const highestFreq = 5815000;
const lowestPwrLvl = -130;
const highestPwrLvl = 0;


const colorArray = ['blue', 'cyan', 'green', 'yellow', 'red'];

function handleMouseOver() {
    d3.select(this).style('opacity', '0.9');
}

function handleMouseOut() {
    d3.select(this).style('opacity', '0.3');
}


function tooltipMouseover(d, t) {
    const element = d3.select('#heatMap').node();
    const divWidth = element.getBoundingClientRect().width;
    const divHeight = element.getBoundingClientRect().height;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;
    const eventX = d3.event.pageX;
    let finalX = d3.event.pageX + 20;
    if (window.innerWidth - 230 < eventX) {
        finalX = d3.event.pageX - 200;
    }
    d3.select('.tooltip')
        .append('div')
        .attr('id', 'tooltipTopContents')
        .html(
            `<div style="padding:3px; text-align:left; display:flex, flex-direction:column">
                <span style="display:flex; padding-bottom:5px">
                    ${t('tooltipTitleFreq')}:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">
                        ${d.freq / 1000} ${t('tooltipUnitMhz')}
                    </div>
                </span>
                <span style="display:flex; padding-bottom:5px">
                    ${t('tooltipTitlePowerLevel')}:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">${d.rssi} ${t('tooltipUnitDbm')}</div>
                </span>
                <span style="display:flex">
                    ${t('tooltipTitleHits')}:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">${d.value}</div>
                </span>
            </div>`);
    d3.select('.tooltip')
        .style('left', `${finalX}px`)
        .style('top', `${d3.event.pageY - 20}px`)
        .style('opacity', 1);
    svg.append('line')
        .attr('id', 'tooltipXLine')
        .style('stroke', 'white')
        .attr('x1', 0)
        .attr('y1', yScale(d.rssi) + (yScale.bandwidth() / 2))
        .attr('x2', width)
        .attr('y2', yScale(d.rssi) + (yScale.bandwidth() / 2));
    svg.append('line')
        .attr('id', 'tooltipYLine')
        .style('stroke', 'white')
        .attr('x1', xScale(d.freq) + (xScale.bandwidth() / 2))
        .attr('y1', 0)
        .attr('x2', xScale(d.freq) + (xScale.bandwidth() / 2))
        .attr('y2', height);
}
function tooltipMouseleave() {
    d3.select('.tooltip')
        .style('opacity', 0);
    d3.selectAll('#tooltipTopContents').remove();
    d3.selectAll('#tooltipXLine').remove();
    d3.selectAll('#tooltipYLine').remove();
}


const initGraph = (data, freqRange, dispatch, t, colorScale) => {
    console.log('init heatmap start');
    const element = d3.select('#heatMap').node();
    const divWidth = element.getBoundingClientRect().width;
    const divHeight = element.getBoundingClientRect().height;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    svg = d3.select('#heatMap')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('overflow', 'visible')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // fill black background
    svg.append('rect')
        .style('fill', 'black')
        .style('opacity', '0.9')
        .style('transform', 'translate(0px, 2px)')
        .attr('width', width)
        .attr('height', `${height - 4}`);

    // set hitList and x axis domain and label
    let hitList = [];
    const xAxisList = [];
    let xMarkList;
    let xAxisRegLine = [];
    const xMark = [];
    let xInterval;
    if (data.length === 0) {
        hitList = [0, 1000];
        for (let j = lowestFreq; j <= highestFreq; j += 10000) {
            xAxisList.push(j);
        }
        xInterval = (highestFreq - lowestFreq) / 10;
        for (let i = lowestFreq; i <= highestFreq; i += xInterval) {
            xMark.push(i);
        }
        for (let k = lowestFreq; k <= highestFreq; k += 15000) {
            xAxisRegLine.push(k);
        }
        xMarkList = [lowestFreq, highestFreq];
    } else {
        hitList = data.map(d => d.value).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        for (let j = freqRange.lower; j <= (freqRange.upper - freqRange.resolution); j += freqRange.resolution) {
            xAxisList.push(j);
        }
        xInterval = (freqRange.upper - freqRange.lower) / 10;
        for (let i = freqRange.lower; i <= freqRange.upper; i += xInterval) {
            xMark.push(i);
        }
        for (let k = freqRange.lower; k <= freqRange.upper; k += 15000) {
            xAxisRegLine.push(k);
        }
        xMarkList = [freqRange.lower, freqRange.upper];
    }
    const uniqueHitList = [...new Set(hitList)];

    // set y axis domain and label
    const yAxisList = [];
    for (let j = lowestPwrLvl; j <= highestPwrLvl; j += 1) {
        yAxisList.push(
            j.toString()
        );
    }
    const yAxisValue = [];
    for (let j = lowestPwrLvl; j <= highestPwrLvl; j += 10) {
        yAxisValue.push(
            j.toString()
        );
    }

    console.log('kyle_debug: initGraph -> data', data);
    console.log('kyle_debug: initGraph -> xAxisList', xAxisList);
    console.log('kyle_debug: initGraph -> hitList', uniqueHitList);
    console.log('kyle_debug: initGraph -> yAxisList', yAxisList);
    console.log('kyle_debug: initGraph -> xAxisRegLine', xAxisRegLine);
    
    // set the channel bounds
    const channelBounds = Constant.channelBounds;
    xAxisRegLine = []
    channelBounds.forEach(channelBound => {
        xAxisRegLine.push(channelBound.start * 1000);
        xAxisRegLine.push(channelBound.end * 1000);
    });

    // set range of the x data axis and resolution of axis
    xScale = d3.scaleBand()
        .range([0, width])
        .domain(xAxisList)
        .padding(0.05);

    // set range of the x Ref line axis and resolution of axis
    xRefScale = d3.scaleLinear()
        .range([0, width])
        .domain(xMarkList);


    // set range of the x Label axis and resolution of axis
    xLabelScale = d3.scaleLinear()
        .range([0, width])
        .domain(xMarkList);

    // set x axis label
    xLabelAxisCall = d3.axisBottom(xLabelScale)
        .tickSize(0)
        .tickValues(xMark)
        .tickFormat(n => n / 1000);

    // offset x axis to a L shape Heatmap and integrate with x axis scall
    svg.append('g')
        .style('font-size', 15)
        .attr('transform', `translate(0,${height})`)
        .attr('id', 'xLabelAxis')
        .call(xLabelAxisCall)
        .select('.domain')
        .remove();

    // select the xAxis and shift down the label text
    svg.select('#xLabelAxis')
        .selectAll('.tick text')
        .attr('transform', 'translate(0, 5)');

    // set x Axis Ref Line
    console.log('xAxisRegLine: ', xAxisRegLine);
    xRefAxisCall = d3.axisBottom(xRefScale)
        .tickSize(0)
        .tickValues(xAxisRegLine)
        .tickFormat(() => '');

    // offset x axis to a L shape Heatmap and integrate with x axis scall
    svg.append('g')
        .style('font-size', 15)
        .attr('transform', `translate(0,${height})`)
        .attr('id', 'xRefAxis')
        .call(xRefAxisCall)
        .select('.domain')
        .remove();

    // set xAxis Grid Line
    svg.select('#xRefAxis')
        .selectAll('.tick line')
        .attr('y2', height)
        .attr('transform', `translate(0, -${height})`)
        .style('opacity', (d, i, a) => {
            if (i === 0 || (i === a.length - 1 && d === freqRange.upper)) {
                return 0;
            }
            return 0.3;
        })
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // set range of the y axis and resolution of axis
    yScale = d3.scaleBand()
        .range([height, 0])
        .domain(yAxisList)
        .padding(0.05);

    // set y axis label
    yAxisCall = d3.axisLeft(yScale)
        .tickSize(0)
        .tickValues(yAxisValue);

    // integrate y axis with y axis call
    svg.append('g')
        .style('font-size', 15)
        .attr('id', 'yAxis')
        .call(yAxisCall)
        .select('.domain')
        .remove();

    // select the yAxis and shift down the label text
    svg.select('#yAxis')
        .selectAll('.tick text')
        .attr('transform', 'translate(-5, 0)');

    svg.select('#yAxis')
        .selectAll('.tick line')
        .attr('x2', width)
        .style('opacity', '0.3')
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // set color scale
    const rainbow = new RainBow();
    rainbow.setSpectrumByArray(colorArray.slice(colorScale[0], colorScale[1] + 1).reverse());
    rainbow.setNumberRange(uniqueHitList[0], uniqueHitList[uniqueHitList.length - 1]);
    dispatch(setColorMinMax(uniqueHitList[0], uniqueHitList[uniqueHitList.length - 1]));


    // feed data to heatmap
    svg.selectAll()
        .data(data.filter(d => d.rssi >= -130), d => `${d.freq}:${d.rssi}`)
        .enter()
        .append('rect')
        .attr('id', 'graph')
        .attr('x', d => xScale(d.freq))
        .attr('y', d => yScale(d.rssi))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('stroke-width', 1)
        .style('stroke', d => `#${rainbow.colorAt(uniqueHitList[uniqueHitList.length - 1] - d.value)}`)
        .style('fill', d => `#${rainbow.colorAt(uniqueHitList[uniqueHitList.length - 1] - d.value)}`)
        .style('opacity', 1)
        .on('mouseover', (e) => {tooltipMouseover(e, t)})
        .on('mouseout', tooltipMouseleave);

    // y axis legend and postioning
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(-${(margin.left / 2) + 18} , ${(height / 2)})rotate(-90)`)
        .text(t('waveformYAxisLbl'));

    // x axis legend and postioning
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${width / 2},${height + margin.top + 15})`)
        .text(t('waveformXAxisLbl'));

    svg.select('#xRefAxis')
        .raise();
    svg.select('#yAxis')
        .raise();

    // create tooltip
    d3.select('#heatMap').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // channel axis legend and postioning
    channelBounds.forEach((channel, index) => {
        const channelCenter = ((channel.start + channel.end) / 2) * 1000;
        svg.append('text')
            .attr('x', xRefScale(channelCenter))
            .attr('y', -5)
            .style('text-anchor', 'middle')
            .style('font-size', '15px')
            .text(`${channel.channel}`)
    });

    // channel axis legend and postioning
    svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, -30)`)
    .text(t('channelLbl'));

    console.log('init heatmap end');
};

const updateGraph = (graphData, freqRange, dispatch, colorScale, t) => {
    console.log('update heatmap start');
    const element = d3.select('#heatMap').node();
    const divHeight = element.getBoundingClientRect().height;
    const height = divHeight - margin.top - margin.bottom;

    // update the new xScale according to new data
    const xAxisList = [];
    const xAxisRegLine = [];
    const xDisplayMark = [];
    let xMarkList;
    let hitList = [];
    let xDisplayInterval = 0;
    if (graphData.length === 0) {
        hitList = [0, 1000];
        for (let j = lowestFreq; j <= highestFreq; j += 10000) {
            xAxisList.push(j);
        }
        xDisplayInterval = (highestFreq - lowestFreq) / 10;
        for (let i = lowestFreq; i <= highestFreq; i += xDisplayInterval) {
            xDisplayMark.push(i);
        }
        for (let k = lowestFreq; k <= highestFreq; k += 15000) {
            xAxisRegLine.push(k);
        }
        xMarkList = [lowestFreq, highestFreq];
    } else {
        hitList = graphData.map(d => d.value).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        for (let j = freqRange.lower; j <= (freqRange.upper - freqRange.resolution); j += freqRange.resolution) {
            xAxisList.push(j);
        }
        xDisplayInterval = (freqRange.upper - freqRange.lower) / 10;
        for (let l = freqRange.lower; l <= freqRange.upper; l += xDisplayInterval) {
            xDisplayMark.push(l);
        }
        for (let k = freqRange.lower; k <= freqRange.upper; k += 15000) {
            xAxisRegLine.push(k);
        }
        xMarkList = [freqRange.lower, freqRange.upper];
    }
    xScale.domain(xAxisList);
    xRefScale.domain(xMarkList);
    xLabelScale.domain(xMarkList);

    console.log('kyle_debug: initGraph -> freqRange.upper', (freqRange.upper - freqRange.resolution));
    // console.log('kyle_debug: initGraph -> xActualInterval', xActualInterval);
    console.log('kyle_debug: initGraph -> xDisplayInterval', xDisplayInterval);
    console.log('kyle_debug: initGraph -> xAxisList', xAxisList);
    // console.log('kyle_debug: initGraph -> xMark', xActualMark);
    console.log('kyle_debug: initGraph -> xMark', xDisplayMark);
    console.log('kyle_debug: initGraph -> xAxisRegLine', xAxisRegLine);

    // reassign x Label Axis
    xLabelAxisCall
        .tickSize(0)
        .tickValues(xDisplayMark)
        .tickFormat(n => n / 1000);

    // select the xAxis and apply the update
    svg.select('#xLabelAxis')
        .call(xLabelAxisCall)
        .select('.domain')
        .remove();

    // select the xAxis and shift down the label text
    svg.select('#xLabelAxisCall')
        .selectAll('.tick text')
        .attr('transform', 'translate(0, 5)');

    // reassign x RefLine Axis
    xRefAxisCall
        .tickSize(0)
        .tickValues(xAxisRegLine)
        .tickFormat(() => '');

    // offset x axis to a L shape Heatmap and integrate with x axis scall
    svg.select('#xRefAxis')
        .call(xRefAxisCall)
        .select('.domain')
        .remove();

    svg.select('#xRefAxis')
        .selectAll('.tick line')
        .attr('y2', height)
        .attr('transform', `translate(0, -${height})`)
        .style('opacity', (d, i, a) => {
            if (i === 0 || (i === a.length - 1 && d === freqRange.upper)) {
                return 0;
            }
            return 0.3;
        })
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // update the color scale
    const uniqueHitList = [...new Set(hitList)];
    console.log('kyle_debug: updateGraph -> uniqueHitList', uniqueHitList);
    const rainbow = new RainBow();
    rainbow.setSpectrumByArray(colorArray.slice(colorScale[0], colorScale[1] + 1).reverse());
    rainbow.setNumberRange(uniqueHitList[0], uniqueHitList[uniqueHitList.length - 1]);
    dispatch(setColorMinMax(uniqueHitList[0], uniqueHitList[uniqueHitList.length - 1]));

    // remove all graph data and re-draw the data
    svg.selectAll('#graph').remove();

    svg.selectAll('#graph')
        .data(graphData.filter(d => d.rssi >= -130), d => `${d.freq}:${d.rssi}`)
        .enter()
        .append('rect')
        .attr('id', 'graph')
        .attr('x', d => xScale(d.freq))
        .attr('y', d => yScale(d.rssi))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('stroke-width', 1)
        .style('stroke', d => `#${rainbow.colorAt(uniqueHitList[uniqueHitList.length - 1] - d.value)}`)
        .style('fill', d => `#${rainbow.colorAt(uniqueHitList[uniqueHitList.length - 1] - d.value)}`)
        .style('opacity', 1)
        .on('mouseover', (e) => {tooltipMouseover(e, t)})
        .on('mouseout', tooltipMouseleave);

    svg.select('#xRefAxis')
        .raise();
    svg.select('#yAxis')
        .raise();
    console.log('update heatmap end');
};

const SpectrumHeatmapGraph = ({
    t, colorScale, fullSizeGraph, needWarning,
    isAnalysisData, setLoader, isLoading,
}) => {
    const dispatch = useDispatch();
    const [isInit, setIsInit] = useState(false);
    const {waveformGraph, freqRange} = useSelector(store => store.spectrumScan.graphData);

    // useEffect(() => {
    //     console.log('heatMap graph setLoader (mount)');
    //     setLoader(true);
    // }, []);

    useEffect(() => {
        if (isInit) {
            console.log('heatMap graph setLoader (data Changed)');
        } else {
            console.log('heatMap graph setLoader (mount)');
        }
        setLoader(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waveformGraph, colorScale, fullSizeGraph, isAnalysisData]);

    useEffect(() => {
        console.log('heatMap graph isLoading useEffect', isLoading);
        if (isLoading) {
            if (isInit) {
                d3.select('#heatMap svg').node().remove();
            } else {
                setIsInit(true);
            }
            setTimeout(() => {
                initGraph(waveformGraph, freqRange, dispatch, t, colorScale);
                setLoader(false);
            }, 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    // eslint-disable-next-line no-mixed-operators
    const divHeightDelta = 486 - (fullSizeGraph ? 305 : 0) +
        ((needWarning && !fullSizeGraph) ? 56 : 0) + (isAnalysisData ? 78 : 0);

    return (
        <div
            id="heatMap"
            style={{
                height: `calc(100vh - ${divHeightDelta}px)`,
                width: '100%',
                margin: '0px 50px',
            }}
        />
    );
};

SpectrumHeatmapGraph.propTypes = {
    t: PropTypes.func.isRequired,
    colorScale: PropTypes.arrayOf(PropTypes.number).isRequired,
    fullSizeGraph: PropTypes.bool.isRequired,
    needWarning: PropTypes.bool.isRequired,
    isAnalysisData: PropTypes.bool.isRequired,
    setLoader: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
};


export default SpectrumHeatmapGraph;
