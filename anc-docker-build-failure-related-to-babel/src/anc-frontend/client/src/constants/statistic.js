const ret = {};

ret.defaultSelectedInterface = {
    X32: ['eth0', 'eth1'],
    X32e: ['eth0', 'eth1'],
    X33: ['eth0', 'eth1'],
    X20: ['eth0', 'radio0'],
    X22e: ['eth0', 'radio0'],
    Z500: ['eth0', 'radio0'],
    Z500G: ['eth0', 'radio0'],
    X10: ['eth0', 'radio0'],
    X11e: ['eth0', 'radio0'],
    unlistedModel: ['eth0', 'radio0'],
};

ret.interfaceOpt = [
    'eth0', 'eth1',
    'radio0', 'radio1', 'radio2'
];

ret.radioInterface = [
    'radio0', 'radio1', 'radio2'
]

ret.interfaceOrder = {
    eth0: 0,
    eth1: 1,
    radio0: 2,
    radio1: 3,
    radio2: 4,
};

ret.timeRangeOpt = [
    2, 4, 6, 8, 10
];

ret.statisticOpt = [
    'txBytes', 'rxBytes',
    'txPackets', 'rxPackets',
    'txRetries', 'rxErrors',
    'txDropped', 'rxDropped'
];

ret.radioStatisticOpt = [
    'txRetries', 'rxErrors',
    'txDropped', 'rxDropped'
];

ret.txPacketStatisticOpt = [
    'txPackets',
    'txRetries',
    'txDropped',
];

ret.rxPacketStatisticOpt = [
    'rxPackets',
    'rxErrors',
    'rxDropped'
];

ret.byteStatisticOpt = [
    'txBytes', 'rxBytes'
];

ret.packetStatisticOpt = [
    'txPackets', 'rxPackets',
    'txRetries', 'rxErrors',
    'txDropped', 'rxDropped'
];

ret.statisticOrder = {
    txBytes: 0,
    rxBytes: 1,
    txPackets: 2,
    rxPackets: 3,
    txRetries: 4,
    rxErrors: 5,
    txDropped: 6,
    rxDropped: 7,
};

ret.intervalOpt = [
    10, 15, 20, 25, 30
];

ret.dataUnitOpt = [
    'bytes', 'kb', 'mb', 'gb', 'tb'
];

ret.bytesToNumMap = {
    bytes: 1,
    kb: 1000,
    mb: 1000000,
    gb: 1000000000,
    tb: 1000000000000,
};

ret.packetUnitOpt = [
    'packets', 'kPackets', 'mPackets', 'gPackets', 'tPackets'
];

ret.packetToNumMap = {
    packets: 1,
    kPackets: 1000,
    mPackets: 1000000,
    gPackets: 1000000000,
    tPackets: 1000000000000,
};

ret.viewArr = [
    'normalzie', 'graph', 'table', 'detail'
];

ret.colorMap = {
    'eth0-txBytes': '#2BA02B',
    'eth0-rxBytes': '#BCBD21',
    'eth1-txBytes': '#2077B4',
    'eth1-rxBytes': '#D62628',
    'radio0-txBytes': '#9467BD',
    'radio0-rxBytes': '#FFBD78',
    'radio1-txBytes': '#FF7F0F',
    'radio1-rxBytes': '#A1A5A9',
    'radio2-txBytes': '#F06292',
    'radio2-rxBytes': '#673AB7',
    'eth0-rxPackets': '#2CA3DA',
    'eth0-txPackets': '#F26421',
    'eth1-rxPackets': '#FFB700',
    'eth1-txPackets': '#007042',
    'radio0-rxPackets': '#CC0000',
    'radio0-txPackets': '#7B0099',
    'radio1-rxPackets': '#000000',
    'radio1-txPackets': '#8884d8',
    'radio2-rxPackets': '#2196F3',
    'radio2-txPackets': '#006064',
    'radio0-txDropped': '#4B4E6D',
    'radio1-txDropped': '#C37D92',
    'radio2-txDropped': '#AEB4A9',
    'radio0-rxDropped': '#27213C',
    'radio1-rxDropped': '#5A352A',
    'radio2-rxDropped': '#A6A57A',
    'radio0-rxErrors': '#F3D34A',
    'radio1-rxErrors': '#4A001F',
    'radio2-rxErrors': '#454B66',
    'radio0-txRetries': '#33658A',
    'radio1-txRetries': '#210124',
    'radio2-txRetries': '#36453B',
};

export default ret;
