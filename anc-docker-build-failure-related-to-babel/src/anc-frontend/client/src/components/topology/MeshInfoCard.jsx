/**
 * @Author: Kenny
 * @Date:   2018-11-09T15:09:06+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T10:57:11+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {useTranslation} from 'react-i18next';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
// import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
// import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
// import Moment from 'react-moment';
// import NetworkWifi from '@material-ui/icons/SignalWifi4Bar';
// import SettingsIcon from '@material-ui/icons/Settings';
// import AutoRenew from '@material-ui/icons/Sync';
import {withStyles} from '@material-ui/core/styles';
import {convertUptime} from '../../util/formatConvertor';
import Constant from '../../constants/common';
import moment from 'moment';
// import HomeIcon from '@material-ui/icons/Home';
// import UploadIcon from '@material-ui/icons/FileUpload';
// import SvgIcon from '@material-ui/core/SvgIcon';
// import '../../media/fonts/p2-icon.css';
// import HeaderButton from './HeaderButton';

const {theme} = Constant;

const MeshInfoCard = function (props) {
    const {classes} = props;
    const {t, ready} = useTranslation('cluster-topology-info-card');
    if (!ready) return <span />;
    function getWifiIcon(status, number) {
        // <i style={{color: colors.activeGreen}} className="p2-icon-eth1" />
        // <i style={{color: colors.inactiveRed}} className="p2-icon-eth1" />
        if (status === '1') {
            return (
                <div
                    style={{
                        width: '100%',
                    }}
                >
                    <img
                        src={`/img/eth${number}_active.png`}
                        alt="eth"
                        width={number === 0 ? 26 : 24}
                    />
                </div>
            );
        }
        return (
            <div
                style={{
                    width: '100%',
                }}
            >
                <img
                    src={`/img/eth${number}_inactive.png`}
                    alt="eth"
                    width={number === 0 ? 26 : 24}
                />
            </div>
        );
    }
    function getRadioIcon(status, number) {
        if (status === '1') {
            return (
                <div
                    style={{
                        width: '100%',
                    }}
                >
                    <img
                        src={`/img/radio${number}_active.png`}
                        alt="radio"
                        width="32"
                    />
                </div>
            );
        }
        return (
            <div
                style={{
                    width: '100%',
                }}
            >
                <img
                    src={`/img/radio${number}_inactive.png`}
                    alt="radio"
                    width="32"
                />
            </div>
        );
    }
    function getLoading() {
        if (props.status === 'loading') {
            return (
                <div className={classes.loadingWrapper}>
                    <img
                        src="/img/loading.gif"
                        className={classes.progress}
                        alt="loading"
                    />
                </div>
            );
        }
        return null;
    }
    function getlastUpdatetime() {
        if (props.info.lastUpdateTime) {
            return moment(props.info.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss');
        }
        return '-';
    }
    const iconNum = props.info.interface.eth.length + props.info.interface.radio.length;
    // const cardWidth = iconNum === 5 ? '200px' : '180px';
    const cardWidth = '220px';

    const style = {
        position: 'absolute',
        left: props.x,
        top: props.y,
        width: cardWidth,
        zIndex: '11',
    };
    return (
        <Card style={style}>
            {getLoading()}
            <CardContent
                classes={{
                    root: classes.cardContentRoot,
                }}
            >
                <Typography
                    style={{
                        fontSize: '18px',
                        padding: '10px',
                        paddingBottom: '0px',
                        color: theme.palette.primary.main,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                    }}
                    variant="body2"
                >
                    <b>{props.info.hostname}</b>
                </Typography>
                <div className={classes.iconListWrapper}>
                    {props.info.interface.eth.map(
                        (i, idx) => (
                            <IconButton key={i.ifName} className={classes.iconList}>
                                {getWifiIcon(i.status, idx)}
                            </IconButton>
                        )
                    )}
                    {props.info.interface.radio.map(
                        (i, idx) => (
                            <IconButton key={i.ifName} className={classes.iconList}>
                                {getRadioIcon(i.status, idx)}
                            </IconButton>
                        )
                    )}
                </div>
                <Typography
                    variant="body2"
                    className={classes.deviceDetail}
                ><b>{`${t('s/n')}: `}</b> {props.info.sn}</Typography>
                <Typography variant="body2" className={classes.deviceDetail}>
                    <b>{`${t('model')}:`}</b> {props.info.model}
                </Typography>
                <Typography variant="body2" className={classes.deviceDetail}>
                    <b>{`${t('status')}:`}</b> {`${t(props.info.nodeStatus)}`}
                </Typography>
                <Typography variant="body2" className={classes.deviceDetail}>
                    <b>{`${t('fwVersion')}:`}</b> {props.info.fwVersion}
                </Typography>
                <Typography variant="body2" className={classes.deviceDetail}><b>{`${t('mac')}: `}</b>
                    {props.info.mac}</Typography>
                <Typography variant="body2" className={classes.deviceDetail}><b>{`${t('uptime')}: `}</b>
                    {convertUptime(props.info.uptime)}
                </Typography>
                <Typography variant="body2" className={classes.deviceDetail}><b>{`${t('lastUpdateTime')}: `}</b>
                    {getlastUpdatetime()}
                </Typography>
            </CardContent>
        </Card>
    );
};
const styles = {
    titleRoot: {
        // paddingBottom: '0px',
    },
    cardContentRoot: {
        paddingTop: '0px',
        paddingLeft: '10px',
        paddingRight: '10px',
    },
    iconList: {
        // height: '10px',
        width: '20%',
        color: 'red',
        padding: '0',
    },
    iconListWrapper: {
        // height: '10px',
        // paddingLeft: '5px',
        padding: '5px',
    },
    deviceDetail: {
        fontSize: '11px',
        paddingLeft: '10px',
        paddingBottom: '0px',
    },
    loadingWrapper: {
        position: 'absolute',
        opacity: '0.9',
        width: '100%',
        height: '100%',
        zIndex: '100',
        backgroundColor: 'white',
    },
    progress: {
        display: 'block',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: '-30px',
        marginTop: '-30px',
        width: '60px',
        height: '60px',
    },
    col4: {
        paddingTop: '8px',
        // width: '25%',
        // paddingLeft: '5px',
    },
    iconSize: {
        fontSize: '20px',
    },
};
/* eslint-disable */
MeshInfoCard.propTypes = {
    classes: PropTypes.object.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    info: PropTypes.shape({
        hostname: PropTypes.string.isRequired,
        ip: PropTypes.string.isRequired,
        sn: PropTypes.string.isRequired,
        fwVersion: PropTypes.string.isRequired,
        model: PropTypes.string.isRequired,
        mac: PropTypes.string.isRequired,
        uptime: PropTypes.string.isRequired,
        interface: PropTypes.shape({
            eth: PropTypes.array.isRequired,
            radio: PropTypes.array.isRequired,
        }),
        nodeStatus: PropTypes.string.isRequired,
    }).isRequired,
    // x: PropTypes.number.isRequired,
    // y: PropTypes.number.isRequired,
};

// export default MeshInfoCard;
export default compose(withStyles(styles))(MeshInfoCard);
