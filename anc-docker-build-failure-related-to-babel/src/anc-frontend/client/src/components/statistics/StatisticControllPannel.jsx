import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ListIcon from '@material-ui/icons/List';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import {ReactComponent as NormalizeIcon} from '../../icon/svg/ic_normalize.svg';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import P2Tooltip from '../common/P2Tooltip';
import StatisticConstants from '../../constants/statistic';

const useStyles = makeStyles({
    rowFormGroup: {
        paddingLeft: '10px',
        boxSizing: 'border-box',
        alignItems: 'center',
    },
    unitSelectRowFormGroup: {
        boxSizing: 'border-box',
        alignItems: 'center',
        marginTop: '12px',
    },
    interfaceFormControl: {
        margin: '0 8px',
        minWidth: '400px',
        width: '400px',
        padding: '0 10px',
    },
    timeRangeFormControl: {
        margin: '0 0 0 8px',
        minWidth: '125px',
        width: '125px',
        padding: '0 0 0 10px',
    },
    statisticFormControl: {
        margin: '0 0px 0 13px',
        minWidth: '636px',
        width: '636px',
        padding: '0 0 0 10px',
    },
    intervalFormControl: {
        margin: '0 8px',
        minWidth: '120px',
        width: '120px',
        padding: '0 20px',
    },
    unitFormControl: {
        minWidth: '15%',
        width: '15%',
    },
    packetUnitFormControl: {
        marginLeft: 'auto',
    },
    label: {
        fontSize: '14px',
    },
    toggleGroup: {
        position: 'relative',
        top: '10px',
        marginLeft: 'auto',
    },
    toggleBtn: {
        height: '32px',
        minWeight: '0px',
        padding: '0 11px',
    },
});

const {
    interfaceOrder, radioStatisticOpt,
    radioInterface,
    statisticOpt, statisticOrder,
    timeRangeOpt, intervalOpt,
    dataUnitOpt, packetUnitOpt,
    txPacketStatisticOpt, rxPacketStatisticOpt,
    byteStatisticOpt, packetStatisticOpt,
} = StatisticConstants;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 5;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: (ITEM_HEIGHT * 4.5) + ITEM_PADDING_TOP,
        },
    },
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'left',
    },
};

const interfaceSort = (a, b) => {
    return interfaceOrder[a] - interfaceOrder[b];
}
const statisticSort = (a, b) => {
    return statisticOrder[a] - statisticOrder[b];
}

