/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-09-10 11:50:02
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-03 15:25:29
 * @ Description:
 */

import React, {useState} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
// import {connect} from 'react-redux';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import {
    Typography,
    MenuItem,
    IconButton,
    Menu,
    Fade,
    ListItemIcon,
    ListItemText,
    Checkbox
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AppsIcon from '@material-ui/icons/Apps';
import SearchIcon from '@material-ui/icons/Search';
import {ReactComponent as FunnelOutlineIcon} from '../../icon/svg/ic_funnel_outline2.svg';
import P2Table from '..//common/P2Table';
import Constant from '../../constants/common';
import P2Dialog from '../common/P2Dialog';
import P2SearchBar from '../common/P2SearchBar';
import P2Tooltip from '../common/P2Tooltip';


const {colors} = Constant;

const styles = {
    textAlignment: {
        textAlign: 'center',
    },
    buttonSize: {
        width: '100%',
        height: '100%',
    },
    buttonHeader: {
        fontSize: '36px',
        lineHeight: '42px',
    },
    buttonContent: {
        fontSize: '12px',
        lineHeight: '14px',
        padding: '10px 0',
    },
};

const createTypography = (title, style) => (
    <Typography style={style}>
        {title}
    </Typography>
);


function LinkAlignmentTableComponent(props) {
    const {
        t,
        // classes,
        neighborTableBar: {
            radioInfo,
            enableSearch,
            handleFilter,
            handleSearch,
            toggleSearch,
            filterKey,
            customizedColumn,
            toggleColumn,
        },
        neighborTableData: {
            tblHeaders,
            tblData,
            tblFunction,
            tblSelector,
            tblToggle,
        },
        style,
    } = props;
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [columnAnchorEl, setColumnAnchorEl] = useState(null);
    const filterAnchorElOpen = Boolean(filterAnchorEl);
    const columnAnchorElOpen = Boolean(columnAnchorEl);

    const handleClick = (event, key) => {
        if (key === 'filter') {
            setFilterAnchorEl(event.currentTarget);
        } else if (key === 'column') {
            setColumnAnchorEl(event.currentTarget);
        }
      };

    const handleClose = key => {
        if (key === 'filter') {
            setFilterAnchorEl(null);
        } else if (key === 'column') {
            setColumnAnchorEl(null);
        }
    };


    const filterOptions = [
        (
            <MenuItem key="all" onClick={() => {
                handleFilter('all');
                setFilterAnchorEl(null);
            }}>
                <span dangerouslySetInnerHTML={{__html: t('tableFilterAllNei')}} />
            </MenuItem>
        ),
        (
            <MenuItem key="selected" onClick={() => {
                handleFilter('selected');
                setFilterAnchorEl(null);
            }}>
                <span dangerouslySetInnerHTML={{__html: t('tableFilterSelectedNei')}} />
            </MenuItem>
        ),
        (
            <MenuItem key="focused" onClick={() => {
                handleFilter('focused');
                setFilterAnchorEl(null);
            }}>
                <span dangerouslySetInnerHTML={{__html: t('tableFilterFavNei')}} />
            </MenuItem>
        ),
    ];

    const columnOptions = [
        {id: 'indicator', label: 'Indicator (L/R)', translationKey: 'neiTblLabelIndicator'},
        {id: 'radioDevice', label: 'Radio', translationKey: 'neiTblLabelRadioDevice'},
        {id: 'hostname', label: 'Neighbor Hostname', translationKey: 'neiTblLabelHostname'},
        {id: 'mac', label: 'Neighbor MAC', translationKey: 'neiTblLabelMac'},
        {id: 'model', label: 'Neighbor Model', translationKey: 'neiTblLabelModel'},
        {id: 'rssiLocal', label: 'RSSI (Local)', translationKey: 'neiTblLabelRssiLocal'},
        {id: 'rssiChain', label: 'RSSI Chain', translationKey: 'neiTblLabelRssiChain'},
        {id: 'bitRateLocal', label: 'Data Rate (Local)', translationKey: 'neiTblLabelBitRateLocal'},
        {id: 'rssiRemote', label: 'RSSI (Remote)', translationKey: 'neiTblLabelRssiRemote'},
        {id: 'bitRateRemote', label: 'Data Rate (Remote)', translationKey: 'neiTblLabelBitRateRemote'},
    ]

    const tableBar = (
        <div style={{
            display: 'flex',
            paddingTop: '20px',
            margin: '0px 20px 20px',
            borderTop: `0.032em solid ${colors.tagTxt}`,
        }}
        >
            {enableSearch ?
                (
                    <P2SearchBar
                        // value={searchKey}
                        // onChange={(newSearchKey) => setSearchKey(newSearchKey)}
                        onRequestSearch={(newSearchKey) => {
                            handleSearch(newSearchKey);
                        }}
                        disableCloseButton
                    />
                ) : (
                    <span style={{display: 'flex', flexDirection: 'column', paddingLeft: '10px'}}>
                        <span style={{display: 'flex', alignItems: 'baseline'}}>
                            {createTypography(`${t('neighborTableLbl')} `,
                                {color: colors.dataTitle, fontSize: '24px', fontWeight: '500'})}
                            {createTypography(
                                `(${radioInfo})`,
                                {
                                    marginLeft: '5px',
                                    color: colors.deviceDescriptionHeader,
                                    fontSize: '15px',
                                    fontWeight: '500',
                                })}
                        </span>
                        {createTypography(t('neighborTableDesc'),
                            {display: 'flex', color: colors.deviceDescriptionHeader, fontSize: '15px'})}
                    </span>
                )
            }
            <div
                style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '10px',
                }}
            >
                <P2Tooltip
                    key={t('searchTooltip')}
                    direction="bottom"
                    title={t('searchTooltip')}
                    content={<IconButton
                        style={{padding: '7px'}}
                        key="search-tool-1"
                        aria-label="remove"
                        onClick={() => toggleSearch()}
                    >
                        {enableSearch ?
                            <CloseIcon style={{width: '24px', height: '24px'}} /> :
                            <SearchIcon style={{width: '24px', height: '24px'}} />
                        }
                    </IconButton>}
                />
                <P2Tooltip
                    key="funnelIconButton"
                    id="funnelIconButton"
                    title={t('filterTooltip')}
                    content={(
                        <IconButton
                            id="funnelIconImage"
                            style={{padding: '11px'}}
                            aria-label="remove"
                            onClick={(e) => handleClick(e, 'filter')}
                        >
                            <FunnelOutlineIcon
                                id="funnelIconImageSvg"
                                stroke={colors.popupMenuItem}
                                strokeWidth="1.5px"
                                width="17px"
                                height="17px"
                                fill={filterKey !== 'all' ? colors.popupMenuItem : '#ffffff00'}
                            />
                        </IconButton>
                    )}
                />
                <P2Tooltip
                    key="customize-column"
                    direction="bottom"
                    title={t('customizedColumnTooltip')}
                    content={<IconButton
                        style={{padding: '7px'}}
                        key="customize-column"
                        onClick={(e) => handleClick(e, 'column')}
                    >
                        <AppsIcon style={{width: '24px', height: '24px'}} />
                    </IconButton>}
                />
                <Menu
                    id="fade-menu-filter"
                    getContentAnchorEl={null}
                    anchorEl={filterAnchorEl}
                    keepMounted
                    open={filterAnchorElOpen}
                    onClose={() => handleClose('filter')}
                    TransitionComponent={Fade}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {filterOptions}
                </Menu>
                <Menu
                    id="fade-menu-customize-column"
                    getContentAnchorEl={null}
                    anchorEl={columnAnchorEl}
                    keepMounted
                    open={columnAnchorElOpen}
                    onClose={() => handleClose('column')}
                    TransitionComponent={Fade}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {columnOptions.map(option => (
                        <MenuItem key={option.id} style={{padding: '0px 10px'}} onClick={() => toggleColumn(option.id)}>
                            <ListItemIcon style={{minWidth: '44px'}}>
                                <Checkbox
                                    style={{padding: '5px'}}
                                    checked={customizedColumn.includes(option.id)}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText primary={t(option.translationKey)} />
                        </MenuItem>
                    ))}
                </Menu>
                {/* <Button
                    variant="contained"
                    onClick={handleExport}
                    color="primary"
                    autoFocus
                    disableRipple
                    disabled={isPolling || radioNeighborLength === 0}
                >
                    {t('exportLbl')}
                </Button> */}
            </div>
        </div>
    );

    const tableBody = (
        <div style={{
            display: 'flex',
            height: '100%',
        }}
        >
            <P2Table
                tblHeaders={tblHeaders}
                tblData={tblData}
                tblFunction={tblFunction}
                tblSelector={tblSelector}
                tblToggle={tblToggle}
                style={style}
            />
        </div>
    );

    return (
        <React.Fragment>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                color: 'white',
                fontSize: '50px',
            }}
            >
                {tableBar}
                <div style={{overflowY: 'auto'}}>
                    {tableBody}
                </div>
            </div>
            <P2Dialog
                open={props.dialog.open}
                handleClose={props.dialog.handleClose}
                title={props.dialog.title}
                content={props.dialog.content}
                actionTitle={props.dialog.submitButton}
                actionFn={props.dialog.submitAction}
            />
        </React.Fragment>
    );
}

