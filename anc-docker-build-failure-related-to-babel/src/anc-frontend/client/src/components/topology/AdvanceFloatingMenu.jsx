import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import Tooltip from '@material-ui/core/Tooltip';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import Fade from '@material-ui/core/Zoom';
import Constant from '../../constants/common';

const {theme} = Constant;
const styles = {
    wrapper: {
        position: 'relative',
    },
    showButtonRoot: {
        position: 'fixed',
        right: 0,
        bottom: 90,
        padding: 0,
        minWidth: 0,
        width: '25px',
        height: '80px',
        borderRadius: '5px 0 0 5px',
    },
    hiddenButtonLabel: {
        fontSize: '18px',
    },
    lockButtonLabel: {
        fontSize: '14px',
    },
    hiddenButtonStyle: {
        minWidth: 0,
        minHeight: 0,
        width: 24,
        height: 24,
        position: 'absolute',
        left: 64,
        bottom: 16,
    },
    lockButtonStyle: {
        minWidth: 0,
        minHeight: 0,
        width: 24,
        height: 24,
        position: 'absolute',
        left: 50,
        bottom: 48,
    },
    extraArea: {
        position: 'absolute',
        width: '100px',
        height: '100px',
        bottom: -11,
        left: 28,
    },
    fabBtn: {
        backgroundColor: 'white',
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: 'white',
            color: theme.palette.primary.main,
        },
    },
    mainIconOpen: {
        transform: 'none',
    },
    mainBtnAreaStyle: {
        position: 'absolute',
        width: '56px',
        height: '56px',
        borderRadius: '100%',
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    tooltipLock: {
        paddingLeft: '40px',
    },
    tooltipCollapse: {
        paddingLeft: '40px',
    },
};

function Transition(props) {
    return <Slide direction="left" {...props} appear={false} />;
}

class AdvanceFloatingMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            extraAreaHover: false,
            mainBtnArea: false,
            hidden: false,
            lock: Cookies.get('floatingMenuLockInit') === 'true',
            swapDialWithFab: false,
        };
        this.ref = {};
        const fnNames = [
            'handleOpen',
            'handleClose',
            'handleHideMenu',
            'handleLockMenu',
            'handleShowMenu',
            'handleMouseEnterExtraArea',
            'handleMouseLeaveExtraArea',
            'handleMouseEnterMainBtnArea',
            'handleMouseLeaveMainBtnArea',
        ];
        fnNames.forEach((fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.isDefaultOpen = false;
    }

    handleHideMenu() {
        this.shouldNotReact = true;
        this.setState({
            open: false,
            extraAreaHover: false,
            lock: false,
            hidden: true,
        });
    }

    handleLockMenu() {
        if (!this.state.lock) {
            this.isDefaultOpen = true;
        } else {
            this.isDefaultOpen = false;
        }
        this.setState({
            lock: !this.state.lock,
        }, () => {
            Cookies.set('floatingMenuLockInit', this.state.lock);
        });
    }

    handleShowMenu() {
        this.shouldNotReact = false;
        this.setState({
            hidden: false,
            open: this.isDefaultOpen,
            lock: this.isDefaultOpen,
        });
    }

    handleOpen() {
        if (this.shouldNotReact) {
            return;
        }
        this.setState({
            open: true,
        });
    }

    handleClose() {
        this.setState({
            open: false,
        });
    }

    handleMouseEnterExtraArea() {
        if (this.shouldNotReact) {
            return;
        }
        this.setState({
            extraAreaHover: true,
        });
    }


    handleMouseLeaveExtraArea() {
        this.setState({
            extraAreaHover: false,
        });
    }

    handleMouseEnterMainBtnArea() {
        this.setState({
            mainBtnArea: true,
        });
    }

    handleMouseLeaveMainBtnArea() {
        this.setState({
            mainBtnArea: false,
        });
    }

    render() {
        const mainLayout = document.getElementById('mainLayout');
        let scrollbarShown = false;
        if (mainLayout) {
            scrollbarShown = mainLayout.offsetHeight < mainLayout.scrollHeight;
        }
        const {classes} = this.props;
        const {
            open,
            lock,
            hidden,
            extraAreaHover,
            mainBtnArea,
            swapDialWithFab,
        } = this.state;
        const shouldOpen = open || extraAreaHover || lock || mainBtnArea;
        const samllShouldOpen = extraAreaHover || mainBtnArea;
        const shouldSwapDialWithFab = !shouldOpen && !hidden;
        if(shouldSwapDialWithFab != swapDialWithFab){
            if(this.ref.swapTimeout !== undefined){
                clearTimeout(this.ref.swapTimeout);
            }
            if(shouldSwapDialWithFab){
                this.ref.swapTimeout = setTimeout(() => {
                    this.setState({
                        swapDialWithFab: true
                    })
                }, 500)
            }else{
                this.ref.swapTimeout = setTimeout(() => {
                    this.setState({
                        swapDialWithFab: false
                    })
                }, 0)
            }
        }
        const mainIcon = (
            <SpeedDialIcon
                icon={this.props.mainBtn.icon}
                classes={{
                    iconOpen: classes.mainIconOpen,
                }}
            />
        );
        return (
            <div
                className={classes.wrapper}
            >
                {
                    !hidden ? (
                        <div
                            className={classes.extraArea}
                            onMouseEnter={this.handleMouseEnterExtraArea}
                            onMouseLeave={this.handleMouseLeaveExtraArea}
                        />
                    ) : null
                }
                {
                    !hidden ? (
                        <Tooltip
                            id="tooltip"
                            title={this.props.mainBtn.name}
                            placement="left"
                            classes={{
                                tooltip: classes.tooltipRoot,
                            }}
                            disableFocusListener
                            disableTouchListener
                        >
                            <Button
                                className={classes.mainBtnAreaStyle}
                                onMouseEnter={this.handleMouseEnterMainBtnArea}
                                onMouseLeave={this.handleMouseLeaveMainBtnArea}
                                onClick={this.props.mainBtn.onClick}
                                style={{backgroundColor: 'transparent'}}
                                disableFocusRipple
                                disableRipple
                            >
                                <i style={{visibility: 'hidden'}} />
                            </Button>
                        </Tooltip>
                    ) : null
                }
                <SpeedDial
                    classes={{
                        fab: classes.fabBtn,
                    }}
                    ariaLabel="Floating Menu"
                    className={classes.speedDial}
                    icon={mainIcon}
                    // onClick={this.props.mainBtn.onClick}
                    openIcon={mainIcon}
                    onClose={this.handleClose}
                    onFocus={this.handleOpen}
                    onMouseEnter={this.handleOpen}
                    onMouseLeave={this.handleClose}
                    open={shouldOpen}
                    hidden={hidden}
                    TransitionComponent={Transition}
                    style={!swapDialWithFab? {} : {position:"absolute", left:"300px"}}
                >
                    {this.props.actionBtns.map(action => (
                        <SpeedDialAction
                            classes={{fab: classes.fabBtn}}
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={action.onClick}
                        />
                    ))}
                </SpeedDial>
                {
                    swapDialWithFab ? (
                        <Fab
                            onMouseEnter={() => {this.handleOpen()}}
                            disabled={false}
                            classes={{
                                root: classes.fabBtn,
                            }}
                        >
                            {mainIcon}
                        </Fab>
                    ) : null
                }
                <Slide direction="left" in={!hidden} >
                    <span>
                        {
                            this.props.actionBtns.length > 0 ?
                                (<Fade in={samllShouldOpen}>
                                    <Tooltip
                                        id="tooltip"
                                        title={this.state.lock ? this.props.t('unlock') : this.props.t('lock')}
                                        placement="top"
                                        classes={{
                                            popper: classes.tooltipLock,
                                        }}
                                        disableFocusListener
                                        disableTouchListener
                                    >
                                        <Fab
                                            size="small"
                                            color="primary"
                                            className={classes.lockButton}
                                            onClick={this.handleLockMenu}
                                            classes={{
                                                sizeSmall: classes.lockButtonStyle,
                                                root: classes.fabBtn,
                                            }}
                                            onMouseEnter={this.handleMouseEnterExtraArea}
                                        >
                                            {this.state.lock ?
                                                <LockIcon
                                                    classes={{root: classes.lockButtonLabel}}
                                                /> :
                                                <LockOpenIcon
                                                    classes={{root: classes.lockButtonLabel}}
                                                />}
                                        </Fab>
                                    </Tooltip>
                                </Fade>) : <span />
                        }
                        <Fade in={samllShouldOpen}>
                            <Tooltip
                                id="tooltip"
                                title={this.props.t("collapse")}
                                placement="bottom"
                                classes={{
                                    popper: classes.tooltipCollapse,
                                }}
                                disableFocusListener
                                disableTouchListener
                            >
                                <Fab
                                    size="small"
                                    color="primary"
                                    className={classes.hiddenButton}
                                    onClick={this.handleHideMenu}
                                    classes={{
                                        sizeSmall: classes.hiddenButtonStyle,
                                    }}
                                    onMouseEnter={this.handleMouseEnterExtraArea}
                                >
                                    <KeyboardArrowRight classes={{root: classes.hiddenButtonLabel}} />
                                </Fab>
                            </Tooltip>
                        </Fade>
                    </span>
                </Slide>
                <Slide direction="left" in={hidden} mountOnEnter unmountOnExit>
                    <span>
                        <Tooltip
                            id="expand"
                            title={this.props.t('expandActionMenu')}
                            placement="left"
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.showButton}
                                onClick={this.handleShowMenu}
                                classes={{root: classes.showButtonRoot}}
                                style={{transform: scrollbarShown ? 'translateX(-7px)' : ''}}
                            >
                                <KeyboardArrowLeft />
                            </Button>
                        </Tooltip>
                    </span>
                </Slide>
            </div>
        );
    }
}

AdvanceFloatingMenu.propTypes = {
    t: PropTypes.func.isRequired,
    mainBtn: PropTypes.shape({
        icon: PropTypes.element.isRequired,
        name: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    }).isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    actionBtns: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.element.isRequired,
        name: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    })),
};

AdvanceFloatingMenu.defaultProps = {
    actionBtns: [],
};

export default withStyles(styles)(AdvanceFloatingMenu);
