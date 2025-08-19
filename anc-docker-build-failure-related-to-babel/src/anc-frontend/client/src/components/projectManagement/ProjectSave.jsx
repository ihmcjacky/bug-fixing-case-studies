import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import P2Dialog from '../common/P2Dialog';
import LockLayer from '../common/LockLayer';
import FromInput from '../common/FormInput';
import {formValidator} from '../../util/inputValidator';
import {projectSaveStyles} from './styles';
import ProjectConstants from '../../constants/project';
import CommonConstants from '../../constants/common';

const {project: {quickStagingName}} = ProjectConstants;
const {zIndexLevel} = CommonConstants;

const useStyles = makeStyles(projectSaveStyles);

const ProjectSave = (props) => {
    const classes = useStyles();
    const {
        t,
        list,
        saveHandleCancel,
        saveHandleSaveAs,
        saveHandleLoginFail,
    } = props;

    const [lock, setLock] = useState(false);
    const [nameInput, setNameInput] = useState({
        projectName: '',
        error: false,
        helperText: ' ',
        disableBtn: true,
    });
    const [loginFailDialog, setLoginFailDialog] = useState({
        open: false,
    });

    const handlePwsInputOnChange = (e) => {
        const inputValue = e.target.value;
        let validName = {result: true, text: ''};
        let error = '';
        const projectIDregexPattern = /^[ 0-9a-zA-Z_-]{1,32}$/;
        const spaceRegexPattern = /.*[^ ].*/;
        list.some((proj) => {
            if (proj.projectName.trim() === inputValue) {
                validName = {result: false, text: t('idExistedStr')};
                return true;
            }
            return false;
        });
        if (validName.result) {
            validName = formValidator('matchRegex', inputValue, projectIDregexPattern);
            if (!validName.result) {
                validName.text = t('invalidProjIDStr');
            } else {
                validName = formValidator('matchRegex', inputValue, spaceRegexPattern);
                if (!validName.result) {
                    validName.text = t('invalidProjIDStr');
                }
            }
        }
        if (inputValue === quickStagingName) {
            validName = {result: false, text: t('inputtedProjIDStr')};
        }
        if (!validName.result) {
            error = validName.text;
        }
        setNameInput({
            ...nameInput,
            projectName: inputValue,
            error: !validName.result,
            helperText: validName.result ? ' ' : error,
            disableBtn: !validName.result,
        });
    }

    const handleSaveAs = () => {
        setLock(true);
        saveHandleSaveAs(nameInput.projectName.trim()).then(() => {
            /* handled in project manager */
        }).catch((e) => {
            setLoginFailDialog({open: true});
        });
    }

    const handleEnterToLogin = (e) => {
        if (e.key === 'Enter') {
            if (nameInput.disableBtn) {
                handleSaveAs();
            }
        }
    }

    return (
        <div>
            <LockLayer display={lock} />
            <DialogTitle>
                <div style={{userSelect: 'none'}}>
                    <Typography variant="h6" color="inherit" className={classes.title}>
                        {t('saveAsTitle')}
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent classes={{root: classes.dialogContent}} >
                <Typography
                    variant="body2"
                    className={classes.bodyWord}
                >
                    {t('saveAsContent')}
                </Typography>
                <div className={classes.inputWrapper}>
                    <div className={classes.input}>
                        <FromInput
                            errorStatus={nameInput.error}
                            inputLabel={t('projectNameLabel')}
                            inputID="new-name-input"
                            inputValue={nameInput.projectName}
                            onChangeField={handlePwsInputOnChange}
                            onKeyPressField={handleEnterToLogin}
                            helperText={nameInput.helperText}
                            inputType="text"
                        />
                    </div>
                </div>
            </DialogContent>
            <div className={classes.btnWrapper}>
                <Button
                    onClick={saveHandleCancel}
                    color="primary"
                    className={classes.button}
                >
                    {t('cancel')}
                </Button>
                <Button
                    disabled={nameInput.disableBtn}
                    onClick={handleSaveAs}
                    color="primary"
                    className={classes.button}
                >
                    {t('save')}
                </Button>
            </div>
            <P2Dialog
                open={loginFailDialog.open}
                handleClose={() => { setLoginFailDialog({open: false}); }}
                title={t('loginFailDialogTitle')}
                content={t('loginFailDialogContent')}
                actionTitle={t('loginFailDialogAct')}
                actionFn={() => {
                    saveHandleLoginFail();
                    setLoginFailDialog({open: false});
                }}
                cancelActTitle=""
                cancelActFn={() => {}}
                zIndex={zIndexLevel.mediumHigh + 1}
            />
        </div>
    );
};

ProjectSave.propTypes = {
    t: PropTypes.func.isRequired,
    list: PropTypes.arrayOf(
        PropTypes.shape({
            projectId: PropTypes.string.isRequired,
            managementIp: PropTypes.string.isRequired,
            numOfNodes: PropTypes.number.isRequired,
            projectName: PropTypes.string.isRequired,
        })
    ).isRequired,
    saveHandleCancel: PropTypes.func.isRequired,
    saveHandleSaveAs: PropTypes.func.isRequired,
    saveHandleLoginFail: PropTypes.func.isRequired,
};

export default ProjectSave;
