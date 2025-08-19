/**
 * @Author: mango
 * @Date:   2018-04-10T17:38:04+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-08-15T15:19:15+08:00
 */
import React from 'react';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseIcon from '@material-ui/icons/Close';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import {Paper} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import P2SearchBar from '../common/P2SearchBar';
import P2Tooltip from '../../components/common/P2Tooltip';
import Constant from '../../constants/common';


function getSorting(order, orderBy) {
    return order === 'desc' ?
        (a, b) => {
            let aField = a[orderBy];
            let bField = b[orderBy];

            if (a[orderBy] !== null &&
                typeof a[orderBy] === 'object') {
                if (orderBy === 'hostname') {
                    const [firstAChild] = a[orderBy].props.children;
                    aField = firstAChild;
                } else {
                    aField = a[orderBy].props.children;
                }
            }
            if (b[orderBy] !== null &&
                typeof b[orderBy] === 'object') {
                if (orderBy === 'hostname') {
                    const [firstBChild] = b[orderBy].props.children;
                    bField = firstBChild;
                } else {
                    bField = b[orderBy].props.children;
                }
            }
            return bField < aField ? -1 : 1;
        } :
        (a, b) => {
            let aField = a[orderBy];
            let bField = b[orderBy];

            if (a[orderBy] !== null &&
                typeof a[orderBy] === 'object') {
                if (orderBy === 'hostname') {
                    const [firstAChild] = a[orderBy].props.children;
                    aField = firstAChild;
                } else {
                    aField = a[orderBy].props.children;
                }
            }
            if (b[orderBy] !== null &&
                typeof b[orderBy] === 'object') {
                if (orderBy === 'hostname') {
                    const [firstBChild] = b[orderBy].props.children;
                    bField = firstBChild;
                } else {
                    bField = b[orderBy].props.children;
                }
            }
            return aField < bField ? -1 : 1;
        };
}

const defaultPropsObj = {
    padding: {
        tableCell: '',
    },
    toolbar: {
        minHeight: '',
        paddingLeft: '',
    },
    fontSize: {
        header: '',
        body: '',
        description: '',
    },
    footer: {
        height: '',
    },
};

const {colors} = Constant;

const styles = theme => ({
    highlight:
    theme.palette.type === 'light'
        ? {
            color: 'white',
            backgroundColor: theme.palette.primary.light,
        }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
        },
    root: {
        // fontSize: '10px',
        color: colors.borderColor,
        '&$checked': {
            color: theme.palette.primary.main,
        },
    },
    checked: {},
    pagination: {
        paddingRight: 25,
    },
    tableRowBody: {
        height: '57px',
    },
});


