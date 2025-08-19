import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import P2SnackBar from '../common/P2SnackBar';
import {closeSnackbar} from '../../redux/common/commonActions';

const GlobalSnackBar = () => {
    const {open, messages, duration} = useSelector(store => store.common.snackBar);
    const dispatch = useDispatch();

    return (
        <P2SnackBar
            open={open}
            messages={messages}
            closeSnack={() => { dispatch(closeSnackbar()); }}
            duration={duration}
        />
    )
};

export default GlobalSnackBar;
