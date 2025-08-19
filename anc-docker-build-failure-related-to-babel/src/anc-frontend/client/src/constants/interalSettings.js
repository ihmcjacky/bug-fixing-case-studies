const ret = {};

// GET_FIRMWARE_INFORMATION_REQUEST
// EXPORT_CONFIG_REQUEST
// GET_EEPROM_INFORMATION_REQUEST
// GET_MISC_INFO_REQUEST
// GET_TELEMETRY_STATISTIC_REQUEST
// GET_RADIO_INFO_REQUEST
// GET_ENDT_INFO_REQUEST
// ETHERNET_SEGMENT_INFO_REQUEST
// GET_MESH_TOPOLOGY_REQUEST

ret.pbfTypeToTranslationNameMap = {
    GET_FIRMWARE_INFORMATION_REQUEST: 'getFirmwareInformationRequestTitle',
    EXPORT_CONFIG_REQUEST: 'exportConfigRequestTitle',
    GET_EEPROM_INFORMATION_REQUEST: 'getEepromInformationRequestTitle',
    GET_MISC_INFO_REQUEST: 'getMiscInfoRequestTitle',
    GET_TELEMETRY_STATISTIC_REQUEST: 'getTelemetryStatisticRequestTitle',
    GET_RADIO_INFO_REQUEST: 'getRadioInfoRequestTitle',
    GET_ENDT_INFO_REQUEST: 'getEndtInfoRequestTitle',
    ETHERNET_SEGMENT_INFO_REQUEST: 'ethernetSegmentInfoRequestTitle',
    GET_MESH_TOPOLOGY_REQUEST: 'getMeshTopologyRequestTitle',
    NODE_LOGIN_QUEUE_SIZE: 'nodeLoginQueueSizeTitle',
};



export default ret;
