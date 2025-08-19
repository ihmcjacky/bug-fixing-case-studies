import {createTheme} from '@material-ui/core/styles';

const ret = {};

ret.severityEnum = {
    EMERGENCY: 0,
    ALERT: 1,
    CRITICAL: 2,
    ERROR: 3,
    WARNING: 4,
    NOTICE: 5,
    INFORMATIONAL: 6,
    DEBUG: 7
}

ret.severityEnumToName = [
    'EMERGENCY',
    'ALERT',
    'CRITICAL',
    'ERROR',
    'WARNING',
    'NOTICE',
    'INFORMATIONAL',
    'DEBUG'
];

ret.severityEnumToTranslateKey = {
    EMERGENCY: 'emergency',
    ALERT: 'alert',
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warning',
    NOTICE: 'notice',
    INFORMATIONAL: 'informational',
    DEBUG: 'debug'
}

ret.evtCatTranslateKey = {
    System: 'system',
    Network: 'network',
    Security: 'security',
    Application: 'application',
    Hardware: 'hardware'
}

ret.eventTypeTranslateKey = {
    'Host node unreachable': 'hostNodeUnreachable',
    'Host node reachable': 'hostNodeReachable',
    'Node reachable': 'nodeReachable',
    'Node unreachable': 'nodeUnreachable',
    'Ethernet port up': 'ethernetPortUp',
    'Ethernet port down': 'ethernetPortDown',
    'Wireless link up': 'wirelessLinkUp',
    'Wireless link down': 'wirelessLinkDown',
    'Ethernet direct link up': 'ethernetDirectLinkUp',
    'Ethernet direct link down': 'ethernetDirectLinkDown',
    'Node reboot': 'nodeReboot',
    'Firmware upgrade': 'firmwareUpgrade',
    'Configuration': 'configuration',
    'Host node changed': 'hostNodeChanged'
}

ret.severityList = [
    {
        displayValue: 'Emergency',
        actualValue: 'EMERGENCY',
        translateKey: 'emergency',
    },
    {
        displayValue: 'Alert',
        actualValue: 'ALERT',
        translateKey: 'alert',
    },
    {
        displayValue: 'Critical',
        actualValue: 'CRITICAL',
        translateKey: 'critical',
    },
    {
        displayValue: 'Error',
        actualValue: 'ERROR',
        translateKey: 'error',
    },
    {
        displayValue: 'Warning',
        actualValue: 'WARNING',
        translateKey: 'warning',
    },
    {
        displayValue: 'Notice',
        actualValue: 'NOTICE',
        translateKey: 'notice',
    },
    {
        displayValue: 'Informational',
        actualValue: 'INFORMATIONAL',
        translateKey: 'informational',
    },
    {
        displayValue: 'Debug',
        actualValue: 'DEBUG',
        translateKey: 'debug',
    },
];

ret.langList = [
    'en',
    'zh-CN',
    'zh-HK',
];

ret.pixiPreferenceList = [
    {
        displayValue: 'WebGL',
        actualValue: 'webgl',
    },
    {
        displayValue: 'WebGPU',
        actualValue: 'webgpu',
    },
];

ret.pixiSettingsProfile = {
    'quality': {
        performanceMode: 'quality',
        antialias: true,
        resolution: 2,
        maxFPS: 60,
        minFPS: 10,
    },
    'balanced': {
        performanceMode: 'balanced',
        antialias: false,
        resolution: 1,
        maxFPS: 30,
        minFPS: 10,
    },
    'performance': {
        performanceMode: 'performance',
        antialias: false,
        resolution: 1,
        maxFPS: 20,
        minFPS: 10,
    }
}



ret.timeout = {
    success: 3000,
    error: 5000,
    CHECK_SCAN_NEI_TIMEOUT: 210000
};

ret.landingViewList = [
    'topology',
    'dashboard',
];

ret.nodeRecoverySecondConfigDelay = 10000;

ret.apiVersion = 'v8';
// ret.apiVersion = 'v7';

