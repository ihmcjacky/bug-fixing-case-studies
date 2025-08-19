/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
* @Author: mango
* @Date:   2018-05-15T16:25:07+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-29T11:36:31+08:00
*/
import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {withTranslation} from 'react-i18next';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import InputBase from '@material-ui/core/InputBase';
import Chip from '@material-ui/core/Chip';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import P2Dialog from '../common/P2Dialog';
import {formValidator} from '../../util/inputValidator';
import P2PointsToNote from '../nodeMaintenances/P2PointsToNote';
import Constant from '../../constants/common';
import P2Tooltip from '../common/P2Tooltip';
import Transition from '../common/Transition';

function cloneMouseEvent(e) {
    const evt = document.createEvent('MouseEvent');
    evt.initMouseEvent(e.type, e.canBubble, e.cancelable, e.view, e.detail,
        e.screenX, e.screenY, e.clientX, e.clientY, false, e.altKey,
        e.shiftKey, e.metaKey, e.button, e.relatedTarget);
    return evt;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

const move = (source, destination, droppableSource, droppableDestination, selectedId) => {
    // console.log('move: ');
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const result = {};
    result.duplicateLabel = false;
    result.list = [];

    // check if there is duplicate Label
    if (selectedId.length <= 1) {
        const [removed] = sourceClone.splice(droppableSource.index, 1);
        const duplicateLabel = !destClone.every(macItem => macItem.label !== removed.label);
        if (duplicateLabel) {
            result[droppableSource.droppableId] = Array.from(source);
            result[droppableDestination.droppableId] = destClone;
            result.duplicateLabel = true;
            result.list = [removed.label];
            return result;
        }


        // check if there is duplicate id
        const duplicateId = !destClone.every(macItem => macItem.key !== removed.key);
        if (duplicateId) {
            const maxKey = Math.max(...destClone.map(data => data.key), 0);
            removed.key = (maxKey === 0 && destClone.length === 0) ? 0 : maxKey + 1;
        }
        destClone.splice(droppableDestination.index, 0, removed);
    } else {
        // console.log('MultipleMove');
        const removedArray = selectedId.map(key => sourceClone.splice(
            sourceClone.map(macItem => macItem.key).indexOf(key), 1)[0]);
        // console.log('sourceClone: ', sourceClone);
        // console.log('removedArray: ', removedArray);

        const duplicateLabel = !removedArray.every(removedMacItem => destClone
            .every(macItem => macItem.label !== removedMacItem.label));
        if (duplicateLabel) {
            result[droppableSource.droppableId] = Array.from(source);
            result[droppableDestination.droppableId] = destClone;
            result.duplicateLabel = true;
            result.list = removedArray.filter(removedMacItem => destClone
                .map(macItem => macItem.label).indexOf(removedMacItem.label) !== -1)
                .map(filterMacItem => filterMacItem.label);
            return result;
        }

        removedArray.forEach((removedMacItem, idx) => {
            const newRomovedMacItem = {...removedMacItem};
            const duplicateId = !destClone.every(macItem => macItem.key !== newRomovedMacItem.key);
            if (duplicateId) {
                const maxKey = Math.max(...destClone.map(data => data.key), 0);
                newRomovedMacItem.key = (maxKey === 0 && destClone.length === 0) ? 0 : maxKey + 1;
            }
            destClone.splice(droppableDestination.index + idx, 0, newRomovedMacItem);
        });
    }


    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const copy = (source, destination, droppableSource, droppableDestination, selectedId) => {
    // console.log('copy: ');
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const result = {};
    result.duplicateLabel = false;
    result.list = [];

    // check if there is duplicate Label
    if (selectedId.length <= 1) {
        const removed = JSON.parse(JSON.stringify(sourceClone[droppableSource.index]));
        const duplicateLabel = !destClone.every(macItem => macItem.label !== removed.label);
        if (duplicateLabel) {
            result[droppableDestination.droppableId] = destClone;
            result.duplicateLabel = true;
            result.list = [removed.label];
            return result;
        }


        // check if there is duplicate id
        const duplicateId = !destClone.every(macItem => macItem.key !== removed.key);
        if (duplicateId) {
            const maxKey = Math.max(...destClone.map(data => data.key), 0);
            removed.key = (maxKey === 0 && destClone.length === 0) ? 0 : maxKey + 1;
        }
        destClone.splice(droppableDestination.index, 0, removed);
    } else {
        const removedArray = selectedId.map(key => sourceClone.splice(
            sourceClone.map(macItem => macItem.key).indexOf(key), 1)[0]);
        // console.log('sourceClone: ', sourceClone);
        // console.log('removedArray: ', removedArray);

        const duplicateLabel = !removedArray.every(removedMacItem => destClone
            .every(macItem => macItem.label !== removedMacItem.label));
        if (duplicateLabel) {
            result[droppableSource.droppableId] = Array.from(source);
            result[droppableDestination.droppableId] = destClone;
            result.duplicateLabel = true;
            result.list = removedArray.filter(removedMacItem => destClone
                .map(macItem => macItem.label).indexOf(removedMacItem.label) !== -1)
                .map(filterMacItem => filterMacItem.label);
            return result;
        }

        removedArray.forEach((removedMacItem, idx) => {
            const newRomovedMacItem = {...removedMacItem};
            const duplicateId = !destClone.every(macItem => macItem.key !== newRomovedMacItem.key);
            if (duplicateId) {
                const maxKey = Math.max(...destClone.map(data => data.key), 0);
                newRomovedMacItem.key = (maxKey === 0 && destClone.length === 0) ? 0 : maxKey + 1;
            }
            destClone.splice(droppableDestination.index + idx, 0, newRomovedMacItem);
        });
    }

    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 1;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    outline: 'none',
    // change background colour if dragging
    // background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
});


const getListStyle = (isDraggingOver, radioNo) => ({
    background: isDraggingOver ? 'transparent' : 'transparent',
    // padding: grid,
    paddingRight: `calc(((100vw - 104px) / ${radioNo}) - 193px )`,
    height: 'inherit',
    // width: 'calc(90vw / 2 * 100%)',
});

const getEmptyListStyle = radioNo => ({
    padding: grid,
    width: `calc((100vw - 104px) / ${radioNo})`,
    // width: 'calc(90vw / 2 * 100%)',
});

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const {
    theme, colors,
} = Constant;

// theme.palette.text = {
//     primary: '#ffffff',
// };

const styles = {
    input: {
        paddingTop: '0px',
        paddingBottom: '0px',
    },
    chip: {
        margin: '6px',
        marginLeft: '0px',
        cursor: 'grab',
    },
    chipDragging: {
        margin: '6px',
        marginLeft: '0px',
        cursor: 'grab',
        opacity: '0.4',
    },
    deleteIcon: {
        color: theme.palette.primary.main,
        padding: '5px',
        margin: '0px !important',
        borderRadius: '100%',
        borderRight: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: colors.paperBackground,
        '&:hover': {
            backgroundColor: colors.paperBackground,
        },
    },
    deleteIconError: {
        color: colors.inactiveRed,
        padding: '5px',
        margin: '0px !important',
        borderRadius: '100%',
        borderRight: `1px solid ${colors.inactiveRed}`,
        backgroundColor: colors.paperBackground,
        '&:hover': {
            backgroundColor: colors.paperBackground,
        },
    },
    clickable: {
        backgroundColor: colors.paperBackground,
        color: theme.palette.primary.main,
        '&:active': {
            backgroundColor: theme.palette.primary.main,
            color: colors.paperBackground,
        },
    },
    clickableError: {
        backgroundColor: colors.paperBackground,
        color: colors.inactiveRed,
        borderColor: colors.inactiveRed,
        '&:active': {
            backgroundColor: colors.inactiveRed,
            color: colors.paperBackground,
        },
    },
    clickableSelected: {
        backgroundColor: theme.palette.primary.main,
        color: colors.paperBackground,
    },
    clickableErrorSelected: {
        backgroundColor: colors.inactiveRed,
        color: colors.paperBackground,
        borderColor: colors.inactiveRed,
    },
    inpuBase: {
        color: 'inherit',
        width: '110px',
        fontSize: '11px',
        cursor: 'pointer',
        paddingLeft: '5px',
        paddingRight: '5px',
        '&:active': {
            color: 'inherit',
        },
    },
    inpuBaseError: {
        color: 'inherit',
        width: '110px',
        fontSize: '11px',
        cursor: 'pointer',
        paddingLeft: '5px',
        paddingRight: '5px',
        '&:active': {
            color: 'inherit',
        },
    },
    label: {
        padding: '0px',
        color: theme.palette.primary.main,
        '&:active': {
            color: colors.paperBackground,
        },
    },
    labelError: {
        padding: '0px',
        color: colors.inactiveRed,
        '&:active': {
            color: colors.paperBackground,
        },
    },
    labelSelected: {
        padding: '0px',
        color: colors.paperBackground,
    },
    labelErrorSelected: {
        padding: '0px',
        color: colors.paperBackground,
    },
    Tab: {
        minHeight: '20px',
    },
    IconButton: {
        padding: '0px',
        color: '#212121',
    },
    popUpMACList: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
        height: 'calc(100vh - 48px)',
    },
    select: {
        '&:after': {
            borderBottom: '2px solid #FFFFFF',
        },
        '&:before': {
            borderBottom: '1px solid #FFFFFF',
        },
        '&:hover:not(.Mui-disabled):before': {
            borderColor: '#FFFFFF',
        },
        // '&::hover:before': {
        //     borderColor: 'white',
        // },
        // '&::hover:after': {
        //     borderColor: 'white',
        // },
    },
    selectIcon: {
        fill: 'white',
    },
};

