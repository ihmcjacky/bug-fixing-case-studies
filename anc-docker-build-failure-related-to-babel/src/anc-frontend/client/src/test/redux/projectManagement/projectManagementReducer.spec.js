/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import reducer from '../../../redux/projectManagement/projectReducer';
import Constants from '../../../redux/projectManagement/projectConstants';

describe('spectrum scan reducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            projectId: '',
            projectName: '',
            projectList: [],
            projectDialog: {
                onView: '',
            },
            hasLogin: false,
            projectIdToNameMap: {},
            backupRestoreDialog: false,
            changeToStaging: false,
        };
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).to.be.deep.equals(initialState);
    });

    it('should able to update project id', () => {
        const mockId = 'this is mock id';
        const updateProjectIdAction = {
            type: Constants.SET_PROJECT_ID,
            id: mockId,
        };
        const updatedStore = reducer(initialState, updateProjectIdAction);
        expect(updatedStore.projectId).to.be.equal(mockId);
    });

    it('should able to update project info and hasLogin key', () => {
        const mockId = 'mock project id';
        const mockName = 'mock project name';
        const mockInfo = {
            projectId: mockId,
            projectName: mockName,
            hasLogin: true,
        };
        const setProjectInfoAction = {
            type: Constants.SET_PROJECT_INFO,
            info: mockInfo,
        };
        let updatedStore;
        updatedStore = reducer(initialState, setProjectInfoAction);
        expect(updatedStore.projectId).to.be.equal(mockId);
        expect(updatedStore.projectName).to.be.equal(mockName);
        expect(updatedStore.hasLogin).to.be.true;

        const mockEmptyId = '';
        const mockEmptyName = '';
        const mockEmptyInfo = {
            projectId: mockEmptyId,
            projectName: mockEmptyName,
        };
        const setEmptyProjectInfoAction = {
            type: Constants.SET_PROJECT_INFO,
            info: mockEmptyInfo,
        };
        updatedStore = reducer(initialState, setEmptyProjectInfoAction);
        expect(updatedStore.projectId).to.be.equal(mockEmptyId);
        expect(updatedStore.projectName).to.be.equal(mockEmptyName);
        expect(updatedStore.hasLogin).to.be.false;
    });

    it('should able to update project list and the id to name map', () => {
        const mockList = [
            {
                projectId: 'mock-id-1',
                managementIp: '1.1.1.1',
                numOfNode: 2,
                projectName: '111',
                projectImages: {
                    'mock-image-id': 'mock-image-name',
                },
            },
            {
                projectId: 'mock-id-2',
                managementIp: '2.2.2.2',
                numOfNode: 2,
                projectName: '222',
                projectImages: {
                    'mock-image-id': 'mock-image-name',
                },
            },
        ];
        const mockIdToNameList = {
            'mock-id-1': '111',
            'mock-id-2': '222',
        };
        const setPorjectListAction = {
            type: Constants.UDPATE_PROJECT_LIST,
            list: mockList,
            idToNameMap: mockIdToNameList,
        }

        const updatedStore = reducer(initialState, setPorjectListAction);
        expect(updatedStore.projectList).to.be.deep.equals(mockList);
        expect(updatedStore.projectIdToNameMap).to.be.deep.equals(mockIdToNameList);
    });

    it('should able to update project info and hasLogin key', () => {
        const mockView = {
            close: '',
            welcome: 'welcome',
            tour: 'tour',
            list: 'list',
        };
        let updatedStore;

        const changeWelcomeAction = {
            type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
            view: mockView.welcome,
        };
        updatedStore = reducer(initialState, changeWelcomeAction);
        expect(updatedStore.projectDialog.onView).to.be.equal(mockView.welcome);

        const changeTourAction = {
            type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
            view: mockView.tour,
        };
        updatedStore = reducer(updatedStore, changeTourAction);
        expect(updatedStore.projectDialog.onView).to.be.equal(mockView.tour);

        const changeListAction = {
            type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
            view: mockView.list,
        };
        updatedStore = reducer(updatedStore, changeListAction);
        expect(updatedStore.projectDialog.onView).to.be.equal(mockView.list);

        const changeCloseAction = {
            type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
            view: mockView.close,
        };
        updatedStore = reducer(updatedStore, changeCloseAction);
        expect(updatedStore.projectDialog.onView).to.be.equal(mockView.close);
    });

    it('should able to set backupRestoreDialog key to on/off', () => {
        let updatedStore;
        const openBackupRestoreAction = {
            type: Constants.OPEN_PROJECT_BACKUP_RESTORE,
        };

        updatedStore = reducer(initialState, openBackupRestoreAction);
        expect(updatedStore.backupRestoreDialog).to.be.true;

        const closeBackupRestoreAction = {
            type: Constants.CLOSE_PROJECT_BACKUP_RESTORE,
        };

        updatedStore = reducer(updatedStore, closeBackupRestoreAction);
        expect(updatedStore.backupRestoreDialog).to.be.false;
    });

    it('should able to set changeToStaging key to true', () => {
        const changeToStagingAction = {
            type: Constants.CHANGE_TO_STAGING,
        };

        const updatedStore = reducer(initialState, changeToStagingAction);
        expect(updatedStore.changeToStaging).to.be.true;
    });
});
