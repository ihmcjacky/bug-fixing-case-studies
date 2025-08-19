import Constants from './networkEventConstants';


export function openNetworkEventCenter() {
    return {
        type: Constants.OPEN_NETWORK_EVENT_CENTER,
    };
}

export function closeNetworkEventCenter() {
    return {
        type: Constants.CLOSE_NETWORK_EVENT_CENTER,
    };
}

export const setNetworkEventTableData = (data, total) => ({
    type: Constants.SET_NETWORK_EVENT_TABLE_DATA,
    data: {
        data, 
        total,
    },
});

export const setNetworkEventTableMetaData = (data) => ({
    type: Constants.SET_NETWORK_EVENT_TABLE_META_DATA,
    data,
});

export const setNetworkEventTableSort = (sort) => ({
    type: Constants.SET_NETWORK_EVENT_TABLE_SORT,
    sort,
});

export const setNetworkEventSearchKeyword = (keyword) => ({
    type: Constants.SET_NETWORK_EVENT_SEARCH_KEYWORD,
    keyword,
});

export const openExportNetworkEventDialog = () => ({
    type: Constants.OPEN_EXPORT_NETWORK_EVENT_DIALOG,
});

export const closeExportNetworkEventDialog = () => ({
    type: Constants.CLOSE_EXPORT_NETWORK_EVENT_DIALOG,
});