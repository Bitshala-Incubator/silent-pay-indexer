export const silentBlockEncodingFixture = [
    {
        transactions: [
            {
                id: 'd60cdcc1bdb78d44bf83e2ae0efa94bbb1187ba2397e4a40960d853b78e15b4f',
                blockHeight: 859678,
                blockHash:
                    '00000000000000000002c522880d92339d4c20ad071c0a587d6167a5f9d2a219',
                scanTweak:
                    '0381a4ef11a26108cf10d8c33305b77aec009beed82a77bb47b716a04ae9ae5bf1',
                outputs: [
                    {
                        pubKey: 'ca80a975d09b84b385e39d779293121b9a7c80942d824d2496f098e3f077ced3',
                        value: 24771038,
                        vout: 1,
                    },
                ],
                isSpent: false,
            },
            {
                id: 'cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb',
                blockHeight: 859678,
                blockHash:
                    '00000000000000000002c522880d92339d4c20ad071c0a587d6167a5f9d2a219',
                scanTweak:
                    '03d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
                outputs: [
                    {
                        pubKey: '5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff',
                        value: 26940,
                        vout: 0,
                    },
                    {
                        pubKey: 'e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa',
                        value: 4400,
                        vout: 1,
                    },
                ],
                isSpent: false,
            },
        ],
        blockHeight: 859678,
        blockHash:
            '00000000000000000002c522880d92339d4c20ad071c0a587d6167a5f9d2a219',
        encodedBlockHex:
            '0002d60cdcc1bdb78d44bf83e2ae0efa94bbb1187ba2397e4a40960d853b78e15b4f01000000000179f9deca80a975d09b84b385e39d779293121b9a7c80942d824d2496f098e3f077ced3000000010381a4ef11a26108cf10d8c33305b77aec009beed82a77bb47b716a04ae9ae5bf1cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb02000000000000693c5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff000000000000000000001130e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa0000000103d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
    },
];