ret.endtSupportVersion = 'v1.6.0';
ret.atpcSupportVersion = 'v1.7.31';
ret.allowRebootSupportVersion = '1.7.44';
ret.acsSupportVersion = 'v1.8.0';

ret.mockWsServerProjectId = 'UI_DEBUG_WS_PORJECT_ID';

ret.colors = {
    background: '#E5E5E5',
    disable: '#444444',
    disableIcon: 'rgba(250, 250, 250, 0.5)',
    borderColor: '#979797',
    unmanagedIcon: '#9C9C9C',
    managedIcon: '#122d54',
    activeGreen: '#009588',
    hoverGreen: '#00443e',
    stepperComplete: '#28a745',
    inactiveRed: '#DC4639',
    inactiveRedHover: '#C63F33',
    mismatchBackground: '#ffcfc1',
    nodeUnreachableBackground: '#ffcfc1',
    mismatchLabel: '#e54942',
    nodeUnreachableLabel: '#e54942',
    discrepancyRow: '#1d1d1d',
    appBarMenuItem: '#122D54',
    meshTopoEdge: '#c9c9c9',
    warningBackground: '#FFEAC1',
    warningColor: '#ffa400',
    edgeHighlight: '#848484',
    appBarMenuItemHover: '#3D5585',
    popupMenuItem: '#525252',
    popupSubMenuMain: '#425581',
    multilineInputBackground: '#f2f2f2',
    overviewBoxBackground: '#fafafa',
    projectLandingDialogBackground: '#F1f1f1',
    paperBackground: '#fff',
    lockLayerBackground: 'rgba(250, 250, 250, 0.5)',
    lockLayerBackgroundTransparent: 'rgba(250, 250, 250, 0)',
    dialogText: 'rgba(0, 0, 0, 0.54)',
    black75: 'rgba(0, 0, 0, 0.75)',
    disabledText: 'rgba(0, 0, 0, 0.54)',
    normalText: 'rgb(0, 0, 0)',
    totalNodes: '#505050',
    tableRowBorder: 'rgba(22, 25, 29, 0.2)',
    tagTxt: 'rgba(33, 33, 33, 0.37)',
    dataTitle: 'rgba(33, 33, 33, 0.87)',
    dataTxt: 'rgba(33, 33, 33, 0.785)',
    footerTxt: 'rgba(33, 33, 33, 0.21)',
    white: '#ffffff',
    transparentColor: 'rgba(0, 0, 0, 0)',
    deviceDescriptionHeader: 'rgba(33, 33, 33, 0.59)',
    thumbColor: '#566fa8',
    labelColor: 'rgba(33 , 33, 33, 0.37)',
    mismatch: 'red',
    reachable: 'green',
    unreachable: 'red',
    error: 'red',
    success: 'green',
    main: '#122d54',
    rebooting: '#ffa400',
    topologyMdopRing: '#8994a9',
    topologyDisableMenuIcon: '#9C9C9C',
    topologyMenuIconBorder: '#000000',
};

ret.linkGraphColor = [
    '#00V9A5',
    '#447CBF',
    '#253B50',
    '#246E7D',
    '#273B91',
    '#70CBCE',
    '#F7A9AF',
    '#7BC142',
    '#F2EA0E',
    '#F9C1C',
    '#ED2024',
    '#ABA3D0',
    '#EE2A5A',
    '#9B9260',
    '#B9529F',
    '#939393',
    '#000000',
    '#F15D22',
    '#9F5B3F',
    '#A89031',
    '#301751',
    '#6F3996',
    '#9A1D5',
    '#B9DCA',
    '#16351A',
    '#EFEF96',
    '#511E0F',
    '#D15D5',
    '#6AC39',
    '#707F6A',
    '#899E3',
    '#00B1E8',
    '#FFCB64',
    '#6E7555',
    '#F281AB',
    '#7194B4',
];

