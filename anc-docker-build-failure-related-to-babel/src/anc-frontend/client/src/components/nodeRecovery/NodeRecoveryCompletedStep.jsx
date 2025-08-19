import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import {Typography} from '@material-ui/core';
import {useSelector} from 'react-redux';

const NodeRecoveryCompleted = ({handleReturnTopology, t, restartRecovery}) => {
    const {
        nodeRecovery: {
            saveState: {status},
            recoverState: {
                recoveryResult,
            }
        },
        meshTopology: {
            macToHostnameMap,
        }
    } = useSelector(store => store);

    const hostnameMacMsg = recoveryResult?.info?.mac ? `(${macToHostnameMap?.[recoveryResult?.info?.mac]}, ${recoveryResult?.info?.mac})` : '';
    const nodeMsg = `${t('recoveryResultNodeLbl')} ${hostnameMacMsg} ${t(status ? 'recoveryResultSuccessMsg': 'recoveryResultFailMsg')}`;
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '50px 0px',
            }}
            >
                <i
                    style={{fontSize: 80, color: status ? '#219653' : '#DC4639'}}
                    className="material-icons"
                >{status ? 'check_circle' : 'error'}</i>
                <Typography style={{fontSize: '20px', marginTop: '15px', fontWeight: '400'}}>
                    {t(status ? 'recoveryResultSuccessTitle': 'recoveryResultFailTitle')}
                </Typography>
                <Typography style={{fontSize: '20px', marginTop: '15px', fontWeight: '400'}}>
                    {nodeMsg}
                </Typography>
            </div>
            <div style={{float: 'right'}} >
                {!status && (
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={restartRecovery}
                        style={{marginRight: '15px'}}
                    >
                        {t('recoveryResultFailButton')}
                    </Button>
                )}
               <Button
                    color="primary"
                    variant="contained"
                    onClick={handleReturnTopology}
                >
                    {t('recoveryResultSuccessButton')}
                </Button>
            </div>
        </>
    );
};

NodeRecoveryCompleted.propTypes = {
    t: PropTypes.func.isRequired,
    restartRecovery: PropTypes.func.isRequired,
    handleReturnTopology: PropTypes.func.isRequired,
}

export default NodeRecoveryCompleted;