function P2DevTbl(props) {
    const {classes} = props;
    const searchData = (data, searchKey) => {
        if (typeof searchKey !== 'undefined') {
            const lowSearchKey = searchKey.toLowerCase();
            if (lowSearchKey === '') {
                return data;
            }
            return data.filter(obj =>
                Object.keys(obj).some((key) => {
                    console.log('--------key--------');
                    console.log(key);
                    let included = false;
                    if (obj[key] !== null &&
                        typeof obj[key] === 'object') {
                        if (key === 'hostname') {
                            const [firstChild] = obj[key].props.children;
                            // console.log('--------element--------');
                            // console.log(firstChild);
                            included = firstChild.toLowerCase().includes(lowSearchKey);
                        } else if (key === 'action' || key === 'results') {
                            included = false;
                        } else if (!obj[key].props.children) {
                            if (obj[key].props.message) {
                                included = obj[key].props.message.toLowerCase().includes(lowSearchKey);
                            } else {
                                included = false;
                            }
                        } else {
                            console.log('--------element--------');
                            console.log(obj[key].props.children);
                            if (Array.isArray(obj[key].props.children)) {
                                if (typeof obj[key].props.children[0] === 'string') {
                                    const status = obj[key].props.children[1].props.children.props.children;
                                    included = false;
                                    status.some((words) => {
                                        if (words === '') {
                                            return false;
                                        } else if (words.toLowerCase().includes(lowSearchKey)) {
                                            included = true;
                                            return true;
                                        }
                                        return false;
                                    });
                                } else if (key === 'model') {
                                    included = obj[key].props.children[0]
                                        .props.children.toLowerCase().includes(lowSearchKey);
                                } else {
                                    const status = obj[key].props.children[1].props.children[1]
                                    .props.children.props.children;
                                    const resultStatus = status[1].toLowerCase().includes(lowSearchKey);
                                    const reasonStatus = status[2].props.children[1][0].props.children
                                        .toLowerCase().includes(lowSearchKey);
                                    included = resultStatus || reasonStatus;
                                }
                            } else {
                                included = obj[key].props.children.toLowerCase().includes(lowSearchKey);
                            }
                        }
                    } else if (obj[key] !== null &&
                        typeof obj[key] === 'number') {
                        included = false;
                    } else if (key === 'nodeIp') {
                        included = false;
                    } else {
                        // console.log('--------element--------');
                        // console.log(obj[key]);
                        included = obj[key].toLowerCase().includes(lowSearchKey);
                    }
                    return included;
                })
            );
        }
        return data;
    };

    const collapseComponent = component => (
        <tr>
            <td colSpan={props.tblHeaders.Headers.length + (props.disableSelect ? 0 : 1)}>
                <div className={component.className}>
                    {component.children}
                </div>
            </td>
        </tr>
    );

    const dataRows = props.tblData.map((row, idx) => {
        const rowCtx = {};
        rowCtx.id = idx;
        for (let i = 0; i < row.length; i += 1) {
            rowCtx[props.tblHeaders.Headers[i].id] = row[i].ctx;
        }
        return rowCtx;
    });

    const filterData = searchData(dataRows, props.tblHeaders.searchKey);

    const selectedId = typeof props.tblHeaders.selectedId !== 'undefined' ? props.tblHeaders.selectedId : [];
    const selectedMac = typeof props.tblHeaders.selectedMac !== 'undefined' ? props.tblHeaders.selectedMac : [];
    const disabledMac = typeof props.tblHeaders.disabledMac !== 'undefined' ? props.tblHeaders.disabledMac : [];
    const collapsedMac = typeof props.tblHeaders.collapsedMac !== 'undefined' ? props.tblHeaders.collapsedMac : [];
    const tblCollpased = typeof props.tblCollpased !== 'undefined' ? props.tblCollpased : {};
    const selectToolbar = typeof props.tblToolbar.selectToolbar !== 'undefined' ? props.tblToolbar.selectToolbar : [];

    const toolbarsButton = selectToolbar.map(Button => <span key={Button.key}>{Button}</span>);


    const selected = (item, key) => (props.radioSelect ?
        selectedMac.indexOf(item[key]) !== -1 :
        selectedId.indexOf(item[key]) !== -1);

    const disabled = item => disabledMac.indexOf(item) !== -1;

    const collapsed = mac => collapsedMac.indexOf(mac) !== -1;

    const collapsedContent = mac => (
        Object.keys(tblCollpased).indexOf(mac) !== -1 ?
            tblCollpased[mac] : <span />);

    let orderBy = props.tblHeaders.Headers[0].id;
    let order = false;

    if (typeof props.tblHeaders.Headers.find(n => n.isSorted) !== 'undefined') {
        orderBy = props.tblHeaders.Headers.find(n => n.isSorted).id;
        order = props.tblHeaders.Headers.find(n => n.isSorted).sortType;
    }

    if (order) {
        order = 'desc';
    } else {
        order = 'asc';
    }

    // console.log('-----searchKey-----');
    // console.log(props.tblHeaders.searchKey);
    // console.log('-----selectedidlength-----');
    // console.log(selectedId.length);
    // console.log('-----propsfooteritem-----');
    // console.log(props.tblFooter.totalItems);
    // console.log('-----filterdatalength-----');
    // console.log(filterData.length);
    const totalItems = props.tblFooter.totalItems < filterData.length ?
        props.tblFooter.totalItems : filterData.length;
    // console.log('-----p2totalitem-----');
    // console.log(totalItems);
    let footerCtx = null;
    if (!props.disableFooter) {
        footerCtx = (
            <React.Fragment>
                {props.tblFooter.label}
                <TablePagination
                    component="div"
                    count={totalItems}
                    rowsPerPage={props.tblFooter.itemsPerPage}
                    page={props.tblFooter.currentPage}
                    rowsPerPageOptions={props.tblFooter.rowsPerPageOptions}
                    backIconButtonProps={{
                        'aria-label': props.t('previousPageLbl'),
                    }}
                    nextIconButtonProps={{
                        'aria-label': props.t('nextPageLbl'),
                    }}
                    labelRowsPerPage={props.t('labelRowsPerPage')}
                    labelDisplayedRows={({from, to, count}) => (<span>{props.t('labelDisplayedRows1')}
                        {from}{props.t('labelDisplayedRows2')}{to}{props.t('labelDisplayedRows3')}{count}</span>)}
                    onChangePage={props.tblFooter.handleChangePage}
                    onChangeRowsPerPage={props.tblFooter.handleChangeItemsPerPage}
                    classes={{
                        toolbar: classes.pagination,
                    }}
                />
            </React.Fragment>
        );
    }
    let searchDescBarCtx = null;
    if (!props.disableSearch) {
        if (props.tblHeaders.searching) {
            searchDescBarCtx = props.disableCloseSearchIcon ?
                (
                    <P2SearchBar
                        value={props.tblHeaders.searchKey}
                        onChange={newValue => this.setState({value: newValue})}
                        onRequestSearch={props.tblToolbar.handleSearch}
                        disableCloseButton
                    />
                ) :
                (
                    <P2SearchBar
                        value={props.tblHeaders.searchKey}
                        onChange={newValue => this.setState({value: newValue})}
                        onRequestSearch={props.tblToolbar.handleSearch}
                    />
                );
        } else {
            searchDescBarCtx = (
                <Typography
                    color="inherit"
                    variant="subtitle1"
                    style={{
                        fontSize: props.style.fontSize.description ||
                        defaultPropsObj.fontSize.description,
                    }}
                >
                    {props.tblToolbar.description}
                </Typography>
            );
        }
    } else {
        searchDescBarCtx = (
            <Typography
                color="inherit"
                variant="subtitle1"
                style={{
                    fontSize: props.style.fontSize.description ||
                    defaultPropsObj.fontSize.description,
                }}
            >
                {props.tblToolbar.description}
            </Typography>
        );
    }

    let tableCtx = null;
    tableCtx = (
        <Table size="small" style={{width: '100%', tableLayout: 'auto'}}>
            <TableHead>
                <TableRow classes={{root: classes.tableRowBody}}>
                    {!props.disableSelect && !props.radioSelect ?
                        <TableCell
                            align="center"
                            padding="checkbox"
                            style={{
                                borderColor: colors.borderColor,
                                paddingRight: props.style.padding.tableCell || defaultPropsObj.padding.tableCell,
                                fontSize: props.style.fontSize.header || defaultPropsObj.fontSize.header,
                            }}
                        >
                            <Checkbox
                                classes={{
                                    root: classes.root,
                                    checked: classes.checked,
                                }}
                                indeterminate={(props.tblHeaders.searchKey === '' &&
                                            (selectedId.length > 0 &&
                                            selectedId.length < totalItems)) ||
                                            (props.tblHeaders.searchKey !== '' &&
                                            (selectedId.length < totalItems
                                            && selectedId.length > 0))}
                                checked={(props.tblHeaders.searchKey === '' &&
                                    selectedId.length === totalItems) ||
                                    (props.tblHeaders.searchKey !== '' &&
                                    (selectedId.length === totalItems) && selectedId.length !== 0)}
                                onChange={(e, checked) => props.tblHeaders.handleSelectAllClick(e, checked,
                                    filterData)}
                            />
                        </TableCell> :
                        <TableCell
                            style={{
                                display: 'none',
                            }}
                        >
                            ID
                        </TableCell>
                    }
                    {props.radioSelect &&
                    <TableCell
                        padding="checkbox"
                        style={{
                            borderColor: colors.borderColor,
                        }}
                    />
                    }
                    {props.tblHeaders.Headers.map((column) => {
                        if (column.id === 'nodeIp') {
                            return (
                                <TableCell
                                    key={column.id}
                                    style={{
                                        display: 'none',
                                    }}
                                >
                                    {props.t('nodeIpHdr')}
                                </TableCell>
                            );
                        }
                        return (
                            <TableCell
                                key={column.id}
                                sortDirection={orderBy === column.id ? order : false}
                                style={{
                                    borderColor: colors.borderColor,
                                    paddingRight: props.style.padding.tableCell
                                    || defaultPropsObj.padding.tableCell,
                                    fontSize: props.style.fontSize.header || defaultPropsObj.fontSize.header,
                                    width: column.width ? column.width : 'inherit',
                                }}
                            >
                                {column.canSort && !props.disableSort ?
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={order}
                                        onClick={e => props.tblHeaders.handleRequestSort(e, column.id)}
                                    >
                                        {column.HeaderLabel}
                                    </TableSortLabel>
                                    :
                                    <span>{column.HeaderLabel}</span>
                                }
                            </TableCell>
                        );
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    filterData.sort(
                        getSorting(order, orderBy)
                    ).slice(
                        props.tblFooter.currentPage * props.tblFooter.itemsPerPage,
                        (props.tblFooter.currentPage * props.tblFooter.itemsPerPage) + props.tblFooter.itemsPerPage
                    ).map((n) => {
                        const selectedKey = props.radioSelect ? 'mac' : 'id';
                        const isSelected = !props.disableSelect ? selected(n, selectedKey) : false;
                        const isDisabled = !props.disableSelect ? disabled((typeof n.mac !== 'string' && props.radioSelect) ?
                            n.mac.props.children : n.mac) : false;
                        const checkbox = props.radioSelect ? (
                            <Radio
                                checked={isSelected}
                                onClick={e => props.tblHeaders.handleSelectRadioClick(e, n.mac)}
                                disabled={isDisabled}
                                classes={{
                                    root: classes.root,
                                    checked: classes.checked,
                                }}
                            />
                        ) : (
                            <Checkbox
                                checked={isSelected}
                                onClick={e => props.tblHeaders.handleSelectClick(e, n.id,
                                    typeof n.nodeIp !== 'undefined' ? n.nodeIp : n.mac, n)}
                                classes={{
                                    root: classes.root,
                                    checked: classes.checked,
                                }}
                            />
                        );
                        const tableCellCtx = Object.keys(n).map(
                            (key) => {
                                if (key === 'id') {
                                    return !props.disableSelect ? (
                                        <TableCell
                                            align="center"
                                            padding="checkbox"
                                            key={key}
                                        >
                                            {checkbox}
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            key={key}
                                            style={{
                                                display: 'none',
                                            }}
                                        >{n[key]}</TableCell>
                                    );
                                } else if (key === 'nodeIp') {
                                    return (
                                        <TableCell
                                            key={key}
                                            style={{
                                                display: 'none',
                                            }}
                                        >{n[key]}</TableCell>
                                    );
                                }
                                return (
                                    <TableCell
                                        key={key}
                                        style={{
                                            paddingRight:
                                                props.style.padding.tableCell
                                                || defaultPropsObj.padding.tableCell,
                                            fontSize:
                                                props.style.fontSize.body
                                                || defaultPropsObj.fontSize.body,
                                            maxHeight: '30px',
                                        }}
                                    >
                                        {n[key]}
                                    </TableCell>
                                );
                            });
                        const tableRowCtx = (
                            <React.Fragment key={`tableRowCtx_${n.id}`}>
                                <TableRow
                                    classes={{
                                        root: classes.tableRowBody,
                                    }}
                                    tabIndex={-1}
                                    key={n.id}
                                    role="checkbox"
                                    // hover
                                    aria-checked={isSelected}
                                    // selected={isSelected}
                                >
                                    {tableCellCtx}
                                </TableRow>
                                <Collapse
                                    key={`Collapse_${n.id}`}
                                    component={collapseComponent}
                                    in={collapsed(n.mac)}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    {collapsedContent(n.mac)}
                                </Collapse>
                            </React.Fragment>
                        );
                        return tableRowCtx;
                    })
                }
            </TableBody>
        </Table>
    );

    let toggleSearchButton = null;
    if (props.hideSearchIcon) {
        toggleSearchButton = <span />;
    } else if (!props.disableSearch && props.tblHeaders.searching) {
        toggleSearchButton = (
            <P2Tooltip
                title={props.t('toggleSearch')}
                content={<IconButton
                    color="inherit"
                    onClick={props.tblToolbar.handleinitiateSearch}
                    aria-label="delete"
                >
                    <CloseIcon />
                </IconButton>}
                key="popup"
            />
        );
    } else if (!props.disableSearch && !props.tblHeaders.searching) {
        toggleSearchButton = (
            <P2Tooltip
                title={props.t('toggleSearch')}
                content={<IconButton
                    color="inherit"
                    onClick={props.tblToolbar.handleinitiateSearch}
                    aria-label="delete"
                >
                    <i
                        className="material-icons"
                    >search</i>
                </IconButton>}
                key="popup"
            />
        );
    }
    let toolbarCtx = null;
    if (!props.disableSelect || !props.disableSearch) {
        toolbarCtx = (
            <Toolbar
                className={classNames({
                    [classes.highlight]: selectedId.length > 0,
                })}
                style={{
                    display: 'flex',
                    minHeight: props.style.toolbar.minHeight || '',
                    paddingLeft: props.style.toolbar.paddingLeft || '',
                    backgroundColor: selectedId.length > 0 ?
                        'theme.palette.secondary.light' : '',
                }}
            >
                {selectedId.length > 0 ? (
                    <Typography
                        color="inherit"
                        variant="subtitle1"
                        style={{
                            fontSize: props.style.fontSize.description ||
                            defaultPropsObj.fontSize.description,
                            alignItems: 'center',
                            display: 'flex',
                        }}
                    >
                        {props.backSelected} {selectedId.length} {props.t('selectedLbl')}
                    </Typography>
                ) : (
                    <span
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {props.tblHeaders.searching && props.backSearch} {searchDescBarCtx}
                    </span>
                )}
                {selectedId.length > 0 ? (
                    <div style={{
                        marginLeft: 'auto',
                    }}
                    >
                        {toolbarsButton}
                    </div>
                ) : (
                    <div style={{
                        marginLeft: 'auto',
                    }}
                    >
                        <div style={{
                            display: 'flex',
                        }}
                        >
                            {toggleSearchButton}
                            {props.rescanButton}
                        </div>
                    </div>
                )}
            </Toolbar>
        );
    }

    return (!props.disablePaper ?
        <Paper style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            ...(props.style.footer.height && {height: props.style.footer.height}),
        }}
        >
            {toolbarCtx}
            <div style={{overflowX: 'auto', paddingRight: '10px'}}>
                {tableCtx}
            </div>
            <div style={{marginTop: 'auto', paddingRight: '10px'}}>
                {footerCtx}
            </div>
        </Paper>
        :
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            ...(props.style.footer.height && {height: props.style.footer.height}),
        }}
        >
            {toolbarCtx}
            <div style={{overflowX: 'auto', paddingRight: '10px', paddingLeft: '10px'}}>
                {tableCtx}
            </div>
            <div style={{marginTop: 'auto', paddingRight: '10px', paddingLeft: '10px'}}>
                {footerCtx}
            </div>
        </div>
    );
}

