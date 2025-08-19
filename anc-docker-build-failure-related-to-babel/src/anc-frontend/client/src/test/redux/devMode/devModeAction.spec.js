import {expect} from 'chai';
import * as actions from '../../../redux/devMode/devModeActions';
import Constants from '../../../redux/devMode/devModeConstants';

describe('devMode actions', () => {
    it('should create an action to switch boundless config on / off', () => {
        const boundlessConfigOffAction = {
            type: Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF,
            enable: false,
        };
        expect(actions.switchBoundlessConfigOnOff(false)).to.be.deep.equals(boundlessConfigOffAction);

        const boundlesConfigOnAction = {
            type: Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF,
            enable: true,
        };
        expect(actions.switchBoundlessConfigOnOff(true)).to.be.deep.equals(boundlesConfigOnAction);
    });

    it('should create an action to switch debug country config on / off', () => {
        const debugCountryOffAction = {
            type: Constants.SWITCH_DEBUG_COUNTRY_ON_OFF,
            enable: false,
        };
        expect(actions.switchDebugCountryOnOff(false)).to.be.deep.equals(debugCountryOffAction);

        const debugCountryOnAction = {
            type: Constants.SWITCH_DEBUG_COUNTRY_ON_OFF,
            enable: true,
        };
        expect(actions.switchDebugCountryOnOff(true)).to.be.deep.equals(debugCountryOnAction);
    });
});
