import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const ConfigHeader = (props) => {
    const {t} = props;
    return (
        <div style={{margin: '20px 30px 20px 30px'}}>
        <Grid container>
            <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h6" style={{fontSize: '24px'}}>
                    {t('meshHeaderTitle')}
                </Typography>
                <Typography variant="body2" style={{margin: '8px 0px 15px 0px', fontSize: '16px'}}>
                    {t('meshHeaderDescription')}
                </Typography>
                <Typography variant="h6" style={{marginBottom: '10px', fontSize: '14px'}}>
                    {t('meshHeaderNoteTitle')}
                </Typography>
                <Typography variant="body2" style={{fontSize: '12px'}}>
                    {t('meshHeaderNote', {returnObjects: true})[0]}
                </Typography>
                <Typography variant="body2" style={{fontSize: '12px'}}>
                    {t('meshHeaderNote', {returnObjects: true})[1]}
                </Typography>
            </Grid>
        </Grid>
    </div>
    );
};

ConfigHeader.propTypes = {
    t: PropTypes.func.isRequired,
};

export default ConfigHeader;
