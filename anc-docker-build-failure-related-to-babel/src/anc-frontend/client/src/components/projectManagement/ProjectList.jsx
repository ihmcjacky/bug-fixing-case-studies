import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';
import {makeStyles} from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import {ReactComponent as BackupRestoreIcon} from '../../icon/svg/ic_backupRestoreProj.svg';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import P2SearchBar from '../common/P2SearchBar';
import P2Tooltip from '../common/P2Tooltip';
import P2Dialog from '../common/P2Dialog';
import {formValidator} from '../../util/inputValidator';
import {projectListStyles} from './styles';
import ProjectConstants from '../../constants/project';
import CommonConstants from '../../constants/common';
import ProjectBackupRestore from './ProjectBackupRestore';
import '../../icon/css/projectManagement.css';

const {project: {projectLimit, quickStagingName}} = ProjectConstants;
const {zIndexLevel, colors} = CommonConstants;

const useStyles = makeStyles(projectListStyles);

const headersInfo = [
    {
        id: 'projectName',
        canSort: true,
    },
    {
        id: 'managementIp',
        canSort: true,
    },
    {
        id: 'numOfNodes',
        canSort: true,
    },
    {
        id: 'action',
        canSort: false,
    },
]

const ProjectList = (props) => {
    const classes = useStyles();
    const {
        t,
        hasLogin,
        currentProjectId,
        list,
        listHandleBackOnClick,
        listHandleConnectOnClick,
        listHandleGuideOnClick,
        listHandleProjectRemove,
        listHandleProjectEdit,
        listHandleProjectAdd,
        listHandleOnClose,
        listHandleProjectBackupRestoreOpen,
        backupRestoreDialog,
    } = props;


    const [search, setSearch] = useState({
        searching: false,
        searchKey: '',
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
    });
    const [addProjectRow, setAddProjRow] = useState({
        show: false,
        projectName: '',
        projectNameError: '',
        managementIp: '',
        ipError: '',
        disableBtn: true,
    });
    const [editProject, setEditProject] = useState({
        editing: '',
        projectName: '',
        projectNameError: '',
        managementIp: '',
        ipError: '',
        disableBtn: true,
    })
    const [tableHeaderSettings, setTableHeader] = useState({
        orderBy: 'projectName',
        order: 'asc',
    });
    const [tableBodySettings, setTableBody] = useState({
        selected: '',
        sortedList: [],
        displayList: [],
    });
    const [tableFooterSettings, setTableFooter] = useState({
        rowsPerPage: 6,
        onPage: 0,
    });

    const handleSortList = (orderBy, order) => {
        const display = [...list];
        const temp = order === 'asc' ? 1 : -1;
        const sortedList = display.filter(proj => proj.projectName !== quickStagingName)
            .sort((a, b) => {
                const retNum = a[orderBy] > b[orderBy] ? 1 : -1;
                return retNum * temp;
            });
        return sortedList;
    };

    const initDisplayList = () => {
        const {orderBy, order} = tableHeaderSettings;
        const sortedList = handleSortList(orderBy, order);
        const displayList = handleFilterSearchKey(sortedList);
        
        if (displayList.length === 0) {
            setAddProjRow({
                ...addProjectRow,
                show: true,
            });
        }

        let selected = '';
        if (displayList.length > 0) {
            selected = tableBodySettings.selected === '' ? sortedList[0]?.projectId : tableBodySettings.selected;
        }
        setTableBody({
            ...tableBodySettings,
            selected,
            sortedList,
            displayList,
        });
    };

    useEffect(initDisplayList, [list]);

    const handleSearchOnClick = () => {
        if (search.searching) {
            setTableBody({
                ...tableBodySettings,
                displayList: tableBodySettings.sortedList,
            });
        }
        setSearch({
            searching: !search.searching,
            searchKey: '',
        });
    };

    const handleSearchFn = (newValue) => {
        setSearch({
            ...search,
            searchKey: newValue,
        });
        const results = handleFilterSearchKey(tableBodySettings.sortedList, newValue);
        setTableBody({
            ...tableBodySettings,
            displayList: results,
        });
    };

    const handleSearchOnChange = () => {};

    const handleChangePage = (e, page) => {
        setTableFooter({
            ...tableFooterSettings,
            onPage: page,
        });
    };

    const handleSortBtnOnClick = (id) => {
        let order;
        if (id === tableHeaderSettings.orderBy) {
            order = tableHeaderSettings.order === 'asc' ? 'desc' : 'asc';
            setTableHeader({
                ...tableHeaderSettings,
                order,
            });
        } else {
            order = 'asc';
            setTableHeader({
                ...tableHeaderSettings,
                orderBy: id,
                order,
            });
        }
        const sortedList = handleSortList(id, order);
        const displayList = handleFilterSearchKey(sortedList);
        setTableBody({
            ...tableBodySettings,
            sortedList,
            displayList,
        });
    };

    const handleDelete = (projectId) => {
        setDeleteDialog({
            open: true,
            target: projectId
        });
    };

    const handleShowAddProjRow = () => {
        setAddProjRow({
            show: true,
            projectName: '',
            projectNameError: '',
            managementIp: '',
            ipError: '',
            disableBtn: true,
        });
    };

    const handleChangeToEdit = (project) => {
        setEditProject({
            editing: project.projectId,
            projectName: project.projectName,
            projectNameError: '',
            managementIp: project.managementIp,
            ipError: '',
            disableBtn: true,
        });
    };

    const handleEditApply = () => {
        const {editing, projectName, managementIp} = editProject;
        const currentProject = tableBodySettings.sortedList.find(proj => proj.projectId === editing);
        const trimmedName = projectName.trim();

        if (currentProject.projectName !== trimmedName && currentProject.managementIp !== managementIp) {
            listHandleProjectEdit(editing, {newProjectName: trimmedName, newManagementIp: managementIp});
        } else if (currentProject.projectName !== trimmedName) {
            listHandleProjectEdit(editing, {newProjectName: trimmedName});
        } else if (currentProject.managementIp !== managementIp) {
            listHandleProjectEdit(editing, {newManagementIp: managementIp});
        }
        setEditProject({
            editing: '',
            projectName: '',
            projectNameError: '',
            managementIp: '',
            ipError: '',
            disableBtn: true,
        });
    };

    const handleEditKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (!editProject.disableBtn) {
                handleEditApply();
            }
        }
    }

    const handleAddApply = () => {
        listHandleProjectAdd({
            managementIp: addProjectRow.managementIp,
            projectName: addProjectRow.projectName,
        });
        setAddProjRow({
            show: false,
            projectName: '',
            projectNameError: '',
            managementIp: '',
            ipError: '',
            disableBtn: true,
        });
    };

    const handleAddKeyPress = (e) => {
        if (e.which === 13 || e.keyCode === 13) {
            if (!addProjectRow.disableBtn) {
                handleAddApply();
            }
        }
    }

    const handleCancelEdit = () => {
        setEditProject({
            editing: '',
            projectName: '',
            projectNameError: '',
            managementIp: '',
            ipError: '',
            disableBtn: true,
        });
    };

    const handleCancelAdd = () => {
        setAddProjRow({
            show: false,
            projectName: '',
            projectNameError: '',
            managementIp: '',
            ipError: '',
            disableBtn: true,
        });
    };

    const handleRowOnClick = (projectId) => {
        setTableBody({
            ...tableBodySettings,
            selected: projectId,
        });
    };

    const handleAddProjInputOnChange = (e, type) => {
        const newValue = e.target.value;
        const errorType = type === 'managementIp' ? 'ipError' : 'projectNameError';
        let error = '';
        let disableBtn;
        if (type === 'managementIp' && newValue !== '') {
            const validIp = formValidator('isIPv4', newValue);
            if (!validIp.result) {
                error = validIp.text;
            }
            disableBtn = !validIp.result;
        } else {
            disableBtn = addProjectRow.managementIp === '' || addProjectRow.ipError !== '';
        }

        if (type === 'projectName' && newValue !== '') {
            let validName = {result: true, text: ''};
            const projectIDregexPattern = /^[ 0-9a-zA-Z_-]{1,32}$/;
            const spaceRegexPattern = /.*[^ ].*/;
            tableBodySettings.sortedList.some((proj) => {
                if (proj.projectName.trim() === newValue) {
                    validName = {result: false, text: t('idExistedStr')};
                    return true;
                }
                return false;
            });
            if (validName.result) {
                validName = formValidator('matchRegex', newValue, projectIDregexPattern);
                if (!validName.result) {
                    validName.text = t('invalidProjIDStr');
                } else {
                    validName = formValidator('matchRegex', newValue, spaceRegexPattern);
                    if (!validName.result) {
                        validName.text = t('invalidProjIDStr');
                    }
                }
            }
            if (newValue === quickStagingName) {
                validName = {result: false, text: t('inputtedProjIDStr')};
            }
            if (!validName.result) {
                error = validName.text;
            }
            disableBtn = disableBtn || !validName.result;
        } else {
            disableBtn = disableBtn || addProjectRow.projectName === '' || addProjectRow.projectNameError !== '';
        }

        setAddProjRow({
            ...addProjectRow,
            [type]: newValue,
            [errorType]: error,
            disableBtn,
        });
    };

    const handleEditInputOnChange = (e, type) => {
        const newValue = e.target.value;
        const errorType = type === 'managementIp' ? 'ipError' : 'projectNameError';
        let error = '';
        let disableBtn;
        if (type === 'managementIp') {
            const validIp = formValidator('isIPv4', newValue);
            if (!validIp.result) {
                error = validIp.text;
            }
            disableBtn = !validIp.result;
        } else {
            disableBtn = editProject.managementIp === '' || editProject.ipError !== '';
        }

        if (type === 'projectName') {
            let validName = {result: true, text: ''};
            const projectIDregexPattern = /^[ 0-9a-zA-Z_-]{1,32}$/;
            const spaceRegexPattern = /.*[^ ].*/;
            tableBodySettings.sortedList.some((proj) => {
                if (proj.projectId === editProject.editing) return false;
                if (proj.projectName.trim() === newValue) {
                    validName = {result: false, text: t('idExistedStr')};
                    return true;
                }
                return false;
            });
            if (validName.result) {
                validName = formValidator('matchRegex', newValue, projectIDregexPattern);
                if (!validName.result) {
                    validName.text = t('invalidProjIDStr');
                } else {
                    validName = formValidator('matchRegex', newValue, spaceRegexPattern);
                    if (!validName.result) {
                        validName.text = t('invalidProjIDStr');
                    }
                }
            }
            if (newValue === quickStagingName) {
                validName = {result: false, text: t('inputtedProjIDStr')};
            }
            if (!validName.result) {
                error = validName.text;
            }
            disableBtn = disableBtn || !validName.result;
        } else {
            disableBtn = disableBtn || editProject.projectName === '' || editProject.projectNameError !== '';
        }

        setEditProject({
            ...editProject,
            [type]: newValue,
            [errorType]: error,
            disableBtn,
        });
    };

    const handleFilterSearchKey = (list, key) => {
        const keyword = key || search.searchKey;
        let displayList = list;
        if (search.searching) {
            displayList = displayList.filter((proj) => {
                return proj.projectName.includes(keyword) ||
                    proj.managementIp.includes(keyword) ||
                    proj.numOfNodes.toString().includes(keyword);
            });
        }
        return displayList;
    }

    const closeBtn = (
        <IconButton
            color="inherit"
            onClick={listHandleOnClose}
            classes={{root: classes.closeBtn}}
        >
            <CloseIcon />
        </IconButton>
    );

    const guidelineButton = (
        <IconButton
            color="inherit"
            onClick={listHandleGuideOnClick}
            data-testid="proj-list-icon-gl-btn"
        >
            <i data-testid="proj-list-icon-help" className="material-icons">help_outline</i>
        </IconButton>
    );

    const searchBar = (
        <Toolbar>
            {search.searching ?
                <P2SearchBar
                    value={search.searchKey}
                    onChange={handleSearchOnChange}
                    onRequestSearch={handleSearchFn}
                    disableCloseButton
                />
                :
                <Typography
                    variant="subtitle1"
                    className={classes.subTitle}
                    data-testid="proj-list-sub-title"
                >
                    {t('searchStr')}
                </Typography>
            }
            <IconButton
                color="inherit"
                onClick={handleSearchOnClick}
                aria-label={search.searching ? 'close' : 'search'}
                style={{marginLeft: 'auto'}}
                data-testid={search.searching ? 'proj-list-icon-close-btn' : 'proj-list-icon-fil-btn'}
            >
                {search.searching ?
                    <CloseIcon />
                    :
                    <i
                        className="material-icons"
                        data-testid="proj-list-icon-fil"
                    >
                        search
                    </i>
                }
            </IconButton>
        </Toolbar>
    );

    const addProjectBtn = (
        <P2Tooltip
            content={
                <div style={{display: 'inline-block'}} >
                    <IconButton
                        color="inherit"
                        onClick={handleShowAddProjRow}
                        aria-label="done"
                        disabled={addProjectRow.show || list.length >= projectLimit}
                        data-testid="proj-list-icon-add-btn"
                    >
                        <i
                            className="material-icons"
                            data-testid="proj-list-icon-add"
                        >
                            add_circle
                        </i>
                    </IconButton>
                </div>
            }
            title={list.length >= projectLimit ? t('projectLimtReached') : t('createProjTips')}
            key="proj-list-icon-add"
        />
    );

    const backupRestoreBtn = (
        <P2Tooltip
            content={
                <IconButton
                    color="inherit"
                    onClick={() => { listHandleProjectBackupRestoreOpen(); }}
                    aria-label="done"
                    className={classes.backupRestoreBtn}
                    data-testid="proj-list-icon-backupRestore-btn"
                >
                    <BackupRestoreIcon />
                </IconButton>
            }
            title={t('backupRestoreBtn')}
            key="proj-list-icon-backupRestore-btn"
        />
    );

    const deleteProjectBtn = (projectId) => (
        <P2Tooltip
            content={
                <span>
                    <IconButton
                        color="inherit"
                        onClick={() => { handleDelete(projectId); }}
                        disabled={projectId === currentProjectId}
                        aria-label="edit"
                        style={{display:'inline-flex'}}
                    >
                        <i className="material-icons" >
                            delete
                        </i>
                    </IconButton>
                </span>
            }
            title={t('removeProjTips')}
            key="proj-list-icon-delete-btn"
            direction="left"
        />
    );

    const editProjectBtn = (projObj) => (
        <P2Tooltip
            content={
                <span>
                    <IconButton
                        color="inherit"
                        onClick={() => { handleChangeToEdit(projObj); }}
                        disabled={projObj.projectId === currentProjectId}
                        aria-label="edit"
                        style={{display:'inline-flex'}}
                    >
                        <i className="material-icons" >
                            edit
                        </i>
                    </IconButton>
                </span>
            }
            title={t('editProjTips')}
            key="proj-list-icon-edit-btn"
            direction="right"
        />
    );

    const applyEditBtn = (isEdit) => {
        const onClick = isEdit ? handleEditApply : handleAddApply;
        const disabled = isEdit ? editProject.disableBtn : addProjectRow.disableBtn;
        return (
            <P2Tooltip
                content={
                    <span>
                        <IconButton
                            color="inherit"
                            onClick={onClick}
                            disabled={disabled}
                            aria-label="edit"
                            style={{display:'inline-flex'}}
                        >
                            <i className="material-icons" >
                                done
                            </i>
                        </IconButton>
                    </span>
                }
                title={t('apply')}
                key="proj-list-icon-apply-btn"
                direction="left"
            />
        );
    }

    const cancelEditBtn = (isEdit) => (
        <P2Tooltip
            content={
                <span>
                    <IconButton
                        color="inherit"
                        onClick={isEdit ? handleCancelEdit : handleCancelAdd}
                        aria-label="edit"
                        style={{display:'inline-flex'}}
                    >
                        <i className="material-icons" >
                            close
                        </i>
                    </IconButton>
                </span>
            }
            title={t('cancel')}
            key="proj-list-icon-cancel-btn"
            direction="right"
        />
    );

    const tableHeader = (
        <TableHead>
            <TableRow >
                {headersInfo.map((info) => {
                    if (info.id === 'action') {
                        return (
                            <TableCell
                                key={info.id}
                                sortDirection={false}
                                classes={{root: classes.tableHeadCell}}
                            >
                                <div
                                    style={{display: 'inline-block'}}
                                    data-testid="proj-list-devLst-hdr-lbl"
                                >
                                    {t(info.id)}
                                </div>
                                {addProjectBtn}
                                {backupRestoreBtn}
                            </TableCell>
                        );
                    }
                    return (
                        <TableCell
                            key={info.id}
                            sortDirection={tableHeaderSettings.orderBy === info.id ? tableHeaderSettings.order : false}
                            classes={{root: classes.tableHeadCell}}
                        >
                            {info.canSort ?
                                <TableSortLabel
                                    active={tableHeaderSettings.orderBy === info.id}
                                    direction={tableHeaderSettings.order}
                                    onClick={() => { handleSortBtnOnClick(info.id); }}
                                    data-testid="proj-list-devLst-sort-hdr-lbl"
                                >
                                    {t(info.id)}
                                </TableSortLabel>
                                :
                                <span data-testid="proj-list-devLst-hdr-lbl" >
                                    {t(info.id)}
                                </span>
                            }
                        </TableCell>
                    );
                })}
            </TableRow>
        </TableHead>
    );

    const tableBody = (
        <FlipMove
            duration={300}
            enterAnimation="accordionVertical"
            leaveAnimation="none"
            typeName="tbody"
        >
            {/* add new project row */}
            {
                addProjectRow.show ? (
                    <TableRow key="new">
                        <TableCell classes={{root: classes.tableCell}} >
                            <input
                                id="add-project-name"
                                autoFocus
                                className={classes.input}
                                value={addProjectRow.projectName}
                                onChange={(e) => { handleAddProjInputOnChange(e, 'projectName'); }}
                                onKeyPress={(e) => { handleAddKeyPress(e); }}
                            />
                            <div
                                className={
                                    `errorText
                                    ${addProjectRow.projectNameError === '' ? classes.notShow : classes.show}`
                                }
                            >
                                {addProjectRow.projectNameError}
                            </div>
                        </TableCell>
                        <TableCell classes={{root: classes.tableCell}} >
                            <input
                                id="add-project-ip"
                                className={classes.input}
                                value={addProjectRow.managementIp}
                                onChange={(e) => { handleAddProjInputOnChange(e, 'managementIp'); }}
                                onKeyPress={(e) => { handleAddKeyPress(e); }}
                            />
                            <div
                                className={
                                    `errorText
                                    ${addProjectRow.ipError === '' ? classes.notShow : classes.show}`
                                }
                            >
                                {addProjectRow.ipError}
                            </div>
                        </TableCell>
                        <TableCell classes={{root: classes.tableCell}}>
                            -
                        </TableCell>
                        <TableCell classes={{root: classes.tableCell}} >
                            {applyEditBtn(false)}
                            {cancelEditBtn(false)}
                        </TableCell>
                    </TableRow>
                ) : null
            }
            {/* project row */}
            {tableBodySettings.sortedList.length === 0 ?
                (<TableRow>
                    <TableCell colSpan={5}>
                        <Typography
                            variant="subtitle1"
                            style={{
                                opacity: 0.54,
                                fontSize: '16px',
                                textAlign: 'center',
                                userSelect: 'none',
                            }}
                        >
                            {t('noProjStr')}
                        </Typography>
                    </TableCell>
                </ TableRow>) : null}
            {tableBodySettings.sortedList.length !== 0 && tableBodySettings.displayList.length === 0 ?
                (<TableRow>
                    <TableCell colSpan={5}>
                        <Typography
                            variant="subtitle1"
                            style={{
                                opacity: 0.54,
                                fontSize: '16px',
                                textAlign: 'center',
                                userSelect: 'none',
                            }}
                        >
                            {t('noProjMatchStr')}
                        </Typography>
                    </TableCell>
                </ TableRow>) : null}
            {tableBodySettings.displayList.slice(
                    tableFooterSettings.onPage * 6,(tableFooterSettings.onPage * 6) + 6)
                .map((proj) => {
                const isSelected = proj.projectId === tableBodySettings.selected;
                const isEditing = proj.projectId === editProject.editing;
                const isCurrent = proj.projectId === currentProjectId;
                return (
                    <TableRow
                        onClick={() => {
                            if (isCurrent) return ;
                            handleRowOnClick(proj.projectId);
                        }}
                        onDoubleClick={() => {
                            if (isCurrent ||
                                tableBodySettings.selected === '' ||
                                currentProjectId === tableBodySettings.selected ||
                                tableBodySettings.selected === editProject.editing) {
                                return;
                            }
                            listHandleConnectOnClick(proj.projectId);
                        }}
                        key={proj.projectId}
                        selected={isSelected}
                        classes={{root: isCurrent ? classes.disableSelect : classes.enableSelect}}
                        style={{backgroundColor: isSelected ? 'rgb(224, 224, 224)' : colors.projectLandingDialogBackground}}
                    >
                        <TableCell classes={{root: isCurrent ? classes.currentTableCell : classes.tableCell}} >
                            {isEditing ? (<div>
                                    <input
                                        id="edit-project-name"
                                        autoFocus
                                        className={classes.input}
                                        value={editProject.projectName}
                                        onChange={(e) => { handleEditInputOnChange(e, 'projectName'); }}
                                        onKeyPress={(e) => { handleEditKeyPress(e); }}
                                    />
                                    <div
                                        className={
                                            `errorText
                                            ${editProject.projectNameError === '' ? classes.notShow : classes.show}`
                                        }
                                    >
                                        {editProject.projectNameError}
                                    </div>
                                </div>) : `${proj.projectName} ${isCurrent ? '*' : ''}`}
                        </TableCell>
                        <TableCell classes={{root: isCurrent ? classes.currentTableCell : classes.tableCell}} >
                            {isEditing ? (<div>
                                    <input
                                        id="edit-project-ip"
                                        className={classes.input}
                                        value={editProject.managementIp}
                                        onChange={(e) => { handleEditInputOnChange(e, 'managementIp'); }}
                                        onKeyPress={(e) => { handleEditKeyPress(e); }}
                                    />
                                    <div
                                        className={
                                            `errorText
                                            ${editProject.ipError === '' ? classes.notShow : classes.show}`
                                        }
                                    >
                                        {editProject.ipError}
                                    </div>
                                </div>) : proj.managementIp}
                        </TableCell>
                        <TableCell classes={{root: isCurrent ? classes.currentTableCell : classes.tableCell}} >
                            {proj.numOfNodes}
                        </TableCell>
                        <TableCell classes={{root: isCurrent ? classes.currentTableCell : classes.tableCell}} >
                            {isEditing ?
                                (<div>
                                    {applyEditBtn(true)}
                                    {cancelEditBtn(true)}
                                </div>)
                                :
                                (<div>
                                    {deleteProjectBtn(proj.projectId)}
                                    {editProjectBtn(proj)}
                                </div>)
                            }
                        </TableCell>
                    </TableRow>
                );
            })}
        </FlipMove>
    );

    const tableFooter = (
        <div>
            <Typography
                color="primary"
                style={{
                    fontWeight: 'normal',
                    fontSize: '12px',
                    float: 'left',
                    marginTop: '20px',
                    marginLeft: '20px',
                }}
                variant="body2"
            >
                * {t('currentProject')}
            </Typography>
            <TablePagination
                component="div"
                count={tableBodySettings.displayList.length}
                rowsPerPage={tableFooterSettings.rowsPerPage}
                rowsPerPageOptions={[]}
                page={tableFooterSettings.onPage}
                backIconButtonProps={{'aria-label': t('previousPage')}}
                nextIconButtonProps={{'aria-label': t('nextPage')}}
                labelDisplayedRows={({from, to, count}) => (
                    `${t('labelDisplayedRows1')}
                    ${from}${t('labelDisplayedRows2')}
                    ${to}${t('labelDisplayedRows3')}${count}`
                )}
                onChangePage={handleChangePage}
                data-testid="proj-list-tbl-ft"
            />
        </div>
    );

    return (
        <div>
            <DialogTitle classes={{root: classes.dialogTitle}} >
                {hasLogin ? closeBtn : null}
                <div
                    className={classes.guidelineBtnWrapper}
                    style={{right: hasLogin ? '50px' : '10px'}}
                >
                    <P2Tooltip
                        title={t('guidelineTooltip')}
                        content={guidelineButton}
                        key="guidelineBtn"
                    />
                </div>
                <Typography
                    data-testid="proj-list-main-title"
                    color="inherit"
                    className={classes.title}
                    variant="body2"
                >
                    {t('chooseProj')}
                </Typography>
            </DialogTitle>
            <DialogContent classes={{root: classes.dialogContent}} >
                {searchBar}
                <div className={classes.wrapper}>
                    <Table >
                        {tableHeader}
                        {tableBody}
                    </Table>
                    {tableFooter}
                </div>
                {backupRestoreDialog && <ProjectBackupRestore />}
            </DialogContent>
            <div className={classes.btnWrapper}>
                <Button
                    color="primary"
                    style={{paddingLeft: '0', marginLeft: '0', marginRight: 'auto'}}
                    onClick={listHandleBackOnClick}
                    data-testid="proj-list-icon-bk-btn"
                >
                    <i className="material-icons">
                        keyboard_arrow_left
                    </i>
                    {t('back')}
                </Button>
                <Button
                    color="primary"
                    onClick={() => { listHandleConnectOnClick(tableBodySettings.selected); }}
                    style={{marginLeft: 'auto', marginRight: '0'}}
                    disabled={tableBodySettings.selected === '' ||
                        currentProjectId === tableBodySettings.selected ||
                        tableBodySettings.selected === editProject.editing
                    }
                    data-testid="proj-list-icon-conn-btn"
                >
                    {t('connect')}
                    <i className="material-icons">
                        keyboard_arrow_right
                    </i>
                </Button>
            </div>
            <P2Dialog
                open={deleteDialog.open}
                handleClose={() => { setDeleteDialog({open: false, target: ''}); }}
                title={t('confirmRMProjTitle')}
                content={t('confirmRMProjContent')}
                actionTitle={t('ok')}
                actionFn={() => {
                    listHandleProjectRemove(deleteDialog.target);
                    setDeleteDialog({open: false, target: ''});
                }}
                cancelActTitle={t('cancel')}
                cancelActFn={() => { setDeleteDialog({open: false, target: ''}); }}
                zIndex={zIndexLevel.mediumHigh + 1}
            />
        </div>
    );
};

ProjectList.propTypes = {
    t: PropTypes.func.isRequired,
    hasLogin: PropTypes.bool.isRequired,
    currentProjectId: PropTypes.string.isRequired,
    list: PropTypes.arrayOf(
        PropTypes.shape({
            projectId: PropTypes.string.isRequired,
            managementIp: PropTypes.string.isRequired,
            numOfNodes: PropTypes.number.isRequired,
            projectName: PropTypes.string.isRequired,
        })
    ).isRequired,
    listHandleBackOnClick: PropTypes.func.isRequired,
    listHandleConnectOnClick: PropTypes.func.isRequired,
    listHandleGuideOnClick: PropTypes.func.isRequired,
    listHandleProjectRemove: PropTypes.func.isRequired,
    listHandleProjectEdit: PropTypes.func.isRequired,
    listHandleProjectAdd: PropTypes.func.isRequired,
    listHandleOnClose: PropTypes.func.isRequired,
    listHandleProjectBackupRestoreOpen: PropTypes.func.isRequired,
    backupRestoreDialog: PropTypes.bool.isRequired,
};

export default ProjectList;
