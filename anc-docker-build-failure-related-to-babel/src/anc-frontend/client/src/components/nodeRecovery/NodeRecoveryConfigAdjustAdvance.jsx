import React, {useState, useCallback} from 'react'
import {useSelector} from 'react-redux';
import {Trans} from 'react-i18next';
import styled from 'styled-components';
import * as TabsModule from 'react-simpletabs';
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/styles';
import {
    Switch,
    FormControl,
    InputLabel,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RangeSlider from '../../components/common/RangeSlider';
import Constant from '../../constants/common';
import P2Tooltip from '../common/P2Tooltip';
import FormSelectCreator from '../common/FormSelectCreator';
import FormInputCreator from '../common/FormInputCreator';
import AtpcRangeSlider from '../../components/common/AtpcRangeSlider';
import {validateAtpcRange} from '../../util/commonFunc';
import { isFwLTE, checkFwLTEDetail } from '../../util/common';

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

const useStyles = makeStyles({
    accordionPanelRoot: {
        marginBottom: '20px',
        '&:before': {
            display: 'none',
        },
        borderRadius: '2px',
    },
    accordionSummaryExpandedWithWarn: {
        margin: '20px 0px',
    },
    accordionSummaryExpanded: {
        margin: '12px 0px',
        '&.wtf': {
            margin: '12px 0px !important',
        },
    },
    tooltipStyle: {
        fontSize: '12px',
        padding: '2px',
        textAlign: 'left',
        // width: '250px',
    },
    accordionPanelExpanded: {
        margin: '0px !important',
        // margin: '0px 0px 15px 0px',
    },
    menuItemClass: Constant.theme.typography.title,
});

const createTitle = (hostname, lostNode, mac) => (
    <div style={{display: 'flex', alignItems: 'center',  flexDirection: 'column', marginBottom: '20px'}}>
        <span style={{display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #122d54'}}>
            <Typography color="primary" variant="h5">{hostname}</Typography>
            <Typography color="primary" style={{marginLeft: '5px'}} variant="subtitle1">
                {lostNode ? '(Lost Node)' : '(Control Node)'}
            </Typography>
        </span>
        <Typography color="primary">{mac}</Typography>
    </div>
);

const createTabHeader = ({
    title, invalidTitle, lostNode, errorStatus,
    tempConnectRadio = false,
    warnStatus = false,
}) => {
    let content = <span />;
    let color = themeObj.primary.main;
    if (errorStatus || warnStatus) {
        content = (
            <i
                className="material-icons"
                style={{
                    fontSize: '16px',
                    marginLeft: '5px',
                    marginBottom: '0.5px',
                }}
            >error</i>
        );
        if (errorStatus) {
            color = colors.inactiveRed;
        } else if (warnStatus) {
            color = colors.warningColor;
        }
    } else if (tempConnectRadio) {
        content = (
            <Typography
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
            >T</Typography>
        )
    }
    return {
        color,
        header: (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    fontSize: '13px',
                    userSelect: 'none',
                }}
                key={`${lostNode? 'lostNode': 'controlNode'}_${title}`}
            >
                {errorStatus || warnStatus || tempConnectRadio?
                    (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                        }}
                        >
                            <span>{title}</span>
                            <P2Tooltip
                                title={invalidTitle}
                                content={content}
                                key={title}
                            />
                        </span>
                    ) :
                    title
                }
            </div>
        ),
    };
}

