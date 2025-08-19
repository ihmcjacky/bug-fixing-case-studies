import { renderHook, act } from '@testing-library/react-hooks'
import useGetOptions from '../../util/useGetOptions';
import { useSelector } from 'react-redux';
import { getFilteredConfigOptions } from '../../util/apiCall';

jest.mock('../../util/apiCall.js', () => ({
    getFilteredConfigOptions: jest.fn()
}))

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

const mockMeshSettings = {
    meshSettings: {
        country: {
            type: 'enum',
            data: [{actualValue: 'HK', displayValue: 'Hong Kong'}]
        },
    },
};

const mockSelectorValue = {
    common: {csrf: '1234'},
    projectManagement: {projectId: '1234'},
};

const mockUseSelector  = () => {
    useSelector.mockImplementation((selector) => selector(mockSelectorValue))
};


const mockGetOptionsApiCall = () => {
    getFilteredConfigOptions.mockImplementation(() => Promise.resolve({
        ...mockMeshSettings,
    }))
}
const mockGetOptionsApiCallError = () => {
    getFilteredConfigOptions.mockImplementation(() => Promise.reject({
        error: {fail: 'fail'},
    }))
}
const mockUseSelectorReset = () => useSelector.mockReset();
const mockGetOptionsApiCallReset = () => getFilteredConfigOptions.mockReset();

afterEach(() => {
    mockGetOptionsApiCallReset()
    mockUseSelectorReset()
})

const defaultProps = {
    skip: false,
    options: JSON.stringify({meshSettings: ["clusterId", "bpduFilter"]}),
    sourceConfig: JSON.stringify({meshSettings: {country: 'HK'}}),
    withGetConfig: true,
    action: 'FETCH',
    lockFunc: jest.fn(),
    unlockFunc: jest.fn(),
}

describe('useGetOptions', () => {

    test('return empty data without errors when skip', () => {
        mockUseSelector();
        const { result } = renderHook(() => useGetOptions({
            ...defaultProps,
            skip: true,
        }))
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(0)
        expect(result.current[0]).toEqual({})
        expect(result.current[1].error).toBe(false)
    });

    test('return api options when its not skip and with getConfig', async () => {
        mockUseSelector();
        mockGetOptionsApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetOptions(defaultProps))

        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(result.current[1].error).toBe(false)
    })

    test('lock func will call if withGetConfig is false', async () => {
        mockUseSelector();
        mockGetOptionsApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetOptions({
            ...defaultProps,
            withGetConfig: false,
        }))

        await waitForNextUpdate();
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(1)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
    })


    test('return updated options after sourceConfig change', async () => {
        mockUseSelector();
        mockGetOptionsApiCall()

        const { result, waitForNextUpdate, rerender } = renderHook(
            ({sourceConfig}) => useGetOptions({...defaultProps, sourceConfig}),
                {initialProps: {sourceConfig: JSON.stringify({meshSettings: {country: 'HK'}})}}
        )

        await waitForNextUpdate();
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(getFilteredConfigOptions).toHaveBeenCalledTimes(1)
        expect(getFilteredConfigOptions).toHaveBeenNthCalledWith(1,
            mockSelectorValue.common.csrf,
            mockSelectorValue.projectManagement.projectId,
            {
                options: JSON.parse(defaultProps.options),
                sourceConfig: {meshSettings: {country: 'HK'}},
            }
        )
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        rerender({
            sourceConfig: JSON.stringify({meshSettings: {country: 'US'}}),
        })
        await waitForNextUpdate();
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(getFilteredConfigOptions).toHaveBeenCalledTimes(2)
        expect(getFilteredConfigOptions).toHaveBeenNthCalledWith(2,
            mockSelectorValue.common.csrf,
            mockSelectorValue.projectManagement.projectId,
            {
                options: JSON.parse(defaultProps.options),
                sourceConfig: {meshSettings: {country: 'US'}},
            }
        )
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(2)
    })

    test('return error after api return error', async () => {
        mockUseSelector();
        mockGetOptionsApiCallError()

        const { result, waitForNextUpdate } = renderHook(() => useGetOptions(defaultProps))

        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toEqual({})
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(1)
        expect(result.current[1].error).toBe(true)

    })

    test('refetch Data after calling refetchGetConfig', async () => {
        mockUseSelector();
        mockGetOptionsApiCall()

        const { result, waitForNextUpdate } = renderHook(() => useGetOptions(defaultProps))

        await waitForNextUpdate();
        act(() => {
            result.current[1].refetchGetOptions()
        })
        await waitForNextUpdate();
        expect(result.current).toHaveLength(2)
        expect(defaultProps.lockFunc).toHaveBeenCalledTimes(0)
        expect(defaultProps.unlockFunc).toHaveBeenCalledTimes(2)
        expect(result.current[0]).toEqual(mockMeshSettings)
        expect(result.current[1].error).toBe(false)
    })

    test('useGetOptions defaultProps lockFunc return null', () => {
        expect(useGetOptions.defaultProps.lockFunc()).toEqual(null);
    })

    test('useGetOptions defaultProps unLockFunc return null', () => {
        expect(useGetOptions.defaultProps.unlockFunc()).toEqual(null);
    })
})