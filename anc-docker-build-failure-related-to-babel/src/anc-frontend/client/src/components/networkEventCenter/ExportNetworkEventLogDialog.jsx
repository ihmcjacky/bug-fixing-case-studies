import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import { Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { getNetworkEvent, getHistoricalData } from '../../util/apiCall';
import { Select, MenuItem, Chip } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import moment from 'moment';
import {
    closeNetworkEventCenter,
    setNetworkEventTableData,
    setNetworkEventTableMetaData,
    setNetworkEventSearchKeyword,
    closeExportNetworkEventDialog,
} from '../../redux/networkEventCenter/networkEventActions';
import NetworkEventTable from './NetworkEventTable';
import Slide from '@material-ui/core/Slide';
import FromInput from '../common/FormInput';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { ReactComponent as ExportIcon } from '../../icon/svg/ic_export.svg';
import {getEventCell, retrieveHostname} from './eventHelperFunc';
import Constant from '../../constants/common';
import {getOemNameOrAnm} from '../../util/common';

const {severityEnumToTranslateKey, evtCatTranslateKey, eventTypeTranslateKey } = Constant;
const {severityList, severityEnumToName, severityEnum}  = Constant;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
    closeButton: {
        position: 'absolute',
        right: '5px',
        top: '5px',
    },
    root: {
        margin: 0,
        width: '800px',
    },
    contentRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    formControl: {
        minWidth: 120,
        maxWidth: 400,
    },
    dataRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    subTitle: {
        fontSize: '18px',
        frontWeight: '100',
    },
    leftElem: {
        opacity: '0.9',
    }
});

