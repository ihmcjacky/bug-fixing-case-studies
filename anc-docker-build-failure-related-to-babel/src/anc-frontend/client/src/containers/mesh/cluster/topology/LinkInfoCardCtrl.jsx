import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {convertIpToMac} from '../../../../util/formatConvertor';
import EthLinkInfoCard from '../../../../components/topology/EthLinkInfoCard';
import LinkInfoCard from '../../../../components/topology/LinkInfoCard';

const LinkInfoCardCtrl = (props) => {
    const {t, ready} = useTranslation('cluster-topology-link-info-card');
    const {
        x, y, isDashboardView,
        linkColor, linkId, linkType,
        nodeAIp, nodeBIp,
        containerX,
        containerY,
    } = props;
    const {graph: {nodes}, nodeInfo, linkInfo} = useSelector(store => store.meshTopology);
    if (linkId === '' || !ready) return <span />;
    let linkData = linkInfo[linkId];
    const isEmpty = typeof linkData === 'undefined';
    const nodeAData = {};
    const nodeBData = {};
    if (!isEmpty) {
        const nodeAInfo = nodeInfo[nodeAIp];
        const nodeBInfo = nodeInfo[nodeBIp];
        let nodeAMesh = null;
        let nodeBMesh = null;
        nodes.some((node) => {
            if (node.id === nodeAIp) nodeAMesh = node;
            if (node.id === nodeBIp) nodeBMesh = node;
            return (nodeAMesh && nodeBMesh);
        });
        if (!nodeAMesh || !nodeBMesh) return null;
        nodeAData.ip = nodeAIp;
        nodeAData.hostName = nodeAInfo ? nodeAInfo.hostname : convertIpToMac(nodeAIp);
        nodeAData.isManaged = nodeAMesh.isManaged;
        nodeAData.isReachable = nodeAMesh.isReachable;
        nodeAData.isAuth = nodeAMesh.isAuth !== 'no';

        nodeBData.ip = nodeBIp;
        nodeBData.hostName = nodeBInfo ? nodeBInfo.hostname : convertIpToMac(nodeBIp);
        nodeBData.isManaged = nodeBMesh.isManaged;
        nodeBData.isReachable = nodeBMesh.isReachable;
        nodeBData.isAuth = nodeBMesh.isAuth !== 'no';
    } else {
        linkData = {};
    }
    const isEthLink = linkType.includes('Ethernet');
    const cardWidth = 430;
    const cardHeight = 210;
    let xPos = x - (cardWidth / 2);
    let yPos = y;
    if (xPos + cardWidth > containerX) {
        xPos = containerX - cardWidth - 40;
    }
    if (xPos < 0) {
        xPos = 10;
    }
    if (yPos + cardHeight > containerY) {
        yPos = y - cardHeight - 10;
    }
    if (isEthLink) {
        return (
            <EthLinkInfoCard
                t={t}
                isEmpty={isEmpty}
                x={xPos}
                y={yPos}
                linkData={linkData}
                nodeA={nodeAData}
                nodeB={nodeBData}
                color={linkColor}
            />
        );
    }
    if (isDashboardView) {
        xPos = 'calc(50% - 230px)';
        yPos = 0;
    }
    return (
        <LinkInfoCard
            t={t}
            isDashboardView={isDashboardView}
            isEmpty={isEmpty}
            x={xPos}
            y={yPos}
            linkData={linkData}
            nodeA={nodeAData}
            nodeB={nodeBData}
            color={linkColor}
        />
    );
};

LinkInfoCardCtrl.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    linkColor: PropTypes.string,
    linkId: PropTypes.string.isRequired,
    nodeAIp: PropTypes.string,
    nodeBIp: PropTypes.string,
    linkType: PropTypes.string,
    isDashboardView: PropTypes.bool,
    containerX: PropTypes.number,
    containerY: PropTypes.number,
};

LinkInfoCardCtrl.defaultProps = {
    x: 99999,
    y: 99999,
    linkColor: '#425581',
    isDashboardView: false,
    linkType: 'RadioLink',
    nodeAIp: '',
    nodeBIp: '',
    containerX: 0,
    containerY: 0,
};

export default LinkInfoCardCtrl;