ret.themeObj = {
    primary: {
        main: '#122d54',
        light: '#425581',
        dark: '#00012b',
    },
    secondary: {
        main: '#de357c',
        light: '#ff6dab',
        dark: '#a70050',
    },
    error: {
        main: '#DC4639',
        light: '#F3675B',
        dark: '#A70050',
    },
    mainBgColor: '#e5e5e5',
    txt: {
        normal: '#212121',
        halfOpa: '#21212150',
    },
    tabBorder: '#21212133',
    footer: {
        fontSize: '0.75rem'
    }
};

ret.footerStyleFn = theme => ({
    footerDiv: {
        position: 'absolute',
        bottom: 0,
        color: theme.palette.txt.halfOpa,
        width: '100%',
    },
    paddedTypography: {
        fontSize: theme.palette.footer.fontSize,
        padding: theme.spacing(1),
    }
});

ret.theme = createTheme({
    palette: ret.themeObj,
    typography: {},
});

ret.commonCss = {
    mainContainerStyle: {
        marginTop: '25px',
    },
    mainTitleStyle: {
        fontSize: '24px',
    },
    subTitleStyle: {
        fontSize: '16px',
        margin: '8px 0px',
    },
};

/**
 * the z-index level apply to overlay component
 * hight: 403 logout dialog
 * mediumHigh: project app
 * material ui dialog default is 1300
 * medium: p2dialog
 * low: locklayer
 */
ret.zIndexLevel = {
    low: 100,
    lowMedium: 500,
    medium: 1300,
    mediumHigh: 1500,
    high: 2000,
    extremeHigh: 10000
};

ret.rssiColor = {
    poor: '#DC4639',
    fair: '#FFA400',
    good: '#92C352',
    default: '#425581',
    unmanaged: '#9C9C9C',
};


ret.radioShortForm = {
    radio0: 'R0',
    radio1: 'R1',
    radio2: 'R2',
    '': '-',
};

ret.ethShortFrom = {
    eth0: 'ETH0',
    eth1: 'ETH1',
    '': '-',
};

ret.inputObj = {
    nodeSettings: {
        hostname: {
            formType: 'input',
        },
        maxNbr: {
            formType: 'select',
        },
        endtSendInterval: {
            formType: 'input',
        },
        endtRecvTimeout: {
            formType: 'input',
        },
        endtPriority: {
            formType: 'input',
        },
        allowReboot: {
            formType: 'select',
        },
        acs: {
            formType: 'select',
        },
        acsInterval: {
            formType: 'select',
        },
        acsChannelList: {
            formType: 'select'
        }
    },
    radioSettings: {
        status: {
            formType: 'select',
        },
        operationMode: {
            formType: 'select',
        },
        channel: {
            formType: 'select',
        },
        channelBandwidth: {
            formType: 'select',
        },
        txpower: {
            formType: 'select',
        },
        maxNbr: {
            formType: 'select',
        },
        band: {
            formType: 'select',
        },
        centralFreq: {
            formType: 'select',
        },
        mobilityDomain: {
            formType: 'input',
        },
        mcs: {
            formType: 'select',
        },
        shortgi: {
            formType: 'select',
        },
        rtsCts: {
            formType: 'select',
        },
    },
    ethernetSettings: {
        ethernetLink: {
            formType: 'select',
        },
        mtu: {
            formType: 'input',
        },
    },
};

ret.advancedConfigInputObj = {
    maxNbr: {
        formType: 'select',
    },
    radioFilter: {
        formType: 'select',
    },
    distance: {
        formType: 'input',
    },
    rssiFilterTolerance: {
        formType: 'select',
    },
    rssiFilterLower: {
        formType: '',
    },
    rssiFilterUpper: {
        formType: 'slider',
    },
    mcs: {
        formType: 'select',
    },
    shortgi: {
        formType: 'select',
    },
    rtsCts: {
        formType: 'select',
    },
    atpcTargetRssi: {
        formType: 'atpc-slider',
    },
    atpcRangeUpper: {
        formType: '',
    },
    atpcRangeLower: {
        formType: '',
    },
    allowReboot: {
        formType: 'select',
    }
};

