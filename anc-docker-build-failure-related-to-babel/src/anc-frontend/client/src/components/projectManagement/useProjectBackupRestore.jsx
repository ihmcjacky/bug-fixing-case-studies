/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-12-01 13:45:39
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-30 16:15:22
 * @ Description:
 */

import {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import JSZip from 'jszip';
// import {saveAs} from 'file-saver';
import saveAs from '../../util/nw/saveAs';
import {formValidator} from '../../util/inputValidator';
import {userBackup, userRestore} from '../../util/apiCall';
import Constants from '../../constants/common';
import useP2PopOver from '../common/useP2PopOver';
import useP2DragUpload from '../common/useP2DragUpload';
import {
    updateProjectList,
    closeProjectBackupRestore,
} from '../../redux/projectManagement/projectActions';
import {toggleSnackBar} from '../../redux/common/commonActions';
import { getOemNameOrAnm } from '../../util/common';


const deepClone = object => JSON.parse(JSON.stringify(object));

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const formatDate = (date, display = false) => {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();
    const hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();

    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return display ?
        `${year}-${month}-${day} ${hour}:${minute}:${second}`
        :
        [year, month, day, hour, minute, second].join('-');
};

const checkFwVersion = (fwVersion) => {
    const fwVerArr = fwVersion.replace('v', '').split('.').map(i => parseInt(i, 10));
    if (fwVerArr.length === 4) {
        if (fwVerArr[3] === 0) {
            fwVerArr.pop();
            return `v${fwVerArr.join('.')}`;
        }
        return `v${fwVerArr.join('.')}`;
    }
    return fwVersion;
};

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);


const checkGetFailProject = (projectList, projectUiSettings) => {
    const userSecondLayerGetFailProjectList = [];
    const getFailProjectList = Object.keys(projectList).filter(projectName =>
        Object.keys(projectList[projectName]).some((opt) => {
            if (typeof projectList[projectName][opt] !== 'string') {
                if (opt === 'managedDeviceList') {
                    return Object.keys(projectList[projectName][opt]).some(nodeIp =>
                        Object.keys(projectList[projectName][opt][nodeIp]).some((nodeOpt) => {
                            if (projectList[projectName][opt][nodeIp][nodeOpt] === 'getFail') {
                                userSecondLayerGetFailProjectList.push(projectName);
                                return true;
                            }
                            return false;
                        })
                    );
                } else if (opt === 'projectImages') {
                    return Object.keys(projectList[projectName][opt]).some(imageId =>
                        projectList[projectName][opt][imageId] === 'getFail');
                }
            }
            return projectList[projectName][opt] === 'getFail';
        })
    );

    const getFailProjectUiSettings = Object.keys(projectUiSettings).filter(projectName =>
        Object.keys(projectUiSettings[projectName]).some(opt =>
            projectUiSettings[projectName][opt] === 'getFail')
    );

    return {
        userGetFailProject: [...new Set([...getFailProjectList, ...getFailProjectUiSettings])],
        userSecondLayerGetFailProjectList,
    };
};

const mixSettingsWithConstant = (newUserRestoreFile) => {
    const bodyMsg = deepClone(newUserRestoreFile);
    bodyMsg.aNMBackup.data.projectUiSettings = {};

    Object.keys(newUserRestoreFile.aNMBackup.data.projectUiSettings).forEach((projectName) => {
        const {notificationCenter, ...newProjectUiSettings} = newUserRestoreFile.aNMBackup
            .data.projectUiSettings[projectName];
        bodyMsg.aNMBackup.data.projectUiSettings[projectName] = {
            ...Constants.projectUiSettings,
            ...newProjectUiSettings,
        };
    });

    if (get(newUserRestoreFile, ['aNMBackup', 'data', 'uiSettings'])) {
        bodyMsg.aNMBackup.data.uiSettings = {
            ...Constants.uiSettings,
            ...newUserRestoreFile.aNMBackup.data.uiSettings,
        };
    }

    return bodyMsg;
};

const checkForZero = (checkee, defaultValue) => {
    if (checkee === null) {
        return defaultValue;
    }
    if (typeof checkee === 'undefined') {
        return defaultValue;
    }
    return checkee;
};


