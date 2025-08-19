/**
 * @Author: mango
 * @Date:   2018-04-27T17:04:23+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-09-13T15:55:04+08:00
 */
import React, {useState} from 'react';
import moment from 'moment';
import {useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import Button from '@material-ui/core/Button';
import saveAs from '../../util/nw/saveAs';
import P2PointsToNote from '../nodeMaintenances/P2PointsToNote';
import LockLayer from '../common/LockLayer';
import {getConfig, getVersion, getFilteredConfigOptions} from '../../util/apiCall';
import checkConfigValue from '../../util/configValidator';
import P2Dialog from '../../components/common/P2Dialog';
import {getCurrentDate} from '../../util/dateHandler';
import InvalidConfigContainer from '../common/InvalidConfigContainer';
import check from '../../util/errorValidator';
import Constant from '../../constants/common';
import {checkFwVersion} from '../../util/commonFunc';
import {toggleSnackBar} from '../../redux/common/commonActions';
import {getOemNameOrAnm} from '../../util/common';

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

function getOptionsFromGetConfigObj(Config) {
    let options = {};
    if (Config.meshSettings) {
        options.meshSettings = Object.keys(Config.meshSettings)
        .filter(key => key !== 'encType' && key !== 'rtscts' && key !== 'discrepancies')
    }
    if (Config.nodeSettings) {
        options.nodeSettings = {};
        Object.keys(Config.nodeSettings).forEach((nodeIp) => {
            options.nodeSettings[nodeIp] = Object.keys(Config.nodeSettings[nodeIp]).filter(key => key !== 'acl');
        });
    }
    if (Config.radioSettings) {
        options.radioSettings = {};

        Object.keys(Config.radioSettings).forEach((nodeIp) => {
            options.radioSettings[nodeIp] = {};
            Object.keys(Config.radioSettings[nodeIp]).forEach((radioName) => {
                options.radioSettings[nodeIp][radioName] = Object.keys(Config.radioSettings[nodeIp][radioName])
                    .filter(key => key !== 'acl');
            });
        });
    }
    if (Config.ethernetSettings) {
        options.ethernetSettings = {};

        Object.keys(Config.ethernetSettings).forEach((nodeIp) => {
            options.ethernetSettings[nodeIp] = {};
            Object.keys(Config.ethernetSettings[nodeIp]).forEach((ethName) => {
                options.ethernetSettings[nodeIp][ethName] = Object.keys(Config.ethernetSettings[nodeIp][ethName]);
            });
        });
    }
    if (Config.profileSettings) {
        options.profileSettings = {};

        Object.keys(Config.profileSettings).forEach((nodeIp) => {
            options.profileSettings[nodeIp] = {};
            Object.keys(Config.profileSettings[nodeIp]).forEach((profileOpt) => {
                options.profileSettings[nodeIp][profileOpt] = {};
                Object.keys(Config.profileSettings[nodeIp][profileOpt]).forEach((profileId) => {
                    options.profileSettings[nodeIp][profileOpt][profileId] =
                    Object.keys(Config.profileSettings[nodeIp][profileOpt][profileId]);
                });
            });
        });
    }
    return options;
}

const {colors} = Constant;

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const ConfigBackup = ({close, pollingHandler, nodes}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const {csrf, labels} = useSelector(
        store => store.common
    );
    const {projectId, projectIdToNameMap} = useSelector(
        store => store.projectManagement
    )
    const {t: _t, ready} = useTranslation('node-maintenance-backup');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});

    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        submitTitle: t('submitTitle'),
        submitFn: () => null,
        cancelTitle: '',
        cancelFn: () => null,
    });
    const [invalidConfigDialogOpen, setInvalidConfigDialogOpen] = useState(false);
    const [invalidFilterConfig, setInvalidFilterConfig] = useState({
        meshSettings: {},
        radioSettings: {},
        nodeSettings: {},
        ethernetSettings: {},
        profileSettings: {},
        expanded: {
            meshSettings: false,
            node: {},
        },
        // meshSettings: {},
        // radioSettings: {
        //     '127.0.17.10': {
        //         radio0: {
        //             centralFreq: 'invalid',
        //             channel: 'invalid',
        //             txpower: 'invalid',
        //         },
        //         radio1: {
        //             centralFreq: 'wrongEnum',
        //             channel: 'wrongEnum',
        //             txpower: 'wrongEnum',
        //         },
        //     },
        // },
        // nodeSettings: {
        //     '127.0.17.10': {
        //         hostname: 'wrongRegex',
        //     },
        // },
        // ethernetSettings: {
        //     '127.0.17.10': {
        //         eth0: {
        //             ethernetLink: 'wrongEnum',
        //         },
        //         eth1: {
        //             ethernetLink: 'wrongEnum',
        //         },
        //     },
        // },
        // profileSettings: {
        //     '127.0.17.10': {
        //         nbr: {
        //             '1': {
        //                 maxNbr: 'wrongEnum'
        //             }
        //         }
        //     }
        // },
        // expanded: {
        //     meshSettings: false,
        //     node: {
        //         '127.0.17.10': true,
        //     },
        // },
    });
    const [isLock, setIsLock] = useState(false);

    if (!ready) {
        return <span />;
    }

    const handleDialogOnClose = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: false,
        }));
    };

    const getConfigError = (error) => {
        const {title, content} = check(error);
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: title !== '' ? title : t('backupFailTitle'),
            content: title !== '' ? content : t('backupFailContent'),
            submitTitle: t('submitTitle'),
            submitFn: () => { close(nodes[0].ipv4); },
            cancelTitle: '',
            cancelFn: handleDialogOnClose,
        }));
        setIsLock(false);
    };

    const getConfigErrorDueToDiscrepancies = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
            title: t('inSyncTitle'),
            content: t('inSyncContent'),
            submitTitle: t('inSyncAction'),
            submitFn: () => {
                history.push('/config');
            },
            cancelTitle: '',
            cancelFn: null,
        }));
        setIsLock(false);
    };

    const handleConfigData = async (apiResArr) => {
        const {
            ipv4, hostname, fwVersion, model, mac,
        } = nodes[0];

        const {meshSettings} = apiResArr[0];
        const checksums = apiResArr[0].checksums[ipv4];
        const radioSettings = apiResArr[0].radioSettings[ipv4];
        const nodeSettings = apiResArr[0].nodeSettings[ipv4];
        const ethernetSettings = apiResArr[0].ethernetSettings[ipv4];
        const profileSettings = apiResArr[0]?.profileSettings[ipv4];
        delete nodeSettings.acl;
        const datetimeString = getCurrentDate('dateTime');
        const {version, build} = apiResArr[1];

        Object.keys(radioSettings).forEach((radioName) => {
            delete radioSettings[radioName].acl;
        });

        const uiVersion = process.env.REACT_APP_UI_DISPLAY_VER ?? 'dev';
        const uiVersionArr = process.env.REACT_APP_UI_DISPLAY_VER ?
            uiVersion.replace('v', '').split('.') : [uiVersion];
        const fullVersion = `${checkFwVersion(version)}.${uiVersionArr[uiVersionArr.length - 1]}`;

        const backupObj = {
            p2BackupConfig: {
                type: 'node',
                anmVersion: fullVersion,
                uiVersion,
                controllerVersion: version,
                controllerBuild: build,
                createdTimestamp: datetimeString,
                meshSettings,
                nodes: {
                    [mac]: {
                        fwVersion,
                        model,
                        config: {
                            checksums,
                            radioSettings,
                            nodeSettings,
                            ethernetSettings,
                            profileSettings,
                        }
                    }
                }
            }
        };
        console.log('kyle_debug ~ file: ConfigBackApp.jsx ~ line 235 ~ handleConfigData ~ backupObj', backupObj)
        
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-HH-mm-ss');
        const projectName = projectIdToNameMap[projectId];
        const filename = `${namePrefix}_${projectName}_${hostname}_config-backup_${currentTime}.config`;
        const encodeBackup = btoa(JSON.stringify(backupObj));
        const blobData = [encodeBackup];
        const blob = new Blob(blobData, {type: 'application/octet-stream'});
        const {data} = await wrapper(saveAs(blob, filename, '.config'));
        if (data.success) {
            dispatch(toggleSnackBar(t('downloadCompleted')));
        }
        setIsLock(false);
    };

    const clickBackup = async () => {
        const {ipv4} = nodes[0];
        setIsLock(true);

        pollingHandler.stopInterval();
        try {
            const projectId = Cookies.get('projectId');
            const value = await getConfig(csrf, projectId, {nodes: [ipv4]});
            if (value?.meshSettings?.discrepancies) {
                getConfigErrorDueToDiscrepancies();
            } else {
                const bodyMsg = createGetFilteredConfigBodyMsg(deepClone(value));
                let filteredConfig = {};
                const {error, data} = await wrapper(getFilteredConfigOptions(csrf, projectId, bodyMsg));
                if (!error) {
                    filteredConfig = data;
                } else if (error.message === 'P2Error' && error.data.type === 'specific') {
                    Object.keys(error.data.data).forEach((settings) => {
                        if (error.data.data[settings].success) {
                            filteredConfig[settings] = error.data.data[settings].data;
                        } else if (error.data.data[settings].errors[0].type === 'partialretrieve') {
                            filteredConfig[settings] = error.data.data[settings].errors[0].data;
                        }
                    });
                } else {
                    pollingHandler.restartInterval();
                    getConfigError(error);
                }
                const {success, invalidFilterConfigRes} = checkConfigValue(
                    invalidFilterConfig, filteredConfig, deepClone(bodyMsg.sourceConfig), [ipv4]
                );
                console.warn(invalidFilterConfigRes)
                if (success) {
                    const version = await getVersion(csrf);
                    pollingHandler.restartInterval();
                    handleConfigData([value, version]);
                } else {
                    setInvalidFilterConfig(invalidFilterConfigRes);
                    pollingHandler.restartInterval();
                    updateInvalidConfigDialog();
                }
            }
        } catch (error) {
            pollingHandler.restartInterval();
            getConfigError(error);
        }
    };

    const createGetFilteredConfigBodyMsg = (value) => {
        console.log('kyle_debug: createGetFilteredConfigBodyMsg -> value', value)
        const {checksums, ...sourceConfig} = deepClone(value);
        const options = getOptionsFromGetConfigObj(sourceConfig);
        const bodyMsg = {
            options,
            sourceConfig: deepClone(sourceConfig),
        };

        return bodyMsg;
    }

    const updateInvalidConfigDialog = () => {
        setInvalidConfigDialogOpen(true);
        setIsLock(false);
    };

    const handleInvalidDialogOnClose = () => {
        setInvalidConfigDialogOpen(false);
        setInvalidFilterConfig({
            meshSettings: {},
            radioSettings: {},
            nodeSettings: {},
            ethernetSettings: {},
            profileSettings: {},
            expanded: {
                meshSettings: false,
                node: {},
            },
        });
    };

    const noteCtx = (
        <P2PointsToNote
            noteTitle={t('noteTitle')}
            noteCtxArr={t('noteCtxArr', {returnObjects: true})}
            style={{
                fwNoteGrid: {
                    fontSize: 12,
                },
                fwNoteTitle: {
                    marginBottom: '10px',
                    fontSize: '14px',
                },
                fwNoteItem: {
                    fontWeight: 400,
                    fontSize: 12,
                },
            }}
        />
    );

    const backupPanel = (
        <div>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={clickBackup}
                style={{float: 'right', marginBottom: '20px'}}
            >
                {t('proceedTitle')}
            </Button>
        </div>
    );

    const invalidConfigDialog = (
        <InvalidConfigContainer
            meshSettings={invalidFilterConfig.meshSettings}
            nodeSettings={invalidFilterConfig.nodeSettings}
            radioSettings={invalidFilterConfig.radioSettings}
            ethernetSettings={invalidFilterConfig.ethernetSettings}
            profileSettings={invalidFilterConfig.profileSettings}
            expanded={invalidFilterConfig.expanded}
            open={invalidConfigDialogOpen}
            hostnameMap={{
                [nodes[0].ipv4]: nodes[0].hostname,
            }}
            macMap={{
                [nodes[0].ipv4]: nodes[0].mac,
            }}
        >
            {(open, content) => (
                <P2Dialog
                    open={open}
                    handleClose={handleInvalidDialogOnClose}
                    title={t('backupFailTitle')}
                    content={(
                        <span style={{marginBottom: '15px'}}>
                            {t('isFilterConfigValidContent')}
                        </span>
                    )}
                    nonTextContent={content}
                    actionTitle={t('submitTitle')}
                    actionFn={handleInvalidDialogOnClose}
                    cancelActTitle=""
                    cancelActFn={handleInvalidDialogOnClose}
                    paperProps={{
                        style: {
                            maxWidth: '800px',
                        },
                    }}
                />
            )}
        </InvalidConfigContainer>
    );

    return (
        <React.Fragment>
            <LockLayer
                display={isLock}
                left={false}
                zIndex={200}
                opacity={1}
                color={colors.lockLayerBackground}
                hasCircularProgress
                marginLeft="-30px"
                circularMargin="-40px"
            />
            <div>
                {noteCtx}
                {backupPanel}
                <P2Dialog
                    open={dialog.open}
                    handleClose={handleDialogOnClose}
                    title={dialog.title}
                    content={dialog.content}
                    actionTitle={dialog.submitTitle}
                    actionFn={dialog.submitFn}
                    cancelActTitle={dialog.cancelTitle}
                    cancelActFn={dialog.cancelFn}
                />
                {invalidConfigDialog}
            </div>
        </React.Fragment>
    );
};

ConfigBackup.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    close: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
};

export default ConfigBackup;
