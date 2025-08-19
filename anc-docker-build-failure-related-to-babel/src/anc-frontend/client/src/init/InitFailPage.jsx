import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useWindowOnChange from '../components/common/useWindowOnChange';
import P2Tooltip from '../components/common/P2Tooltip';
import common from '../constants/common';

const {colors} = common;

const useStyles = makeStyles({
    gridRoot: {
        flexGrow: 1,
        paddingTop: '65px',
        width: '45%',
        margin: 'auto',
    },
    grid: {
        '&:hover': {
            opacity: '0.8',
            cursor: 'pointer',
        },
    },
    // gridBtnRetry: {
    //     boxShadow: 'none',
    //     height: '100px',
    //     width: '100px',
    //     backgroundColor: 'rgb(229, 229, 229)',
    //     color: 'rgba(33, 33, 33, 0.785)',
    //     "&:hover, &:focus": {
    //         backgroundColor: colors.popupSubMenuMain,
    //         color: 'white',
    //     },
    // },
    gridBtn: {
        boxShadow: 'none',
        height: '100px',
        width: '100px',
        backgroundColor: 'rgb(229, 229, 229)',
        color: 'rgba(33, 33, 33, 0.785)',
        "&:hover, &:focus": {
            backgroundColor: colors.popupSubMenuMain,
            color: 'white',
        },
    },
    btnIcon: {
        width: '100%',
        textAlign: 'center',
        paddingTop: '15px',
        color: 'inhert',
    },
});

const InitFailPage = (props) => {
    const {loadInitData, debugFunc} = props;
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('init-fail-page');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 

    const classes = useStyles();
    const {width, height} = useWindowOnChange();

    let portDebug = null;
    if (process.env.NODE_ENV !== 'production') {
        portDebug = (
            <div
                id="fail-debug-input"
                style={{
                    display: 'none',
                    position: 'absolute',
                    bottom: '10px',
                }}
            >
                <label >hostname:</label>
                <input type="text" id="debug-hostname" />
                <label >port:</label>
                <input type="number" id="debug-port" />
                <button onClick={() => {
                    const hostname = document.getElementById('debug-hostname').value;
                    const port = parseInt(document.getElementById('debug-port').value, 10);
                    debugFunc(hostname, port);
                }}>apply</button>
            </div>
        )
    }

    if (!ready) return <span />;
    return (
        <div
            style={{
                width, height,
                backgroundColor: 'rgb(229, 229, 229)',
            }}
        >
            <div
                style={{
                    textAlign: 'center',
                    margin: 'auto',
                    width: '50%',
                    paddingTop: '15%',
                }}
            >
                <Typography
                    style={{
                        fontSize: '34px',
                        fontWeight: 700,
                        color: colors.mismatchLabel,
                    }}
                >
                    <span
                        className="material-icons"
                        style={{
                            fontSize: '40px',
                            paddingRight: '20px',
                            verticalAlign: 'sub',
                        }}
                    >
                        cloud_off
                    </span>
                    <span>
                        {t('failedContent')}
                    </span>
                </Typography>
                <Grid
                    container
                    justify="space-between"
                    className={classes.gridRoot}
                    alignItems="stretch"
                >
                    <Grid className={classes.grid} item>
                        <P2Tooltip
                            title={t('retry')}
                            content={
                                <Card
                                    className={classes.gridBtn}
                                    onClick={loadInitData}
                                >
                                    <div className={classes.btnIcon}>
                                        <i className="material-icons" style={{fontSize: '68px'}}>
                                            replay
                                        </i>
                                    </div>
                                </Card>
                            }
                            direction="bottom"
                        />
                    </Grid>
                    <Grid className={classes.grid} item >
                        <P2Tooltip
                            title={t('close')}
                            content={
                                <Card
                                    className={classes.gridBtn}
                                    onClick={() => {
                                        window.nw.App.closeAllWindows();
                                    }}
                                >
                                    <div className={classes.btnIcon}>
                                        <i className="material-icons" style={{fontSize: '68px'}}>
                                            close
                                        </i>
                                    </div>
                                </Card>
                            }
                            direction="bottom"
                        />
                    </Grid>
                </Grid>
                {portDebug}
            </div>
        </div>
    );
};

InitFailPage.propTypes = {
    loadInitData: PropTypes.func.isRequired,
    debugFunc: PropTypes.func.isRequired,
};

export default InitFailPage;