ret.advancedConfigOption = {
    radio0: ['maxNbr', 'radioFilter', 'distance', 'rssiFilterLower',
        'rssiFilterUpper', 'rssiFilterTolerance', 'mcs', 'shortgi', 'rtsCts', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
    radio1: ['maxNbr', 'radioFilter', 'distance', 'rssiFilterLower',
        'rssiFilterUpper', 'rssiFilterTolerance', 'mcs', 'shortgi', 'rtsCts', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
    radio2: ['maxNbr', 'radioFilter', 'distance', 'rssiFilterLower',
        'rssiFilterUpper', 'rssiFilterTolerance', 'mcs', 'shortgi', 'rtsCts', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
};

ret.clusterConfigOptions = {
    generalSettings: ['country', 'clusterId', 'managementIp', 'managementNetmask', 'globalTimezone'],
    securitySettings: ['encKey', 'e2eEnc', 'e2eEncKey'],
    advancedSettings: ['bpduFilter', 'globalRoamingRSSIMargin', 'globalHeartbeatInterval',
        'globalHeartbeatTimeout', 'globalStaleTimeout', 'globalAllowActiveLinkDrop',
    ],
};


ret.neighbourACL = {
    aclType: [
        {
            actualValue: 'blacklist',
            displayValue: 'Blacklist',
        },
        {
            actualValue: 'whitelist',
            displayValue: 'Whitelist',
        },
    ],

    modelOption: {
        X10: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X11e: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        Z500: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        Z500G: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X20: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X22e: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                // radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X33: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
                radio2: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X32: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
            },
        },
        X32e: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
            },
        },
        AX51: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
            },
        },
        AX52: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
            },
        },
        AX52e: {
            radioSettings: {
                radio0: ['type', 'macAddressList', 'nodeList'],
                radio1: ['type', 'macAddressList', 'nodeList'],
            },
        },
    },
    optionObj: {
        radioSettings: {
            type: {
                title: 'Status',
                helperText: 'Type of MAC ACL to apply',
                formType: 'select',
            },
            macAddressList: {
                title: 'MAC Address List',
                helperText: '',
                formType: 'macList',
            },
            nodeList: {
                title: 'Choose neighbor MAC (s) to add',
                helperText: '',
                formType: 'table',
            },
        },
    },
};

ret.modelOption = {
    X10: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    X11e: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    Z500: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    Z500G: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    X20: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    X22e: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
        },
    },
    X33: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio2: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
    X32: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
    X32e: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
    AX51: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
    AX52: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
    AX52e: {
        nodeSettings: [
            'hostname', 'maxNbr', 'endtSendInterval', 'endtRecvTimeout', 'endtPriority', 'atpcInterval', 'allowReboot',
            'acs', 'acsInterval', 'acsChannelList'
        ],
        radioSettings: {
            radio0: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
            radio1: ['status', 'operationMode', 'band',
                'channelBandwidth', 'centralFreq', 'channel', 'txpower', 'mobilityDomain',
                'rssiFilterLower', 'rssiFilterUpper', 'atpcTargetRssi', 'atpcRangeUpper', 'atpcRangeLower'],
        },
        ethernetSettings: {
            eth0: ['ethernetLink', 'mtu'],
            eth1: ['ethernetLink', 'mtu'],
        },
    },
};

ret.fwSizeLimit = {
    ax50: 35,
    x30: 30,
    x20: 30,
    x10: 30,
    z500: 30
}

