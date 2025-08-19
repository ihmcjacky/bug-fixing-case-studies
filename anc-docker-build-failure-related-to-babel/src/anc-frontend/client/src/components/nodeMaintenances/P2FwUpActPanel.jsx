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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
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

function P2FwUpActPanel(props) {
    return (
        <div style={props.style.panelDiv || defaultPropsObj.style.panelDiv}>
            <div style={{display: 'flex'}}>
                <div style={{flexGrow: '1'}}>
                    <P2FileUpload
                        inputId="fwfile"
                        selectFileHandler={props.selectFileHandler}
                        fileName={props.fwFileName}
                        disabledSelectFile={props.disabledSelectFW}
                        fileSize={props.fwFileSize}
                        placeholder={props.placeholder}
                        acceptType="application/octet-stream,.bin"
                    />
                </div>
                <div style={{marginLeft: '10px', flexGrow: '0'}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={props.isReset}
                                onChange={props.handleChangeIsReset}
                                value="reset"
                                color="primary"
                                classes={{root: props.classes.checkbox}}
                            />
                        }
                        label={props.isResetLabel}
                        classes={{label: props.isResetLabelStyle, root: props.classes.isReset}}
                        disabled={props.disabledIsReset}
                    />
                </div>
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
    checkbox: {
        paddingRight: '5px',
        transform: 'scale(0.8)',
    },
    isReset: {
        marginTop: '-7px',
        marginRight: '0px',
    },
};

P2FwUpActPanel.propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line
    label: PropTypes.string.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    style: PropTypes.objectOf(PropTypes.object),
    selectFileHandler: PropTypes.func.isRequired,
    disabledUpgrade: PropTypes.bool.isRequired,
    resetLabel: PropTypes.string.isRequired,
    isResetLabel: PropTypes.string.isRequired,
    onReset: PropTypes.func.isRequired,
    fwFileName: PropTypes.string.isRequired,
    disabledSelectFW: PropTypes.bool,
    disabledReset: PropTypes.bool,
    fwFileSize: PropTypes.string,
    placeholder: PropTypes.string,
    handleChangeIsReset: PropTypes.func.isRequired,
    isReset: PropTypes.bool.isRequired,
    isResetLabelStyle: PropTypes.string.isRequired,
    disabledIsReset: PropTypes.bool.isRequired,
};

P2FwUpActPanel.defaultProps = defaultPropsObj;

export default withStyles(styles)(P2FwUpActPanel);
