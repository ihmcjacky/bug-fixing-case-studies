import WebWorker from '../WebWorker';
import StatisticWorker from './StatisticWorker';
import store from '../../../redux/store';
import {getNetworkDeviceStat} from '../../apiCall';

const resolves = {};
const rejects = {};
let globalMsgId = 0;
// Activate calculation in the worker, returning a promise
function sendMsg(worker, payload) {
    globalMsgId += 1;
    const msgId = globalMsgId;
    const msg = {
        id: msgId,
        payload,
    };
    return new Promise(((resolve, reject) => {
    // save callbacks for later
        resolves[msgId] = resolve;
        rejects[msgId] = reject;
        worker.postMessage(msg);
    }));
}
// Handle incoming calculation result
function handleMsg(msg) {
    console.log('handleMsg');
    console.log(msg);
    const {id, err, payload} = msg.data;
    if (payload) {
        const resolve = resolves[id];
        if (resolve) {
            console.log('resolve');
            resolve(payload);
        }
    } else {
    // error condition
        const reject = rejects[id];
        if (reject) {
            if (err) {
                reject(err);
            } else {
                reject('Got nothing');
            }
        }
    }

    // purge used callbacks
    delete resolves[id];
    delete rejects[id];
}

/**
 * A singleton class
 * An agent to call all statistic worker func and store all the current statistic box id
 */
export default class StatisticWorkerCaller {
    constructor(id) {
        if (StatisticWorkerCaller.instance instanceof StatisticWorkerCaller) {
            if (StatisticWorkerCaller.instance.idList.indexOf(id) === -1) {
                StatisticWorkerCaller.instance.idList.push(id);
            }
            return StatisticWorkerCaller.instance;
        }

        this.worker = new WebWorker(StatisticWorker);
        this.worker.onmessage = handleMsg;
        this.idList = [id];

        StatisticWorkerCaller.instance = this;
    }

    clearWorkerData(ip) {
        return sendMsg(this.worker, {
            type: 'clear-device-stat',
            data: {ip},
        });
    }

    terminate(id) {
        this.idList = this.idList.filter(str => str !== id);
        this.clearWorkerData(id).then(() => {
            if (this.idList.length === 0) {
                this.worker.terminate();
                StatisticWorkerCaller.instance = undefined;
            }
        });
    }

    getStatistic(csrf, projectId, ip) {
        const {hostname, port} = store.getState().common.hostInfo;
        return sendMsg(this.worker, {
            type: 'get-network-device-stat',
            data: {csrf, projectId, ip, hostname, port},
        });
    }

    getExportData(ip, dataUnit, packetUnit, selectedInterface, selectedStat) {
        return sendMsg(this.worker, {
            type: 'get-export-data',
            data: {
                ip, dataUnit, packetUnit, selectedInterface, selectedStat,
            },
        });
    }

    getExportNormalzieData(ip, dataUnit, packetUnit, selectedInterface, selectedStat, normalzieRef) {
        return sendMsg(this.worker, {
            type: 'get-export-normalzie-data',
            data: {
                ip, dataUnit, packetUnit, selectedInterface, selectedStat, normalzieRef,
            },
        });
    }

    getExportFullPageData(ip, unitObj, selectedInterface) {
        return sendMsg(this.worker, {
            type: 'get-export-full-page-data',
            data: {
                ip, unitObj, selectedInterface,
            },
        });
    }

    getHandledStatistic(csrf, projectId, ip) {
        return getNetworkDeviceStat(csrf, projectId, {nodes: [ip]}).then((res) => {
            return sendMsg(this.worker, {
                type: 'handle-device-stat-response',
                data: {
                    ip,
                    data: res[ip],
                    error: false,
                },
            });
        }).catch((e) => {
            if (e?.data?.type === 'specific') {
                if (e?.data?.data[ip]?.success) {
                    return sendMsg(this.worker, {
                        type: 'handle-device-stat-response',
                        data: {
                            ip,
                            data: e.data.data[ip],
                            error: false,
                        },
                    });
                }
            }
            return sendMsg(this.worker, {
                type: 'handle-device-stat-response',
                data: {
                    ip,
                    error: true,
                },
            });
        });
    }
}