const useProjectBackupRestore = (t) => {
    const dispatch = useDispatch();
    const csrf = useSelector(state => state.common.csrf);
    const projectIdList = useSelector(state => state.projectManagement.projectIdToNameMap) ?? {};
    const [selector, setSelector] = useState({
        1: {
            selectedId: [],
            expandedId: [],
            defaultSelectedId: [],
        },
        2: {
            selectedId: [],
            expandedId: [],
            defaultSelectedId: [],
        },
    });
    const [dialog, setDialog] = useState({
        open: false,
        handleClose: () => null,
        title: '',
        content: '',
        submitButton: 'OK',
        submitAction: () => null,
        cancelButton: '',
        cancelAction: () => null,
    });

    const {
        anchorEl, popOpen, onPopOverMouseEnter, onPopOverClose,
        src,
    } = useP2PopOver();
    const [backupCustomMap, setBackupCustomMap] = useState({});
    const [restoreCustomMap, setRestoreCustomMap] = useState({});
    const [preview, setPreview] = useState(false);
    const [tab, setTab] = useState(1);
    const [fileCreateTime, setFileCreateTime] = useState('');
    const [aNMVersion, setANMVersion] = useState('');
    const [userBackupRes, setUserBackupRes] = useState({});
    const [userRestoreFile, setUserRestoreFile] = useState({});
    const [isLock, setIsLock] = useState(false);
    const [getFailProject, setGetFailProject] = useState([]);
    const [secondLayerGetFailProjectList, setSecondLayerGetFailProjectList] = useState([]);
    const [duplicateProject, setDuplicateProject] = useState({});
    const [loadDuplicateProject, setLoadDuplicateProject] = useState({});
    const [{sorting, sortBy}, setSortObject] = useState({sortBy: 'projectName', sorting: 'asc'});
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [backupZipFile, setBackupZipFile] = useState(null);
    const [restoreZipFile, setRestoreZipFile] = useState(null);

    const handleDialogOnClose = () => {
        setDialog(prevState => ({
            ...prevState,
            open: false,
        }));
    };

    const handleChangePage = (event, page) => {
        setCurrentPage(page);
    };

    const handleChangeItemsPerPage = (event) => {
        setItemsPerPage(event.target.value);
    };

    const getUserBackup = useCallback(async () => {
        let zipErrorType = '';
        const newCustomMap = {};
        const {error, data} = await wrapper(userBackup(csrf));
        if (error && error.message === 'P2Error') {
            if (get(error, ['data', 'data']) === 'invalid mime type') {
                setDialog(prevState => ({
                    ...prevState,
                    open: true,
                    handleClose: handleDialogOnClose,
                    title: 'getBackupFailTItle',
                    content: error.data.data,
                    submitButton: 'OK',
                    submitAction: () => {
                        handleDialogOnClose();
                        setCurrentPage(0);
                        setPreview(false);
                    },
                }));
            } else {
                setDialog(prevState => ({
                    ...prevState,
                    open: true,
                    handleClose: handleDialogOnClose,
                    title: 'getBackupFailTItle',
                    content: 'getBackupFailContent',
                    submitButton: 'OK',
                    submitAction: () => {
                        handleDialogOnClose();
                        setCurrentPage(0);
                        setPreview(false);
                    },
                }));
            }
        } else {
            try {
                const loadZipFile = await JSZip.loadAsync(data, {base64: true});
                const resultJson = JSON.parse(await loadZipFile.file('result.json').async('string'));
                const file = deepClone(JSON.parse(await loadZipFile.file('userBackup.json').async('string')));
                if (!resultJson.success) {
                    resultJson.errors.forEach((resultJsonError) => {
                        zipErrorType = resultJsonError.type;
                        console.log(zipErrorType);
                    });
                }
                if (!error && (zipErrorType === 'incompletedata' ||
                zipErrorType === '')) {
                    // extract data to state
                    const projectList = get(file, ['aNMBackup', 'data', 'projectList']) || {};
                    const projectUiSettings = get(file,
                        ['aNMBackup', 'data', 'projectUiSettings']) || {};
                    delete projectList.__staging;
                    delete projectUiSettings.__staging;
                    const selectedId = Object.keys(projectList).map((project, idx) =>
                        (project || idx));
                    const customMapPromiseAll = await Promise.all(selectedId.map(async (project) => {
                        const imageId = Object.keys(get(projectList, [project, 'projectImages']));
                        const imageName = get(projectList, [project, 'projectImages'])[imageId[0]];
                        if (imageId.length === 0) {
                            return {project, imgBlob: '', imageName};
                        }
                        const imgBlob = await loadZipFile
                            .file(`projects/${project}/images/${imageId[0]}`)
                            .async('blob');
                        return {project, imgBlob, imageName};
                    }));

                    customMapPromiseAll.forEach(({project, imgBlob, imageName}) => {
                        if (imageName === 'getFail') {
                            newCustomMap[project] = 'getFail';
                        }
                        if (imgBlob === '') {
                            newCustomMap[project] = '';
                        } else {
                            newCustomMap[project] = URL.createObjectURL(imgBlob);
                        }
                    });

                    const {
                        userGetFailProject,
                        userSecondLayerGetFailProjectList,
                    } = checkGetFailProject(projectList, projectUiSettings);
                    setGetFailProject(userGetFailProject);
                    setSecondLayerGetFailProjectList(userSecondLayerGetFailProjectList);
                    setBackupCustomMap(newCustomMap);
                    setSelector(prevState => ({
                        ...prevState,
                        [tab]: {
                            ...prevState[tab],
                            selectedId,
                            defaultSelectedId: selectedId,
                            expandedId: [],
                        },
                    }));
                    setCurrentPage(0);
                    setUserBackupRes(file);
                    setBackupZipFile(data);
                    setSortObject({
                        sortBy: 'projectName',
                        sorting: 'asc',
                    });
                } else {
                    // fail dialog
                    setDialog(prevState => ({
                        ...prevState,
                        open: true,
                        handleClose: handleDialogOnClose,
                        title: 'getBackupFailTItle',
                        content: 'getBackupFailContent',
                        submitButton: 'OK',
                        submitAction: () => {
                            handleDialogOnClose();
                            setCurrentPage(0);
                            setPreview(false);
                        },
                    }));
                }
            } catch (e) {
                setDialog(prevState => ({
                    ...prevState,
                    open: true,
                    handleClose: handleDialogOnClose,
                    title: 'getBackupFailTItle',
                    content: e,
                    submitButton: 'OK',
                    submitAction: () => {
                        handleDialogOnClose();
                        setCurrentPage(0);
                        setPreview(false);
                    },
                }));
            }
        }
    }, [csrf, tab]);

    const handleReset = useCallback(() => {
        setSelector(prevState => ({
            ...prevState,
            [tab]: {
                ...prevState[tab],
                selectedId: prevState[tab].defaultSelectedId,
            },
        }));
        setCurrentPage(0);
        setDuplicateProject(loadDuplicateProject);
    }, [tab, loadDuplicateProject]);

    const handleOnBlur = (e) => {
        const {id} = e.target;

        setDuplicateProject(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                sortValue: prevState[id].value,
            },
        }));
    };

    useEffect(() => {
        (async () => {
            if (tab === 1) {
                setIsLock(true);
                await getUserBackup();
                setIsLock(false);
            }
            if (tab === 2) {
                handleReset();
            }
        })();
    }, [tab, getUserBackup, handleReset]);

    const handleRequestSort = (event, property) => {
        let sort = 'asc';
        if (sortBy === property && sorting === 'asc') {
            sort = 'desc';
        }

        setSortObject({
            sortBy: property,
            sorting: sort,
        });
    };

    const createBackupFile = async () => {
        const {selectedId} = selector[tab];
        setIsLock(true);
        const backupObj = deepClone(userBackupRes);
        const deleteProj = [];
        if (get(backupObj, ['aNMBackup', 'data', 'projectList'])) {
            const projectList = get(backupObj, ['aNMBackup', 'data', 'projectList']);
            Object.keys(projectList).forEach((projectName) => {
                if (!selectedId.includes(projectName)) {
                    delete projectList[projectName];
                    deleteProj.push(projectName);
                }
            });
        }
        if (get(backupObj, ['aNMBackup', 'data', 'projectUiSettings'])) {
            const projectUiSettings = get(backupObj, ['aNMBackup', 'data', 'projectUiSettings']);
            Object.keys(projectUiSettings).forEach((projectName) => {
                if (!selectedId.includes(projectName)) {
                    delete projectUiSettings[projectName];
                }
            });
        }
        const date = new Date();
        backupObj.aNMBackup.createdTimestamp = formatDate(date, true);

        const fileDate = formatDate(date);
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const zipNamePrefix = getOemNameOrAnm(nwManifestName);
        const zipName = `${zipNamePrefix}_project-backup_${fileDate}.zip`;
        const encodeBackup = btoa(JSON.stringify(backupObj));

        const loadZipFile = await JSZip.loadAsync(backupZipFile, {base64: true});
        loadZipFile.remove('result.json');
        loadZipFile.remove('projects/__staging');
        loadZipFile.remove('userBackup.json');
        deleteProj.forEach((projectName) => {
            if (!selectedId.includes(projectName)) {
                loadZipFile.remove(`projects/${projectName}`);
            }
        });
        loadZipFile.file('userBackup.anmproj', encodeBackup);


        setDialog(prevState => ({
            ...prevState,
            open: true,
            handleClose: handleDialogOnClose,
            title: 'backupSuccessTitle',
            content: 'backupSuccessContent',
            submitButton: 'downloadBackup',
            submitAction: async () => {
                const base64 = await loadZipFile.generateAsync({type: 'blob'});
                const {data} = await wrapper(saveAs(base64, zipName));
                if (data.success) {
                    dispatch(toggleSnackBar(t('downloadCompleted')));
                }
            },
            cancelButton: 'CANCEL',
            cancelAction: handleDialogOnClose,
        }));
        setIsLock(false);
    };

    const handleSelectAllClick = (event, checked, idArray) => {
        if (checked) {
            setSelector(prevState => ({
                ...prevState,
                [tab]: {
                    ...prevState[tab],
                    selectedId: idArray,
                },
            }));
            return;
        }
        setSelector(prevState => ({
            ...prevState,
            [tab]: {
                ...prevState[tab],
                selectedId: [],
            },
        }));
    };

    const handleSelectClick = (event, id) => {
        const {selectedId} = selector[tab];
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];
        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
        } else if (selectedIdIndex === 0) {
            newSelectedId = newSelectedId.concat(selectedId.slice(1));
        } else if (selectedIdIndex === selectedId.length - 1) {
            newSelectedId = newSelectedId.concat(selectedId.slice(0, -1));
        } else if (selectedIdIndex > 0) {
            newSelectedId = newSelectedId.concat(
                selectedId.slice(0, selectedIdIndex),
                selectedId.slice(selectedIdIndex + 1)
            );
        }

        setSelector(prevState => ({
            ...prevState,
            [tab]: {
                ...prevState[tab],
                selectedId: newSelectedId,
            },
        }));
    };

    const handleExpand = (event, id) => {
        const {expandedId} = selector[tab];
        const expanedIdIndex = expandedId.indexOf(id);
        let newExpandedId = [];
        if (expanedIdIndex === -1) {
            newExpandedId = newExpandedId.concat(expandedId, id);
        } else if (expanedIdIndex === 0) {
            newExpandedId = newExpandedId.concat(expandedId.slice(1));
        } else if (expanedIdIndex === expandedId.length - 1) {
            newExpandedId = newExpandedId.concat(expandedId.slice(0, -1));
        } else if (expanedIdIndex > 0) {
            newExpandedId = newExpandedId.concat(
                expandedId.slice(0, expanedIdIndex),
                expandedId.slice(expanedIdIndex + 1)
            );
        }

        setSelector(prevState => ({
            ...prevState,
            [tab]: {
                ...prevState[tab],
                expandedId: newExpandedId,
            },
        }));
    };

    const changeTab = (idx) => {
        setSelector(prevState => ({
            ...prevState,
            [idx]: {
                ...prevState[idx],
                expandedId: [],
            },
        }));
        setTab(idx);
        // console.log('kyle_debug: changeTab -> idx', idx);
    };

    const projectNameValidator = (inputValue, id, updateDuplicateProject) => {
        const projectList = get(userRestoreFile, ['aNMBackup', 'data', 'projectList']);
        const projectIDregexPattern = /^[ 0-9a-zA-Z_-]{1,32}$/;
        const spaceRegexPattern = /.*[^ ].*/;

        if (Object.keys(projectList).some(projectName => projectName === inputValue)) {
            return {error: true, errorText: 'prjNameDuplicate', msg: 'same restore projectList'};
        }
        if (Object.keys(projectIdList)
            .some(projectId => projectIdList[projectId] === inputValue)) {
            return {error: true, errorText: 'prjNameDuplicate', msg: 'same current projectList'};
        }
        if (Object.keys(updateDuplicateProject)
            .filter(projectName => projectName !== id)
            .some(projectName => updateDuplicateProject[projectName].value === inputValue)) {
            return {error: true, errorText: 'prjNameDuplicate', msg: 'same duplicate projectList'};
        }
        let valid = {result: true, text: ''};
        valid = formValidator('matchRegex', inputValue, projectIDregexPattern);
        if (!valid.result) {
            return {error: true, errorText: 'prjNameTooLong', msg: 'regex not match'};
        }
        valid = formValidator('matchRegex', inputValue, spaceRegexPattern);
        if (!valid.result) {
            return {error: true, errorText: 'prjNameTooLong', msg: 'space regex not match'};
        }

        return {error: false, errorText: ''};
    };

    const handleChangeInput = (e) => {
        const {value, id} = e.target;

        const newDuplicateProject = deepClone(duplicateProject);
        newDuplicateProject[id].value = value.trim();
        Object.keys(newDuplicateProject)
            .forEach((projectName) => {
                const {error, errorText} =
                    projectNameValidator(
                        newDuplicateProject[projectName].value,
                        projectName,
                        newDuplicateProject
                    );
                newDuplicateProject[projectName].error = error;
                newDuplicateProject[projectName].errorText = errorText;
                if (projectName === id) {
                    newDuplicateProject[projectName].value = value;
                }
            });
        setDuplicateProject(newDuplicateProject);
    };

    const sortByHeader = (data) => {
        const dataSorting = (order, orderBy) => (order === 'desc' ?
            (a, b) => {
                if (orderBy === 'projectName' && tab === 2) {
                    const finalA = Object.keys(duplicateProject).includes(a.id) ?
                        duplicateProject[a.id].sortValue : a[orderBy];
                    const finalB = Object.keys(duplicateProject).includes(b.id) ?
                        duplicateProject[b.id].sortValue : b[orderBy];
                    return finalB < finalA ? -1 : 1;
                }
                return b[orderBy] < a[orderBy] ? -1 : 1;
            }
            :
            (a, b) => {
                if (orderBy === 'projectName' && tab === 2) {
                    const finalA = Object.keys(duplicateProject).includes(a.id) ?
                        duplicateProject[a.id].sortValue : a[orderBy];
                    const finalB = Object.keys(duplicateProject).includes(b.id) ?
                        duplicateProject[b.id].sortValue : b[orderBy];
                    return finalA < finalB ? -1 : 1;
                }
                return a[orderBy] < b[orderBy] ? -1 : 1;
            }
        );
        return data.sort(dataSorting(sorting, sortBy));
    };

    const mapData = (file, map) => {
        const projectList = get(file, ['aNMBackup', 'data', 'projectList']) || {};
        // const projectUiSettings = get(file, ['aNMBackup', 'data', 'projectUiSettings']) || {};
        const tblData = Object.keys(projectList).map((project, idx) => ({
            id: project || idx,
            projectName: project,
            managementIp: get(projectList, [project, 'managementIp']) || '-',
            numOfNodes: checkForZero(get(projectList, [project]).numOfNodes, '-'),
            customMap: get(map, [project]) || '',
            // dontShowNotification: get(projectUiSettings, [project]).dontShowNotification,
            expanded: get(projectList, [project, 'managedDeviceList']) || {},
        }));
        return {tblData: sortByHeader(tblData)};
    };

    const convertTableData = () => {
        const tblData = mapData(
            tab === 1 ? userBackupRes : userRestoreFile,
            tab === 1 ? backupCustomMap : restoreCustomMap
        );
        return {
            ...tblData,
            tblSelector: {
                selectedId: selector[tab].selectedId,
                expandedId: selector[tab].expandedId,
            },
        };
    };

    const handleBackupRestoreClose = () => {
        dispatch(closeProjectBackupRestore());
    };

    const restoreBackup = async () => {
        const {selectedId} = selector[tab];
        setIsLock(true);
        const newUserRestoreFile = deepClone(userRestoreFile);
        const newDuplicateProject = deepClone(duplicateProject);

        if (get(newUserRestoreFile, ['aNMBackup', 'data', 'projectList'])) {
            const projectList = get(newUserRestoreFile, ['aNMBackup', 'data', 'projectList']);
            Object.keys(projectList).forEach((projectName) => {
                if (!selectedId.includes(projectName)) {
                    delete projectList[projectName];
                    delete newDuplicateProject[projectName];
                }
            });
            Object.keys(newDuplicateProject).forEach((projectName) => {
                projectList[newDuplicateProject[projectName].value.trim()] =
                    deepClone(projectList[projectName]);
                delete projectList[projectName];
            });
        }

        if (get(newUserRestoreFile, ['aNMBackup', 'data', 'projectUiSettings'])) {
            const projectUiSettings = get(newUserRestoreFile, ['aNMBackup', 'data', 'projectUiSettings']);
            Object.keys(projectUiSettings).forEach((projectName) => {
                if (!selectedId.includes(projectName)) {
                    delete projectUiSettings[projectName];
                    delete newDuplicateProject[projectName];
                }
            });
            Object.keys(newDuplicateProject).forEach((projectName) => {
                projectUiSettings[newDuplicateProject[projectName].value.trim()] =
                    deepClone(projectUiSettings[projectName]);
                delete projectUiSettings[projectName];
                delete projectUiSettings[newDuplicateProject[projectName].value.trim()].dontShowNotification;
            });
        }

        const bodyMsg = mixSettingsWithConstant(newUserRestoreFile);
        delete bodyMsg.aNMBackup.data.uiSettings;
        let restoreZip = {};
        if (restoreZipFile) {
            const projectList = get(userRestoreFile, ['aNMBackup', 'data', 'projectList']);
            const loadZipFile = await JSZip.loadAsync(restoreZipFile, {base64: true});
            loadZipFile.remove('userBackup.anmproj');
            loadZipFile.file('userBackup.json', JSON.stringify(bodyMsg));
            Object.keys(projectList).forEach((projectName) => {
                if (!selectedId.includes(projectName)) {
                    loadZipFile.remove(`projects/${projectName}`);
                }
            });
            // handling of non duplicate project
            const nonDuplicateProject = Object.keys(projectList)
                .filter(projectName => !Object.keys(newDuplicateProject).includes(projectName));
            const nonDuplicateObjectPromiseAllArray = await Promise.all(nonDuplicateProject
                .map(async (projectName) => {
                    let imageName = '';
                    let img = '';
                    loadZipFile.folder(`projects/${projectName}/images`).forEach((path) => {
                        imageName = path;
                    });
                    if (imageName === '') {
                        return {
                            projectName,
                            img,
                            imageName,
                        };
                    }
                    img = await loadZipFile
                        .file(`projects/${projectName}/images/${imageName}`).async('uint8array');
                    return {
                        projectName,
                        img,
                        imageName,
                    };
                }));
            nonDuplicateObjectPromiseAllArray.forEach(({projectName, img, imageName}) => {
                if (imageName !== '') {
                    loadZipFile.remove(`projects/${projectName}`);
                    const projectImages = get(projectList, [projectName, 'projectImages']) || {};
                    loadZipFile
                        .file(`projects/${projectName}/images/${projectImages[imageName]}`, img, {binary: true});
                }
            });

            // handling of duplicate project
            const duplicateObjectPromiseAllArray = await Promise.all(Object.keys(newDuplicateProject)
                .map(async (projectName) => {
                    const newProjectName = newDuplicateProject[projectName].value.trim();
                    let imageName = '';
                    let img = '';
                    loadZipFile.folder(`projects/${projectName}/images`).forEach((path) => {
                        imageName = path;
                    });
                    if (imageName === '') {
                        return {
                            newProjectName,
                            projectName,
                            img,
                            imageName,
                        };
                    }
                    img = await loadZipFile
                        .file(`projects/${projectName}/images/${imageName}`).async('uint8array');
                    return {
                        newProjectName,
                        projectName,
                        img,
                        imageName,
                    };
                }));
            duplicateObjectPromiseAllArray.forEach(({
                newProjectName, projectName, img, imageName,
            }) => {
                if (imageName !== '') {
                    const projectImages = get(projectList, [projectName, 'projectImages']) || {};
                    loadZipFile
                        .file(`projects/${newProjectName}/images/${projectImages[imageName]}`, img, {binary: true});
                } else {
                    loadZipFile.folder(`projects/${newProjectName}/images`);
                }
                loadZipFile.remove(`projects/${projectName}`);
            });
            restoreZip = await loadZipFile.generateAsync({type: 'blob', mimeType: 'application/octet-stream'});
            // rename directories
        } else {
            // legacy restore
            const zip = new JSZip();
            Object.keys(bodyMsg.aNMBackup.data.projectList).forEach((project) => {
                bodyMsg.aNMBackup.data.projectList[project].projectImages = {};
            });
            zip.file('userBackup.json', JSON.stringify(bodyMsg));
            Object.keys(bodyMsg.aNMBackup.data.projectList).forEach((project) => {
                zip.folder(`projects/${project}/images`);
            });
            restoreZip = await zip.generateAsync({type: 'blob', mimeType: 'application/octet-stream'});
        }
        // console.log('kyle_debug: restoreBackup -> restoreZip', restoreZip);
        // saveAs(restoreZip, 'test.zip');
        const formObj = new FormData();
        formObj.append('file', restoreZip);
        const {error} = await wrapper(userRestore(csrf, formObj));
        // const error = false;
        if (!error) {
            setDialog(prevState => ({
                ...prevState,
                open: true,
                handleClose: handleDialogOnClose,
                title: 'restoreSuccessTitle',
                content: 'restoreSuccessContent',
                submitButton: 'OK',
                submitAction: () => {
                    handleBackupRestoreClose();
                    dispatch(updateProjectList());
                },
                cancelButton: '',
                cancelAction: () => null,
            }));
            setIsLock(false);
        } else {
            setDialog(prevState => ({
                ...prevState,
                open: true,
                handleClose: handleDialogOnClose,
                title: 'restoreFailTitle',
                content: 'restoreFailContent',
                submitButton: 'OK',
                submitAction: handleDialogOnClose,
            }));
            setIsLock(false);
        }
    };

    const handleRestoreData = async (restoreData, loadZipFile) => {
        const newCustomMap = {};
        const projectList = get(restoreData, ['aNMBackup', 'data', 'projectList']) || {};
        const selectedId = Object.keys(projectList).map((project, idx) =>
            (project || idx));
        const userANMVersion = get(restoreData, ['aNMBackup', 'aNMVersion']) ?
            checkFwVersion(get(restoreData, ['aNMBackup', 'aNMVersion'])) : '-';
        const userFileCreateTime = get(restoreData, ['aNMBackup', 'createdTimestamp']) || '-';
        if (loadZipFile) {
            const customMapPromiseAll = await Promise.all(selectedId.map(async (project) => {
                const imageId = Object.keys(get(projectList, [project, 'projectImages']));
                const imageName = get(projectList, [project, 'projectImages'])[imageId[0]];
                if (imageId.length === 0) {
                    return {project, imgBlob: '', imageName};
                }
                const imgBlob = await loadZipFile.file(`projects/${project}/images/${imageId[0]}`).async('blob');
                return {project, imgBlob, imageName};
            }));

            customMapPromiseAll.forEach(({project, imgBlob, imageName}) => {
                if (imageName === 'getFail') {
                    newCustomMap[project] = 'getFail';
                }
                if (imgBlob === '') {
                    newCustomMap[project] = '';
                } else {
                    newCustomMap[project] = URL.createObjectURL(imgBlob);
                }
            });
        }

        const newDuplicateProject = {};
        Object.keys(projectList).forEach((projectName) => {
            if (Object.keys(projectIdList)
                .find(projectId => projectIdList[projectId] === projectName)) {
                newDuplicateProject[projectName] = {
                    value: projectName,
                    sortValue: projectName,
                    error: true,
                    errorText: 'prjNameDuplicate',
                };
            }
        });
        // console.log('kyle_debug: tab', tab);

        setSelector(prevState => ({
            ...prevState,
            [tab]: {
                ...prevState[tab],
                selectedId,
                defaultSelectedId: selectedId,
                expandedId: [],
            },
        }));
        if (Object.keys(newDuplicateProject).length > 0) {
            setSortObject({
                sortBy: 'managementIp',
                sorting: 'asc',
            });
        }
        setDuplicateProject(newDuplicateProject);
        setLoadDuplicateProject(newDuplicateProject);
        setRestoreCustomMap(newCustomMap);
        setUserRestoreFile(restoreData);
        setPreview(true);
        setANMVersion(userANMVersion);
        setFileCreateTime(userFileCreateTime);
    };

    const handleInvalidFileTypeDialog = () => {
        setDialog(prevState => ({
            ...prevState,
            open: true,
            handleClose: handleDialogOnClose,
            title: 'fileTypeErrorTitle',
            content: 'fileTypeErrorContent',
            submitButton: 'OK',
            submitAction: handleDialogOnClose,
            cancelButton: '',
        }));
    };

    const handleFileExceedMaxTypeDialog = () => {
        setDialog(prevState => ({
            ...prevState,
            open: true,
            handleClose: handleDialogOnClose,
            title: 'fileTypeErrorTitle',
            content: 'fileSizeErrorContent',
            submitButton: 'OK',
            submitAction: handleDialogOnClose,
            cancelButton: '',
        }));
    };

    const handleFile = async (file) => {
        // console.log('kyle_debug: handleFile -> file', file);
        try {
            // legacy .anmproj handling
            if (file[0].name.split('.').pop() === 'anmproj') {
                // console.log('kyle_debug: handleFile -> anmprojFile Upload', file);
                const fileSize = Math.round((file[0].size / 1024 / 1024) * 100, 2) / 100;
                if (fileSize > 2) {
                    handleFileExceedMaxTypeDialog();
                } else {
                    const reader = new FileReader();
                    reader.readAsText(file[0], 'UTF-8');
                    reader.onload = async (evt) => {
                        const fileContent = evt.target.result;
                        try {
                            const decodeBackupJson = atob(fileContent);

                            const decodeBackup = JSON.parse(decodeBackupJson);

                            // File content checking
                            if (typeof decodeBackup.aNMBackup === 'undefined') {
                                handleInvalidFileTypeDialog();
                            } else {
                                await handleRestoreData(decodeBackup);
                                setRestoreCustomMap({});
                                setRestoreZipFile(null);
                            }
                        } catch (e) {
                            handleInvalidFileTypeDialog();
                        }
                    };
                }
            } else {
                const loadZipFile = await JSZip.loadAsync(file[0], {base64: true});
                const userBackupJson = deepClone(
                    JSON.parse(
                        atob(
                            await loadZipFile
                                .file('userBackup.anmproj')
                                .async('string')
                        )
                    )
                );
                // console.log('kyle_debug: handleZipFile -> file', userBackupJson);
                await handleRestoreData(userBackupJson, loadZipFile);
                setRestoreZipFile(file[0]);
            }
        } catch (err) {
            console.log('kyle_debug: handleFile -> err', err);
            handleInvalidFileTypeDialog();
        }
    };

    const {getRootProps, getInputProps, dragging} = useP2DragUpload({handleFile, accept: ['.anmproj', '.zip']});

    const tableData = convertTableData();
    const selectedProject = get(selector, [tab, 'selectedId']) || [];
    const disableRestore = selectedProject.some((projectName) => {
        const duplicateProjectStatus = get(duplicateProject, [projectName]);
        if (duplicateProjectStatus === null) {
            return false;
        }
        return duplicateProjectStatus.error;
    });
    const disableBackup = selectedProject.some(projectName => getFailProject.includes(projectName));

    const data = {
        tableData: {
            ...tableData,
            tblFunction: {
                handleSelectClick,
                handleExpand,
                handleSelectAllClick,
                handleRequestSort,
                handleChangePage,
                handleChangeItemsPerPage,
            },
        },
        method: {
            setPreview,
            handleBackupRestoreClose,
            changeTab,
            getRootProps,
            getInputProps,
            dragging,
            handleReset,
            handleChangeInput,
            restoreBackup,
            createBackupFile,
            handleOnBlur,
            onPopOverMouseEnter,
            onPopOverClose,
            // selectFileHandler,
        },
        toggle: {
            preview,
            anchorEl,
            popOpen,
            imgSrc: src,
        },
        dialog,
        tab: {
            currentTab: tab,
            aNMVersion,
            fileCreateTime,
            disableRestore,
            disableBackup,
            secondLayerGetFailProjectList,
            duplicateProject,
            sorting,
            sortBy,
            itemsPerPage,
            currentPage,
        },
        isLock,
    };

    return data;
};

export default useProjectBackupRestore;
