import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const AccountBox = (props) => {
    const {
        t,
        handleSecurityCardOpen,
    } = props;

    return (
        <div
            id="AccountSettingCard"
            style={{minWidth: '780px'}}
        >
            <Typography
                color="primary"
                style={{
                    fontWeight: 'bold',
                    paddingBottom: '20px',
                    paddingTop: '20px',
                }}
            >
                {t('security')}
            </Typography>
            <Card>
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={12} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <i className="material-icons" style={{fontSize: '41px'}}>
                                account_circle
                            </i>
                        </div>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography
                                color="primary"
                                style={{
                                    paddingLeft: '10px',
                                }}
                            >
                                <strong>{t('userAccount')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            id="changePwdBtn"
                            variant="contained"
                            color="primary"
                            style={{
                                float: 'right',
                                marginRight: '10px',
                                marginTop: '15px',
                            }}
                            onClick={handleSecurityCardOpen}
                        >
                            {t('changePwd')}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

AccountBox.propTypes = {
    t: PropTypes.func.isRequired,
    handleSecurityCardOpen: PropTypes.func.isRequired,
};

export default AccountBox;
