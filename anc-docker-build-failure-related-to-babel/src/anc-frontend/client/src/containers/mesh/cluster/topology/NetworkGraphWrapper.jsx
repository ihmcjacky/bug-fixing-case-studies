import React, {useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux'
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import moment from 'moment';
// import {saveAs} from 'file-saver';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AdjustIcon from '@material-ui/icons/Adjust';
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import LabelIcon from '@material-ui/icons/Label';
import LabelIconOutlined from '@material-ui/icons/LabelOutlined';
import Fade from '@material-ui/core/Fade';
import MapIcon from '@material-ui/icons/Map';
import ShowMapIcon from '@material-ui/icons/Visibility';
import HideMapIcon from '@material-ui/icons/VisibilityOff';
import TopologyCaptureIcon from '@material-ui/icons/CenterFocusStrong';
import saveAs from '../../../../util/nw/saveAs';
import ScreenCapEffect from '../../../../components/common/ScreenCapEffect';
import P2Dialog from '../../../../components/common/P2Dialog';
import LinkAlignmentWrapper from './LinkAlignmentWrapper';
import SpectrumScanWrapper from './SpectrumScanWrapper';
import NodeRecoveryWrapper from './NodeRecoveryWrapper';
import useD3ToCanvasTool from '../../../../components/common/useD3ToCanvasTool';
import ManagedDeviceListBtn from './ManagedDeviceListBtn';
//import TopologyGraph, {networkGraphHandler}  from './TopologyGraph';
import TopologyGraphPixi, {networkGraphHandler} from './TopologyGraphPixi'
import {
    styles,
    getBlockLinkDialogContent,
    getBlockLinkApiResDialogContent,
} from './networkGrapHelperFunc';
import NodeInfoCardCtrl from './NodeInfoCardCtrl';
import MdopInfoCardCtrl from './MdopInfoCardCtrl';
import LinkInfoCardCtrl from './LinkInfoCardCtrl';
import DraggableModelCtrl from './DraggableModelCtrl';
import TopologyContextMenu from './TopologyContextMenu';
import RssiViewerWrapper from './RssiViewerWrapper';
// import RssiViewer from '../../../../components/topology/RssiViewer';
import CustomMapApp from '../../../../components/topology/CustomMapApp';
import {syncUiSettings, setUiSettingsItem} from '../../../../redux/uiSettings/uiSettingsActions';
import {
    syncProjectUiSettings,
    setUiProjectSettingsItem,
    setProjectUIBackgroundSettings,
} from '../../../../redux/uiProjectSettings/uiProjectSettingsActions';
import {
    openSpectrumScanDialog,
} from '../../../../redux/spectrumScan/spectrumScanActions';
import {
    toggleAlignmentDialog,
} from '../../../../redux/linkAlignment/linkAlignmentActions';
import {
    openNodeRecoveryDialog,
} from '../../../../redux/nodeRecovery/nodeRecoveryActions';
import {toggleSnackBar, toggleLockLayer, changeMeshView} from '../../../../redux/common/commonActions';
import {resumePolling, abortPolling, restartPolling} from '../../../../redux/pollingScheduler/pollingActions';
import {updateAllUnmanagedDeviceNotify} from '../../../../redux/notificationCenter/notificationActions';
import {getConfig, setConfig, updateManagedDevList, restartCNPipe, setDataPolling} from '../../../../util/apiCall';
import useWindowOnChange from '../../../../components/common/useWindowOnChange';
import Dashboard from '../dashboard/Dashboard';
import { getOemNameOrAnm } from '../../../../util/common';

const useStyles = makeStyles(styles);

const preloadIcon = {
    blocklink: null,
    info: null,
    statistic: null,
    settings: null,
    maintenance: null,
    security: null,
    linkalignment: null,
    spectrumscan: null,
    rssi: null,
    anm: null,
    notAuthAp: null,
    router: null,
    add: null,
    networkTools: null,
    back: null,
    noderecovery: null,
    meshMobile: null,
    meshOnly: null,
    meshStatic: null,
    mobileOnly: null,
    staticOnly: null,
    disable: null,
    cloudOffline: null,
};

const preLoadIconAtStart = () => {
    Object.keys(preloadIcon).forEach((icon) => {
        preloadIcon[icon] = new Image();
        preloadIcon[icon].src = `/img/icons/${icon}.svg`;
    });
}

const NetWorkGraphWrapper = forwardRef((props, ref) => {
    const {t, displayView} = props;
    const dispatch = useDispatch();
    const classes = useStyles();
    const {
        common: {
            csrf,
            meshView,
        },
        meshTopology: {
            initState,
            graph,
            adjustMode,
            graphUpdate,
            nodeInfo,
            linkInfo,
            image,
            lastUpdateTime,
        },
        uiProjectSettings: {
            topology: {
                nodes,
                background
            },
        },
        uiSettings: {
            rssiColor,
            showLinkLabel,
            showEthLink,
            pixiSettings,
        },
        projectManagement: {projectId, projectIdToNameMap}
    } = useSelector(store => store);

    const {show} = background;
    const {set} = image;
    const {width, height} = useWindowOnChange();

    const mdopTable = graph.mdopTable ? graph.mdopTable : {};
    const ethernetDirectEnabledList = graph.ethernetDirectEnabledList ? graph.ethernetDirectEnabledList : {};

    const {
        getCanvas,
        loading,
        done,
        resetState,
        url,
    } = useD3ToCanvasTool({id: 'cloned-topology-svg-wrapper'});

    const [dialog, setDialog] = useState({
        open: false,
        handleClose: () => {},
        title: '',
        content: '',
        nonTextContent: <span />,
        actionTitle: 'OK',
        actionFn: () => {},
        cancelActTitle: 'CANCEL',
        cancelActFn: () => {},
    });
    const [linkInfoCard, setLinkInfoCard] = useState({
        linkId: '',
        nodeAIp: '',
        nodeBIp: '',
        linkColor: '#425581',
        linkType: 'RadioLink',
        clickPos: {
            x: 9999,
            y: 9999,
        },
    });
    const [rssiViewer, setRssiViewer] = useState({
        open: false,
        ip: '',
        hostname: '',
    });
    const [nodeInfoCard, setNodeInfoCard] = useState({
        open: false,
        targetIp: '',
        clickPos: {
            x: 9999,
            y: 9999,
        },
    });
    const [mdopInfoCard, setMdopInfoCard] = useState({
        open: false,
        targetIp: '',
        clickPos: {
            x: 9999,
            y: 9999,
        },
    });
    const [draggableBox, setDraggableBox] = useState({
        currentBoxList: [],
        initIndex: 0,
        clickPos: {
            x: 9999,
            y: 9999,
        },
        initData: {},
    });
    const [contextMenu, setContextMenu] = useState({
        open: false,
        origin: {
            anchor: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transform: {
                vertical: 'top',
                horizontal: 'left',
            },
        },
        clickPos: {
            x: 99999,
            y: 99999,
        },
    });
    const [customMapApp, setCustomMapApp] = useState({
        open: false,
    });

    const closeDialog = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };
    const [debugJson, setDebugJson] = useState('');

    // didMount and unmount
    const didMountFunc = () => {
        preLoadIconAtStart();
        return (() => { dispatch(syncProjectUiSettings()); });
    };
    useEffect(didMountFunc, []);

    const closeContextMenu = () => {
        setContextMenu({
            ...contextMenu,
            open: false,
            clickPos: {
                x: 9999,
                y: 9999,
            },
        });
    };

    const openContextMenu = (position) => {
        if (adjustMode) return;
        const openPosition = position;
        const topologyWith = width;
        const topologyHeight = height;
        const origin = {
            anchor: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transform: {
                vertical: 'top',
                horizontal: 'left',
            },
        };
        if (position.x > topologyWith - 200) {
            origin.transform.horizontal = 'right';
        }
        if (position.y > topologyHeight - 250) {
            origin.transform.vertical = 'bottom';
        }

        setContextMenu({
            ...contextMenu,
            open: true,
            clickPos: openPosition,
            origin,
        });
    };
    const nodeOnMdopClick = (nodeIp, mousePos, mdopId) => {
        setNodeInfoCard({
            ...nodeInfoCard,
            open: false,
            targetIp: '',
        });
        setMdopInfoCard(
            {
                ...mdopInfoCard,
                open: true,
                targetIp: nodeIp,
                mdopId,
                clickPos: {
                    x: mousePos.x,
                    y: mousePos.y,
                },
            }
        );
    };
    const nodeOnMdopLeave = () => {
        // return;
        setMdopInfoCard(
            {
                ...mdopInfoCard,
                open: false,
                targetIp: '',
            }
        );
    };

    // handle restart cnpipe connections, isAuth unknown fixing
    const nodeOnLeftClick = (nodeIpArr) => {
        restartCNPipe(csrf, projectId, {nodes: nodeIpArr}).then((res) => {
            setDialog({
                ...dialog,
                open: true,
                handleClose: closeDialog,
                title: t('restartUnderlyingConnOKTitle'),
                content: t('restartUnderlyingConnOKCtx'),
                actionTitle: t('OK'),
                cancelActTitle: '',
                actionFn: () => {
                    setDialog({
                        ...dialog,
                        open: false
                    });
                }
            })
        }).catch((e) => {
            setDialog({
                ...dialog,
                open: true,
                handleClose: closeDialog,
                title: t('restartUnderlyingConnFailedTitle'),
                content: t('restartUnderlyingConnFailedCtx'),
                actionTitle: t('OK'),
                cancelActTitle: '',
                actionFn: () => {
                    setDialog({
                        ...dialog,
                        open: false
                    });
                }
            })
        });
    }

    const nodeOnHover = (nodeIp, mousePos) => {
        setNodeInfoCard({
            ...nodeInfoCard,
            open: true,
            targetIp: nodeIp,
            clickPos: {
                x: mousePos.x,
                y: mousePos.y,
            },
        });
    };

    const nodeOnHoverLeave = () => {
        setNodeInfoCard({
            ...nodeInfoCard,
            open: false,
            targetIp: '',
        });
    };

    const openDraggableBox = (ip, index, clickPos, directToMdopTable = false, eth = '') => {
        if (draggableBox.currentBoxList.includes(ip)) return;
        setDraggableBox({
            ...draggableBox,
            currentBoxList: [...draggableBox.currentBoxList, ip],
            initIndex: index,
            clickPos,
            initData: {
                ...draggableBox.initData,
                [ip]: {
                    directToMdopTable,
                    eth,
                },
            },
        });
    };

    const openLinkAlignment = (ip) => {
        dispatch(toggleAlignmentDialog(true, ip, true));
    };

    const openSpectrumScan = (ip) => {
        dispatch(openSpectrumScanDialog(ip));
    };

    const openNodeRecovery = (ip) => {
        dispatch(openNodeRecoveryDialog(ip));
    };

    const openRssiViewer = (ip) => {
        setRssiViewer({
            ...rssiViewer,
            open: true,
            ip,
            hostname: nodeInfo[ip].hostname,
        });
    };

    const closeRssiViewer = () => {
        setRssiViewer({
            ...rssiViewer,
            open: false,
            ip: '',
            hostname: '',
        });
    };

    const addDeviceToList = (ip) => {
        const projectId = Cookies.get('projectId');
        dispatch(toggleLockLayer());
        updateManagedDevList(csrf, projectId, {add: [ip]}).then(() => {
            dispatch(updateAllUnmanagedDeviceNotify([ip]));
            dispatch(restartPolling());
        }).catch(() => {
            dispatch(toggleSnackBar(t('addToListFailed'), 3000));
        });
    };

    const linkOnHover = (linkData, mousePos) => {
        setLinkInfoCard({
            ...linkInfoCard,
            linkId: linkData.id,
            nodeAIp: linkData.nodeAIp,
            nodeBIp: linkData.nodeBIp,
            linkColor: linkData.linkColor,
            linkType: linkData.linkType,
            clickPos: {
                x: mousePos.x,
                y: mousePos.y,
            },
        });
    };

    const linkOnHoverLeave = () => {
        setLinkInfoCard({
            ...linkInfoCard,
            linkId: '',
            nodeAIp: '',
            nodeBIp: '',
        });
    };

    const updateDebugJson = (debugJson) => {
        setDebugJson(JSON.stringify(debugJson));
    };

    const blockLinkCancelAct = () => {
        closeDialog();
        dispatch(toggleLockLayer(false));
    };

    const updateUiProjectSettings = (pos, backgroundObj) => {
        if (backgroundObj) {
            dispatch(setUiProjectSettingsItem('topology', {nodes: pos, background: backgroundObj}));
        } else {
            dispatch(setUiProjectSettingsItem('topology', {nodes: pos, background}));
        }
        dispatch(syncProjectUiSettings());
    };

    const blockLinkOnClickFn = (body) => {
        setConfig(csrf, projectId, body).then((res) => {
            const dialogContent = getBlockLinkApiResDialogContent(res, t);
            setTimeout(() => {
                setDialog({
                    ...dialog,
                    open: true,
                    handleClose: closeDialog,
                    title: dialogContent.title,
                    content: dialogContent.content,
                    actionTitle: dialogContent.actionTitle,
                    actionFn: () => {
                        blockLinkCancelAct();
                        dispatch(resumePolling());
                    },
                    cancelActTitle: dialogContent.cancelActTitle,
                    cancelActFn: blockLinkCancelAct,
                });
            }, dialogContent.success ? dialogContent.rff : 0);
        }).catch(() => {
            setDialog({
                ...dialog,
                open: true,
                handleClose: closeDialog,
                title: t('blockLinkFailTitle'),
                content: t('blockLinkFailContent'),
                actionTitle: t('OK'),
                actionFn: () => {
                    blockLinkCancelAct();
                    dispatch(resumePolling());
                },
                cancelActTitle: '',
                cancelActFn: blockLinkCancelAct,
            });
        });
    };

    const handleBlockLink = (linkId) => {
        const link = linkInfo[linkId];
        if (!link) {
            dispatch(toggleSnackBar(t('blockLinkError')));
            return;
        }
        dispatch(toggleLockLayer(true));
        getConfig(csrf, projectId, {nodes: Object.keys(link.nodes)}).then((res) => {
            const dialogContent = getBlockLinkDialogContent(res, link, nodeInfo, t);
            dispatch(toggleLockLayer(false));
            setDialog({
                ...dialog,
                open: true,
                handleClose: closeDialog,
                title: dialogContent.title,
                content: dialogContent.content,
                actionTitle: dialogContent.actionTitle,
                actionFn: dialogContent.success ? () => {
                    blockLinkOnClickFn(dialogContent.actionBody);
                    dispatch(abortPolling());
                    closeDialog();
                } : blockLinkCancelAct,
                cancelActTitle: dialogContent.cancelActTitle,
                cancelActFn: blockLinkCancelAct,
            });
        }).catch(() => {
            dispatch(toggleLockLayer(false));
            setDialog({
                ...dialog,
                open: true,
                handleClose: closeDialog,
                title: t('cannotGetNodeInfoTitle'),
                content: t('cannotGetNodeInfoContent'),
                actionTitle: t('ok'),
                actionFn: blockLinkCancelAct,
                cancelActTitle: '',
                cancelActFn: blockLinkCancelAct,
            });
        });
    };

    const openCustomMapApp = () => {
        setCustomMapApp({
            open: true,
        });
    };
    const closeCustomMapApp = () => {
        setCustomMapApp({
            open: false,
        });
    };

    const draggableModelHandleClose = (ip) => {
        setDraggableBox({
            ...draggableBox,
            currentBoxList: draggableBox.currentBoxList.filter(nodeIp => ip !== nodeIp),
            initData: {
                ...draggableBox.initData,
                [ip]: {},
            },
        });
    };

    const topologyEventHandler = {
        map: {
            openContextMenu,
            closeContextMenu,
            contextMenuOpen: contextMenu.open,
        },
        node: {
            onHover: nodeOnHover,
            onHoverLeave: nodeOnHoverLeave,
            onMdopClick: nodeOnMdopClick,
            onMdopLeave: nodeOnMdopLeave,
            menuFunc: {
                openDraggableBox,
                openLinkAlignment,
                openSpectrumScan,
                openNodeRecovery,
                openRssiBox: openRssiViewer,
                addDeviceToList,
            },
            onLeftClickNode: nodeOnLeftClick
        },
        link: {
            onHover: linkOnHover,
            onHoverLeave: linkOnHoverLeave,
            menuFunc: {blocklink: handleBlockLink},
        },
        updateUiProjectSettings,
        updateDebugJson,
    };

    const adjustMapFunc = () => {
        networkGraphHandler.zoomToFit();
        // try{
        //     setDataPolling(
        //         csrf,
        //         projectId,
        //         {
        //             stop: ['127.2.35.226'],
        //             start: [],
        //             // stop: [],
        //             // start: ['127.2.35.226'],
        //         },
        //         (res) => {
        //             console.log('kenny-debug')
        //             console.log(res)
        //         },
        //         (e) => {
        //             console.log('kenny-debug')
        //             console.log(e)
        //         }
        //     );

        // } catch (e) {
        //     console.log('setDataPollin error')
        //     console.log(e)
        // }
    };

    const zoomToNode = (ip) => {
        networkGraphHandler.zoomToNode(ip);
    };

    const showEdgeLabelFunc = () => {
        dispatch(setUiSettingsItem('showLinkLabel', !showLinkLabel));
        dispatch(syncUiSettings());
    };

    const showEthLinkFunc = () => {
        dispatch(setUiSettingsItem('showEthLink', !showEthLink));
        dispatch(syncUiSettings());
    };

    const openCustomizeMap = () => {
        openCustomMapApp();
    };
    const showMapFunc = () => {
        dispatch(setProjectUIBackgroundSettings('show', !background.show));
        dispatch(syncProjectUiSettings());
    };
    const topologyCapScreen = async () => {
        closeContextMenu();
        dispatch(abortPolling());
        const svg = document.getElementById('topology-graph');
        const clonedSvg = svg.cloneNode(true);
        const {height} = svg.getBoundingClientRect();
        // Clone element and remove appBar for convertion
        clonedSvg.id = 'cloned-topology-svg-wrapper';
        clonedSvg.setAttribute('height', height + 48);
        clonedSvg.style.transform = 'translateY(-48px)';
        clonedSvg.style.padding = '48px 0';
        svg.parentNode.insertBefore(clonedSvg, svg);
        const option = {
            logging: true,
            // Whether to allow cross-origin images to taint the canvas
            allowTaint: true,
            // Whether to use ForeignObject rendering if the browser supports it
            foreignObjectRendering: true,
            // Whether to attempt to load images from a server using CORS
            useCORS: true,
            scale: 1,
            height,
            backgroundColor: image.set && background.show ? background.color : '#e5e5e5',
        };

        // Start convertion from html to image
        let img = null;
        if(false){
            img = (await getCanvas(option)).toDataURL('image/png', 1);
        }else{
            img = await networkGraphHandler.capture();
        }
        const currentTime = moment().format('YYYY-MM-DD-HH-mm-ss');
        const projectName = projectIdToNameMap[projectId];
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const filename = `${namePrefix}_${projectName}_topology_${currentTime}.png`;

        saveAs(img, filename).then((res) => {
            if (res.success) {
                dispatch(toggleSnackBar(t('downloadCompleted')));
            }
        });
        // document.getElementById('topology-graph').replaceChild(svg, clonedSvg);
        clonedSvg.remove();
        dispatch(resumePolling());
    };

    const items = [];
    items.push({
        onClickFunc: () => {
            closeContextMenu();
            dispatch(syncProjectUiSettings());
            dispatch(changeMeshView('dashboard'));
        },
        icon: <DesktopMacIcon classes={{root: classes.iconButton}} />,
        title: t('dashboardView'),
    });
    items.push({
        onClickFunc: () => {
            closeContextMenu();
            adjustMapFunc();
        },
        icon: <AdjustIcon classes={{root: classes.iconButton}} />,
        title: t('autoAlignGraph'),
    });
    items.push({
        onClickFunc: () => {
            closeContextMenu();
            showEdgeLabelFunc();
        },
        icon: showLinkLabel ?
            <LabelIcon classes={{root: classes.iconButton}} /> :
            <LabelIconOutlined classes={{root: classes.iconButton}} />,
        title: showLinkLabel ? t('hideLinkLabel') : t('showLinkLabel'),
    });
    
    items.push({
        onClickFunc: () => {
            closeContextMenu();
            showEthLinkFunc();
        },
        icon:
            <img
                src={`/img/showHideEth.svg`}
                alt="eth"
                width="24"
                classes={{root: classes.iconButton}}
            />,
        title: showEthLink ? t('hideEthLinkLabel') : t('showEthLinkLabel'),
    });

    items.push({
        onClickFunc: () => {
            closeContextMenu();
            openCustomizeMap();
        },
        icon: <MapIcon classes={{root: classes.iconButton}} />,
        title: t('customizeMap'),
    });
    if (image.set) {
        items.push({
            onClickFunc: () => {
                closeContextMenu();
                showMapFunc();
            },
            icon: background.show ?
                <HideMapIcon classes={{root: classes.iconButton}} /> :
                <ShowMapIcon classes={{root: classes.iconButton}} />,
            title: background.show ? t('hideMap') : t('showMap'),
        });
    }
    items.push({
        onClickFunc: () => {
            closeContextMenu();
            topologyCapScreen();
        },
        icon: <TopologyCaptureIcon classes={{root: classes.iconButton}} />,
        title: t('captrueTopology'),
    });


    useImperativeHandle(ref, () => ({
        showEdgeLabelFunc,
        adjustMapFunc,
        showMapFunc,
        openCustomizeMap,
        topologyCapScreen,
        showEthLinkFunc,
    }));

    return (
        <div
            className="mesh-container"
            style={{
                width: '100%',
                height: '100%',
                position: 'fixed',
                userSelect: 'none',
            }}
        >
            <P2Dialog
                open={dialog.open}
                handleClose={closeDialog}
                title={dialog.title}
                content={dialog.content}
                nonTextContent={dialog.nonTextContent}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
            />
            <LinkAlignmentWrapper />
            <SpectrumScanWrapper />
            <NodeRecoveryWrapper />
            <DraggableModelCtrl
                nodeInfo={nodeInfo}
                nodes={draggableBox.currentBoxList}
                close={draggableModelHandleClose}
                clickPos={draggableBox.clickPos}
                initIndex={draggableBox.initIndex}
                initData={draggableBox.initData}
                pollingHandler={{
                    restartInterval: () => dispatch(resumePolling()),
                    stopInterval: () => dispatch(abortPolling()),
                }}
                containerX={width}
                containerY={height}
            />
            {props.floatingMenu}
            <Fade
                in={displayView === 'topology'}
                mountOnEnter
                unmountOnExit
            >
                <div
                    id="network-graph-wrapper"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                        userSelect: 'none',
                    }}
                >
                    <div
                        style={{
                            position: 'fixed',
                            top: 100,
                            right: 60,
                            zIndex: 10,
                            display: adjustMode ? 'none' : 'inherit',
                        }}
                    >
                        <ManagedDeviceListBtn />
                    </div>
                    <TopologyGraphPixi
                        t={t}
                        graphUpdate={graphUpdate}
                        adjustMode={adjustMode}
                        graph={{
                            nodes: graph.nodes,
                            links: graph.edges,
                        }}
                        mdopTable={mdopTable}
                        ethernetDirectEnabledList={ethernetDirectEnabledList}
                        nodeInfo={nodeInfo}
                        linkInfo={linkInfo}
                        nodesPos={nodes}
                        background={background}
                        image={image}
                        lastUpdateTime={lastUpdateTime}
                        rssiColor={rssiColor}
                        pixiSettings={pixiSettings}
                        showLinkLabel={showLinkLabel}
                        showEthLink={showEthLink}
                        eventHandler={topologyEventHandler}
                        setDialog={setDialog}
                    />
                    <TopologyContextMenu
                        items={items}
                        open={contextMenu.open}
                        pos={contextMenu.clickPos}
                        contextMenuClose={closeContextMenu}
                        origin={contextMenu.origin}
                    />
                    <NodeInfoCardCtrl
                        open={nodeInfoCard.open}
                        targetIp={nodeInfoCard.targetIp}
                        clickPos={nodeInfoCard.clickPos}
                        graphNodeInfo={nodeInfo}
                        containerY={height}
                    />
                    <MdopInfoCardCtrl
                        open={mdopInfoCard.open}
                        targetIp={mdopInfoCard.targetIp}
                        clickPos={mdopInfoCard.clickPos}
                        mdopId={mdopInfoCard.mdopId}
                        graphNodeInfo={nodeInfo}
                        containerY={height}
                        zoomToNode={zoomToNode}
                        openDraggableBox={openDraggableBox}
                    />
                    <LinkInfoCardCtrl
                        x={linkInfoCard.clickPos.x}
                        y={linkInfoCard.clickPos.y}
                        linkId={linkInfoCard.linkId}
                        nodeAIp={linkInfoCard.nodeAIp}
                        nodeBIp={linkInfoCard.nodeBIp}
                        linkColor={linkInfoCard.linkColor}
                        linkType={linkInfoCard.linkType}
                        containerX={width}
                        containerY={height}
                    />
                    <RssiViewerWrapper
                        close={closeRssiViewer}
                        open={rssiViewer.open}
                        csrf={csrf}
                        projectId={projectId}
                        ip={rssiViewer.ip}
                        hostname={rssiViewer.hostname}
                    />
                    <CustomMapApp
                        t={t}
                        open={customMapApp.open}
                        closeApp={closeCustomMapApp}
                        background={background}
                        image={image}
                    />
                    <ScreenCapEffect
                        loading={loading}
                        done={done}
                        image={url}
                        animationEndCallback={() => { setTimeout(resetState, 1000); }}
                    />
                    <span id="debug-msg" style={{display: 'none'}}>{debugJson}</span>
                </div>
            </Fade>
            <Fade
                in={displayView === 'dashboard'}
                mountOnEnter
                unmountOnExit
            >
                <Dashboard topologyEventHandler={topologyEventHandler} preloadIcon={preloadIcon}/>
            </Fade>
        </div>
    );
});

NetWorkGraphWrapper.propTypes = {
    t: PropTypes.func.isRequired,
    displayView: PropTypes.string.isRequired,
};

export default NetWorkGraphWrapper;
