import React, {useState} from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ArrowBackIOS from '@material-ui/icons/ArrowBackIos';
import AppBar from '@material-ui/core/AppBar';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import P2Tooltip from '../common/P2Tooltip';
import StatisticDetailGraph from './StatisticDetailGraph';
import StatisticConstants from '../../constants/statistic';
import CommonConstants from '../../constants/common';

const {
    dataUnitOpt, packetUnitOpt,
    bytesToNumMap, packetToNumMap,
    byteStatisticOpt, colorMap,
} = StatisticConstants;
const {theme, colors} = CommonConstants;

const styles = {
    toolBar: {
        paddingLeft: '10px',
    },
    flex: {
        flex: 1,
    },
    dataUnitControl: {
        width: '80px',
        paddingRight: '10px',
        color: 'white',
    },
    packetUnitControl: {
        width: '130px',
        paddingRight: '10px',
        color: 'white',
    },
    icon: {
        color: 'white',
    },
    formControl: {
        width: '310px',
        paddingRight: '8px',
        minWidth: '180px',
        color: 'white',
    },
    underline: {
        '&:after': {
            color: 'white',
            borderBottom: '0.5px solid white',
        },
        '&:before': {
            color: 'white',
            borderBottom: '0.5px solid white',
        },
        color: 'white',
    },
    optInput: {
        fontSize: '1em',
    },
    optTitle: {
        fontSize: '1em',
        paddingRight: '15px',
        paddingLeft: '15px',
        fontWeight: 800,
        // paddingTop: '5px',
    },
    wrapper: {
        width: '100%',
        paddingBottom: '20px',
        backgroundColor: theme.mainBgColor,
    },
    noGraphText: {
        textAlign: 'center',
    },
    gridRoot: {
        flexGrow: 1,
    },
};
const useStyles = makeStyles(styles);

