import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

const DevOptionRow = (props) => {
    const {
        title,
        subtitle,
        checked,
        switchOnChangeFunc,
    } = props;
    return (
        <Grid
            container
            direction="row"
            style={{padding: '30px 25px 30px 25px'}}
            alignItems="center"
            justify="space-between"
        >
            <Grid item xs={12} sm={10}>
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                >
                    <Typography
                        color="inherit"
                        style={{paddingLeft: '4px'}}
                    >
                        {title}
                    </Typography>
                    <Typography
                        color="inherit"
                        style={{
                            paddingLeft: '4px',
                            fontSize: '12px',
                            opacity: 0.46,
                        }}
                    >
                        {subtitle}
                    </Typography>
                </div>
            </Grid>
            <Grid item xs={12} sm={2}>
                <div style={{float: 'right'}}>
                    <Switch
                        checked={checked}
                        onChange={switchOnChangeFunc}
                        style={{height: 'auto'}}
                        color="primary"
                        disableRipple
                    />
                </div>
            </Grid>
        </Grid>
    );
};

DevOptionRow.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    switchOnChangeFunc: PropTypes.func.isRequired,
};

export default DevOptionRow;
