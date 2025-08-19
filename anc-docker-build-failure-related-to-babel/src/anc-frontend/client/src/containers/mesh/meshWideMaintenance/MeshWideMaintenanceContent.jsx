/**
 * @Author: mango
 * @Date:   2018-04-04T19:31:25+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-04-19T12:00:28+08:00
 */
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import * as TabsModule from 'react-simpletabs';
import {useHistory} from 'react-router-dom';
import {makeStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import SvgIcon from '@material-ui/core/SvgIcon';
import P2Dialog from '../../../components/common/P2Dialog';
import LockLayer from '../../../components/common/LockLayer';
import Constants from '../../../constants/common';
import {openDeviceListDialog} from '../../../redux/common/commonActions';
import useMeshWideMaintenanceCommon from './useMeshWideMaintenanceCommon';
import MeshWideMaintenanceFwWrapper from './MeshWideMaintenanceFwWrapper';
import MeshWideMaintenanceReboot from './MeshWideMaintenanceReboot';
import MeshWideMaintenanceBackup from './MeshWideMaintenanceBackup';
import MeshWideRestore from './MeshWideRestore';
import MeshWideLogExport from './MeshWideLogExport';
import NetworkEventCenter from '../../../components/networkEventCenter/NetworkEventCenter';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
const {theme, themeObj} = Constants;

const useStyles = makeStyles({
    tabGridClass: {
        marginLeft: 0,
    },
    menuItemClass: theme.typography.title,
    itemMenuDivClass: {
        display: 'flex',
        alignItems: 'center',
    },
    itemMenuTxtClass: {
        fontSize: '14px',
        marginLeft: 6,
        userSelect: 'none',
    },
    itemMenuSvgSubClass: {
        transform: 'translate(4px, 4px)',
        color: themeObj.mainBgColor,
    },
    itemMenuIconClass: {
        fontSize: 14,
    },
    svgIconStyle: {
        fontSize: '14px',
    },
    root: {
        flexGrow: 1,
    },
});

const tabData = [
    {
        id: 0,
        ligature: null,
        dArr: [
            {
                d: 'M 10 0C 4.48 0 0 4.48 0 10C 0 15.52 4.48 20 10 ' +
                '20C 15.52 20 20 15.52 20 10C 20 4.48 15.52 0 10 0L 10 0Z',
                key: '00',
            },
            {
                d: 'M 3.42857 11L 8.57143 11L 8.57143 5.92308L ' +
                '12 5.92308L 6 0L 0 5.92308L 3.42857 5.92308L 3.42857 11Z',
                key: '11',
            },
        ],
    },
    {
        id: 1,
        ligature: 'power_settings_new',
        dArr: [],
    },
    {
        id: 2,
        ligature: 'cloud_upload',
        dArr: [],
    },
    {
        id: 3,
        ligature: 'restore',
        dArr: [],
    },
    {
        id: 4,
        ligature: 'build',
        dArr: [],
    },
    {
        id: 5,
        ligature: 'build',
        dArr: [],
    },
];

const Tabs = TabsModule.default;
const StyledTabs = styled(Tabs)`
    .tabs-navigation {
      padding: 0 30px;
      border-bottom: 1px solid ${props => props.theme.tabBorder};
    }
    .tabs-menu {
      display: table;
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    .tabs-menu-item {
      float: left;
      cursor: pointer;
      max-height: 42px;
    }
    .tabs-menu-item a {
      display: block;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      color: ${props => props.theme.txt.halfOpa};
    }
    .tabs-menu-item:not(.is-active) a:hover {
      color: ${props => props.theme.primary.light};
    }
    .tabs-menu-item.is-active a {
      background: ${props => props.theme.mainBgColor};
      border: 1px solid ${props => props.theme.tabBorder};
      border-top: 3px solid ${props => props.theme.primary.main};
      border-bottom: 0;
      color: ${props => props.theme.primary.main};
      font-weight: bold;
    }
    .tabs-panel {
      display: none;
      padding: 30px;
    }
    .tabs-panel.is-active {
      display: block;
    }
    .tab-panel {
      height: calc(100vh - 48px - 96.9px - 42.81px);
      overflow-y: auto;
    }
`;

const MeshWideMaintenanceContent = () => {
    const dispatch = useDispatch();
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('cluster-maintenance');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const classes = useStyles();
    const {
        isLoading,
        isInit,
        nodeInfo,
        nodes,
        refreshFunc,
        tableData,
        error,
        loadNodeInfoSuccess,
    } = useMeshWideMaintenanceCommon({t, ready});
    const history = useHistory();

    const [activeTab, setActiveTab] = useState(
        parseInt(Cookies.get('MeshWideMaintenanceActiveTab'), 10) ?? 1);

    const didmountFunc = () => {
        const tabCookies = Cookies.get('MeshWideMaintenanceActiveTab');
        if (tabCookies) {
            setActiveTab(parseInt(tabCookies, 10));
        }
    };
    useEffect(didmountFunc, []);

    if (!ready) return <span />;

    const tabContent = [
        <MeshWideMaintenanceFwWrapper
            isInit={isInit}
            refreshFunc={refreshFunc}
            tableData={tableData}
            nodeInfo={nodeInfo}
            nodes={nodes}
        />,
        <MeshWideMaintenanceReboot
            refreshFunc={refreshFunc}
            tableData={tableData}
        />,
        <MeshWideMaintenanceBackup
            refreshFunc={refreshFunc}
            tableData={tableData}
            loadNodeInfoSuccess={loadNodeInfoSuccess}
        />,
        <MeshWideRestore />,
        // <span> MeshWideRestore</span>,
        <MeshWideLogExport
            type="mesh"
            refreshFunc={refreshFunc}
            tableData={tableData}
        />,
        <NetworkEventCenter />,
    ];

    const TabItemComponent = (someProps) => {
        const {
            viewBox,
            titleTxt,
            dArr,
            ligature,
            customIcon,
        } = someProps;
        const RenderIcon = customIcon ? customIcon : (
            !ligature ? (
                <SvgIcon
                    viewBox={viewBox}
                    classes={{root: classes.svgIconStyle}}
                >
                    {
                        dArr.map((d, idx) => (
                            <path
                                className={idx > 0 ? classes.itemMenuSvgSubClass : ''}
                                d={d.d}
                                key={`tabItemSvg_${d.key}`}
                            />
                        ))
                    }
                </SvgIcon>
            ) : (
                <Icon className={classes.itemMenuIconClass}>{ligature}</Icon>
            )
        );
        return (
            <div className={classes.itemMenuDivClass}>
                {RenderIcon}
                <span className={classes.itemMenuTxtClass}>{titleTxt}</span>
            </div>
        );
    };

    const TabPanels = tabData.map((tabItem, idx) => {
        const someProps = {
            viewBox: '0 0 20 20',
            dArr: tabItem.dArr,
            titleTxt: t('tabData', {returnObjects: true})[idx].title,
            ligature: tabItem.ligature,
            customIcon: tabItem.id === 5 ? <AssignmentOutlinedIcon className={classes.svgIconStyle} /> : null,
        };
        return (
            <Tabs.Panel
                title={<TabItemComponent {...someProps} />}
                key={`tabData_${tabItem.id}`}
            >
                {tabContent[tabItem.id]}
            </Tabs.Panel>
        );
    });

    const getTitle = () => {
        if (error === '') return '';
        return t(`${error}Title`);
    };

    const getContent = () => {
        if (error === '') return '';
        return t(`${error}Content`);
    };
    return (
        <MuiThemeProvider theme={theme}>
            <Grid container className={classes.root}>
                <Grid className={classes.tabGridClass} item xs={12} lg={12} xl={12}>
                    <StyledTabs
                        theme={themeObj}
                        className={classes.menuItemClass}
                        tabActive={activeTab}
                        onBeforeChange={(tabNum) => {
                            Cookies.set('MeshWideMaintenanceActiveTab', tabNum);
                            setActiveTab(tabNum);
                            if (tabNum !== 4 && tabNum !== 5 && tabNum !== 6) {
                                refreshFunc();
                            }
                        }}
                    >
                        {TabPanels}
                    </StyledTabs>
                </Grid>
            </Grid>
            <LockLayer display={isLoading && activeTab !== 4} />
            <P2Dialog
                open={error !== ''}
                handleClose={() => {}}
                title={getTitle()}
                content={getContent()}
                actionTitle={error === 'mismatchDevice' ? t('backToDeviceList') : t('backToTopology')}
                actionFn={() => {
                    if (error === 'mismatchDevice') {
                        dispatch(openDeviceListDialog());
                    }
                    // history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                }}
            />
        </MuiThemeProvider>
    );
};

export default MeshWideMaintenanceContent;
