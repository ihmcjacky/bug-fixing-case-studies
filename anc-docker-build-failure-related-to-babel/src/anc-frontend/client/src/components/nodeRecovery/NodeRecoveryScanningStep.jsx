import React, {useEffect, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import Constants from '../../constants/common';
import {
    updateSelectedType,
    endOfScanning,
    startScanning,
} from '../../redux/nodeRecovery/nodeRecoveryActions';
import {
    fetchMeshTopology,
    fetchNodeInfo,
} from '../../redux/meshTopology/meshTopologyActions';
import {scanNearbyNeighbor} from '../../util/apiCall';
import {scanNearbyNeiErrHandler} from './nodeRecoveryHelperFunc';
import store from '../../redux/store';

const useStyles = makeStyles({
    subTitleText: {
        fontSize: 14,
        opacity: 0.46,
    },
    selectWrapper: {
        margin: '10px 0px',
    },
    selectTitle: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.54)',
    },
    selectRoot: {
        fontSize: 14,
    },
    formControlRoot: {
        margin: '15px 0px',
    },
});

const {colors, timeout} = Constants;

const WarningBanner = ({t}) => (
    <span
        style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '3px',
            backgroundColor: colors.warningBackground,
            padding: '10px',
            margin: '10px 0px',
        }}
    >
        <i
            className="material-icons"
            style={{
                fontSize: '24px',
                paddingRight: '4px',
                color: colors.warningColor,
            }}
        >
            error_outline
        </i>
        <span style={{fontSize: 14, lineHeight: '140%', color: '#FFA400'}}>
            {t('chooseTypeWarningContent')}
        </span>
    </span>
);

// const TypesEnum = {
//     ALL: 'All',
//     SPECIFIC: 'Specific',
// };

// const TypeSelections = [
//     TypesEnum.ALL, TypesEnum.SPECIFIC,
// ];

