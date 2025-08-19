import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import SvgIcon from '@material-ui/core/SvgIcon';
import Constant from '../../../../constants/common';

const {theme, colors} = Constant;

export const initState = {
    debugJson: '',
    dialog: {
        open: false,
        handleClose: () => {},
        title: '',
        actionTitle: 'OK',
        actionFn: () => {},
        cancelActTitle: 'Cancel',
        cancelActFn: () => {},
        content: '',
    },
    linkInfoCard: {
        linkId: '',
        nodeAIp: '',
        nodeBIp: '',
        linkColor: '#425581',
        linkType: 'RadioLink',
        clickPos: {
            x: 9999,
            y: 9999,
        },
    },
    rssiViewer: {
        open: false,
        ip: '',
        hostname: '',
    },
    nodeInfoCard: {
        open: false,
        targetIp: '',
        clickPos: {
            x: 9999,
            y: 9999,
        },
    },
    draggableBox: {
        currentBoxList: [],
        initIndex: 0,
        clickPos: {
            x: 9999,
            y: 9999,
        },
    },
    contextMenu: {
        open: false,
        clickPos: {
            x: 99999,
            y: 99999,
        },
    },
    customMapApp: {
        open: false,
        adjustMode: false,
    },
};

export const styles = {
    tooltipRoot: {
        whiteSpace: 'nowrap',
        transform: 'scale(1.4)',
        position: 'fixed',
        top: -10,
        right: 0,
        zIndex: 10,
    },
    fab: {
        backgroundColor: 'white',
        color: theme.palette.primary.main,
    },
    managedDeviceListIconWrapper: {
        position: 'fixed',
        top: 100,
        right: 60,
        zIndex: 10,
    },
    iconButton: {
        color: colors.main,
    },
};

export const managedDeviceListIcon = (
    <SvgIcon
        color="primary"
        style={{transform: 'scale(1.3)'}}
        viewBox="0 0 30 30"
    >
        <svg width="35" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.875 0H2.125C0.95625 0 0 1.125 0 2.5V17.5C0 18.875 0.95625 20 2.125 20H14.875C16.0438 20 17 18.875
                    17 17.5V2.5C17 1.125 16.0438 0 14.875 0V0ZM15 10H2V8H15V10ZM15 14H2V12H15V14ZM15 6H2V4H15V6V6Z"
                fill="#122D54"
            />
            <path
                d="M25.9412 10.0285L26.0079 10.0896L26.6849 9.4126L27.7071 8.39038L28.4142 7.68327L27.7071
                    6.97617C25.7286 4.99761 23.1733 3.99994 20.6111 3.99994C18.0489 3.99994 15.4937 4.99761
                    13.5151 6.97617L12.808 7.68327L13.5151 8.39038L14.5373 9.4126L15.2144 10.0896L15.281
                    10.0285L15.6873 10.4348L16.7096 11.457L17.4167 12.1642L18.1238 11.457C18.8036 10.7773
                    19.6853 10.4722 20.6111 10.4722C21.5369 10.4722 22.4187 10.7773 23.0984 11.457L23.8056
                    12.1642L24.5127 11.457L25.5349 10.4348L25.9412 10.0285ZM18.3333
                    16.7777H6.55556C4.59772 16.7777 3 18.3754 3 20.3333V25.4444C3 27.4022 4.59772 28.9999 6.55556
                    28.9999H24.4444C26.4023 28.9999 28 27.4022 28 25.4444V20.3333C28 18.3754 26.4023 16.7777 24.4444
                    16.7777H22.8889V12.6666V11.6666H21.8889H19.3333H18.3333V12.6666V16.7777ZM9.38889
                    23.1666H8.83333V22.611H9.38889V23.1666ZM13.8611 23.1666H13.3056V22.611H13.8611V23.1666ZM18.3333
                    23.1666H17.7778V22.611H18.3333V23.1666Z"
                fill="#122D54"
                stroke="white"
                strokeWidth="2"
            />
        </svg>
    </SvgIcon>
);

