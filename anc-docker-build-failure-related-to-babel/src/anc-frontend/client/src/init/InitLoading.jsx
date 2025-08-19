import React from 'react';

const InitLoading = () => {
    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                backgroundColor: 'rgb(229, 229, 229)',
            }}
        >
            <img
                src="/img/loading.gif"
                alt="loading"
                style={{
                    display:'block',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: '-30px',
                    marginTop: '-30px',
                    width: '60px',
                    height: '60px',
                }}
            />
        </div>
    );
};

export default InitLoading;
