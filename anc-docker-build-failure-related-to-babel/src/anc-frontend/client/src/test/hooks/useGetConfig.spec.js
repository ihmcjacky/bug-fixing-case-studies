import { renderHook, act } from '@testing-library/react-hooks'
import useGetConfig from '../../util/useGetConfig';
import { useSelector } from 'react-redux';
import { getConfig } from '../../util/apiCall';

jest.mock('../../util/apiCall.js', () => ({
    getConfig: jest.fn()
}))

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

const mockMeshSettings = {
    meshSettings: {
        country: 'HK',
    },
};
const newMockMeshSettings = {
    meshSettings: {
        country: 'US',
    },
};
const mockIp = '123.123.123.123';
const mockChecksums = {
    test1: mockIp,
    test2: mockIp,
};

const mockUseSelector  = () => {
    useSelector.mockImplementation((selector) => selector({
        common: {csrf: '1234'},
        projectManagement: {projectId: '1234'},
    }))
};


const mockGetConfigApiCall = () => {
    getConfig.mockImplementation(() => Promise.resolve({
        checksums: mockChecksums,
        ...mockMeshSettings,
    }))
}
const mockGetConfigApiCallError = () => {
    getConfig.mockImplementation(() => Promise.reject({
        error: {fail: 'fail'},
    }))
}
const mockUseSelectorReset = () => useSelector.mockReset();
const mockGetConfigApiCallReset = () => getConfig.mockReset();

afterEach(() => {
    mockGetConfigApiCallReset()
    mockUseSelectorReset()
})

const defaultProps = {
    withGetOptions: false,
    skip: false,
    lockFunc: jest.fn(),
    unlockFunc: jest.fn(),
    nodeIp: JSON.stringify([mockIp]),
}

describe('useGetConfig', () => {
    test('return empty data without errors when skip', () => {
        mockUseSelector();
        const { result } = renderHook(() => useGetConfig({
            ...defaultProps,
            skip: true,
        }))

        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(0)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual({})
        expect(result.current[1].loadData).toEqual({})
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual({})
        expect(result.current[1].error).toBe(false)
    });

    test('return api data when its not skip', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(result.current[1].loadData).toEqual(mockMeshSettings)
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual(mockChecksums)
        expect(result.current[1].error).toBe(false)
    })


    test('return updated data after calling updateConfigData', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        act(() => {
            result.current[1].updateConfigData(draft => newMockMeshSettings)
        })
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual(newMockMeshSettings)
        expect(result.current[1].loadData).toEqual(mockMeshSettings)
        expect(result.current[1].diff).toEqual(newMockMeshSettings)
        expect(result.current[1].checksums).toEqual(mockChecksums)
        expect(result.current[1].error).toBe(false)
    })

    test('return error after api return error', async () => {
        mockUseSelector();
        mockGetConfigApiCallError()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual({})
        expect(result.current[1].loadData).toEqual({})
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual({})
        expect(result.current[1].error).toBe(true)
    })

    test('refetch Data after calling refetchGetConfig', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        act(() => {
            result.current[1].refetchGetConfig()
        })
        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(2)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(2)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(result.current[1].loadData).toEqual(mockMeshSettings)
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual(mockChecksums)
        expect(result.current[1].error).toBe(false)
    })

    test('return load Data after updated data calling resetData', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        act(() => {
            result.current[1].updateConfigData(draft => newMockMeshSettings)
        })
        act(() => {
            result.current[1].resetData()
        })
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].action).toEqual('UPDATE')
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(result.current[1].loadData).toEqual(mockMeshSettings)
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual(mockChecksums)
        expect(result.current[1].error).toBe(false)
    })

    test('return empty data after updated data calling clearData', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetConfig(defaultProps))

        await waitForNextUpdate();
        act(() => {
            result.current[1].updateConfigData(draft => newMockMeshSettings)
        })
        act(() => {
            result.current[1].clearData()
        })
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].action).toEqual('FETCH')
        expect(result.current[0]).toEqual({})
        expect(result.current[1].loadData).toEqual({})
        expect(result.current[1].diff).toEqual({})
        expect(result.current[1].checksums).toEqual({})
        expect(result.current[1].error).toBe(false)
    })

    test('unlock func will not call if withGetOptions is true', async () => {
        mockUseSelector();
        mockGetConfigApiCall()

        const { waitForNextUpdate } = renderHook(() => useGetConfig({
            ...defaultProps,
            withGetOptions: true,
        }))

        await waitForNextUpdate();
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(0)
    })

    test('useGetConfig defaultProps lockFunc return null', () => {
        expect(useGetConfig.defaultProps.lockFunc()).toEqual(null);
    })

    test('useGetConfig defaultProps unLockFunc return null', () => {
        expect(useGetConfig.defaultProps.unlockFunc()).toEqual(null);
    })
})