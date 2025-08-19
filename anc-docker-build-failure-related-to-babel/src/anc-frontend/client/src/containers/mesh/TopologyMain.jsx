import React, {useRef, useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import LabelIcon from '@material-ui/icons/Label';
import LabelIconOutlined from '@material-ui/icons/LabelOutlined';
import AdjustIcon from '@material-ui/icons/Adjust';
import MapIcon from '@material-ui/icons/Map';
import ShowMapIcon from '@material-ui/icons/Visibility';
import HideMapIcon from '@material-ui/icons/VisibilityOff';
import TopologyCaptureIcon from '@material-ui/icons/CenterFocusStrong';
import Fade from '@material-ui/core/Fade';
import {ReactComponent as TopologyIcon} from '../../icon/svg/ic_mesh.svg';
import AdvanceFloatingMenu from '../../components/topology/AdvanceFloatingMenu';
import {changeMeshView} from '../../redux/common/commonActions';
import NetworkGraphWrapper from './cluster/topology/NetworkGraphWrapper';
import Footer from '../../init/Footer';
import Dashboard from './cluster/dashboard/Dashboard';

const TopologyMain = () => {
    console.log('TopologyMain');
    const topologyRef = useRef();
    const {
        common: {
            meshView,
            labels
        },
        meshTopology: {
            initState: {graph},
            adjustMode,
            image: {set},
        },
        uiProjectSettings: {
            topology: {
                background: {show},
            },
        },
        uiSettings: {
            showLinkLabel,
            showEthLink,
        },
    } = useSelector(store => store);

    const {t: _t, ready} = useTranslation(['cluster-topology', 'translate']);
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    const dispatch = useDispatch();
    const [displayView, setDisplayView] = useState('');

    useEffect(() => {
        Cookies.remove('meshConfigActiveTab');
        Cookies.remove('ClusterMaintenanceTab');
    }, []);

    useEffect(() => {
        if (graph) {
            setDisplayView('');
            setTimeout(() => {
                setDisplayView(meshView);
            }, 400);
        }
    }, [graph, meshView])

    const adjustMapFunc = () => {
        if (topologyRef) {
            topologyRef.current.adjustMapFunc();
        }
    };

    const showEthLinkFunc = () => {
        if (topologyRef) {
            topologyRef.current.showEthLinkFunc();
        }
    };

    const showEdgeLabelFunc = () => {
        if (topologyRef) {
            topologyRef.current.showEdgeLabelFunc();
        }
    };

    const showMapFunc = () => {
        if (topologyRef) {
            topologyRef.current.showMapFunc();
        }
    };

    const customizeMapFunc = () => {
        if (topologyRef) {
            topologyRef.current.openCustomizeMap();
        }
    };

    const topologyCapScreen = () => {
        if (topologyRef) {
            topologyRef.current.topologyCapScreen();
        }
    };

    const isTopologyView = meshView === 'topology';

    const changeToTopologyIcon = {
        icon: <TopologyIcon />,
        name: t('dashboardViewBtnLabel'),
        onClick: () => {
            dispatch(changeMeshView('topology'));
        },
    };

    const changeToDashboardIcon = {
        icon: <DesktopMacIcon />,
        name: t('topologyViewBtnLabel'),
        onClick: () => {
            dispatch(changeMeshView('dashboard'));
        },
    };

    const dashboardActionBtns = [];
    const topologyActionBtns = [
        {
            icon: <AdjustIcon />,
            name: t('autoAlignGraph'),
            onClick: adjustMapFunc,
        },
        {
            icon: showLinkLabel ? <LabelIcon /> : <LabelIconOutlined />,
            name: showLinkLabel ? t('hideLinkLabel') : t('showLinkLabel'),
            onClick: showEdgeLabelFunc,
        },
        {
            icon:(
                <img
                    src={`/img/showHideEth.svg`}
                    alt="eth"
                    width="24"
                />
            ),
            name: showEthLink ? t('hideEthLinkLabel') : t('showEthLinkLabel'),
            onClick: showEthLinkFunc,
        },
        {
            icon: <MapIcon />,
            name: t('customizeMap'),
            onClick: customizeMapFunc,
        },
        {
            icon: <TopologyCaptureIcon />,
            name: t('captrueTopology'),
            onClick: topologyCapScreen,
        },
    ];
    if (set) {
        topologyActionBtns.push({
            icon: show ?  <ShowMapIcon /> : <HideMapIcon />,
            name: show ? t('hideMap') : t('showMap'),
            onClick: showMapFunc,
        });
    }

    const floatingMenu = (
        <div
            style={{
                position: 'fixed',
                bottom: 100,
                right: 80,
                zIndex: 10,
                display: adjustMode ? 'none' : 'inherit',
            }}
        >
            <AdvanceFloatingMenu
                t={t}
                mainBtn={isTopologyView ? changeToDashboardIcon : changeToTopologyIcon}
                actionBtns={isTopologyView ? topologyActionBtns : dashboardActionBtns}
            />
        </div>
    );

    return (
        <>
            <NetworkGraphWrapper
                t={t}
                ref={topologyRef}
                displayView={displayView}
                floatingMenu={floatingMenu}
            />
            <Footer t={t} />
            {/* <Fade
                in={displayView === 'topology'}
                mountOnEnter
                unmountOnExit
            >
                <NetworkGraphWrapper
                    t={t}
                    ref={topologyRef}
                    displayView={displayView}
                />
            </Fade> */}
            {/* <Fade
                in={displayView === 'dashboard'}
                mountOnEnter
                unmountOnExit
            >
                <Dashboard />
            </Fade> */}
            {/* <div
                style={{
                    position: 'fixed',
                    bottom: 100,
                    right: 80,
                    zIndex: 10,
                    display: adjustMode ? 'none' : 'inherit',
                }}
            >
                <AdvanceFloatingMenu
                    t={t}
                    mainBtn={isTopologyView ? changeToDashboardIcon : changeToTopologyIcon}
                    actionBtns={isTopologyView ? topologyActionBtns : dashboardActionBtns}
                />
            </div> */}
        </>
    );
};

export default TopologyMain;