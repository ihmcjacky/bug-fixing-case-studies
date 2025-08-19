import React from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import ReactExport from 'react-data-export';
import {convertIpToMac} from '../../util/formatConvertor';
import {insertZero} from '../../util/dateHandler';
import {getOemNameOrAnm} from '../../util/common';

const {ExcelFile} = ReactExport;
const {ExcelSheet} = ReactExport.ExcelFile;

const linkAlignmentXlsDataStyle = {
    summaryTag: {font: {sz: '11', bold: true}},
    summaryValue: {font: {sz: '11'}},
    resultTag: {font: {sz: '11', bold: true}, alignment: {horizontal: 'center'}},
    resultValue: {font: {sz: '11'}, alignment: {horizontal: 'center'}},
};

function formatDate(date) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
}

const checkRssiChain = (rssiChain) => {
    if (typeof rssiChain === 'number' && rssiChain !== 0) {
        return rssiChain.toString();
    }
    return '-';
};

function LinkAlignmentToXLS(props) {
    const {downloadBtn, data} = props;
    const {
        nodeIp,
        radioDevices,
        nodeInfo: {hostname, mac},
        graphRadioData,
        graphNodeInfo,
        projectIdToNameMap
    } = data;
    const {
        summaryTag, summaryValue, resultTag, resultValue,
    } = linkAlignmentXlsDataStyle;

    const excelSheets = radioDevices.reduce((accumulator, radio) => {
        const alignmentRadio = `Radio ${radio.substring(5, radio.length)}`;
        const radioNeighbor = Object.keys(graphRadioData[nodeIp][radio]);
        const excelSheetsPerRadio = radioNeighbor.map((neighborIp) => {
            const neighborHostname = graphNodeInfo[neighborIp] ? graphNodeInfo[neighborIp].hostname : '-';
            const neighborMac = convertIpToMac(neighborIp);
            const neighborModel = graphNodeInfo[neighborIp] ? graphNodeInfo[neighborIp].model : '-';

            const multiDataSet = [
                {
                    columns: [
                        {
                            title: `Alignment Result (${data.nodeInfo.mac} <> ${neighborMac})`,
                            width: {wpx: 140},
                            alignment: {horizontal: 'center'},
                        },
                        {title: '', width: {wpx: 140}},
                        {title: '', width: {wpx: 140}},
                        {title: '', width: {wpx: 140}},
                        {title: '', width: {wpx: 140}},
                        {title: '', width: {wpx: 140}},
                        {title: '', width: {wpx: 140}},
                    ],
                    data: [
                        [
                            {value: 'Hostname', style: summaryTag},
                            {value: hostname, style: summaryValue},
                        ],
                        [
                            {value: 'MAC', style: summaryTag},
                            {value: mac, style: summaryValue},
                        ],
                        [
                            {value: 'Alignment Radio', style: summaryTag},
                            {value: alignmentRadio, style: summaryValue},
                        ],
                        [
                            {value: 'Neighbor Hostname', style: summaryTag},
                            {value: neighborHostname, style: summaryValue},
                        ],
                        [
                            {value: 'Neighbor MAC', style: summaryTag},
                            {value: neighborMac, style: summaryValue},
                        ],
                        [
                            {value: 'Neighbor Model', style: summaryTag},
                            {value: neighborModel, style: summaryValue},
                        ],
                        [],
                        [
                            {
                                value: 'Captured Time',
                                style: resultTag,
                            },
                            {
                                value: 'RSSI (Local), dBm',
                                style: resultTag,
                            },
                            {
                                value: 'Data Rate (Local), Mbps',
                                style: resultTag,
                            },
                            {
                                value: 'RSSI (Remote), dBm',
                                style: resultTag,
                            },
                            {
                                value: 'Data Rate (Remote), Mbps',
                                style: resultTag,
                            },
                            {
                                value: 'RSSI Chain 0, dBm',
                                style: resultTag,
                            },
                            {
                                value: 'RSSI Chain 1, dBm',
                                style: resultTag,
                            },
                        ],
                    ],
                    // merge: [
                    //     'A1:C1',
                    // ],
                },
            ];
            const linkData = multiDataSet[0].data;
            const graphRadioDataHistory = graphRadioData[nodeIp][radio][neighborIp];
            graphRadioDataHistory.forEach((history, i) => {
                const hasNext = (i + 1) < graphRadioDataHistory.length;
                const historyNext = hasNext ? graphRadioDataHistory[i + 1] : null;
                if (history) {
                    const date = new Date(history.timestamp);
                    const hour = insertZero(date.getHours());
                    const minute = insertZero(date.getMinutes());
                    const second = insertZero(date.getSeconds());
                    const result = [];
                    result.push({
                        value: `${hour}:${minute}:${second}`,
                        style: resultValue,
                    });
                    result.push({
                        value: history.rssi.local,
                        style: resultValue,
                    });
                    result.push({
                        value: Number(history.bitrate.local) / 1000000,
                        style: resultValue,
                    });
                    result.push({
                        value: history.rssi.remote,
                        style: resultValue,
                    });
                    result.push({
                        value: Number(history.bitrate.remote) / 1000000,
                        style: resultValue,
                    });
                    result.push({
                        value: checkRssiChain(history.chainData.rssiChain0),
                        style: resultValue,
                    });
                    result.push({
                        value: checkRssiChain(history.chainData.rssiChain1),
                        style: resultValue,
                    });
                    linkData.push(result);

                    if (hasNext) {
                        const dateNext = new Date(historyNext.timestamp);
                        const timeDiff = (dateNext.getTime() - date.getTime()) / 1000;
                        if (timeDiff > 1) {
                            for (let k = 1; k < timeDiff; k += 1) {
                                const newDate = new Date(date.getTime() + (k * 1000));
                                const hourNext = insertZero(newDate.getHours());
                                const minuteNext = insertZero(newDate.getMinutes());
                                const secondNext = insertZero(newDate.getSeconds());
                                const resultNext = [];
                                resultNext.push({
                                    value: `${hourNext}:${minuteNext}:${secondNext}`,
                                    style: resultValue,
                                });
                                resultNext.push({
                                    value: history.rssi.local,
                                    style: resultValue,
                                });
                                resultNext.push({
                                    value: Number(history.bitrate.local) / 1000000,
                                    style: resultValue,
                                });
                                resultNext.push({
                                    value: history.rssi.remote,
                                    style: resultValue,
                                });
                                resultNext.push({
                                    value: Number(history.bitrate.remote) / 1000000,
                                    style: resultValue,
                                });
                                // resultNext.push({
                                //     value: `${history.chainData.rssiChain0 ?? '-'}/${history.chainData.rssiChain1 ?? '-'}`,
                                //     style: resultValue,
                                // });
                                linkData.push(resultNext);
                            }
                        }
                    }
                }
            });
            multiDataSet[0].data = linkData;
            return (
                <ExcelSheet
                    key={neighborIp}
                    dataSet={multiDataSet}
                    name={`${neighborMac.replace(/:/g, '-')} (${alignmentRadio})`}
                />);
        });
        return accumulator.concat(excelSheetsPerRadio);
    }, []);
    console.log('kyle_debug: LinkAlignmentToXLS -> excelSheets', excelSheets);

    const projectId = Cookies.get('projectId');
    const projectName = projectIdToNameMap[projectId];
    const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
    const namePrefix = getOemNameOrAnm(nwManifestName);
    const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
    const exportName = `${namePrefix}_${projectName}_${hostname}_link-alignment_${currentTime}`;
    
    return (
        <ExcelFile
            hideElement={false}
            filename={exportName}
            fileExtension="xlsx"
            element={downloadBtn}
        >
            {excelSheets}
        </ExcelFile>
    );
}

LinkAlignmentToXLS.propTypes = {
    downloadBtn: PropTypes.element.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object.isRequired,
};

export default LinkAlignmentToXLS;
