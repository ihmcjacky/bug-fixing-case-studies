/* eslint-disable no-unused-vars */
import React, {useEffect} from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const margin = {
    left: 14, right: 30, top: 10, bottom: 10,
};
const colorMap = {
    inRange: '#425581',
    outRange: '#C1C1C4',
};
const triangleSize = 14;
const triangleLabelOffset = triangleSize / 2;
const lineWidth = 2;
const gapWidth = 50;
let containerWidth;
let sliderYPos;
let sliderWidth;
let mainWrapper;
let lastLablePosX;
const step = 80;
const range = [5170, 5815];
const gap = [5330, 5490, 5730, 5735];
let gapBoundX = [];
const thumbDargObj = {
    disabled: false,
    draging: false,
    startAt: 0,
    thumb1PosX: 0,
    thumb2PosX: 0,
    thumb1Value: 0,
    thumb2Value: 0,
};
let sliderLinearGradientPart1;
let sliderLinearGradientPart2;
let sliderLinearGradientPart3;
let hiddenEndPointX;

const triangleLabel = {
    draw: (context, size) => {
        context.moveTo(0, 0);
        context.lineTo(size, 0);
        context.lineTo(size / 2, size);
        context.closePath();
    },
};

const drawLine = (startX, endX, startY, endY) => `M${startX},${startY} h${endX} v${endY} h${-endX}`;

const drawLabel = (wrapper, label, posX, poxY = 0) => wrapper.append('text')
    .attr('class', 'text-label')
    .attr('font-family', 'Roboto')
    .style('font-size', 12)
    .style('fill', colorMap.outRange)
    .style('transform', `translate(${posX}px, ${poxY}px)`)
    .text(label);

const parseRangeValueToPosX = (value) => {
    const startX = margin.left;
    const endX = containerWidth - margin.right;
    if (value === range[0]) return startX;
    else if (value === range[1]) return endX;

    let gpIdx = 0;
    gapBoundX.some((gp, idx) => {
        if (value <= gp.endAtRange) {
            gpIdx = idx;
            return true;
        }
        return false;
    });
    const {
        startAtRange, startAt,
        endAtRange, endAt,
        totalWidth,
    } = gapBoundX[gpIdx];
    if (value === startAtRange) return startAt;
    else if (value === endAtRange) return endAt;

    const totalRange = endAtRange - startAtRange;
    const valueDiff = value - startAtRange;
    const percentage = valueDiff / totalRange;
    const widthDiff = totalWidth * percentage;
    return startAt + widthDiff;
};

