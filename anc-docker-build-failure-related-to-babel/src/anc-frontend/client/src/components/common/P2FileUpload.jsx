/**
 * @Author: mango
 * @Date:   2018-05-15T18:58:09+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-05-15T19:42:39+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import '../../css/fileUploadField.css';

const defaultPropsObj = {
    disabledSelectFile: false,
    fileSize: '',
};


function P2FileUpload(props) {
    return (
        <div className="fileUploadContainer">
            <input
                id={props.inputId}
                type="file"
                accept={props.acceptType}
                multiple={false}
                onChange={props.selectFileHandler}
                filename={props.fileName}
                disabled={props.disabledSelectFile}
                className="fileUploadInput"
            />
            <Input
                placeholder={props.placeholder}
                value={`${props.fileName}${props.fileSize}`}
                disabled={props.disabledSelectFile}
                className="fileUploadInputFake"
            />
        </div>
    );
}

P2FileUpload.propTypes = {
    inputId: PropTypes.string.isRequired,
    acceptType: PropTypes.string.isRequired,
    selectFileHandler: PropTypes.func.isRequired,
    fileName: PropTypes.string.isRequired,
    disabledSelectFile: PropTypes.bool,
    fileSize: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
};

P2FileUpload.defaultProps = defaultPropsObj;

export default P2FileUpload;
