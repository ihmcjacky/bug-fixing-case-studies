/**
 * @Author: mango
 * @Date:   2018-04-12T15:03:15+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-05-17T10:38:55+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import P2FileUpload from '../common/P2FileUpload';

const defaultPropsObj = {
    style: {
        panelDiv: {
            width: '100%',
        },
    },
    disabledSelectFW: true,
    disabledReset: true,
    fwFileSize: '',
    placeholder: 'No file selected',
};

const uploadWrapperStyle = {
    flexGrow: '1',
    paddingTop: '15px',
};

function P2MultipleFwUpgradeActPanel(props) {
    return (
        <div style={props.style.panelDiv || defaultPropsObj.style.panelDiv}>
            <Collapse in={props.ax50FileUpload.display}>
                <div style={{display: 'flex'}}>
                    <div style={uploadWrapperStyle}>
                        <P2FileUpload
                            inputId={props.ax50FileUpload.inputid}
                            selectFileHandler={(e) => { props.selectFileHandler(e, 'ax50'); }}
                            fileName={props.ax50FileUpload.fileName}
                            disabledSelectFile={props.disabledSelectFW}
                            fileSize={props.ax50FileUpload.fileSize}
                            placeholder={props.t('cwFwFileUpPlaceholder', {seriesName: 'AX50'})}
                            acceptType="application/octet-stream,.bin"
                        />
                    </div>
                </div>
            </Collapse>
            <Collapse in={props.x30FileUpload.display}>
                <div style={{display: 'flex'}}>
                    <div style={uploadWrapperStyle}>
                        <P2FileUpload
                            inputId={props.x30FileUpload.inputid}
                            selectFileHandler={(e) => { props.selectFileHandler(e, 'x30'); }}
                            fileName={props.x30FileUpload.fileName}
                            disabledSelectFile={props.disabledSelectFW}
                            fileSize={props.x30FileUpload.fileSize}
                            placeholder={props.t('cwFwFileUpPlaceholder', {seriesName: 'X30'})}
                            acceptType="application/octet-stream,.bin"
                        />
                    </div>
                </div>
            </Collapse>
            <Collapse in={props.x20FileUpload.display}>
                <div style={{display: 'flex'}}>
                    <div style={uploadWrapperStyle}>
                        <P2FileUpload
                            inputId={props.x20FileUpload.inputid}
                            selectFileHandler={(e) => { props.selectFileHandler(e, 'x20'); }}
                            fileName={props.x20FileUpload.fileName}
                            disabledSelectFile={props.disabledSelectFW}
                            fileSize={props.x20FileUpload.fileSize}
                            placeholder={props.t('cwFwFileUpPlaceholder', {seriesName: 'X20'})}
                            acceptType="application/octet-stream,.bin"
                        />
                    </div>
                </div>
            </Collapse>
            <Collapse in={props.x10FileUpload.display}>
                <div style={{display: 'flex'}}>
                    <div style={uploadWrapperStyle}>
                        <P2FileUpload
                            inputId={props.x10FileUpload.inputid}
                            selectFileHandler={(e) => { props.selectFileHandler(e, 'x10'); }}
                            fileName={props.x10FileUpload.fileName}
                            disabledSelectFile={props.disabledSelectFW}
                            fileSize={props.x10FileUpload.fileSize}
                            placeholder={props.t('cwFwFileUpPlaceholder', {seriesName: 'X10'})}
                            acceptType="application/octet-stream,.bin"
                        />
                    </div>
                </div>
            </Collapse>
            <Collapse in={props.z500FileUpload.display}>
                <div style={{display: 'flex'}}>
                    <div style={uploadWrapperStyle}>
                        <P2FileUpload
                            inputId={props.z500FileUpload.inputid}
                            selectFileHandler={(e) => { props.selectFileHandler(e, 'z500'); }}
                            fileName={props.z500FileUpload.fileName}
                            disabledSelectFile={props.disabledSelectFW}
                            fileSize={props.z500FileUpload.fileSize}
                            placeholder={props.t('cwFwFileUpPlaceholder', {seriesName: 'Z500'})}
                            acceptType="application/octet-stream,.bin"
                        />
                    </div>
                </div>
            </Collapse>
            <div style={{flexGrow: '0'}}>
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 0 30px 0'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={12} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography>
                                {props.t('resetConfigurationLabel')}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <div style={{float: 'right'}}>
                            <Switch
                                checked={props.isReset}
                                onChange={props.handleChangeIsReset}
                                value="reset"
                                color="primary"
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={props.onFileUpload}
                disabled={props.disabledUpgrade}
                style={{float: 'right', marginTop: '15px', marginBottom: '20px'}}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '16px', paddingRight: '3px'}}
                >file_upload</i>
                {props.label}
            </Button>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={props.onReset}
                disabled={props.disabledReset}
                style={{
                    float: 'right',
                    marginRight: '10px',
                    marginTop: '15px',
                    marginBottom: '20px',
                }}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '14px', paddingRight: '3px'}}
                >settings_backup_restore</i>
                {props.resetLabel}
            </Button>
        </div>
    );
}
const styles = {
    isReset: {
        marginTop: '-7px',
        marginRight: '0px',
    },
};

P2MultipleFwUpgradeActPanel.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line
    label: PropTypes.string.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    style: PropTypes.objectOf(PropTypes.object),
    selectFileHandler: PropTypes.func.isRequired,
    disabledUpgrade: PropTypes.bool.isRequired,
    resetLabel: PropTypes.string.isRequired,
    isResetLabel: PropTypes.string.isRequired,
    onReset: PropTypes.func.isRequired,
    disabledSelectFW: PropTypes.bool,
    disabledReset: PropTypes.bool,
    placeholder: PropTypes.string,
    handleChangeIsReset: PropTypes.func.isRequired,
    isReset: PropTypes.bool.isRequired,
    isResetLabelStyle: PropTypes.string.isRequired,
    disabledIsReset: PropTypes.bool.isRequired,
};

P2MultipleFwUpgradeActPanel.defaultProps = defaultPropsObj;

export default withStyles(styles)(P2MultipleFwUpgradeActPanel);
