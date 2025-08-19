import React from 'react';
import PropTypes from 'prop-types';
import {LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Label} from 'recharts';
import {NotAxisTickButLabel, YAxisTickButLabel, RightYAxisTickButLabel} from './StatisticGraphLabel';
import StatisticConstants from '../../constants/statistic';

const {colorMap} = StatisticConstants;

const StatisticGraph = (props) => {
    const {
        t,
        data, lines,
        showByteSelect, showPacketSelect,
    } = props;

    return (
        <div style={{height: '340px', overflow: 'hidden'}} >
            <ResponsiveContainer height={320}>
                <LineChart
                    margin={{
                        top: 5,
                        left: showPacketSelect && !showByteSelect ? 30 : 0,
                        right: showPacketSelect ? 10 : 30,
                        bottom: 5,
                    }}
                    data={data}
                >
                    <XAxis
                        interval={0}
                        dataKey="timestamp"
                        tick={<NotAxisTickButLabel fontSize="10px" angle={-45} color="#000000" />}
                    />
                    <YAxis
                        axisLine={false}
                        minTickGap={10}
                        tick={<YAxisTickButLabel angle={-45} color="#000000" />}
                        hide={!showByteSelect}
                    >
                        <Label
                            position="top"
                            angle={0}
                            style={{
                                fontFamily: 'Roboto',
                                fontSize: '10px',
                                transform: 'translate(5px, -20px)',
                                fontWeight: 'bold',
                            }}
                        />
                    </YAxis>
                    <YAxis
                        width={50}
                        yAxisId="packets"
                        orientation="right"
                        axisLine={false}
                        minTickGap={10}
                        tick={<RightYAxisTickButLabel angle={45} color="#000000" />}
                        hide={!showPacketSelect}
                    >
                        <Label
                            position="top"
                            angle={0}
                            style={{
                                fontFamily: 'Roboto',
                                fontSize: '10px',
                                transform: 'translate(-5px, -20px)',
                                fontWeight: 'bold',
                            }}
                        />
                    </YAxis>
                    {
                        lines.map((line) => (
                            <Line
                                key={`${line.ifName} (${line.infoName})`}
                                type="monotone"
                                dataKey={line.dataName}
                                stroke={colorMap[line.dataName]}
                                yAxisId={line.axisId}
                                activeDot
                                isAnimationActive={false}
                                unit={t(line.unit)}
                            />
                        ))
                    }
                    <Tooltip
                        wrapperStyle={{fontSize: '10px', fontFamily: 'Roboto'}}
                        formatter={(value, name) => [isNaN(value) ? '- ' : value, t(name)]}
                    />
                    <Legend
                        wrapperStyle={{
                            fontFamily: 'Roboto',
                            fontSize: '10px',
                            bottom: '-20px',
                            fontWeight: 'bold',
                        }}
                        formatter={value => t(value)}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

StatisticGraph.propTypes = {
    t: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]))).isRequired,
    lines: PropTypes.arrayOf(PropTypes.shape({
        dataName: PropTypes.string,
        ifName: PropTypes.string,
        infoName: PropTypes.string,
        unit: PropTypes.string,
    })).isRequired,
    showByteSelect: PropTypes.bool.isRequired,
    showPacketSelect: PropTypes.bool.isRequired,
};

export default StatisticGraph;
