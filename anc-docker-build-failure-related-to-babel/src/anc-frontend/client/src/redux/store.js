import {configureStore} from '@reduxjs/toolkit';
import {createLogger} from 'redux-logger';
import ReduxThunk from 'redux-thunk';
import commonReducer from './common/commonReducer';
import projectReducer from './projectManagement/projectReducer';
import uiSettingsReducer from './uiSettings/uiSettingsReducer';
import pollingReducer from './pollingScheduler/pollingReducer';
import uiProjectSettingsReducer from './uiProjectSettings/uiProjectSettingsReducer';
import meshTopologyReducer from './meshTopology/meshTopologyReducer';
import notificationCenterReducer from './notificationCenter/notificationReducer';
import dashboardReducer from './dashboard/dashboardReducer';
import linkAlignmentReducer from './linkAlignment/linkAlignmentReducer';
import firmwareUpgradeReducer from './firmwareUpgrade/firmwareUpgradeReducer';
import spectrumScanReducer from './spectrumScan/spectrumScanReducer';
import nodeRecoveryReducer from './nodeRecovery/nodeRecoveryReducer';
import devModeReducer from './devMode/devModeReducer';
import networkEventReducer from './networkEventCenter/networkEventReducer';
import internalSettingsReducer from './internalSettings/internalSettingsReducer';

const logger = store => next => action => {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
}

const middleware = [ReduxThunk, logger];

if (process.env.NODE_ENV === 'development') {
    middleware.push(createLogger({
        level: 'info',
        collapsed: false,
        logger: console,
    }));
}

export default configureStore({
    reducer: {
        common: commonReducer,
        projectManagement: projectReducer,
        uiSettings: uiSettingsReducer,
        polling: pollingReducer,
        uiProjectSettings: uiProjectSettingsReducer,
        meshTopology: meshTopologyReducer,
        notificationCenter: notificationCenterReducer,
        dashboard: dashboardReducer,
        linkAlignment: linkAlignmentReducer,
        firmwareUpgrade: firmwareUpgradeReducer,
        spectrumScan: spectrumScanReducer,
        nodeRecovery: nodeRecoveryReducer,
        devMode: devModeReducer,
        networkEventReducer,
        internalSettings: internalSettingsReducer
    },
    middleware,
});
