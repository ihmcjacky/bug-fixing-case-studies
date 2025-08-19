/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-04-16 12:45:59
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-04-16 17:04:09
 * @ Description:
 */

import {useState, useCallback} from 'react';

const useP2PopOver = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [src, setSrc] = useState('');

    const onPopOverMouseEnter = useCallback((event, imgSrc = '') => {
        setAnchorEl(event.currentTarget);
        setSrc(imgSrc);
    }, []);

    const onPopOverClick = useCallback((event, imgSrc = '') => {
        setAnchorEl(event.target.value);
        setSrc(imgSrc);
    }, []);

    const onPopOverClose = useCallback(() => setAnchorEl(null), []);


    return {
        anchorEl,
        src,
        popOpen: Boolean(anchorEl),
        onPopOverMouseEnter,
        onPopOverClick,
        onPopOverClose,
    };
};


export default useP2PopOver;