const createNodeTabPanels = ({
    t, radioSettings, profileSettings, nodeSettings,
    profileOption, profileError, nodeError, nodeIp,
    handleChange, lostNode, tabActive,
}) => {
    const {color: generalColor, header: generalTitle} = createTabHeader({
        title: t('generalTab'),
        errorStatus: nodeError[nodeIp].hostname,
        invalidTitle: t('invalidConfigLbl'),
        lostNode,
    });
    const sumOfRadioMaxNbr =  Object.keys(radioSettings[nodeIp])
        .reduce((acc, radioName) => {
            const maxNbr = radioSettings[nodeIp]?.[radioName]?.status === 'disable' ?
                0 :
                parseInt(radioSettings[nodeIp]?.[radioName]?.maxNbr ?? 0, 10);
            return acc + maxNbr;
        }, 0);
    const {color: advancedColor, header: advanceTitle} = createTabHeader({
        title: t('advancedTab'),
        errorStatus: profileError[nodeIp].nbr['1'].maxNbr,
        warnStatus: profileSettings[nodeIp].nbr['1'].maxNbr < sumOfRadioMaxNbr,
        invalidTitle: t('invalidConfigLbl'),
        lostNode,
    })
    const menuItemObj = profileOption[nodeIp].nbr['1'].maxNbr.type !== 'invalid' ?
        profileOption[nodeIp].nbr['1'].maxNbr.data : [];
    const generalTab = (
        <Tabs.Panel
            key={`${lostNode? 'lostNode': 'controlNode'}_general`}
            title={generalTitle}
        >
            <div
                component="div"
                dir="x"
                style={{overflow: 'hidden'}}
            >
                <FormInputCreator
                    key={`${lostNode? 'lostNode': 'controlNode'}_hostname`}
                    errorStatus={Boolean(nodeError[nodeIp].hostname)}
                    inputLabel={t(`optionObj.nodeSettings.hostname.title`)}
                    inputID={`${lostNode? 'lostNode': 'controlNode'}_hostname`}
                    inputValue={nodeSettings[nodeIp].hostname}
                    onChangeField={(_, __, inputValue) => handleChange({
                        nodeIp, settings: 'nodeSettings',
                        id: 'hostname', value: inputValue,
                    })}
                    placeholder={t(`optionObj.nodeSettings.hostname.placeholder`)}
                    autoFocus={false}
                    margin="normal"
                    helperText={nodeError[nodeIp].hostname ?
                        t('invalidHostnameRegex'):
                        t(`optionObj.nodeSettings.hostname.helperText`)
                    }
                    inputType="text"
                    delayInput
                />
            </div>
        </Tabs.Panel>
    );
    const advancedTab = (
        <Tabs.Panel
            key={`${lostNode? 'lostNode': 'controlNode'}_advance`}
            title={advanceTitle}
        >
            <div
                component="div"
                dir="x"
                style={{overflow: 'hidden'}}
            >
                <FormSelectCreator
                    key={`${lostNode? 'lostNode': 'controlNode'}_nodeMax`}
                    errorStatus={Boolean(profileError[nodeIp].nbr['1'].maxNbr)}
                    warnStatus={profileSettings[nodeIp].nbr['1'].maxNbr < sumOfRadioMaxNbr}
                    margin="normal"
                    inputLabel={t(`optionObj.nodeSettings.maxNbr.title`)}
                    inputID={`${lostNode? 'lostNode': 'controlNode'}_nodeMax`}
                    inputValue={profileSettings[nodeIp].nbr['1'].maxNbr}
                    onChangeField={(e) =>  handleChange({
                        event: e, nodeIp, id: 'maxNbr', settings: 'profileSettings',
                    })}
                    menuItemObj={menuItemObj}
                    helperText={profileError[nodeIp].nbr['1'].maxNbr ?
                        t('invalidEnumVal'):
                        t(`optionObj.nodeSettings.maxNbr.helperText`)
                    }
                />
            </div>
        </Tabs.Panel>
    );
    const NodeTabMapping = {
        1: generalColor,
        2: advancedColor,
    };
    return {
        tabColor: NodeTabMapping[tabActive],
        errorStatus: Boolean(nodeError[nodeIp].hostname) || Boolean(profileError[nodeIp].nbr['1'].maxNbr),
        warnStatus: profileSettings[nodeIp].nbr['1'].maxNbr < sumOfRadioMaxNbr,
        tabs: [
            generalTab,
            advancedTab,
        ]
    };
};

const createNetworkInterfaceTabContent = ({
    t, radioSettings, radioOption, radioError,
    nodeIp, tempRadio, handleChange, lostNode,
    radioName, radioOptionKeys, loadData, tabHeader,
    showPreviousConfig,
}) => {
    console.log(radioOptionKeys)
    const options = radioOptionKeys.flatMap(opt => {
        // Exclude all options which are not select DOM, all getFilterOptions with data type not array are skipped
        if (['rssiFilterLower', 'rssiFilterUpper', radioSettings[nodeIp][radioName].band === '5' ?
            'centralFreq' : 'channel', 'mobilityDomain', 'atpcTargetRssi', 'atpcRangeUpper',
            'atpcRangeLower'
        ].includes(opt)) {
            return [];
        };
        const inputProps = {};
        if (opt === 'channelBandwidth') {
            inputProps.showHelpTooltip = true;
            inputProps.helpTooltip = (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
                >
                    <span>{t(`optionObj.radioSettings.${opt}.title`)}</span>
                    <P2Tooltip
                        direction="right"
                        title={<div style={{
                            fontSize: '12px',
                            padding: '2px',
                        }}
                        >
                            {t(`optionObj.radioSettings.${opt}.tooltip`)}
                        </div>}
                        content={(<i
                            className="material-icons"
                            style={{
                                color: themeObj.primary.light,
                                fontSize: '20px',
                                marginLeft: '5px',
                                marginTop: '-1px',
                            }}
                        >help</i>)}
                        key={radioName}
                    />
                </span>
            );
        }
        let inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)}`;
        let helperText = radioError[nodeIp][radioName][opt] ? t('invalidEnumVal') : `${t(`optionObj.radioSettings.${opt}.helperText`)}`;
        const menuItemObj = radioOption[nodeIp][radioName][opt].type !== 'invalid' ? radioOption[nodeIp][radioName][opt].data : []

        if (lostNode && (tempRadio === radioName) && showPreviousConfig) {
            const controlNodeConfigDisplayValue = menuItemObj
                .find(option => option.actualValue === loadData.radioSettings[nodeIp][radioName][opt])
            const loadValueLabel = controlNodeConfigDisplayValue?.displayValue ?? loadData.radioSettings[nodeIp][radioName][opt]
            inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)} <${loadValueLabel}>`;
        }
        return [(
            <FormSelectCreator
                key={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                errorStatus={Boolean(radioError[nodeIp][radioName][opt])}
                margin="normal"
                inputLabel={inputLabel}
                inputID={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                inputValue={radioSettings[nodeIp][radioName][opt]}
                onChangeField={(e) => handleChange({event: e, id: opt, nodeIp, radioName, settings: 'radioSettings'})}
                menuItemObj={menuItemObj}
                helperText={helperText}
                {...inputProps}
            />
        )]
    });
    return (
        <Tabs.Panel
            title={tabHeader}
            key={`${lostNode? 'lostNode': 'controlNode'}_tabData_${radioName}`}
        >
            <div
            component="div"
            dir="x"
            style={{overflow: 'hidden'}}
            key={radioName}
        >
                {options}
            </div>
        </Tabs.Panel>
    );
};

