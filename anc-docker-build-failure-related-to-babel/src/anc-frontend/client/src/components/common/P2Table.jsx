/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-06-19 15:49:06
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-08-18 13:28:49
 * @ Description:
 */

import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import {withStyles} from '@material-ui/core/styles';
import {Paper} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';


import Constant from '../../constants/common';

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
    tableRow: {
        height: '',
    },
};

const {colors} = Constant;

const styles = theme => ({
    root: {
        color: colors.borderColor,
        '&$checked': {
            color: theme.palette.primary.main,
        },
    },
    checked: {},
    pagination: {
        paddingRight: 25,
    },
    tableRowHead: {
        height: '48px',
    },
    tableRowSuperHead: {
        height: '28px',
        verticalAlign: 'bottom',
    },
    tableRowBody: {
        height: '72px',
    },
    tableRowBodyWithHoverEffect: {
        height: '72px',
        '&:hover': {
            backgroundColor: 'rgba(66, 85, 129, 0.1)',
        }
    },
    tableRowBodySelected: {
        // backgroundColor: '#e5e5e5 !important',
        backgroundColor: 'rgba(66, 85, 129, 0.1)',
    },
    tableCellRoot: {
        border: '0px',
    },
    emptyWording: {
        fontSize: '16px',
        opacity: '0.54',
        textAlign: 'center',
        userSelect: 'none',
    },
    hoverEffectRow: {
        '&:hover': {
            backgroundColor: 'rgba(66, 85, 129, 0.1)',
        }
    },
});

function calWidth(enableSelect, enableExpand) {
    if (enableSelect && enableExpand) {
        return 90;
    } else if (enableSelect || enableExpand) {
        return 95;
    }
    return 100;
}

function calColSpan(enableSelect, enableExpand, headerLength) {
    if (enableSelect && enableExpand) {
        return 2 + headerLength;
    } else if (enableSelect || enableExpand) {
        return 1 + headerLength;
    }
    return headerLength;
}


