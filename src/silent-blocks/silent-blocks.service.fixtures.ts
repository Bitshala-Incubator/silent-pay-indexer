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
                        isSpent: false,
                    },
                ],
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
                        isSpent: false,
                    },
                    {
                        pubKey: 'e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa',
                        value: 4400,
                        vout: 1,
                        isSpent: false,
                    },
                ],
            },
        ],
        blockHeight: 859678,
        blockHash:
            '00000000000000000002c522880d92339d4c20ad071c0a587d6167a5f9d2a219',
        encodedBlockHex:
            '0002d60cdcc1bdb78d44bf83e2ae0efa94bbb1187ba2397e4a40960d853b78e15b4f01000000000179f9deca80a975d09b84b385e39d779293121b9a7c80942d824d2496f098e3f077ced3000000010381a4ef11a26108cf10d8c33305b77aec009beed82a77bb47b716a04ae9ae5bf1cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb02000000000000693c5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff000000000000000000001130e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa0000000103d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
    },
];

export const verifyFilterTransactionFixture = {
    blockHeight: 2770,
    blockHash:
        '7b15a84293dc6f4cbd78f1501cbb595a06f92c5535b9e24357130ddc140f317f',

    transactions: [
        {
            id: '9362f0b01471ddaef7329087cdee7ffec0a45c95834436756f839b33c507fe92',
            blockHeight: 2770,
            blockHash:
                '7b15a84293dc6f4cbd78f1501cbb595a06f92c5535b9e24357130ddc140f317f',
            scanTweak:
                '03304f85de18111332a961ef42e9984c92b0942b41fe231f4bed6abae196824d12',
            outputs: [
                {
                    pubKey: '9e1d989adf64d27fcd304b8dd389e22b8df5e3261e37c61703d15916efc6a829',
                    value: 1000000000,
                    vout: 0,
                    isSpent: false,
                    transactionId:
                        '9362f0b01471ddaef7329087cdee7ffec0a45c95834436756f839b33c507fe92',
                },
                {
                    pubKey: '4006e45eaff5e446df0bb55be9d0d95493af98d76883f4659cf202341578f326',
                    value: 2000000000,
                    vout: 1,
                    isSpent: false,
                },
                {
                    pubKey: 'c20adb7419dca3ec3558b60d1a79964ccc9a5eca91eb1ab36a00c92fac9a76fc',
                    value: 1500000000,
                    vout: 2,
                    isSpent: false,
                    transactionId:
                        '9362f0b01471ddaef7329087cdee7ffec0a45c95834436756f839b33c507fe92',
                },
                {
                    pubKey: 'cdd68592937c9018681572354b7b47d076ef269d19934e20c053648419da27ef',
                    value: 500031781,
                    vout: 3,
                    isSpent: false,
                    transactionId:
                        '9362f0b01471ddaef7329087cdee7ffec0a45c95834436756f839b33c507fe92',
                },
            ],
        },
        {
            id: 'cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb',
            blockHeight: 2770,
            blockHash:
                '7b15a84293dc6f4cbd78f1501cbb595a06f92c5535b9e24357130ddc140f317f',
            scanTweak:
                '03d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
            outputs: [
                {
                    pubKey: '5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff',
                    value: 26940,
                    vout: 0,
                    isSpent: false,
                    transactionId:
                        'cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb',
                },
                {
                    pubKey: 'e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa',
                    value: 4400,
                    vout: 1,
                    isSpent: false,
                    transactionId:
                        'cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb',
                },
            ],
        },
    ],
    fullyEncodedBlock:
        '00029362f0b01471ddaef7329087cdee7ffec0a45c95834436756f839b33c507fe9204000000003b9aca009e1d989adf64d27fcd304b8dd389e22b8df5e3261e37c61703d15916efc6a8290000000000000000773594004006e45eaff5e446df0bb55be9d0d95493af98d76883f4659cf202341578f326000000010000000059682f00c20adb7419dca3ec3558b60d1a79964ccc9a5eca91eb1ab36a00c92fac9a76fc00000002000000001dcde125cdd68592937c9018681572354b7b47d076ef269d19934e20c053648419da27ef0000000303304f85de18111332a961ef42e9984c92b0942b41fe231f4bed6abae196824d12cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb02000000000000693c5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff000000000000000000001130e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa0000000103d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
    partiallyEncodeBlock:
        '0001cf655a07ed9b672ecf811ce8b3b69257eecaf0518edd025d7014d7c0177050cb02000000000000693c5af9436eb515871413a913f24290ba003eab7a64b9c62cb72051599a383de8ff000000000000000000001130e7a3ab33572f47b074878c749a5f9a5d7e026f10b6ffcab1388e9356c07828fa0000000103d87550a4ba8ed7dd37df7739a021d6d212e70e8a8e6e9e70249c13a11fd9f412',
};
