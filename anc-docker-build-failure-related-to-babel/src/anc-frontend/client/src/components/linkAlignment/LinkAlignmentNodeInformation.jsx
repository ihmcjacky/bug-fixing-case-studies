import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import P2Tooltip from '../../components/common/P2Tooltip';
import Constant from '../../constants/common';

const {colors} = Constant;

const styles = {
    deviceDescriptionHeader: {
        fontSize: '22px',
        color: colors.deviceDescriptionHeader,
    },
    deviceDescriptionContent: {
        fontSize: '22px',
        fontWeight: 'bold',
    },
};

const LinkAlignmentNodeInformation = (props) => {
    const {
        graphNodeInfo,
        nodeIp,
        hasCountryDiscrepancies,
        width,
        countryLabel,
        classes,
        t,
    } = props;
    return (
        <Grid
            item
            style={{
                display: 'flex',
                flex: '1 0 50%',
                flexDirection: 'row',
                minWidth: '650px',
            }}
        >
            <div
                style={{
                    margin: '50px',
                    display: 'flex',
                    flex: 1,
                }}
            >
                {graphNodeInfo[nodeIp] ?
                    <img
                        style={{marginRight: '50px', objectFit: 'contain'}}
                        src={`/img/${graphNodeInfo[nodeIp].model}.png`}
                        alt={graphNodeInfo[nodeIp].model}
                        width="140px"
                    /> :
                    <span />
                }
                <Grid container>
                    <Grid item xs={6}>
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
                            {graphNodeInfo[nodeIp] ?
                                graphNodeInfo[nodeIp].model :
                                '-'
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            className={classes.deviceDescriptionHeader}
                        >
                            <span>{t('country')}</span>
                            {hasCountryDiscrepancies ?
                                <P2Tooltip
                                    direction="right"
                                    title={
                                        <div style={{padding: 0}}>
                                            {t('countryDiscrepanciesTooltip')}
                                        </div>
                                    }
                                    content={
                                        <i
                                            className="material-icons"
                                            style={{
                                                fontSize: '20px',
                                                paddingLeft: '5px',
                                                color: colors.mismatchLabel,
                                            }}
                                        >error</i>
                                    }
                                />
                                :
                                <span />
                            }
                        </div>
                        <Typography
                            component="p"
                            className={classes.deviceDescriptionContent}
                        >
                            {countryLabel}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            component="p"
                            className={classes.deviceDescriptionHeader}
                        >
                            {t('sn')}
                        </Typography>
                        <Typography
                            component="p"
                            className={classes.deviceDescriptionContent}
                        >
                            {graphNodeInfo[nodeIp] ?
                                graphNodeInfo[nodeIp].sn :
                                '-'
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
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
                            {graphNodeInfo[nodeIp] ?
                                graphNodeInfo[nodeIp].mac :
                                '-'
                            }
                        </Typography>
                    </Grid>
                </Grid>
            </div>
            {
                width >= 1422 ? <div
                    style={{
                        margin: '50px 0',
                        borderRight: `1px solid ${colors.tagTxt}`,
                        display: 'block',
                    }}
                /> : null
            }

        </Grid>
    );
};

LinkAlignmentNodeInformation.propTypes = {
    graphNodeInfo: PropTypes.objectOf(PropTypes.object).isRequired,
    nodeIp: PropTypes.string.isRequired,
    hasCountryDiscrepancies: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    width: PropTypes.number.isRequired,
    countryLabel: PropTypes.string.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
};

export default compose(
    withTranslation(['link-alignment']),
    withStyles(styles)
)(LinkAlignmentNodeInformation);
