import React, {useEffect, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import {formValidator} from '../../util/inputValidator';
import FormInputCreator from '../common/FormInputCreator';
import P2Table from '../common/P2Table';
import P2SearchBar from '../common/P2SearchBar';
import P2Tooltip from '../common/P2Tooltip';
import {clearScanningResult, updateRecoverNodeResult} from '../../redux/nodeRecovery/nodeRecoveryActions';
import {nodeRecoveryErrHandler} from './nodeRecoveryHelperFunc';
import {fetchMeshTopology, fetchNodeInfo} from '../../redux/meshTopology/meshTopologyActions';
import {updateManagedDevList} from '../../util/apiCall';
import store from '../../redux/store';

const useStyles = makeStyles({
    subTitleText: {
        fontSize: 14,
        opacity: 0.46,
    },
});

const Headers = [
    {
        header: 'mac',
        canSort: true,
    },
    {
        header: 'clusterId',
        canSort: true,
    },
    {
        header: 'operationMode',
        canSort: true,
    },
    {
        header: 'radio',
        canSort: true,
    },
    {
        header: 'channel',
        canSort: true,
    },
    {
        header: 'channelBandwidth',
        canSort: true,
    },
];

const radioMap = {
    radio0: "RADIO 0",
    radio1: "RADIO 1",
    radio2: "RADIO 2",
};

const FETCH_API_MAX_RETRY = 7;
const FETCH_API_TIMEOUT = 10000;
let topologyApiCallCounter = 0;

const NodeRecoveryRecoverStep = (props) => {
    const {
        t,
        encKeyRegex,
        handleLockLayerUpdate,
        handleStartRecoverNode,
        handleUpdateTopologyFailed,
        handleDialogPopup,
        handleDialogOnClose,
        handleNextFunc,
        handleBackFunc,
        setUnmanagedDevicesTemp,
        unmanagedDevicesTemp
    } = props;
    const classes = useStyles();
    const {
        common: {csrf},
        projectManagement: {projectId},
        nodeRecovery: {
            ip,
            scanningState: {
                scanningResults,
                recoverSettings: {
                    controlNodeRadio,
                },
            },
            open,
            recoverState: {
                recoveryStatus,
                recoveryResult,
            },
        },
    } = useSelector(store => store);
    const dispatch = useDispatch();
    const fetchTopologyTimer = useRef();

    const [searchBar, setSearchBar] = useState({
        searchKey: '',
    });
    const [pageSettings, setPageSettings] = useState({
        currentPage: 0,
        itemsPerPage: 10,
    });
    const [tableHeaders, setTableHeaders] = useState({
        parentHeaders: [],
        Headers: Headers.map((header) => ({
            ...header,
            headerLabel: t(header.header),
        })),
    });
    const [selectedRow, setSelectedRow] = useState([]);
    const [sortingObj, setSortingObj] = useState({
        sortBy: 'mac',
        sorting: 'asc',
    });
    const [tableData, setTableData] = useState([]);
    const [inputStatus, setInputStatus] = useState({
        value: '',
        helperText: ' ',
        error: false,
        showPassword: false,
    });
    const [recoveryStated, setRecoveryStarted] = useState(false);

    useEffect(() => {
        return () => {
            if (fetchTopologyTimer.current) {
                clearTimeout(fetchTopologyTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        setTableData(scanningResults.map(data => data))
    }, [scanningResults]);

    /**
     * Function called after temp connected.
     * fetch mesh topology in store
     * auto retry when api call return success false or lost node not existing in topology
     * popup update topology failed dialog when cannot receive topology twice
     *
     * @param {string} lostNodeIp
     */
    const handleUpdateMeshTopology = (lostNodeIp, controlNodeIp) => {
        if (!open || recoveryStatus === 'pending') return;
        topologyApiCallCounter += 1;
        dispatch(fetchMeshTopology()).then((res) => {
            if (res.res[lostNodeIp] && res.res[lostNodeIp].isAuth !== 'unknown') { // lost node shown in topology
                const {graph: {nodes}} = res;
                const nodesToUnmanage = nodes.filter(
                    (node) => {
                        if (node.isManaged && node.id !== lostNodeIp && node.id !== controlNodeIp) {
                            return true;
                        }
                        return false;
                    }
                ).map(node => node.id);
                if (nodesToUnmanage.length > 0) {
                    setUnmanagedDevicesTemp(
                        (pre) => {
                            return [...pre, ...nodesToUnmanage];
                        }
                    );
                    updateManagedDevList(csrf, projectId, {del: nodesToUnmanage}).then(() => {
                        handleNextFunc();
                    });
                } else {
                    handleNextFunc();
                }
            } else { // lost node not exist
                if (topologyApiCallCounter > FETCH_API_MAX_RETRY) {
                    topologyApiCallCounter = 0;
                    handleLockLayerUpdate({
                        loading: false,
                        message: '',
                    });
                    handleUpdateTopologyFailed();
                } else {
                    fetchTopologyTimer.current = setTimeout(() => {
                        handleUpdateMeshTopology(lostNodeIp, controlNodeIp);
                    }, FETCH_API_TIMEOUT);
                }
            }
        }).catch((e) => {
            console.log('kenny-e')
            console.log(e)
            if (topologyApiCallCounter > FETCH_API_MAX_RETRY) {
                topologyApiCallCounter = 0;
                handleLockLayerUpdate({
                    loading: false,
                    message: '',
                });
                handleUpdateTopologyFailed();
            } else {
                fetchTopologyTimer.current = setTimeout(() => {
                    handleUpdateMeshTopology(lostNodeIp, controlNodeIp);
                }, FETCH_API_TIMEOUT);
            }
        });
    };

    /**
     * store node recovery status listener
     * update managed decice list and fetch meshTopology when recoveryStatus tempConnected
     * error handling when recoveryStatus error
     */
    const handleNodeRecoverWebsocket = () => {
        console.log('------handleNodeRecoverWebsocket', recoveryResult, recoveryStatus, recoveryStated);
        if (recoveryStated && recoveryStatus === 'tempConnected') {
            // add lost node to managedDeviceList no matter it have added or not
            updateManagedDevList(csrf, projectId, {add: [recoveryResult.info.nodeIp]}).then(() => {
                handleUpdateMeshTopology(recoveryResult.info.nodeIp, ip);
            });
        } else if (recoveryStated && recoveryStatus === 'error') {
            setRecoveryStarted(false);
            handleLockLayerUpdate({
                loading: false,
                message: '',
            });
            if (recoveryResult.errors[0].type === 'noderecovery.invalidkey') {
                setInputStatus({
                    ...inputStatus,
                    error: true,
                    helperText: t('invalidkeyHelperText'),
                });
            } else {
                const {title, content} = nodeRecoveryErrHandler({
                    data: {
                        type: 'errors',
                        data: [recoveryResult.errors[0]],
                    },
                }, t);
                handleDialogPopup((prevState) => ({
                    ...prevState,
                    open: true,
                    title,
                    content,
                    actionTitle: t('ok'),
                    actionFn: () => {
                        handleDialogOnClose();
                    },
                    cancelActTitle: '',
                    cancelActFn: handleDialogOnClose,
                }));
            }
        }
    };
    useEffect(handleNodeRecoverWebsocket, [recoveryStatus])

    const handleBackBtnOnClick = () => {
        dispatch(clearScanningResult());
        handleBackFunc();
    };

    const handleRecoveryNoResultTimeout = () => {
        setTimeout(() => {
            const {recoveryStatus} = store.getState().nodeRecovery.recoverState;
            console.log(recoveryStatus)
            if (recoveryStatus !== 'processing') {
                return;
            }
            const timeoutResult = {
                errors: [{
                    success: false,
                    type: 'ui.nodeRecoveryTimeout',
                }]
            };
            dispatch(updateRecoverNodeResult(timeoutResult));
        }, 65000);
    };

    const handleRecoveryBtnOnClick = () => {
        setRecoveryStarted(true);
        handleLockLayerUpdate({
            loading: true,
            message: t('revoceryLockTitle'),
        });

        let lostNodeRadio;
        let lostNodeChannel;
        let lostNodeMac;
        scanningResults.some((result) => {
            if (result.id === selectedRow[0]) {
                lostNodeRadio = result.radio;
                lostNodeChannel = result.channel;
                lostNodeMac = result.mac;
                return true;
            }
            return false;
        });

        const body = {
            controlNode: {
                nodeIp: ip,
                radio: controlNodeRadio,
            },
            neighborInfo: {
                mac: lostNodeMac,
                radio: lostNodeRadio,
                optionalChannel: lostNodeChannel.toString(),
            },
            encKey: inputStatus.value,
        };
        handleStartRecoverNode(body).then(() => {
            handleRecoveryNoResultTimeout();
        }).catch(() => {
            handleLockLayerUpdate({
                loading: false,
                message: '',
            });
        });
    };

    const handleSearch = (event) => {
        setSearchBar({searchKey: event});
        setPageSettings({
            ...pageSettings,
            currentPage: 0,
        });
    };

    const handleRequestSort = (event, property) => {
        let targetSortOrder = 'asc';
        if (property === sortingObj.sortBy) {
            targetSortOrder = sortingObj.sorting === 'asc' ? 'desc' : 'asc';
        }
        setTableData(tableData.sort((a, b) => {
            if (a[property] === b[property]) {
                return 0;
            }
            if (targetSortOrder === 'asc') {
                return a[property] > b[property] ? 1 : -1;
            }
            return a[property] > b[property] ? -1 : 1;
        }));
        setSortingObj({
            ...sortingObj,
            sortBy: property,
            sorting: targetSortOrder,
        });
    };

    const handleChangePage = (event, page) => {
        setPageSettings({
            ...pageSettings,
            currentPage: page,
        });
    };

    const handleChangeItemsPerPage = (event) => {
        const {itemsPerPage, currentPage} = pageSettings;
        const newItemsPerPage = event.target.value;
        const newMaxPage = Math.ceil(tableData.length / newItemsPerPage) - 1;

        setPageSettings({
            ...pageSettings,
            ...(newItemsPerPage > itemsPerPage && newMaxPage < currentPage ? {currentPage: newMaxPage} : {}),
            itemsPerPage: newItemsPerPage,
        });
    };

    const handleSelectRadioClick = (event, mac) => {
        setSelectedRow([mac]);
    };

    const handleClickShowPasssword = () => {
        setInputStatus({
            ...inputStatus,
            showPassword: !inputStatus.showPassword,
        });
    };

    const encryptionKeyInputOnChange = (event) => {
        const inputValue = event.target.value;
        const pwdReg = new RegExp(encKeyRegex);
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }
        setInputStatus({
            ...inputStatus,
            value: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });
    };

    return (
        <div>
            <Typography
                color="inherit"
                className={classes.subTitleText}
            >
                {t("chooseNodeSubTitle1")}
                <b>{radioMap[controlNodeRadio]}</b>
                {t("chooseNodeSubTitle2")}
            </Typography>
            <div style={{paddingTop: '30px'}}>
                <P2SearchBar
                    onRequestSearch={handleSearch}
                    disableCloseButton
                />
                <div style={{paddingTop: '20px'}}>
                    <P2Table
                        tblHeaders={{
                            ...tableHeaders,
                            ...sortingObj,
                        }}
                        tblData={tableData.filter((row) => {
                            const keywords = searchBar.searchKey.trim();
                            if (keywords === '') {
                                return true;
                            }
                            let includeKeyword = false;
                            Object.keys(row).some((cellId) => {
                                if (cellId === 'id') {
                                    return false;
                                }
                                const content = row[cellId].toString();
                                if (content.includes(keywords)) {
                                    includeKeyword = true;
                                    return true;
                                }
                                return false;
                            });
                            return includeKeyword;
                        })}
                        tblFooter={{
                            ...pageSettings,
                            totalItems: tableData.length,
                        }}
                        tblFunction={{
                            handleRequestSort,
                            handleSelectRadioClick,
                            handleChangePage,
                            handleChangeItemsPerPage,
                        }}
                        tblSelector={{
                            selectedId: selectedRow,
                        }}
                        tblToggle={{
                            enableFooter: true,
                            enableSort: true,
                            enableSelect: true,
                            enableHeader: true,
                            enableRadioSelect: true,
                        }}
                    />
                </div>
            </div>
            <FormInputCreator
                key="wifi-encryption-input"
                errorStatus={inputStatus.error}
                inputLabel={t('wifiEncryption')}
                inputID="wifi-encryption-input"
                inputValue={inputStatus.value}
                onChangeField={encryptionKeyInputOnChange}
                autoFocus={false}
                margin="normal"
                placeholder=""
                helperText={inputStatus.helperText}
                inputType={inputStatus.showPassword ? 'text' : 'password'}
                showHelpTooltip
                helpTooltip={(
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <span>{t('wifiEncryption')}</span>
                        <P2Tooltip
                            direction="right"
                            title={t('wifiEncryptionHelperText')}
                            content={(
                                <i
                                    className="material-icons"
                                    style={{
                                        fontSize: '20px',
                                        marginLeft: '5px',
                                        marginTop: '-1px',
                                    }}
                                >
                                    help
                                </i>
                            )}
                        />
                    </span>
                )}
                endAdornment={(
                    <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPasssword} >
                            {inputStatus.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                )}
            />
            <div style={{float: 'right'}} >
                <Button
                    color="primary"
                    variant="contained"
                    style={{marginRight: 10}}
                    onClick={handleBackBtnOnClick}
                >
                    {t('backBtn')}
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleRecoveryBtnOnClick}
                    disabled={selectedRow.length === 0 || inputStatus.error || inputStatus.value === ''}
                >
                    {t('recoveryBtn')}
                </Button>
            </div>
        </div>
    );
};

NodeRecoveryRecoverStep.propTypes = {
    t: PropTypes.func.isRequired,
    encKeyRegex: PropTypes.string.isRequired,
    handleStartRecoverNode: PropTypes.func.isRequired,
    handleUpdateTopologyFailed: PropTypes.func.isRequired,
    handleLockLayerUpdate: PropTypes.func.isRequired,
    handleDialogPopup: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    handleNextFunc: PropTypes.func.isRequired,
    handleBackFunc: PropTypes.func.isRequired,
    setUnmanagedDevicesTemp: PropTypes.func.isRequired,
}

export default NodeRecoveryRecoverStep;
