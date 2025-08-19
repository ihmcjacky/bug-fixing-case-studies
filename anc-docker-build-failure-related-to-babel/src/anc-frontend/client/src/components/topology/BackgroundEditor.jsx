import React, {useRef, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {makeStyles} from '@material-ui/styles';
import PropTypes from 'prop-types';
import AdjustIcon from '@material-ui/icons/OpenWith';
import DeleteIcon from '@material-ui/icons/Delete';
import ShowMapIcon from '@material-ui/icons/Visibility';
import HideMapIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import {syncProjectUiSettings, setProjectUIBackgroundSettings} from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import P2Tooltip from '../common/P2Tooltip';

const styles = {
    iconButtonRoot: {
        borderRadius: 0,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
};
const useStyle = makeStyles(styles);

const BackgroundEditor = (props) => {
    const {
        t,
        width,
        height,
        image,
        showMap,
        changeToAdjustMode,
        removeImage,
    } = props;
    const imageRef = useRef();
    const canvasRef = useRef();
    const drawImage = () => {
        const gallery = imageRef.current;
        const canvasWidth = canvasRef.current.clientWidth;
        const canvasHeight = canvasRef.current.clientHeight;
        // scale to make image fit in canvas
        const minScale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
        // center the image in canvas
        const widthSpace = canvasWidth - (image.width * minScale);
        const heightSpace = canvasHeight - (image.height * minScale);
        gallery.style.transform = `translate(${widthSpace / 2}px, ${heightSpace / 2}px) scale(${minScale})`;
        gallery.src = image.src;
    };
    const dispatch = useDispatch();
    const classes = useStyle();

    useEffect(() => {
        drawImage();
        window.addEventListener('resize', drawImage);
        return () => { window.removeEventListener('resize', drawImage); };
    });

    const deleteMap = removeImage;

    const showHideMap = () => {
        dispatch(setProjectUIBackgroundSettings('show', !showMap));
        dispatch(syncProjectUiSettings());
    };

    return (
        <div style={{height, width, overflowX: 'hidden'}}>
            <div
                style={{
                    position: 'absolute',
                    right: '48px',
                    top: '112px',
                    flexDirection: 'column',
                    display: 'flex',
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '5px',
                    zIndex: 100,
                }}
            >
                <P2Tooltip
                    title={t('deleteMapTooltip')}
                    direction="left"
                    content={<IconButton
                        disableTouchRipple
                        value="delete"
                        onClick={deleteMap}
                        classes={{root: classes.iconButtonRoot}}
                    >
                        <DeleteIcon style={{color: '#D50000'}} />
                    </IconButton>}
                />
                <P2Tooltip
                    title={t('adjustMapTooltip')}
                    direction="left"
                    content={<div>
                        <IconButton
                            disableTouchRipple
                            value="adjust"
                            classes={{root: classes.iconButtonRoot}}
                            onClick={changeToAdjustMode}
                            disabled={!showMap}
                        >
                            <AdjustIcon />
                        </IconButton>
                    </div>}
                />
                <P2Tooltip
                    title={showMap ? t('showMapTooltip') : t('hideMapTooltip')}
                    direction="left"
                    content={<IconButton
                        disableTouchRipple
                        value="showMap"
                        onClick={showHideMap}
                        classes={{root: classes.iconButtonRoot}}
                    >
                        {showMap ? <ShowMapIcon /> : <HideMapIcon />}
                    </IconButton>}
                />
            </div>
            <div
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <img
                    ref={imageRef}
                    alt="diaplay-map"
                    style={{transformOrigin: '0 0'}}
                />
            </div>
        </div>
    );
};

BackgroundEditor.propTypes = {
    t: PropTypes.func.isRequired,
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    image: PropTypes.object.isRequired, // eslint-disable-line
    showMap: PropTypes.bool.isRequired,
    changeToAdjustMode: PropTypes.func.isRequired,
    removeImage: PropTypes.func.isRequired,
};

BackgroundEditor.defaultProps = { };

export default BackgroundEditor;
