import React from 'react';
import PropTypes  from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import RssiViewer from '../../../../components/topology/RssiViewer';

const RssiViewerWrapper = (props) => {
    const {
        open,
        csrf,
        ip,
        hostname,
        projectId,
        close,
    } = props;

    return (
        <Dialog
            open={open}
            maxWidth="lg"
            onClose={close}
        >
            <RssiViewer
                ip={ip}
                csrf={csrf}
                hostname={hostname}
                close={close}
                projectId={projectId}
            />
        </Dialog>
    );
};

RssiViewerWrapper.propTypes = {
    open: PropTypes.bool.isRequired,
    csrf: PropTypes.string.isRequired,
    ip: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
};

export default RssiViewerWrapper;
