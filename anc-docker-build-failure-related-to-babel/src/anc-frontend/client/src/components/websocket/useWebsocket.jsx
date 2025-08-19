import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {
    firmwareUpgradeHandler,
    radioInfoHandler,
    generalInfoHandler,
    spectrumScanHandler,
    nodeRecoveryScanningResultHandler,
    nodeRecoveryScanningEnded,
    recoverNodeResultHanding,
} from './websocketHandler';
import Constants from '../../constants/common';
import store from '../../redux/store';

/**
 * Component to controll all the websocket relacted events
 * such as connection, message handling and pause or resume
 * websocket pause controlled by the `websocketPaused` bool in redux store `store -> polling -> websocketPaused`
 */
const useWebsocket = () => {
    const {websocketPaused} = useSelector(store => store.polling);
    const {
        hostInfo: {hostname, port},
    } = useSelector(store => store.common);
    const ws = useRef(null);
    const isMock = false;

    const didMountFunc = () => {
        const socketUrl = isMock ?
            `ws://${hostname}:8080/ws/v1/` :
            // process.env.NODE_ENV === 'development' ?
            //     `ws://${window.location.hostname}:5000/ws/django/ws/v1/` :
            //     `ws://${window.location.host}/ws/django/ws/v1/`;
            `ws://${hostname}:${port}/ws/v1/`
        ws.current = new WebSocket(socketUrl);
    };

    const websocketMessageHandler = (event) => {
        console.log('---- ws on message ----');
        const messages = JSON.parse(event.data);
        console.log(messages);
        const {projectId} = store.getState().projectManagement;
        messages.forEach((message) => {
            switch (message.type) {
                case 'FIRMWARE_UPGRADE': {
                    if (message.subtype === 'PROGRESS_STATUS') {
                        firmwareUpgradeHandler(message.data);
                    }
                    break;
                }
                case 'RADIO_INFO': {
                    if (!(isMock || message.projectId === projectId || message.projectId === Constants.mockWsServerProjectId)) {
                        break;
                    }
                    if (message.subtype === 'RADIO_INFO_UPDATE') {
                        radioInfoHandler(message.data);
                    }
                    break;
                }
                case 'GENERAL_INFO': {
                    generalInfoHandler(message);
                    break;
                }
                case 'SPECTRUM_SCAN': {
                    if (!(isMock || message.projectId === projectId || message.projectId === Constants.mockWsServerProjectId)) {
                        break;
                    }
                    spectrumScanHandler(message.data);
                    break;
                }
                case 'SCAN_NEARBY_NEIGHBOR': {
                    if (!(isMock || message.projectId === projectId || message.projectId === Constants.mockWsServerProjectId)) {
                        break;
                    }
                    if (message.subtype === 'SCANNING_RESULT') {
                        nodeRecoveryScanningResultHandler(message.data);
                    } else if (message.subtype === 'END_OF_SCANNING') {
                        nodeRecoveryScanningEnded(message.data);
                    }
                    break;
                }
                case 'NODE_RECOVERY': {
                    if (!(isMock || message.projectId === projectId || message.projectId === Constants.mockWsServerProjectId)) {
                        break;
                    }
                    if (message.subtype === 'TEMP_CONNECTION') {
                        recoverNodeResultHanding(message.data);
                    }
                    break;
                }
                default:
                    break;
            }
        });
    };
    const handleWebsocketPauseResume = () => {
        if (websocketPaused) {
            ws.current.onmessage = () => {
                console.log('---- ws paused ----');
            };
        } else {
            ws.current.onmessage = websocketMessageHandler;
        }
    };

    useEffect(didMountFunc, []);
    useEffect(handleWebsocketPauseResume, [websocketPaused]);
};

export default useWebsocket;
