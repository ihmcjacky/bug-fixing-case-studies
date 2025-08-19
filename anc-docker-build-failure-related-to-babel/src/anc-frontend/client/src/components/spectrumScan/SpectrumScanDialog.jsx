import React, {useEffect, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import JSZip from 'jszip';
// import saveAs from 'file-saver';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {makeStyles} from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import {ReactComponent as ImportIcon} from '../../icon/svg/ic_import.svg';
import saveAs from '../../util/nw/saveAs';
import SpectrumScanControlPanel from './SpectrumScanControlPanel';
import SpectrumScanNodeInfo from './SpectrumScanNodeInfo';
import P2Dialog from '../../components/common/P2Dialog';
import P2Tooltip from '../../components/common/P2Tooltip';
import LockLayer from '../../components/common/LockLayer';
import {
    closeSpectrumScanDialog,
    changeSelectedRadio, changeDuration,
    changeFreqRange,
    resetSpectrumScanSettings,
    startSpectrumScan,
    spectrumScanEnd,
    changeRangeToDefault,
    setRadioSettings,
    setRadioFreqAndBandwidthMap,
    parsaAnalysisSpectrumDataToGraphData,
    removeSpectrumScanData,
    closeSpectrumScanError,
} from '../../redux/spectrumScan/spectrumScanActions';
import {resetClusterInformation} from '../../redux/dashboard/dashboardActions';
import {toggleSnackBar} from '../../redux/common/commonActions';
import Constant from '../../constants/common';
import SpectrumGraph from './SpectrumGraph';
import {getSpectrumScanConfig, searchDisplayValue, getErrorDialogContent} from './spectrumScanHelperFunc';
import store from '../../redux/store';
import {
    analysisSpectrumData,
    spectrumScan,
    getRadioInfo,
} from '../../util/apiCall';
import {getOemNameOrAnm} from '../../util/common';

const {colors} = Constant;
const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
    },
    wrapper: {
        backgroundColor: '#E5E5E5',
        fontFamily: 'Roboto',
        padding: 24,
    },
    detailWrapper: {
        width: 'auto',
        height: 'calc(100vh - 112px)',
        // height: 'inherit',
        overflowY: 'auto',
    },
    titleChip: {
        borderRadius: '4px',
        margin: '0 8px',
        backgroundColor: Constant.themeObj.primary.light,
        color: 'white',
        fontWeight: 'bolder',
        height: '23px',
    },
    dspIteration: {
        width: '300px',
    },
});

const useStyles = makeStyles(styles);

let timeout;

