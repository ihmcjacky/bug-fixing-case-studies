/* eslint-disable no-unused-expressions */
import * as React from 'react';
import {expect} from 'chai';
import {act} from 'react-dom/test-utils';
import {shallow, configure, mount} from 'enzyme';
import Adapter from "enzyme-adapter-react-16";
import {spy, stub} from 'sinon';
import * as reactRedux from 'react-redux';
import InfoDialog from '../../../components/common/InfoDialog';
import * as EnableDevModeDialogWrapper from '../../../components/devMode/EnableDevModeDialogWrapper';

configure({ adapter: new Adapter() });

describe('InfoDialog component', function () {
    let stubUseDispatch;

    beforeEach(async function () {
        stubUseDispatch = stub(reactRedux, 'useDispatch').returns(() => {});
    });

    afterEach(async function () {
        stubUseDispatch.restore();
    });

    it('should not render EnableDevModeDialog when not login A-NM', async function () {
        const store = {
            location: 'test',
            anm: {
                loggedin: false,
            },
        };
        const mockProps = {
            t: () => {},
            closeFunc: () => {},
            open: true,
        };

        const stubUseSelector = stub(reactRedux, 'useSelector').returns(store);
        const wrapper = shallow(<InfoDialog {...mockProps} />);

        expect(wrapper.find(EnableDevModeDialogWrapper.default)).to.have.length(0);

        stubUseSelector.restore();
    });

    it('should render EnableDevModeDialog when login A-NM', async function () {
        const store = {
            location: 'test',
            anm: {
                loggedin: true,
            },
        };
        const mockProps = {
            t: () => {},
            closeFunc: () => {},
            open: true,
        };

        const stubUseSelector = stub(reactRedux, 'useSelector').returns(store);
        const wrapper = shallow(<InfoDialog {...mockProps} />);

        expect(wrapper.find(EnableDevModeDialogWrapper.default)).to.have.length(1);

        stubUseSelector.restore();
    });

    it(`should add keyup and keydown event listener when dialog open
            and remove listener when dialog close`, async function () {
        const spyDocumentAddEventListener = spy(document, 'addEventListener');
        const spyDocumentRemoveAddEventListener = spy(document, 'removeEventListener');

        const store = {
            location: 'test',
            anm: {
                loggedin: true,
            },
        };
        const mockProps = {
            t: () => {},
            closeFunc: () => {},
            open: true,
        };

        const stubUseSelector = stub(reactRedux, 'useSelector').returns(store);

        let wrapper;
        await act(async function () {
            wrapper = mount(<InfoDialog {...mockProps} />);
        });

        const firstCall = spyDocumentAddEventListener.getCall(0);
        expect(firstCall.firstArg).to.be.equals('keydown');

        const secondCall = spyDocumentAddEventListener.getCall(1);
        expect(secondCall.firstArg).to.be.equals('keyup');
        expect(spyDocumentRemoveAddEventListener.called).to.be.false;

        wrapper.setProps({
            ...mockProps,
            open: false,
        });

        const totalCallNum = spyDocumentRemoveAddEventListener.args.length;
        const call1 = spyDocumentRemoveAddEventListener.getCall(totalCallNum - 2);
        expect(call1.firstArg).to.be.equals('keydown');

        const call2 = spyDocumentRemoveAddEventListener.getCall(totalCallNum - 1);
        expect(call2.firstArg).to.be.equals('keyup');

        stubUseSelector.restore();
        spyDocumentAddEventListener.restore();
        spyDocumentRemoveAddEventListener.restore();
    });
});
