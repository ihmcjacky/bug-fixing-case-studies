import React from 'react';
import {MuiThemeProvider} from '@material-ui/core/styles/';
import Grid from '@material-ui/core/Grid';
import MeshWideMaintenanceHeader from './MeshWideMaintenanceHeader';
import MeshWideMaintenanceContent from './MeshWideMaintenanceContent';
import Constants from '../../../constants/common';

const {theme, colors} = Constants;

const MeshWideMaintenanceMain = () => {
    return (
        <MuiThemeProvider theme={theme}>
            <Grid
                container
                style={{
                    flexGrow: 1,
                    marginLeft: 0,
                    paddingLeft: 0,
                    background: colors.background,
                }}
            >
                <MeshWideMaintenanceHeader />
                <MeshWideMaintenanceContent />
            </Grid>
        </MuiThemeProvider>
    );
};

export default MeshWideMaintenanceMain;