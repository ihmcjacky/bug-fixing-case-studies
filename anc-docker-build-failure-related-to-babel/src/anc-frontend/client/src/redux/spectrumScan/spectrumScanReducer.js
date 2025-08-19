import Constants from './spectrumScanConstants';

const initData = [];

for (let i = 0; i <= 64 * 6; i += 1) {
    initData.push([]);
    for (let j = 0; j <= 130; j += 1) {
        initData[i].push({frequency: (i * 10) + 5180, rssi: j * -1, value: 0});
    }
}

const INITIAL_STATE = {
    open: false,
    ip: '',
    selectedRadio: '',
    scanning: false,
    isAnalysisData: false,
    freqRange: {
        upper: 5815,
        lower: 5170,
    },
    duration: 10,
    radioSettings: {
        actualValue: {},
        displayValue: {},
    },
    color: {
        min: '0',
        max: '98',
    },
    waterfallMapData: {
        data: [],
        timestamp: 0,
    },
    radioFreqBandwidthMap: {},
    graphData: {
        startTime: '',
        hasData: false,
        waveformGraph: [],
        waterfallGraph: [],
        duration: 10,
        dspIterations: 1000,
        freqRange: {
            upper: 0,
            lower: 0,
            resolution: 0,
        },
        filename: '',
    },
    scanError: {
        hasError: false,
        errorType: '',
    },
};

function spectrumScanReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.OPEN_SPECTRUM_SCAN_DIALOG: {
            return {
                ...state,
                open: true,
                ip: action.ip,
                selectedRadio: 'radio0',
            };
        }
        case Constants.CLOSE_SPECTRUM_SCAN_DIALOG: {
            return {
                ...state,
                open: false,
                ip: '',
            };
        }
        case Constants.CHANGE_SELECTED_RADIO: {
            const {centralFreq, bandwidth} = state.radioFreqBandwidthMap[action.selectedRadio];
            const range = bandwidth / 2;
            return {
                ...state,
                selectedRadio: action.selectedRadio,
                freqRange: {
                    upper: centralFreq + range,
                    lower: centralFreq - range,
                },
            };
        }
        case Constants.CHANGE_DURATION: {
            return {
                ...state,
                duration: action.duration,
            };
        }
        case Constants.CHANGE_FREQ_RANGE: {
            return {
                ...state,
                freqRange: action.range,
            };
        }
        case Constants.SPECTRUM_SCAN_SETTINGS_RESET: {
            const radio = `radio${action.defaultRadio}`;
            const {centralFreq, bandwidth} = state.radioFreqBandwidthMap[radio];
            const range = bandwidth / 2;
            return {
                ...state,
                selectedRadio: radio,
                freqRange: {
                    upper: centralFreq + range,
                    lower: centralFreq - range,
                },
                duration: 10,
            };
        }
        case Constants.CHANGE_SCAN_RANGE_TO_DEFAULT: {
            const {centralFreq, bandwidth} = state.radioFreqBandwidthMap[state.selectedRadio];
            const range = bandwidth / 2;
            return {
                ...state,
                freqRange: {
                    upper: centralFreq + range,
                    lower: centralFreq - range,
                },
            };
        }
        case Constants.SET_RADIO_SETTINGS: {
            const {centralFreq, bandwidth} = state.radioFreqBandwidthMap[state.selectedRadio];
            const range = bandwidth / 2;
            return {
                ...state,
                radioSettings: {
                    ...action.data,
                },
                freqRange: {
                    upper: centralFreq + range,
                    lower: centralFreq - range,
                },
            };
        }
        case Constants.SET_COLOR_MIN_MAX: {
            return {
                ...state,
                color: {
                    min: action.data.min,
                    max: action.data.max,
                },
            };
        }
        // case Constants.HANDLE_SOCKET_RES: {
        //     console.log(action);
        case Constants.SET_RADIO_FREQ_BANDWIDTH_MAP: {
            return {
                ...state,
                radioFreqBandwidthMap: action.data,
            };
        }
        // case Constants.HANDLE_SOCKET_RES: {
        //     return {
        //         ...state,
        //         graphData: action.newGraph,
        //         // allData: state.allData.push(action.newData),
        //         temp: action.newTemp,
        //         allData: action.allData,
        //         waterfallMapData: action.newWaterfallData ? {
        //             data: [...state.waterfallMapData.data, action.newWaterfallData.newGraph],
        //             timestamp: action.newWaterfallData.newData.timestamp,
        //         } : state.waterfallMapData,
        //     };
        // }
        // case Constants.HANDLE_IMPORT: {
        //     return {
        //         ...state,
        //         graphData: action.data.newGraph,
        //         // allData: state.allData.push(action.newData),
        //         temp: action.newTemp,
        //         allData: action.data._allData,
        //         waterfallMapData: {
        //             data: action.data.graphData,
        //             timestamp: action.data.timestamp,
        //         },
        //     };
        // }
        // case Constants.HANDLE_WATERFALL_RES: {
        //     return {
        //         ...state,
        //         waterfallMapData: {
        //             data: [...state.waterfallMapData.data, action.newGraph],
        //             timestamp: action.newData.timestamp,
        //         },
        //     };
        // }
        case Constants.SET_ANALYSIS_GRAPH_DATA: {
            return {
                ...state,
                isAnalysisData: true,
                graphData: {
                    ...state.graphData,
                    filename: action.data.name,
                    hasData: true,
                    startTime: action.data.startTime,
                    freqRange: action.data.freqRange,
                    duration: action.data.duration,
                    waterfallGraph: action.data.graphData.waterfallGraph,
                    waveformGraph: action.data.graphData.waveformGraph,
                    dspIterations: action.data.dspIterations,
                },
            };
        }
        case Constants.REMOVE_SPECTRUM_SCAN_DATA: {
            return INITIAL_STATE;
        }
        case Constants.SET_SPECTRUM_SCAN_RESULT: {
            return {
                ...state,
                isAnalysisData: false,
                scanning: false,
                graphData: {
                    ...state.graphData,
                    hasData: true,
                    startTime: action.data.startTime,
                    freqRange: action.data.freqRange,
                    duration: action.data.duration,
                    waterfallGraph: action.data.graphData.waterfallGraph,
                    waveformGraph: action.data.graphData.waveformGraph,
                    dspIterations: action.data.dspIterations,
                },
            };
        }
        case Constants.START_SPECTRUM_SCAN: {
            return {
                ...state,
                scanning: true,
            };
        }
        case Constants.SPECTRUM_SCAN_END: {
            return {
                ...state,
                scanning: false,
            };
        }
        case Constants.SPECTRUM_WEBSOCKET_ERROR: {
            return {
                ...state,
                scanError: {
                    hasError: true,
                    errorType: action.error,
                },
                scanning: false,
            };
        }
        case Constants.CLEAR_SPECTRUM_ERROR: {
            return {
                ...state,
                scanError: {
                    hasError: false,
                    errorType: '',
                },
            };
        }
        default: return state;
    }
}

export default spectrumScanReducer;
