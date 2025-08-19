import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import JSZip from 'jszip';
import Cookies from 'js-cookie';
import CloseIcon from '@material-ui/icons/Clear';
// import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {
    adjustMapOnOff,
    updateBackgroundId,
} from '../../redux/meshTopology/meshTopologyActions';
import {
    syncProjectUiSettings,
    setProjectUIBackgroundObj,
    setProjectUIBackgroundSettings,
} from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import useP2DragUpload from '../common/useP2DragUpload';
import Transition from '../common/Transition';
import AdjustModeInterface from './AdjustModeInterface';
import BackgroundEditor from './BackgroundEditor';
import P2Dialog from '../../components/common/P2Dialog';
import {loadImage} from '../../util/commonFunc';
import {uploadProjectImage, deleteProjectImage} from '../../util/apiCall';
import {adjustModeHandler} from '../../containers/mesh/cluster/topology/TopologyGraphPixi';

const CustomMapApp = (props) => {
    const dispatch = useDispatch();
    const isAdjustMode = useSelector(store => store.meshTopology.adjustMode);
    const {
        csrf,
        hostInfo: {hostname, port},
    } = useSelector(store => store.common);
    const {projectId} = useSelector(store => store.projectManagement);
    const {
        t, open, closeApp,
        background, image,
    } = props;
    const [state, setState] = useState({
        editMode: false,
        image: new Image(),
        isLoading: false,
        dialog: {
            open: false,
            title: '',
            content: '',
            handleClose: () => { setState({...state, dialog: {...state.dialog, open: false}}); },
            actionTitle: '',
            actionAct: () => {},
            cancelTitle: '',
            cancelAct: () => {},
        },
    });
    const unmountFunc = () => {
        return () => {
            dispatch(adjustMapOnOff(false));
        };
    };
    useEffect(unmountFunc, []);
    const handleOnOffOnChange = () => {
        if (open) {
            if (image.set) {
                setState({
                    ...state,
                    editMode: false,
                    isLoading: true,
                });
                const projectId = Cookies.get('projectId');
                const {id, timestamp} = image;
                // const imgUrl = `/api/django/media/${projectId}/${id}?t=${timestamp}`;

                const imgUrl = `http://${hostname}:${port}/media/${projectId}/${id}?t=${timestamp}`;


                loadImage(imgUrl).then((imageObj) => {
                    setState({
                        ...state,
                        editMode: true,
                        image: imageObj,
                        isLoading: false,
                    });
                }).catch(() => { setState({...state, isLoading: false}); });
            }
        } else {
            setState({
                ...state,
                editMode: false,
                image: new Image(),
                isLoading: false,
                dialog: {...state.dialog, open: false},
            });
        }
    };
    useEffect(handleOnOffOnChange, [open]);

    const handleError = (type) => {
        let title = t('uploadFailedTitle');
        let content = t('unknownErrorContent');
        if (type === 'uploadImageLowResolution') {
            title = t('uploadFailedTitle');
            content = t('uploadImageLowResolutionContent');
        } else if (type === 'fileSize.maxSize') {
            title = t('imageExceedSize');
            content = t('imageExceedSizeContent');
        } else if (type === 'fileName.maxSize') {
            title = t('uploadFailedTitle');
            content = t('fileNameTooLongContent');
        }

        setState({
            ...state,
            dialog: {
                ...state.dialog,
                open: true,
                title,
                content,
                actionTitle: t('ok'),
                actionAct: () => {
                    setState({
                        ...state,
                        isLoading: false,
                        dialog: {...state.dialog, open: false},
                    });
                },
            },
        });
    };

    const zipImage = (file) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            try {
                const fileSize = file[0].size;
                if (fileSize > 5000000) throw new Error('fileSize.maxSize');
                if (file[0].name.length > 64) throw new Error('fileName.maxSize');
                const nameArr = file[0].name.split('.');
                nameArr[nameArr.length - 1] = nameArr[nameArr.length - 1].toLowerCase();
                const fileName = nameArr.join('.');

                // zip the image
                const zip = new JSZip();
                zip.file(fileName, fileReader.result);
                zip.generateAsync({type: 'blob', mimeType: 'application/octet-stream'}).then((base64) => {
                    const formObj = new FormData();
                    formObj.append('image', base64);
                    // upload the zip file
                    uploadProjectImage(csrf, projectId, formObj).then((res) => {
                        const projectId = Cookies.get('projectId');
                        const imgId = res[fileName];
                        const timestamp = Date.now();
                        // load the image after the zip file upload success
                        // const imgUrl = `/api/django/media/${projectId}/${imgId}?t=${timestamp}`;

                        const imgUrl = `http://${hostname}:${port}/media/${projectId}/${imgId}?t=${timestamp}`;

                        loadImage(imgUrl).then((img) => {
                            const pos = adjustModeHandler.getImageCenterPos(img.width, img.height);
                            setState({
                                ...state,
                                dialog: {
                                    ...state.dialog,
                                    open: true,
                                    title: t('uploadSuccessTitle'),
                                    content: t('uploadSuccessContent'),
                                    actionTitle: t('ok'),
                                    actionAct: () => {
                                        dispatch(updateBackgroundId({
                                            set: true,
                                            id: imgId,
                                            timestamp: Date.now(),
                                        }));
                                        dispatch(setProjectUIBackgroundObj({
                                            pos,
                                            show: true,
                                            opacity: 1,
                                            fixHeight: false,
                                            fixWidth: false,
                                            imgSize: {width: img.width, height: img.height},
                                            viewSize: {width: img.width, height: img.height},
                                        }));
                                        dispatch(syncProjectUiSettings());
                                        setState({
                                            ...state,
                                            editMode: true,
                                            image: img,
                                            isLoading: false,
                                            dialog: {...state.dialog, open: false},
                                        });
                                    },
                                },
                            });
                        }).catch((e) => { handleError(e.message); }); // catch error on downloading img
                    }).catch((e) => { handleError(e.message); }); // catch error on upload process
                }).catch((e) => { handleError(e.message); }); // catch error in zip process
            } catch (e) { handleError(e.message); } // catch error in file size
        };
        fileReader.readAsArrayBuffer(file[0]);
    };

    function handleFileUpload(file) {
        if (file.length === 0) return;
        setState({...state, isLoading: true});
        const fileReaderForImgResolution = new FileReader();
        fileReaderForImgResolution.onloadend = () => {
            // check the image resolution
            loadImage(fileReaderForImgResolution.result).then((img) => {
                if (img.width < 320 || img.height < 240) throw new Error('uploadImageLowResolution');
                zipImage(file);
            }).catch((e) => { handleError(e.message); }); // catch error img resolution
        };
        fileReaderForImgResolution.readAsDataURL(file[0]);
    }

    const resetAllChanges = () => {
        setState({
            ...state,
            dialog: {
                ...state.dialog,
                open: true,
                title: t('resetTitle'),
                content: t('resetContent'),
                actionTitle: t('ok'),
                actionAct: () => {
                    adjustModeHandler.adjustMapReset();
                    setState({
                        ...state,
                        dialog: {...state.dialog, open: false},
                    });
                },
                cancelTitle: t('cancel'),
                cancelAct: () => {
                    setState({
                        ...state,
                        dialog: {
                            ...state.dialog,
                            open: false,
                            cancelTitle: '',
                            cancelAct: () => {},
                        },
                    });
                },
            },
        });
    };

    const {getRootProps, getInputProps, dragging} = useP2DragUpload(
        {handleFile: handleFileUpload, accept: ['.jpg', '.jpeg', '.png', '.gif']});

    const changeToAdjustMode = () => { dispatch(adjustMapOnOff(true)); };

    const closeAdjustMode = (confirmAct) => {
        if (confirmAct) {
            setState({
                ...state,
                dialog: {
                    ...state.dialog,
                    open: true,
                    title: t('closeAdjustModeConfirmTitle'),
                    content: t('closeAdjustModeConfirmContent'),
                    actionTitle: t('ok'),
                    actionAct: () => {
                        dispatch(adjustMapOnOff(false));
                        setState({
                            ...state,
                            dialog: {...state.dialog, open: false},
                        });
                    },
                    cancelTitle: t('cancel'),
                    cancelAct: () => {
                        setState({
                            ...state,
                            dialog: {...state.dialog, open: false},
                        });
                    },
                },
            });
        } else {
            dispatch(adjustMapOnOff(false));
        }
    };

    const removeImage = () => {
        setState({
            ...state,
            isLoading: true,
        });
        deleteProjectImage(csrf, projectId, {imageIds: [image.id]}).then(() => {
            dispatch(updateBackgroundId({
                set: false,
                id: '',
                timestamp: '',
            }));
            dispatch(setProjectUIBackgroundSettings('color', '#e5e5e5'));
            dispatch(syncProjectUiSettings());
            setState({
                ...state,
                image: new Image(),
                editMode: false,
                isLoading: false,
            });
        }).catch((e) => {
            console.log('remove failed');
            console.log(e);
            setState({
                ...state,
                dialog: {
                    ...state.dialog,
                    open: true,
                    title: t('removeMapFailTitle'),
                    content: t('removeMapFailContent'),
                    actionTitle: t('ok'),
                    actionAct: () => {
                        setState({
                            ...state,
                            dialog: {...state.dialog, open: false},
                        });
                    },
                    cancelTitle: '',
                    cancelAct: () => {},
                },
            });
        });
    };

    const confirmRemove = () => {
        setState({
            ...state,
            dialog: {
                ...state.dialog,
                open: true,
                title: t('removeMapConfirmTitle'),
                content: t('removeMapConfirmContent'),
                actionTitle: t('ok'),
                actionAct: removeImage,
                cancelTitle: t('cancel'),
                cancelAct: () => {
                    setState({
                        ...state,
                        dialog: {
                            ...state.dialog,
                            open: false,
                            cancelTitle: '',
                            cancelAct: () => {},
                        },
                    });
                },
            },
        });
    };

    const confirmFunc = () => {
        dispatch(setProjectUIBackgroundObj(adjustModeHandler.backgroundTemp));
        dispatch(syncProjectUiSettings());
        closeApp();
    };

    const uploadPanel = (<section
        className="container"
        style={{
            width: '100%',
            height: 'calc(90vh - 305px)',
            border: `5px dashed ${dragging ? '#425581' : '#BDBDBD'}`,
            userSelect: 'none',
            outline: 'none',
        }}
    >
        {state.isLoading ? (<div
            style={{
                position: 'absolute',
                width: 'calc(100% - 88px)',
                height: 'calc(100% - 141px)',
                zIndex: '100',
                backgroundColor: 'white',
                opacity: '0.9',
            }}
        >
            <img
                src="/img/loading.gif"
                alt="loading"
                style={{
                    display: 'block',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: '-30px',
                    marginTop: '-30px',
                    width: '60px',
                    height: '60px',
                }}
            />
        </div>) : null}
        <div
            {...getRootProps({className: 'dropzone'})}
            style={{
                fontSize: '2rem',
                color: dragging ? '#425581' : '#BDBDBD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                height: 'calc(100% - 20px)',
                outline: 'none',
                cursor: 'pointer',
                padding: '10px 0',
            }}
        >
            <input {...getInputProps()} />
            <svg width="18vh" height="18vh" viewBox="0 0 112 136" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M32 104H80V56H112L56 0L0 56H32V104ZM0 120H112V136H0V120Z"
                    fill={dragging ? '#425581' : '#E0E0E0'}
                />
            </svg>
            {dragging ?
                <Typography
                    style={{
                        fontSize: '32px',
                        marginBlockStart: '0.75em',
                    }}
                >
                    {t('draggingLabel')}
                </Typography>
                :
                <div style={{width: '100%'}} align="center">
                    <Typography style={{fontSize: '3.5vw', fontWeight: 300, paddingBottom: 10}}>
                        {t('dragToStart')}
                    </Typography>
                    <Typography style={{fontSize: '2vw', fontWeight: 300}}>{t('fileSizeLimit')}</Typography>
                    <Typography style={{fontSize: '2vw', fontWeight: 300}}>{t('fileFormat')}</Typography>
                </div>}
        </div>
    </section>);

    return (
        <div>
            <Dialog
                disableBackdropClick
                data-testid="proj-list-dialog"
                disableEscapeKeyDown
                fullWidth
                maxWidth="xl"
                open={open && !isAdjustMode}
                TransitionComponent={Transition}
                transitionDuration={600}
                TransitionProps={{direction: 'up'}}
            >
                <DialogTitle style={{margin: '0 0 0 20px'}} >
                    <div style={{display: 'inline-block'}}>
                        <Typography style={{fontSize: 25, fontWeight: 'bold'}}>
                            {t('customMapTitle')}
                        </Typography>
                        <Typography style={{color: 'rgba(0, 0, 0, 0.5'}}>
                            {t('customMapSubTitle')}
                        </Typography>
                    </div>
                    <IconButton style={{display: 'inline-block', float: 'right'}} onClick={closeApp}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div style={{margin: '0 20px 20px 20px'}}>
                        {!state.editMode ? uploadPanel : (
                            <BackgroundEditor
                                t={t}
                                width="100%"
                                height="calc(90vh - 305px)"
                                image={state.image}
                                showMap={background.show}
                                changeToAdjustMode={changeToAdjustMode}
                                removeImage={confirmRemove}
                            />
                        )}
                    </div>
                </DialogContent>
                <P2Dialog
                    open={state.dialog.open}
                    handleClose={state.dialog.handleClose}
                    title={state.dialog.title}
                    content={state.dialog.content}
                    actionTitle={state.dialog.actionTitle}
                    actionFn={state.dialog.actionAct}
                    cancelActTitle={state.dialog.cancelTitle}
                    cancelActFn={state.dialog.cancelAct}
                />
            </Dialog>
            {open && <AdjustModeInterface
                open={open && isAdjustMode}
                t={t}
                closeAdjustMode={closeAdjustMode}
                resetAll={resetAllChanges}
                opacityPreview={adjustModeHandler.adjustMapOpacity}
                confirmFunc={confirmFunc}
                initState={{opacity: background.opacity * 100}}
                setDimensionView={adjustModeHandler.fixDimensionView}
                setViewport={adjustModeHandler.setViewport}
                resetMapDimension={adjustModeHandler.resetMapSize}
                resetToDefault={adjustModeHandler.resetToDefault}
                fixViewBool={{fixWidth: background.fixWidth, fixHeight: background.fixHeight}}
                setBackgroundColor={adjustModeHandler.setBackgroundColor}
                initColor={background.color}
            />}
        </div>
    );
};

CustomMapApp.propTypes = {
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    background: PropTypes.shape({
        show: PropTypes.bool.isRequired,
        color: PropTypes.string.isRequired,
        opacity: PropTypes.number.isRequired,
        fixWidth: PropTypes.bool.isRequired,
        fixHeight: PropTypes.bool.isRequired,
    }).isRequired,
    closeApp: PropTypes.func.isRequired,
    image: PropTypes.shape({
        set: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default CustomMapApp;
