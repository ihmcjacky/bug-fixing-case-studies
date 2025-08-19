import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Constant from '../../constants/common';
import {convertIpToMac} from '../../util/formatConvertor';
import {searchDisplayValue} from './spectrumScanHelperFunc';

const {colors} = Constant;
const styles = {
    deviceDescriptionHeader: {
        fontSize: '18px',
        color: colors.deviceDescriptionHeader,
    },
    deviceDescriptionContent: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
};
const useStyles = makeStyles(styles);

const SpectrumScanNodeInfo = (props) => {
    const classes = useStyles();
    const {
        t,
        loading,
        hasWarning,
        oneLineDisplay,
    } = props;
    const {
        ip,
        selectedRadio,
        radioSettings: {actualValue, displayValue},
        radioFreqBandwidthMap,
    } = useSelector(store => store.spectrumScan);
    const nodeInfo = useSelector(store => store.meshTopology.nodeInfo[ip]) || {};

    if (ip === '') return <span />;

    const displayData = {
        model: nodeInfo ? nodeInfo.model : '-',
        mac: nodeInfo ? nodeInfo.mac : convertIpToMac(ip),
        currentFreq: loading || !actualValue[selectedRadio] ? '-' : searchDisplayValue(
            actualValue[selectedRadio].centralFreq,
            displayValue[selectedRadio].centralFreq),
        bandwidth: loading || !actualValue[selectedRadio] ? '-' : searchDisplayValue(
            actualValue[selectedRadio].channelBandwidth,
            displayValue[selectedRadio].channelBandwidth),
        channel: loading || !actualValue[selectedRadio] ? '-' : actualValue[selectedRadio].channel,
        txPower: radioFreqBandwidthMap[selectedRadio] ? radioFreqBandwidthMap[selectedRadio].txpower : '-',
    };
    return (
        <Grid
            item
            xs={6}
            style={{
                marginLeft: oneLineDisplay ? 0 : '10%',
                minWidth: oneLineDisplay ? '630px' : '80%',
            }}
        >
            <div
                style={{
                    margin: oneLineDisplay ? `${hasWarning ? '25px' : '35px'} 0 15px 15%` : '45px 10% 35px',
                    display: 'flex',
                    height: 'calc(100% - 70px)',
                    borderRight: oneLineDisplay ? '1px solid rgba(33, 33, 33, 0.37)' : '',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    {!loading ?
                        <img
                            style={{marginRight: '5%', objectFit: 'contain'}}
                            src={`/img/${displayData.model}.png`}
                            alt={displayData.model}
                            width="140px"
                        /> :
                        <span />
                    }
                    <Grid container style={{height: '70%'}}>
                        <Grid item xs={4} style={{margin: 'auto', textAlign: 'center'}}>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionHeader}
                            >
                                {t('model')}
                            </Typography>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionContent}
                            >
                                {displayData.model}
                            </Typography>
                        </Grid>
                        <Grid item xs={7} style={{margin: 'auto', textAlign: 'center'}}>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionHeader}
                            >
                                {t('mac')}
                            </Typography>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionContent}
                            >
                                {displayData.mac}
                            </Typography>
                        </Grid>
                        <Grid item xs={4} style={{margin: 'auto', textAlign: 'center'}}>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionHeader}
                            >
                                {t('currentFrq')}
                            </Typography>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionContent}
                            >
                                {`${displayData.currentFreq} (CH${displayData.channel})`}
                            </Typography>
                        </Grid>
                        <Grid item xs={4} style={{margin: 'auto', textAlign: 'center'}}>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionHeader}
                            >
                                {t('bandwidth')}
                            </Typography>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionContent}
                            >
                                {displayData.bandwidth}
                            </Typography>
                        </Grid>
                        <Grid item xs={4} style={{margin: 'auto', textAlign: 'center'}}>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionHeader}
                            >
                                {t('txpower')}
                            </Typography>
                            <Typography
                                component="p"
                                className={classes.deviceDescriptionContent}
                            >
                                {displayData.txPower}
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </Grid>
    );
};

SpectrumScanNodeInfo.propTypes = {
    t: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    oneLineDisplay: PropTypes.bool.isRequired,
    hasWarning: PropTypes.bool.isRequired,
};

export default SpectrumScanNodeInfo;