ret.netmaskToBitmaskMapping = {};
ret.netmaskToBitmaskMapping['0.0.0.0'] = '0';
ret.netmaskToBitmaskMapping['128.0.0.0'] = '1';
ret.netmaskToBitmaskMapping['192.0.0.0'] = '2';
ret.netmaskToBitmaskMapping['224.0.0.0'] = '3';
ret.netmaskToBitmaskMapping['240.0.0.0'] = '4';
ret.netmaskToBitmaskMapping['248.0.0.0'] = '5';
ret.netmaskToBitmaskMapping['252.0.0.0'] = '6';
ret.netmaskToBitmaskMapping['254.0.0.0'] = '7';
ret.netmaskToBitmaskMapping['255.0.0.0'] = '8';
ret.netmaskToBitmaskMapping['255.128.0.0'] = '9';
ret.netmaskToBitmaskMapping['255.192.0.0'] = '10';
ret.netmaskToBitmaskMapping['255.224.0.0'] = '11';
ret.netmaskToBitmaskMapping['255.240.0.0'] = '12';
ret.netmaskToBitmaskMapping['255.248.0.0'] = '13';
ret.netmaskToBitmaskMapping['255.252.0.0'] = '14';
ret.netmaskToBitmaskMapping['255.254.0.0'] = '15';
ret.netmaskToBitmaskMapping['255.255.0.0'] = '16';
ret.netmaskToBitmaskMapping['255.255.128.0'] = '17';
ret.netmaskToBitmaskMapping['255.255.192.0'] = '18';
ret.netmaskToBitmaskMapping['255.255.224.0'] = '19';
ret.netmaskToBitmaskMapping['255.255.240.0'] = '20';
ret.netmaskToBitmaskMapping['255.255.248.0'] = '21';
ret.netmaskToBitmaskMapping['255.255.252.0'] = '22';
ret.netmaskToBitmaskMapping['255.255.254.0'] = '23';
ret.netmaskToBitmaskMapping['255.255.255.0'] = '24';
ret.netmaskToBitmaskMapping['255.255.255.128'] = '25';
ret.netmaskToBitmaskMapping['255.255.255.192'] = '26';
ret.netmaskToBitmaskMapping['255.255.255.224'] = '27';
ret.netmaskToBitmaskMapping['255.255.255.240'] = '28';
ret.netmaskToBitmaskMapping['255.255.255.248'] = '29';
ret.netmaskToBitmaskMapping['255.255.255.252'] = '30';
ret.netmaskToBitmaskMapping['255.255.255.254'] = '31';
ret.netmaskToBitmaskMapping['255.255.255.255'] = '32';

// quick staging project name default when quick staging project is not saved #7961
ret.defaultQuickStagingProjectName = 'qs_tmp';

ret.channelBounds = [
    {start: 5170, end: 5190, channel: "36"},
    {start: 5190, end: 5210, channel: "40"},
    {start: 5210, end: 5230, channel: "44"},
    {start: 5230, end: 5250, channel: "48"},
    {start: 5250, end: 5270, channel: "52"},
    {start: 5270, end: 5290, channel: "56"},
    {start: 5290, end: 5310, channel: "60"},
    {start: 5310, end: 5330, channel: "64"},
    {start: 5490, end: 5510, channel: "100"},
    {start: 5510, end: 5530, channel: "104"},
    {start: 5530, end: 5550, channel: "108"},
    {start: 5550, end: 5570, channel: "112"},
    {start: 5570, end: 5590, channel: "116"},
    {start: 5590, end: 5610, channel: "120"},
    {start: 5610, end: 5630, channel: "124"},
    {start: 5630, end: 5650, channel: "128"},
    {start: 5650, end: 5670, channel: "132"},
    {start: 5670, end: 5690, channel: "136"},
    {start: 5690, end: 5710, channel: "140"},
    {start: 5735, end: 5755, channel: "149"},
    {start: 5755, end: 5775, channel: "153"},
    {start: 5775, end: 5795, channel: "157"},
    {start: 5795, end: 5815, channel: "161"},
    // {start: 5815, end: 5835, channel: "165"}
];

ret.nodeRecoveryManagmentSecretFixGracePeriod = 5000;

export default ret;

export const RebootDialogStatus = {
    CLOSE: 'close',
    SUCCESS: 'success',
    ERROR: 'error',
};

