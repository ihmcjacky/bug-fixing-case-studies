import React from 'react';
import moment from 'moment';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import P2Tooltip from '../common/P2Tooltip';
import {setLinkAlignmentChartData} from '../../redux/linkAlignment/linkAlignmentActions';
import store from '../../redux/store';

export function formatDate(date) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
}

export const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

export function getDotDotDot(num) {
    let returnDot = '';
    for (let i = 0; i < num; i += 1) returnDot += '.';
    return returnDot;
}

export function isSameNodeTimestamp(bufferSize, dataArr) {
    if (dataArr.length <= bufferSize + 1) return false;
    const latestNodeTimestamp = dataArr[dataArr.length - 1].nodeTimestamp;
    for (let i = 0; i < bufferSize + 1; i += 1) {
        if (!dataArr[dataArr.length - 1 - i].nodeTimestamp !== latestNodeTimestamp) return false;
    }
    return true;
}

export function shouldDropDown(bufferSize, dataArr) {
    for (let i = 0; i < bufferSize; i += 1) {
        if (!dataArr[dataArr.length - 1 - i].isDuplicate) return false;
    }
    return true;
}

export const iff = (condition, successCase, failCase) => (condition ? successCase : failCase);

export const dropDownData = (nodeTimestamp, currentTime) => ({
    rssi: {
        local: -95,
        remote: -95,
    },
    bitrate: {
        local: 0,
        remote: 0,
    },
    chainData: {
        rssiChain0: null,
        rssiChain1: null,
    },
    nodeTimestamp,
    timestamp: currentTime.format(),
    isDuplicate: true,
    source: 'manual',
});

export function getStatus(isPolling, starting, dotNum, t) {
    if (starting) {
        return `${t('starting')} ${getDotDotDot(dotNum)}`;
    } else if (!isPolling) {
        return t('pending');
    } else if (isPolling && !starting) {
        return `${t('alignmentInProgress')} ${getDotDotDot(dotNum)}`;
    }
    return t('pending');
}

export function parseDbmToIndicatorSettings(level) {
    if (typeof level === 'undefined' || level === '-') {
        return {
            amplitude: 0,
            duration: 1000,
            vol: 0,
            intervalTime: 1000,
            group: 0,
        };
    }
    let num = level;
    if (typeof level === 'string') {
        num = parseInt(level.replace(' dBm', ''), 10);
    }
    if (num > -56) {
        // above or equal -55
        return {
            amplitude: 784,
            duration: 55,
            vol: 100,
            intervalTime: 100,
            group: 9,
        };
    } else if (num > -61) {
        // range -60 - -56
        return {
            amplitude: 784,
            duration: 90,
            vol: 100,
            intervalTime: 143,
            group: 8,
        };
    } else if (num > -66) {
        // range -65 - -61
        return {
            amplitude: 784,
            duration: 90,
            vol: 100,
            intervalTime: 166,
            group: 7,
        };
    } else if (num > -71) {
        // range -70 - -66
        return {
            amplitude: 784,
            duration: 90,
            vol: 80,
            intervalTime: 200,
            group: 6,
        };
    } else if (num > -76) {
        // range -75 - 71
        return {
            amplitude: 784,
            duration: 90,
            vol: 80,
            intervalTime: 250,
            group: 5,
        };
    } else if (num > -81) {
        // range -80 - -76
        return {
            amplitude: 784,
            duration: 90,
            vol: 80,
            intervalTime: 333,
            group: 4,
        };
    } else if (num > -86) {
        // range -85 - -81
        return {
            amplitude: 784,
            duration: 90,
            vol: 50,
            intervalTime: 500,
            group: 3,
        };
    } else if (num > -95) {
        // range -94 - -86
        return {
            amplitude: 784,
            duration: 90,
            vol: 50,
            intervalTime: 1000,
            group: 2,
        };
    }
    // below or equal -95
    return {
        amplitude: 784,
        duration: 1000,
        vol: 0,
        intervalTime: 1000,
        group: 1,
    };
}

export const alignmentFAB = (classes, title, onClick, disabled, playing) => (
    <P2Tooltip
        title={title}
        content={(
            <div>
                <Fab
                    color="primary"
                    aria-label="alignment"
                    size="small"
                    classes={{root: classes.fab}}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {playing ?
                        <StopIcon className={classes.icon} /> :
                        <PlayIcon className={classes.icon} />
                    }
                </Fab>
            </div>
        )}
    />
);

export const adJustFAB = (classes, title, onClick, disabled) => (
    <P2Tooltip
        title={title}
        content={(
            <div>
                <Fab
                    color="primary"
                    aria-label="adJust"
                    size="small"
                    classes={{root: classes.fab}}
                    onClick={onClick}
                    disabled={disabled}
                >
                    <SettingsIcon className={classes.icon} />
                </Fab>
            </div>
        )}
    />
);

export const getFAB = (classes, title, onClick, disabled, icon) => (
    <P2Tooltip
        title={title}
        content={(
            <div>
                <Fab
                    color="primary"
                    aria-label="adJust"
                    size="small"
                    classes={{root: classes.fab}}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {icon}
                </Fab>
            </div>
        )}
    />
);