const createNetworkInterfaceTabPanels = ({
    t, radioSettings, radioOption, radioError,
    nodeIp, tempRadio, handleChange, lostNode,
    tabActive, nodeInfo, loadData, showPreviousConfig,
}) => {
    const tabs = Object.keys(radioSettings[nodeIp]).map(radioName => {
        const radioOptionKeys = Constant.modelOption[nodeInfo[nodeIp].model].radioSettings[radioName];
        const advanceOptionKeys = Constant.advancedConfigOption[radioName];
        const uniqueOptionsKeys = new Set([...radioOptionKeys, ...advanceOptionKeys]);

        const errorStatus = ![...uniqueOptionsKeys].every(key => !radioError[nodeIp][radioName][key]);
        const tabHeader = createTabHeader({
            title: t(`radioTitle.${radioName}`),
            errorStatus,
            invalidTitle: t('invalidConfigLbl'),
            tempConnectRadio: tempRadio === radioName,
            lostNode,
        });
        const tabContent = createNetworkInterfaceTabContent({
            t, radioSettings, radioOption, radioError,
            nodeIp, tempRadio, handleChange, lostNode,
            radioName, radioOptionKeys, loadData,
            tabHeader: tabHeader.header,
            showPreviousConfig
        });
        return {
            tabHeader,
            tabContent,
            errorStatus,
        }
    });

    return {
        tabColor: tabs.map(tab => tab.tabHeader.color)[tabActive - 1],
        errorStatus: tabs.some(tab => tab.errorStatus),
        tabs: tabs.map(tab => tab.tabContent),
    };
};

const createRssiToleranceMenuItem = ({radioSettings, radioOption, nodeIp, radioName}) => {
    const configOptions = radioOption?.[nodeIp]?.[radioName] ?? null;
    const {rssiFilterTolerance} = radioSettings[nodeIp][radioName];
    const options = [];
    // check whether the node supports rssi filter tolerance
    if (configOptions.rssiFilterLower.type === 'enum' &&
        configOptions.rssiFilterUpper.type === 'enum') {
        return [{
            actualValue: rssiFilterTolerance, displayValue: `${rssiFilterTolerance} dBm`,
        }];
    } else {
        for (let tolerance = 0; tolerance <= 30; tolerance += 1) {
            options.push({
                actualValue: tolerance, displayValue: `${tolerance} dBm`,
            });
        }
        return options;
    }
}

const validateRssiFilterRange = (rssiFilterLower, rssiFilterUpper, min, max) => {
    if ((rssiFilterLower === 255 || (rssiFilterLower >= min && rssiFilterLower <= max)) ||
        ((rssiFilterUpper === 255 || (rssiFilterUpper >= min && rssiFilterUpper <= max)))) {
        if (rssiFilterLower !== 255 && rssiFilterUpper !== 255) {
            return {result: (rssiFilterUpper - rssiFilterLower) > 1, text: ''};
        }
        return {result: true, text: ''};
    }
    return {result: false, text: 'This field contains invalid value.'};
};

const createAtpcTargetRssiSettings = ({radioSettings, radioOption, nodeIp, radioName}) => {
    console.log(radioSettings);
    let enable = true;
    let validRange = true;

    const {atpcTargetRssi, atpcRangeUpper, atpcRangeLower} = radioSettings[nodeIp][radioName];
    let range = [Number(atpcRangeLower), Number(atpcTargetRssi), Number(atpcRangeUpper)];
    console.log(range)
    // validate range at last
    validRange = validateAtpcRange({atpcTargetRssi, atpcRangeUpper, atpcRangeLower});

    return {
        range,
        enable,
        validRange
    };
}

const createRssiUpperSettings = ({radioSettings, radioOption, nodeIp, radioName}) => {
    let range = [0, 0];
    let enable = true;
    let validRange = true;
    const {rssiFilterLower, rssiFilterUpper} = radioSettings[nodeIp][radioName];
    if (rssiFilterLower === 255 && rssiFilterUpper === 255) {
        range = [-95, 0];
        const filteredConfigOptions = radioOption[nodeIp][radioName];
         // check whether the node supports rssi filter range
        if (filteredConfigOptions.rssiFilterLower.type === 'enum' &&
            filteredConfigOptions.rssiFilterUpper.type === 'enum') {
            enable = false;
        }
    } else if (rssiFilterLower !== 255 && rssiFilterUpper === 255) {
        range = [Number(rssiFilterLower), 0];
    } else if (rssiFilterLower === 255 && rssiFilterUpper !== 255) {
        range = [-95, Number(rssiFilterUpper)];
    } else {
        range = [Number(rssiFilterLower), Number(rssiFilterUpper)];
    }

    validRange = validateRssiFilterRange(rssiFilterLower, rssiFilterUpper, -95, 0).result;
    return {
        range,
        enable,
        validRange,
    }
};