const StatisticControllPannel = (props) => {
    const classes = useStyles();
    const {
        t,
        onView, handleChangeView,
        interfaceOpt, statisitcSupport,
        // interfaceStatus,
        interfaceSelect: {selectedInterface, handleInterfaceChange},
        timeSelect: {selectedTimeRange, handleTimeChange},
        statisticSelect: {selectedStatistic, handleStatisticChange},
        intervalSelect: {selectedInterval, handleIntervalChange},
        unitSelect: {
            data: {dataUnit, handleChangeUnit},
            packet: {packetUnit, handleChangePacketUnit},
        },
    } = props;

    const onTableView = onView === 'table';

    function dataUnitRenderContent() {
        let hasTx = onTableView;
        let hasRx = onTableView;
        if (!onTableView) {
            selectedStatistic.some((unit) => {
                if (unit === 'txBytes') {
                    hasTx = true;
                } else if (unit === 'rxBytes') {
                    hasRx = true;
                }
                return hasTx && hasRx;
            });
        }

        if (hasTx && hasRx) {
            return `${t('tx')}/${t('rx')} ${t(dataUnit)}`;
        } else if (hasTx) {
            return `${t('tx')} ${t(dataUnit)}`;
        } else if (hasRx) {
            return `${t('rx')} ${t(dataUnit)}`;
        }
        return t(dataUnit);
    }

    function packetUnitRenderContent() {
        let hasTx = onTableView;
        let hasRx = onTableView;
        if (!onTableView) {
            selectedStatistic.some((unit) => {
                if (!hasTx && txPacketStatisticOpt.includes(unit)) {
                    hasTx = true;
                } else if (!hasRx && rxPacketStatisticOpt.includes(unit)) {
                    hasRx = true;
                }
                return hasTx && hasRx;
            });
        }

        if (hasTx && hasRx) {
            return `${t('tx')}/${t('rx')} ${t(packetUnit)}`;
        } else if (hasTx) {
            return `${t('tx')} ${t(packetUnit)}`;
        } else if (hasRx) {
            return `${t('rx')} ${t(packetUnit)}`;
        }
        return t(packetUnit);
    }

    const showBytesSelect = onTableView || selectedStatistic.some(opt => byteStatisticOpt.includes(opt));
    const showPacketSelect = onTableView || selectedStatistic.some(opt => packetStatisticOpt.includes(opt));
    const selectedRadio = selectedInterface.some(opt => radioInterface.includes(opt));
    return (
        <div>
            <FormGroup row classes={{row: classes.rowFormGroup}}>
                <Typography className={classes.label} >
                    {t('interface')}
                </Typography>
                <FormControl className={classes.interfaceFormControl}>
                    <Select
                        multiple
                        disabled={onTableView}
                        value={selectedInterface.map(a => a)}
                        onChange={handleInterfaceChange}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {selectedInterface.sort(interfaceSort).map(opt => t(opt)).join(', ')}
                            </Typography>
                        )}
                    >
                        {interfaceOpt.map(opt => (
                            <MenuItem
                                key={opt.key}
                                value={opt.key}
                                disabled={(selectedInterface.length === 1 && selectedInterface[0] === opt.key) ||
                                    !opt.enable}
                            >
                                <Checkbox checked={selectedInterface.indexOf(opt.key) > -1} />
                                <ListItemText primary={t(opt.key)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography className={classes.label} >
                    {t('timeRange')}
                </Typography>
                <FormControl className={classes.timeRangeFormControl}>
                    <Select
                        disabled={onTableView}
                        value={selectedTimeRange}
                        onChange={handleTimeChange}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {`${selectedTimeRange} ${t('mins')}`}
                            </Typography>
                        )}
                    >
                        {timeRangeOpt.map(opt => (
                            <MenuItem key={opt} value={opt} >
                                <ListItemText primary={t(opt)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </FormGroup>
            <FormGroup row classes={{row: classes.rowFormGroup}}>
                <Typography className={classes.label} >
                    {t('statistic')}
                </Typography>
                <FormControl className={classes.statisticFormControl}>
                    <Select
                        multiple
                        disabled={onTableView}
                        value={selectedStatistic.map(a => a)}
                        onChange={handleStatisticChange}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {selectedStatistic.sort(statisticSort).map(opt => t(opt)).join(', ')}
                            </Typography>
                        )}
                    >
                        {statisticOpt.map(opt => {
                            const isRadioOnlyStat = radioStatisticOpt.includes(opt);
                            return (
                                <MenuItem
                                    key={opt}
                                    value={opt}
                                    disabled={(selectedStatistic.length === 1 && selectedStatistic[0] === opt) ||
                                        (isRadioOnlyStat && !selectedRadio) ||
                                        !statisitcSupport[opt]}
                                >
                                    <Checkbox checked={selectedStatistic.includes(opt)} />
                                    <ListItemText primary={t(opt)} />
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </FormGroup>
            <FormGroup row classes={{row: classes.rowFormGroup}}>
                <Typography className={classes.label} >
                    {t('interval')}
                </Typography>
                <FormControl className={classes.intervalFormControl}>
                    <Select
                        disabled={onTableView}
                        value={selectedInterval}
                        onChange={handleIntervalChange}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {`${selectedInterval} ${t('seconds')}`}
                            </Typography>
                        )}
                    >
                        {intervalOpt.map(opt => (
                            <MenuItem key={opt} value={opt} >
                                <ListItemText primary={t(opt)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <ToggleButtonGroup
                    value={onView}
                    exclusive
                    onChange={handleChangeView}
                    classes={{
                        root: classes.toggleGroup,
                        selected: '',
                    }}
                >
                    <ToggleButton
                        value="normalzie"
                        disabled={onView === 'normalzie'}
                        classes={{root: classes.toggleBtn}}
                    >
                        <P2Tooltip
                            title={t('normalizeViewTooltipTitle')}
                            content={(
                                <NormalizeIcon
                                    style={{fill: onView === 'normalzie' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.38)'}}
                                />
                            )}
                        />
                    </ToggleButton>
                    <ToggleButton
                        value="graph"
                        disabled={onView === 'graph'}
                        classes={{root: classes.toggleBtn}}
                    >
                        <P2Tooltip
                            title={t('graphViewTooltipTitle')}
                            content={(<TrendingUpIcon />)}
                        />
                    </ToggleButton>
                    <ToggleButton
                        value="table"
                        disabled={onView === 'table'}
                        classes={{root: classes.toggleBtn}}
                    >
                        <P2Tooltip
                            title={t('tableViewTooltipTitle')}
                            content={(<ListIcon />)}
                        />
                    </ToggleButton>
                    <ToggleButton
                        value="detail"
                        disabled={onView === 'detail'}
                        classes={{root: classes.toggleBtn}}
                    >
                        <P2Tooltip
                            title={t('detailStatisticViewTooltipTitle')}
                            content={(<OpenInNewIcon />)}
                        />
                    </ToggleButton>
                    <ToggleButton
                        value="export"
                        classes={{root: classes.toggleBtn}}
                    >
                        <P2Tooltip
                            title={t('exportTooltipTitle')}
                            content={(<ExportIcon style={{fill: 'rgba(0, 0, 0, 0.38)'}} />)}
                        />
                    </ToggleButton>
                </ToggleButtonGroup>
            </FormGroup>
            <FormGroup row classes={{row: classes.unitSelectRowFormGroup}}>
                <FormControl
                    className={classes.unitFormControl}
                    style={{display: showBytesSelect ? 'inline' : 'none'}}
                >
                    <Select
                        disableUnderline
                        value={dataUnit}
                        onChange={handleChangeUnit}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {dataUnitRenderContent()}
                            </Typography>
                        )}
                    >
                        {dataUnitOpt.map(opt => (
                            <MenuItem key={opt} value={opt} >
                                <ListItemText primary={t(opt)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl
                    className={classes.packetUnitFormControl}
                    style={{display: showPacketSelect ? 'inline' : 'none'}}
                >
                    <Select
                        disableUnderline
                        value={packetUnit}
                        onChange={handleChangePacketUnit}
                        MenuProps={MenuProps}
                        renderValue={() => (
                            <Typography className={classes.label} >
                                {packetUnitRenderContent()}
                            </Typography>
                        )}
                    >
                        {packetUnitOpt.map(opt => (
                            <MenuItem key={opt} value={opt} >
                                <ListItemText primary={t(opt)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </FormGroup>
        </div>
    );
};

StatisticControllPannel.propTypes = {
    t: PropTypes.func.isRequired,
    onView: PropTypes.string.isRequired,
    handleChangeView: PropTypes.func.isRequired,
    interfaceOpt: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        enable: PropTypes.bool.isRequired,
    })).isRequired,
    statisitcSupport: PropTypes.objectOf(PropTypes.bool).isRequired,
    // interfaceStatus: PropTypes.objectOf(PropTypes.string).isRequired,
    interfaceSelect: PropTypes.shape({
        selectedInterface: PropTypes.arrayOf(PropTypes.string).isRequired,
        handleInterfaceChange: PropTypes.func.isRequired,
    }).isRequired,
    timeSelect: PropTypes.shape({
        selectedTimeRange: PropTypes.number.isRequired,
        handleTimeChange: PropTypes.func.isRequired,
    }).isRequired,
    statisticSelect: PropTypes.shape({
        selectedStatistic: PropTypes.arrayOf(PropTypes.string).isRequired,
        handleStatisticChange: PropTypes.func.isRequired,
    }).isRequired,
    intervalSelect: PropTypes.shape({
        selectedInterval: PropTypes.number.isRequired,
        handleIntervalChange: PropTypes.func.isRequired,
    }).isRequired,
    unitSelect: PropTypes.shape({
        data: PropTypes.shape({
            dataUnit: PropTypes.string.isRequired,
            handleChangeUnit: PropTypes.func.isRequired,
        }).isRequired,
        packet: PropTypes.shape({
            packetUnit: PropTypes.string.isRequired,
            handleChangePacketUnit: PropTypes.func.isRequired,
        }).isRequired,
    }).isRequired,
};

export default StatisticControllPannel;
