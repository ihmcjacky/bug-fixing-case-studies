import React, {Suspense} from 'react';
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom';
import {MuiThemeProvider} from '@material-ui/core/styles';
import MeshApp from '../containers/mesh/MeshApp';
import LoginApp from '../containers/login/LoginApp';
import CommonConstants from '../constants/common';

// const MeshApp = lazy(() => import('../containers/mesh/MeshApp'));
// const LoginApp = lazy(() => import('../containers/login/LoginApp'));

const {theme} = CommonConstants;

/**
 * Main router
 *
 * If not login Anm, UI should render `LoginApp`
 * otherwise, UI should enter `MeshApp`
 */
const MainRouter = () => {
    return (
        <MuiThemeProvider theme={theme}>
            <BrowserRouter>
                <Route render={({location}) => (
                        <Suspense fallback={<div>loading</div>}>
                            <Switch location={location}>
                                <Route path='/' exact component={MeshApp} />
                                <Route path='/login' component={LoginApp} />
                                <Route path='/mesh' component={MeshApp} />
                            </Switch>
                        </Suspense>
                    )}
                />
            </BrowserRouter>
        </MuiThemeProvider>
    );
};

export default MainRouter;
