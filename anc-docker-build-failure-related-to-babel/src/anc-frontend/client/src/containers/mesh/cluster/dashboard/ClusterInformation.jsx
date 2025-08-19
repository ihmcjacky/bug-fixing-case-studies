import React, {useState, useEffect} from 'react';
import {withStyles} from '@material-ui/core/styles';
// import {Grid, IconButton} from '@material-ui/core';
import {Grid} from '@material-ui/core';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
// import {getConfig, getFilteredConfigOptions} from '../../util/apiCall';
import Constant from '../../../../constants/common';
import {getClusterInformation} from '../../../../redux/dashboard/dashboardActions'
import P2CardContainer from '../../../../components/common/P2CardContainer';
import NationalFlag from '../../../../components/common/NationalFlag';

const textAlignment = {
    textAlign: 'center',
};

const theme = {
    fontFamily: 'Roboto',
    letterSpacing: '0.25px',
    mixBlendMode: 'normal',
};


const styles = {
    tag: {
        fontFamily: theme.fontFamily,
        fontSize: '11px',
        letterSpacing: theme.letterSpacing,
        color: Constant.colors.tagTxt,
        mixBlendMode: theme.mixBlendMode,
        textAlign: textAlignment.textAlign,
        paddingBottom: '0',
        marginBlockEnd: '0.5em',
    },
    data: {
        fontFamily: theme.fontFamily,
        fontSize: '17px',
        letterSpacing: theme.letterSpacing,
        color: Constant.colors.dataTxt,
        mixBlendMode: theme.mixBlendMode,
        textAlign: textAlignment.textAlign,
        marginBlockStart: '0',
    },
};

function ClusterInformation(props) {
    const {managementIp, managementNetmask, clusterId} = props.clusterInformation.config;
    const {country} = props.clusterInformation;
    const {t, dispatch} = props;
    const {classes} = props;
    const countryFlag = country.actualValue ?
        (
            <NationalFlag
                countryCode={country.actualValue}
                flagWidth="30px"
                flagHeight="20px"
            />
        ) :
        (
            <span />
        );
    const cardContent = (
        <Grid container spacing={0}>
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <p style={{paddingTop: '10px'}} className={classes.tag}>{t('clusterId')}</p>
                    <p className={classes.data}>{clusterId}</p>
                </Grid>
            </Grid>
            <Grid container spacing={0}>
                <Grid item xs={6}>
                    <Grid item xs={12}>
                        <p className={classes.tag}>{t('managementIp')}</p>
                    </Grid>
                    <Grid item xs={12}>
                        <p className={classes.data} style={{marginBlockEnd: '1.5em'}}>
                            {managementIp !== '-' ?
                                `${managementIp}/${Constant.netmaskToBitmaskMapping[managementNetmask]}` : '-'}
                        </p>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid item xs={12}>
                        <p className={classes.tag}>{t('country')}</p>
                    </Grid>
                    <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                        <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <span
                                    className={classes.data}
                                    style={{display: 'flex', paddingRight: '0.5em'}}
                                >
                                    {props.clusterInformation.country.displayValue}
                                </span>
                                <span style={{display: 'flex'}}>
                                    {countryFlag}
                                </span>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </Grid>
    );

    useEffect(() => {
        let hostIp = '';

        if (props.nodes && props.nodes.length > 0) {
            const hostIpObj = props.nodes.filter(node => node.isHostNode == true)[0];
            hostIp = hostIpObj.id;
        }

        if (
            clusterId === '-' ||
            managementIp === '-' ||
            managementNetmask == '-' ||
            country == '-'
        ) {
            dispatch(getClusterInformation(undefined, hostIp));
        }
    }, [clusterId, managementIp, managementNetmask, country]);


    return (
        <P2CardContainer
            cardTitle={t('cardTitle')}
            cardTitleLimit={20}
            // cardTools={clusterInformationCardTools}
            cardContent={cardContent}
            minWidth="400px"
            minHeight="200px"
            showHelperTooltip={false}
        // isLoading={!this.state.isDataFetched}
        />
    );
}

function mapStateToProps(store) {
    return {
        clusterInformation: store.dashboard.clusterInformation,
        nodes: store.meshTopology.graph.nodes
    };
}

ClusterInformation.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
    clusterInformation: PropTypes.object.isRequired, //eslint-disable-line
};

export default compose(
    withTranslation(['cluster-information']),
    connect(mapStateToProps),
    withStyles(styles)
)(ClusterInformation);