const downloadCSV = (data, filename) => {
    const headers = [
      'Date & Time',
      'Event category',
      'Severity',
      'Target device(s)',
      'Event Type',
      'Event',
    ];
  
    const csvContent =
      headers.join(',') +
      '\n' +
      data
        .map((row) => row.map((cell) => JSON.stringify(cell)).join(','))
        .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

const ExportNetworkEventLogDialog = (props) => {
    const classes = useStyles();
    const {nodeInfo} = useSelector((state) => state.meshTopology);
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('cluster-maintenance-network-event');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const [selectedDateFrom, setSelectedDateFrom] = useState(moment().subtract(1, 'hours').format('YYYY-MM-DDTHH:mm'));
    const [selectedDateTo, setSelectedDateTo] = useState(moment().format('YYYY-MM-DDTHH:mm'));
    const [method, setMethod] = useState('allLogs');
    const [severity, setSeverity] = useState([
        'EMERGENCY',
        'ALERT',
        'CRITICAL',
        'ERROR',
        'WARNING',
        'NOTICE',
        'INFORMATIONAL',
        'DEBUG'
    ]);
    const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);

    const handleErrorDialogClose = () => {
      setErrorDialogOpen(false);
    };
  
    const handleShowErrorDialog = () => {
      setErrorDialogOpen(true);
    };
    const handleMethodChange = (event) => {
        setMethod(event.target.value);
    };
    const handleSeverityChange = (event) => {
        setSeverity(event.target.value);
    };

    const renderSelectedItems = (selected) => {
        const tags = selected.map((value) => {
            const translateKey = severityList.find((item) => item.actualValue === value).translateKey;
            return t(translateKey);
        });
        if (selected.length > 3) {
            return `${tags[0]}, ${tags[1]}, ${tags[2]}...`;
        }
        return `${tags.join(', ')}`;
    };

    const handleDateChange = (type, event) => {
        if (type === 'from' ) {
            setSelectedDateFrom(event.target.value);
        } else {
            setSelectedDateTo(event.target.value);
        }
    };

    const {
        sort, searchKeyword, exportDialogOpen
    } = useSelector(store => store.networkEventReducer);
    const {
        csrf
    } = useSelector(state => state.common);
    const {projectId, projectIdToNameMap} = useSelector(store => store.projectManagement);
    const dispatch = useDispatch();
    // const [enableResume, setEnableResume] = useState(resumeWhenTimeout);
    const handleClose = () => {
        dispatch(closeExportNetworkEventDialog());
    }

    const getTargetDevice = (data) => {
        if (
            data.targetDevices &&
            data.targetDevices.devices &&
            data.targetDevices.devices.length > 0
        ) {
            return data.targetDevices.devices.map(
                (device) => {
                    const node = nodeInfo[device];
                    if (node) {
                        // console.log(node)
                        return `${node.hostname} (${node.mac})`;
                    }
                    return retrieveHostname(nodeInfo, device);
                }
            ).join(', ');
        }
        return null;
    }

    const exportLog = () => {
        const filter = {projectId};
        if (method === 'customize') {
            filter['startDate'] = new Date(selectedDateFrom).toISOString();
            filter['endDate'] = new Date(selectedDateTo).toISOString();
            filter['severity'] = severity.map(s => severityEnum[s]);
            filter['sort'] = {eventLogTime: 'asc'};
        } else if (method === 'filteredLogs') {
            filter['searchKeyword'] = searchKeyword;
            filter['sort'] = sort;
        }
        getNetworkEvent(csrf, projectId, {data: filter}).then(
            (res) => {
                console.log('getNetworkEvent');
                console.log(res);
                const {eventLogs} = res;
                const data = eventLogs.map((item) => {
                    const {eventLogTime, eventCategory, severity, eventType} = item;
                    return [
                        new Date(eventLogTime).toLocaleString(),
                        t(evtCatTranslateKey[eventCategory]),
                        t(severityEnumToTranslateKey[severityEnumToName[severity]]),
                        getTargetDevice(item),
                        t(eventTypeTranslateKey[eventType]),
                        getEventCell(item, nodeInfo, t),
                    ];
                });
                const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
                const namePrefix = getOemNameOrAnm(nwManifestName);
                const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
                const projectName = projectIdToNameMap[projectId];
                const filename = `${namePrefix}_${projectName}_event-log_${currentTime}.csv`
                downloadCSV(data, filename);
                dispatch(closeExportNetworkEventDialog());
            },
            (e) => {
                console.log(e);
                handleShowErrorDialog();
            }
        );
    };

    return (
        <Dialog
            open={exportDialogOpen}
            onClose={handleClose}
            maxWidth={false}
            TransitionComponent={Transition}
        // TransitionProps={{
        //     onEnter: handleOnEnter
        // }}
        >
            <Dialog
                open={isErrorDialogOpen}
                onClose={handleErrorDialogClose}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
            >
                <DialogTitle id="error-dialog-title">Error</DialogTitle>
                <DialogContent>
                    <DialogContentText id="error-dialog-description">
                        {t('exportLogErr')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleErrorDialogClose} color="primary">
                        {t('ok')}
                    </Button>
                </DialogActions>
            </Dialog>
            <DialogTitle disableTypography className={classes.root} >
                <Typography variant="h5">{t('exportDialogTitle')}</Typography>
                <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className={classes.contentRow}>
                    <div className={classes.leftElem}>
                        <Typography variant='h5' className={classes.subTitle}>
                            {t('exportLogOptionFileFormatTitle')}
                        </Typography>
                        <Typography variant='caption'>
                            {t('exportLogOptionFileFormatSubTitle')}
                        </Typography>
                    </div>
                    <FormControl>
                        <Select
                            id="log-export-method"
                            value='csv'
                        >
                            <MenuItem value="csv">CSV</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.contentRow}>
                    <div className={classes.leftElem}>
                        <Typography variant='h5' className={classes.subTitle}>
                            {t('exportLogOptionExportMethodTitle')}
                        </Typography>
                        <Typography variant='caption'>
                            {t('exportLogOptionExportMethodSubTitle')}
                        </Typography>
                    </div>
                    <FormControl>
                        <Select
                            id="log-export-method"
                            value={method}
                            onChange={handleMethodChange}
                        >
                            <MenuItem value="allLogs">{t('allLogs')}</MenuItem>
                            <MenuItem value="filteredLogs">{t('filteredLogs')}</MenuItem>
                            <MenuItem value="customize">{t('customize')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.contentRow}>
                    <div className={classes.leftElem}>
                        <Typography variant='h5' className={classes.subTitle}>
                            {t('exportLogOptionSeverityTitle')}
                        </Typography>
                        <Typography variant='caption'>
                            {t('exportLogOptionSeveritySubTitle')}
                        </Typography>
                    </div>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="severity-label"
                            id="severity"
                            multiple
                            input={<Input />}
                            value={severity}
                            onChange={handleSeverityChange}
                            renderValue={renderSelectedItems}
                            disabled={method !== 'customize'}
                        >
                            {severityList.map((_severity, index) => (
                                <MenuItem key={index} value={_severity.actualValue}>
                                    <Checkbox checked={severity.indexOf(_severity.actualValue) > -1} />
                                    {_severity.displayValue}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.contentRow}>
                    <div className={classes.leftElem}>
                        <Typography variant='h5' className={classes.subTitle}>
                            {t('exportLogOptionLogDataTitle')}
                        </Typography>
                        <Typography variant='caption'>
                            {t('exportLogOptionLogDataSubTitle')}
                        </Typography>
                    </div>
                    <div>
                    <FormControl className={classes.dataRow}>
                            <TextField
                                id="from"
                                type="datetime-local"
                                // defaultValue={new Date().toDateString()}
                                value={selectedDateFrom}
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => handleDateChange('from', e)}
                                disabled={method !== 'customize'}
                            />
                            <div style={{margin: '0 5px'}}>to</div>
                            <TextField
                                id="to"
                                type="datetime-local"
                                // defaultValue={new Date().toDateString()}
                                value={selectedDateTo}
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => handleDateChange('to', e)}
                                disabled={method !== 'customize'}
                            />
                    </FormControl>

                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {t('cancel')}
                </Button>
                <Button onClick={exportLog} color="primary">
                    {t('export')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ExportNetworkEventLogDialog.propTypes = {
    // t: PropTypes.func.isRequired,
    // handleClose: PropTypes.func.isRequired,
};

export default ExportNetworkEventLogDialog;
