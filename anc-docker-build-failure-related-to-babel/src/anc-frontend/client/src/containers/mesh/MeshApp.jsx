import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import P2AppBar from '../appBar/P2AppBar';
import MeshTabRouter from './MeshTabRouter';
import GlobalSnackBar from '../../components/mesh/GlobalSnackBar';
import LogoutDialog from '../../components/common/LogoutDialog';
import ProjectApp from '../../components/projectManagement/ProjectApp';
import useWebsocket from '../../components/websocket/useWebsocket';

/**
 * Mesh App. Render the component only logged in ANM
 *
 * Wrap all the `/mesh/` components in this component
 * websocket connect at did mount
 */
const MeshApp = () => {
    useWebsocket();

    return (
        <BrowserRouter basename="/mesh">
            <P2AppBar />
            <MeshTabRouter />
            <LogoutDialog />
            <ProjectApp />
            <GlobalSnackBar />
        </BrowserRouter>
    );
};

MeshApp.whyDidYouRender = false;

export default MeshApp;
