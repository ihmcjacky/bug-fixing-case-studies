import React from 'react';
import PropTypes from 'prop-types';
import StatisticGraph from './StatisticGraph';
import StatisticTable from './StatisticTable';
import StatisticConstants from '../../constants/statistic';

const {
    byteStatisticOpt, packetStatisticOpt,
    bytesToNumMap, packetToNumMap,
} = StatisticConstants;

const StatisticContent = (props) => {
    const {
        t,
        onView,
        interfaceStatus,
        statisitcSupport,
        selectedStatistic,
        selectedInterface,
        graphData,
        normalzieRef,
        dataUnit, packetUnit,
    } = props;

    const showByteSelect = selectedStatistic.some(opt => byteStatisticOpt.includes(opt));
    const showPacketSelect = selectedStatistic.some(opt => packetStatisticOpt.includes(opt));

    if (onView === 'normalzie') {
        const data = [];
        const lines = [];
        const refId = normalzieRef.id;
        const refData = normalzieRef.interface;
        graphData.forEach((row, index) => {
            const rowData = {
                id: row.id,
                timestamp: row.timestamp,
            };
            if (!row.interface || refId > row.id) {
                data.push(rowData);
                return;
            }

            const allData = row.interface;
            selectedInterface.forEach((interfaceName) => {
                const interfaceData = allData[interfaceName];
                const refInterfaceData = refData[interfaceName];
                selectedStatistic.forEach((statName) => {
                    if (!interfaceData[statName]) return;

                    const isBytes = byteStatisticOpt.includes(statName);
                    if (index === graphData.length - 1) {
                        const line = {
                            dataName: `${interfaceName}-${statName}`,
                            ifName: interfaceName,
                            infoName: statName,
                            unit: isBytes ? dataUnit : packetUnit,
                            ...(isBytes ? {} : {axisId: 'packets'})
                        };
                        lines.push(line);
                    }
                    const unitNum = isBytes ? bytesToNumMap[dataUnit] : packetToNumMap[packetUnit];
                    const pointValue = parseInt(interfaceData[statName], 10);
                    const refValue = parseInt(refInterfaceData[statName], 10)
                    rowData[`${interfaceName}-${statName}`] =
                        Number(Number((pointValue - refValue) / unitNum).toFixed(2), 10);
                });
            });
            data.push(rowData);
        });

        return (
            <StatisticGraph
                t={t}
                data={data}
                lines={lines}
                showByteSelect={showByteSelect}
                showPacketSelect={showPacketSelect}
            />
        );
    } else if (onView === 'graph') {
        const data = [];
        const lines = [];
        graphData.forEach((row, index) => {
            const rowData = {
                id: row.id,
                timestamp: row.timestamp,
            };
            if (!row.interface) {
                data.push(rowData);
                return;
            }

            const allData = row.interface;
            selectedInterface.forEach((interfaceName) => {
                const interfaceData = allData[interfaceName];
                selectedStatistic.forEach((statName) => {
                    if (!interfaceData[statName]) return;

                    const isBytes = byteStatisticOpt.includes(statName);
                    if (index === graphData.length - 1) {
                        const line = {
                            dataName: `${interfaceName}-${statName}`,
                            ifName: interfaceName,
                            infoName: statName,
                            unit: isBytes ? dataUnit : packetUnit,
                            ...(isBytes ? {} : {axisId: 'packets'})
                        };
                        lines.push(line);
                    }
                    const unitNum = isBytes ? bytesToNumMap[dataUnit] : packetToNumMap[packetUnit];
                    rowData[`${interfaceName}-${statName}`] =
                        Number(Number(parseInt(interfaceData[statName], 10) / unitNum).toFixed(2), 10);
                });
            });
            data.push(rowData);
        });
        return (
            <StatisticGraph
                t={t}
                data={data}
                lines={lines}
                showByteSelect={showByteSelect}
                showPacketSelect={showPacketSelect}
            />
        );
    } else if (onView === 'table') {
        return (
            <StatisticTable
                t={t}
                data={graphData[graphData.length - 1].interface}
                dataUnit={dataUnit}
                packetUnit={packetUnit}
                interfaceStatus={interfaceStatus}
                statisitcSupport={statisitcSupport}
            />
        )
    } else { // should not be here
        return <div />;
    }
};

StatisticContent.propTypes = {
    t: PropTypes.func.isRequired,
    onView: PropTypes.string.isRequired,
    interfaceStatus: PropTypes.objectOf(PropTypes.string).isRequired,
    statisitcSupport: PropTypes.objectOf(PropTypes.bool).isRequired,
    graphData: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        interface: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        timestamp: PropTypes.string,
    })).isRequired,
    normalzieRef: PropTypes.shape({
        id: PropTypes.number,
        interface: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        timestamp: PropTypes.string,
    }).isRequired,
    dataUnit: PropTypes.string.isRequired,
    packetUnit: PropTypes.string.isRequired,
    selectedInterface: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedStatistic: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default StatisticContent;
