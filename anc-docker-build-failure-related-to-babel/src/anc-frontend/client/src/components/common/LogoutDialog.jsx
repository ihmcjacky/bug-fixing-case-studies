import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie';
import P2Dialog from './P2Dialog';
import CommonConstants from '../../constants/common';
import {useHistory} from 'react-router-dom';
import {closeLogoutDialog} from '../../redux/common/commonActions';
import {updateShouldShowHostnodeUnreachableDialog} from '../../redux/meshTopology/cachedMeshTopologyActions';
const {zIndexLevel} = CommonConstants;
const LogoutDialog = () => {
    const {
        open,
        title, content,
        actionTitle,
        cancelTitle,
    } = useSelector(store => store.common.logoutDialog);

    const dispatch = useDispatch();
    const logoutFunc = () => {
        Cookies.remove('projectId');
        Cookies.remove('quickStagingLoginRequest');
        history.push('/login');
        window.location.assign(`${window.location.origin}/index.html`);
    };
    const toProjectList = () => {
        Cookies.remove('projectId');
        Cookies.remove('quickStagingLoginRequest');
        Cookies.set('landingView', 'list')
        history.push('/login');
        window.location.assign(`${window.location.origin}/index.html`);
    }

    const history = useHistory();
    if (cancelTitle) {
        return (
            <P2Dialog
                open={open}
                title={title}
                handleClose={() => {}}
                content={content}
                actionTitle={actionTitle}
                actionFn={toProjectList}
                cancelActTitle={cancelTitle}
                cancelActFn={() => {
                    dispatch(closeLogoutDialog())
                    dispatch(updateShouldShowHostnodeUnreachableDialog(false));
                }}
                zIndex={zIndexLevel.high}
            />
        );
    }
    return (
        <P2Dialog
            open={open}
            title={title}
            handleClose={() => {}}
            content={content}
            actionTitle={actionTitle}
            actionFn={logoutFunc}
            zIndex={zIndexLevel.high}
        />
    );
};

export default LogoutDialog;
