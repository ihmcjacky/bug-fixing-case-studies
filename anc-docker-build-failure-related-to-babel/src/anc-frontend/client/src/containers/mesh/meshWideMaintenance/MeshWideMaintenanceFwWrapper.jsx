import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
// import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import WarningIcon from '@material-ui/icons/ErrorOutline';
import LockLayer from '../../../components/common/LockLayer';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';
import MeshWideMaintenanceFwUpgrade from './MeshWideMaintenanceFwUpgrade';
import MeshWideMaintenanceBatchFwUpgrade from './MeshWideMaintenanceBatchFwUpgrade';
import Constants from '../../../constants/common';
import {getStatusContent} from '../../../components/nodeMaintenances/FwUpgradeCommon';

const {colors} = Constants;

// const WarningBanner = (props) => (
//     <div
//         style={{
//             background: '#FFEAC1',
//             width: '100%',
//             height: '55px',
//             marginTop: '25px',
//             display: 'flex',
//             alignItems: 'center',
//         }}
//     >
//         <div
//             style={{
//                 color: colors.warningColor,
//                 fontFamily: 'Roboto',
//                 fontStyle: 'normal',
//                 fontWeight: 500,
//                 fontSize: '13px',
//                 marginLeft: '30px',
//             }}
//         >
//             <WarningIcon style={{verticalAlign: 'middle'}} />
//             <span style={{verticalAlign: 'middle', paddingLeft: '3px'}}>
//                 {props.text}
//             </span>
//         </div>
//     </div>
// );

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
    labelStyle: {
        fontSize: '18px',
    },
});
const FwUpgradeType = {
    CLUSTER: 'cluster',
    BATCH: 'batch',
};

const MeshWideMaintenanceFwWrapper = (props) => {
    const {tableData} = props;
    const classes = useStyles();
    const {
        common: {labels},
        devMode: {enableBatchFwUpgrade},
        firmwareUpgrade: {devices, hasNodeUpgrading},
    } = useSelector(store => store);
    const {t: _t, ready} = useTranslation('cluster-maintenance-firmware-upgrade');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const [onView, setOnView] = useState(FwUpgradeType.CLUSTER);
    // const [hasCrossModel, setHasCrossModel] = useState(false);
    const [hasUnreachable, setHasUnreachable] = useState(false);
    // const [showCrossModelWarning, setShowCrossModelWarning] = useState(false);
    const [isLock, setIsLock] = useState(false);
    const [seriesList, setSeriesList] = useState([]);

    useEffect(() => {
        let _hasUnreachable = false;

        let hasAX50 = false;
        const ax50Reg = /^[A][X][5]/g;
        let hasX30 = false;
        const x30Reg = /^[X][3]/g;
        let hasX20 = false;
        const x20Reg = /^[X][2]/g;
        let hasZ500 = false;
        const z500Reg = /^[Z][5][0][0]/g;
        let hasX10 = false;
        const x10Reg = /^[X][1]/g;
        const _seriesList = [];

        tableData.forEach((row) => {
            if (row[2].ctx.match(ax50Reg)) {
                if (!hasAX50) {
                    hasAX50 = true;
                    _seriesList.push('ax50');
                }
            } else if (row[2].ctx.match(x30Reg)) {
                if (!hasX30) {
                    hasX30 = true;
                    _seriesList.push('x30');
                }
            } else if (row[2].ctx.match(x20Reg)) {
                if (!hasX20) {
                    hasX20 = true;
                    _seriesList.push('x20');
                }
            } else if (row[2].ctx.match(z500Reg)) {
                if (!hasZ500) {
                    hasZ500 = true;
                    _seriesList.push('z500');
                }
            } else if (row[2].ctx.match(x10Reg)) {
                if (!hasX10) {
                    hasX10 = true;
                    _seriesList.push('x10');
                }
            }

            if (devices[row[4].id]) {
                row[4].ctx = getStatusContent(devices[row[4].id], t);
            }
            if (row[4].status === 'unreachable') {
                _hasUnreachable = true;
            }
        });
        // const _hasCross = modelCounter > 1;
        // setHasCrossModel(_hasCross);
        setHasUnreachable(_hasUnreachable);
        setSeriesList(_seriesList);
        // if (onView === FwUpgradeType.CLUSTER) {
        //     setShowCrossModelWarning(_hasCross);
        // }
    }, [tableData, devices]);

    useEffect(() => {
        if (!enableBatchFwUpgrade && onView === FwUpgradeType.BATCH) {
            setOnView(FwUpgradeType.CLUSTER);
        }
    }, [enableBatchFwUpgrade]);

    if (!ready) return <span />;

    const radioOnChangeFunc = (e) => {
        setOnView(e.target.value);
    };

    return (
        <Grid
            container
            className={classes.root}
            spacing={1}
        >
            {/* <Collapse
                style={{width: '100%'}}
                in={showCrossModelWarning && onView === FwUpgradeType.CLUSTER}
            >
                <WarningBanner text={t('hasCrossModelWarning')} />
            </Collapse> */}
            <P2PointsToNote
                noteTitle={t('noteTitle')}
                noteCtxArr={[
                    {ctx: t('cwFwNote1'), key: t('cwFwNote1')},
                    {ctx: t('cwFwNote2'), key: t('cwFwNote2')},
                    {ctx: t('cwFwNote3'), key: t('cwFwNote3')},
                    {ctx: t('cwFwNote4'), key: t('cwFwNote4')},
                ]}
            />
            <RadioGroup
                style={{
                    display: 'block',
                    marginLeft: '33px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    width: '100%',
                }}
                value={onView}
                onChange={radioOnChangeFunc}
            >
                <FormControlLabel
                    disabled={hasNodeUpgrading}
                    classes={{label: classes.labelStyle}}
                    value={FwUpgradeType.CLUSTER}
                    control={<Radio color="primary" />}
                    label={t('clusterFwUpgradeView')}
                />
                {
                    enableBatchFwUpgrade ? (<FormControlLabel
                        disabled={hasNodeUpgrading}
                        style={{paddingLeft: '13vw'}}
                        classes={{label: classes.labelStyle}}
                        control={<Radio  color="primary" />}
                        value={FwUpgradeType.BATCH}
                        label={t('batchFwUpgradeView')}
                    />) : null
                }
            </RadioGroup>
            {
                onView === FwUpgradeType.CLUSTER ? (
                    <MeshWideMaintenanceFwUpgrade
                        t={t}
                        setLockLayer={setIsLock}
                        hasUnreachable={hasUnreachable}
                        // hasCrossModel={hasCrossModel}
                        seriesList={seriesList}
                        {...props}
                    />
                ) : (
                    <MeshWideMaintenanceBatchFwUpgrade
                        t={t}
                        setLockLayer={setIsLock}
                        // popupCrossModeWarning={popupCrossModeWarning}
                        {...props}
                    />
                )
            }
            <LockLayer display={isLock} />
        </Grid>
    );
};

MeshWideMaintenanceFwWrapper.propTypes = {
    isInit: PropTypes.bool.isRequired,
    tableData: PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.shape({
                type: PropTypes.string,
                ctx: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.element,
                ]),
            })),
        ).isRequired,
    nodeInfo: PropTypes.objectOf(
        PropTypes.shape({
            hostname: PropTypes.string,
            mac: PropTypes.string,
            firmwareVersion: PropTypes.string,
        })
    ).isRequired,
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            isManaged: PropTypes.bool,
            isAuth: PropTypes.string,
            isReachable: PropTypes.bool,
        })
    ).isRequired,
    refreshFunc: PropTypes.func.isRequired,
};

export default MeshWideMaintenanceFwWrapper;
