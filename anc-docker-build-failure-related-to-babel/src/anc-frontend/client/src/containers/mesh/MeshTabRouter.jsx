import React, {Suspense} from 'react';
import {useSelector} from 'react-redux';
import {Route, Switch} from 'react-router-dom';
import CommonConstants from '../../constants/common';
import TopologyMain from './TopologyMain';
import ConfigMain from './config/ConfigMain';
import MaintenanceMain from './meshWideMaintenance/MeshWideMaintenanceMain';
import usePolling from '../../components/pollingManagement/usePolling';

// const ConfigMain = lazy(() => import('./config/ConfigMain'));
// const MaintenanceMain = lazy(() => import('./meshWideMaintenance/MeshWideMaintenanceMain'));
// const TopologyMain = lazy(() => import('./TopologyMain'));

const MeshTabContent = () => {
    usePolling();

    return (
        <div
            id="mainLayout"
            style={{
                position: 'fixed',
                height: 'calc(100vh - 48px)',
                display: 'block',
                overflow: 'hidden',
                width: '100%',
            }}
        >
            <Route
                render={({location}) => (
                    <Suspense fallback={<span />}>
                        <Switch location={location}>
                            <Route path='/config' component={ConfigMain} />
                            <Route path='/maintenance' component={MaintenanceMain} />
                            <Route component={TopologyMain} />
                        </Switch>
                    </Suspense>
                )}
            />
        </div>
    );
};

export default MeshTabContent;