const createAdvancedTooltip = ({t, opt, classes}) => {
    const oneLineTooltip = (
        <div className={classes.tooltipStyle}>
            <div>
                {t(`optionObj.radioSettings.${opt}.tooltip0`)}
            </div>
        </div>
    );
    const twoLineTooltip = (
        <div className={classes.tooltipStyle}>
            <div>
                {t(`optionObj.radioSettings.${opt}.tooltip0`)}
            </div>
            <br />
            <div>
                <i>{t(`optionObj.radioSettings.${opt}.tooltip1`)}</i>
            </div>
        </div>
    );
    const threeLineTooltip = (
        <div className={classes.tooltipStyle}>
            <div>
                {t(`optionObj.radioSettings.${opt}.tooltip0`)}
            </div>
            <div style={{fontWeight: 900, paddingTop: '10px'}}>
                {t(`optionObj.radioSettings.${opt}.tooltip1`)}
            </div>
            <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                {t(`optionObj.radioSettings.${opt}.tooltip2`)}
            </div>
        </div>
    );
    switch (opt) {
        case 'rssiFilterTolerance':
            return twoLineTooltip;
        case 'maxNbr':
            return oneLineTooltip;
        case 'radioFilter':
            return oneLineTooltip;
        case 'mcs':
            return twoLineTooltip;
        case 'shortgi':
            return twoLineTooltip;
        case 'rtsCts':
            return threeLineTooltip;
        case 'distance':
            return oneLineTooltip;
        default:

    }
}

const createHelperTooltip = ({advancedTooltip, title}) => {
    return (
        <span style={{
            display: 'flex',
            alignItems: 'center',
        }}
        >
            <span>{title}</span>
            <P2Tooltip
                direction="right"
                title={advancedTooltip}
                content={(<i
                    className="material-icons"
                    style={{
                        color: themeObj.primary.light,
                        fontSize: '20px',
                        marginLeft: '5px',
                        marginTop: '-1px',
                    }}
                >help</i>)}
            />
        </span>
    );
}

