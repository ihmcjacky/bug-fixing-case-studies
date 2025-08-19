import {useState} from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import {loadImage} from '../../util/commonFunc';

// Tools for convert html element to image by using html2canvas library
const useD3ToCanvasTool = (props) => {
    const {id} = props;
    const [state, setState] = useState({
        loading: false,
        done: false,
        url: '',
    });

    // Check if the html element contain any enternal image
    // Download image and append the dataURL to the image element
    const loopInChildNodes = async (node) => {
        const children = node.childNodes;
        await Promise.all(Object.values(children).map(async (child) => {
            if (child.childNodes.length) {
                return loopInChildNodes(child);
            } else if (child.tagName === 'image') {
                // make all external image path to internal path
                const imageHref = child.getAttribute('href');
                if (imageHref) {
                    await loadImage(imageHref).then(async (img) => {
                        // get the data url through canvas
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const temp = canvas.toDataURL();
                        child.setAttribute('href', temp);
                    });
                }
            }
            return true;
        }));
    };

    // call library to convert
    const parseSvgToString = async (targetElem, option) => {
        await loopInChildNodes(targetElem);
        return html2canvas(targetElem, option).then(canvas => canvas);
    };

    const getCanvas = async (option) => {
        setState({...state, loading: true, done: false});
        const targetElem = document.getElementById(id);
        const canvas = await parseSvgToString(targetElem, option);
        setState({
            ...state,
            loading: false,
            done: true,
            url: canvas.toDataURL(),
        });
        return canvas;
    };

    const resetState = () => {
        setState({
            ...state,
            loading: false,
            done: false,
        });
    };

    return {getCanvas, resetState, ...state};
};

useD3ToCanvasTool.propTypes = {
    id: PropTypes.string.isRequired,
};

export default useD3ToCanvasTool;