const getNearest80MHzPoint = (startX, endX, releasePosX, moveToRight, anotherThumbPosX) => {
    if (releasePosX <= startX) {
        return {
            posValue: range[0],
            posX: startX,
        };
    } else if (releasePosX >= endX) {
        return {
            posValue: range[1],
            posX: gapBoundX[gapBoundX.length - 1].endAt,
        };
    }

    let gpIdx = 0;
    gapBoundX.some((obj, idx) => {
        if ((moveToRight && obj.endAt >= releasePosX) || (!moveToRight && obj.endAt > releasePosX)) {
            gpIdx = idx;
            return true;
        }
        return false;
    });
    const inGap = gpIdx % 2 === 1;
    let nearestValue = range[0];
    let nearestPosX;
    if (moveToRight) {
        nearestPosX = gapBoundX[gpIdx].startAt;
        if (inGap) {
            /*
                s: start point
                *: release point
                v: another thumb
                $: final position
                |--v------s--...*...-----$-----------------|
            */
            nearestValue = gapBoundX[gpIdx].endAtRange + step || range[1];
            nearestPosX = gapBoundX[gpIdx].endAt + gapBoundX[gpIdx + 1].widthPer80HMz;
            if (releasePosX < anotherThumbPosX) {
                /*
                    s: start point
                    *: release point
                    v: another thumb
                    $: final position
                    |---------s--...*...$---------------v-------|
                */
                nearestValue = gapBoundX[gpIdx + 1].startAtRange || range[1];
                nearestPosX = gapBoundX[gpIdx + 1].startAt;
            }
        } else {
            const {
                startAt,
                widthPer80HMz,
                startAtRange,
                endAtRange,
            } = gapBoundX[gpIdx];
            let counter = gpIdx === 0 || anotherThumbPosX > nearestPosX ? 0 : 1;
            let findMargin = false;
            while (!findMargin) {
                if (startAt + (widthPer80HMz * counter) + 20 > releasePosX) {
                    // fine the nearest 80HMz
                    nearestValue = startAtRange + (step * counter);
                    nearestPosX = startAt + (widthPer80HMz * counter);
                    if (nearestValue === endAtRange &&
                        (releasePosX < anotherThumbPosX && anotherThumbPosX.toFixed(0) !== nearestPosX.toFixed(0))) {
                        /*
                            s: start point
                            *: release point
                            v: another thumb
                            $: final position
                            |---------s--*....$---------------v-------|
                        */
                        const nextGp = gapBoundX[gpIdx + 1];
                        nearestValue = nextGp.endAtRange;
                        nearestPosX = nextGp.endAt;
                    }
                    findMargin = true;
                } else {
                    counter += 1;
                }
            }
        }
    } else {
        nearestPosX = gapBoundX[gpIdx].endAt;
        if (inGap) {
            nearestValue = gapBoundX[gpIdx].startAtRange || range[0];
            nearestPosX = gapBoundX[gpIdx].startAt;
            if (releasePosX < anotherThumbPosX) {
                nearestValue = gapBoundX[gpIdx - 1].endAtRange - step || range[1];
                nearestPosX = gapBoundX[gpIdx - 1].endAt - gapBoundX[gpIdx - 1].widthPer80HMz;
            }
        } else {
            const {
                endAt,
                widthPer80HMz,
                endAtRange,
                startAtRange,
            } = gapBoundX[gpIdx];
            let counter = gpIdx === gapBoundX.length - 1 || anotherThumbPosX < nearestPosX ? 0 : 1;
            let findMargin = false;
            while (!findMargin) {
                if (endAt - (widthPer80HMz * counter) - 20 < releasePosX) {
                    nearestValue = endAtRange - (step * counter);
                    nearestPosX = endAt - (widthPer80HMz * counter);
                    if (nearestValue === startAtRange && gpIdx !== 0 &&
                        (releasePosX > anotherThumbPosX && anotherThumbPosX.toFixed(0) !== nearestPosX.toFixed(0))) {
                        const previousGp = gapBoundX[gpIdx - 1];
                        nearestValue = previousGp.startAtRange;
                        nearestPosX = previousGp.startAt;
                    }
                    findMargin = true;
                } else {
                    counter += 1;
                }
            }
        }
    }
    return {
        posValue: nearestValue,
        posX: nearestPosX,
    };
};

/*
        out range          in range           out range
    |-----black-------|---------blue------|-----black-------|
id: 0%-------'lower-start/end'-----'upper-start/end'------100%
*/
const genLinearGradient = (wrapper, id) => {
    const linearGradient = wrapper.append('linearGradient')
        .attr('id', id);
    linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorMap.outRange);
    linearGradient.append('stop')
        .attr('id', 'lower-start')
        .attr('offset', '0%')
        .attr('stop-color', colorMap.outRange);
    linearGradient.append('stop')
        .attr('id', 'lower-end')
        .attr('offset', '100%')
        .attr('stop-color', colorMap.inRange);
    linearGradient.append('stop')
        .attr('id', 'upper-start')
        .attr('offset', '100%')
        .attr('stop-color', colorMap.inRange);
    linearGradient.append('stop')
        .attr('id', 'upper-end')
        .attr('offset', '100%')
        .attr('stop-color', colorMap.outRange);
    linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorMap.outRange);
    return linearGradient;
};

