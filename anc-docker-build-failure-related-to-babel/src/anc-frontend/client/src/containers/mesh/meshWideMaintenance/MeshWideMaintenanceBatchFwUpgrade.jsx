import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Typography from '@material-ui/core/Typography';
import P2DevTbl from '../../../components/common/P2DevTbl';
import P2MultipleFwUpgradeActPanel from '../../../components/nodeMaintenances/P2MultipleFwUpgradeActPanel';
import P2Stepper from '../../../components/common/P2Stepper';
import {toggleSnackBar, updateProgressBar} from '../../../redux/common/commonActions';
import {setUpFwStatus} from '../../../redux/firmwareUpgrade/firmwareUpgradeActions';
import {updateDeviceFwStatus} from '../../../redux/firmwareUpgrade/firmwareUpgradeActions';
import {getVersion} from '../../../util/apiCall';
import Constants from '../../../constants/common';
import P2Dialog from '../../../components/common/P2Dialog';
import {
    clearStorage,
    uploadFirmware,
    upgradeFirmware,
} from '../../../util/apiCall';
import P2ErrorObject from '../../../util/P2ErrorObject';
import FwUpgradeDialog, {
    getBinVerContent,
} from '../../../components/nodeMaintenances/FwUpgradeCommon';
import {firmwareUpgradeErrorDeterminer} from '../../../util/errorValidator';

const {colors, themeObj} = Constants;