function P2Table(props) {
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('managed-device-list');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const {
        classes,
        tblHeaders: {
            Headers,
            parentHeaders,
            sortBy,
            sorting,
        },
        tblData,
        tblFooter: {
            helper,
            itemsPerPage,
            currentPage,
            rowsPerPageOptions,
        },
        tblSelector: {
            selectedId,
            rowSelectedId,
            expandedId,
        },
        tblFunction,
        tblToggle: {
            enableFooter,
            enableHeader,
            enableSelect,
            enableRadioSelect,
            enableSort,
            enablePaper,
            enableExpand,
            enableContextMenu,
            enableRowSelectClick,
            customCheckboxIcon,
            customRadioButtonIcon,
            noContentWording,
        },
        style,
        maxWidth,
    } = props;
    let footerCtx = null;
    let tableCtx = null;
    let tableHeadCtx = null;
    let tableBodyCtx = null;

    if (enableFooter) {
        footerCtx = (
            <div style={{marginTop: 'auto', paddingRight: '10px'}}>
                {helper}
                <TablePagination
                    component="div"
                    count={tblData.length}
                    rowsPerPage={itemsPerPage}
                    page={currentPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                    backIconButtonProps={{
                        'aria-label': t('previousPageLbl'),
                    }}
                    nextIconButtonProps={{
                        'aria-label': t('nextPageLbl'),
                    }}
                    labelRowsPerPage={t('labelRowsPerPage')}
                    labelDisplayedRows={({from, to, count}) => (<span>{t('labelDisplayedRows1')}
                        {from}{t('labelDisplayedRows2')}{to}{t('labelDisplayedRows3')}{count}</span>)}
                    onChangePage={tblFunction.handleChangePage}
                    onChangeRowsPerPage={tblFunction.handleChangeItemsPerPage}
                    classes={{
                        toolbar: classes.pagination,
                    }}
                />
            </div>
        );
    }

    if (enableHeader) {
        tableHeadCtx = (
            <TableHead>
                {parentHeaders.length > 0 &&
                    <TableRow classes={{head: classes.tableRowSuperHead}}>
                        <TableCell
                            classes={{root: classes.tableCellRoot}}
                        />
                        {Headers.flatMap((column, idx) => {
                            const selectedParentHeader = parentHeaders
                                .find(parentHeader =>
                                    [...Array(parentHeader.colspan)]
                                    .map((v, i) => (enableSelect ?
                                        i + parentHeader.idx :
                                        i + (parentHeader.idx - 1)))
                                    .includes(idx));
                            return selectedParentHeader ? (() => (
                                selectedParentHeader.idx === idx ?
                                    (
                                        <TableCell
                                            key={selectedParentHeader.header}
                                            colSpan={selectedParentHeader.colspan}
                                            align="center"
                                            padding="none"
                                            classes={{root: classes.tableCellRoot}}
                                        >
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            >
                                                {selectedParentHeader.header}
                                                {selectedParentHeader.helper}
                                            </span>
                                        </TableCell>
                                    ) : []
                            ))()
                                : (
                                    <TableCell
                                        key={column.header}
                                        classes={{root: classes.tableCellRoot}}
                                    />
                                );
                        })
                        }
                    </TableRow>
                }
                <TableRow classes={{head: classes.tableRowHead}}>
                    {enableSelect &&
                        <TableCell
                            align="center"
                            padding="checkbox"
                            style={{
                                borderColor: colors.tableRowBorder,
                                paddingRight: style.padding.tableCell || defaultPropsObj.padding.tableCell,
                                fontSize: style.fontSize.header || defaultPropsObj.fontSize.header,
                                width: '5%',
                                paddingLeft: '0px',
                            }}
                        >
                            {!enableRadioSelect &&
                                <Checkbox
                                    classes={{
                                        root: classes.root,
                                        checked: classes.checked,
                                    }}
                                    icon={customCheckboxIcon}
                                    checkedIcon={customCheckboxIcon}
                                    indeterminate={(selectedId.length > 0 &&
                                        selectedId.length < tblData.length)}
                                    checked={
                                        selectedId.length === tblData.length
                                    }
                                    onChange={(e, checked) => tblFunction
                                        .handleSelectAllClick(e, checked, tblData.map(n => n.id))}
                                />
                            }
                        </TableCell>
                    }
                    {Headers.map(column => (
                        <TableCell
                            key={column.header}
                            sortDirection={sortBy === column.header ? sorting : false}
                            style={{
                                borderColor: colors.tableRowBorder,
                                paddingRight: style.padding.tableCell
                                || defaultPropsObj.padding.tableCell,
                                fontSize: style.fontSize.header || defaultPropsObj.fontSize.header,
                                width: `${(calWidth(enableSelect, enableExpand)) / Headers.length}%`,
                            }}
                            align="center"
                        >
                            {column.canSort && enableSort ?
                                <TableSortLabel
                                    active={sortBy === column.header}
                                    direction={sorting}
                                    onClick={e => tblFunction.handleRequestSort(e, column.header)}
                                >
                                    <span style={{paddingLeft: '20px'}}>
                                        {column.headerLabel}
                                    </span>
                                </TableSortLabel>
                                :
                                <span>{column.headerLabel}</span>
                            }
                        </TableCell>
                    ))}
                    {enableExpand ?
                        <TableCell
                            align="center"
                            padding="checkbox"
                            style={{
                                borderColor: colors.tableRowBorder,
                                paddingRight: style.padding.tableCell || defaultPropsObj.padding.tableCell,
                                fontSize: style.fontSize.header || defaultPropsObj.fontSize.header,
                                width: '5%',
                            }}
                        /> :
                        <TableCell />
                    }
                </TableRow>
            </TableHead>
        );
    }
    const slicedTblData = tblData.slice(
        currentPage * itemsPerPage,
        (currentPage * itemsPerPage) + itemsPerPage
    );

    tableBodyCtx = (
        <TableBody>
            {
                tblData.length === 0 ?
                    <TableRow
                        classes={{
                            root: classes.tableRowBody,
                        }}
                    >
                        <TableCell
                            colSpan={calColSpan(enableSelect, enableExpand, Headers.length)}
                            style={{
                                border: 0,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                className={classes.emptyWording}
                            >
                                {noContentWording}
                            </Typography>
                        </TableCell>
                    </TableRow>
                    :
                    slicedTblData.map((n) => {
                        const isSelected = enableSelect ? selectedId.includes(n.id) : false;
                        let isRowSelected = enableSelect && enableRowSelectClick ?
                        rowSelectedId.includes(n.id) : false;
                        if (props.menuPosition.open && props.menuPosition.ip === n.id) {
                            isRowSelected  = true;
                        }
                        const isExpanded = enableExpand ? expandedId.includes(n.id) : false;
                        const radioProps = {
                            ...(Boolean(customRadioButtonIcon) ? {icon : customRadioButtonIcon} : {}),
                            ...(Boolean(customRadioButtonIcon) ? {checkedIcon : customRadioButtonIcon} : {}),
                        }
                        const checkbox = enableSelect && (
                            <TableCell
                                align="center"
                                // padding="checkbox"
                                key={`${n.id}_checkBox`}
                                style={{
                                    ...(enableExpand ? {border: 0} :
                                        {borderColor: colors.tableRowBorder}),
                                }}
                            >
                                {enableRadioSelect ?
                                    <Radio
                                        color="primary"
                                        checked={isSelected}
                                        {...radioProps}
                                        onClick={e => tblFunction.handleSelectRadioClick(e, n.id, n)}
                                        classes={{
                                            root: classes.root,
                                            checked: classes.checked,
                                        }}
                                    />
                                    :
                                    <Checkbox
                                        color="primary"
                                        checked={isSelected}
                                        icon={customCheckboxIcon}
                                        checkedIcon={customCheckboxIcon}
                                        onClick={e => tblFunction.handleSelectClick(e, n.id, n)}
                                        classes={{
                                            root: classes.root,
                                            checked: classes.checked,
                                        }}
                                    />
                                }
                            </TableCell>
                        );
                        const expandIcon = enableExpand && (
                            <TableCell
                                align="center"
                                padding="checkbox"
                                key={`${n.id}_expandIcon`}
                                style={{
                                    ...(enableExpand ? {border: 0} :
                                        {borderColor: colors.tableRowBorder}),
                                }}
                            >
                                <IconButton
                                    color="primary"
                                    onClick={e => tblFunction.handleExpand(e, n.id, n)}
                                >
                                    <i
                                        className="material-icons"
                                        style={{
                                            ...(isExpanded ? {
                                                transform: 'rotate(180deg)',
                                                transitionDuration: '0.2s',
                                            } :
                                                {
                                                    transform: 'rotate(0deg)',
                                                    transitionDuration: '0.2s',
                                                }),
                                        }}
                                    >keyboard_arrow_down
                                    </i>
                                </IconButton>
                            </TableCell>
                        );
                        const expandContent = enableExpand && (
                            <TableRow>
                                <TableCell
                                    style={{
                                        paddingBottom: 0,
                                        paddingTop: 0,
                                        ...(enableExpand ? {borderColor: colors.tableRowBorder} :
                                            {border: 0}),
                                    }}
                                    colSpan={calColSpan(enableSelect, enableExpand, Headers.length)}
                                >
                                    <Collapse
                                        in={isExpanded}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        {n.expanded}
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        );
                        const tabeCell = key =>
                            (
                                <TableCell
                                    key={key}
                                    style={{
                                        ...(enableExpand ? {border: 0} :
                                            {borderColor: colors.tableRowBorder}),
                                        userSelect: 'none',
                                        paddingRight:
                                            style.padding.tableCell
                                            || defaultPropsObj.padding.tableCell,
                                        fontSize:
                                            style.fontSize.body
                                            || defaultPropsObj.fontSize.body,
                                        maxHeight: '30px',
                                    }}
                                    onClick={enableRowSelectClick &&
                                        (e => tblFunction
                                        .handleRowSelectClick(e, n.id, tblData, n))}
                                    align="center"
                                >
                                    {key === 'sn' || key === 'mac' ?
                                        <span style={{padding: '0 5px'}}>
                                            {n[key]}
                                        </span> :
                                        n[key]
                                    }
                                </TableCell>
                            );
                        const tableCellCtx = enableHeader ?
                            Headers.map(column => tabeCell(column.header))
                            :
                            Object.keys(n).flatMap(key => (
                                key !== 'id' ? tabeCell(key) : []
                            ));
                        const tableRowCtx = (
                            <React.Fragment key={`tableRowCtx_${n.id}`}>
                                <TableRow
                                    tabIndex={-1}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    onContextMenu={enableContextMenu &&
                                        (e => tblFunction.handleContextMenu(e, n.id))
                                    }
                                    classes={{
                                        root: props.rowHoverEffect ? classes.tableRowBodyWithHoverEffect : classes.tableRowBody,
                                        selected: classes.tableRowBodySelected,
                                    }}
                                    selected={isRowSelected}
                                    style={style.tableRow || defaultPropsObj.tableRow}
                                >
                                    {checkbox}
                                    {tableCellCtx}
                                    {expandIcon}
                                </TableRow>
                                {expandContent}
                            </React.Fragment>
                        );
                        return tableRowCtx;
                    })
            }
        </TableBody>
    );

    tableCtx = (
        <div style={{overflowX: 'auto', overflowY: 'auto', width: maxWidth}}>
            <Table padding="none" style={{width: '100%', tableLayout: 'auto', borderCollapse: 'separate'}}>
                {tableHeadCtx}
                {tableBodyCtx}
            </Table>
        </div>
    );

    return !ready ? <span /> : enablePaper ? (
        <Paper
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
                ...(style.footer.height && {height: style.footer.height}),
            }}
        >
            {tableCtx}
            {footerCtx}
        </Paper>
    ) : (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
                ...(style.footer.height && {height: style.footer.height}),
            }}
        >
            {tableCtx}
            {footerCtx}
        </div>
    );
}

