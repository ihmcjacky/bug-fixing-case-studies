/* eslint-disable no-restricted-globals */
const StatisticWorker = () => {
    const getNodeStatistic = (csrfToken, projectId, body, hostname, port) => {
        // const {origin} = self.location;
        // const apiPath = `${origin}/api/django/api/v5/projects/${projectId}/get-network-device-stat/`;
        const apiPath = `http://${hostname}:${port}/api/v5/projects/${projectId}/get-network-device-stat/`;
        return fetch(apiPath, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
                // 'Cookie': JSON.stringify(cookie),
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
    };

    const ethTraffic = {
        txBytes: 'tx',
        rxBytes: 'rx',
        txPackets: 'tx packets',
        rxPackets: 'rx packets',
    };
    const ethTrafficDiaplay = {
        txBytes: 'TX',
        rxBytes: 'RX',
        txPackets: 'TX Packets',
        rxPackets: 'RX Packets',
    };
    const radioTraffic = {
        txBytes: 'tx',
        rxBytes: 'rx',
        txPackets: 'tx packets',
        rxPackets: 'rx packets',
        txRetries: 'tx retries',
        rxErrors: 'rx errors',
        txDropped: 'tx dropped',
        rxDropped: 'rx dropped',
    };
    const radioTrafficDisplay = {
        txBytes: 'TX',
        rxBytes: 'RX',
        txPackets: 'TX Packets',
        rxPackets: 'RX Packets',
        txRetries: 'TX Retries',
        rxErrors: 'RX Errors',
        txDropped: 'TX Dropped',
        rxDropped: 'RX Dropped',
    };
    const bytesToNumMap = {
        bytes: 1,
        kb: 1000,
        mb: 1000000,
        gb: 1000000000,
        tb: 1000000000000,
    };
    const packetToNumMap = {
        packets: 1,
        kPackets: 1000,
        mPackets: 1000000,
        gPackets: 1000000000,
        tPackets: 1000000000000,
    };
    const bytesUnit = {
        bytes: 'Bytes',
        kb: 'KB',
        mb: 'MB',
        gb: 'GB',
        tb: 'TB',
    };
    const packetsUnit = {
        packets: 'Packets',
        kPackets: 'Kilo Packets',
        mPackets: 'Mage Packets',
        gPackets: 'Giga Packets',
        tPackets: 'Tera Packets',
    }
    const byteStatisticOpt = [
        'txBytes', 'rxBytes'
    ];

    /**
     * Object to contain all statistic response data
     * example:
     *  {
     *      'ip': {
     *          data: [
     *              id: 0,
     *              isEmpty: false,
     *              timestamp: 'hh:mm:ss',
     *              status: {
     *                  eth0: 0/1/2,
     *                  ...
     *              },
     *              interface: {
     *                  eth0: {
     *                      tx: 123,
     *                      rx: 456,
     *                      ...
     *                  },
     *                  ...
     *              }
     *          ],
     *          nextId: 1,
     *      }
     *  }
     */
    const statList = {};
    const timeRange = 30;

    const trimOutRangeData = (ip, currentTime) => {
        let cutoff = -1;
        statList[ip].data.some((d, index) => {
            const dataTime = d.timestamp.split(':').map(string => parseInt(string, 10));
            dataTime[1] += timeRange;
            if (dataTime[1] >= 60) {
                dataTime[0] += 1;
                dataTime[1] -= 60;
            }

            if (currentTime.hours > dataTime[0]) {
                cutoff = index;
                return false;
            } else if (currentTime.hours === dataTime[0]) {
                if (currentTime.minutes > dataTime[1]) {
                    cutoff = index;
                    return false;
                } else if (currentTime.minutes === dataTime[1]) {
                    if (currentTime.seconds > dataTime[2]) {
                        cutoff = index;
                        return false;
                    }
                }
            }
            return true;
        });
        if (cutoff !== -1) statList[ip].data = statList[ip].data.slice(cutoff + 1, statList[ip].length);
    };

    self.addEventListener('message', (event) => {
        if (!event) return;
        const {id, payload} = event.data;

        switch(payload.type) {
            case 'get-network-device-stat': {
                const {csrf, projectId, ip, hostname, port} = payload.data;
                getNodeStatistic(csrf, projectId, {nodes: [ip]}, hostname, port).then((res) => {
                    res.json().then((data) => {
                        const now = new Date();
                        const currentTime = `${now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()}:` +
                            `${now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()}:` +
                            `${now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds()}`;
                        if (!statList[ip]) statList[ip] = {data: [], nextId: 0};
                        let targetData;
                        if (data.success) {
                            targetData = data.data[ip];
                        } else if (data.specific && data.specific[ip].success) {
                            targetData = data.specific[ip].data;
                        }
                        if (res.status >= 400 || !targetData) {
                            let dataRow = {
                                id: statList[ip].nextId,
                                isEmpty: true,
                                timestamp: currentTime,
                                status: {},
                                interface: {},
                            };
                            if (statList[ip].data.length) {
                                const emptyData = {};
                                const refData = statList[ip].data[statList[ip].data.length - 1].interface;
                                Object.keys(refData).forEach((networkDevice) => {
                                    emptyData[networkDevice] = {};
                                    Object.keys(refData[networkDevice]).forEach((type) => {
                                        emptyData[networkDevice][type] = '-';
                                    });
                                });
                                dataRow = {
                                    id: statList[ip].nextId,
                                    isEmpty: true,
                                    timestamp: currentTime,
                                    interface: emptyData,
                                    status: statList[ip].data[statList[ip].data.length - 1].status,
                                };
                            }
                            statList[ip].data.push(dataRow);
                            statList[ip].nextId += 1;
                            trimOutRangeData(ip,
                                {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()});

                            postMessage({
                                id,
                                payload: {success: false, data: dataRow},
                            });
                        } else {
                            const temp = {
                                success: true,
                                data: {
                                    id: statList[ip].nextId,
                                    timestamp: currentTime,
                                    interface: {},
                                    supportList: {
                                        txRetries: false,
                                        rxErrors: false,
                                        txDropped: false,
                                        rxDropped: false,
                                    },
                                    status: {},
                                },
                            };
                            statList[ip].nextId += 1;
                            let setUp = false;
                            Object.keys(targetData).forEach((networkDevice) => {
                                const deviceData = targetData[networkDevice];
                                temp.data.interface[networkDevice] = {};
                                temp.data.status[networkDevice] = deviceData.status;
                                temp.data.interface[networkDevice] = {};
                                if (deviceData.status !== '0') {
                                    if (networkDevice.includes('eth')) {
                                        Object.keys(ethTraffic).forEach((name) => {
                                            temp.data.interface[networkDevice][name] = deviceData[name];
                                        });
                                    } else {
                                        Object.keys(radioTraffic).forEach((name) => {
                                            temp.data.interface[networkDevice][name] = deviceData[name];
                                        });
                                        if (!setUp) {
                                            temp.data.supportList = {
                                                txRetries: deviceData.txRetries &&
                                                    deviceData.txRetries !== 'notSupport',
                                                rxErrors: deviceData.rxErrors &&
                                                    deviceData.rxErrors !== 'notSupport',
                                                rxDropped: deviceData.rxDropped &&
                                                    deviceData.rxDropped !== 'notSupport',
                                                txDropped: deviceData.txDropped &&
                                                    deviceData.txDropped !== 'notSupport',
                                            };
                                            setUp = true;
                                        }
                                    }
                                }
                            });
                            statList[ip].data.push(temp.data);
                            trimOutRangeData(ip,
                                {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()});

                            postMessage({
                                id,
                                payload: {...temp},
                            });
                        }
                    });
                });
                break;
            }
            case 'get-export-data': {
                const {
                    ip, dataUnit, packetUnit, selectedInterface, selectedStat,
                } = payload.data;
                const deviceData = statList[ip].data;
                const csvFormat = {};
                let allEmpty = true;

                deviceData.forEach((dataPoint) => {
                    Object.keys(dataPoint.interface).forEach((networkDevice) => {
                        if (!dataPoint.isEmpty) allEmpty = false;

                        if (selectedInterface.includes(networkDevice)) {
                            if (!csvFormat[networkDevice]) csvFormat[networkDevice] = {};
                            Object.keys(dataPoint.interface[networkDevice]).forEach((statName) => {
                                if (selectedStat.includes(statName)) {
                                    const isBytes = byteStatisticOpt.includes(statName);
                                    const unit = isBytes ? dataUnit : packetUnit;
                                    const diplayUnit = isBytes ? bytesUnit[dataUnit] : packetsUnit[packetUnit];
                                    const unitNum = isBytes ? bytesToNumMap[unit] : packetToNumMap[unit];

                                    if (!csvFormat[networkDevice][statName]) {
                                        csvFormat[networkDevice][statName] = [];
                                        csvFormat[networkDevice][statName].push([
                                            'Captured Time', 'Interface', 'Statistic', diplayUnit,
                                        ]);
                                    }
                                    const csvRow = [];
                                    csvRow.push(dataPoint.timestamp);
                                    if (networkDevice.includes('eth')) {
                                        csvRow.push(networkDevice.replace('eth', 'ETH '));
                                        csvRow.push(ethTrafficDiaplay[statName]);
                                    } else {
                                        csvRow.push(networkDevice.replace('radio', 'RADIO '));
                                        csvRow.push(radioTrafficDisplay[statName]);
                                    }
                                    if (dataPoint.isEmpty) {
                                        csvRow.push('-');
                                    } else {
                                        const pointData = Number(dataPoint.interface[networkDevice][statName]);
                                        csvRow.push(Number(Number(pointData / unitNum).toFixed(2), 10));
                                    }

                                    csvFormat[networkDevice][statName].push(csvRow);
                                }
                            });
                        }
                    });
                });
                if (allEmpty) {
                    postMessage({
                        id,
                        payload: {
                            success: false,
                            error: 'allEmpytDataErr',
                        },
                    });
                } else {
                    postMessage({
                        id,
                        payload: {
                            success: true,
                            data: csvFormat,
                        },
                    });
                }
                break;
            }
            case 'get-export-normalzie-data': {
                const {
                    ip, dataUnit, packetUnit, selectedInterface, selectedStat, normalzieRef,
                } = payload.data;
                const deviceData = statList[ip].data;
                const csvFormat = {};
                let allEmpty = true;
                const refData = normalzieRef.interface;
                deviceData.forEach((dataPoint) => {
                    if (dataPoint.id < normalzieRef.id) return;
                    Object.keys(dataPoint.interface).forEach((networkDevice) => {
                        if (!dataPoint.isEmpty) allEmpty = false;

                        if (selectedInterface.includes(networkDevice)) {
                            if (!csvFormat[networkDevice]) csvFormat[networkDevice] = {};
                            Object.keys(dataPoint.interface[networkDevice]).forEach((statName) => {
                                if (selectedStat.includes(statName)) {
                                    const isBytes = byteStatisticOpt.includes(statName);
                                    const unit = isBytes ? dataUnit : packetUnit;
                                    const diplayUnit = isBytes ? bytesUnit[dataUnit] : packetsUnit[packetUnit];
                                    const unitNum = isBytes ? bytesToNumMap[unit] : packetToNumMap[unit];

                                    if (!csvFormat[networkDevice][statName]) {
                                        csvFormat[networkDevice][statName] = [];
                                        csvFormat[networkDevice][statName].push([
                                            'Captured Time', 'Interface', 'Statistic', diplayUnit,
                                        ]);
                                    }
                                    const csvRow = [];
                                    csvRow.push(dataPoint.timestamp);
                                    if (networkDevice.includes('eth')) {
                                        csvRow.push(networkDevice.replace('eth', 'ETH '));
                                        csvRow.push(ethTrafficDiaplay[statName]);
                                    } else {
                                        csvRow.push(networkDevice.replace('radio', 'RADIO '));
                                        csvRow.push(radioTrafficDisplay[statName]);
                                    }
                                    if (dataPoint.isEmpty) {
                                        csvRow.push('-');
                                    } else {
                                        const pointData = Number(dataPoint.interface[networkDevice][statName]);
                                        const refPointData = Number(refData[networkDevice][statName]);
                                        csvRow.push(Number(Number((pointData - refPointData) / unitNum).toFixed(2), 10));
                                    }

                                    csvFormat[networkDevice][statName].push(csvRow);
                                }
                            });
                        }
                    });
                });
                if (allEmpty) {
                    postMessage({
                        id,
                        payload: {
                            success: false,
                            error: 'allEmpytDataErr',
                        },
                    });
                } else {
                    postMessage({
                        id,
                        payload: {
                            success: true,
                            data: csvFormat,
                        },
                    });
                }
                break;
            }
            case 'get-export-full-page-data': {
                const {
                    ip, unitObj, selectedInterface,
                } = payload.data;
                const deviceData = statList[ip].data;
                const csvFormat = {};
                let allEmpty = true;
                deviceData.forEach((dataPoint) => {
                    Object.keys(dataPoint.interface).forEach((networkDevice) => {
                        if (!dataPoint.isEmpty) allEmpty = false;

                        if (selectedInterface.includes(networkDevice)) {
                            if (!csvFormat[networkDevice]) csvFormat[networkDevice] = {};
                            Object.keys(dataPoint.interface[networkDevice]).forEach((statName) => {
                                const isBytes = byteStatisticOpt.includes(statName);
                                const unit = unitObj[`${networkDevice}-${statName}`];
                                const diplayUnit = isBytes ? bytesUnit[unit] : packetsUnit[unit];
                                const unitNum = isBytes ? bytesToNumMap[unit] : packetToNumMap[unit];

                                if (!csvFormat[networkDevice][statName]) {
                                    csvFormat[networkDevice][statName] = [];
                                    csvFormat[networkDevice][statName].push([
                                        'Captured Time', 'Interface', 'Statistic', diplayUnit,
                                    ]);
                                }
                                const csvRow = [];
                                csvRow.push(dataPoint.timestamp);
                                if (networkDevice.includes('eth')) {
                                    csvRow.push(networkDevice.replace('eth', 'ETH '));
                                    csvRow.push(ethTrafficDiaplay[statName]);
                                } else {
                                    csvRow.push(networkDevice.replace('radio', 'RADIO '));
                                    csvRow.push(radioTrafficDisplay[statName]);
                                }
                                if (dataPoint.isEmpty) {
                                    csvRow.push('-');
                                } else {
                                    const pointData = Number(dataPoint.interface[networkDevice][statName]);
                                    csvRow.push(Number(Number((pointData) / unitNum).toFixed(2), 10));
                                }

                                csvFormat[networkDevice][statName].push(csvRow);
                            });
                        }
                    });
                });
                if (allEmpty) {
                    postMessage({
                        id,
                        payload: {
                            success: false,
                            error: 'allEmpytDataErr',
                        },
                    });
                } else {
                    postMessage({
                        id,
                        payload: {
                            success: true,
                            data: csvFormat,
                        },
                    });
                }
                break;
            }
            case 'clear-device-stat': {
                const {ip} = payload.data;
                delete statList[ip];

                postMessage({
                    id,
                    payload: {success: true},
                });
                break;
            }
            case 'handle-device-stat-response': {
                const {ip, error, data} = payload.data;
                const now = new Date();
                const currentTime = `${now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()}:` +
                    `${now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()}:` +
                    `${now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds()}`;
                if (!statList[ip]) statList[ip] = {data: [], nextId: 0};
                const targetData = data;
                // if (data.success) {
                //     targetData = data.data[ip];
                // } else if (data.specific && data.specific[ip].success) {
                //     targetData = data.specific[ip].data;
                // }
                if (error || !targetData) {
                    let dataRow = {
                        id: statList[ip].nextId,
                        isEmpty: true,
                        timestamp: currentTime,
                        status: {},
                        interface: {},
                    };
                    if (statList[ip].data.length) {
                        const emptyData = {};
                        const refData = statList[ip].data[statList[ip].data.length - 1].interface;
                        Object.keys(refData).forEach((networkDevice) => {
                            emptyData[networkDevice] = {};
                            Object.keys(refData[networkDevice]).forEach((type) => {
                                emptyData[networkDevice][type] = '-';
                            });
                        });
                        dataRow = {
                            id: statList[ip].nextId,
                            isEmpty: true,
                            timestamp: currentTime,
                            interface: emptyData,
                            status: statList[ip].data[statList[ip].data.length - 1].status,
                        };
                    }
                    statList[ip].data.push(dataRow);
                    statList[ip].nextId += 1;
                    trimOutRangeData(ip,
                        {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()});

                    postMessage({
                        id,
                        payload: {success: false, data: dataRow},
                    });
                } else {
                    const temp = {
                        success: true,
                        data: {
                            id: statList[ip].nextId,
                            timestamp: currentTime,
                            interface: {},
                            supportList: {
                                txRetries: false,
                                rxErrors: false,
                                txDropped: false,
                                rxDropped: false,
                            },
                            status: {},
                        },
                    };
                    statList[ip].nextId += 1;
                    let setUp = false;
                    Object.keys(targetData).forEach((networkDevice) => {
                        const deviceData = targetData[networkDevice];
                        temp.data.interface[networkDevice] = {};
                        temp.data.status[networkDevice] = deviceData.status;
                        temp.data.interface[networkDevice] = {};
                        if (deviceData.status !== '0') {
                            if (networkDevice.includes('eth')) {
                                Object.keys(ethTraffic).forEach((name) => {
                                    temp.data.interface[networkDevice][name] = deviceData[name];
                                });
                            } else {
                                Object.keys(radioTraffic).forEach((name) => {
                                    temp.data.interface[networkDevice][name] = deviceData[name];
                                });
                                if (!setUp) {
                                    temp.data.supportList = {
                                        txRetries: deviceData.txRetries &&
                                            deviceData.txRetries !== 'notSupport',
                                        rxErrors: deviceData.rxErrors &&
                                            deviceData.rxErrors !== 'notSupport',
                                        rxDropped: deviceData.rxDropped &&
                                            deviceData.rxDropped !== 'notSupport',
                                        txDropped: deviceData.txDropped &&
                                            deviceData.txDropped !== 'notSupport',
                                    };
                                    setUp = true;
                                }
                            }
                        }
                    });
                    statList[ip].data.push(temp.data);
                    trimOutRangeData(ip,
                        {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()});

                    postMessage({
                        id,
                        payload: temp,
                    });
                }
                break;
            }
            default: break;
        }
    });
};

export default StatisticWorker;