export const managedDeviceListIconNotAuth = (
    <SvgIcon
        color="secondary"
        style={{transform: 'scale(1.3)'}}
        viewBox="0 0 30 30"
    >
        <svg width="35" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.875 3.05176e-05H2.125C0.95625 3.05176e-05 0 1.12503 0 2.50003V17.5C0 18.875 0.95625 20
                    2.125 20H14.875C16.0438 20 17 18.875 17 17.5V2.50003C17 1.12503 16.0438 3.05176e-05 14.875
                    3.05176e-05V3.05176e-05ZM15 10H2V8.00003H15V10ZM15 14H2V12H15V14ZM15
                    6.00003H2V4.00003H15V6.00003V6.00003Z"
                fill="#DC4639"
            />
            <path
                d="M25.9412 10.0286L26.0079 10.0897L26.6849 9.41266L27.7071 8.39044L28.4142 7.68333L27.7071
                    6.97623C25.7286 4.99767 23.1733 4 20.6111 4C18.0489 4 15.4937 4.99767 13.5151 6.97623L12.808
                    7.68333L13.5151 8.39044L14.5373 9.41266L15.2144 10.0897L15.281 10.0286L15.6873 10.4349L16.7096
                    11.4571L17.4167 12.1642L18.1238 11.4571C18.8036 10.7773 19.6853 10.4722 20.6111 10.4722C21.5369
                    10.4722 22.4187 10.7773 23.0984 11.4571L23.8056 12.1642L24.5127 11.4571L25.5349 10.4349L25.9412
                    10.0286ZM18.3333 16.7778H6.55556C4.59772 16.7778 3 18.3755 3 20.3333V25.4444C3 27.4023 4.59772
                    29 6.55556 29H24.4444C26.4023 29 28 27.4023 28 25.4444V20.3333C28 18.3755 26.4023 16.7778 24.4444
                    16.7778H22.8889V12.6667V11.6667H21.8889H19.3333H18.3333V12.6667V16.7778ZM9.38889
                    23.1667H8.83333V22.6111H9.38889V23.1667ZM13.8611 23.1667H13.3056V22.6111H13.8611V23.1667ZM18.3333
                    23.1667H17.7778V22.6111H18.3333V23.1667Z"
                fill="#DC4639"
                stroke="white"
                strokeWidth="2"
            />
        </svg>
    </SvgIcon>
);

const getBlockLinkComfirmBoxContent = (nodeAName, nodebName, nodeARadio, nodeBRadio, haveWhiteList, t) => (
    <span>
        <span>{t('blockLinkComfirmBoxContentPartA')}</span>
        <b>{` ${nodeAName} (${nodeARadio}) `}</b>
        <span>{t('blockLinkComfirmBoxContentPartB')}</span>
        <b>{` ${nodebName} (${nodeBRadio}) `}</b>
        {
            haveWhiteList ? (
                <span>{t('blockLinkComfirmBoxContentPartE')}</span>
            ) : (
                <span>{t('blockLinkComfirmBoxContentPartC')}</span>
            )
        }
        <br />
        <br />
        <span>{t('blockLinkComfirmBoxContentPartD')}</span>
    </span>
);

