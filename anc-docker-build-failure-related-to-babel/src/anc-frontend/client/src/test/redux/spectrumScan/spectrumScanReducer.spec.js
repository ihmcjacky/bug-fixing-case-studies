/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import reducer from '../../../redux/spectrumScan/spectrumScanReducer';
import Constants from '../../../redux/spectrumScan/spectrumScanConstants';

describe('spectrum scan reducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
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
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).to.be.deep.equals(initialState);
    });

    it('should return the state with open dialog', () => {
        const ip = '192.168.1.1';
        const expectedAction = {
            type: Constants.OPEN_SPECTRUM_SCAN_DIALOG,
            ip,
        };

        const updatedStore = reducer([initialState], expectedAction);
        expect(updatedStore.open).to.be.true;
        expect(updatedStore.ip).to.be.equals(ip);
    });

    it('should return the state with close dialog', () => {
        const state = {
            ...initialState,
            open: true,
            ip: '192.168.1.1',
        };
        const expectedAction = {
            type: Constants.CLOSE_SPECTRUM_SCAN_DIALOG,
        };

        const updatedStore = reducer([state], expectedAction);
        expect(updatedStore.open).to.be.false;
        expect(updatedStore.ip).to.be.equals('');
    });
});