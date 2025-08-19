/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-03-26 15:48:31
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-08-18 12:22:54
 * @ Description:
 */

import {useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types';

const useP2DragUpload = ({handleFile, accept}) => {
    const [dragging, setDragging] = useState(false);

    const onDragEnter = useCallback(() => setDragging(true), []);

    const onDragLeave = useCallback(() => setDragging(false), []);

    const onDrop = useCallback((acceptedFiles) => {
        handleFile(acceptedFiles);
        onDragLeave();
    }, [handleFile, onDragLeave]);

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        onDragEnter,
        onDragLeave,
        accept,
    });

    return {getRootProps, getInputProps, dragging};
};

useP2DragUpload.propTypes = {
    accept: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    handleFile: PropTypes.func.isRequired,
};

export default useP2DragUpload;
