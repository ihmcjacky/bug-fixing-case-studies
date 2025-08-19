import moment from 'moment';
import store from '../store';
import Constants from './spectrumScanConstants';

export function openSpectrumScanDialog(ip) {
    return {
        type: Constants.OPEN_SPECTRUM_SCAN_DIALOG,
        ip,
    };
}

export function closeSpectrumScanDialog() {
    return {
        type: Constants.CLOSE_SPECTRUM_SCAN_DIALOG,
    };
}

export function changeSelectedRadio(selectedRadio) {
    return {
        type: Constants.CHANGE_SELECTED_RADIO,
        selectedRadio,
    };
}


export function changeDuration(duration) {
    return {
        type: Constants.CHANGE_DURATION,
        duration,
    };
}

export function changeFreqRange(range) {
    const freqRange = {
        upper: range[0] > range[1] ? range[0] : range[1],
        lower: range[0] > range[1] ? range[1] : range[0],
    };
    return {
        type: Constants.CHANGE_FREQ_RANGE,
        range: freqRange,
    };
}

export function resetSpectrumScanSettings(defaultRadio) {
    return {
        type: Constants.SPECTRUM_SCAN_SETTINGS_RESET,
        defaultRadio,
    };
}

export function changeRangeToDefault() {
    return {
        type: Constants.CHANGE_SCAN_RANGE_TO_DEFAULT,
    };
}

export function setRadioSettings(data) {
    return {
        type: Constants.SET_RADIO_SETTINGS,
        data,
    };
}


export const setColorMinMax = (min, max) => dispatch =>
    dispatch({
        type: Constants.SET_COLOR_MIN_MAX,
        data: {
            min,
            max,
        },
    });
export function setRadioFreqAndBandwidthMap(data) {
    return {
        type: Constants.SET_RADIO_FREQ_BANDWIDTH_MAP,
        data,
    };
}

export function parsaAnalysisSpectrumDataToGraphData(data, name, dspIterations) {
    const {
        graphInfo: {
            startTime,
            frequencyUpperBound, frequencyLowerBound, frequencyResolution,
        },
        graphData: {waterfall: {avg, max}, waveform},
    } = data;
    const freqRange = {
        upper: frequencyUpperBound,
        lower: frequencyLowerBound,
        resolution: frequencyResolution,
    };

    const dataTime = moment(startTime);

    const waveformGraph = [];
    waveform.some((freqRow) => {
        const {freq, hits} = freqRow;
        if (freq < frequencyLowerBound) return false;
        if (freq > frequencyUpperBound) return true;

        hits.forEach((hit, idx) => {
            if (hit) {
                waveformGraph.push({
                    freq,
                    rssi: -(hits.length - idx - 1),
                    value: hit,
                });
            }
        });
        return false;
    });

    const waterfallGraph = [];
    avg.forEach((avgDataRow, i) => {
        avgDataRow.forEach((avgRssi, j) => {
            if (avgRssi) {
                waterfallGraph.push({
                    // time: time.format(),
                    time: i,
                    freq: frequencyLowerBound + (j * frequencyResolution),
                    avg: avgRssi,
                    max: max[i][j],
                });
            }
        });
    });

    const graphData = {waterfallGraph, waveformGraph};

    return {
        type: Constants.SET_ANALYSIS_GRAPH_DATA,
        data: {
            name,
            graphData,
            freqRange,
            duration: avg.length,
            startTime: dataTime.format(),
            dspIterations,
        },
    };
}

export function handleImportData(data) {
    return {
        type: Constants.HANDLE_IMPORT,
        data,
    };
}

export function handleSpectrumScanWebsocket(data) {
    if (!data.success) {
        return {
            type: Constants.SPECTRUM_WEBSOCKET_ERROR,
            error: data.errors[0].type,
        };
    }
    const {
        spectrumScan: {ip},
        meshTopology: {nodeInfo},
    } = store.getState();
    const {
        graphInfo: {
            startTime,
            frequencyUpperBound, frequencyLowerBound, frequencyResolution,
        },
        graphData: {waterfall: {avg, max}, waveform},
    } = data.data[ip];
    const freqRange = {
        upper: frequencyUpperBound,
        lower: frequencyLowerBound,
        resolution: frequencyResolution,
    };

    const {model} = nodeInfo[ip];
    let dspIterations;
    if (model.match(/^[X][2]/g)) {
        dspIterations = frequencyUpperBound - frequencyLowerBound > 80000 ? 13500 : 1500;
    } else {
        dspIterations = frequencyUpperBound - frequencyLowerBound > 80000 ? 5000 : 1000;
    }

    const dataTime = moment(startTime);

    const waveformGraph = [];
    waveform.some((freqRow) => {
        const {freq, hits} = freqRow;
        if (freq < frequencyLowerBound) return false;
        if (freq > frequencyUpperBound) return true;

        hits.forEach((hit, idx) => {
            if (hit) {
                waveformGraph.push({
                    freq,
                    rssi: -(hits.length - idx - 1),
                    value: hit,
                });
            }
        });
        return false;
    });

    const waterfallGraph = [];
    avg.forEach((avgDataRow, i) => {
        avgDataRow.forEach((avgRssi, j) => {
            if (avgRssi) {
                waterfallGraph.push({
                    // time: time.format(),
                    time: i,
                    freq: frequencyLowerBound + (j * frequencyResolution),
                    avg: avgRssi,
                    max: max[i][j],
                });
            }
        });
    });

    const graphData = {waterfallGraph, waveformGraph};
    return {
        type: Constants.SET_SPECTRUM_SCAN_RESULT,
        data: {
            graphData,
            freqRange,
            duration: avg.length,
            startTime: dataTime.format(),
            dspIterations,
        },
    };
}

export const removeSpectrumScanData = () => dispatch =>
    dispatch({type: Constants.REMOVE_SPECTRUM_SCAN_DATA});


export const startSpectrumScan = () => dispatch =>
    dispatch({type: Constants.START_SPECTRUM_SCAN});

export const spectrumScanEnd = () => dispatch =>
    dispatch({type: Constants.SPECTRUM_SCAN_END});

export function closeSpectrumScanError() {
    return {
        type: Constants.CLEAR_SPECTRUM_ERROR,
    };
}
