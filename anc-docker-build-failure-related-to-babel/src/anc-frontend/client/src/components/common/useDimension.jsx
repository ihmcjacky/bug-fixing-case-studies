import {useRef, useLayoutEffect, useState} from 'react';

const useDimension = (trackCondition = []) => {
    const ref = useRef();
    const [dimensions, setDimensions] = useState({});

    useLayoutEffect(() => {
        // console.log('kyle_debug: useDimensions -> ref', ref);
        setDimensions(ref.current.getBoundingClientRect().toJSON());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...trackCondition, ref.current]);

    return [ref, dimensions];
};

export default useDimension;
