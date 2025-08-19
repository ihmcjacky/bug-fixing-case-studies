import React, {useCallback} from 'react'
import PropTypes from 'prop-types'
import {Trans} from 'react-i18next';
import P2Dialog from '../../components/common/P2Dialog';
import Constant from '../../constants/common';

const {colors} = Constant;

function deleteKey(item, array) {
    const index = array.indexOf(item);
    if (index !== -1) array.splice(index, 1);
}

function getDiscrepancyEndKey(options, discrepancyObj) {
    for (let i = options.length - 1; i >= 0; i -= 1) {
        if (discrepancyObj[options[i]]) {
            return options[i];
        }
    }
    return options[options.length - 1];
}

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const searchCountry = (actualValue, countryList) => {
    let result = '-';
    countryList.some((countryObj) => {
        if (countryObj.actualValue === actualValue) {
            result = countryObj.displayValue;
            return true;
        }
        return false;
    });
    if (actualValue === 'DB') {
        return 'Debug';
    }
    return result;
};

const searchGlobalTimezone = (actualValue, globalTimezoneList) => {
    let result = 'N/A';
    globalTimezoneList.some((globalTimezoneObj) => {
        if (globalTimezoneObj.actualValue === actualValue) {
            result = globalTimezoneObj.displayValue;
            return true;
        }
        return false;
    });
    return result;
};

const searchBpduFilter = (actualValue, bpduFilterList, notAvailableLbl) => {
    let result = '';
    if (actualValue === 'notSupported') {
        result = notAvailableLbl;
    } else if (bpduFilterList.type === 'enum') {
        bpduFilterList.data.some((bpduFilterObj) => {
            if (bpduFilterObj.actualValue === actualValue) {
                result = bpduFilterObj.displayValue;
                return true;
            }
            return false;
        });
    }
    if (result === '') {
        result = notAvailableLbl;
    }
    return result;
}

const searchE2EEnc = (actualValue, e2eEncList, notAvailableLbl) => {
    let result = '';
    if (actualValue === 'notSupported') {
        result = notAvailableLbl;
    } else {
        e2eEncList.some((e2eEncObj) => {
            if (e2eEncObj.actualValue === actualValue) {
                result = e2eEncObj.displayValue;
                return true;
            }
            return false;
        });
    }
    if (result === '') {
        result = notAvailableLbl;
    }
    return result;
};

