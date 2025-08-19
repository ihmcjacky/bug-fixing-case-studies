import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import RainBow from 'rainbowvis.js';
import * as d3 from 'd3';
import {setColorMinMax} from '../../redux/spectrumScan/spectrumScanActions';
import '../../css/spectrumScan.css';
import Constant from '../../constants/common';
// import { easeLinear } from 'd3';


const {themeObj} = Constant;

let svg;
let xScale;
let xScaleCopy;
let xRefScale;
let xLabelScale;
let yScale;
let yScaleCopy;
// let xAxisCall;
let xLabelAxisCall;
let xRefAxisCall;
let yAxisCall;
let yBlockFinalHeight;
let scatter;
let zoom;
let background;
const margin = {
    top: 30,
    right: 0,
    bottom: 50,
    left: 70,
};
const yAxisDomainThreshold = 60;
const lowestFreq = 5180000;
const highestFreq = 5880000;
const lowestPwrLvl = -110;
const highestPwrLvl = -30;

// const freqList = [5170000, 5250000, 5330000, 5490000, 5570000, 5650000, 5735000, 5815000];


function pan() {
    console.log('pan');
    d3.event.preventDefault();
    zoom.translateBy(svg.transition().duration(100), d3.event.wheelDeltaX, d3.event.wheelDeltaY);
}

function handleMouseOver() {
    d3.select(this).style('opacity', '0.9');
}

function handleMouseOut() {
    d3.select(this).style('opacity', '0.3');
}