const MeshWideMaintenanceBatchFwUpgrade = (props) => {
    const {
        isInit,
        tableData,
        refreshFunc,
        nodeInfo,
        nodes,
        t,
        setLockLayer,
        // popupCrossModeWarning,
    } = props;
    const history = useHistory();
    const dispatch = useDispatch();
    const {
        common: {csrf},
        firmwareUpgrade: {hasNodeUpgrading},
    } = useSelector(store => store);

    const [aNMVersion, setAnmVersion] = useState('');
    const [disableUpgradeBtn, setDisableUpgradeBtn] = useState(true);
    const [disabledResetBtn, setDisableResetBtn] = useState(false);
    const [resetCheckbox, setResetCheckbox] = useState({
        isChecked: false,
        disabled: false,
    });
    const [fileSelect, setFileSelect] = useState({
        lock: false,
    });
    const [ax50FileUpload, setAX50FileUpload] = useState({
        display: false,
        inputid: 'fwfile-ax50',
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [x30FileUpload, setX30FileUpload] = useState({
        display: false,
        inputid: 'fwfile-x30',
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [x20FileUpload, setX20FileUpload] = useState({
        display: false,
        inputid: 'fwfile-x20',
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [x10FileUpload, setX10FileUpload] = useState({
        display: false,
        inputid: 'fwfile-x10',
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [z500FileUpload, setZ500FileUpload] = useState({
        display: false,
        inputid: 'fwfile-z500',
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [searchBar, setSearchBar] = useState({
        searchKey: '',
    });
    const [sortingSettings, setSortingSettings] = useState({
        orderBy: 0,
        sortBy: 'hostname',
    });
    const [pageSettings, setPageSettings] = useState({
        currentPage: 0,
        itemsPerPage: 10,
    });
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: t('ok'),
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
        nonTextContent: <span />,
    });
    const [fwUpgradeDialog, setFwUpgradeDialog] = useState({
        open: false,
        shouldForceReset: false,
        checkboxContent: t('forceResetCheckbox'),
        title: '',
        warningContent: null,
        upgradeContent: <span />,
        warningContentList: null,
        nodeList: [],
        collapseBool: {
            downgrade: true,
            incompatible: true,
            sameVer: true,
        },
    });
    const [stepper1, setStepper1] = useState({isStepActive: true, isStepCompleted: false});
    const [stepper2, setStepper2] = useState({isStepActive: false, isStepCompleted: false});
    const [stepper3, setStepper3] = useState({isStepActive: false, isStepCompleted: false});

    const [hasUnreachable, setHasUnreachable] = useState(false);
    const [selectedIp, setSelectedIp] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState([]);

    const didmountFunc = () => {
        getVersion(csrf).then((res) => {
            setAnmVersion(res.version);
        });
    };
    useEffect(didmountFunc, []);

    const setupFwStoreStatus = () => {
        if (!isInit) {
            const status = {};
            nodes.forEach((node) => {
                if (node.isManaged) {
                    let deviceStatus;
                    if (node.isAuth === 'no') deviceStatus = 'mismatch';
                    else if (!node.isReachable) deviceStatus = 'unreachable';
                    else deviceStatus = 'reachable';
                    status[node.id] = {status: deviceStatus};
                }
            });
            dispatch(setUpFwStatus(status));
        }
    };
    useEffect(setupFwStoreStatus, [isInit]);

    const checkSelectedIpFunc = () => {
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

        selectedRowId.forEach((rowIndex) => {
            const rowData = tableData[rowIndex];
            if (rowData[4].status === 'unreachable') {
                _hasUnreachable = true;
            }
            if (rowData[2].ctx.match(ax50Reg)) {
                hasAX50 = true;
            } else if (rowData[2].ctx.match(x30Reg)) {
                hasX30 = true;
            } else if (rowData[2].ctx.match(x20Reg)) {
                hasX20 = true;
            } else if (rowData[2].ctx.match(z500Reg)) {
                hasZ500 = true;
            } else if (rowData[2].ctx.match(x10Reg)) {
                hasX10 = true;
            }
        });

        let allFwFileSelected = true;
        if (hasAX50 && ax50FileUpload.file === '') {
            allFwFileSelected = false;
        }
        if (hasX30 && x30FileUpload.file === '') {
            allFwFileSelected = false;
        }
        if (hasX20 && x20FileUpload.file === '') {
            allFwFileSelected = false;
        }
        if (hasX10 && x10FileUpload.file === '') {
            allFwFileSelected = false;
        }
        if (hasZ500 && z500FileUpload.file === '') {
            allFwFileSelected = false;
        }

        if (allFwFileSelected && selectedRowId.length !== 0) {
            setDisableUpgradeBtn(false);
            setStepper1({isStepActive: true, isStepCompleted: true});
            setStepper2({isStepActive: true, isStepCompleted: false});
            setStepper3({isStepActive: false, isStepCompleted: false});
        } else {
            setDisableUpgradeBtn(true);
            setStepper1({isStepActive: true, isStepCompleted: false});
            setStepper2({isStepActive: false, isStepCompleted: false});
            setStepper3({isStepActive: false, isStepCompleted: false});
        }

        setAX50FileUpload({
            ...ax50FileUpload,
            display: hasAX50,
        });
        setX30FileUpload({
            ...x30FileUpload,
            display: hasX30,
        });
        setX20FileUpload({
            ...x20FileUpload,
            display: hasX20,
        });
        setX10FileUpload({
            ...x10FileUpload,
            display: hasX10,
        });
        setZ500FileUpload({
            ...z500FileUpload,
            display: hasZ500,
        });

        setHasUnreachable(_hasUnreachable);
    };

    useEffect(checkSelectedIpFunc, [selectedRowId]);


    const handleSearch = (event) => {
        setSearchBar({searchKey: event});
    };

    const handleinitiateSearch = () => {
        setSearchBar({searchKey: ''});
    };

    const handleChangePage = (event, page) => {
        setPageSettings({
            ...pageSettings,
            currentPage: page,
        });
    };

    const handleChangeItemsPerPage = (event) => {
        setPageSettings({
            ...pageSettings,
            itemsPerPage: event.target.value,
        });
    };

    const handleRequestSort = (event, property) => {
        if (property === sortingSettings.sortBy) {
            setSortingSettings({
                ...sortingSettings,
                orderBy: sortingSettings.orderBy === 0 ? 1 : 0,
            });
        } else{
            setSortingSettings({
                ...sortingSettings,
                sortBy: property,
                orderBy: 0,
            });
        }
    };

    const onFileSelect = (event, series) => {
        event.stopPropagation();
        event.preventDefault();
        const file = event.target.files[0];
        if (typeof file === 'undefined') return;
        const fileName = file.name;
        const filesize = Math.round((file.size / 1024 / 1024) * 100, 2) / 100;
        const FW_SIZE_LIMIT = Constants.fwSizeLimit;
        
        if (filesize > FW_SIZE_LIMIT[series]) {
            setDialog({
                open: true,
                title: t('fileExceedErrTitle'),
                content: t('fileExceedErrContent'),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogOnClose();
                    // onReset();
                },
                cancelActTitle: '',
                cancelActFn: () => {},
                nonTextContent: <span />,
            });
            return;
        }

        const fileSizeStr = `, ${filesize}${t('mb')}`;

        if (series === 'ax50') {
            setAX50FileUpload({
                ...ax50FileUpload,
                file,
                fileName,
                fileSize: fileSizeStr,
            });
        } else if (series === 'x30') {
            setX30FileUpload({
                ...x30FileUpload,
                file,
                fileName,
                fileSize: fileSizeStr,
            });
        } else if (series === 'x20') {
            setX20FileUpload({
                ...x20FileUpload,
                file,
                fileName,
                fileSize: fileSizeStr,
            });
        } else if (series === 'x10') {
            setX10FileUpload({
                ...x10FileUpload,
                file,
                fileName,
                fileSize: fileSizeStr,
            });
        } else if (series === 'z500') {
            setZ500FileUpload({
                ...z500FileUpload,
                file,
                fileName,
                fileSize: fileSizeStr,
            });
        }
        let allFwFileSelected = true;

        if (ax50FileUpload.display && !(series === 'ax50' || ax50FileUpload.file !== '')) {
            allFwFileSelected = false;
        }
        if (x30FileUpload.display && !(series === 'x30' || x30FileUpload.file !== '')) {
            allFwFileSelected = false;
        }
        if (x20FileUpload.display && !(series === 'x20' || x20FileUpload.file !== '')) {
            allFwFileSelected = false;
        }
        if (x10FileUpload.display && !(series === 'x10' || x10FileUpload.file !== '')) {
            allFwFileSelected = false;
        }
        if (z500FileUpload.display && !(series === 'z500' || z500FileUpload.file !== '')) {
            allFwFileSelected = false;
        }

        if (allFwFileSelected) {
            setDisableUpgradeBtn(false);
            setStepper1({isStepActive: true, isStepCompleted: true});
            setStepper2({isStepActive: true, isStepCompleted: false});
            setStepper3({isStepActive: false, isStepCompleted: false});
        }
    };

    const onReset = () => {
        refreshFunc();
        setupFwStoreStatus();
        setDisableUpgradeBtn(true);
        setResetCheckbox({
            isChecked: false,
            disable: false,
        });
        document.getElementById(ax50FileUpload.inputid).value = null;
        document.getElementById(x30FileUpload.inputid).value = null;
        document.getElementById(x20FileUpload.inputid).value = null;
        document.getElementById(x10FileUpload.inputid).value = null;
        document.getElementById(z500FileUpload.inputid).value = null;
        
        setAX50FileUpload({
            ...ax50FileUpload,
            display: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        setX30FileUpload({
            ...x30FileUpload,
            display: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        setX20FileUpload({
            ...x20FileUpload,
            display: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        setX10FileUpload({
            ...x10FileUpload,
            display: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        setZ500FileUpload({
            ...z500FileUpload,
            display: false,
            file: '',
            fileName: '',
            fileSize: '',
        });
        setSelectedRowId([]);
        setSelectedIp([]);
        setFileSelect({
            lock: false,
        });
        setSearchBar({searchKey: ''});
        setPageSettings({
            ...pageSettings,
            currentPage: 0,
        });
        setStepper1({isStepActive: true, isStepCompleted: false});
        setStepper2({isStepActive: false, isStepCompleted: false});
        setStepper3({isStepActive: false, isStepCompleted: false});
    };

    const errorHandler = (err) => {
        let title = t('cwUpFailed');
        let content = t('runtimeErr');
        let errObjArr;
        if (err?.data?.type === 'errors') {
            errObjArr = err.data.data.map(errObj => new P2ErrorObject(errObj));
        }
        if (errObjArr) {
            const errArr = errObjArr.map(errObj => firmwareUpgradeErrorDeterminer(errObj, t));
            if (errArr[0] === t('magicbitErr')) {
                title = t('magicbitErrorTitle');
            }
            content = errArr[0];
        }
        setDialog({
            ...dialog,
            open: true,
            title,
            content,
            actionTitle: t('ok'),
            actionFn: () => {
                setDialog({...dialog, open: false});
                setDisableUpgradeBtn(true);
                setLockLayer(false);
                setFileSelect({
                    ...fileSelect,
                    lock: false,
                });
                setResetCheckbox({
                    ...resetCheckbox,
                    disabled: true,
                });
                setDisableResetBtn(false);
                dispatch(updateProgressBar(false));
            },
            cancelActTitle: '',
            cancelActFn: () => {},
        });
        return content;
    };

    const handleUpgrade = (nodeList) => {
        setLockLayer(false);
        setDisableResetBtn(true);
        const devices = [];
        nodeList.forEach((ip) => {
            const temp = {};
            temp[ip] = {
                status: 'onUpgrade',
                detail: {percentage: 20},
            };
            devices.push(temp);
        });
        dispatch(updateDeviceFwStatus(devices));
        const projectId = Cookies.get('projectId');
        upgradeFirmware(csrf, projectId,  {nodes: nodeList, reset: resetCheckbox.isChecked}).then(() => {
            const devices = [];
            nodeList.forEach((ip) => {
                const temp = {};
                temp[ip] = {
                    status: 'onUpgrade',
                    detail: {
                        percentage: 100,
                        success: true,
                    },
                };
                devices.push(temp);
            });
            dispatch(updateDeviceFwStatus(devices));
            setDialog({
                ...dialog,
                open: true,
                title: t('cwUpSuccess'),
                content: t('upgradeSuccess'),
                actionTitle: t('cwRetClusTopo'),
                actionFn: () => {
                    dispatch(updateProgressBar(false));
                    // history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelActTitle: '',
                cancelActFn: () => {},
                nonTextContent: <span />,
            });
        }).catch((err) => {
            if (err?.data?.type === 'specific') {
                const devices = [];
                Object.keys(err.data.data).forEach((ip) => {
                    const errArr = err.data.data[ip].errors.map(errObj => firmwareUpgradeErrorDeterminer(new P2ErrorObject(errObj), t));
                    const errMsg = errArr[0];
                    const temp = {};
                    temp[ip] = {
                        status: 'onUpgrade',
                        detail: {
                            percentage: 100,
                            error: errMsg,
                        },
                    };
                    devices.push(temp);
                });
                dispatch(updateDeviceFwStatus(devices));

                setDialog({
                    ...dialog,
                    open: true,
                    title: t('cwUpFailed'),
                    content: t('cwFwUpErr', {type: 'upgrade'}),
                    actionTitle: t('ok'),
                    actionFn: () => {
                        setDialog({...dialog, open: false});
                        setDisableUpgradeBtn(true);
                        setLockLayer(false);
                        setFileSelect({
                            ...fileSelect,
                            lock: false,
                        });
                        setResetCheckbox({
                            ...resetCheckbox,
                            disabled: true,
                        });
                        setDisableResetBtn(false);
                        dispatch(updateProgressBar(false));
                    },
                    cancelActTitle: '',
                    cancelActFn: () => {},
                });
            } else {
                const errMsg = errorHandler(err);
                const devices = [];
                nodeList.forEach((ip) => {
                    const temp = {};
                    temp[ip] = {
                        status: 'onUpgrade',
                        detail: {
                            error: errMsg,
                            percentage: 100,
                        },
                    };
                    devices.push(temp);
                });
                dispatch(updateDeviceFwStatus(devices));
            }
        });
    };

    const handleFwUpgradeDialogActionFunc = () => {
        fwUpgradeDialogOnClose();
        handleUpgrade(fwUpgradeDialog.nodeList);
    };

    const handleFwUpgradeDialogCancelFunc = () => {
        fwUpgradeDialogOnClose();
        onReset();
        setLockLayer(false);
        dispatch(updateProgressBar(false));
    };

    const handleUpload = async () => {
        dispatch(toggleSnackBar(t('fwuping'), 5000));
        dispatch(updateProgressBar(true));

        setDisableUpgradeBtn(true);
        setStepper1({isStepActive: true, isStepCompleted: true});
        setStepper2({isStepActive: true, isStepCompleted: false});
        setStepper3({isStepActive: false, isStepCompleted: false});

        const projectId = Cookies.get('projectId');

        const nodeList = selectedIp;

        try {
            await clearStorage(csrf, projectId, {nodes: nodeList});
        } catch (e) {
            console.log('--- clearStorage failed ---');
        }

        let fwVersion = undefined;

        const handleUploadRes = (res) => {
            if (fwVersion === undefined) {
                fwVersion = res.binVer;
            } else if (res.binVer !== fwVersion) {
                const err = {};
                err.data = {
                    type: 'errors',
                    data: [{
                        type: 'ui.uploadDifferentVerBin',
                    }],
                };
                throw err;
            }
        };

        try {
            if (ax50FileUpload.display) {
                const formObj = new FormData();
                formObj.append('firmware', ax50FileUpload.file);
                await uploadFirmware(csrf, projectId, formObj).then(handleUploadRes);
            }
        } catch (e) {
            console.error(e);
            errorHandler(e);
            return
        }

        try {
            if (x30FileUpload.display) {
                const formObj = new FormData();
                formObj.append('firmware', x30FileUpload.file);
                await uploadFirmware(csrf, projectId, formObj).then(handleUploadRes);
            }
        } catch (e) {
            errorHandler(e);
            return
        }

        try {
            if (x20FileUpload.display) {
                const formObj = new FormData();
                formObj.append('firmware', x20FileUpload.file);
                await uploadFirmware(csrf, projectId, formObj).then(handleUploadRes);
            }
        } catch (e) {
            errorHandler(e);
            return
        }

        try {
            if (x10FileUpload.display) {
                const formObj = new FormData();
                formObj.append('firmware', x10FileUpload.file);
                await uploadFirmware(csrf, projectId, formObj).then(handleUploadRes);
            }
        } catch (e) {
            errorHandler(e);
            return
        }

        try {
            if (z500FileUpload.display) {
                const formObj = new FormData();
                formObj.append('firmware', z500FileUpload.file);
                await uploadFirmware(csrf, projectId, formObj).then(handleUploadRes);
            }
        } catch (e) {
            errorHandler(e);
            return
        }

        setStepper1({isStepActive: true, isStepCompleted: true});
        setStepper2({isStepActive: true, isStepCompleted: true});
        setStepper3({isStepActive: false, isStepCompleted: false});

        const dialogContent = getBinVerContent(fwVersion, nodeList, nodeInfo, t, aNMVersion);
        setFwUpgradeDialog({
            ...fwUpgradeDialog,
            open: true,
            title: t('cwUpConfirm'),
            checkboxContent: t('forceResetCheckbox'),
            shouldForceReset: dialogContent.shouldForceReset,
            warningContent: dialogContent.warningContent,
            upgradeContent: dialogContent.upgradeContent,
            warningContentList: dialogContent.warningContentList,
            nodeList,
        });
    };

    const handleConfirmOnClick = () => {
        setDialog({
            open: true,
            title: t('cwUpConfirm'),
            content: (
                <span>
                    <span style={{marginBottom: '5px', display: 'block'}}>
                        {t('cwFwAllDevUpNoti')}
                    </span>
                    <span style={{marginBottom: '5px', display: 'block'}}>
                        {t('cwFwNoTurnOff')}
                    </span>
                    <span style={{marginBottom: '5px', display: 'block'}}>
                        {t('cwFwNoNavi')}
                    </span>
                </span>
            ),
            actionTitle: t('proceed'),
            actionFn: () => {
                setLockLayer(true);
                handleDialogOnClose();
                handleUpload();
            },
            cancelActTitle: t('cancel'),
            cancelActFn: () => {
                handleDialogOnClose();
                setLockLayer(false);
                dispatch(updateProgressBar(false));
            },
            nonTextContent: resetCheckbox.isChecked ? (
                 <Typography style={{color: colors.inactiveRed}}>
                    <br />
                    <b>{t('isResetDialogContentB')}</b>
                    {t('isResetDialogContentC')}
                </Typography>) : null,
        });
    };

    const fwUpgradeDialogOnCheck = () => {
        setResetCheckbox(prevState => ({
            ...prevState,
            isChecked: !resetCheckbox.isChecked,
        }));
    }

    const fwUpgradeDialogOnClose = () => {
        setFwUpgradeDialog({
            ...fwUpgradeDialog,
            open: false,
        });
    };

    const handleChangeIsReset = () => {
        setResetCheckbox({
            ...resetCheckbox,
            isChecked: !resetCheckbox.isChecked,
        });
    };

    const handleDialogOnClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const handleFwUpgradeDialogCollapse = (type) => {
        setFwUpgradeDialog({
            ...fwUpgradeDialog,
            collapseBool: {
                ...fwUpgradeDialog.collapseBool,
                [type]: !fwUpgradeDialog.collapseBool[type],
            },
        });
    };

    const headerLabel = (content, sorted) => (
        <div
            style={{
                color: sorted ? 'rgb(0, 0, 0)' : 'rgba(0, 0, 0, 0.54)',
                fontSize: '0.75rem',
            }}
        >
            {content}
        </div>
    );
    const Headers = [
        {
            id: 'hostname',
            HeaderLabel: headerLabel(t('hostname'), sortingSettings.sortBy === 'hostname'),
            isSorted: sortingSettings.sortBy === 'hostname',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'mac',
            HeaderLabel: headerLabel(t('mac'), sortingSettings.sortBy === 'mac'),
            isSorted: sortingSettings.sortBy === 'mac',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'model',
            HeaderLabel: headerLabel(t('model'), sortingSettings.sortBy === 'model'),
            isSorted: sortingSettings.sortBy === 'model',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'fwVersion',
            HeaderLabel: headerLabel(t('version'), sortingSettings.sortBy === 'fwVersion'),
            isSorted: sortingSettings.sortBy === 'fwVersion',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'status',
            HeaderLabel: headerLabel(t('status')),
            isSorted: sortingSettings.sortBy === 'status',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
    ];

    const handleSelectClickFunc = (e, index, mac) => {
        const targetIp = Object.keys(nodeInfo).find(nodeIp => nodeInfo[nodeIp].mac === mac);
        if (selectedIp.includes(targetIp)) {
            setSelectedRowId(selectedRowId.filter(value => value !== index));
            setSelectedIp(selectedIp.filter(value => value !== targetIp));
        } else {
            setSelectedRowId([...selectedRowId, index]);
            setSelectedIp([...selectedIp, targetIp]);
        }
    };

    const handleSelectAllClickFunc = (e, checked, filterData) => {
        const _selectedIp = [];
        const _selectedRowId = [];
        if (checked) {
            filterData.forEach((row) => {
                _selectedIp.push(tableData[row.id][4].id);
                _selectedRowId.push(row.id);
            });
        }

        setSelectedRowId(_selectedRowId);
        setSelectedIp(_selectedIp);
    };

    return (
        <>
            <P2Stepper
                stepperItemLbl={[
                    t('batchcwFwStep1'),
                    t('cwFwStep2'),
                    t('cwFwStep3'),
                    t('cwFwStep4'),
                ]}
                stepperItems={[
                    {stepLbl: t('stepperLbl1'), ...stepper1},
                    {stepLbl: t('stepperLbl2'), ...stepper2},
                    {stepLbl: t('stepperLbl3'), ...stepper3},
                ]}
                style={{
                    stepper: {
                        backgroundColor: themeObj.mainBgColor,
                        width: '80%',
                        padding: '12px 24px',
                    },
                }}
            />
            <P2DevTbl
                tblToolbar={{
                    handleSearch,
                    handleinitiateSearch
                }}
                tblHeaders={{
                    Headers,
                    ...searchBar,
                    searching: true,
                    selectedId: selectedRowId,
                    handleRequestSort,
                    handleSelectAllClick: handleSelectAllClickFunc,
                    handleSelectClick: handleSelectClickFunc,
                }}
                tblData={tableData}
                tblFooter={{
                    ...pageSettings,
                    totalItems: tableData.length,
                    handleChangePage,
                    handleChangeItemsPerPage,
                }}
                disablePaper
                hideSearchIcon
            />
            <P2MultipleFwUpgradeActPanel
                t={t}
                label={t('cwFwbtnUp')}
                resetLabel={t('btnReset')}
                isResetLabel={t('isResetLabel')}
                onFileUpload={handleConfirmOnClick}
                onReset={onReset}
                selectFileHandler={onFileSelect}
                disabledUpgrade={disableUpgradeBtn || hasNodeUpgrading || hasUnreachable || selectedIp.length === 0}
                style={{
                    panelDiv: {
                        width: '100%',
                        padding: '20px 10px 30px 10px',
                    },
                }}
                disabledSelectFW={fileSelect.lock || hasNodeUpgrading || hasUnreachable || selectedIp.length === 0}
                disabledReset={disabledResetBtn}
                placeholder={t('cwFwFileUpPlaceholder')}
                handleChangeIsReset={handleChangeIsReset}
                isReset={resetCheckbox.isChecked}
                isResetLabelStyle=""
                isResetCheckboxStyle={{}}
                disabledIsReset={resetCheckbox.disabled || hasNodeUpgrading || hasUnreachable}
                ax50FileUpload={ax50FileUpload}
                x30FileUpload={x30FileUpload}
                x20FileUpload={x20FileUpload}
                x10FileUpload={x10FileUpload}
                z500FileUpload={z500FileUpload}
            />
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
                nonTextContent={dialog.nonTextContent}
            />
            <FwUpgradeDialog
                t={t}
                open={fwUpgradeDialog.open}
                shouldForceReset={fwUpgradeDialog.shouldForceReset}
                checkboxContent={fwUpgradeDialog.checkboxContent}
                title={fwUpgradeDialog.title}
                warningContent={fwUpgradeDialog.warningContent}
                upgradeContent={fwUpgradeDialog.upgradeContent}
                warningContentList={fwUpgradeDialog.warningContentList}
                onCloseFn={fwUpgradeDialogOnClose}
                actionFn={handleFwUpgradeDialogActionFunc}
                cancelFn={handleFwUpgradeDialogCancelFunc}
                onCheckFn={fwUpgradeDialogOnCheck}
                checked={resetCheckbox.isChecked}
                collapseFn={handleFwUpgradeDialogCollapse}
                collapseBool={fwUpgradeDialog.collapseBool}
            />
        </>
    );
};

MeshWideMaintenanceBatchFwUpgrade.propTypes = {
    t: PropTypes.func.isRequired,
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

export default MeshWideMaintenanceBatchFwUpgrade;