class MACListDialog extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'updateRadioSettings',
            'createDeleteButton',
            'createMACInput',
            'checkMAC',
            'handleDelete',
            'checkRuntimeValue',
            'createRadioMACDnDList',
            'isNeighborNode',
            'handleDialogOnClose',
            'handleDeleteAll',
            'createDeleteAllButton',
            'handleReset',
            'createResetButton',
            'handleChange',
            'handleRemoveAll',
            'handleResetAll',
            'onDragStart',
            'onDragEnd',
            'getList',
            'onDraggableClick',
            'checkClearSelected',
            'move',
            'copy',
            'createDragCountView',
            'checkClose',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.t = this.props.t;
        this.copyMode = false;

        this.state = {
            dragging: false,
            radioSettings: {},
            loadRadioSettings: {},
            selectedId: {},
            id2List: {},
            dialog: {
                open: false,
                title: '',
                content: '',
                submitTitle: 'OK',
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
        };
    }

    componentDidMount() {
        this.updateRadioSettings();
    }

    componentWillUnmount() {
        // console.log('willUnMount: ', this.state.radioSettings);
    }


    onDragEnd(result) {
        const {source, destination} = result;
        const {selectedId} = this.state;
        // dropped outside the list
        if (!destination) {
            this.setState({
                dragging: false,
            });
            return;
        }
        // reorder same list
        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            this.setState({
                ...this.state,
                dragging: false,
                radioSettings: {
                    ...this.state.radioSettings,
                    [source.droppableId]: {
                        ...this.state.radioSettings[source.droppableId],
                        macAddressList: {
                            ...this.state.radioSettings[source.droppableId].macAddressList,
                            [this.state.id2List[source.droppableId]]: items,
                        },
                    },
                },
            });
        } else {
            // move list

            let radioSettings = {};
            let duplicate = {status: false, list: []};
            // console.log('before move or copy: ', this.state.radioSettings);
            if (this.copyMode) {
                ({radioSettings, duplicate} = this.copy(source, destination, selectedId[source.droppableId]));
                if (duplicate.status) {
                    const radioName = this.t(`radioTitle.${destination.droppableId}`);
                    const content = duplicate.list.length <= 1 ?
                        `${duplicate.list[0]} ${this.t('duplicateSingleEntryContent')} ${radioName}` : (
                            <React.Fragment>
                                <span>{`${this.t('duplicateEntriesContent')}  ${radioName} :`}</span>
                                <span style={{
                                    paddingTop: '10px',
                                    maxHeight: '20vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                }}
                                >
                                    {
                                        duplicate.list
                                        .map(mac => (
                                            <li key={mac} style={{width: '100%'}}>
                                                <span >
                                                    {mac}
                                                </span>
                                                <br />
                                            </li>)
                                        )
                                    }
                                </span>
                            </React.Fragment>
                        );
                    this.setState({
                        dragging: false,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: duplicate.list.length <= 1 ?
                                this.t('duplicateEntryTitle') :
                                this.t('duplicateEntriesTitle'),
                            content,
                            submitTitle: this.t('submitBtnTitle'),
                            submitFn: () => {
                                this.handleDialogOnClose();
                            },
                            cancelTitle: '',
                            cancelFn: this.handleDialogOnClose,
                        },
                    });
                    return;
                }
                this.copyMode = false;
            } else {
                ({radioSettings, duplicate} = this.move(source, destination, selectedId[source.droppableId]));
                if (duplicate.status) {
                    const radioName = this.t(`radioTitle.${destination.droppableId}`);
                    const content = duplicate.list.length <= 1 ?
                        `${duplicate.list[0]} ${this.t('duplicateSingleEntryContent')} ${radioName}` : (
                            <React.Fragment>
                                <span>{`${this.t('duplicateEntriesContent')}  ${radioName} :`}</span>
                                <span style={{
                                    paddingTop: '10px',
                                    maxHeight: '20vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                }}
                                >
                                    {
                                        duplicate.list
                                        .map(mac => (
                                            <li key={mac} style={{width: '100%'}}>
                                                <span >
                                                    {mac}
                                                </span>
                                                <br />
                                            </li>)
                                        )
                                    }
                                </span>
                            </React.Fragment>
                        );
                    this.setState({
                        dragging: false,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: duplicate.list.length <= 1 ?
                                this.t('duplicateEntryTitle') :
                                this.t('duplicateEntriesTitle'),
                            content,
                            submitTitle: this.t('submitBtnTitle'),
                            submitFn: () => {
                                this.handleDialogOnClose();
                            },
                            cancelTitle: '',
                            cancelFn: this.handleDialogOnClose,
                        },
                    });
                    return;
                }
            }

            if ((this.getList(destination.droppableId).length >= this.props.macMaxNo &&
            selectedId[source.droppableId].length === 0) ||
            (this.getList(destination.droppableId).length + selectedId[source.droppableId].length >
            this.props.macMaxNo && selectedId[source.droppableId].length > 0)) {
                this.setState({
                    ...this.state,
                    dragging: false,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('exccessMAXTitle'),
                        content: this.t('exccessMAXContent'),
                        submitTitle: this.t('submitBtnTitle'),
                        submitFn: () => {
                            this.handleDialogOnClose();
                        },
                        cancelTitle: '',
                        cancelFn: this.handleDialogOnClose,
                    },
                });
                return;
            }

            const clearSelectedId = {};
            Object.keys(this.props.radioSettings).forEach((radio) => {
                clearSelectedId[radio] = [];
            });

            this.setState({
                ...this.state,
                selectedId: clearSelectedId,
                radioSettings,
                dragging: false,
            // }, () => console.log('after move or copy: ', this.state.radioSettings));
            });
        }
    }

    onDraggableClick(e, radio, index) {
        // console.log('event: ', e);
        // console.log('selected radio: ', radio);
        // console.log('click index: ', index);
        // console.log('selected: ', this.state.selectedId[radio]);

        if (e.shiftKey) {
            const selectedId = [...this.state.selectedId[radio]];
            const selectedIdIndex = selectedId.indexOf(index);
            let newSelectedId = [];
            const {[radio]: selectedRadio, ...emptyRadio} = this.state.selectedId;
            Object.keys(emptyRadio).forEach((radioName) => { emptyRadio[radioName] = []; });
            const emptySelectedId = {...this.state.selectedId, ...emptyRadio};


            if (selectedIdIndex === -1) {
                newSelectedId = newSelectedId.concat(selectedId, index);
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

            this.setState({
                ...this.state,
                selectedId: {
                    ...emptySelectedId,
                    [radio]: newSelectedId,
                },
            });
        } else if (e.target.tagName.toUpperCase() !== 'I') {
            // console.log('single click: ', e);
            const {[radio]: selectedRadio, ...emptyRadio} = this.state.selectedId;
            Object.keys(emptyRadio).forEach((radioName) => { emptyRadio[radioName] = []; });
            const emptySelectedId = {...this.state.selectedId, ...emptyRadio};

            this.setState({
                ...this.state,
                selectedId: {
                    ...emptySelectedId,
                    [radio]: [index],
                },
            });
        }
    }

    onDragStart() {
        this.setState({dragging: true});
    }

    getList(id) {
        return this.state.radioSettings[id].macAddressList[this.state.id2List[id]];
    }

    copy(source, destination, selectedId) {
        let radioSettings = {};
        const duplicate = {status: false, list: []};
        const newResult = copy(
            this.getList(source.droppableId),
            this.getList(destination.droppableId),
            source,
            destination,
            selectedId
        );

        if (newResult.duplicateLabel) {
            duplicate.status = true;
            duplicate.list = newResult.list;
        }

        radioSettings = {
            ...this.state.radioSettings,
            [destination.droppableId]: {
                ...this.state.radioSettings[destination.droppableId],
                macAddressList: {
                    ...this.state.radioSettings[destination.droppableId].macAddressList,
                    [this.state.id2List[destination.droppableId]]: newResult[destination.droppableId],
                },
            },
        };

        return {radioSettings, duplicate};
    }

    move(source, destination, selectedId) {
        let radioSettings = {};
        const duplicate = {status: false, list: []};
        const newResult = move(
            this.getList(source.droppableId),
            this.getList(destination.droppableId),
            source,
            destination,
            selectedId
        );

        if (newResult.duplicateLabel) {
            duplicate.status = true;
            duplicate.list = newResult.list;
        }

        radioSettings = {
            ...this.state.radioSettings,
            [source.droppableId]: {
                ...this.state.radioSettings[source.droppableId],
                macAddressList: {
                    ...this.state.radioSettings[source.droppableId].macAddressList,
                    [this.state.id2List[source.droppableId]]: newResult[source.droppableId],
                },
            },
            [destination.droppableId]: {
                ...this.state.radioSettings[destination.droppableId],
                macAddressList: {
                    ...this.state.radioSettings[destination.droppableId].macAddressList,
                    [this.state.id2List[destination.droppableId]]: newResult[destination.droppableId],
                },
            },
        };

        return {radioSettings, duplicate};
    }

    updateRadioSettings() {
        const {id2List} = this.state;
        Object.keys(this.props.radioSettings).forEach((radio) => {
            id2List[radio] = this.props.radioSettings[radio].type;
        });

        const radioSettings = {};
        const loadRadioSettings = {};
        const selectedId = {};
        Object.keys(this.props.radioSettings).forEach((radio) => {
            selectedId[radio] = [];
            radioSettings[radio] = {};
            radioSettings[radio].macAddressList = JSON.parse(JSON.stringify(
                this.props.radioSettings[radio].macAddressList));
            radioSettings[radio].type = this.props.radioSettings[radio].type;
        });

        Object.keys(this.props.loadData).forEach((radio) => {
            loadRadioSettings[radio] = {};
            loadRadioSettings[radio].macAddressList = JSON.parse(JSON.stringify(
                this.props.loadData[radio].macAddressList));
            loadRadioSettings[radio].type = this.props.loadData[radio].type;
        });

        this.setState({
            ...this.state,
            selectedId,
            id2List,
            radioSettings,
            loadRadioSettings,
        // }, () => console.log('updateRadioSettings: ', this.state));
        });
    }

    handleRemoveAll() {
        const {radioSettings} = this.state;
        const removeAll = () => {
            Object.keys(radioSettings).forEach((radio) => {
                if (radioSettings[radio].type !== 'none') {
                    radioSettings[radio].macAddressList[radioSettings[radio].type] = [];
                }
            });
            this.setState({
                ...this.state,
                radioSettings,
            }, () => this.handleDialogOnClose());
        };
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('deleteAllTitle'),
                content: this.t('deleteAllContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => { removeAll(); },
                cancelTitle: this.t('cancelBtnTitle'),
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    handleSaveEntries(radioSettings, loadRadioSettings) {
        const disableSave = !Object.keys(radioSettings).every((radioName) => {
            if (radioSettings[radioName].type === 'none') {
                return true;
            } else if (radioSettings[radioName]
                .macAddressList[radioSettings[radioName].type].length === 0) {
                return false;
            }
            return radioSettings[radioName]
                .macAddressList[radioSettings[radioName].type]
                .every(mac => !mac.error);
        });
        if (disableSave) {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('popUpSaveWarnTitle'),
                    content: this.t('popUpSaveWarnContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        } else {
            console.log('handleSaveEntries(radioSettings): ', radioSettings);
            console.log('handleSaveEntries(loadRadioSettings): ', loadRadioSettings);
            this.props.savePopUpEntries(radioSettings, loadRadioSettings);
        }
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    handleResetAll() {
        const reset = () => {
            console.log('resetAll: ', this.state.loadRadioSettings);
            const selectedId = {};
            Object.keys(this.props.radioSettings).forEach((radio) => {
                selectedId[radio] = [];
            });
            this.setState({
                radioSettings: JSON.parse(JSON.stringify(this.state.loadRadioSettings)),
                selectedId,
            // }, () => console.log(this.state.radioSettings));
            });
        };

        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('resetDialogTitle'),
                content: this.t('resetDialogContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    reset();
                    this.handleDialogOnClose();
                },
                cancelTitle: this.t('cancelBtnTitle'),
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    handleAdd(radioName, radioType) {
        const chipData = [...this.state.radioSettings[radioName].macAddressList[radioType]];
        if (chipData.length < 6) {
            const maxKey = Math.max(...chipData.map(data => data.key), 0);
            chipData.push(
                {
                    key: (maxKey === 0 && chipData.length === 0) ? 0 : maxKey + 1,
                    label: '',
                    error: true,
                    hostname: '-',
                    neighborNode: false,
                }
            );
            this.setState({
                ...this.state,
                radioSettings: {
                    ...this.state.radioSettings,
                    [radioName]: {
                        ...this.state.radioSettings[radioName],
                        macAddressList: {
                            ...this.state.radioSettings[radioName].macAddressList,
                            [radioType]: chipData,
                        },
                    },
                },
            });
        } else {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('exccessMAXTitle'),
                    content: this.t('exccessMAXContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    createAddButton(radioName, radioType) {
        const content = (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleAdd(radioName, radioType)}
                aria-label="Add"
                classes={{
                    root: this.props.classes.IconButton,
                }}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '26px', color: 'white'}}
                >add_circle</i>
            </IconButton>
        );
        return radioType === 'none' ? (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                aria-label="Add"
                classes={{
                    root: this.props.classes.IconButton,
                }}
                disabled
            >
                <i
                    className="material-icons"
                    style={{fontSize: '26px', color: 'gray'}}
                >add_circle</i>
            </IconButton>
        )
            :
            (
                <P2Tooltip
                    title={`${this.t('addMACTo')}${this.t(`radioTitle.${radioName}`)}`}
                    content={content}
                    key="addBtn"
                />
            );
    }

    handleDeleteAll(radioName, radioType) {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('deleteAllTitle'),
                content: this.t('deleteAllContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    this.setState({
                        ...this.state,
                        radioSettings: {
                            ...this.state.radioSettings,
                            [radioName]: {
                                ...this.state.radioSettings[radioName],
                                macAddressList: {
                                    ...this.state.radioSettings[radioName].macAddressList,
                                    [radioType]: [],
                                },
                            },
                        },
                    }, () => {
                        this.handleDialogOnClose();
                    });
                },
                cancelTitle: this.t('cancelBtnTitle'),
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    createDeleteAllButton(radioName, radioType, length) {
        const disable = length === 0 ? true : null;
        const content = (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleDeleteAll(radioName, radioType)}
                classes={{
                    root: this.props.classes.IconButton,
                }}
                disabled={disable}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '26px', color: 'white'}}
                >delete</i>
            </IconButton>
        );
        return disable ? (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleDeleteAll(radioName, radioType)}
                classes={{
                    root: this.props.classes.IconButton,
                }}
                disabled={disable}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '26px', color: 'gray'}}
                >delete</i>
            </IconButton>
        ) :
            (
                <P2Tooltip
                    title={`${this.t('clearMAC')}${this.t(`radioTitle.${radioName}`)}`}
                    content={content}
                    key="deleteAllBtn"
                />
            );
    }

    handleChange(e, type, radioName) {
        if (type === 'type') {
            this.setState({
                ...this.state,
                id2List: {
                    ...this.state.id2List,
                    [radioName]: e.target.value,
                },
                radioSettings: {
                    ...this.state.radioSettings,
                    [radioName]: {
                        ...this.state.radioSettings[radioName],
                        type: e.target.value,
                    },
                },
            });
        }
    }

    isNeighborNode(mac) {
        let isNeighborNode = false;
        const {macToIpMap, macToHostnameMap} = this.props;
        console.log(macToIpMap);
        // search for ip from hostname
        const hostname = macToHostnameMap[mac] || '-';
        if (hostname !== '-') {
            const ipv4 = macToIpMap[mac] || '-';
            Object.keys(this.props.edges).some((edge) => {
                if (this.props.edges[edge].from === this.props.nodes[0].ipv4 &&
                    this.props.edges[edge].to === ipv4) {
                    isNeighborNode = true;
                    return true;
                }
                if (this.props.edges[edge].to === this.props.nodes[0].ipv4 &&
                    this.props.edges[edge].from === ipv4) {
                    isNeighborNode = true;
                    return true;
                }
                return false;
            });
        }
        return isNeighborNode ? {
            hostname: `${hostname} *`,
            neighborNode: true,
        } :
            {
                hostname,
                neighborNode: false,
            };
    }

    checkRuntimeValue(value, key, radioName, radioType) {
        const {configOptionType} = this.props;
        const macRegex = new RegExp(configOptionType[radioName].acl.data.maclist.data.data);
        const macList = [...this.state.radioSettings[radioName]
            .macAddressList[radioType]];
        const newMacList = macList.map((mac) => {
            const newMAC = {...mac};
            if (newMAC.key === key) {
                newMAC.error = !formValidator('matchRegex', value, macRegex).result || macList
                .filter(checkMAC => checkMAC.key !== key)
                .map(checkMAC => checkMAC.label)
                .indexOf(value) !== -1;
                const {hostname, neighborNode} = this.isNeighborNode(value);
                newMAC.hostname = hostname;
                newMAC.neighborNode = neighborNode;
            } else {
                newMAC.error = !formValidator('matchRegex', newMAC.label, macRegex).result ||
                !macList
                .filter(cloneMac => cloneMac.key !== newMAC.key)
                .every(cloneMac => cloneMac.label !== newMAC.label);
            }
            return newMAC;
        });
        this.setState({
            ...this.state,
            radioSettings: {
                ...this.state.radioSettings,
                [radioName]: {
                    ...this.state.radioSettings[radioName],
                    macAddressList: {
                        ...this.state.radioSettings[radioName].macAddressList,
                        [radioType]: newMacList,
                    },
                },
            },
        });
    }


    checkMAC(event, key, radioName, radioType) {
        const targetValue = event.target.value;
        const newChipData = this.state.radioSettings[radioName].macAddressList[radioType].map((mac) => {
            const newMAC = {...mac};
            if (newMAC.key === key) {
                newMAC.label = targetValue.toUpperCase();
            }
            return newMAC;
        });

        this.setState({
            ...this.state,
            radioSettings: {
                ...this.state.radioSettings,
                [radioName]: {
                    ...this.state.radioSettings[radioName],
                    macAddressList: {
                        ...this.state.radioSettings[radioName].macAddressList,
                        [radioType]: newChipData,
                    },
                },
            },
        }, () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.checkRuntimeValue(targetValue.toUpperCase(), key, radioName, radioType);
            }, 500);
        });
    }

    createMACInput(chipData, radioName, radioType) {
        const root = chipData.error ? this.props.classes.inpuBaseError :
            this.props.classes.inpuBase;
        const createEllipsis = hostname => (hostname.slice(-1) === '*' ? (<span style={{
            fontSize: '10px',
            display: 'inline-flex',
        }}
        >
            <span
                style={{
                    width: '80px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                }}
            >
                {hostname.slice(0, -1)}
            </span>
            <span>*</span>
        </span>
        )
            :
            (
                <span style={{
                    width: '80px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                    fontSize: '10px',
                }}
                >
                    {hostname}
                </span>
            ));
        return (
            <span style={{display: 'block', textAlign: 'center'}}>
                <InputBase
                    autoFocus
                    classes={{
                        root,
                        input: this.props.classes.input,
                    }}
                    inputProps={{
                        spellCheck: false,
                        maxLength: '17',
                    }}
                    onChange={event => this.checkMAC(event, chipData.key, radioName, radioType)}
                    value={chipData.label}
                /><br />
                {chipData.hostname.length > 15 ? <P2Tooltip
                    direction="bottom"
                    title={chipData.hostname}
                    content={createEllipsis(chipData.hostname)}
                /> : <span style={{fontSize: '10px'}}>{chipData.hostname}</span>}
            </span>
        );
    }

    handleDelete(event, radioName, radioType) {
        // console.log('handleDelete: ', event);
        const chipData = [...this.state.radioSettings[radioName].macAddressList[radioType]];
        const deleteLabel = chipData.find(mac => mac.key.toString() === event.currentTarget.id).label;
        const splicedChipData = chipData.filter(mac => mac.key.toString() !== event.currentTarget.id);
        const duplicateLabelChipData = splicedChipData.filter(mac => mac.label === deleteLabel);
        this.setState({
            ...this.state,
            radioSettings: {
                ...this.state.radioSettings,
                [radioName]: {
                    ...this.state.radioSettings[radioName],
                    macAddressList: {
                        ...this.state.radioSettings[radioName].macAddressList,
                        [radioType]: splicedChipData,
                    },
                },
            },
        // }, () => console.log(this.state.radioSettings[radioName].macAddressList[radioType]));
        }, () => {
            if (duplicateLabelChipData.length > 0) {
                duplicateLabelChipData.forEach((mac) => {
                    console.log('duplicateLabelChipData(mac):', mac);
                    this.checkRuntimeValue(mac.label, mac.key, radioName, radioType);
                });
            }
        });
    }

    createDeleteButton(chipData, radioName, radioType) {
        const root = chipData.error ? this.props.classes.deleteIconError :
            this.props.classes.deleteIcon;
        return (
            <IconButton
                classes={{
                    root,
                }}
                onClick={(e) => { this.handleDelete(e, radioName, radioType); }}
                aria-label="delete"
                id={chipData.key}
            >
                <i
                    className="material-icons"
                    style={{
                        fontSize: '20px',
                    }}
                >remove</i>
            </IconButton>
        );
    }

    createDragCountView(chipData, count) {
        const root = chipData.error ? this.props.classes.deleteIconError :
            this.props.classes.deleteIcon;
        return (
            <IconButton
                classes={{
                    root,
                }}
                aria-label="dragCount"
                id={chipData.key}
            >
                <span
                    style={{
                        height: '20px',
                        width: '20px',
                    }}
                >
                    <Typography
                        style={{
                            marginTop: '-4px',
                            display: 'flex',
                            justifyContent: 'center',
                            // flexWrap: 'wrap',
                            // alignItems: 'start',
                            // backgroundColor: 'white',
                            fontSize: '20px',
                            color: chipData.error ? colors.inactiveRed :
                                theme.palette.primary.main,
                        }}
                    >
                        {count}
                    </Typography>
                </span>
            </IconButton>
        );
    }


    handleReset(radioName) {
        this.setState({
            ...this.state,
            radioSettings: {
                ...this.state.radioSettings,
                [radioName]: this.props.radioSettings[radioName],
            },
        });
    }

    createResetButton(radioName) {
        const content = (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleReset(radioName)}
                classes={{
                    root: this.props.classes.IconButton,
                }}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '26px', color: 'white'}}
                >refresh</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={`${this.t('resetMAC1')}${this.t(`radioTitle.${radioName}`)}${this.t('resetMAC2')}`}
                content={content}
                key="resetBtn"
            />
        );
    }

    // createRadioMACList(radioSettings, radio, radioType) {
    //     return radioSettings[radio].macAddressList[radioType].length === 0 ? (
    //         <div>
    //             <Typography
    //                 style={{
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                     flexWrap: 'wrap',
    //                     height: 'calc(65vh - 45px)',
    //                     alignItems: 'center',
    //                     backgroundColor: 'white',
    //                     fontSize: '25px',
    //                     color: 'gray',
    //                 }}
    //             >
    //                 {this.t('noEntryTitle')}
    //             </Typography>
    //         </div>
    //     ) :
    //         (
    //             <div
    //                 style={{
    //                     display: 'flex',
    //                     justifyContent: 'start',
    //                     flexWrap: 'wrap',
    //                     height: 'calc(65vh - 65px)',
    //                     alignContent: 'flex-start',
    //                     backgroundColor: 'white',
    //                     padding: '10px 20px 10px 20px',

    //                 }}
    //             >
    //                 {radioSettings[radio].macAddressList[radioType].map((data) => {
    //                     const outlinedPrimary = data.error ? this.props.classes.clickableError :
    //                         this.props.classes.clickable;
    //                     return (
    //                         <Chip
    //                             variant="outlined"
    //                             color="primary"
    //                             // clickable
    //                             key={data.key}
    //                             label={this.createMACInput(data, radio, radioType)}
    //                             icon={this.createDeleteButton(data, radio, radioType)}
    //                             classes={{
    //                                 root: this.props.classes.chip,
    //                                 outlinedPrimary,
    //                                 label: data.error ?
    //                                     this.props.classes.labelError :
    //                                     this.props.classes.label,
    //                             }}
    //                         />
    //                     );
    //                 })}
    //             </div>
    //         );
    // }

    checkClearSelected(radio, key) {
        const {selectedId} = this.state;
        let newSelectedId = {};
        // check no. of radio to deselected
        if (selectedId[radio].indexOf(key) === -1) {
            // deselected all radio
            Object.keys(selectedId).forEach((radioName) => { selectedId[radioName] = []; });
            newSelectedId = {...selectedId};
        } else {
            // deselected all radio except current radio
            const {[radio]: selectedRadio, ...emptyRadio} = selectedId;
            Object.keys(emptyRadio).forEach((radioName) => { emptyRadio[radioName] = []; });
            newSelectedId = {...selectedId, ...emptyRadio};
        }

        this.setState({
            ...this.state,
            selectedId: newSelectedId,
        });
    }

    createRadioMACDnDList(radioSettings, radio, radioType, totalRadio) {
        const {selectedId} = this.state;
        const {r, g, b} = hexToRgb(colors.inactiveRed);
        return radioSettings[radio].macAddressList[radioType].length === 0 ? (
            <Droppable droppableId={radio} key={radio}>
                {provided => (
                    <div
                        ref={provided.innerRef}
                        style={getEmptyListStyle(totalRadio)}
                    >
                        <Typography
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                height: 'calc(65vh - 45px)',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                fontSize: '25px',
                                color: `rgba(${r}, ${g}, ${b}, 0.4)`,
                                fontWeight: '300',
                                userSelect: 'none',
                            }}
                        >
                            {this.t('noEntryTitle')}
                        </Typography>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        ) :
            (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'start',
                        flexWrap: 'wrap',
                        height: 'calc(65vh - 65px)',
                        alignContent: 'flex-start',
                        backgroundColor: 'white',
                        padding: '10px 20px 10px 20px',
                        overflowY: 'auto',
                    }}
                >
                    <Droppable droppableId={radio} key={radio}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver, totalRadio)}
                            >
                                {
                                    radioType !== 'none' ? radioSettings[radio].macAddressList[radioType]
                                        .map((item, index) => (
                                            <Draggable
                                                key={`${radio}_${item.key.toString()}`}
                                                draggableId={`${radio}_${item.key.toString()}`}
                                                index={index}
                                            >
                                                {(innerProvided, innerSnapshot) => {
                                                    const onMouseDown = (() => {
                                                        if (!innerProvided.dragHandleProps) {
                                                            return () => console.log('no dragHandleProps');
                                                        }
                                                        // creating a new onMouseDown function that calls myOnMouseDown
                                                        // as well as the drag handle one.
                                                        return (event) => {
                                                            if (event.target.tagName.toUpperCase() !== 'INPUT' &&
                                                            event.target.tagName.toUpperCase() !== 'I' &&
                                                            !event.shiftKey) {
                                                                this.checkClearSelected(radio, item.key);
                                                                const newEvent = cloneMouseEvent(event);
                                                                this.copyMode = event.ctrlKey;
                                                                innerProvided.dragHandleProps.onMouseDown(newEvent);
                                                            }
                                                        };
                                                    })();

                                                    const outlinedPrimary = selectedId[radio].indexOf(item.key) !== -1 ?
                                                        this.props.classes.clickableSelected :
                                                        this.props.classes.clickable;
                                                    const label = selectedId[radio].indexOf(item.key) !== -1 ?
                                                        this.props.classes.labelSelected :
                                                        this.props.classes.label;
                                                    const outlinedPrimaryError =
                                                        selectedId[radio].indexOf(item.key) !== -1 ?
                                                            this.props.classes.clickableErrorSelected :
                                                            this.props.classes.clickableError;
                                                    const labelError = selectedId[radio].indexOf(item.key) !== -1 ?
                                                        this.props.classes.labelErrorSelected :
                                                        this.props.classes.labelError;
                                                    const root = (selectedId[radio].indexOf(item.key) !== -1 &&
                                                        !innerSnapshot.isDragging &&
                                                        this.state.dragging &&
                                                        this.state.selectedId[radio].length > 1) ?
                                                        this.props.classes.chipDragging :
                                                        this.props.classes.chip;

                                                    return (
                                                        <div
                                                            ref={innerProvided.innerRef}
                                                            {...innerProvided.draggableProps}
                                                            {...innerProvided.dragHandleProps}
                                                            style={getItemStyle(
                                                                innerSnapshot.isDragging,
                                                                innerProvided.draggableProps.style
                                                            )}
                                                            onMouseDown={onMouseDown}
                                                            onClick={e => this.onDraggableClick(e, radio, item.key)}
                                                        >
                                                            <Chip
                                                                variant="outlined"
                                                                color="primary"
                                                                // clickable
                                                                key={item.key}
                                                                label={this.createMACInput(item, radio, radioType)}
                                                                icon={innerSnapshot.isDragging &&
                                                                    this.state.selectedId[radio].length > 1 ?
                                                                    this.createDragCountView(item,
                                                                        this.state.selectedId[radio].length) :
                                                                    this.createDeleteButton(item, radio, radioType)}
                                                                classes={{
                                                                    root,
                                                                    outlinedPrimary: item.error ?
                                                                        outlinedPrimaryError :
                                                                        outlinedPrimary,
                                                                    label: item.error ?
                                                                        labelError :
                                                                        label,
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }}
                                            </Draggable>
                                        )
                                        ) : <span />
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            );
    }

    checkClose() {
        const {radioSettings, loadRadioSettings} = this.state;
        if (JSON.stringify(radioSettings) !== JSON.stringify(loadRadioSettings)) {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('checkDifferentTitle'),
                    content: this.t('checkDifferentContent'),
                    submitTitle: this.t('yesTitle'),
                    submitFn: () => {
                        this.handleResetAll();
                        this.props.handlePopUpList(false);
                    },
                    cancelTitle: this.t('noTitle'),
                    cancelFn: this.handleDialogOnClose,
                },
            });
        } else {
            this.handleResetAll();
            this.props.handlePopUpList(false);
        }
    }

    render() {
        const {classes, nodes} = this.props;
        const {radioSettings, loadRadioSettings} = this.state;
        const closeIconButton = (
            <div>
                <IconButton
                    color="inherit"
                    aria-label="Back"
                    onClick={this.checkClose}
                >
                    <i
                        className="material-icons"
                        // style={{fontSize: '20px', color: '#ffffff'}}
                    >clear</i>
                </IconButton>
            </div>
        );

        const closeButton = (
            <P2Tooltip
                title={this.t('closeLbl')}
                content={closeIconButton}
            />
        );

        const disableSave = !Object.keys(radioSettings).every((radioName) => {
            if (radioSettings[radioName].type === 'none') {
                return true;
            } else if (radioSettings[radioName]
                .macAddressList[radioSettings[radioName].type].length === 0) {
                return false;
            }
            return radioSettings[radioName]
                .macAddressList[radioSettings[radioName].type]
                .every(mac => !mac.error);
        }) ? true : null;

        const savePopUpEntriesIconButton = (
            <div>
                <IconButton
                    color="inherit"
                    aria-label="SavePopUp"
                    onClick={() => this.handleSaveEntries(radioSettings, loadRadioSettings)}
                    disabled={disableSave}
                >
                    <i
                        className="material-icons"
                        // style={{fontSize: '20px', color: '#ffffff'}}
                    >save</i>
                </IconButton>
            </div>
        );

        const savePopUpEntriesButton = (
            <P2Tooltip
                title={this.t('saveChangeLbl')}
                content={savePopUpEntriesIconButton}
            />
        );

        const removePopUpEntriesIconButton = (
            <div>
                <IconButton
                    color="inherit"
                    aria-label="RemovePopUp"
                    disabled={this.state.disableCloseBtn}
                    onClick={() => this.handleRemoveAll()}
                >
                    <i
                        className="material-icons"
                        // style={{fontSize: '20px', color: '#ffffff'}}
                    >delete</i>
                </IconButton>
            </div>
        );

        const removePopUpEntriesButton = (
            <P2Tooltip
                title={this.t('removeEntriesLbl')}
                content={removePopUpEntriesIconButton}
            />
        );

        const resetAllIconButton = (
            <div>
                <IconButton
                    color="inherit"
                    aria-label="resetAll"
                    onClick={() => this.handleResetAll()}
                >
                    <i
                        className="material-icons"
                        // style={{fontSize: '20px', color: '#ffffff'}}
                    >refresh</i>
                </IconButton>
            </div>
        );

        const resetAllButton = (
            <P2Tooltip
                title={this.t('resetAllLbl')}
                content={resetAllIconButton}
            />
        );

        const totalRadio = Object.keys(radioSettings).length;

        console.log('Radio Settings ACL: ', radioSettings);
        const radioMACList = Object.keys(radioSettings).map((radio, idx) => (
            <div
                style={{
                    flexGrow: '1',
                    width: '30vw',
                    borderLeft: idx !== 0 ? `1px solid ${theme.palette.primary.main}` : '0px',
                    boxShadow: '0px 2px 2px rgba(68, 68, 68, 0.30)',
                }}
                key={radio}
            >
                <div style={{
                    backgroundColor: theme.palette.primary.light,
                    display: 'flex',
                    height: '45px',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                }}
                >
                    <Typography variant="h6" style={{color: 'white'}}>
                        {this.t(`radioTitle.${radio}`)}
                    </Typography>
                    <div style={{marginLeft: 'auto', display: 'block'}}>
                        <Select
                            value={radioSettings[radio].type}
                            onChange={e => this.handleChange(e, 'type', radio)}
                            inputProps={{
                                name: 'type',
                                id: 'type',
                                classes: {
                                    icon: classes.selectIcon,
                                    // underline: classes.select,
                                },
                            }}
                            displayEmpty
                            className={classes.select}
                            style={{color: 'white'}}
                        >
                            {
                                this.props.configOptionType[radio].acl.data.type.data.map(item => (
                                    <MenuItem
                                        value={item.actualValue}
                                        key={item.actualValue}
                                    >{item.displayValue}</MenuItem>
                                ))
                            }
                        </Select>
                        {this.createAddButton(radio, radioSettings[radio].type)}
                        {/* {this.createResetButton(radio)} */}
                        {radioSettings[radio].type !== 'none' && this.createDeleteAllButton(radio,
                            radioSettings[radio].type, radioSettings[radio]
                            .macAddressList[radioSettings[radio].type].length)}
                    </div>
                </div>
                {
                    radioSettings[radio].type === 'none' ? (
                        // <div
                        //     style={{
                        //         display: 'flex',
                        //         justifyContent: 'center',
                        //         flexWrap: 'wrap',
                        //         height: 'calc(65vh - 45px)',
                        //         alignItems: 'center',
                        //         backgroundColor: 'rgba(33, 33, 33, 0.09)',
                        //         fontSize: '25px',
                        //     }}
                        // >
                        <Droppable droppableId={radio} isDropDisabled key={radio}>
                            {provided => (
                                <div
                                    ref={provided.innerRef}
                                    style={getEmptyListStyle(totalRadio)}
                                >
                                    <Typography
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            flexWrap: 'wrap',
                                            height: 'calc(65vh - 45px)',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(33, 33, 33, 0.09)',
                                            fontSize: '25px',
                                            color: 'gray',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        // </div>
                    ) :
                        this.createRadioMACDnDList(radioSettings, radio, radioSettings[radio].type, totalRadio)
                }
            </div>
        ));

        return (
            <Dialog
                fullScreen
                open={this.props.open}
                // onClose={this.props.close}
                TransitionComponent={Transition}
                disableBackdropClick
                disableEscapeKeyDown
            >
                <MuiThemeProvider theme={theme}>
                    <AppBar style={{position: 'relative'}}>
                        <Toolbar style={{minHeight: 'auto', paddingLeft: '10px', paddingRight: '10px'}}>
                            {closeButton}
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                }}
                            >
                                <Typography variant="h6" color="inherit">
                                    {`${this.t('menubarLbl')} `}
                                </Typography>
                                <Typography style={{marginLeft: '5px'}} variant="subtitle2" color="inherit">
                                    {` (${nodes[0].hostname}, ${nodes[0].mac})`}
                                </Typography>
                            </span>
                            <div style={{flex: 1}} />
                            {savePopUpEntriesButton}
                            {resetAllButton}
                            {removePopUpEntriesButton}
                        </Toolbar>
                    </AppBar>
                    <DialogContent style={{backgroundColor: colors.background, padding: 0}}>
                        <Grid
                            container
                            className={classes.popUpMACList}
                            spacing={1}
                            justify="flex-start"
                            alignItems="stretch"
                        >
                            <div style={{marginTop: '2vh', marginBottom: '2vh'}}>
                                <P2PointsToNote
                                    noteTitle={this.t('noteTitle')}
                                    style={{
                                        fwNoteGrid: {
                                            fontSize: 16,
                                            marginTop: '20px',
                                        },
                                        fwNoteTitle: {
                                            marginBottom: '10px',
                                            fontSize: 16,
                                        },
                                        fwNoteItem: {
                                            fontWeight: 400,
                                            fontSize: 14,
                                        },
                                    }}
                                    noteCtxArr={[
                                        {ctx: this.t('cwFwNote1'), key: this.t('cwFwNote1')},
                                        {ctx: this.t('cwFwNote2'), key: this.t('cwFwNote2')},
                                        {ctx: this.t('cwFwNote3'), key: this.t('cwFwNote3')},
                                    ]}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                height: '65vh',
                                width: '100vw',
                            }}
                            >
                                <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd} >
                                    {radioMACList}
                                </DragDropContext>
                            </div>
                            <Typography
                                color="primary"
                                style={{
                                    // fontWeight: 'bold',
                                    fontSize: '14px',
                                    float: 'left',
                                }}
                                variant="body2"
                            >
                                * {this.t('neighborNodeLbl')}
                            </Typography>
                        </Grid>
                    </DialogContent>
                    <P2Dialog
                        open={this.state.dialog.open}
                        handleClose={this.handleDialogOnClose}
                        title={this.state.dialog.title}
                        content={this.state.dialog.content}
                        actionTitle={this.state.dialog.submitTitle}
                        actionFn={this.state.dialog.submitFn}
                        cancelActTitle={this.state.dialog.cancelTitle}
                        cancelActFn={this.state.dialog.cancelFn}
                    />
                </MuiThemeProvider>
            </Dialog>
        );
    }
}

MACListDialog.propTypes = {
    macMaxNo: PropTypes.number.isRequired,
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    savePopUpEntries: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    open: PropTypes.bool.isRequired,
    handlePopUpList: PropTypes.func.isRequired,
    macToHostnameMap: PropTypes.objectOf(PropTypes.string).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    loadData: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    radioSettings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    configOptionType: PropTypes.object.isRequired,
    macToIpMap: PropTypes.objectOf(PropTypes.string).isRequired,
    edges: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            from: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
        })
    ).isRequired,
};

function mapStateToProps(state) {
    const {csrf} = state.common;
    const {
        // eslint-disable-next-line no-unused-vars
        macToHostnameMap, graph, macToIpMap, nodeInfo,
    } = state.meshTopology;
    return {
        csrf,
        macToHostnameMap,
        edges: graph.edges,
        // nodeData: nodeInfo.nodeData,
        macToIpMap,
    };
}

// const mapDispatchToProps = {
//     refreshMeshTopology,
//     refreshNodeInfo,
// };

export default compose(
    withTranslation(['node-security-neighbor-acl']),
    connect(mapStateToProps),
    withStyles(styles)
)(MACListDialog);
