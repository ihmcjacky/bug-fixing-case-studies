import * as d3 from 'd3';
import {
    adjustModeHandler,
    networkGraphHandler,
} from './TopologyGraph';
// import {iff} from './linkInfoCardHelperFunc';

export const ImageWidthLimit = 320;
export const ImageHeightLimit = 240;
const RssizeBarStrokeWidth = 5;
const RssizeBarStrokeLong = 30;
const AnimationDuration = 250;

// function to save the data when resize node start dragging
function resizeNodeStartDrag(nodePosition, x, y) {
    const {pos, viewSize} = adjustModeHandler.backgroundTemp;
    adjustModeHandler.resizeOnDrag.dragged = true;
    adjustModeHandler.resizeOnDrag.position = nodePosition;
    adjustModeHandler.resizeOnDrag.startX = x;
    adjustModeHandler.resizeOnDrag.startY = y;
    adjustModeHandler.resizeOnDrag.startWidth = viewSize.width;
    adjustModeHandler.resizeOnDrag.startHeight = viewSize.height;
    adjustModeHandler.resizeOnDrag.imageX = pos.x;
    adjustModeHandler.resizeOnDrag.imageY = pos.y;
    // the minimun scale that the image could scale
    adjustModeHandler.resizeOnDrag.minScale =
        Math.max(ImageWidthLimit / viewSize.width, ImageHeightLimit / viewSize.height);
    // the minSacle calc by width or height edge
    adjustModeHandler.resizeOnDrag.minScaleEdge =
        ImageWidthLimit / viewSize.width > ImageHeightLimit / viewSize.height ? 'width' : 'height';
}

function resizeNodeEndDrag() {
    adjustModeHandler.resizeOnDrag.dragged = false;
    adjustModeHandler.resizeOnDrag.position = '';
    adjustModeHandler.resizeOnDrag.startX = 0;
    adjustModeHandler.resizeOnDrag.startY = 0;
    adjustModeHandler.resizeOnDrag.startWidth = 0;
    adjustModeHandler.resizeOnDrag.startheight = 0;
    adjustModeHandler.resizeOnDrag.imageX = 0;
    adjustModeHandler.resizeOnDrag.imageY = 0;
}

export function updateDragToResizeNotePosition(adjustMode, animation = 0) {
    if (!adjustMode) return;
    d3.selectAll('.drag-to-resize-node').each(function () {
        // the image orgin point at left-top corner
        // the x offset at range 0, imageWidth / 2 and imageWidth
        // the y offset at range 0, imageHeight / 2 and imageHeight
        let x1Offset;
        let x2Offset;
        let y1Offset;
        let y2Offset;
        let fixed = false;
        const {
            fixHeight, fixWidth,
            viewSize, pos,
        } = adjustModeHandler.backgroundTemp;
        const {id} = this;
        if (id.includes('vertical')) { // all vertical nodes
            fixed = fixWidth;
            if (id.includes('left')) {
                x1Offset = (RssizeBarStrokeWidth / 2);
                x2Offset = (RssizeBarStrokeWidth / 2);
            } else {
                x1Offset = viewSize.width + -(RssizeBarStrokeWidth / 2);
                x2Offset = viewSize.width + -(RssizeBarStrokeWidth / 2);
            }

            if (id.includes('top')) {
                fixed = fixHeight || fixWidth;
                y1Offset = 0;
                y2Offset = RssizeBarStrokeLong;
            } else if (id.includes('center')) {
                y1Offset = (viewSize.height / 2) + -(RssizeBarStrokeLong / 2);
                y2Offset = (viewSize.height / 2) + (RssizeBarStrokeLong / 2);
            } else {
                fixed = fixHeight || fixWidth;
                y1Offset = viewSize.height + -RssizeBarStrokeLong;
                y2Offset = viewSize.height;
            }
        } else { // all horizontal nodes
            fixed = fixHeight;
            if (id.includes('bottom')) {
                y1Offset = viewSize.height + -(RssizeBarStrokeWidth / 2);
                y2Offset = viewSize.height + -(RssizeBarStrokeWidth / 2);
            } else {
                y1Offset = (RssizeBarStrokeWidth / 2);
                y2Offset = (RssizeBarStrokeWidth / 2);
            }

            if (id.includes('right')) {
                fixed = fixWidth || fixHeight;
                x1Offset = viewSize.width + -RssizeBarStrokeLong;
                x2Offset = viewSize.width;
            } else if (id.includes('center')) {
                x1Offset = (viewSize.width / 2) + -(RssizeBarStrokeLong / 2);
                x2Offset = (viewSize.width / 2) + (RssizeBarStrokeLong / 2);
            } else {
                fixed = fixWidth || fixHeight;
                x1Offset = 0;
                x2Offset = RssizeBarStrokeLong;
            }
        }
        d3.select(this).transition().duration(animation)
            .style('visibility', fixed ? 'hidden' : 'visible')
            .attr('x1', pos.x + x1Offset)
            .attr('x2', pos.x + x2Offset)
            .attr('y1', pos.y + y1Offset)
            .attr('y2', pos.y + y2Offset);
    });
}

