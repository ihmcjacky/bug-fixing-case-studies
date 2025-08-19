/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-02-10 13:23:46
 * @ Modified by: Kyle Suen
 * @ Modified time: 2021-01-06 15:41:37
 * @ Description:
 */

import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
// import {saveAs} from 'file-saver';
import saveAs from '../../util/nw/saveAs';
import JSZip from 'jszip';
import PropTypes from 'prop-types';
import moment from 'moment';
import {getProjectDebugInfo, getDebugInfo, exportHistoricalData} from '../../util/apiCall';
import {toggleSnackBar} from '../../redux/common/commonActions';
import {getOemNameOrAnm} from '../../util/common';

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const sourceApiList = ['GET /mesh-topology', 'POST /node-info', 'POST /link-info', 'GET /project-list'];

const useSystemLogExport = ({
    type,
    nodeIp,
    hostname: nodeHostname,
    t,
    pollingHandler = {
        stopInterval: () => null,
        restartInterval: () => null,
    }
}) => {
    const dispatch = useDispatch();
    const {
        csrf,
        hostInfo: {hostname, port},
    } = useSelector(state => state.common);
    const {projectId, projectIdToNameMap} = useSelector(store => store.projectManagement);
    const graphNodeInfo = useSelector(state => state.meshTopology.nodeInfo);
    const [isLock, setIsLock] = useState(false);
    const [exportType, setExportType] = useState(type === 'node' ? 'nodeLogFile' : 'clusterAllNodes');
    const [selectedId, setSelectedId] = useState([]);
    const [selectedDateFrom, setSelectedDateFrom] = useState(moment().subtract(1, 'hours').format('YYYY-MM-DDTHH:mm'));
    const [selectedDateTo, setSelectedDateTo] = useState(moment().format('YYYY-MM-DDTHH:mm'));
    const [selectedApiList, setSelectedApiList] = useState(sourceApiList);
    const [dialog, setDialog] = useState({
        open: false,
        handleClose: () => null,
        title: '',
        content: '',
        submitButton: 'OK',
        submitAction: () => null,
        cancelButton: '',
        cancelAction: () => null,
    });

    const handleDialogOnClose = () => {
        setDialog(prevState => ({
            ...prevState,
            open: false,
        }));
    };

    const handleSelectClick = (event, id) => {
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];
        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
        } else if (selectedIdIndex === 0) {
            newSelectedId = newSelectedId.concat(selectedId.slice(1));
        } else if (selectedIdIndex === selectedId.length - 1) {
            newSelectedId = newSelectedId.concat(selectedId.slice(0, -1));
        } else if (selectedIdIndex > 0) {
            newSelectedId = newSelectedId.concat(
                selectedId.slice(0, selectedIdIndex),
                selectedId.slice(selectedIdIndex + 1)
            );
        }

        setSelectedId(newSelectedId);
    };

    const handleSelectAllClick = (event, checked, idArray) => {
        if (checked) {
            setSelectedId(idArray);
            return;
        }
        setSelectedId([]);
    };

    const exportLog = async () => {
        // call api to get debug info
        setIsLock(true);
        pollingHandler.stopInterval();

        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
        const projectName = projectIdToNameMap[projectId];

        let filename = '';
        let bodyMsg = {};
        console.warn(exportType)
        switch (exportType) {
            case 'nodeLogFile':
                filename = `${namePrefix}_${projectName}_${nodeHostname}_node-logs_${currentTime}`
                bodyMsg = {nodes: [nodeIp], includeAnmLog: false};
                break;
            case 'nodeCoreDump':
                bodyMsg = {targetNode: nodeIp};
                filename = `${ namePrefix }_${ projectName }_${ nodeHostname } _core-dump_${ currentTime }.zip`
                break;
            case 'clusterAllNodes':
                filename = `${namePrefix}_${projectName}_cluster-logs_${currentTime}.zip`
                bodyMsg = {allNodes: true, includeAnmLog: false};
                break;
            case 'clusterSpecificNodes':
                filename = `${namePrefix}_${projectName}_node-logs_${currentTime}.zip`
                bodyMsg = {nodes: selectedId, includeAnmLog: false}
                break;
            case 'anmRawLog':
                const dateFrom = new Date(selectedDateFrom);
                const dateFromWithTimezone = dateFrom.toISOString();
                const dateTo = new Date(selectedDateTo);
                const dateToWithTimezone = dateTo.toISOString();
                filename = `${namePrefix}_${projectName}_system-log_${currentTime}.zip`
                bodyMsg = {
                    filter: [{projectId}],
                    dateStart: dateFromWithTimezone,
                    dateEnd: dateToWithTimezone,
                    sourceApi: selectedApiList
                }
                break;
            default:
                break;
        }
        let error = null;
        let data = null;
        // for cluster log export
        if (exportType === 'clusterAnmLogs') {
            filename = `${namePrefix}_${projectName}_system-log_${currentTime}.tar.gz`;
            ({error, data} = await wrapper(getDebugInfo(csrf)));
        } else if (exportType === 'anmRawLog') {
            try {
                const res = await exportHistoricalData(csrf, projectId, bodyMsg);
                const path = `http://${hostname}:${port}/media/runtime/${projectId}/anmRawLog.zip`;
                fetch(path).then((res) => {
                    if (res.status === 200) {
                        data = res;
                    } else {
                        error = res;
                    }
                });
            } catch(e) {
                error = e;
            }
        } else {
            console.log('getProjectDebugInfo');
            ({error, data} = await wrapper(getProjectDebugInfo(csrf, projectId, bodyMsg)));
        }

        if (error) {
            setIsLock(false);
            pollingHandler.restartInterval();
            setDialog(prevState => ({
                ...prevState,
                open: true,
                handleClose: handleDialogOnClose,
                title: 'failDialogTitle',
                content: 'failDialogContent',
                submitButton: 'okTitle',
                submitAction: handleDialogOnClose,
                cancelButton: '',
            }));
            return;
        }

        if (exportType === 'anmRawLog') {
            setDialog(prevState => ({
                ...prevState,
                open: true,
                handleClose: handleDialogOnClose,
                title: 'successDialogTitle',
                content: 'successDualogContent',
                submitButton: 'downloadTitle',
                submitAction: async () => {
                        if (data.status === 200) {
                            data.blob().then(async (q) => {
                                saveAs(q, filename, '.zip').then((res) => {
                                    if (res.success) {
                                        dispatch(toggleSnackBar(t('downloadCompleted')));
                                        setIsLock(false);
                                        pollingHandler.restartInterval();
                                        handleDialogOnClose();
                                    }
                                });
                            });
                        }
                },
                cancelButton: 'cancelTitle',
                cancelAction: () => {
                    setIsLock(false);
                    pollingHandler.restartInterval();
                    handleDialogOnClose();
                },
            }));
        } else {
            // const filename = `${namePrefix}_${projectName}_${nodeHostname}_core-dump_${currentTime}`;
            setDialog(prevState => ({
                ...prevState,
                open: true,
                handleClose: handleDialogOnClose,
                title: 'successDialogTitle',
                content: 'successDualogContent',
                submitButton: 'downloadTitle',
                submitAction: async () => {
                    const {data: res} = await wrapper(saveAs(data.data.file, filename, '.tar.gz'));
                    if (res.success) {
                        dispatch(toggleSnackBar(t('downloadCompleted')));
                    }
                    setIsLock(false);
                    pollingHandler.restartInterval();
                    handleDialogOnClose();
                },
                cancelButton: 'cancelTitle',
                cancelAction: () => {
                    setIsLock(false);
                    pollingHandler.restartInterval();
                    handleDialogOnClose();
                },
            }));
        }
    };

    return {
        exportType,
        exportLog,
        setExportType,
        handleSelectClick,
        handleSelectAllClick,
        selectedId,
        upTime: graphNodeInfo?.[nodeIp]?.uptime ?? 0,
        dialog,
        isLock,
        selectedDateFrom,
        selectedDateTo,
        selectedApiList,
        setSelectedDateFrom,
        setSelectedDateTo,
        setSelectedApiList
    };
};

useSystemLogExport.propTypes = {
    type: PropTypes.string.isRequired,
    nodeIp: PropTypes.string,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ),
};

useSystemLogExport.defaultProps = {
    nodeIp: '0',
    pollingHandler: {
        restartInterval: () => null,
        stopInterval: () => null,
    },
};

export default useSystemLogExport;
