import React, {useState, useCallback} from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components';
import {makeStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import * as TabsModule from 'react-simpletabs';
import Constant from '../../constants/common';
import P2Tooltip from '../../components/common/P2Tooltip';
import FormSelectCreator from '../../components/common/FormSelectCreator';

const {
    colors,
    themeObj,
} = Constant;

const Tabs = TabsModule.default;
const StyledTabs = styled(Tabs)`
    .tabs-navigation {
      padding: 0;
    }
    .tabs-menu {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    .tabs-menu-item {
      float: left;
      cursor: pointer;
      max-height: 42px;
      flex: 1;
      max-width: ${props => (props.maxWidth ? props.maxWidth : '')};
    }
    .tabs-menu-item a {
      display: block;
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      color: ${props => props.theme.txt.halfOpa};
    }
    .tabs-menu-item:not(.is-active) a:hover {
      color: ${props => props.theme.primary.light};
    }
    .tabs-menu-item.is-active a {
      border-bottom: 3px solid ${props => props.tabStatus};
      border-top: 0;
      color: ${props => props.theme.primary.main};
      font-weight: 500;
    }
    .tabs-panel {
      display: none;
      padding: 30px;
    }
    .tabs-panel.is-active {
      display: block;
    }
`;

const radioOptions = ['channelBandwidth', 'channel', 'txpower'];

const genRadioTabHeader = (t, tempConnectRadio, radioName, radioStatus) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: radioStatus ? themeObj.primary.main : colors.inactiveRed,
            fontSize: '13px',
            userSelect: 'none',
        }}
        key={radioName}
    >
        {radioStatus ? tempConnectRadio ?
            (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                }}
                >
                    <span>{t(`radioTitle.${radioName}`)}</span>
                    <P2Tooltip
                        title={t('invalidConfigLbl')}
                        content={(<Typography
                            style={{
                                marginLeft: '5px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: '#fff',
                                lineHeight: '16px',
                                textAlign: 'center',
                                backgroundColor: '#122d54',
                            }}
                        >T</Typography>)}
                        key={radioName}
                    />
                </span>
            ) :
            t(`radioTitle.${radioName}`) :
            (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                }}
                >
                    <span>{t(`radioTitle.${radioName}`)}</span>
                    <P2Tooltip
                        title={t('invalidConfigLbl')}
                        content={(<i
                            className="material-icons"
                            style={{
                                fontSize: '16px',
                                marginLeft: '5px',
                                marginBottom: '0.5px',
                            }}
                        >error</i>)}
                        key={radioName}
                    />
                </span>
            )}
    </div>
)

const genRadioTabContent = (
    t, radioName, handleChange, parsedLostNodeConfigRadioData, parsedLostNodeConfigRadioOptions,
    parsedLostNodeConfigRadioError, parsedLostNodeLoadConfigRadioData, parsedLostNodeLoadConfigRadioOptions,
    tempConnectRadio, showPreviousConfig
) => {
    const options = radioOptions.map(opt => {
        let inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)}`;
        let helperText = parsedLostNodeConfigRadioError[opt] ?
            t('invalidEnumVal') :
            `${t(`optionObj.radioSettings.${opt}.helperText`)}`;
        const menuItemObj = parsedLostNodeConfigRadioOptions[opt].type !== 'invalid' ? parsedLostNodeConfigRadioOptions[opt].data : []
        if (tempConnectRadio && showPreviousConfig) {
            const controlNodeConfigDisplayValue = menuItemObj
                .find(option => option.actualValue === parsedLostNodeLoadConfigRadioData[opt])
            inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)} <${controlNodeConfigDisplayValue?.displayValue ?? parsedLostNodeLoadConfigRadioData[opt]}>`;
        }
        return (
            <FormSelectCreator
                key={opt}
                errorStatus={Boolean(parsedLostNodeConfigRadioError[opt])}
                radio={radioName}
                margin="normal"
                inputLabel={inputLabel}
                inputID={opt}
                inputValue={parsedLostNodeConfigRadioData[opt]}
                onChangeField={(e) => handleChange(e, radioName)}
                menuItemObj={menuItemObj}
                helperText={helperText}
            />
        )
    });
    return (
        <div
            component="div"
            dir="x"
            style={{overflow: 'hidden'}}
            key={radioName}
        >
            {options}
        </div>
    );
};

const genRadioConfigTabPanels = (
    t, parsedConfigData, parsedLoadData, parsedConfigOptions, parsedErrorStatus,
    lostNodeIp, lostNodeRadio, handleChange, showPreviousConfig,
) => Object.keys(parsedConfigData.radioSettings[lostNodeIp]).map(radioName => {
    const tempConnectRadio = radioName === lostNodeRadio;
    const parsedLostNodeConfigRadioData = parsedConfigData.radioSettings[lostNodeIp][radioName];
    const parsedLostNodeConfigRadioOptions = parsedConfigOptions.radioSettings[lostNodeIp][radioName];
    const parsedLostNodeConfigRadioError = parsedErrorStatus.radioSettings[lostNodeIp][radioName];
    const parsedLostNodeLoadConfigRadioData = parsedLoadData.radioSettings[lostNodeIp][radioName];
    const parsedLostNodeLoadConfigRadioOptions = parsedConfigOptions.radioSettings[lostNodeIp][radioName];
    const radioStatus = radioOptions.every(key =>
        !parsedErrorStatus.radioSettings[lostNodeIp][radioName][key]);

    const radioTabHeader = genRadioTabHeader(t, tempConnectRadio, radioName, radioStatus);
    const radioTabContent = genRadioTabContent(
        t, radioName, handleChange, parsedLostNodeConfigRadioData, parsedLostNodeConfigRadioOptions,
        parsedLostNodeConfigRadioError, parsedLostNodeLoadConfigRadioData, parsedLostNodeLoadConfigRadioOptions,
        tempConnectRadio, showPreviousConfig
    );
    return (
        <Tabs.Panel
            title={radioTabHeader}
            key={`tabData_${radioName}`}
        >
            {radioTabContent}
        </Tabs.Panel>
    );
});