P2Table.propTypes = {
    tblHeaders: PropTypes.shape({
        parentHeaders: PropTypes.arrayOf(PropTypes.object),
        Headers: PropTypes.arrayOf(PropTypes.object),
        sortBy: PropTypes.string,
        sorting: PropTypes.string,
    }),
    tblFooter: PropTypes.shape({
        currentPage: PropTypes.number,
        itemsPerPage: PropTypes.number,
        helper: PropTypes.element,
        totalItems: PropTypes.number,
        rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
    }),
    tblData: PropTypes.arrayOf(PropTypes.object).isRequired,
    tblFunction: PropTypes.shape({
        handleRequestSort: PropTypes.func,
        handleSelectAllClick: PropTypes.func,
        handleSelectClick: PropTypes.func,
        handleChangeItemsPerPage: PropTypes.func,
        handleChangePage: PropTypes.func,
        handleContextMenu: PropTypes.func,
        handleSelectRadioClick: PropTypes.func,
        handleExpand: PropTypes.func,
        handleRowSelectClick: PropTypes.func,
    }),
    tblSelector: PropTypes.shape({
        selectedId: PropTypes.arrayOf(PropTypes.string),
        rowSelectedId: PropTypes.arrayOf(PropTypes.string),
        expandedId: PropTypes.arrayOf(PropTypes.string),
    }),
    tblToggle: PropTypes.shape({
        enableFooter: PropTypes.bool,
        enableHeader: PropTypes.bool,
        enableSort: PropTypes.bool,
        enableSelect: PropTypes.bool,
        enableHighlight: PropTypes.bool,
        enablePaper: PropTypes.bool,
        enableRadioSelect: PropTypes.bool,
        enableContextMenu: PropTypes.bool,
        enableRowSelectClick: PropTypes.bool,
        enableExpand: PropTypes.bool,
        customCheckboxIcon: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.node,
        ]),
        customRadioButtonIcon: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.node,
        ]),
        noContentWording: PropTypes.string,
    }),
    style: PropTypes.objectOf(PropTypes.object),
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    // t: PropTypes.func.isRequired,
    maxWidth: PropTypes.string,
    rowHoverEffect: PropTypes.bool,
    menuPosition: PropTypes.object,
};

