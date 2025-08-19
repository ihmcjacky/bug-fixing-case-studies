import {expect} from 'chai';
import * as actions from '../../../redux/spectrumScan/spectrumScanActions';
import Constants from '../../../redux/spectrumScan/spectrumScanConstants';

describe('spectrum scan actions', () => {
    it('should create an action to open SpectrumScan Dialog', () => {
        const ip = '192.168.1.1';
        const expectedAction = {
            type: Constants.OPEN_SPECTRUM_SCAN_DIALOG,
            ip
        };
        expect(actions.openSpectrumScanDialog(ip)).to.be.deep.equals(expectedAction);
    });

    it('should create an action to close SpectrumScan Dialog', () => {
        const expectedAction = {
            type: Constants.CLOSE_SPECTRUM_SCAN_DIALOG,
        };
        expect(actions.closeSpectrumScanDialog()).to.be.deep.equals(expectedAction);
    });
});