// init all resize nodes
export function drawResizeNode(graphWrapper) {
    const imageWrapper = d3.select('#background-image-wrapper').append('g').attr('id', 'resize-nodes-wrapper');
    // draw all vertical-left node
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-left-top')
        .style('cursor', 'nwse-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-left-top', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // left top corner node, adjusting this node to change the image width and height and update position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageY, imageX,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth + xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.x = imageX + diff;
                        pos.y = imageY + (diff * (startHeight / startWidth));
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.x = imageX + (diff * (startWidth / startHeight));
                        pos.y = imageY + diff;
                    }
                } else {
                    pos.x = (startWidth + xMove) / startWidth >= minScale ? imageX - xMove : pos.x;
                    pos.y = (startWidth + xMove) / startWidth >= minScale ?
                        imageY - (xMove * (startHeight / startWidth)) : pos.y;
                }
                const scale = (startWidth + xMove) / startWidth >= minScale ?
                    (startWidth + xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-left-center')
        .style('cursor', 'ew-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-left-center', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // left center node, adjusting this node to change the image width and x position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                if (viewSize.width > ImageWidthLimit &&
                    adjustModeHandler.resizeOnDrag.startWidth + xMove < ImageWidthLimit) {
                    const diff = adjustModeHandler.resizeOnDrag.startWidth - ImageWidthLimit;
                    pos.x = adjustModeHandler.resizeOnDrag.imageX + diff;
                } else {
                    pos.x = adjustModeHandler.resizeOnDrag.startWidth + xMove >= ImageWidthLimit ?
                        adjustModeHandler.resizeOnDrag.imageX - xMove : pos.x;
                }
                viewSize.width = adjustModeHandler.resizeOnDrag.startWidth + xMove >= ImageWidthLimit ?
                    adjustModeHandler.resizeOnDrag.startWidth + xMove : ImageWidthLimit;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-left-bottom')
        .style('cursor', 'nesw-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-left-bottom', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // left bottom node, adjusting this node to change the image width and height and x position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageX,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth + xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.x = imageX + diff;
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.x = imageX + (diff * (startWidth / startHeight));
                    }
                } else {
                    pos.x = (startWidth + xMove) / startWidth >= minScale ? imageX - xMove : pos.x;
                }
                const scale = (startWidth + xMove) / startWidth >= minScale ?
                    (startWidth + xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );

    // draw all vertical-right node
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-right-top')
        .style('cursor', 'nesw-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-right-top', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // right top node, adjusting this node to change the image width and height and y position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageY,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth - xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.y = imageY + (diff * (startHeight / startWidth));
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.y = imageY + diff;
                    }
                } else {
                    pos.y = (startWidth - xMove) / startWidth >= minScale ?
                        imageY + (xMove * (startHeight / startWidth)) : pos.y;
                }
                const scale = (startWidth - xMove) / startWidth >= minScale ?
                    (startWidth - xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-right-center')
        .style('cursor', 'ew-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-right-center', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // right center node, adjusting this node to change the image width
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                viewSize.width = adjustModeHandler.resizeOnDrag.startWidth - xMove >= ImageWidthLimit ?
                    adjustModeHandler.resizeOnDrag.startWidth - xMove : ImageWidthLimit;
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'vertical-right-bottom')
        .style('cursor', 'nwse-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('vertical-right-bottom', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // right bottom node, adjusting this node to change the image width and height
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale,
                    startWidth, startHeight,
                } = adjustModeHandler.resizeOnDrag;
                const scale = (startWidth - xMove) / startWidth >= minScale ?
                    (startWidth - xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    // draw all horizontal-top node
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-left-top')
        .style('cursor', 'nwse-resize')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-left-top', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // left top corner node, adjusting this node to change the image width and height and update position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageY, imageX,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth + xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.x = imageX + diff;
                        pos.y = imageY + (diff * (startHeight / startWidth));
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.x = imageX + (diff * (startWidth / startHeight));
                        pos.y = imageY + diff;
                    }
                } else {
                    pos.x = (startWidth + xMove) / startWidth >= minScale ? imageX - xMove : pos.x;
                    pos.y = (startWidth + xMove) / startWidth >= minScale ?
                        imageY - (xMove * (startHeight / startWidth)) : pos.y;
                }
                const scale = (startWidth + xMove) / startWidth >= minScale ?
                    (startWidth + xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-center-top')
        .style('cursor', 'ns-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-center-top', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // center top corner node, adjusting this node to change the image height and update y position
                const yMove = (adjustModeHandler.resizeOnDrag.startY - d3.event.y);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                if (viewSize.height > ImageHeightLimit &&
                        adjustModeHandler.resizeOnDrag.startHeight + yMove < ImageHeightLimit) {
                    const diff = adjustModeHandler.resizeOnDrag.startHeight - ImageHeightLimit;
                    pos.y = adjustModeHandler.resizeOnDrag.imageY + diff;
                } else {
                    pos.y = adjustModeHandler.resizeOnDrag.startHeight + yMove >= ImageHeightLimit ?
                        adjustModeHandler.resizeOnDrag.imageY - yMove : pos.y;
                }
                viewSize.height = adjustModeHandler.resizeOnDrag.startHeight + yMove >= ImageHeightLimit ?
                    adjustModeHandler.resizeOnDrag.startHeight + yMove : ImageHeightLimit;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-right-top')
        .style('cursor', 'nesw-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-right-top', d.x, d.y)) // add on drag listener
            .on('drag', () => {
                // right top corner node, adjusting this node to change the image height and width and update y position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageY,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth - xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.y = imageY + (diff * (startHeight / startWidth));
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.y = imageY + diff;
                    }
                } else {
                    pos.y = (startWidth - xMove) / startWidth >= minScale ?
                        imageY + (xMove * (startHeight / startWidth)) : pos.y;
                }
                const scale = (startWidth - xMove) / startWidth >= minScale ?
                    (startWidth - xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );

    // draw all horizontal-bottom node
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-left-bottom')
        .style('cursor', 'nesw-resize')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-left-bottom', d.x, d.y))
            .on('drag', () => {
                // left bottom corner node, adjusting this node to change the image height and width and
                // update x position
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale, minScaleEdge,
                    startWidth, startHeight,
                    imageX,
                } = adjustModeHandler.resizeOnDrag;
                if (viewSize.width / startWidth > minScale && (startWidth + xMove) / startWidth < minScale) {
                    if (minScaleEdge === 'width') {
                        const diff = startWidth - ImageWidthLimit;
                        pos.x = imageX + diff;
                    } else {
                        const diff = startHeight - ImageHeightLimit;
                        pos.x = imageX + (diff * (startWidth / startHeight));
                    }
                } else {
                    pos.x = (startWidth + xMove) / startWidth >= minScale ? imageX - xMove : pos.x;
                }
                const scale = (startWidth + xMove) / startWidth >= minScale ?
                    (startWidth + xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                d3.select('#background-image-wrapper').datum({
                    ...adjustModeHandler.backgroundTemp,
                    x: pos.x,
                    y: pos.y,
                });
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-center-bottom')
        .style('cursor', 'ns-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-center-bottom', d.x, d.y))
            .on('drag', () => {
                // center bottom corner node, adjusting this node to change the image height
                const yMove = (adjustModeHandler.resizeOnDrag.startY - d3.event.y);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                viewSize.height = adjustModeHandler.resizeOnDrag.startHeight - yMove >= ImageHeightLimit ?
                    adjustModeHandler.resizeOnDrag.startHeight - yMove : ImageHeightLimit;
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    imageWrapper.append('g')
        .append('line')
        .attr('class', 'drag-to-resize-node')
        .attr('id', 'horizontal-right-bottom')
        .style('cursor', 'nwse-resize')
        .style('fill', 'white')
        .attr('stroke', '#122D54')
        .attr('stroke-width', RssizeBarStrokeWidth)
        .call(d3.drag().on('start', d => resizeNodeStartDrag('horizontal-right-bottom', d.x, d.y))
            .on('drag', () => {
                // center bottom corner node, adjusting this node to change the image height and width
                const xMove = (adjustModeHandler.resizeOnDrag.startX - d3.event.x);
                const {
                    imgSize, viewSize,
                    pos,
                } = adjustModeHandler.backgroundTemp;
                const {
                    minScale,
                    startWidth, startHeight,
                } = adjustModeHandler.resizeOnDrag;
                const scale = (startWidth - xMove) / startWidth >= minScale ?
                    (startWidth - xMove) / startWidth : minScale;
                viewSize.width = scale * startWidth;
                viewSize.height = scale * startHeight;
                graphWrapper.backgroundWrapper.attr('transform', `translate(${pos.x}, ${pos.y})
                    scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`);
                updateDragToResizeNotePosition(true);
            })
            .on('end', () => resizeNodeEndDrag)
        );
    updateDragToResizeNotePosition(true);
}

// export function setDimensionView(type, set, graphData, wrapper) {
//     if (type === 'width') adjustModeHandler.backgroundTemp.fixWidth = set;
//     else adjustModeHandler.backgroundTemp.fixHeight = set;

//     if (!set) {
//         adjustModeHandler.backgroundTemp.viewSize[type] = networkGraphHandler.background.imgSize[type];
//     } else {
//         const displaySize = d3.select('#nodes-wrapper').node().getBBox();
//         adjustModeHandler.backgroundTemp.viewSize[type] = displaySize[type] + 5;
//     }
//     const {
//         pos,
//         imgSize, viewSize,
//         fixWidth, fixHeight,
//     } = adjustModeHandler.backgroundTemp;
//     const img = graphData.backgroundImage;
//     const widthRatio = viewSize.width / imgSize.width;
//     const heightRatio = viewSize.height / imgSize.height;
//     const centerPos = adjustModeHandler.getImageCenterPos(img.width * widthRatio, img.height * heightRatio);
//     const boxPos = d3.select('#nodes-wrapper').node().getBBox();
//     pos.x = type === 'width' && set ? boxPos.x : iff(fixWidth, pos.x, centerPos.x);
//     pos.y = type === 'height' && set ? boxPos.y : iff(fixHeight, pos.y, centerPos.y);
//     d3.select('#background-image-wrapper').datum({
//         ...adjustModeHandler.backgroundTemp,
//         x: pos.x,
//         y: pos.y,
//     });

//     wrapper.transition().duration(AnimationDuration)
//         .attr('transform', `translate(${pos.x}, ${pos.y}) scale(${widthRatio}, ${heightRatio})`);
//     updateDragToResizeNotePosition(true, AnimationDuration);
// }

export function adjustMapOpacityPreview(opacity, wrapper) { // update background opacity in adjust mode
    adjustModeHandler.backgroundTemp.opacity = opacity;
    wrapper.attr('opacity', opacity);
}

export function fixDimensionView(type, fix) {
    if (type === 'width') adjustModeHandler.backgroundTemp.fixWidth = fix;
    else adjustModeHandler.backgroundTemp.fixHeight = fix;
    updateDragToResizeNotePosition(true);
}

export function setViewport(graphWrapper) { // set background view size to window size
    d3.select('#background-image-wrapper').selectAll('.drag-to-resize-node').remove();
    d3.select('#background-image-wrapper').select('#resize-nodes-wrapper').remove();
    const wrapper = d3.select('#topology-svg-wrapper').node();
    const scale = d3.zoomTransform(d3.select('#all').node()).k; // get current graph scale
    const {pos, imgSize, viewSize} = adjustModeHandler.backgroundTemp;
    const viewRatio = 1 / scale; // get window width from the current scale
    viewSize.width = imgSize.width * viewRatio * (wrapper.clientWidth / imgSize.width);
    viewSize.height = imgSize.height * viewRatio * (wrapper.clientHeight / imgSize.height);
    // place the background to center
    const centerPos = adjustModeHandler.getImageCenterPos(viewSize.width, viewSize.height);
    pos.x = centerPos.x;
    pos.y = centerPos.y;
    d3.select('#background-image-wrapper').datum({
        ...adjustModeHandler.backgroundTemp,
        x: pos.x,
        y: pos.y,
    });
    graphWrapper.backgroundWrapper.transition().duration(100)
        .attr('transform',
            `translate(${pos.x}, ${pos.y})
                scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`)
        .on('end', () => {
            drawResizeNode(graphWrapper);
            networkGraphHandler.moveToCenter(scale, 150);
        });
}

export function setBackgroundColor(color) { // background color for preview
    adjustModeHandler.backgroundTemp.color = color;
    d3.select('#topology-graph').style('background', color);
}

export function resetMapSize(graphWrapper) { // reset the image to orgin size
    const {pos, imgSize, viewSize} = adjustModeHandler.backgroundTemp;
    viewSize.height = imgSize.height;
    viewSize.width = imgSize.width;
    const widthRatio = viewSize.width / imgSize.width;
    const heightRatio = viewSize.height / imgSize.height;
    d3.select('#background-image-wrapper').datum({
        ...adjustModeHandler.backgroundTemp,
        x: pos.x,
        y: pos.y,
    });

    graphWrapper.backgroundWrapper.transition().duration(AnimationDuration)
        .attr('transform', `translate(${pos.x}, ${pos.y}) scale(${widthRatio}, ${heightRatio})`);
    updateDragToResizeNotePosition(true, AnimationDuration);
}

export function resetToDefault(graphWrapper) {
    const imageWrapper = d3.select('#background-image-wrapper');
    imageWrapper.selectAll('.drag-to-resize-node').remove();
    imageWrapper.select('#resize-nodes-wrapper').remove();

    const {pos, imgSize, viewSize} = adjustModeHandler.backgroundTemp;
    const centerPos = adjustModeHandler.getImageCenterPos(imgSize.width, imgSize.height);
    pos.x = centerPos.x;
    pos.y = centerPos.y;
    adjustModeHandler.backgroundTemp.opacity = 1;
    viewSize.width = imgSize.width;
    viewSize.height = imgSize.height;
    imageWrapper.datum({
        ...adjustModeHandler.backgroundTemp,
        x: pos.x,
        y: pos.y,
    });
    setBackgroundColor('#e5e5e5');
    graphWrapper.backgroundWrapper.transition().duration(AnimationDuration)
        .attr('opacity', 1)
        .attr('transform', `translate(${pos.x}, ${pos.y})
            scale(${viewSize.width / imgSize.width}, ${viewSize.height / imgSize.height})`)
        .on('end', () => {
            drawResizeNode(graphWrapper);
            updateDragToResizeNotePosition(true, AnimationDuration);
        });
}