function tooltipMouseover(d, dspType, freqRange, dspIterations) {
    const element = d3.select('#waterFallMap').node();
    const divWidth = element.getBoundingClientRect().width;
    const divHeight = element.getBoundingClientRect().height;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;
    const eventX = d3.event.pageX;
    let finalTime;
    switch (dspIterations) {
        case 1000:
            finalTime = d.time;
            break;
        case 1500:
            finalTime = d.time * 1.5;
            break;
        case 5000:
            finalTime = d.time * 5;
            break;
        case 13500:
            finalTime = d.time * 13.5;
            break;
        default:
            finalTime = d.time;
    }

    let finalX = d3.event.pageX + 20;
    if (window.innerWidth - 230 < eventX) {
        finalX = d3.event.pageX - 200;
    }
    // console.log('tooltipMouseover d: ', d);
    d3.select('.tooltip')
        .append('div')
        .attr('id', 'tooltipTopContents')
        .html(
            `<div style="padding:3px; text-align:left; display:flex, flex-direction:column">
                <span style="display:flex; padding-bottom:5px">
                    Freq:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">
                        ${d.freq / 1000} MHz
                    </div>
                </span>
                <span style="display:flex; padding-bottom:5px">
                    Power Level:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">
                        ${d[dspType].toFixed(3)} dBm
                    </div>
                </span>
                <span style="display:flex">
                    Times:
                    <div style="color:${themeObj.primary.main}; padding-left:5px; font-weight:500">${finalTime}</div>
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
        .attr('y1', yScaleCopy(d.time + 1) + (yBlockFinalHeight / 2))
        .attr('x2', width)
        .attr('y2', yScaleCopy(d.time + 1) + (yBlockFinalHeight / 2));
    svg.append('line')
        .attr('id', 'tooltipYLine')
        .style('stroke', 'white')
        .attr('x1', xScaleCopy(d.freq) + (xScaleCopy.bandwidth() / 2))
        .attr('y1', 0)
        .attr('x2', xScaleCopy(d.freq) + (xScaleCopy.bandwidth() / 2))
        .attr('y2', height);
}
function tooltipMouseleave() {
    d3.select('.tooltip')
        .style('opacity', 0);
    d3.selectAll('#tooltipTopContents').remove();
    d3.selectAll('#tooltipXLine').remove();
    d3.selectAll('#tooltipYLine').remove();
}


function updateChart(durationWithDsp, freqRange, width, dspIterations) {
    console.log('updateChart: ', dspIterations);
    // fix weird uncontrolled k scale factor when wheel up/down
    d3.event.transform.k = 1;
    // recover the new scale
    // update axes with these new boundaries
    // assign new yscale for tooltip line
    yScaleCopy = d3.event.transform.rescaleY(yScale);
    svg.select('#yAxis')
        .call(d3
            .axisLeft(d3.event.transform.rescaleY(yScale))
            .ticks(durationWithDsp < 10 ? durationWithDsp : 10)
            .tickFormat((n) => {
                switch (dspIterations) {
                    case 1000:
                        return n;
                    case 1500:
                        return n * 1.5;
                    case 5000:
                        return n * 5;
                    case 13500:
                        return n * 13.5;
                    default:
                        return n;
                }
            }))
        .select('.domain')
        .remove();
    svg.select('#yAxis')
        .selectAll('.tick line')
        .attr('x2', width)
        .style('opacity', '0.3')
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // update data position
    scatter
        .selectAll('rect')
        .attr('transform', d3.event.transform);
}

const getRssi = (rssi) => {
    const absRssi = Math.abs(rssi);
    if (absRssi < Math.abs(highestPwrLvl)) {
        return Math.abs(highestPwrLvl);
    }
    if (absRssi > Math.abs(lowestPwrLvl)) {
        return Math.abs(lowestPwrLvl);
    }
    return absRssi;
};


const initGraph = function (_data, dispatch, dspType, freqRange, duration, t, dspIterations) {
    console.log('initGraph Waterfall start');
    // append the svg object to the body of the page
    const element = d3.select('#waterFallMap').node();
    const divWidth = element.getBoundingClientRect().width;
    const divHeight = element.getBoundingClientRect().height;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;
    const yAxisDomainThresholdOverDsp = yAxisDomainThreshold / (dspIterations / 1000);

    // append the svg object to the body of the page
    svg = d3.select('#waterFallMap')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('overflow', 'visible')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set the Pan features: how much you can pan, on which part, and what to do when there is a pan drag event
    zoom = d3.zoom()
        .scaleExtent([1, 1])
        .extent([[0, 0], [width, height]])
        .translateExtent([[0, (duration > yAxisDomainThresholdOverDsp ?
            -(height * ((duration / yAxisDomainThresholdOverDsp) - 1)) : 0)], [width, height]])
        .on('zoom', () => updateChart(duration, freqRange, width, dspIterations));

    // fill black background
    background = svg.append('rect')
        .style('fill', 'black')
        .style('transform', 'translate(-1px, -0.5px)')
        .attr('width', width + 2)
        .attr('height', height)
        .style('pointer-events', 'all')
        // .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(zoom)
        .on('wheel', pan)
        .on('wheel.zoom', null)
        .on('mousedown.zoom', null)
        .on('touchstart.zoom', null)
        .on('touchmove.zoom', null)
        .on('touchend.zoom', null);


    // // set event listener for pan and wheeling up& down
    // svg.append('rect')
    //     .attr('width', width)
    //     .attr('height', height)
    //     .style('fill', 'none')


    let xMarkList;
    let xAxisRegLine = [];
    const xMark = [];
    const xAxisList = [];
    let xInterval;
    if (_data.length === 0) {
        // initial x axis domain and ticks value
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
        // x axis domain and ticks value with api data
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

    // set the channel bounds
    const channelBounds = Constant.channelBounds;
    xAxisRegLine = []
    channelBounds.forEach(channelBound => {
        xAxisRegLine.push(channelBound.start * 1000);
        xAxisRegLine.push(channelBound.end * 1000);
    });

    // set range of the x axis and resolution of axis
    xScale = d3.scaleBand()
        .range([0, width])
        .domain(xAxisList)
        .padding(0);
    xScaleCopy = xScale;

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
    const yAxisList = [0, duration > yAxisDomainThresholdOverDsp ? yAxisDomainThresholdOverDsp : duration];
    yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(yAxisList);
    yScaleCopy = yScale;

    // set y axis label
    yAxisCall = d3
        .axisLeft(yScale)
        .ticks(duration < 10 ? duration : 10)
        .tickFormat((n) => {
            switch (dspIterations) {
                case 1000:
                    return n;
                case 1500:
                    return n * 1.5;
                case 5000:
                    return n * 5;
                case 13500:
                    return n * 13.5;
                default:
                    return n;
            }
        });

    // integrate y axis with y axis call
    svg.append('g')
        .style('font-size', 15)
        .attr('id', 'yAxis')
        .call(yAxisCall)
        .select('.domain')
        .remove();

    // remove y axis label tick line
    svg.select('#yAxis')
        .selectAll('.tick line')
        .attr('x2', width)
        .style('opacity', '0.3')
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // select the yAxis and shift down the label text
    svg.select('#yAxis')
        .selectAll('.tick text')
        .attr('transform', 'translate(-5, 0)');


    // Add a clipPath: everything out of this area won't be drawn.
    svg.append('defs').append('SVG:clipPath')
        .attr('id', 'clip')
        .append('SVG:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

    // Create the scatter variable: where waterfall data take place
    scatter = svg.append('g')
        .attr('clip-path', 'url(#clip)');


    // set color scale
    const rainbow = new RainBow();
    rainbow.setSpectrum('red', 'yellow', 'green', 'cyan', 'blue');
    rainbow.setNumberRange(Math.abs(highestPwrLvl), Math.abs(lowestPwrLvl));
    dispatch(setColorMinMax(lowestPwrLvl, highestPwrLvl));

    // feed data to waterfall
    yBlockFinalHeight = height / (duration > yAxisDomainThresholdOverDsp ? yAxisDomainThresholdOverDsp : duration);
    scatter.selectAll()
        .data(_data, d => `${d.freq}:${d.time}`)
        .enter()
        .append('rect')
        .attr('id', 'graph')
        .attr('x', d => xScale(d.freq))
        .attr('y', d => yScale(d.time + 1))
        .attr('width', xScale.bandwidth())
        .attr('height', yBlockFinalHeight)
        .style('stroke-width', 1)
        .style('stroke', d => `#${rainbow.colorAt(getRssi(d[dspType]))}`)
        .style('fill', d => `#${rainbow.colorAt(getRssi(d[dspType]))}`)
        .style('opacity', 1)
        .on('mouseover', d => tooltipMouseover(d, dspType, freqRange, dspIterations))
        .on('mouseout', tooltipMouseleave)
        .call(zoom)
        .on('wheel', pan)
        .on('wheel.zoom', null)
        .on('mousedown.zoom', null)
        .on('touchstart.zoom', null)
        .on('touchmove.zoom', null)
        .on('touchend.zoom', null);

    // x axis legend and postioning
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${width / 2},${height + margin.top + 15})`)
        .text(t('waterfallXAxisLbl'));

    // y axis legend and postioning
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(-${(margin.left / 2) + 18} , ${(height / 2)})rotate(-90)`)
        .text(t('waterfallYAxisLbl'));

    svg.select('#xRefAxis')
        .raise();
    svg.select('#yAxis')
        .raise();

    // create tooltip
    d3.select('#waterFallMap')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    
    // channel axis legend and postioning
    channelBounds.forEach((channel, index) => {
        const channelCenter = ((channel.start + channel.end) / 2) * 1000;
        console.log('channelCenter')
        console.log(channelCenter)
        console.log(xRefScale(channelCenter))
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


    console.log('kyle_debug: initGraph -> xAxisList', xAxisList);
    console.log('kyle_debug: initGraph -> yAxisList', yAxisList);
    console.log('initGraph Waterfall end');
};
const updateGraph = (graphData, dispatch, dspType, freqRange, duration, dspIterations) => {
    console.log('update waterfall start');
    const element = d3.select('#waterFallMap').node();
    const divWidth = element.getBoundingClientRect().width;
    const divHeight = element.getBoundingClientRect().height;

    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;
    // const durationWithDsp = duration / (dspIterations / 1000);
    const yAxisDomainThresholdOverDsp = yAxisDomainThreshold / (dspIterations / 1000);

    // update the new xScale according to new data
    const xAxisList = [];
    const xAxisRegLine = [];
    const xDisplayMark = [];
    let xDisplayInterval = 0;
    let xMarkList;
    if (graphData.length === 0) {
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
    xScaleCopy = xScale;
    yScaleCopy = yScale;

    // update the new xAxis label according to new data
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

    // select the yAxis and shift down the label text
    svg.select('#yAxis')
        .selectAll('.tick text')
        .attr('transform', 'translate(-5, 0)');

    // update the new yScale according to new data
    const yAxisList = [0, duration > yAxisDomainThresholdOverDsp ? yAxisDomainThresholdOverDsp : duration];
    yScale.domain(yAxisList);

    // update the new yAxis label according to new data
    yAxisCall = d3
        .axisLeft(yScale)
        .ticks(duration < 10 ? duration : 10)
        .tickFormat((n) => {
            switch (dspIterations) {
                case 1000:
                    return n;
                case 1500:
                    return n * 1.5;
                case 5000:
                    return n * 5;
                case 13500:
                    return n * 13.5;
                default:
                    return n;
            }
        });

    // select the yAxis and apply the update
    svg.select('#yAxis')
        .call(yAxisCall)
        .select('.domain')
        .remove();


    // remove y axis label tick line
    svg.select('#yAxis')
        .selectAll('.tick line')
        .attr('x2', width)
        .style('opacity', '0.3')
        .style('color', 'white')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // update the color scale
    const rainbow = new RainBow();
    rainbow.setSpectrum('red', 'yellow', 'green', 'cyan', 'blue');
    rainbow.setNumberRange(Math.abs(highestPwrLvl), Math.abs(lowestPwrLvl));
    dispatch(setColorMinMax(lowestPwrLvl, highestPwrLvl));

    console.log('kyle_debug: initGraph -> xAxisList', xAxisList);
    console.log('kyle_debug: initGraph -> yAxisList', yAxisList);

    // // update the zoom and event listener
    zoom = d3.zoom()
        .scaleExtent([1, 1])
        .extent([[0, 0], [width, height]])
        .translateExtent([[0, (duration > yAxisDomainThresholdOverDsp ?
            -(height * ((duration / yAxisDomainThresholdOverDsp) - 1)) : 0)], [width, height]])
        .on('zoom', () => updateChart(duration, freqRange, width, dspIterations));

    // // set event listener for pan and wheeling up& down
    background
        .call(zoom)
        .on('wheel', pan)
        .on('wheel.zoom', null)
        .on('mousedown.zoom', null)
        .on('touchstart.zoom', null)
        .on('touchmove.zoom', null)
        .on('touchend.zoom', null);

    // remove all graph data and re-draw the data
    scatter.selectAll('#graph').remove();

    yBlockFinalHeight = height / (duration > yAxisDomainThresholdOverDsp ? yAxisDomainThresholdOverDsp : duration);
    scatter.selectAll()
        .data(graphData, d => `${d.freq}:${d.time}`)
        .enter()
        .append('rect')
        .attr('id', 'graph')
        .attr('x', d => xScale(d.freq))
        .attr('y', d => yScale(d.time + 1))
        .attr('width', xScale.bandwidth())
        .attr('height', yBlockFinalHeight)
        .style('stroke-width', 1)
        .style('stroke', d => `#${rainbow.colorAt(getRssi(d[dspType]))}`)
        .style('fill', d => `#${rainbow.colorAt(getRssi(d[dspType]))}`)
        .style('opacity', 1)
        .on('mouseover', d => tooltipMouseover(d, dspType, freqRange, dspIterations))
        .on('mouseout', tooltipMouseleave)
        .on('mouseover', d => tooltipMouseover(d, dspType, freqRange))
        .on('mouseout', tooltipMouseleave);

    // // set event listener for pan and wheeling up& down
    background
        .call(zoom)
        .on('wheel', pan)
        .on('wheel.zoom', null)
        .on('mousedown.zoom', null)
        .on('touchstart.zoom', null)
        .on('touchmove.zoom', null)
        .on('touchend.zoom', null);

    svg.select('#xRefAxis')
        .raise();
    svg.select('#yAxis')
        .raise();

    console.log('update waterfall start end');
};

const SpectrumWaterfallGraph = ({
    dspType, t, fullSizeGraph, needWarning,
    isAnalysisData, setLoader, isLoading,
}) => {
    const [isInit, setIsInit] = useState(false);
    // const [drawing, setDrawing] = useState(false);
    const {
        waterfallGraph, freqRange, duration, dspIterations,
    } = useSelector(store => store.spectrumScan.graphData);
    const dispatch = useDispatch();
    // useEffect(() => {
    //     console.log('waterfall graph setLoader (mount)');
    //     setLoader(true);
    // }, []);

    useEffect(() => {
        if (isInit) {
            console.log('waterfall graph setLoader (data Changed)');
        } else {
            console.log('waterfall graph setLoader (mount)');
        }
        setLoader(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waterfallGraph, dspType, duration, dspIterations, fullSizeGraph]);

    // useEffect(() => {
    //     if (isInit) {
    //         setLoader(true);
    //     }
    // }, [fullSizeGraph, isAnalysisData]);

    useEffect(() => {
        console.log('waterfall graph isLoading useEffect', isLoading);
        if (isLoading) {
            if (isInit) {
                d3.select('#waterFallMap svg').node().remove();
            } else {
                setIsInit(true);
            }
            setTimeout(() => {
                initGraph(waterfallGraph, dispatch, dspType, freqRange, duration, t, dspIterations);
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
            id="waterFallMap"
            style={{
                height: `calc(100vh - ${divHeightDelta}px)`,
                width: '100%',
                margin: '0px 50px',
            }}
        />
    );
};

SpectrumWaterfallGraph.propTypes = {
    t: PropTypes.func.isRequired,
    dspType: PropTypes.string.isRequired,
    fullSizeGraph: PropTypes.bool.isRequired,
    needWarning: PropTypes.bool.isRequired,
    isAnalysisData: PropTypes.bool.isRequired,
    setLoader: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
};


export default SpectrumWaterfallGraph;