const NodeRecoveryDiscrepanciesDialog = ({open, setOpen, discrepanciesList, t, configOptions}) => {
    const createDiscrepancyItem = useCallback((discrepancy, filterConfig) => {
        const color = discrepancy.discrepancies ? colors.inactiveRed : colors.activeGreen;
        const icon = discrepancy.discrepancies ? 'error' : 'check_circle';
        const hostNode = !discrepancy.hostNode ? '' : (<span>, <b>{t('hostNodeLbl')}</b></span>);
        const isLegacy = discrepancy.isLegacy || {};
        const hostNameMac = !discrepancy.discrepancies ? (
            <span key={discrepancy.hostname} style={{fontSize: 15, paddingBottom: '5px'}}>
                {t('expectedConfigLbl')}
            </span>
        ) :
            (
                <span key={discrepancy.hostname} style={{fontSize: 15, paddingBottom: '5px'}}>
                    {discrepancy.hostname} ({discrepancy.mac}){hostNode}
                </span>
            );
        const discrepancyKey = Object.keys(discrepancy);
        deleteKey('nodeIp', discrepancyKey);
        deleteKey('discrepancies', discrepancyKey);
        deleteKey('mac', discrepancyKey);
        deleteKey('hostname', discrepancyKey);
        deleteKey('hostNode', discrepancyKey);
        deleteKey('isLegacy', discrepancyKey);
        const generalSettings = Constant.clusterConfigOptions.generalSettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.generalSettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'country') {
                displayValue = searchCountry(discrepancy[key], filterConfig?.meshSettings?.country?.data ?? []);
            } else if (key === 'globalTimezone') {
                displayValue = searchGlobalTimezone(discrepancy[key], filterConfig?.meshSettings?.globalTimezone?.data ?? []);
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {t(`discrepanciesLbl.${key}`)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });
        const securitySettings = Constant.clusterConfigOptions.securitySettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.securitySettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'e2eEnc') {
                displayValue = searchE2EEnc(discrepancy[key],
                    filterConfig?.meshSettings?.e2eEnc?.data ?? [], t('notAvailableLbl'));
            } else if (key === 'e2eEncKey') {
                displayValue = discrepancy[key] === 'notSupported' ?
                    t('notAvailableLbl') : (() => {
                        if (get(discrepancy, ['e2eEnc'])) {
                            const encValue = get(discrepancy, ['e2eEnc']);
                            return searchE2EEnc(encValue,
                                filterConfig?.meshSettings?.e2eEnc?.data ?? [], t('notAvailableLbl')) === '-' ?
                                '-' : discrepancy[key];
                        }
                        return discrepancy[key];
                    }
                    )();
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {t(`discrepanciesLbl.${key}`)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });
        const advancedSettings = Constant.clusterConfigOptions.advancedSettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.advancedSettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'bpduFilter') {
                displayValue = searchBpduFilter(discrepancy[key],
                    filterConfig?.meshSettings?.bpduFilter ?? [], t('notAvailableLbl'));
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {t(`discrepanciesLbl.${key}`)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });

        const discrepancyRow = (
            <span
                key={discrepancy.mac}
                style={{
                    fontSize: 13,
                    color: colors.discrepancyRow,
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                }}
            >
                {!discrepancy.discrepancies ? <i
                    style={{fontSize: 50, marginRight: 10, color}}
                    className="material-icons"
                >{icon}</i> : <span />}
                <span style={{display: 'flex', flexDirection: 'column'}}>
                    {hostNameMac}
                    <span
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: !discrepancy.discrepancies ? '5px' : '',
                        }}
                    >
                        <span style={{display: 'flex', flexDirection: 'column'}}>
                            {!generalSettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {t('generalSettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {generalSettings}
                                    </span>
                                </span>) : <span />
                            }
                            {!securitySettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {t('securitySettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {securitySettings}
                                    </span>
                                </span>) : <span />
                            }
                            {!advancedSettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {t('advancedSettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {advancedSettings}
                                    </span>
                                </span>) : <span />
                            }
                        </span>
                    </span>
                </span>
            </span>
        );
        return discrepancyRow;
    }, [t])

    const createDiscrepanciesTextContent = ({configOptions, createDiscrepancyItem, discrepanciesList, t}) => {
        const discrepancyObjects = JSON.parse(discrepanciesList).filter(obj => (obj.discrepancies))
            .sort((a, b) => a.hostname - b.hostname);
        return (
            <span>
                    <span style={{marginBottom: '15px', display: 'block', fontSize: '17px'}}>
                        <Trans
                            defaults={t('discrepancyDialogContent')}
                            components={{ bold: <strong /> }}
                        />
                    </span>
                    <span style={{display: 'flex', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <i
                            style={{
                                fontSize: 14,
                                color: colors.activeGreen,
                                marginTop: '3px',
                                marginRight: '5px',
                            }}
                            className="material-icons"
                        >lens</i>
                        <span style={{
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: 14,
                            color: colors.activeGreen,
                            marginRight: '15px',
                            marginLeft: '5px',
                            alignItems: 'center',
                        }}
                        >
                            <span>{t('expectedConfigLbl')}</span>
                            <span style={{fontSize: 12}}>
                                {t('expectedConfigHostNodeLbl')}
                            </span>
                        </span>
                        <span
                            style={{
                                fontSize: 14,
                                color: colors.activeGreen,
                                marginRight: '5px',
                                marginLeft: '5px',
                            }}
                        >
                            #
                        </span>
                        <span style={{
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: 14,
                            color: colors.activeGreen,
                            marginRight: '15px',
                            marginLeft: '5px',
                            alignItems: 'center',
                        }}
                        >
                            {t('expectedConfigLbl')}
                            <span style={{fontSize: 12}}>
                                {t('expectedConfigCompatDefaultLbl')}
                            </span>
                        </span>
                        <i
                            style={{
                                fontSize: 14,
                                color: colors.inactiveRed,
                                marginTop: '3px',
                                marginRight: '5px',
                            }}
                            className="material-icons"
                        >lens</i>
                        <span style={{
                            fontSize: 14,
                            color: colors.inactiveRed,
                            marginRight: '10px',
                            marginLeft: '5px',
                        }}
                        >
                            {t('mismatchConfigLbl')}
                        </span>
                    </span>
                    <span>
                        {
                            JSON.parse(discrepanciesList).map((discrepancy) => {
                                if (!discrepancy.discrepancies) {
                                    return createDiscrepancyItem(discrepancy, JSON.parse(configOptions));
                                }
                                return (<span key={discrepancy.mac} />);
                            })
                        }
                    </span>
                    <span style={{maxHeight: '40vh', overflowY: 'auto', display: 'flex'}}>
                        <span
                            style={{
                                fontSize: 14,
                                marginBottom: '25px',
                                color: colors.discrepancyRow,
                                display: 'flex',
                                alignItems: 'flex-start',
                            }}
                        >
                            <i
                                style={{fontSize: 50, marginRight: 10, color: colors.inactiveRed}}
                                className="material-icons"
                            >
                                error
                            </i>
                        </span>
                        <span style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <span style={{fontSize: '16px', color: colors.discrepancyRow}}>
                                {t('mismatchedConfig')}
                            </span>
                            <span style={{display: 'flex', marginTop: '5px', flexDirection: 'column'}}>
                                {
                                    discrepancyObjects.map((discrepancy, index) => (
                                        <React.Fragment key={`discrepancy-${discrepancy.nodeIp}`}>
                                            {createDiscrepancyItem(discrepancy, JSON.parse(configOptions))}
                                            {discrepancyObjects.length - 1 !== index ?
                                                (<span
                                                    style={{
                                                        width: '820px',
                                                        // marginTop: '10px',
                                                        borderBottom: `1px solid ${colors.footerTxt}`,
                                                        marginBottom: '5px',
                                                    }}
                                                />) :
                                                <span />
                                            }
                                        </React.Fragment>
                                    ))
                                }
                            </span>
                        </span>
                    </span>
                </span>
        );
    };

    return (
        <P2Dialog
            open={open}
            handleClose={() => setOpen(false)}
            title={t('discrepancyDialogTitle')}
            content={createDiscrepanciesTextContent({configOptions, createDiscrepancyItem, discrepanciesList, t})}
            actionTitle={t('discrepancyDialogProceedLbl')}
            actionFn={() => setOpen(false)}
            maxWidth="md"
        />
    )
}

NodeRecoveryDiscrepanciesDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    discrepanciesList: PropTypes.string.isRequired,
    configOptions: PropTypes.string.isRequired,
}

export default NodeRecoveryDiscrepanciesDialog
