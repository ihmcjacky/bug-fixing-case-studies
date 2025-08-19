/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {stub} from 'sinon';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../../../redux/uiSettings/uiSettingsActions';
import Constants from '../../../redux/uiSettings/uiSettingsConstants';
import * as apiCall from '../../../util/apiCall';

describe('ui settings actions', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            landingView: 'topology',
            enableFwDowngrade: false,
            projectBackgroundIdList: {},
            secret: {},
            shouldHelpDialogPopUp: {
                meshTopology: false,
                project: true,
                quickStaging: true,
            },
            showLinkLabel: true,
            rssiColor: {
                enable: false,
                color: {
                    max: -60,
                    min: -75,
                },
            },
            dashboard: {
                trafficLoadSettings: {
                    device: 'radio',
                    dataType: 'tx+rx',
                },
            },
        };
    });

    // example for async action test
    it('should call getUiSettings api and pass the response to action', () => {
        const mockResponseData = {
            landingView: 'topology',
        };
        const stubGetUiSettings = stub(apiCall, 'getUiSettings')
            .returns(new Promise(resolve => resolve(mockResponseData)));
        const middlewares = [thunk];
        const mockStore = configureMockStore(middlewares);
        const store = mockStore({
            common: {
                csrf: 'test-csrf',
            },
            uiSettings: initialState,
        });

        return store.dispatch(actions.updateUiSettings(false)).then(() => {
            expect(stubGetUiSettings.calledOnce).to.be.true;

            const actionCalled = store.getActions()[0];
            expect(actionCalled.type).to.be.equals(Constants.UPDATE_UI_SETTINGS);
            expect(actionCalled.data).to.be.deep.equals(mockResponseData);
            stubGetUiSettings.restore();
        });
    });

    it('should reset enableFwDowngrade when new login session', () => {
        const mockResponseData = {
            landingView: 'topology',
            enableFwDowngrade: true
        };
        const stubSetUiSettings = stub(apiCall, 'setUiSettings')
            .returns(new Promise(resolve => resolve({})));
        const stubGetUiSettings = stub(apiCall, 'getUiSettings')
            .returns(new Promise(resolve => resolve(mockResponseData)));
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)
        const store = mockStore({
            common: {csrf: 'test-csrf'},
            uiSettings: initialState,
        });

        const newSession = true;

        return store.dispatch(actions.updateUiSettings(newSession)).then(() => {
            const actionCalled = store.getActions()[0];
            expect(actionCalled.type).to.be.equals(Constants.UPDATE_UI_SETTINGS);
            expect(actionCalled.data).to.be.deep.equals({
                ...mockResponseData,
                enableFwDowngrade: false,
            });
            stubGetUiSettings.restore();
            stubSetUiSettings.restore();
        });
    });

    it('should not update store when get ui settings false', () => {
        const stubGetUiSettings = stub(apiCall, 'getUiSettings')
            .returns(new Promise((resolve, reject) => reject({})));
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)
        const store = mockStore({
            common: {
                csrf: 'test-csrf',
            },
            uiSettings: initialState,
        });

        const newSession = true;

        return store.dispatch(actions.updateUiSettings(newSession)).then(() => {
            const actionCalled = store.getActions()[0];
            expect(actionCalled).to.be.undefined;
            stubGetUiSettings.restore();
        });
    });
});