const useStyles = makeStyles({
    menuItemClass: Constant.theme.typography.title,
});

const NodeRecoveryConfigAdjustBasic = ({
    t, configData, configOptions, errorStatus,
    lostNodeIp, lostNodeRadio, updateConfigData, loadData, clusterConfigMismatchButton,
    saveRecoveryButton, updateAction, showPreviousConfig,
}) => {
    const classes = useStyles();
    const [radioConfigTabNo, setRadioConfigTabNo] = useState(1);
    // console.log('kyle_debug ~ file: NodeRecoveryBasicAdjust.jsx ~ line 7 ~ errorStatus', JSON.parse(errorStatus))
    // console.log('kyle_debug ~ file: NodeRecoveryBasicAdjust.jsx ~ line 7 ~ configOption', JSON.parse(configOptions))
    // console.log('kyle_debug ~ file: NodeRecoveryBasicAdjust.jsx ~ line 7 ~ configData', JSON.parse(configData))
    // console.log('kyle_debug ~ file: NodeRecoveryBasicAdjust.jsx ~ line 207 ~ loadData', JSON.parse(loadData));

    const handleChange = useCallback((event, radioName) => {
        const inputID = event.target.id || event.target.name;
        const inputValue = event.target.value;
        updateAction(draft => 'UPDATE');
        updateConfigData(draft => {
            draft.radioSettings[lostNodeIp][radioName][inputID] = inputValue;
        });
    }, [updateConfigData, updateAction, lostNodeIp]);

    const genStyledTabs = useCallback((configData, configOptions, errorStatus, loadData) => {
        const parsedConfigData = JSON.parse(configData);
        const parsedConfigOptions = JSON.parse(configOptions);
        const parsedErrorStatus = JSON.parse(errorStatus);
        const parsedLoadData = JSON.parse(loadData);

        const radioConfigTabPanels = genRadioConfigTabPanels(
            t, parsedConfigData, parsedLoadData, parsedConfigOptions, parsedErrorStatus,
            lostNodeIp, lostNodeRadio, handleChange, showPreviousConfig,
        );

        const tabRadioMapping = {
            1: 'radio0',
            2: 'radio1',
            3: 'radio2',
        }

        const tabStatus = radioOptions.every(key =>
            !parsedErrorStatus.radioSettings[lostNodeIp][tabRadioMapping[radioConfigTabNo]][key]);

        const allTabStatus = Object.keys(parsedConfigData.radioSettings[lostNodeIp]).every(radioName =>
            radioOptions.every(key =>
                !parsedErrorStatus.radioSettings[lostNodeIp][radioName][key]
            )
        )

        return {
            tabs: (
                <StyledTabs
                    tabStatus={tabStatus ? themeObj.primary.main : colors.inactiveRed}
                    maxWidth="120px"
                    theme={themeObj}
                    className={classes.menuItemClass}
                    tabActive={radioConfigTabNo}
                    onAfterChange={setRadioConfigTabNo}
                >
                    {radioConfigTabPanels}
                </StyledTabs>
            ),
            saveButtonDisabled: !allTabStatus,
        };
    }, [t, classes, lostNodeIp, lostNodeRadio, radioConfigTabNo, handleChange, showPreviousConfig])

    const {tabs, saveButtonDisabled} = genStyledTabs(configData, configOptions, errorStatus, loadData);

    return (
        <div style={{position: 'relative'}}>
            <div style={{
                position: 'absolute',
                right: '0',
                marginTop: '6px',
            }}>
                {clusterConfigMismatchButton}
            </div>
            {tabs}
            <div style={{float: 'right', marginTop: 50}} >
                {saveRecoveryButton(saveButtonDisabled)}
            </div>
        </div>
        );
}

NodeRecoveryConfigAdjustBasic.propTypes = {
    t: PropTypes.func.isRequired,
    configData: PropTypes.string.isRequired,
    loadData: PropTypes.string.isRequired,
    configOptions: PropTypes.string.isRequired,
    errorStatus: PropTypes.string.isRequired,
    lostNodeIp: PropTypes.string.isRequired,
    lostNodeRadio: PropTypes.string.isRequired,
    updateConfigData: PropTypes.func.isRequired,
    updateAction: PropTypes.func.isRequired,
    clusterConfigMismatchButton: PropTypes.node.isRequired,
    saveRecoveryButton: PropTypes.func.isRequired,
    showPreviousConfig: PropTypes.bool.isRequired,
}

export default React.memo(NodeRecoveryConfigAdjustBasic)
