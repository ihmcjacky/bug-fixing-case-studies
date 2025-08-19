/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-02-10 13:25:21
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-30 16:04:14
 * @ Description:
 */

import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Typography,
} from '@material-ui/core';
import {convertUptime} from '../../util/formatConvertor';
import LockLayer from '../common/LockLayer';
import P2Dialog from '../common/P2Dialog';
import Constant from '../../constants/common';
import useSystemLogExport from '../common/useSystemLogExport';

const {colors} = Constant;

const SystemLogNodeExportApp = ({
    nodeIp, hostname, pollingHandler, type
}) => {
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('exportLog');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const {
        exportType, exportLog, setExportType,
        upTime, dialog, isLock,
    } = useSystemLogExport({nodeIp, hostname, pollingHandler, type, t});

    if (!ready) {
        return <span />;
    }

    const restoreTypeRadioGroup = (
        <RadioGroup
            id="exportType"
            aria-label="exportType"
            name="exportType"
            value={exportType}
            onChange={e => setExportType(e.target.value)}
            style={{
                margin: '10px 0px 10px 0px',
                display: 'flex',
                flexDirection: 'row',

            }}
        >
            <FormControlLabel
                value="nodeLogFile"
                control={<Radio color="primary" style={{height: '36px'}} />}
                label={`${t('logFiles')}`}
                style={{flexBasis: '50%', marginRight: 0}}
            />
            <FormControlLabel
                value="nodeCoreDump"
                control={<Radio color="primary" style={{height: '36px'}} />}
                label={`${t('coreDump')}`}
                style={{flexBasis: '50%', marginRight: 0}}
            />
        </RadioGroup>
    );

    const backupPanel = (
        <div>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={exportLog}
                style={{float: 'right', marginBottom: '20px'}}
            >
                {t('exportLbl')}
            </Button>
        </div>
    );

    const noteCtx = (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                height: '90px',
                marginBottom: '10px',
            }}
        >
            <span
                style={{
                    paddingRight: '11px',
                    flex: '0 0 auto',
                    textAlign: 'center',
                }}
            >
                <i
                    style={{
                        fontSize: '20px',
                        color: Constant.theme.palette.primary.main,
                    }}
                    className="material-icons"
                >
                    help
                </i>
            </span>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    flex: 1,
                    flexDirection: 'column',
                }}
            >
                <Typography style={{fontSize: '12px', color: Constant.colors.disabledText}}>
                    {exportType === 'nodeLogFile' ? t('logFilesNote1') : t('coreDumpNote1')}
                </Typography>
                <Typography style={{paddingTop: '16px', fontSize: '12px', color: Constant.colors.disabledText}}>
                    {exportType === 'nodeLogFile' ? t('logFilesNote2') : t('coreDumpNote2')}
                </Typography>
            </div>
        </div>
    );

    const upTimeCtx = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '10px',
            }}
        >
            <Typography style={{marginBottom: '5px'}}>
                {`${t('system')} ${convertUptime(upTime)}`}
            </Typography>
            <Typography>
                {t('selectType')}
            </Typography>
        </div>
    );

    return (
        <div>
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
            {upTimeCtx}
            {restoreTypeRadioGroup}
            {noteCtx}
            {backupPanel}
            <P2Dialog
                open={dialog.open}
                handleClose={dialog.handleClose}
                title={t(dialog.title)}
                content={t(dialog.content)}
                actionTitle={t(dialog.submitButton)}
                actionFn={dialog.submitAction}
                cancelActTitle={t(dialog.cancelButton)}
                cancelActFn={dialog.cancelAction}
            />
        </div>
    );
};

SystemLogNodeExportApp.propTypes = {
    type: PropTypes.string.isRequired,
    nodeIp: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
};

export default SystemLogNodeExportApp;
