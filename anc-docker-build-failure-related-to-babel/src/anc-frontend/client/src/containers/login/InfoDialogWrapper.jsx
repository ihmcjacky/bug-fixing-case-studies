import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import CommonConstants from '../../constants/common';
import InfoDialog from '../../components/common/InfoDialog';

const {theme} = CommonConstants;

const InfoDialogWrapper = (props) => {
    const {t} = props;
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div>
            <Fab
                onClick={handleOpenDialog}
                style={{
                    backgroundColor: 'white',
                    position: 'absolute',
                    bottom: '7%',
                    right: '5%',
                }}
            >
                <Typography
                    style={{
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        fontSize: '26px',
                        fontWeight: 'bold',
                    }}
                    variant="body2"
                >i</Typography>
            </Fab>
            <InfoDialog
                t={t}
                open={dialogOpen}
                closeFunc={handleCloseDialog}
            />
        </div>
    );
};

InfoDialogWrapper.propTypes = {
    t: PropTypes.func.isRequired,
};

export default InfoDialogWrapper;