const NodeRecoveryScanningStep = (props) => {
    const {
        t,
        handleNextFunc,
        handleLockLayerUpdate,
        handleSetDialog,
        handleDialogOnClose,
        radioOpts,
    } = props;
    const classes = useStyles();
    const {
        common: {
            csrf,
        },
        projectManagement: {
            projectId,
        },
        nodeRecovery: {
            ip,
            scanningState: {
                recoverSettings: {
                    isSet,
                    // macAddr,
                    controlNodeRadio,
                    // type,
                },
                scanningStatus,
                scanningResults,
            },
        },
    } = useSelector(store => store);
    const dispatch = useDispatch();
    const scanningTimeoutRef = useRef();

    const [selectedRadio, setSelectedRadio] = useState('');
    // const [selectedType, setSelectedType] = useState(TypesEnum.ALL);
    // const [macAddrInput, setMacAddrInput] = useState({
    //     value: '',
    //     error: false,
    //     helperText: ' ',
    // });
    const [scanningStarted, setScanningStarted] = useState(false);

    const didmountFunc = () => {
        let tempRadio = '';
        let firstEnableRadio = '';
        // let tempSelectedType = TypesEnum.ALL;
        // let tempInputValue = '';

        if (isSet) {
            // tempSelectedType = type;
            // tempInputValue = macAddr;
        }

        radioOpts.some((radioOpt) => {
            if (!Boolean(radioOpt.disabled)) {
                firstEnableRadio = radioOpt.key;

                if (!isSet) {
                    tempRadio = firstEnableRadio;
                    return true;
                } else if (isSet && radioOpt.key === controlNodeRadio) {
                    tempRadio = controlNodeRadio;
                    return true;
                }
            }
            return false;
        });
        if (tempRadio === '') {
            tempRadio = firstEnableRadio;
        }

        setSelectedRadio(tempRadio);
        // setSelectedType(tempSelectedType);
        // setMacAddrInput({
        //     ...macAddrInput,
        //     value: tempInputValue,
        // });
    }
    useEffect(didmountFunc, [radioOpts]);

    /**
     * listener when scanning ended websocket is back
     * jump to next step
     */
    const handleScanningEnded = () => {
        if (scanningStarted && scanningStatus === 'ended') {
            clearTimeout(scanningTimeoutRef.current);
            scanningTimeoutRef.current = null;

            handleLockLayerUpdate({
                loading: false,
                message: '',
            });
            if (scanningResults.length === 0) {
                handleSetDialog((prevDialog) => ({
                    ...prevDialog,
                    open: true,
                    title: t('noScannigResultsTitle'),
                    content: t('noScannigResultsContent'),
                    actionTitle: t('ok'),
                    actionFn: handleDialogOnClose,
                    cancelActTitle: '',
                    cancelActFn: handleDialogOnClose,
                }));
            } else {
                handleNextFunc();
            }
        }
    };
    useEffect(handleScanningEnded, [scanningStatus]);

    const handleSelectOnChange = (event) => {
        setSelectedRadio(event.target.value);
    };

    // const handleTypeSelectOnChange = (event) => {
    //     if (event.target.value !== TypesEnum.SPECIFIC) {
    //         setMacAddrInput({
    //             value: '',
    //             error: false,
    //             helperText: ' ',
    //         });
    //     }
    //     setSelectedType(event.target.value);
    // };

    // const handleMacAddrOnChange = (event) => {
    //     const {value} = event.target;
    //     let error = false;
    //     let helperText = ' ';
    //     if (event.target.value === '') {
    //         error = true;
    //         helperText = t('macAddrIsRequired');
    //     } else if (!isMacAddr(value)) {
    //         error = true;
    //         helperText = t('notValidMac');
    //     }

    //     setMacAddrInput({
    //         ...macAddrInput,
    //         value: value.toUpperCase(),
    //         error,
    //         helperText,
    //     });
    // };

    const checkScanningIsEnded = () => {
        const status = store.getState().nodeRecovery.scanningState.scanningStatus;
        if (status === 'scanning') {
            dispatch(endOfScanning({}));
        }
    };

    const handleScanningCall = () => {
        const body = {
            node: ip,
            radio: selectedRadio,
        };
        scanNearbyNeighbor(csrf, projectId, body).then(() => {
            dispatch(updateSelectedType({
                controlNodeRadio: selectedRadio,
                // type: selectedType,
                // macAddr: macAddrInput.value,
            }));
            dispatch(startScanning());
            setScanningStarted(true);

            scanningTimeoutRef.current = setTimeout(checkScanningIsEnded, timeout.CHECK_SCAN_NEI_TIMEOUT);
        }).catch((err) => {
            handleLockLayerUpdate({
                loading: false,
                message: '',
            });

            const {title, content} = scanNearbyNeiErrHandler(err, t);

            handleSetDialog((prevDialog) => ({
                ...prevDialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            }));
        });
    };

    const handleFetchTopologyErr = () => {
        handleLockLayerUpdate({
            loading: false,
            message: '',
        });
        handleSetDialog((prevDialog) => ({
            ...prevDialog,
            open: true,
            title: t('fetchMeshTopologyErrTitle'),
            content: t('scanNeighboErrContent'),
            actionTitle: t('ok'),
            actionFn: handleDialogOnClose,
            cancelActTitle: '',
            cancelActFn: handleDialogOnClose,
        }));
    };

    const handleStartScan = () => {
        handleLockLayerUpdate({
            loading: true,
            message: t('scanningLockLayerTitle'),
        });
        dispatch(fetchMeshTopology()).then(() => {
            dispatch(fetchNodeInfo()).then(() => {
                handleScanningCall();
            }).catch((err) => {
                if (err?.data.type === 'specific' && err.data.data[ip].success) {
                    handleScanningCall();
                } else {
                    handleFetchTopologyErr();
                }
            });
        }).catch(handleFetchTopologyErr);
    };

    const handleReset = () => {
        let firstEnableRadio;
        radioOpts.some((radioOpt) => {
            if (!Boolean(radioOpt.disabled)) {
                firstEnableRadio = radioOpt.key;
                return true;
            }
            return false;
        });

        setSelectedRadio(firstEnableRadio);
        // setSelectedType(TypesEnum.ALL);
        // setMacAddrInput({
        //     value: '',
        //     error: false,
        //     helperText: ' ',
        // });
    };

    return (
        <div>
            <Typography
                color="inherit"
                className={classes.subTitleText}
            >
                {t('chooseTypeSubTitle')}
            </Typography>
            <WarningBanner t={t} />
            <div className={classes.selectWrapper} >
                <FormControl fullWidth className={classes.formControlRoot}>
                    <Typography className={classes.selectTitle} >
                        {t('radioSelecterTitle')}
                    </Typography>
                    <Select
                        className={classes.selectRoot}
                        value={selectedRadio}
                        onChange={handleSelectOnChange}
                    >
                        {radioOpts.map(radio => (
                            <MenuItem
                                key={radio.key}
                                value={radio.key}
                                disabled={Boolean(radio.disabled)}
                            >
                                {t('menuItemLabel', {returnObjects: true})[radio.key]}
                                {radio?.disabled ? ` (${t(radio.disabled)})` : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* <FormControl fullWidth className={classes.formControlRoot}>
                    <Typography
                        component="p"
                        className={classes.selectTitle}
                    >
                        {t('typeSelecterTitle')}
                    </Typography>
                    <Select
                        className={classes.selectRoot}
                        value={selectedType}
                        onChange={handleTypeSelectOnChange}
                    >
                        {TypeSelections.map(type => (
                            <MenuItem
                                key={type}
                                value={type}
                            >
                                {t(`typeSelections${type}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Collapse in={selectedType === TypesEnum.SPECIFIC} >
                    <FormControl
                        fullWidth
                        classes={{root: classes.formControlRoot}}
                        error={macAddrInput.error}
                    >
                        <InputLabel>
                            {t('macAddrInputLabel')}
                        </InputLabel>
                        <Input
                            fullWidth
                            type="text"
                            value={macAddrInput.value}
                            onChange={handleMacAddrOnChange}
                            inputProps={{
                                className: classes.inputProps,
                                onKeyPress: (event) => {
                                    const macAddrCharReg = /[0-9a-fA-F:]/;
                                    if (!event.key.match(macAddrCharReg)) {
                                        event.preventDefault();
                                    } else if (macAddrInput.length >= 12) {
                                        event.preventDefault();
                                    }
                                },
                            }}
                        />
                        <FormHelperText>
                            {macAddrInput.helperText}
                        </FormHelperText>
                    </FormControl>
                </Collapse> */}
            </div>
            <div style={{float: 'right'}} >
                <Button
                    color="primary"
                    variant="contained"
                    style={{marginRight: 10}}
                    onClick={handleReset}
                >
                    {t('reset')}
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleStartScan}
                    // disabled={selectedType === TypesEnum.SPECIFIC && (macAddrInput.value === '' || macAddrInput.error)}
                >
                    {t('startScan')}
                </Button>
            </div>
        </div>
    );
};

NodeRecoveryScanningStep.propTypes = {
    t: PropTypes.func.isRequired,
    handleNextFunc: PropTypes.func.isRequired,
    handleLockLayerUpdate: PropTypes.func.isRequired,
    handleSetDialog: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    radioOpts: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        disabled: PropTypes.string,
    })).isRequired,
};

export default NodeRecoveryScanningStep;