const SpectrumScanDialog = () => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const {
        ip,
        selectedRadio, freqRange: {upper, lower},
        duration, isAnalysisData,
        graphData: {hasData},
        scanError: {hasError, errorType},
    } = useSelector(state => state.spectrumScan);
    const {
        csrf,
        labels,
        hostInfo: {hostname, port},
    } = useSelector(state => state.common);
    const {projectId, projectIdToNameMap} = useSelector(state => state.projectManagement);
    const nodeInfo = useSelector(state => state.meshTopology.nodeInfo[ip]) || {};
    const getImmediateScanning = () => store.getState().spectrumScan.scanning;
    const {t: _t, ready} = useTranslation('spectrum-scan');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const needWarning = true;

    const inputRef = useRef();
    const [state, setState] = useState({
        radioArr: [],
        dspIterations: '',
        defaultRadio: 0,
    });
    const [lockState, setLockState] = useState({
        loading: true,
        message: '',
    });
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: '',
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });
    const [isDefaultScan, setDefaultScan] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [fullSizeGraph, setFullSizeGraph] = useState(false);
    const updateWindowWidth = () => { setWindowWidth(window.innerWidth); };

    const didmountFunc = () => {
        dispatch(resetClusterInformation());
        const radioSettings = {[ip]: {}};
        Object.keys(Constant.modelOption[nodeInfo.model].radioSettings).forEach((radio) => {
            radioSettings[ip][radio] = {};
            radioSettings[ip][radio] = Constant.modelOption[nodeInfo.model].radioSettings[radio];
        });
        window.addEventListener('resize', updateWindowWidth);
        getSpectrumScanConfig(csrf, radioSettings, {nodes: [ip]}, ip).then((data) => {
            let tempRadio = 0;
            const radioFreqBandwidthMap = {};
            let all49 = true;
            let allDisable = true;
            let noValidRadio = true;
            const radioArr = [];

            return getRadioInfo(csrf, projectId, {nodes: [ip]}).then((radioInfo) => {
                const txpowerMap = {};
                Object.keys(radioInfo[ip]).forEach((r) => {
                    txpowerMap[r] = radioInfo[ip][r].txpower;
                });
                Object.keys(data.actualValue).forEach((radio, index) => {
                    const bandwidth = data.actualValue[radio].channelBandwidth;
                    const centralFreq = searchDisplayValue(
                        data.actualValue[radio].centralFreq,
                        data.displayValue[radio].centralFreq);
                    const centeralInt = parseInt(centralFreq.replace(' MHz', ''), 10);

                    const isDisabled = data.actualValue[radio].status === 'disable';
                    const is49Radio = centeralInt <= 4999;


                    if (isDisabled) {
                        if (tempRadio === index) tempRadio += 1;
                        radioArr.push({
                            key: radio,
                            disable: true,
                            reason: 'disabled',
                        });
                    } else if (is49Radio) {
                        if (tempRadio === index) tempRadio += 1;
                        radioArr.push({
                            key: radio,
                            disable: true,
                            reason: 'is49GHz',
                        });
                    } else {
                        if (!isDisabled) {
                            allDisable = false;
                        }
                        if (!is49Radio) {
                            all49 = false;
                        }
                        noValidRadio = false;
                        radioArr.push({
                            key: radio,
                            disable: false,
                        });
                    }
                    radioFreqBandwidthMap[radio] = {
                        bandwidth: parseInt(bandwidth, 10),
                        centralFreq: centeralInt,
                        txpower: txpowerMap[radio],
                    };
                });
                if (allDisable) throw new Error('allDisabled');
                if (all49) throw new Error('all49GHz');
                if (noValidRadio) throw new Error('noValidRadio');

                dispatch(setRadioFreqAndBandwidthMap(radioFreqBandwidthMap));
                dispatch(setRadioSettings(data));
                if (tempRadio !== 0) {
                    dispatch(changeSelectedRadio(`radio${tempRadio}`));
                }
                setLockState({
                    loading: false,
                    message: '',
                });
                setState({
                    ...state,
                    radioArr,
                    defaultRadio: tempRadio,
                });
            }).catch(((e) => { throw e; }));
        }).catch((e) => {
            setLockState({
                loading: false,
                message: '',
            });
            let title = t('getConfigFailTitle');
            let content = t('getConfigFailContent');
            if (e?.message === 'all49Ghz') {
                title = t('all49GhzTitle');
                content = t('all49GhzContent');
            } else if (e?.message === 'allDisabled') {
                title = t('allDisabledTitle');
                content = t('allDisabledContent');
            } else if (e?.message === 'noValidRadio') {
                title = t('noValidRadioTitle');
                content = t('noValidRadioContent');
            }
            setDialog({
                ...dialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionFn: () => { dispatch(closeSpectrumScanDialog()); },
            });
        });
        return () => {
            window.removeEventListener('resize', updateWindowWidth);
            dispatch(removeSpectrumScanData());
        };
    };
    useEffect(didmountFunc, []);

    if (!ready) return <span />;

    const handleClose = () => { dispatch(closeSpectrumScanDialog()); };
    const handleDialogOnClose = () => {
        setDialog((prevState) => ({...prevState, open: false}));
     };
    const handleRadioChange = (event) => { dispatch(changeSelectedRadio(event.target.value)); };
    const handleDurationChange = (event) => { dispatch(changeDuration(event.target.value)); };
    const handleSliderOnChange = (range) => { dispatch(changeFreqRange(range)); };
    const handleReset = () => { dispatch(resetSpectrumScanSettings(state.defaultRadio)); };
    const handleScan = () => {
        if (timeout) clearTimeout(timeout);
        setLockState({
            loading: true,
            message: '',
        });
        dispatch(startSpectrumScan());
        let dspIterations = 5000;
        if (state.dspIterations !== '') {
            dspIterations = parseInt(state.dspIterations, 10);
        } else {
            const isX20 = nodeInfo.model.match(/^[X][2]/g);
            if (isX20) {
                dspIterations = upper - lower > 80 ? 13500 : 1500;
            } else {
                dspIterations = upper - lower > 80 ? 5000 : 1000;
            }
        }

        let frequencyLowerBound = lower * 1000;
        let frequencyUpperBound = upper * 1000;
        if (isDefaultScan) {
            frequencyLowerBound = 0;
            frequencyUpperBound = 0;
        }

        spectrumScan(csrf, projectId, {
            nodes: [ip],
            radio: selectedRadio,
            frequencyLowerBound,
            frequencyUpperBound,
            duration,
            dspIterations,
        }).then(() => {
            timeout = setTimeout(() => {
                if (getImmediateScanning()) {
                    dispatch(spectrumScanEnd());
                    setDialog({
                        ...dialog,
                        open: true,
                        title: t('spectrumDataFaildTitle'),
                        content: t('timeout'),
                        actionTitle: t('ok'),
                        actionFn: handleDialogOnClose,
                    });
                }
                timeout = null;
            }, ((duration) + 40) * 1000);
            setLockState({
                loading: false,
                message: '',
            });
        }).catch((err) => {
            dispatch(spectrumScanEnd());
            if (err?.data?.type === 'errors') {
                const errObj = err.data.data[0];
                const content = getErrorDialogContent(errObj, t);
                setDialog({
                    ...dialog,
                    open: true,
                    title: t('spectrumDataFaildTitle'),
                    content,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        handleDialogOnClose();
                        dispatch(spectrumScanEnd());
                    },
                });
            } else {
                const content = getErrorDialogContent({}, t);
                setDialog({
                    ...dialog,
                    open: true,
                    title: t('spectrumDataFaildTitle'),
                    content,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        handleDialogOnClose();
                        dispatch(spectrumScanEnd());
                    },
                });
            }
            setLockState({
                loading: false,
                message: '',
            });
        });
    };

    const setDialogContent = (content) => {
        setDialog({
            ...dialog,
            ...content,
        });
    };

    const setScanRangeToDefault = () => {
        setDefaultScan(true);
        dispatch(changeRangeToDefault());
    };

    const handleUncheckDefault = (range) => {
        setDialog({
            ...dialog,
            open: true,
            title: t('uncheckDefaultTitle'),
            content: t('uncheckDefaultContent'),
            actionTitle: t('ok'),
            actionFn: () => {
                setDefaultScan(false);
                handleSliderOnChange(range);
                setDialog({
                    ...dialog,
                    open: false,
                    cancelActTitle: '',
                    cancelActFn: () => {},
                });
            },
            cancelActTitle: t('cancel'),
            cancelActFn: () => {
                setDialog({
                    ...dialog,
                    open: false,
                });
            },
        });
    };

    const handleErrDialogOnClose = () => { dispatch(closeSpectrumScanError()); };

    const getErrDialogTitle = () => {
        if (hasError) {
            if (errorType === 'spectrumscan.nosamples') {
                return t('nosamplesTittle');
            }
        }
        return '';
    };

    const getScanErrorDialogContent = () => {
        if (hasError) {
            if (errorType === 'spectrumscan.nosamples') {
                return t('nosamplesContent');
            }
        }
        return '';
    };

    const dspIterationChange = (event) => {
        setState({
            ...state,
            dspIterations: event.target.value,
        });
    };

    // const setLoader = (loading) => {
    //     console.log('setLoader input isLoading: ', loading);
    //     setLockState({
    //         loading,
    //         message: '',
    //     });
    //     // setState((prevState) => {
    //     //     console.log('setLoader prevState isLoading: ', prevState.loading);
    //     //     return {
    //     //         ...prevState,
    //     //         loading,
    //     //         message: '',
    //     //     };
    //     // });
    // };

    const selectFileHandler = async (event) => {
        event.stopPropagation();
        event.preventDefault();

        setLockState({
            loading: true,
            message: t('analysingData'),
        });

        const file = event.target.files[0];
        const loadZipFile = await JSZip.loadAsync(file, {base64: true}).catch(e => e);
        if (loadZipFile instanceof Error) {
            setDialog({
                ...dialog,
                open: true,
                title: t('analysisSpectrumDataFaildTitle'),
                content: t('analysisImagetypeErr'),
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
            });

            setLockState({
                loading: false,
                message: '',
            });
            return;
        }
        let result;
        try {
            const str = await loadZipFile.file('rawData.json').async('string').catch((e) => { throw e; });
            result = JSON.parse(str);
        } catch (err) {
            setDialog({
                ...dialog,
                open: true,
                title: t('analysisSpectrumDataFaildTitle'),
                content: t('analysisFilenameErr'),
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
            });
            setLockState({
                loading: false,
                message: '',
            });
            return;
        }
        const model = result.model ? result.model : 'X30';
        const upperBound = result.frequency_upper_bound;
        const lowerBound = result.frequency_lower_bound;
        if (!upperBound || !lowerBound) {
            setDialog({
                ...dialog,
                open: true,
                title: t('analysisSpectrumDataFaildTitle'),
                content: t('analysisFileStructureErr'),
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
            });
            setLockState({
                loading: false,
                message: '',
            });
            return;
        }

        let dspIterations;
        const is80MHz = upperBound - lowerBound <= 80000;
        if (model.match(/^[X][2]/g)) {
            dspIterations = is80MHz ? 1500 : 13500;
        } else {
            dspIterations = is80MHz ? 1000 : 5000;
        }

        const body = new FormData();
        body.append('dspIterations', dspIterations);
        body.append('rawData', file);
        analysisSpectrumData(csrf, projectId, body).then((res) => {
            dispatch(parsaAnalysisSpectrumDataToGraphData(res, file.name, dspIterations));
        }).catch((err) => {
            if (err.errors) {
                const errObj = err.errors[0];
                const content = getErrorDialogContent(errObj, t);
                setDialog({
                    ...dialog,
                    open: true,
                    title: t('analysisSpectrumDataFaildTitle'),
                    content,
                    actionTitle: t('ok'),
                    actionFn: handleDialogOnClose,
                });
            } else {
                const content = getErrorDialogContent({}, t);
                setDialog({
                    ...dialog,
                    open: true,
                    title: t('analysisSpectrumDataFaildTitle'),
                    content,
                    actionTitle: t('ok'),
                    actionFn: handleDialogOnClose,
                });
            }
        }).finally(() => {
            if (inputRef.current) inputRef.current.value = '';
            setLockState({
                loading: false,
                message: '',
            });
        });
    };

    const exportOnClick = () => {
        setLockState({
            loading: true,
            message: '',
        });
        // const path = '/api/django/media/runtime/spectrum_scan_raw.zip';
        const path = `http://${hostname}:${port}/media/runtime/spectrum_scan_raw.zip`;

        fetch(path).then((res) => {
            if (res.status === 200) {
                res.blob().then(async (q) => {
                    const zip = await JSZip.loadAsync(q);
                    JSON.parse(await zip.file('rawData.json').async('string'));
                    const projectName = projectIdToNameMap[projectId];
                    const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
                    const namePrefix = getOemNameOrAnm(nwManifestName);
                    const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
                    const nodeHostname = nodeInfo.hostname
                    const filename = `${namePrefix}_${projectName}_${nodeHostname}_spectrum-scan_${currentTime}.zip`;
                    
                    saveAs(q, filename, '.zip').then((res) => {
                        if (res.success) {
                            dispatch(toggleSnackBar(t('downloadCompleted')));
                        }
                    });

                    setLockState({
                        loading: false,
                        message: '',
                    });
                });
            } else {
                window.open(path);
                setLockState({
                    loading: false,
                    message: '',
                });
            }
        });
    };

    const importExportGroup = (
        <ButtonGroup
            variant="contained"
            color="primary"
            style={{height: '30px', marginLeft: '20px'}}
        >
            <Button
                style={{padding: '7px'}}
                onClick={() => setFullSizeGraph(prevFullSizeGraph => !prevFullSizeGraph)}
            >
                <P2Tooltip
                    title={fullSizeGraph ? t('collapse') : t('expand')}
                    content={(<i
                        className="material-icons"
                        style={{
                            ...(!fullSizeGraph ? {
                                transform: 'rotate(180deg)',
                                transitionDuration: '0.2s',
                            } :
                                {
                                    transform: 'rotate(0deg)',
                                    transitionDuration: '0.2s',
                                }),
                        }}
                    >keyboard_arrow_down
                    </i>)}
                />
            </Button>
            <Button
                style={{padding: '7px'}}
                onClick={() => { inputRef.current.click(); }}
            >
                <P2Tooltip
                    title={t('import')}
                    content={<ImportIcon
                        fill="#fff"
                    />}
                />
            </Button>
            <Button
                style={{padding: '7px'}}
                disabled={isAnalysisData || !hasData}
                onClick={exportOnClick}
            >
                <P2Tooltip
                    title={t('export')}
                    content={<ExportIcon
                        fill={(isAnalysisData || !hasData) ? 'rgba(0, 0, 0, 0.26)' : '#fff'}
                    />}
                />
            </Button>
        </ButtonGroup>
    );

    const warningCompoment = (<div style={{width: '100%'}}>
        <span style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '3px',
            backgroundColor: colors.warningBackground,
            padding: '10px 18%',
        }}
        >
            <i
                className="material-icons"
                style={{
                    fontSize: '36px',
                    paddingRight: '16px',
                    color: colors.warningColor,
                }}
            >error_outline</i>
            <span style={{fontSize: 14, lineHeight: '140%', color: '#FFA400'}}>
                {t('warningContext')}
            </span>
        </span>
    </div>);

    return (
        <>
            <AppBar className={classes.appBar} position="fixed" >
                <Toolbar>
                    <IconButton
                        edge="start"
                        aria-label="close"
                        color="inherit"
                        disabled={getImmediateScanning()}
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {`${nodeInfo.hostname} - ${t('spectrumScanTitle')}`}
                    </Typography>
                    <Chip
                        label={t('beta')}
                        className={classes.titleChip}
                    />
                </Toolbar>
            </AppBar>
            <DialogContent className={classes.wrapper}>
                <Card
                    classes={{root: classes.detailWrapper}}
                    elevation={0}
                >
                    <Grid
                        container
                        style={{display: 'flex', flex: 1}}
                    >
                        <LockLayer
                            display={lockState.loading || getImmediateScanning()}
                            message={lockState.message}
                            countdown={{
                                display: getImmediateScanning(),
                                displayNumber: getImmediateScanning() && !lockState.loading,
                                duration,
                                completeMsg: t('completeMsg'),
                                progressingMsg: t('progressingMsg'),
                            }}
                        />
                        {
                            !fullSizeGraph &&
                            <React.Fragment>
                                {needWarning ? warningCompoment : null}
                                <SpectrumScanNodeInfo
                                    t={t}
                                    loading={lockState.loading}
                                    hasWarning={needWarning}
                                    oneLineDisplay={windowWidth > 1337}
                                />
                                <SpectrumScanControlPanel
                                    t={t}
                                    hasWarning={needWarning}
                                    oneLineDisplay={windowWidth > 1337}
                                    selectedRadio={selectedRadio}
                                    freqRange={[lower, upper]}
                                    duration={duration}
                                    radioNameArr={state.radioArr}
                                    handleRadioChange={handleRadioChange}
                                    handleDurationChange={handleDurationChange}
                                    handleSliderOnChange={handleSliderOnChange}
                                    handleUncheckDefault={handleUncheckDefault}
                                    handleReset={handleReset}
                                    handleScan={handleScan}
                                    setScanRangeToDefault={setScanRangeToDefault}
                                    setDialog={setDialogContent}
                                    isDefaultScan={isDefaultScan}
                                    setDefaultScan={setDefaultScan}
                                />
                                <div
                                    id="dsp-iteration-input-debug"
                                    style={{
                                        margin: '5px 5%',
                                        display: 'none',
                                    }}
                                >
                                    <TextField
                                        id="outlined-name"
                                        classes={{root: classes.dspIteration}}
                                        label="DSP Iterations (500 - 10000)"
                                        value={state.dspIterations}
                                        onChange={dspIterationChange}
                                    />
                                </div>
                                <div
                                    style={{
                                        margin: '0 5%',
                                        borderBottom: '1px solid rgba(33, 33, 33, 0.37)',
                                        display: 'block',
                                        width: '90%',
                                    }}
                                />
                            </React.Fragment>
                        }
                        <SpectrumGraph
                            t={t}
                            importExportGroup={importExportGroup}
                            isAnalysisData={isAnalysisData}
                            fullSizeGraph={fullSizeGraph}
                            needWarning={needWarning}
                            // setLoader={setLoader}
                            // isLoading={lockState.loading}
                        />
                    </Grid>
                </Card>
            </DialogContent>
            <P2Dialog
                id="info-dialog-test-id"
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
            />
            <P2Dialog
                open={hasError}
                handleClose={handleErrDialogOnClose}
                title={getErrDialogTitle()}
                content={getScanErrorDialogContent()}
                actionTitle={t('ok')}
                actionFn={handleErrDialogOnClose}
            />
            <input
                style={{display: 'none'}}
                ref={inputRef}
                id="spectrum-data-input"
                type="file"
                accept="application/zip"
                multiple={false}
                onChange={selectFileHandler}
                name="rawData.zip"
            />
        </>
    );
};

SpectrumScanDialog.propTypes = {};

export default SpectrumScanDialog;