LinkAlignmentTableComponent.propTypes = {
    dialog: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]).isRequired,
        content: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.element]
        ).isRequired,
        submitButton: PropTypes.string.isRequired,
        submitAction: PropTypes.func.isRequired,
    }).isRequired,
    // classes: PropTypes.objectOf(PropTypes.string).isRequired,
    neighborTableBar: PropTypes.shape({
        enableSearch: PropTypes.bool.isRequired,
        toggleSearch: PropTypes.func.isRequired,
        customizedColumn: PropTypes.arrayOf(PropTypes.string).isRequired,
        toggleColumn: PropTypes.func.isRequired,
        radioInfo: PropTypes.string.isRequired,
        handleFilter: PropTypes.func.isRequired,
        handleSearch: PropTypes.func.isRequired,
        filterKey: PropTypes.string.isRequired,
    }).isRequired,
    neighborTableData: PropTypes.shape({
        tblHeaders: PropTypes.shape({
            parentHeaders: PropTypes.arrayOf(PropTypes.object),
            Headers: PropTypes.arrayOf(PropTypes.object),
            sortBy: PropTypes.string,
            sorting: PropTypes.string,
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
        }),
        tblSelector: PropTypes.shape({
            selectedId: PropTypes.arrayOf(PropTypes.string),
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
        }),
    }).isRequired,
    t: PropTypes.func.isRequired,
    style: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default compose(
    withTranslation(['link-alignment']),
    withStyles(styles)
)(LinkAlignmentTableComponent);
