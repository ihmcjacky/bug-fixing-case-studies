
import { renderHook, act } from '@testing-library/react-hooks'
import useDiscrepancy from '../../util/useDiscrepancy';

const nonLegacyDiscrepancies = {
    '127.2.37.235': {
        bpduFilter: {
            isLegacy: false,
            value: "disable"
        },
        globalDiscoveryInterval: {
            isLegacy: false,
            value: 3000,
        },
    },
    '127.2.37.236': undefined,
}

const legacyDiscrepancies = {
    '127.2.37.235': {
        bpduFilter: {
            isLegacy: true,
            value: "enable",
        },
        globalDiscoveryInterval: {
            isLegacy: false,
            value: 3000,
        },
    },
    '127.2.37.236': undefined,
}

const meshSettings = {
    clusterId: "p2uiteam1",
    managementIp: "10.240.222.222",
    managementNetmask: "255.255.0.0",
    bpduFilter: "enable",
    country: "US",
    encType: "psk2",
    encKey: "p2wtadmin",
    e2eEnc: "disable",
    e2eEncKey: "defaultkey",
    globalRoamingRSSIMargin: 5,
    globalDiscoveryInterval: 1000,
    globalHeartbeatInterval: 300,
    globalHeartbeatTimeout: 5000,
    globalStaleTimeout: 30000,
    globalTimezone: "UTC",
};

const controlNodeIp = '127.2.35.226'

const nodeSettings = {
    "127.2.35.226": {
      "hostname": "UI-222",
      "acl": {}
    },
    "127.2.37.235": {
      "hostname": "UI-223",
      "acl": {}
    }
}

const defaultProps = {
  nodeSettings,
  meshSettings,
};

const discrepanciesList = [
  {
    bpduFilter: "enable",
    clusterId: "p2uiteam1",
    country: "US",
    discrepancies: false,
    e2eEnc: "disable",
    e2eEncKey: "defaultkey",
    encKey: "p2wtadmin",
    globalDiscoveryInterval: 1000,
    globalHeartbeatInterval: 300,
    globalHeartbeatTimeout: 5000,
    globalRoamingRSSIMargin: 5,
    globalStaleTimeout: 30000,
    globalTimezone: "UTC",
    hostNode: true,
    hostname: "UI-222",
    mac: "-",
    managementIp: "10.240.222.222",
    managementNetmask: "255.255.0.0",
    nodeIp: "127.2.35.226"
  },
  {
    bpduFilter: "disable",
    globalDiscoveryInterval: 3000,
    discrepancies: true,
    hostNode: false,
    hostname: "UI-223",
    mac: "64:9A:12:22:5E:B0",
    nodeIp: "127.2.37.235"
  }
];

const legacyDiscrepanciesList = [
    {
        bpduFilter: "enable",
        clusterId: "p2uiteam1",
        country: "US",
        discrepancies: false,
        e2eEnc: "disable",
        e2eEncKey: "defaultkey",
        encKey: "p2wtadmin",
        globalDiscoveryInterval: 1000,
        globalHeartbeatInterval: 300,
        globalHeartbeatTimeout: 5000,
        globalRoamingRSSIMargin: 5,
        globalStaleTimeout: 30000,
        globalTimezone: "UTC",
        hostNode: true,
        hostname: "UI-222",
        mac: "expectedConfig",
        managementIp: "10.240.222.222",
        managementNetmask: "255.255.0.0",
        nodeIp: "expectedConfig",
        isLegacy: {
            bpduFilter: "127.2.37.235"
        },
    },
    {
        bpduFilter: "notSupported",
        discrepancies: true,
        hostNode: true,
        hostname: "UI-222",
        mac: "64:9A:12:22:3E:20",
        nodeIp: "127.2.35.226",
    },
    {
        discrepancies: true,
        globalDiscoveryInterval: 3000,
        hostNode: false,
        hostname: "UI-223",
        mac: "64:9A:12:22:5E:B0",
        nodeIp: "127.2.37.235",
    },
];


describe('useDiscrepancy', () => {

    test('return empty discrepancy list', () => {
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
    });

    test('return empty discrepancy list after passing settings with no discrepancy', () => {
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
        act(() => {
            result.current[1](defaultProps, controlNodeIp)
        })
        expect(result.current[1](defaultProps, controlNodeIp)).toEqual({
            legacySyncValue: {},
            discrepanciesValue: {},
        })
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
    });

    test('return discrepancy list after passing settings with discrepancy', () => {
        const discrepanciesDefaultProps = {...defaultProps, meshSettings: {
          ...meshSettings,
          discrepancies: nonLegacyDiscrepancies,
        }}
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
        act(() => {
            result.current[1](discrepanciesDefaultProps, controlNodeIp)
        })
        expect(result.current[0]).toEqual(discrepanciesList);
    });

    test('return discrepancies values after passing Settings with discrepancy', () => {
        const discrepanciesDefaultProps = {...defaultProps, meshSettings: {
            ...meshSettings,
            discrepancies: nonLegacyDiscrepancies,
        }};
        let returnValue = {};
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
        act(() => {
            returnValue = result.current[1](discrepanciesDefaultProps, controlNodeIp)
        })
        expect(returnValue).toEqual({
            legacySyncValue: {},
            discrepanciesValue: { bpduFilter: 'enable', globalDiscoveryInterval: 1000 },
        })
    });

    test('return legacy discrepancy list after passing settings with legacy discrepancy', () => {
        const discrepanciesDefaultProps = {...defaultProps, meshSettings: {
          ...meshSettings,
          discrepancies: legacyDiscrepancies,
        }}
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
        act(() => {
            result.current[1](discrepanciesDefaultProps, controlNodeIp)
        })
        expect(result.current[0]).toEqual(legacyDiscrepanciesList);
    });

    test('return legacy discrepancies values after passing Settings with legacy discrepancy', () => {
        const discrepanciesDefaultProps = {...defaultProps, meshSettings: {
            ...meshSettings,
            discrepancies: legacyDiscrepancies,
        }};
        let returnValue = {};
        const { result } = renderHook(() => useDiscrepancy())
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toHaveLength(0)
        act(() => {
            returnValue = result.current[1](discrepanciesDefaultProps, controlNodeIp)
        })
        expect(returnValue).toEqual({
            legacySyncValue: { bpduFilter: 'enable' },
            discrepanciesValue: {globalDiscoveryInterval: 1000,},
        })
    });

})