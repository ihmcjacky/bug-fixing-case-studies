/**
 * @Author: mango
 * @Date:   2018-04-04T19:31:25+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-04-19T12:00:28+08:00
 */
import React, {useState, useEffect} from 'react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as TabsModule from 'react-simpletabs';
import {makeStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import SvgIcon from '@material-ui/core/SvgIcon';
import Constants from '../../../constants/common';

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
        ligature: 'settings',
        dArr: [],
    },
    {
        id: 1,
        ligature: 'verified_user',
        dArr: [],
    },
    {
        id: 2,
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

const ConfigContent = (props) => {
    const classes = useStyles();
    const {refreshFunc, t} = props;

    const [activeTab, setActiveTab] = useState(1);

    const didmountFunc = () => {
        const tabCookies = Cookies.get('MeshWideConfigActiveTab');
        if (tabCookies) {
            setActiveTab(parseInt(tabCookies, 10));
        }
    };
    useEffect(didmountFunc, []);

    const tabContent = [
        <div>tab 1</div>,
        <div>tab 2</div>,
        <div>tab 3</div>,
    ];

    const TabItemComponent = (someProps) => {
        const {
            viewBox,
            titleTxt,
            dArr,
            ligature,
        } = someProps;
        const RenderIcon = !ligature ? (
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

    return (
        <MuiThemeProvider theme={theme}>
            <Grid container className={classes.root}>
                <Grid className={classes.tabGridClass} item xs={12} lg={12} xl={12}>
                    <StyledTabs
                        theme={themeObj}
                        className={classes.menuItemClass}
                        tabActive={activeTab}
                        onBeforeChange={(tabNum) => {
                            Cookies.set('MeshWideConfigActiveTab', tabNum);
                            refreshFunc();
                        }}
                    >
                        {TabPanels}
                    </StyledTabs>
                </Grid>
            </Grid>
        </MuiThemeProvider>
    );
};

ConfigContent.propTypes = {
    refreshFunc: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
}

export default ConfigContent;
