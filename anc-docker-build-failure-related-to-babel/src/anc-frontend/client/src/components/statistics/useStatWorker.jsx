import {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import moment from 'moment';
import StatisticWorkCaller from '../../util/webworker/statistic/StatisticWorkerCaller';
import CsvZipFactory from '../common/CsvZipFactory';
import { getOemNameOrAnm } from '../../util/common';

const useStatWorker = (ip, hostname) => {
    const worker = useRef();
    const intervalRef = useRef();
    const {
        common: {csrf},
        projectManagement: { projectId, projectIdToNameMap },
    } = useSelector(store => store);

    const [interfaceStatus, setInterfaceStatus] = useState({});
    const [graphData, setGraphData] = useState({
        timeRange: 2,
        intervalTime: 10,
        data: [],
    });
    const [normalzieRef, setNormalzieRef] = useState({
        id: 9999,
        interface: {},
        timestamp: '',
    });

    const didmountFun = () => {
        worker.current = new StatisticWorkCaller(ip);
        return function() {
            worker.current.terminate(ip);
            clearInterval(intervalRef.current);
        };
    };
    useEffect(didmountFun, []);

    const getData = () => {
        worker.current.getHandledStatistic(csrf, projectId, ip).then((res) => {
            setInterfaceStatus(res.data.status);
            setGraphData((currentGraphData) => {
                const {timeRange, intervalTime, data} = currentGraphData;
                const totalCell = parseInt((timeRange * 60) / intervalTime, 10);
                const newDataList = [...data];
                newDataList.push({
                    id: res.data.id,
                    timestamp: res.data.timestamp,
                    interface: res.data.interface,
                });

                if (newDataList.length > totalCell) {
                    newDataList.splice(0, newDataList.length - 1 - totalCell);
                }
                return  {timeRange, intervalTime, data: newDataList};
            });
        });
    };

    const setupStatPollingInterval = (time) => {
        intervalRef.current = setInterval(getData, time);
    };

    const startStatPolling = () => {
        return worker.current.getHandledStatistic(csrf, projectId, ip).then((res) => {
            if (res.success) {
                setupStatPollingInterval(10000);
                const totalCell = (2 * 60) / 10;
                const temp = [];
                for (let i = 0; i <= totalCell - 1; i += 1) {
                    temp.push({
                        id: null,
                        timestamp: '',
                        interface: null,
                    });
                }
                temp.push({
                    id: res.data.id,
                    timestamp: res.data.timestamp,
                    interface: res.data.interface,
                });
                setGraphData({
                    ...graphData,
                    data: temp,
                });
                setInterfaceStatus(res.data.status);
            }
            return res;
        });
    };

    const restartPollingInterval = (interval) => {
        clearInterval(intervalRef.current);
        setGraphData(graph => ({...graph, intervalTime: interval}));
        getData();
        setupStatPollingInterval(interval * 1000);
    };

    const updateTimeRange = (time) => {
        setGraphData(graph => ({...graph, timeRange: time}));
    };

    const startNormalzie = () => {
        setNormalzieRef(graphData.data[graphData.data.length - 1]);
    };

    const csvDataHandler = (data, zipName, currentTime, callback) => {
        const csvZipFactory = new CsvZipFactory();
        const stateExportTemplate = ((arr) => {
            let csv = '';
            arr.forEach((row) => {
                csv += csvZipFactory.createLine(row);
            });
            return csv;
        });
        const addTemplateErr = csvZipFactory.addTemplate('stateCsv', stateExportTemplate);
        if (addTemplateErr.status) {
            return {
                status: false,
                error: addTemplateErr.msg,
            };
        }
        Object.keys(data).forEach((networkDevice) => {
            Object.keys(data[networkDevice]).forEach((type) => {
                const fileName = `${hostname}-${networkDevice}-${type}-${currentTime}.csv`;
                const csvErr = csvZipFactory.createCsv(fileName, 'stateCsv', data[networkDevice][type]);
                if (csvErr.status) throw new Error(csvErr.msg);
            });
        });
        const createZipErr = csvZipFactory.createZip(zipName);
        if (createZipErr.status) {
            return {
                status: false,
                error: createZipErr.msg,
            };
        }
        csvZipFactory.csvArray.forEach((csv) => {
            const addZipErr = csvZipFactory.addCsvToZip(zipName, csv.csvName);
            if (addZipErr.status) {
                return {
                    status: false,
                    error: addZipErr.msg,
                };
            }
        });
        const exportZipErr = csvZipFactory.exportZip(zipName, callback);
        if (exportZipErr.status) {
            return {
                status: false,
                error: exportZipErr.msg,
            };
        }
        return {status: true};
    }

    const exportCsv = (dataUnit, packetUnit, selectedInterface, selectedStat, callback = () => {}) => {
        return worker.current.getExportData(ip, dataUnit, packetUnit, selectedInterface, selectedStat).then((list) => {
            if (!list.success) {
                return {
                    status: false,
                    error: list.error,
                };
            } else {
                const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
                const namePrefix = getOemNameOrAnm(nwManifestName);
                const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
                const projectName = projectIdToNameMap[projectId];
                return csvDataHandler(list.data, `${namePrefix}_${projectName}_${hostname}_network-statistics_${currentTime}.zip`, currentTime, callback);
            }
        });
    };

    const exportNormalzieCsv = (dataUnit, packetUnit, selectedInterface, selectedStat, callback = () => {}) => {
        return worker.current.getExportNormalzieData(ip, dataUnit, packetUnit, selectedInterface, selectedStat, normalzieRef).then((list) => {
            if (!list.success) {
                return {
                    status: false,
                    error: list.error,
                };
            } else {
                const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
                return csvDataHandler(list.data, `${hostname}-network-normalize-statistics-${currentTime}.zip`, currentTime, callback);
            }
        });
    };

    const exportFullPageCsv = (unitObj, selectedInterface, callback = () => {}) => {
        return worker.current.getExportFullPageData(ip, unitObj, selectedInterface).then((list) => {
            if (!list.success) {
                return {
                    status: false,
                    error: list.error,
                };
            } else {
                const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
                return csvDataHandler(list.data, `${hostname}-network-normalize-statistics-${currentTime}.zip`, currentTime, callback);
            }
        });
    }

    return {
        graphData: graphData.data,
        normalzieRef,
        interfaceStatus,
        startStatPolling,
        startNormalzie,
        restartPollingInterval,
        updateTimeRange,
        exportCsv,
        exportNormalzieCsv,
        exportFullPageCsv,
    };
};

export default useStatWorker;
