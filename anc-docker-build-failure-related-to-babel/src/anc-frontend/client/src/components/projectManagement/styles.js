import Constants from '../../constants/common';

const {colors, theme} = Constants;

export const projectListStyles = {
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
    dialog: {
        backgroundColor: '#fafafa',
        width: '960px',
    },
    guidelineBtnWrapper: {
        position: 'absolute',
        top: '10px',
    },
    title: {
        flex: 1,
        fontWeight: 500,
        fontSize: '24px',
        paddingTop: '20px',
        paddingLeft: '20px',
    },
    subTitle: {
        fontSize: '14px',
        paddingTop: '10px',
        paddingLeft: '0px',
        paddingBottom: '20px',
        opacity: 0.8,
        fontWeight: 300,
        userSelect: 'none',
    },
    dialogContent: {
        padding: '0',
    },
    dialogWrapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        overflow: 'hidden',
        paddingBottom: '20px',
        padding: '0px 40px',
        overflowY: 'auto',
    },
    gridRoot: {
        flexGrow: 1,
    },
    grid: {
        height: '380px',
        '&:hover': {
            opacity: '0.8',
            cursor: 'pointer',
        },
    },
    gridBtnQ: {
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        position: 'relative',
    },
    CardHeader: {
        paddingBottom: '8px',
    },
    cardTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: '22px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    divider: {
        backgroundColor: 'white',
        marginLeft: '35px',
        marginRight: '35px',
    },
    cardContent: {
        paddingTop: 8,
        pointerEvents: 'none',
    },
    discription: {
        color: 'white',
        paddingLeft: '15px',
        paddingRight: '15px',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    discriptionIcon: {
        width: '100%',
        textAlign: 'center',
        paddingTop: '15px',
        color: 'white',
        position: 'absolute',
        bottom: '30px',
    },
    gridBtnP: {
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.secondary.main,
        position: 'relative',
    },
    btnWrapper: {
        padding: '10px 40px 20px 20px',
        display: 'flex',
    },
    tableHeadCell: {
        padding: '4px 20px 4px 20px',
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '1.3125rem',
        userSelect: 'none',
    },
    tableCell: {
        width: '25%',
        padding: '6px 20px 6px 23px',
        color: 'rgba(0, 0, 0, 0.54)',
        fontWeight: 500,
        lineHeight: '1.3125rem',
        userSelect: 'none',
    },
    currentTableCell: {
        width: '25%',
        padding: '6px 20px 6px 23px',
        color: 'rgba(0, 0, 0, 0.2)',
        fontWeight: 500,
        lineHeight: '1.3125rem',
        userSelect: 'none',
    },
    backupRestoreBtn: {
        marginLeft: '-10px',
    },
    wrapper: {
        width: '100%',
    },
    dialogTitle: {
        userSelect: 'none',
        padding: '0px 0px 0px',
    },
    selectedRow: {
        userSelect: 'none',
        cursor: 'not-allowed',
        color: 'rgba(0, 0, 0, 0.4)',
        padding: '4px 56px 4px 24px',
    },
    row: {
        userSelect: 'none',
        padding: '4px 56px 4px 24px',
    },
    backdropColor: {
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
    },
    input: {
        border: '0px solid',
        backgroundColor: 'transparent',
        height: '20px',
        outlineColor: theme.palette.primary.main,
        outlineStyle: 'auto',
        outlineWidth: '5px',
        padding: '5px',
        width: '100%',
        fontFamily: 'Roboto',
    },
    notShow: {
        // display: 'none',
        opacity: 0,
    },
    show: {
        opacity: 1,
        // display: 'block',
    },
    disableSelect: {
        cursor: 'not-allowed',
        userSelect: 'none',
    },
    enableSelect: {
        cursor: 'default',
    },
};

export const projectTourStyles = {
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
    dialog: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '990px',
    },
    title: {
        flex: 1,
        fontSize: '24px',
        paddingLeft: '0',
    },
    dialogContent: {
        paddingBottom: '0px',
    },
    dialogWrapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        overflow: 'hidden',
        paddingBottom: '20px',
        padding: '0px 40px',
        overflowY: 'auto',
    },
    checkboxWrapper: {
        paddingLeft: '20px',
        display: 'flex',
        paddingBottom: '20px',
    },
    picWrapper: {
        maxWidth: '100%',
        maxHeight: '100%',
        width: '100%',
        display: 'block',
    },
    backdropColor: {
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
    },
};