const fillInColor = (linearGradient, {lowerPartOffset, upperPartOffset}, needAnimation) => {
    linearGradient.select('#lower-start')
        .transition()
        .duration(needAnimation ? 200 : 0)
        .attr('offset', lowerPartOffset);
    linearGradient.select('#lower-end')
        .transition()
        .duration(needAnimation ? 200 : 0)
        .attr('offset', lowerPartOffset);
    linearGradient.select('#upper-start')
        .transition()
        .duration(needAnimation ? 200 : 0)
        .attr('offset', upperPartOffset);
    linearGradient.select('#upper-end')
        .transition()
        .duration(needAnimation ? 200 : 0)
        .attr('offset', upperPartOffset);
};

const calPartPrecentage = (boundObj, lowerThumbPosX, upperThumbPosX) => {
    let lowerPartOffset = 0;
    let upperPartOffset = 100;
    const {startAt, endAt, totalWidth} = boundObj;
    if ((lowerThumbPosX - startAt) >= totalWidth) {
        lowerPartOffset = 100;
    } else if ((lowerThumbPosX <= startAt)) {
        lowerPartOffset = 0;
    } else {
        lowerPartOffset = ((lowerThumbPosX - startAt) / totalWidth) * 100;
    }

    if (upperThumbPosX <= startAt) {
        upperPartOffset = 0;
    } else if (upperThumbPosX >= endAt) {
        upperPartOffset = 100;
    } else {
        upperPartOffset = ((upperThumbPosX - startAt) / totalWidth) * 100;
    }

    return {
        lowerPartOffset: `${lowerPartOffset}%`,
        upperPartOffset: `${upperPartOffset}%`,
    };
};

const updateSliderColor = (withAnimation) => {
    const {thumb1PosX, thumb2PosX} = thumbDargObj;
    const upperPosX = thumb2PosX;
    const lowerPosX = thumb1PosX;
    const part1Source = gapBoundX[0];
    const part2Source = gapBoundX[2];
    const part3Source = gapBoundX[4];
    fillInColor(sliderLinearGradientPart1, calPartPrecentage(part1Source, lowerPosX, upperPosX), withAnimation);
    fillInColor(sliderLinearGradientPart2, calPartPrecentage(part2Source, lowerPosX, upperPosX), withAnimation);
    fillInColor(sliderLinearGradientPart3, calPartPrecentage(part3Source, lowerPosX, upperPosX), withAnimation);
};