export function getBlockLinkDialogContent(res, linkInfo, nodeInfo, t) {
    const nodesArr = Object.keys(linkInfo.nodes);
    const nodeA = nodesArr[0];
    const nodeB = nodesArr[1];
    const nodeARadio = linkInfo.nodes[nodeA].radio;
    const nodeBRadio = linkInfo.nodes[nodeB].radio;
    const nodeAMAC = nodeInfo[nodeA].mac;
    const nodeBMAC = nodeInfo[nodeB].mac;
    const curNodeAAcl = res.radioSettings[nodeA][nodeARadio].acl;
    const curNodeBAcl = res.radioSettings[nodeB][nodeBRadio].acl;
    const newNodeAAcl = {
        type: 'blacklist',
        macList: [],
    };
    const newNodeBAcl = {
        type: 'blacklist',
        macList: [],
    };
    let nodeANeedToSet = true;
    let nodeBNeedToSet = true;

    if (curNodeAAcl.type === 'blacklist' && curNodeAAcl.macList && curNodeAAcl.macList.includes(nodeBMAC)) {
        nodeANeedToSet = false;
    } else if (curNodeAAcl.macList && curNodeAAcl.type === 'blacklist') {
        newNodeAAcl.macList = [...curNodeAAcl.macList, nodeBMAC];
    } else {
        newNodeAAcl.macList = [nodeBMAC];
    }

    if (curNodeBAcl.type === 'blacklist' && curNodeBAcl.macList && curNodeBAcl.macList.includes(nodeAMAC)) {
        nodeBNeedToSet = false;
    } else if (curNodeBAcl.macList && curNodeBAcl.type === 'blacklist') {
        newNodeBAcl.macList = [...curNodeBAcl.macList, nodeAMAC];
    } else {
        newNodeBAcl.macList = [nodeAMAC];
    }

    if (newNodeAAcl.macList.length > 6 || newNodeAAcl.macList.length > 6) {
        return {
            success: false,
            content: t('excessMaxNoOfACLDialogContent'),
            actionTitle: t('ok'),
            cancelActTitle: '',
        };
    }
    if (!nodeANeedToSet && !nodeBNeedToSet) {
        return {
            success: false,
            content: t('alreadyBlocked'),
            actionTitle: t('ok'),
            cancelActTitle: '',
        };
    }
    const diff = {
        radioSettings: {},
    };

    const checksums = {};

    if (nodeANeedToSet) {
        diff.radioSettings[nodeA] = {
            [nodeARadio]: {
                acl: newNodeAAcl,
            },
        };
        checksums[nodeA] = res.checksums[nodeA];
    }
    if (nodeBNeedToSet) {
        diff.radioSettings[nodeB] = {
            [nodeBRadio]: {
                acl: newNodeBAcl,
            },
        };
        checksums[nodeB] = res.checksums[nodeB];
    }
    const reqObj = {
        diff,
        checksums,
    };
    let haveWhiteList = false;
    if (curNodeAAcl.type === 'whitelist' || curNodeBAcl.type === 'whitelist') {
        haveWhiteList = true;
    }
    const content =
        getBlockLinkComfirmBoxContent(nodeAMAC, nodeBMAC, nodeARadio, nodeBRadio, haveWhiteList, t);
    return {
        success: true,
        title: t('confirmationBoxTitle'),
        content,
        actionTitle: t('process'),
        cancelActTitle: t('cancel'),
        actionBody: reqObj,
    };
}

export const getBlockLinkApiResDialogContent = (res, t) => {
    const rff = res.rff ? res.rff *= 1000 : 1000;
    return {
        success: true,
        rff,
        actionTitle: t('OK'),
        cancelActTitle: '',
        title: t('blockLinkSuccessTitle'),
        content: t('blockLinkSuccessContent'),
    };
};


// if (a === 'dasdf') {
//     dispatch(stopPolling());
//     dispatch(openManagedDeviceList());
// }
// networkGraphHandler.moveNode('127.2.36.2', -500, 0, 1000);
// setTimeout(() => {
//     networkGraphHandler.moveNode('127.2.36.2', 500, 0, 1000);
// }, 1400);

export const GraphContextMenuItem = React.forwardRef((props, ref) => (
    <MenuItem disableTouchRipple ref={ref} onClick={props.onClickFunc}>
        {props.icon}
        <div style={{paddingLeft: '4px'}}>
            {props.title}
        </div>
    </MenuItem>
));

GraphContextMenuItem.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    onClickFunc: PropTypes.func.isRequired,
};

// keepMounted
// open={state.contextMenu.open}
// onClose={closeContextMenu}
// anchorReference="anchorPosition"
// anchorPosition={state.contextMenu.open ?
//     {top: state.contextMenu.clickPos.y, left: state.contextMenu.clickPos.x} : undefined}