const StatisticDetailContent = (props) => {
    const classes = useStyles();
    const {
        t, handleClose,
        hostname,
        interfaceList,
        graphData,
        dataUnitInit,
        packetUnitInit,
        exportFullPageCsv,
    } = props;
    const [selectedInterface, setSelectedInterface] = useState(interfaceList.flatMap((interfaceOpt) => {
        if (interfaceOpt.enable) return [interfaceOpt.key];
        return [];
    }));
    const [dataUnit, setDataUnit] = useState(dataUnitInit);
    const [packetUnit, setPacketUnit] = useState(packetUnitInit);

    const handleDataUnitOnChange = (event) => {
        const newUnit = {};
        Object.keys(dataUnit).forEach((key) => {
            if (key === 'hasChange') {
                newUnit[key] = false;
            } else {
                newUnit[key] = event.target.value;
            }
        });
        setDataUnit(newUnit);
    };
    const handlePacketUnitOnChange = (event) => {
        const newUnit = {};
        Object.keys(packetUnit).forEach((key) => {
            if (key === 'hasChange') {
                newUnit[key] = false;
            } else {
                newUnit[key] = event.target.value;
            }
        });
        setPacketUnit(newUnit);
    };
    const handleInterfaceChange = (event) => {
        setSelectedInterface(event.target.value);
    };

    let content;
    if (selectedInterface.length < 1) {
        content = (
            <Typography variant="h6" color="inherit" className={classes.noGraphText}>
                {t('selectInterfaces')}
            </Typography>
        );
    } else {
        const interfaceRef = graphData[graphData.length - 1].interface;
        const allGraph = [];
        Object.keys(interfaceRef).sort().forEach((interfaceName) => {
            if (selectedInterface.includes(interfaceName)) {
                Object.keys(interfaceRef[interfaceName]).forEach((statName) => {
                    const data = [];
                    const id = `${interfaceName}-${statName}`;
                    const isBytesUnit = byteStatisticOpt.includes(statName);
                    const unit = isBytesUnit ? dataUnit[id] : packetUnit[id];
                    const unitNum = isBytesUnit ? bytesToNumMap[unit] : packetToNumMap[unit];
                    graphData.forEach((row) => {
                        const rowData = {
                            id: row.id,
                            timestamp: row.timestamp,
                        };
                        if (row.interface) {
                            rowData[id] =
                                Number(Number((parseInt(row.interface[interfaceName][statName], 10)) / unitNum).toFixed(2), 10);
                        }
                        data.push(rowData);
                    });

                    const handleUnitChange = (event) => {
                        const unit = event.target.value;
                        if (isBytesUnit) {
                            setDataUnit((currentState) => {
                                return {
                                    ...currentState,
                                    hasChange: true,
                                    [id]: unit,
                                };
                            });
                        } else {
                            setPacketUnit((currentState) => {
                                return {
                                    ...currentState,
                                    hasChange: true,
                                    [id]: unit,
                                };
                            });
                        }
                    };
                    allGraph.push({
                        interfaceName,
                        statName,
                        color: colorMap[id],
                        unit,
                        title: `${t(`${interfaceName}Space`)} - ${t(statName)}`,
                        data,
                        handleUnitChange,
                    });
                });
            }
        });
        content = (
            <Grid container className={classes.gridRoot} spacing={2}>
                <Grid item xs={12}>
                    <Grid container justify="center" spacing={2}>
                        {allGraph.map(graphProps => (
                            <StatisticDetailGraph
                                key={`${graphProps.interfaceName}-${graphProps.statName}`}
                                t={t}
                                {...graphProps}
                            />
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    let dataUnitKey = 'hasChange';
    let displayUnitKey = t('hasChange');
    if (!dataUnit.hasChange) {
        dataUnitKey = Object.keys(dataUnit).find(unit => unit !== 'hasChange');
        displayUnitKey = t(dataUnit[dataUnitKey]);
    }

    let packetUnitKey = 'hasChange';
    let displayPacketUnitKey = t('hasChange');
    if (!packetUnit.hasChange) {
        packetUnitKey = Object.keys(packetUnit).find(unit => unit !== 'hasChange');
        displayPacketUnitKey = t(packetUnit[packetUnitKey]);
    }

    return (
        <>
            <AppBar
                color="primary"
                style={{position: 'fixed'}}
            >
                <Toolbar classes={{root: classes.toolBar}} >
                    <IconButton color="inherit" onClick={handleClose} aria-label="Close">
                        <ArrowBackIOS />
                    </IconButton>
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        {t('networkStatistics')}
                        <span style={{fontSize: '16px'}}> ({hostname})</span>
                    </Typography>
                    <Typography variant="body2" color="inherit" className={classes.optTitle}>
                        {`${t('unit')}: `}
                    </Typography>
                    <FormControl className={classes.dataUnitControl}>
                        <Select
                            renderValue={() => displayUnitKey}
                            value={dataUnit[dataUnitKey]}
                            onChange={handleDataUnitOnChange}
                            input={
                                <Input
                                    placeholder="Interface"
                                    classes={{
                                        underline: classes.underline,
                                        root: classes.optInput,
                                    }}
                                />
                            }
                            classes={{icon: classes.icon}}
                        >
                            {dataUnitOpt.map(unit => (
                                <MenuItem key={unit} value={unit}>
                                    <ListItemText primary={t(unit)} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl className={classes.packetUnitControl}>
                        <Select
                            renderValue={() => displayPacketUnitKey}
                            value={packetUnit[packetUnitKey]}
                            onChange={handlePacketUnitOnChange}
                            input={
                                <Input
                                    placeholder="Interface"
                                    classes={{
                                        underline: classes.underline,
                                        root: classes.optInput,
                                    }}
                                />
                            }
                            classes={{icon: classes.icon}}
                        >
                            {packetUnitOpt.map(unit => (
                                <MenuItem key={unit} value={unit}>
                                    <ListItemText primary={t(unit)} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="inherit" className={classes.optTitle}>
                        {`${t('interface')}: `}
                    </Typography>
                    <FormControl className={classes.formControl}>
                        <Select
                            multiple
                            value={selectedInterface}
                            onChange={handleInterfaceChange}
                            renderValue={() => selectedInterface.map(opt => t(opt)).join(', ')}
                            input={
                                <Input
                                    placeholder="Interface"
                                    classes={{
                                        underline: classes.underline,
                                        root: classes.optInput,
                                    }}
                                />
                            }
                            classes={{icon: classes.icon}}
                        >
                            {interfaceList.map((interfaceOpt) => (
                                <MenuItem
                                    key={interfaceOpt.key}
                                    value={interfaceOpt.key}
                                    disabled={(selectedInterface.length === 1 && selectedInterface[0] === interfaceOpt.key) || !interfaceOpt.enable}
                                >
                                    <Checkbox checked={selectedInterface.includes(interfaceOpt.key)} />
                                    <ListItemText primary={t(interfaceOpt.key)} />
                                </MenuItem>)
                            )}
                        </Select>
                    </FormControl>
                    <P2Tooltip
                        title={t('exportButtonLblFull')}
                        content={
                            <IconButton
                                onClick={() => {
                                    const {hasChange, ...unitObj} = {...dataUnit, ...packetUnit};
                                    exportFullPageCsv(unitObj, selectedInterface);
                                }}
                            >
                                <ExportIcon style={{fill: 'white'}} />
                            </IconButton>
                        }
                        key="export"
                    />
                </Toolbar>
            </AppBar>
            <div
                style={{
                    backgroundColor: colors.background,
                    padding: '30px 200px',
                    marginBottom: '30px',
                    overflowY: 'auto',
                    maxHeight: 'calc(100% - 108px)',
                    transform: 'translateY(64px)',
                }}
            >
                <div className={classes.wrapper}>
                    {content}
                </div>
            </div>
        </>
    );
};

StatisticDetailContent.propTypes = {
    t: PropTypes.func.isRequired,
    hostname: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    interfaceList: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        enable: PropTypes.bool.isRequired,
    })).isRequired,
    graphData: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        interface: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        timestamp: PropTypes.string,
    })).isRequired,
    dataUnitInit: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])),
    packetUnitInit: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])),
    exportFullPageCsv: PropTypes.func.isRequired,
};

export default StatisticDetailContent;
