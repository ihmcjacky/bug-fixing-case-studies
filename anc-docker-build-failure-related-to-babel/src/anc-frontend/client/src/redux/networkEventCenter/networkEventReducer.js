import Constants from './networkEventConstants';


const INITIAL_STATE = {
    open: false,
    data: [],
    sort: {eventLogTime: 'desc'},
    searchKeyword: '',
    rowsPerPage: 20,
    page: 0,
    total: 0,
    exportDialogOpen: false,
};

function networkEventReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.OPEN_NETWORK_EVENT_CENTER: {
            return {
                ...state,
                open: true,
            };
        }
        case Constants.CLOSE_NETWORK_EVENT_CENTER: {
            return {
                ...state,
                open: false,
            };
        }
        case Constants.SET_NETWORK_EVENT_TABLE_DATA: {
            return {
                ...state,
                data: action.data.data,
                total: action.data.total,
            };
        }
        case Constants.SET_NETWORK_EVENT_TABLE_META_DATA: {
            return {
                ...state,
                rowsPerPage: action.data.rowsPerPage,
                page: action.data.page,
            };
        }
        case Constants.SET_NETWORK_EVENT_TABLE_SORT: {
            return {
                ...state,
                sort: action.sort,
            };
        }
        case Constants.SET_NETWORK_EVENT_SEARCH_KEYWORD: {
            return {
                ...state,
                searchKeyword: action.keyword,
            };
        }
        case Constants.OPEN_EXPORT_NETWORK_EVENT_DIALOG: {
            return {
                ...state,
                exportDialogOpen: true,
            };
        }
        case Constants.CLOSE_EXPORT_NETWORK_EVENT_DIALOG: {
            return {
                ...state,
                exportDialogOpen: false,
            };
        }
        default: {
            return state;
        }
    }
}

export default networkEventReducer;
