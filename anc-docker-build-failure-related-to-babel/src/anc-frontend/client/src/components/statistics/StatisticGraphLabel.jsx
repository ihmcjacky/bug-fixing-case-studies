import React from 'react';

export const NotAxisTickButLabel = props =>(
    <g transform={`translate(${props.x},${props.y})`}>
        <text
            x={0}
            y={0}
            dy={10}
            fontFamily="Roboto"
            fontSize={props.fontSize}
            textAnchor="end"
            fill={props.color || '#8884d8'}
            transform={`rotate(${props.angle})`}
        >
            {props.payload.value}
        </text>
    </g>
);

export const YAxisTickButLabel = props => (
    <g transform={`translate(${props.x},${props.y})`}>
        <text
            x={0}
            y={0}
            dy={0}
            fontFamily="Roboto"
            fontSize="10px"
            textAnchor="end"
            fill={props.color || '#8884d8'}
            transform={`rotate(${props.angle})`}
        >
            {props.payload.value}
        </text>
    </g>
);

export const RightYAxisTickButLabel = props => (
    <g transform={`translate(${props.x},${props.y})`}>
        <text
            x={0}
            y={0}
            dy={0}
            dx={0}
            fontFamily="Roboto"
            fontSize="10px"
            fill={props.color || '#8884d8'}
            transform={`rotate(${props.angle})`}
        >
            {props.payload.value}
        </text>
    </g>
);
