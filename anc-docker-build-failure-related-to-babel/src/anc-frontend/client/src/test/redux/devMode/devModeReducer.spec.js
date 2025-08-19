/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import reducer from '../../../redux/devMode/devModeReducer';
import Constants from '../../../redux/devMode/devModeConstants';

describe('spectrum scan reducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            enableBoundlessConfig: false,
            enableDebugCountry: false,
            enableBatchFwUpgrade: true,
            enableWatchdogConfig: false,
            enableGraphicSettings: false,
            enableExportAnmRawLog: false,
        };
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).to.be.deep.equals(initialState);
    });

    it('should able to switch boundless config on / off', () => {
        const switchBoundlessConfigOnAction = {
            type: Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF,
            enable: true,
        };
        let updatedStore;

        updatedStore = reducer([initialState], switchBoundlessConfigOnAction);
        expect(updatedStore.enableBoundlessConfig).to.be.true;

        const switchBoundlessConfigOffAction = {
            type: Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF,
            enable: false,
        };

        updatedStore = reducer([initialState], switchBoundlessConfigOffAction);
        expect(updatedStore.enableBoundlessConfig).to.be.false;
    });

    it('should able to switch debug country on / off', () => {
        const switchDebugCountryOnAction = {
            type: Constants.SWITCH_DEBUG_COUNTRY_ON_OFF,
            enable: true,
        };
        let updatedStore;

        updatedStore = reducer([initialState], switchDebugCountryOnAction);
        expect(updatedStore.enableDebugCountry).to.be.true;

        const switchDebugCountryOffAction = {
            type: Constants.SWITCH_DEBUG_COUNTRY_ON_OFF,
            enable: false,
        };

        updatedStore = reducer([initialState], switchDebugCountryOffAction);
        expect(updatedStore.enableDebugCountry).to.be.false;
    });

    it('should able to switch batch fw upgrade on / off', () => {
        const switchBatchFwUpgradeOnAction = {
            type: Constants.SWITCH_BATCH_FW_UPGRADE,
            enable: true,
        };
        let updatedStore;

        updatedStore = reducer([initialState], switchBatchFwUpgradeOnAction);
        expect(updatedStore.enableBatchFwUpgrade).to.be.true;

        const switchBatchFwUpgradeOffAction = {
            type: Constants.SWITCH_BATCH_FW_UPGRADE,
            enable: false,
        };

        updatedStore = reducer([initialState], switchBatchFwUpgradeOffAction);
        expect(updatedStore.enableBatchFwUpgrade).to.be.false;
    });
});