P2DevTbl.propTypes = {
    tblToolbar: PropTypes.shape({
        description: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
        handleSearch: PropTypes.func,
        selectToolbar: PropTypes.arrayOf(PropTypes.element),
        handleinitiateSearch: PropTypes.func,
    }),
    tblHeaders: PropTypes.shape({
        Headers: PropTypes.arrayOf(PropTypes.object).isRequired,
        handleRequestSort: PropTypes.func,
        handleSelectAllClick: PropTypes.func,
        handleSelectClick: PropTypes.func,
        handleSelectRadioClick: PropTypes.func,
        searchKey: PropTypes.string,
        searching: PropTypes.bool,
        selectedId: PropTypes.arrayOf(PropTypes.number),
        selectedIp: PropTypes.arrayOf(PropTypes.string),
        selectedMac: PropTypes.arrayOf(PropTypes.string),
        disabledMac: PropTypes.arrayOf(PropTypes.string),
        collapsedMac: PropTypes.arrayOf(PropTypes.string),
    }),
    tblFooter: PropTypes.shape({
        currentPage: PropTypes.number,
        handleChangeItemsPerPage: PropTypes.func,
        handleChangePage: PropTypes.func,
        itemsPerPage: PropTypes.number,
        label: PropTypes.element,
        totalItems: PropTypes.number,
        rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
    }),
    // tblFooter: PropTypes.objectOf(
    //     PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.func, PropTypes.string])
    // ),
    tblData: PropTypes.arrayOf(PropTypes.array).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    tblCollpased: PropTypes.object,
    disableFooter: PropTypes.bool,
    disableSort: PropTypes.bool,
    disableSelect: PropTypes.bool,
    disableSearch: PropTypes.bool,
    disablePaper: PropTypes.bool,
    radioSelect: PropTypes.bool,
    hideSearchIcon: PropTypes.bool,
    backSelected: PropTypes.element,
    backSearch: PropTypes.element,
    rescanButton: PropTypes.element,
    style: PropTypes.objectOf(PropTypes.object),
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
    disableCloseSearchIcon: PropTypes.bool,
};

P2DevTbl.defaultProps = {
    tblToolbar: {
        description: '',
        handleSearch: () => null,
        selectToolbar: [],
    },
    tblHeaders: {
        searchKey: '',
        selectedId: [],
        selectedIp: [],
        selectedMac: [],
        collapsedMac: [],
        disabledMac: [],
        handleRequestSort: () => null,
        handleSelectAllClick: () => null,
        handleSelectClick: () => null,
        handleSelectRadioClick: () => null,
    },
    tblFooter: {
        totalItems: 0,
        itemsPerPage: 10,
        currentPage: 0,
        handleChangePage: () => null,
        handleChangeItemsPerPage: () => null,
        label: <span />,
        rowsPerPageOptions: [10, 25, 50, 100],
    },
    tblCollpased: {},
    disableFooter: false,
    disableSort: false,
    disableSelect: false,
    disableSearch: false,
    disablePaper: false,
    radioSelect: false,
    backSelected: <span />,
    backSearch: <span />,
    rescanButton: <span />,
    style: defaultPropsObj,
    hideSearchIcon: false,
    disableCloseSearchIcon: false,
};

export {P2DevTbl as CleanP2DevTbl};
export default compose(withTranslation(['managed-device-list']))(withStyles(styles)(P2DevTbl));