export const projectWelcomeStyles = {
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
    dialog: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '850px',
    },
    guidelineBtnWrapper: {
        position: 'absolute',
        top: '10px',
    },
    title: {
        flex: 1,
        fontSize: '24px',
        paddingLeft: '0',
    },
    subTitle: {
        fontSize: '14px',
        paddingTop: '10px',
        paddingLeft: '0px',
        paddingBottom: '20px',
        opacity: 0.8,
        fontWeight: 300,
    },
    dialogContent: {
        paddingBottom: '0px',
    },
    dialogWrapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        overflow: 'hidden',
        paddingBottom: '20px',
        padding: '0px 40px',
        overflowY: 'auto',
    },
    gridRoot: {
        flexGrow: 1,
    },
    grid: {
        height: '380px',
        '&:hover': {
            opacity: '0.8',
            cursor: 'pointer',
        },
    },
    gridBtnQ: {
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        position: 'relative',
    },
    CardHeader: {
        paddingBottom: '8px',
    },
    cardTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: '22px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    divider: {
        backgroundColor: 'white',
        marginLeft: '35px',
        marginRight: '35px',
    },
    cardContent: {
        paddingTop: 8,
        pointerEvents: 'none',
    },
    discription: {
        color: 'white',
        paddingLeft: '15px',
        paddingRight: '15px',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    discriptionIcon: {
        width: '100%',
        textAlign: 'center',
        paddingTop: '15px',
        color: 'white',
        position: 'absolute',
        bottom: '30px',
    },
    gridBtnP: {
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.secondary.main,
        position: 'relative',
    },
    btnWrapper: {
        padding: '10px 40px 20px 20px',
        display: 'flex',
    },
    backdropColor: {
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
    },
};

export const projectLoginStyles = {
    dialog: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '850px',
    },
    title: {
        flex: 1,
        fontWeight: 500,
        fontSize: '24px',
    },
    subTitle: {
        fontSize: '14px',
        paddingTop: '10px',
        paddingLeft: '0px',
        paddingBottom: '20px',
        opacity: 0.8,
        fontWeight: 300,
        userSelect: 'none',
    },
    dialogContent: {
        paddingBottom: '0px',
    },
    dialogWrapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        paddingBottom: '20px',
        padding: '0px 40px',
    },
    btnWrapper: {
        padding: '10px 40px 20px 20px',
        display: 'flex',
    },
    btnPwdLbl: {
        fontSize: '18px',
        height: '29px',
        color: theme.palette.primary.light,
    },
    bodyWord: {
        fontSize: '18px',
        color: 'rgba(0, 0, 0, 0.4698)',
        marginBottom: '40px',
        fontWeight: '300',
        userSelect: 'none',
    },
    inputWrapper: {
        display: 'flex',
    },
    input: {
        width: '80%',
    },
    rememberBtn: {
        marginLeft: '10px',
        marginRight: 'auto',
        userSelect: 'none',
    },
    rememberLabel: {
        opacity: '0.55',
    },
    rememberLabelRoot: {
        marginTop: '20px',
    },
    emptyWording: {
        fontSize: '16px',
        opacity: '0.54',
        textAlign: 'center',
    },
};

export const projectSaveStyles = {
    dialog: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '650px',
    },
    title: {
        flex: 1,
        fontWeight: 500,
        fontSize: '24px',
    },
    subTitle: {
        fontSize: '14px',
        paddingTop: '10px',
        paddingLeft: '0px',
        paddingBottom: '20px',
        opacity: 0.8,
        fontWeight: 300,
        userSelect: 'none',
    },
    dialogContent: {
        paddingBottom: '0px',
    },
    dialogWrapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        paddingBottom: '20px',
        padding: '0px 40px',
    },
    btnPwdLbl: {
        fontSize: '18px',
        height: '29px',
        color: theme.palette.primary.light,
    },
    bodyWord: {
        fontSize: '18px',
        color: 'rgba(0, 0, 0, 0.4698)',
        marginBottom: '40px',
        fontWeight: '300',
        userSelect: 'none',
    },
    inputWrapper: {
        display: 'flex',
    },
    input: {
        width: '100%',
    },
    btnWrapper: {
        marginTop: '10px',
        marginLeft: 'auto',
        marginBottom: '10px',
        paddingRight: '10px',
        textAlign: 'right',
    },
};