const initSlider = (thumbValue, dragEndFunc) => {
    const container = d3.select('#freq-range-slider-container').append('svg')
        .attr('id', 'svg')
        .attr('width', '100%')
        .attr('height', '100%');
    mainWrapper = container.append('g')
            .attr('id', 'mainArea')
            .attr('width', '100%')
            .attr('height', '100%');

    const {width, height} = container.node().getBoundingClientRect();
    containerWidth = width;

    sliderYPos = parseInt(height / 2, 10);
    const lineStartX = margin.left;
    const lineEndX = width - margin.right;
    const numberOfGap = Math.ceil(gap.length / 2);
    const totalWidth = lineEndX - lineStartX;
    const totalWidthWithoutGap = totalWidth - (numberOfGap * gapWidth);
    const [lower, upper] = range;
    const fullRange = upper - lower;
    const fullRangeWithoutGap = fullRange - 160 - 5;

    function getNearestThumb(releasePosX) {
        const {thumb1PosX, thumb2PosX} = thumbDargObj;
        let isOne;
        let nearestThumbPos;
        let anotherThumbPosX;
        if (thumb1PosX === thumb2PosX) {
            isOne = releasePosX <= thumb1PosX;
            nearestThumbPos = thumb2PosX;
            anotherThumbPosX = thumb1PosX;
        } else if (Math.abs(thumb1PosX - releasePosX) < Math.abs(thumb2PosX - releasePosX)) {
            isOne = true;
            nearestThumbPos = thumb1PosX;
            anotherThumbPosX = thumb2PosX;
        } else {
            isOne = false;
            nearestThumbPos = thumb2PosX;
            anotherThumbPosX = thumb1PosX;
        }
        return {
            isOne,
            nearestThumbPos,
            anotherThumbPosX,
        };
    }

    function sliderAreaClick() {
        if (thumbDargObj.disabled) return;
        const releasePosX = d3.event.offsetX;
        const {isOne, nearestThumbPos, anotherThumbPosX} = getNearestThumb(releasePosX);
        const {posValue, posX} = getNearest80MHzPoint(
            lineStartX, lineEndX, releasePosX, nearestThumbPos <= releasePosX, anotherThumbPosX);

        if (isOne) {
            d3.select('#thumb-one').raise();
            thumbDargObj.thumb1PosX = posX;
            thumbDargObj.thumb1Value = posValue;
        } else {
            d3.select('#thumb-two').raise();
            thumbDargObj.thumb2PosX = posX;
            thumbDargObj.thumb2Value = posValue;
        }
        dragEndFunc([thumbDargObj.thumb1Value, thumbDargObj.thumb2Value]);
    }

    function lableOnClick(value) {
        if (thumbDargObj.disabled) return;
        const pos = parseRangeValueToPosX(value);
        const {isOne, nearestThumbPos, anotherThumbPosX} = getNearestThumb(pos);
        const {posValue, posX} = getNearest80MHzPoint(
            lineStartX, lineEndX, pos, nearestThumbPos <= pos, anotherThumbPosX);
        if (isOne) {
            d3.select('#thumb-one').raise();
            thumbDargObj.thumb1PosX = posX;
            thumbDargObj.thumb1Value = posValue;
        } else {
            d3.select('#thumb-two').raise();
            thumbDargObj.thumb2PosX = posX;
            thumbDargObj.thumb2Value = posValue;
        }
        dragEndFunc([thumbDargObj.thumb1Value, thumbDargObj.thumb2Value]);
    }

    // event listener area
    mainWrapper.append('path')
        .attr('d', drawLine(lineStartX, width - margin.right - margin.left, sliderYPos - 10, 11))
        .style('fill', 'rgba(0, 0, 0, 0)')
        .on('click', sliderAreaClick);

    const gapWrapper = mainWrapper.append('g').attr('id', 'gap-wrapper');
    const pathWrapper = mainWrapper.append('g').attr('id', 'path-wrapper');
    const labelWrapper = mainWrapper.append('g').attr('id', 'label-wrapper')
        .attr('transform', `translate(0, ${sliderYPos + 15})`)
        .style('user-select', 'none');

    let currentX = lineStartX;
    // draw 5170 - 5330
    let tempLength = ((5330 - 5170) / fullRangeWithoutGap) * totalWidthWithoutGap;
    sliderLinearGradientPart1 = genLinearGradient(pathWrapper, 'sliderPart1');

    pathWrapper.append('path')
        .attr('d', drawLine(currentX, tempLength, sliderYPos, 1))
        .attr('stroke', 'url(#sliderPart1)')
        .attr('fill', 'none')
        .on('click', sliderAreaClick);
    drawLabel(labelWrapper, 5170, 0)
        .on('click', () => { lableOnClick(5170); });
    drawLabel(labelWrapper, 5250, tempLength / 2)
        .on('click', () => { lableOnClick(5250); });
    drawLabel(labelWrapper, 5330, tempLength)
        .on('click', () => { lableOnClick(5330); });
    gapBoundX.push({
        startAtRange: 5170,
        startAt: currentX,
        endAtRange: 5330,
        totalWidth: tempLength,
        endAt: currentX += tempLength,
        widthPer80HMz: tempLength / 2,
    });

    // draw 160MHz gap
    gapWrapper.append('line')
        .attr('x1', currentX)
        .attr('x2', currentX + gapWidth)
        .attr('y1', sliderYPos + 0.5)
        .attr('y2', sliderYPos + 0.5)
        .style('stroke', colorMap.outRange)
        .style('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .style('stroke-dasharray', '1 4')
        .on('click', sliderAreaClick);

    gapBoundX.push({
        startAtRange: 5330,
        startAt: currentX,
        endAtRange: 5490,
        totalWidth: gapWidth,
        endAt: currentX += gapWidth,
        isGap: true,
    });

    sliderLinearGradientPart2 = genLinearGradient(pathWrapper, 'sliderPart2');

    // draw 5490 - 5730
    tempLength = ((5730 - 5490) / fullRangeWithoutGap) * totalWidthWithoutGap;
    pathWrapper.append('path')
        .attr('d', drawLine(currentX, tempLength, sliderYPos, 1))
        .attr('stroke', 'url(#sliderPart2)')
        .attr('fill', 'none')
        .on('click', sliderAreaClick);

    drawLabel(labelWrapper, 5490, currentX - margin.left)
        .on('click', () => { lableOnClick(5490); });
    drawLabel(labelWrapper, 5570, (currentX - margin.left) + (tempLength / 3))
        .on('click', () => { lableOnClick(5570); });
    drawLabel(labelWrapper, 5650, (currentX - margin.left) + ((tempLength / 3) * 2))
        .on('click', () => { lableOnClick(5650); });
    drawLabel(labelWrapper, 5730, (currentX - margin.left) + tempLength)
        .on('click', () => { lableOnClick(5730); });

    gapBoundX.push({
        startAtRange: 5490,
        startAt: currentX,
        endAtRange: 5730,
        totalWidth: tempLength,
        endAt: currentX += tempLength,
        widthPer80HMz: tempLength / 3,
    });

    // draw 5MHz gap
    gapWrapper.append('line')
        .attr('x1', currentX)
        .attr('x2', currentX + gapWidth)
        .attr('y1', sliderYPos + 0.5)
        .attr('y2', sliderYPos + 0.5)
        .style('stroke', colorMap.outRange)
        .style('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .style('stroke-dasharray', '1 4')
        .on('click', sliderAreaClick);

    gapBoundX.push({
        startAtRange: 5730,
        startAt: currentX,
        endAtRange: 5735,
        totalWidth: gapWidth,
        endAt: currentX += gapWidth,
        isGap: true,
    });

    sliderLinearGradientPart3 = genLinearGradient(pathWrapper, 'sliderPart3');
    // draw 5735 - 5815
    tempLength = ((5815 - 5735) / fullRangeWithoutGap) * totalWidthWithoutGap;

    pathWrapper.append('path')
        .attr('d', drawLine(currentX, tempLength, sliderYPos, 1))
        .attr('stroke', 'url(#sliderPart3)')
        .attr('fill', 'none')
        .on('click', sliderAreaClick);
    drawLabel(labelWrapper, 5735, currentX - margin.left)
        .on('click', () => { lableOnClick(5735); });

    lastLablePosX = (currentX - margin.left) + tempLength;
    drawLabel(labelWrapper, 5815, (currentX - margin.left) + tempLength)
        .attr('id', 'label-5815')
        .on('click', () => { lableOnClick(5815); });

    gapBoundX.push({
        startAtRange: 5735,
        startAt: currentX,
        endAtRange: 5815,
        totalWidth: tempLength,
        endAt: currentX += tempLength,
        widthPer80HMz: tempLength / 1,
    });

    const c165 = mainWrapper.append('g')
        .attr('id', 'area-for-channel165')
        .style('display', 'none');

    hiddenEndPointX = width - triangleLabelOffset;
    c165.append('path')
        .attr('d', drawLine(currentX, width - triangleLabelOffset - currentX, sliderYPos, 1))
        .attr('stroke', 'url(#sliderPart3)')
        .attr('fill', 'none');

    drawLabel(c165, 5835, width - 30, 35);

    sliderWidth = width;
    sliderYPos = height / 2;
    const symbol = d3.symbol().size(triangleSize);

    function thumbDragStart() {
        if (thumbDargObj.disabled) return;
        thumbDargObj.draging = true;
        thumbDargObj.startAt = d3.event.x;
        if (d3.event.x <= margin.left) {
            thumbDargObj.startAt = margin.left;
        } else if (d3.event.x >= sliderWidth - margin.right) {
            thumbDargObj.startAt = sliderWidth - margin.right;
        } else {
            thumbDargObj.startAt = d3.event.x;
        }
        d3.select(this).raise();
    }

    function thumbDrag() {
        if (thumbDargObj.disabled) return;
        let updatePosX;
        if (this.id === 'thumb-one' && d3.event.x >= thumbDargObj.thumb2PosX) {
            updatePosX = thumbDargObj.thumb2PosX;
        } else if (this.id === 'thumb-two' && d3.event.x <= thumbDargObj.thumb1PosX) {
            updatePosX = thumbDargObj.thumb1PosX;
        } else if (d3.event.x <= margin.left) {
            updatePosX = margin.left;
        } else if (d3.event.x >= sliderWidth - margin.right) {
            updatePosX = sliderWidth - margin.right;
        } else {
            updatePosX = d3.event.x;
        }
        d3.select(this).attr('transform', `translate(${updatePosX - triangleLabelOffset},
            ${sliderYPos - triangleSize - lineWidth})`);
        if (this.id === 'thumb-one') thumbDargObj.thumb1PosX = updatePosX;
        else thumbDargObj.thumb2PosX = updatePosX;
        updateSliderColor();
    }

    function thumbDragEnd() {
        if (thumbDargObj.disabled) return;
        thumbDargObj.draging = false;
        let finalPos;
        let anotherThumbPosX;
        if (this.id === 'thumb-one') {
            finalPos = thumbDargObj.thumb1PosX;
            anotherThumbPosX = thumbDargObj.thumb2PosX;
        } else {
            finalPos = thumbDargObj.thumb2PosX;
            anotherThumbPosX = thumbDargObj.thumb1PosX;
        }
        const {posValue, posX} = getNearest80MHzPoint(
            lineStartX, lineEndX, finalPos, thumbDargObj.startAt <= finalPos, anotherThumbPosX);
        if (this.id === 'thumb-one') {
            thumbDargObj.thumb1PosX = posX;
            thumbDargObj.thumb1Value = posValue;
        } else {
            thumbDargObj.thumb2PosX = posX;
            thumbDargObj.thumb2Value = posValue;
        }
        dragEndFunc([thumbDargObj.thumb1Value, thumbDargObj.thumb2Value]);
    }

    [thumbDargObj.thumb1Value, thumbDargObj.thumb2Value] = thumbValue;
    thumbDargObj.thumb1PosX = margin.left;
    mainWrapper.append('path')
        .attr('class', 'thumb')
        .attr('id', 'thumb-one')
        .attr('d', symbol.type(triangleLabel))
        .style('cursor', 'pointer')
        .attr('fill', colorMap.inRange)
        .attr('transform', `translate(${thumbDargObj.thumb1PosX - triangleLabelOffset},
            ${sliderYPos - triangleSize - lineWidth})`)
        .call(d3.drag()
            .on('start', thumbDragStart)
            .on('drag', thumbDrag)
            .on('end', thumbDragEnd)
        );
    thumbDargObj.thumb2PosX = width - margin.right;
    mainWrapper.append('path')
        .attr('class', 'thumb')
        .attr('id', 'thumb-two')
        .attr('d', symbol.type(triangleLabel))
        .style('cursor', 'pointer')
        .attr('fill', colorMap.inRange)
        .attr('transform', `translate(${thumbDargObj.thumb2PosX - triangleLabelOffset},
            ${sliderYPos - triangleSize - lineWidth})`)
        .call(d3.drag()
            .on('start', thumbDragStart)
            .on('drag', thumbDrag)
            .on('end', thumbDragEnd)
        );
};

function updateSliderValueChange(value) {
    const {thumb1Value, thumb2Value} = thumbDargObj;
    let leftThumb;
    let rightThumb;
    const min = Math.min(...value);
    const max = Math.max(...value);
    const label = d3.select('#label-5815');
    if (max > 5815) {
        label.style('transform', `translate(${lastLablePosX - 15}px, 0px)`);
        d3.select('#area-for-channel165').style('display', 'initial');
    } else {
        label.style('transform', `translate(${lastLablePosX}px, 0px)`);
        d3.select('#area-for-channel165').style('display', 'none');
    }
    const leftPosX = parseRangeValueToPosX(min);
    const rightPosX = max > 5815 ? hiddenEndPointX : parseRangeValueToPosX(max);
    if (thumb1Value < thumb2Value) {
        leftThumb = d3.select('#thumb-one');
        rightThumb = d3.select('#thumb-two');
        thumbDargObj.thumb1Value = min;
        thumbDargObj.thumb1PosX = leftPosX;

        thumbDargObj.thumb2Value = max;
        thumbDargObj.thumb2PosX = rightPosX;
    } else {
        leftThumb = d3.select('#thumb-two');
        rightThumb = d3.select('#thumb-one');
        thumbDargObj.thumb2Value = min;
        thumbDargObj.thumb2PosX = leftPosX;

        thumbDargObj.thumb1Value = max;
        thumbDargObj.thumb1PosX = rightPosX;
    }
    leftThumb.transition()
        .duration(200)
        .attr('transform', `translate(${leftPosX - triangleLabelOffset},
            ${sliderYPos - triangleSize - lineWidth})`);

    rightThumb.transition()
        .duration(200)
        .attr('transform', `translate(${rightPosX - triangleLabelOffset},
            ${sliderYPos - triangleSize - lineWidth})`);

    updateSliderColor(true);
}

function updateThumbDisabled(disabled) {
    d3.select('#thumb-one')
        .style('cursor', disabled ? 'auto' : 'pointer')
        .attr('fill', disabled ? colorMap.outRange : colorMap.inRange);

    d3.select('#thumb-two')
        .style('cursor', disabled ? 'auto' : 'pointer')
        .attr('fill', disabled ? colorMap.outRange : colorMap.inRange);
    d3.selectAll('path')
        .style('cursor', disabled ? 'auto' : 'pointer');
    d3.selectAll('line')
        .style('cursor', disabled ? 'auto' : 'pointer');
    d3.selectAll('.text-label')
        .style('cursor', disabled ? 'auto' : 'pointer');
}

function redrawGrap(handleSliderChange) {
    d3.select('#svg').remove();
    gapBoundX = [];
    initSlider([thumbDargObj.thumb1Value, thumbDargObj.thumb2Value], handleSliderChange);
    updateSliderValueChange([thumbDargObj.thumb1Value, thumbDargObj.thumb2Value]);
    updateSliderColor(true);
}

const FreqRangeSlider = (props) => {
    const {value, disabled, handleSliderChange} = props;
    useEffect(() => {
        initSlider(value, handleSliderChange);
        const resizeFunc = () => { redrawGrap(handleSliderChange); };
        window.addEventListener('resize', resizeFunc);
        return () => { window.removeEventListener('resize', resizeFunc); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (thumbDargObj.draging) return;
        updateSliderValueChange(value);
        updateSliderColor(true);
    }, [value]);
    useEffect(() => {
        thumbDargObj.disabled = disabled;
        updateThumbDisabled(disabled);
    });

    return (
        <div
            id="freq-range-slider-container"
            style={{height: '100%', width: '100%', position: 'relative'}}
        />
    );
};

FreqRangeSlider.propTypes = {
    value: PropTypes.arrayOf(PropTypes.number).isRequired,
    disabled: PropTypes.bool.isRequired,
    handleSliderChange: PropTypes.func.isRequired,
};

FreqRangeSlider.defaultProps = {
};

export default FreqRangeSlider;
