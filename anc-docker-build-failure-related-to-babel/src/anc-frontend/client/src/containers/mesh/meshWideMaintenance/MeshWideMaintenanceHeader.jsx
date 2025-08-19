import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Constants from '../../../constants/common';

const {themeObj, commonCss} = Constants;

const useStyles = makeStyles({
    mainTitleStyle: commonCss.mainTitleStyle,
    subTitleStyle: commonCss.subTitleStyle,
    root: {
        marginTop: 20,
        flexGrow: 1,
        color: themeObj.txt.normal,
    },
    headerGrid: {
        padding: 0,
        paddingLeft: 30,
        maxWidth: '100%',
    },
});

const MeshWideMaintenanceHeader = () => {
    const classes = useStyles();
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('cluster-maintenance');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    if (!ready) return <span />;
    return (
        <Grid className={classes.headerGrid} item xs={12} lg={12} xl={12}>
            <Typography
                variant="h6"
                className={classNames(classes.root, classes.mainTitleStyle)}
            >
                {t('mainConst', {returnObjects: true}).title}
            </Typography>
            <Typography
                variant="body2"
                className={classNames(classes.headerTitle, classes.subTitleStyle)}
            >
                {t('mainConst', {returnObjects: true}).subTitle}
            </Typography>
        </Grid>
    );
};

export default MeshWideMaintenanceHeader;