P2Table.defaultProps = {
    tblHeaders: {
        parentHeaders: [],
        Headers: [],
        sortBy: '',
        sorting: '',
    },
    tblFooter: {
        totalItems: 0,
        itemsPerPage: 10,
        currentPage: 0,
        helper: <span />,
        rowsPerPageOptions: [5, 10, 25, 50, 100],
    },
    tblFunction: {
        handleRequestSort: () => null,
        handleSelectAllClick: () => null,
        handleSelectClick: () => null,
        handleChangePage: () => null,
        handleChangeItemsPerPage: () => null,
        handleContextMenu: () => null,
        handleSelectRadioClick: () => null,
        handleRowSelectClick: () => null,
        handleExpand: () => null,
    },
    tblSelector: {
        selectedId: [],
        rowSelectedId: [],
        expandedId: [],
    },
    tblToggle: {
        enableFooter: false,
        enableHeader: false,
        enableSort: false,
        enableSelect: false,
        enableHighlight: false,
        enablePaper: false,
        enableRadioSelect: false,
        enableContextMenu: false,
        enableRowSelectClick: false,
        customCheckboxIcon: false,
        customRadioButtonIcon: false,
        enableExpand: false,
        noContentWording: 'no Content',
    },
    style: defaultPropsObj,
    maxWidth: undefined,
    rowHoverEffect: false,
    menuPosition: {
        open: false,
        top: 0,
        left: 0,
        ip: '',
        type: '',
    },
};

const TestP2Table = P2Table;

export {TestP2Table};

// export {P2Table as CleanP2DevTbl};
export default withStyles(styles)(P2Table);