const createAdvancedTabContent = ({
    t, radioSettings, radioOption, radioError,
    nodeIp, tempRadio, handleChange, lostNode,
    tabActive, nodeInfo, loadData, radioName,
    radioOptionKeys, radioOptionKeysType, classes,
    showPreviousConfig,
}) => radioOptionKeys.flatMap(opt => {
    // skip items with form type "" (empty string) 
    console.log(opt);
    console.log(nodeInfo)
    // control hide or show of configuration items in node recovery advanced conf
    let skipEmptyStrArr = ['rssiFilterLower', 'atpcRangeLower', 'atpcRangeUpper'];
    // skip if firmware version not support atpc
    const {atpcSupportVersion} = Constant;
    const isFwSupportAtpc = checkFwLTEDetail(nodeInfo[nodeIp].firmwareVersion, atpcSupportVersion);
    if (!isFwSupportAtpc) {
        skipEmptyStrArr.push('atpcTargetRssi');
    }
    if (skipEmptyStrArr.indexOf(opt) > -1) return [];

    let inputProps = {};
    const advancedTooltip = createAdvancedTooltip({t, opt, classes});
    const [min, max] = [-95, 0];
    // default rssi filter settings
    let rssiFilterSettings = {
        range: [],
        enable: true,
        validRange: true,
    }
    // default atpc target rssi settings
    let atpcTargetRssiSettings = {
        range: [],
        enable: true,
        validRange: true,
    }
    let inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)}`;
    console.log(radioOption)
    let menuItemObj = radioOption[nodeIp][radioName][opt].type !== 'invalid' ? radioOption[nodeIp][radioName][opt].data : []
    console.log(menuItemObj)
    switch (opt) {
        case 'rssiFilterUpper':
            rssiFilterSettings = createRssiUpperSettings({radioSettings, radioOption, nodeIp, radioName})
            break;
        case 'rssiFilterTolerance':
            menuItemObj = createRssiToleranceMenuItem({radioSettings, radioOption, nodeIp, radioName})
            break;
        case 'atpcTargetRssi':
            atpcTargetRssiSettings = createAtpcTargetRssiSettings({radioSettings, radioOption, nodeIp, radioName})
            console.log(atpcTargetRssiSettings)
            break;
        case 'distance':
            inputProps = {
                enableButton: true,
                buttonLabel: t('distanceCheckboxLabel'),
                compareValue: 'auto',
                showHelpTooltip: true,
            }
            break;
        default:
    }

    console.log(radioOptionKeysType[opt].formType);

    if (lostNode && (tempRadio === radioName) && showPreviousConfig) {
        console.log(radioOptionKeysType);
        const controlNodeConfigDisplayValue = Array.isArray(menuItemObj) && (
            menuItemObj?.find(option => option.actualValue === loadData.radioSettings[nodeIp][radioName][opt]) ?? ''
        );
        const loadValueLabel = controlNodeConfigDisplayValue?.displayValue ?? loadData.radioSettings[nodeIp][radioName][opt]
        inputLabel = `${t(`optionObj.radioSettings.${opt}.title`)} <${loadValueLabel}>`;
    }

    switch (radioOptionKeysType[opt].formType) {
        case 'input':
            return [(
                <FormInputCreator
                    key={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                    errorStatus={Boolean(radioError[nodeIp][radioName][opt])}
                    inputLabel="123"
                    inputID={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                    inputValue={radioSettings[nodeIp][radioName][opt]}
                    onChangeField={(_, __, inputValue) => handleChange({
                        nodeIp, settings: 'radioSettings',
                        id: opt, value: inputValue,
                        radioName,
                    })}
                    autoFocus={false}
                    margin="normal"
                    placeholder={t(`optionObj.radioSettings.${opt}.placeholder`)}
                    helperText={radioError[nodeIp][radioName][opt] ?
                        t('invalidDistanceRange') :
                        t(`optionObj.radioSettings.${opt}.helperText`)
                    }
                    inputType="text"
                    delayInput
                    helpTooltip={createHelperTooltip({title: inputLabel, advancedTooltip})}
                    {...inputProps}
                />
            )];
        case 'select':
            return [(
                <FormSelectCreator
                    key={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                    errorStatus={Boolean(radioError[nodeIp][radioName][opt])}
                    margin="normal"
                    inputLabel={inputLabel}
                    inputID={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                    inputValue={radioSettings[nodeIp][radioName][opt]}
                    onChangeField={(e) => handleChange({event: e, id: opt, nodeIp, radioName, settings: 'radioSettings'})}
                    menuItemObj={menuItemObj}
                    helperText={radioError[nodeIp][radioName][opt] ?
                        t('invalidEnumVal') :
                        `${t(`optionObj.radioSettings.${opt}.helperText`)}`}
                    helpTooltip={createHelperTooltip({title: inputLabel, advancedTooltip})}
                    showHelpTooltip
                    disabled={opt === 'radioFilter' && radioSettings[nodeIp][radioName].band === '4.9'}
                />
            )];
        case 'slider':
            return [(<FormControl
                key={`${lostNode? 'lostNode': 'controlNode'}_${radioName}_${opt}`}
                error={false}
                fullWidth
                margin="dense"
            >
                <div style={{display: 'flex'}}>
                    <InputLabel shrink>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                            <span>{inputLabel}</span>
                            {rssiFilterSettings.validRange ?
                                (<P2Tooltip
                                    direction="right"
                                    title={
                                        <div className={classes.tooltipStyle}>
                                            <div>
                                                {t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                            </div>
                                            <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                {t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                            </div>
                                        </div>
                                    }
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            color: themeObj.primary.light,
                                            fontSize: '20px',
                                            marginLeft: '5px',
                                            marginTop: '-1px',
                                        }}
                                    >help</i>)}
                                />)
                                :
                                (<P2Tooltip
                                    direction="right"
                                    title={
                                        <div className={classes.tooltipStyle}>
                                            {t('rssiFilterToleranceInvalidRange')}
                                        </div>
                                    }
                                    content={
                                        <i
                                            className="material-icons"
                                            style={{
                                                color: colors.mismatchLabel,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >error</i>
                                    }
                                />)
                            }
                        </span>
                    </InputLabel>
                    <div
                        style={{
                            flex: 1,
                            paddingTop: '50px',
                        }}
                    >
                        <RangeSlider
                            value={rssiFilterSettings.range}
                            min={min}
                            max={max}
                            handleSliderOnChange={(e) => {
                                let newRssiFilterLower = e[0];
                                let newRssiFilterUpper = e[1];
                                if (e[0] === -95) {
                                    newRssiFilterLower = 255;
                                }
                                if (e[1] === 0) {
                                    newRssiFilterUpper = 255;
                                }
                                handleChange({
                                    id: 'rssiFilterUpper', radioName, nodeIp,
                                    value: newRssiFilterUpper, settings: 'radioSettings',
                                    moreValue: {rssiFilterLower: newRssiFilterLower}
                                })
                            }}
                            enable={rssiFilterSettings.enable}
                            thumbStyle={{
                                height: 10,
                                width: 5,
                                color: colors.thumbColor,
                                levelFontSize: 12,
                            }}
                            trackStyle={{
                                height: 2,
                                color: themeObj.primary.light,
                                headColor: colors.unmanagedIcon,
                                tailColor: colors.unmanagedIcon,
                            }}
                            labelStyle={{
                                color: colors.labelColor,
                                fontSize: 12,
                            }}
                            unit="dBm"
                        />
                    </div>
                </div>
            </FormControl>)];
        case 'atpc-slider':
            return [(
                <FormControl
                    key={opt}
                    error={false}
                    fullWidth
                    margin="dense"
                >
                    <div style={{display: 'flex'}}>
                        <InputLabel shrink>
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <span>{t(`optionObj.radioSettings.${opt}.title`)}</span>
                                <P2Tooltip
                                    direction="right"
                                    title={
                                        <div className={classes.tooltipStyle}>
                                            <div>
                                                {t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                            </div>
                                            <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                {t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                            </div>
                                        </div>
                                    }
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            color: themeObj.primary.light,
                                            fontSize: '20px',
                                            marginLeft: '5px',
                                            marginTop: '-1px',
                                        }}
                                    >help</i>)}
                                />
                            </span>
                        </InputLabel>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            paddingTop: '50px',
                        }}
                    >
                        <AtpcRangeSlider
                            t={t}
                            value={atpcTargetRssiSettings.range}
                            min={min}
                            max={max}
                            handleSliderOnChange={(e) => {
                                let newAtpcRangeLower = e[0];
                                let newAtpcTargetRssi = e[1];
                                let newAtpcRangeUpper = e[2];

                                console.log(newAtpcRangeLower)
                                console.log(newAtpcRangeUpper)
                                
                                handleChange({
                                    id: 'atpcTargetRssi', radioName, nodeIp,
                                    value: newAtpcTargetRssi, settings: 'radioSettings',
                                    moreValue: {atpcRangeLower: newAtpcRangeLower, atpcRangeUpper: newAtpcRangeUpper}
                                });
                            }}
                            enable={atpcTargetRssiSettings.enable}
                            thumbStyle={{
                                height: 10,
                                width: 5,
                                color: colors.thumbColor,
                                levelFontSize: 12,
                            }}
                            trackStyle={{
                                height: 2,
                                color: themeObj.primary.light,
                                headColor: colors.unmanagedIcon,
                                tailColor: colors.unmanagedIcon,
                            }}
                            labelStyle={{
                                color: colors.labelColor,
                                fontSize: 12,
                            }}
                            unit="dBm"
                        />
                    </div>
            </FormControl>
        )];
        default:
            return [];
    }
});


const createStyledTabs = ({
    radioSettings, profileSettings, nodeSettings, radioOption,
    profileOption, radioError, nodeError, profileError,
    nodeIp, lostNode, tempRadio, tabActive,
    onAfterChange, type, loadData = {},
    t, handleChange, nodeInfo, classes,
    showPreviousConfig = false,
}) => {
    let tabPanels = [<span />];
    let tabStatus = themeObj.primary.main;
    let tabErrorStatus = false;
    let tabWarnStatus = false;
    if (type === 'NODE') {
         const {tabs, tabColor, errorStatus, warnStatus}= createNodeTabPanels({
            t, radioSettings, profileSettings, nodeSettings,
            profileOption, profileError, nodeError, nodeIp,
            handleChange, lostNode, tabActive,
        });
        tabPanels = tabs
        tabStatus = tabColor;
        tabErrorStatus = errorStatus;
        tabWarnStatus = warnStatus;
    } else if (type === 'NETWORK') {
        const {tabs, tabColor, errorStatus} = createNetworkInterfaceTabPanels({
            t, radioSettings, radioOption, radioError,
            nodeIp, tempRadio, handleChange, lostNode,
            tabActive, nodeInfo, loadData, showPreviousConfig
        });
        tabPanels = tabs
        tabStatus = tabColor;
        tabErrorStatus = errorStatus;
    }

    return {
        errorStatus: tabErrorStatus,
        warnStatus: tabWarnStatus,
        content: (
            <StyledTabs
                tabStatus={tabStatus}
                maxWidth="120px"
                theme={themeObj}
                className={classes.menuItemClass}
                tabActive={tabActive}
                onAfterChange={onAfterChange}
            >
                {tabPanels}
            </StyledTabs>
        ),
    };
};

const createAccordion = ({title, content, defaultExpanded, classes, advanceTitle}) => (
    <Accordion
        classes={{
            expanded: classes.accordionPanelExpanded,
            root: classes.accordionPanelRoot
        }}
        style={{width: '100%', boxShadow: 'none'}}
        defaultExpanded={defaultExpanded}
    >
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            style={{minHeight: '40px'}}
            classes={{content: Boolean(advanceTitle) ?
                classes.accordionSummaryExpandedWithWarn :
                classes.accordionSummaryExpanded,
                expanded: 'wtf',
            }}
        >
            {advanceTitle ||
                (
                    <Typography variant="h5" >
                        {title}
                    </Typography>
                )
            }
        </AccordionSummary>
        <AccordionDetails>
            <div style={{width: '100%'}}>
                {content}
            </div>
        </AccordionDetails>
    </Accordion>
);

const createNodeConfigAccordion = ({
    radioSettings, profileSettings, classes,
    nodeSettings, radioOption, profileOption, radioError,
    profileError, nodeError, nodeIp, lostNode,
    tabActive, onAfterChange, t, handleChange,
    nodeInfo,
}) => {
    const {content, errorStatus, warnStatus} = createStyledTabs({
        radioSettings, profileSettings, nodeSettings, radioOption,
        profileOption, radioError, profileError, nodeError,
        nodeIp, tabActive, onAfterChange, lostNode,
        type: 'NODE', t, handleChange, nodeInfo,
        classes,
    });
    const NodeConfigAccordion = createAccordion({
        title: warnStatus ? (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant="body2" style={{fontSize: '24px'}}>
                    {t('nodeConfigAccordionTitle')}
                </Typography>
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '3px',
                    backgroundColor: colors.warningBackground,
                    padding: '12px',
                    marginTop: '10px'
                }}
                >
                    <i
                        className="material-icons"
                        style={{
                            fontSize: '40px',
                            paddingRight: '16px',
                            color: colors.warningColor,
                        }}
                    >error_outline</i>
                    <span style={{
                        fontSize: 14,
                        lineHeight: '140%',
                        color: colors.warningColor,
                        fontWeight: '500',
                    }}>
                        <Trans
                            defaults={t('nodeSettingsMaxNbrWarningMsg')}
                            components={{ bold: <strong /> }}
                        />
                    </span>
                </span>
            </div>
        ) : t('nodeConfigAccordionTitle'),
        content,
        defaultExpanded: true,
        classes,
    });
    return {NodeConfigAccordion, NodeConfigAccordionError: errorStatus};
};

const createNetworkInterfaceAccordion = ({
    radioSettings, profileSettings, classes,
    nodeSettings, radioOption, profileOption, radioError,
    profileError, nodeError, nodeIp, lostNode,
    tempRadio, tabActive, onAfterChange, loadData,
    t, handleChange, nodeInfo, showPreviousConfig,
}) => {
    const {content, errorStatus} = createStyledTabs({
        radioSettings, profileSettings, nodeSettings, radioOption,
        profileOption, radioError, profileError, nodeError,
        nodeIp, lostNode, tempRadio, tabActive,
        onAfterChange, loadData, type: 'NETWORK',
        t, handleChange, nodeInfo, classes,
        showPreviousConfig,
    });

    const NetworkInterfaceAccordion = createAccordion({
        title: t('networkInterfaceAccordionTitle'),
        content,
        defaultExpanded: true,
        classes,
    });
    return {NetworkInterfaceAccordion, NetworkInterfaceAccordionError: errorStatus};
};

const createAdvancedConfigAccordion = ({
    radioSettings, profileSettings,
    nodeSettings, radioOption, profileOption, radioError,
    profileError, nodeError, nodeIp, lostNode,
    tempRadio, tabActive, onAfterChange, loadData,
    t, handleChange, nodeInfo, classes, showPreviousConfig,
}) => {
    const tabActiveRadioMap = {
        1: 'radio0',
        2: 'radio1',
        3: 'radio2',
    };
    const radioName = tabActiveRadioMap[tabActive];
    const radioOptionKeys = Constant.advancedConfigOption[radioName];
    const radioOptionKeysType = Constant.advancedConfigInputObj;

    const content = createAdvancedTabContent({
        t, radioSettings, radioOption, radioError,
        nodeIp, tempRadio, handleChange, lostNode,
        tabActive, nodeInfo, loadData, radioName,
        radioOptionKeys, radioOptionKeysType, classes,
        showPreviousConfig,
    });

    const AdvancedConfigAccordion = createAccordion({
        title: t('advancedConfigAccordionTitle'),
        content,
        defaultExpanded: false,
        classes,
    });
    return AdvancedConfigAccordion;
};

const createPanel = ({
    nodeIp, tempRadio, configData, configOptions,
    errorStatus, hostname, mac, lostNode,
    nodeTab, setNodeTab, networkTab, setNetworkTab,
    t, handleChange, nodeInfo, loadData = '',
    classes, clusterConfigMismatchButton,
    showPreviousConfig = false,
}) => {
    const {radioSettings, profileSettings, nodeSettings} = JSON.parse(configData);
    const {radioSettings: radioOption, profileSettings: profileOption} = JSON.parse(configOptions);
    const {radioSettings: radioError, profileSettings: profileError, nodeSettings: nodeError} = JSON.parse(errorStatus);
    const parsedLoadData = loadData !== '' ? JSON.parse(loadData) : {};
    const {NodeConfigAccordion, NodeConfigAccordionError} = createNodeConfigAccordion({
        radioSettings, profileSettings,
        nodeSettings, radioOption, profileOption, radioError,
        profileError, nodeError, nodeIp, lostNode,
        t, handleChange, nodeInfo, tabActive: nodeTab,
        onAfterChange: setNodeTab, classes, showPreviousConfig
    })
    const {NetworkInterfaceAccordion, NetworkInterfaceAccordionError} = createNetworkInterfaceAccordion({
        radioSettings, profileSettings,
        nodeSettings, radioOption, profileOption, radioError,
        profileError, nodeError, nodeIp, tempRadio,
        lostNode, t, handleChange, nodeInfo,
        loadData: parsedLoadData,
        tabActive: networkTab,
        onAfterChange: setNetworkTab, classes, showPreviousConfig
    })
    const AdvancedConfigAccordion = createAdvancedConfigAccordion({
        radioSettings, profileSettings,
        nodeSettings, radioOption, profileOption, radioError,
        profileError, nodeError, nodeIp, tempRadio,
        lostNode, t, handleChange, nodeInfo,
        loadData: parsedLoadData,
        tabActive: networkTab,
        onAfterChange: setNetworkTab, classes, showPreviousConfig
    })
    return {
        panel:
            (
                <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
                    {lostNode && (
                        <div style={{
                            position: 'absolute',
                            right: '0',
                        }}>
                            {clusterConfigMismatchButton}
                        </div>
                    )}
                    {createTitle(hostname, lostNode, mac)}
                    {NodeConfigAccordion}
                    {NetworkInterfaceAccordion}
                    {AdvancedConfigAccordion}
                </div>
            ),
        errorStatus: NodeConfigAccordionError || NetworkInterfaceAccordionError ,
    }
};

const NodeRecoveryConfigAdjustAdvance = ({
    t, configData, configOptions, errorStatus,
    lostNodeIp, lostNodeRadio, controlNodeIp, controlNodeRadio, updateConfigData, loadData,
    clusterConfigMismatchButton, saveRecoveryButton, updateAction,
    onSwitchChange, removeNeighborAcl, showPreviousConfig,
}) => {
    const classes = useStyles();
    const {
        meshTopology: {
            ipToHostnameMap,
            ipToMacMap,
            nodeInfo,
        }
    } = useSelector(store => store);
    const [controlNodeTabNo, setControlNodeTabNo] = useState(1);
    const [controlNetworkInterfaceTabNo, setControlNetworkInterfaceTabNo] = useState(1);
    const [lostNodeTabNo, setLostNodeTabNo] = useState(1);
    const [lostNetworkInterfaceTabNo, setLostNetworkInterfaceTabNo] = useState(1);

    const handleChange = useCallback(({event, nodeIp, id, value, settings, radioName, moreValue}) => {
        const inputID = id || event?.target?.id || event?.target?.name;
        let inputValue = value;
        if (value === undefined || value === null) {
            inputValue = event?.target?.value
        }
        console.log('kyle_debug ~ file: NodeRecoveryConfigAdjustAdvance.jsx ~ line 399 ~ handleChange ~ inputValue', inputValue)
        console.log('kyle_debug ~ file: NodeRecoveryConfigAdjustAdvance.jsx ~ line 398 ~ handleChange ~ inputID', inputID)
        updateAction(draft => 'UPDATE');
        updateConfigData(draft => {
            if (settings === 'nodeSettings') {
                draft[settings][nodeIp][inputID] = inputValue;
            } else if (settings === 'profileSettings') {
                draft[settings][nodeIp].nbr['1'][inputID] = inputValue;
            } else if (settings === 'radioSettings') {
                if (inputID === 'channel') {
                    // sync
                    draft[settings][nodeIp][radioName].centralFreq = inputValue;
                } else if (inputID === 'centralFreq') {
                    // sync
                    draft[settings][nodeIp][radioName].channel = inputValue;
                } else if (inputID === 'rssiFilterUpper') {
                    // update rssiFilterLower as well
                    draft[settings][nodeIp][radioName].rssiFilterLower = moreValue.rssiFilterLower;
                } else if (inputID === 'atpcTargetRssi') {
                    // update atpc range related configurations
                    draft[settings][nodeIp][radioName].atpcRangeLower = moreValue.atpcRangeLower;
                    draft[settings][nodeIp][radioName].atpcRangeUpper = moreValue.atpcRangeUpper;
                }
                draft[settings][nodeIp][radioName][inputID] = inputValue;
            }
        });
    }, [updateConfigData, updateAction]);

    const {panel: lostNodePanel, errorStatus: lostNodeErrorStatus} = createPanel({
        nodeIp: lostNodeIp,
        tempRadio: lostNodeRadio,
        configData,
        configOptions,
        errorStatus,
        hostname: ipToHostnameMap[lostNodeIp],
        mac: ipToMacMap[lostNodeIp],
        lostNode: true,
        nodeTab: controlNodeTabNo,
        setNodeTab: setControlNodeTabNo,
        networkTab: controlNetworkInterfaceTabNo,
        setNetworkTab: setControlNetworkInterfaceTabNo,
        loadData,
        t,
        handleChange,
        nodeInfo,
        classes,
        clusterConfigMismatchButton,
        showPreviousConfig,
    });

    const {panel: controlNodePanel, errorStatus: controlNodeErrorStatus} = createPanel({
        nodeIp: controlNodeIp,
        tempRadio: controlNodeRadio,
        configData,
        configOptions,
        errorStatus,
        hostname: ipToHostnameMap[controlNodeIp],
        mac: ipToMacMap[controlNodeIp],
        lostNode: false,
        nodeTab: lostNodeTabNo,
        setNodeTab: setLostNodeTabNo,
        networkTab: lostNetworkInterfaceTabNo,
        setNetworkTab: setLostNetworkInterfaceTabNo,
        t,
        handleChange,
        nodeInfo,
        classes,
    });

    const removeAclSwitch = (
        <div style={{display: 'flex', padding: '30px 36px'}}>
            <Typography
                style={{
                    color: colors.dataTitle,
                    fontSize: '20px',
                }}
            >
                Mutually remove neighbor ACL entry
            </Typography>
            <P2Tooltip
                direction="right"
                title={(
                <div className={classes.tooltipStyle}>
                    <div>
                        {t(`removeNeighborAcl`)}
                    </div>
                </div>)}
                content={(<i
                    className="material-icons"
                    style={{
                        color: themeObj.primary.light,
                        fontSize: '25px',
                        marginLeft: '5px',
                        marginTop: '3px',
                    }}
                >help</i>)}
            />
            <div style={{marginLeft: 'auto'}}>
                <Switch
                    checked={removeNeighborAcl}
                    onChange={onSwitchChange}
                    style={{height: 'auto'}}
                    color="primary"
                    disableRipple
                />
            </div>
        </div>
    );


    return (
        <>
            <div style={{display: 'flex'}}>
                <div style={{flex: '1', padding: '0px 20px', borderRight: '1px solid #848484'}}>
                    {lostNodePanel}
                </div>
                <div style={{ flex: '1', padding: '0px 20px'}}>
                    {controlNodePanel}
                </div>
            </div>
            {removeAclSwitch}
            <div style={{float: 'right', marginTop: 50, marginRight: 36}} >
                {saveRecoveryButton(lostNodeErrorStatus || controlNodeErrorStatus)}
            </div>
        </>
    )
}

NodeRecoveryConfigAdjustAdvance.propTypes = {
    t: PropTypes.func.isRequired,
    configData: PropTypes.string.isRequired,
    loadData: PropTypes.string.isRequired,
    configOptions: PropTypes.string.isRequired,
    errorStatus: PropTypes.string.isRequired,
    lostNodeIp: PropTypes.string.isRequired,
    lostNodeRadio: PropTypes.string.isRequired,
    controlNodeIp: PropTypes.string.isRequired,
    controlNodeRadio: PropTypes.string.isRequired,
    updateConfigData: PropTypes.func.isRequired,
    updateAction: PropTypes.func.isRequired,
    clusterConfigMismatchButton: PropTypes.node.isRequired,
    saveRecoveryButton: PropTypes.func.isRequired,
    onSwitchChange: PropTypes.func.isRequired,
    removeNeighborAcl: PropTypes.bool.isRequired,
    showPreviousConfig: PropTypes.bool.isRequired,
}

export default React.memo(NodeRecoveryConfigAdjustAdvance)

