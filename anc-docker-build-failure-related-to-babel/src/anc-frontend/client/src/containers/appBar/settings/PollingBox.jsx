import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import UpdateIcon from '@material-ui/icons/Update';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import CommonConstant from '../../../constants/common';

const useStyles = makeStyles({
});

const {themeObj} = CommonConstant;

const updateIntervalList = [
    10, 20, 30, 40, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480
];

const PollingBox = (props) => {
    const classes = useStyles();
    const {
        t,
        newIntervalOnTopologyView,
        setNewIntervalOnTopologyView,
        newIntervalOnDashboardView,
        setNewIntervalOnDashboardView
    } = props;

    return (
        <div>
            <Typography
                color="primary"
                style={{fontWeight: 'bold', paddingBottom: '20px', paddingTop: '20px',}}
            >
                {t('updateInterval')}
            </Typography>
            <Card>
                {/* -------------Polling------------- */}
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={9} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <UpdateIcon style={{fontSize: '41px'}} />
                        </div>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography
                                color="primary"
                                style={{
                                    paddingLeft: '10px',
                                }}
                            >
                                <strong>{t('updateIntervalOnTopology')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Select
                            value={newIntervalOnTopologyView}
                            name="language"
                            onChange={(e) => {setNewIntervalOnTopologyView(e.target.value);}}
                            style={{flex: 1, float: 'right', width: '150px'}}
                        >
                            {updateIntervalList.map(interval => (
                                    <MenuItem value={interval} key={interval}>
                                        {interval} {t('seconds')}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Grid>
                </Grid>
                <Divider />
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={9} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <UpdateIcon style={{fontSize: '41px'}} />
                        </div>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography
                                color="primary"
                                style={{
                                    paddingLeft: '10px',
                                }}
                            >
                                <strong>{t('updateIntervalOnDashboard')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Select
                            value={newIntervalOnDashboardView}
                            name="language"
                            onChange={(e) => {setNewIntervalOnDashboardView(e.target.value);}}
                            style={{flex: 1, float: 'right', width: '150px'}}
                        >
                            {updateIntervalList.map(interval => (
                                    <MenuItem value={interval} key={interval}>
                                        {interval} {t('seconds')}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

PollingBox.propTypes = {
    t: PropTypes.func.isRequired,
};

export default PollingBox;