export const getFullScreenDataDispaly = (classes, color, data, shouldShowData, icon, type, t) => (
    <div
        className={classes.rssiDisplayCircleWrapper}
        style={{background: color}}
    >
        <div className={classes.rssiDisplayContentWrapper} >
            <div className={classes.rssiDisplayTittle}>{type}</div>
            <div className={classes.rssiDisplayLevelWrapper}>
                <span className={shouldShowData || data === 0 ? classes.rssiDisplayHasData : classes.rssiDisplayNoData}>
                    {data}
                </span>
                {shouldShowData || data === 0 ? <span className={classes.rssiDisplayUnitWrapper}> {t('dBm')}</span> : ''}
            </div>
            <div className={classes.iconWrapper}>{icon}</div>
        </div>
    </div>
);

export const getStatDataLine = (className, color, shouldShowData, data, title, t) => (
    <Grid container>
        <Grid item xs={3}>
            <Typography variant="h4" className={className}>
                <span style={{color: 'rgba(33, 33, 33, 0.785)'}}>{title}: </span>
            </Typography>
        </Grid>
        <Grid item xs={4} style={{textAlign: 'center'}}>
            <Typography variant="h4" className={className}>
                <span style={{color: color.localNodeColor}}>
                    {shouldShowData.shouldShowLocalData ?
                        `${data.local} ${t('dBm')}` : t('hyphen')}
                </span>
            </Typography>
        </Grid>
        <Grid item xs={1} style={{textAlign: 'center'}}>
            <Typography variant="h4" className={className}>
                <span style={{color: 'rgba(33, 33, 33, 0.785)'}}>/</span>
            </Typography>
        </Grid>
        <Grid item xs={4} style={{textAlign: 'center'}}>
            <Typography variant="h4" className={className}>
                <span style={{color: color.remoteNodeColor}}>
                    {shouldShowData.shouldShowRemoteData ?
                        `${data.remote} ${t('dBm')}` : t('hyphen')}
                </span>
            </Typography>
        </Grid>
    </Grid>
);

let graphDataCheckerTimer = null;

/*
    Helper function to fill the missing data point or drop down the data point and update the graph time .
    Setup a timer to update the array every second.
*/
export function startGraphDataChecker(bufferSize) {
    graphDataCheckerTimer = setInterval(() => {
        const {linkAlignment: {graphRadioData, ip}} = store.getState();
        const currentTime = moment();
        Object.keys(graphRadioData[ip]).forEach((radioDevice) => {
            // loop through all existing readio device
            Object.keys(graphRadioData[ip][radioDevice]).forEach((neiIp) => {
                // loop through all neighbor nodes for drop down or missing node checking
                const dataArr = graphRadioData[ip][radioDevice][neiIp];
                if (dataArr.length) {
                    const lastestDataPoint = dataArr[dataArr.length - 1];
                    const timeDiff = currentTime.diff(moment(lastestDataPoint.timestamp), 'seconds');
                    if (timeDiff === 0 && isSameNodeTimestamp(bufferSize, dataArr)) {
                        // In case of server sent an outdate and the time more that buffer time
                        dataArr[dataArr.length - 1] =
                            dropDownData(dataArr[dataArr.length - 1].nodeTimestamp, currentTime);
                    } else if (timeDiff > 0) {
                        /*
                            In case of restful response deley or missing websocket point,
                            a drop down data or a duplicate of last second data will be fillin
                            There may missing mroe that 1 time points, for loop will used to fill all missing point
                        */
                        console.log('----timeDiff', timeDiff);
                        for (let i = timeDiff - 1; i >= 0; i -= 1) {
                            const timepoint = currentTime.subtract(i, 'seconds');
                            if (shouldDropDown(bufferSize, dataArr)) {
                                if (dataArr[dataArr.length - 1].timestamp !== timepoint.format()) {
                                    // fill in a drop down data
                                    dataArr.push(
                                        dropDownData(dataArr[dataArr.length - 1].nodeTimestamp, timepoint));
                                } else {
                                    // replace the outdated data with a drop down data
                                    dataArr[dataArr.length - 1] =
                                        dropDownData(dataArr[dataArr.length - 1].nodeTimestamp, timepoint);
                                }
                            } else if (dataArr[dataArr.length - 1].timestamp !== timepoint.format()) {
                                // fill in a duplicate data
                                dataArr.push({
                                    ...dataArr[dataArr.length - 1],
                                    timestamp: timepoint.format(),
                                    isDuplicate: true,
                                    source: 'manual',
                                });
                            }
                        }
                    }
                }
            });
        });
        store.dispatch(setLinkAlignmentChartData({
            graphTime: currentTime.subtract(1, 'second').format(),
            graphRadioData,
        }));
    }, 1000);
}

export function stopGraphDataChecker() {
    clearInterval(graphDataCheckerTimer);
    graphDataCheckerTimer = null;
}

export const drawSelectItem = (key, checked, displayText, disabled) => (
    <MenuItem
        key={key}
        value={key}
        disabled={disabled}
    >
        <Checkbox checked={checked} />
        <ListItemText primary={displayText} />
    </MenuItem>
);
