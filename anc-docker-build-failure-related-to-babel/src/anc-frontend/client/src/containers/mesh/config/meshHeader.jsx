/**
 * @Author: mango
 * @Date:   2018-11-13T10:43:07+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T11:03:17+08:00
 */
import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {withTranslation} from 'react-i18next';

const HeaderApp = props => (
    <div style={{margin: '20px 30px 20px 30px'}}>
        <Grid container>
            <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h6" style={{fontSize: '24px'}}>
                    {props.t('meshHeaderTitle')}
                </Typography>
                <Typography variant="body2" style={{margin: '8px 0px 15px 0px', fontSize: '16px'}}>
                    {props.t('meshHeaderDescription')}
                </Typography>
                <Typography variant="h6" style={{marginBottom: '10px', fontSize: '14px'}}>
                    {props.t('meshHeaderNoteTitle')}
                </Typography>
                <Typography variant="body2" style={{fontSize: '12px'}}>
                    {props.t('meshHeaderNote', {returnObjects: true})[0]}
                </Typography>
                <Typography variant="body2" style={{fontSize: '12px'}}>
                    {props.t('meshHeaderNote', {returnObjects: true})[1]}
                </Typography>
            </Grid>
        </Grid>
    </div>
);

HeaderApp.propTypes = {
    t: PropTypes.func.isRequired,
};

export default withTranslation(['cluster-configuration'])(HeaderApp);
