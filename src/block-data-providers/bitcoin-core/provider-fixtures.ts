export const bitcoinCoreConfig = {
    rpcHost: 'dummyhost',
    rpcPass: 'dummypass',
    rpcPort: 'dummyport',
    rpcUser: 'dummyuser',
};

export const blockCountToHash = new Map([
    [3, '5e8033c92511917056519dbfd9269d912d3e9c1f82619e4f80c86e7112c1d01c'],
]);

export const blocks = new Map([
    [
        '5e8033c92511917056519dbfd9269d912d3e9c1f82619e4f80c86e7112c1d01c',
        {
            hash: '5e8033c92511917056519dbfd9269d912d3e9c1f82619e4f80c86e7112c1d01c',
            height: 7110,
            tx: [
                {
                    txid: '34bf138230289d340190ca7ecbf90175b810d50c528138e85efc115b87f0cd4c',
                    hash: '862580f3eb902c764cf2715e152b4d3178915ddf81306ff4f9e493704afe1e9c',
                    version: 2,
                    size: 169,
                    vsize: 142,
                    weight: 568,
                    locktime: 0,
                    vin: [
                        {
                            coinbase: '02c61b00',
                            txinwitness: [
                                '0000000000000000000000000000000000000000000000000000000000000000',
                            ],
                            sequence: 4294967295,
                        },
                    ],
                    vout: [
                        {
                            value: 0.0000688,
                            n: 0,
                            scriptPubKey: {
                                asm: '0 b2d6b843999ad97c90a8f7f7db30d20459223ed4',
                                desc: 'addr(bcrt1qktttssuentvhey9g7lmakvxjq3vjy0k5zruwed)#j437qj43',
                                hex: '0014b2d6b843999ad97c90a8f7f7db30d20459223ed4',
                                address:
                                    'bcrt1qktttssuentvhey9g7lmakvxjq3vjy0k5zruwed',
                                type: 'witness_v0_keyhash',
                            },
                        },
                        {
                            value: 0.0,
                            n: 1,
                            scriptPubKey: {
                                asm: 'OP_RETURN aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e',
                                desc: 'raw(6a24aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e)#r7yx5qat',
                                hex: '6a24aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e',
                                type: 'nulldata',
                            },
                        },
                    ],
                },
                {
                    txid: '5dfe2f917dd266a1a962c52b50b40ab9fe446f87c39d8a25a92703292222c3a5',
                    hash: '61532ef653de85e610a7552aae5a8766143fd39c3dc9b8d70e7cf84b1348c9e2',
                    version: 2,
                    size: 666,
                    vsize: 344,
                    weight: 1374,
                    locktime: 7109,
                    vin: [
                        {
                            txid: 'b259d69a672e1de1f72617c65a7cff5e23d9da7a7374880fed7a51c738f8ce9e',
                            vout: 0,
                            scriptSig: {
                                asm: '',
                                hex: '',
                            },
                            txinwitness: [
                                '3044022051f8c942399cfe1f1c042eb5b64592a371198611632883e6c18d82389e739c4b02201ecb2a5fa89c5c77f17d086092812c2e7e8ba30a8ab3334f7f01085da7d57af001',
                                '03306cbab059279881befea7cb2bcf7add57b969dc731379dd8043223a5960aa6b',
                            ],
                            sequence: 4294967293,
                        },
                        {
                            txid: 'be25e07424144f5e4dd7344b3f7c069df1ce8384c29ad28abde4382bf0e31297',
                            vout: 0,
                            scriptSig: {
                                asm: '',
                                hex: '',
                            },
                            txinwitness: [
                                '304402206ec7bf72d98b90a91f6c3f000b3103a25241aa73e7400523a73cb575918f7d2402203219c5af051f5cea980186d59d145deced29135754692583419925cc7263c6ae01',
                                '0289ed58be746252bbc8d17e04b397bd68fbf32ede2b0a65b020c4c0df94e88c86',
                            ],
                            sequence: 4294967293,
                        },
                        {
                            txid: '1c2c583439c40bc88d03a12ddac783543a1d7508c05e759d4babf88811382e64',
                            vout: 0,
                            scriptSig: {
                                asm: '',
                                hex: '',
                            },
                            txinwitness: [
                                '304402202eb1999ff3bbfd23c7b53c8db41f37984d3e50ca649e0cc30d2714abd9924bbc02205eff5ac2856e0d1b2940b84570f7bc744d96c952f9f4e70ba05a3f95f56c42d001',
                                '02a7b99a5b3975242b7155722b29e36e0a16db15f92825886a90dcd99a0e324edf',
                            ],
                            sequence: 4294967293,
                        },
                        {
                            txid: '793c71e597c6c23452b9986311aa0276c6527ecd76fa434c4e2a4e83f5814ffc',
                            vout: 0,
                            scriptSig: {
                                asm: '',
                                hex: '',
                            },
                            txinwitness: [
                                '3044022036f1dc16d106c5679e308470802896692af60114ba3b8d025fdbc934f29a46b902206fa1751fcda7e095382940a331145bbf74f6f5ca316229e9cf87a51da79a6ca701',
                                '033a06335899335a4cdc81abb4d19b604456cc9c6a8ec56afebf09b8a0ad026a3d',
                            ],
                            sequence: 4294967293,
                        },
                    ],
                    vout: [
                        {
                            value: 11.56096634,
                            n: 0,
                            scriptPubKey: {
                                asm: '0 fed893be0f774fe69825cafd9a4d721ceaf4d635',
                                desc: 'addr(bcrt1qlmvf80s0wa87dxp9et7e5ntjrn40f4343wh4cg)#l6637rsn',
                                hex: '0014fed893be0f774fe69825cafd9a4d721ceaf4d635',
                                address:
                                    'bcrt1qlmvf80s0wa87dxp9et7e5ntjrn40f4343wh4cg',
                                type: 'witness_v0_keyhash',
                            },
                        },
                        {
                            value: 1.0,
                            n: 1,
                            scriptPubKey: {
                                asm: '0 e0d0621ec10bfb9ee7902f8c46562e808e464940',
                                desc: 'addr(bcrt1qurgxy8kpp0aeaeus97xyv43wsz8yvj2q7ywagm)#hpx4jtc8',
                                hex: '0014e0d0621ec10bfb9ee7902f8c46562e808e464940',
                                address:
                                    'bcrt1qurgxy8kpp0aeaeus97xyv43wsz8yvj2q7ywagm',
                                type: 'witness_v0_keyhash',
                            },
                        },
                    ],
                },
            ],
        },
    ],
]);

export const rawTransactions = new Map([
    [
        '34bf138230289d340190ca7ecbf90175b810d50c528138e85efc115b87f0cd4c',
        {
            txid: '34bf138230289d340190ca7ecbf90175b810d50c528138e85efc115b87f0cd4c',
            hash: '862580f3eb902c764cf2715e152b4d3178915ddf81306ff4f9e493704afe1e9c',
            version: 2,
            size: 169,
            vsize: 142,
            weight: 568,
            locktime: 0,
            vin: [
                {
                    coinbase: '02c61b00',
                    txinwitness: [
                        '0000000000000000000000000000000000000000000000000000000000000000',
                    ],
                    sequence: 4294967295,
                },
            ],
            vout: [
                {
                    value: 0.0000688,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 b2d6b843999ad97c90a8f7f7db30d20459223ed4',
                        desc: 'addr(bcrt1qktttssuentvhey9g7lmakvxjq3vjy0k5zruwed)#j437qj43',
                        hex: '0014b2d6b843999ad97c90a8f7f7db30d20459223ed4',
                        address: 'bcrt1qktttssuentvhey9g7lmakvxjq3vjy0k5zruwed',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 0.0,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_RETURN aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e',
                        desc: 'raw(6a24aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e)#r7yx5qat',
                        hex: '6a24aa21a9ed387c2ab8374f5b7faf82e19713f1bc22db9a631923b98c44c4f24daf93fbaf8e',
                        type: 'nulldata',
                    },
                },
            ],
        },
    ],
    [
        '5dfe2f917dd266a1a962c52b50b40ab9fe446f87c39d8a25a92703292222c3a5',
        {
            txid: '5dfe2f917dd266a1a962c52b50b40ab9fe446f87c39d8a25a92703292222c3a5',
            hash: '61532ef653de85e610a7552aae5a8766143fd39c3dc9b8d70e7cf84b1348c9e2',
            version: 2,
            size: 666,
            vsize: 344,
            weight: 1374,
            locktime: 7109,
            vin: [
                {
                    txid: 'b259d69a672e1de1f72617c65a7cff5e23d9da7a7374880fed7a51c738f8ce9e',
                    vout: 0,
                    scriptSig: {
                        asm: '',
                        hex: '',
                    },
                    txinwitness: [
                        '3044022051f8c942399cfe1f1c042eb5b64592a371198611632883e6c18d82389e739c4b02201ecb2a5fa89c5c77f17d086092812c2e7e8ba30a8ab3334f7f01085da7d57af001',
                        '03306cbab059279881befea7cb2bcf7add57b969dc731379dd8043223a5960aa6b',
                    ],
                    sequence: 4294967293,
                },
                {
                    txid: 'be25e07424144f5e4dd7344b3f7c069df1ce8384c29ad28abde4382bf0e31297',
                    vout: 0,
                    scriptSig: {
                        asm: '',
                        hex: '',
                    },
                    txinwitness: [
                        '304402206ec7bf72d98b90a91f6c3f000b3103a25241aa73e7400523a73cb575918f7d2402203219c5af051f5cea980186d59d145deced29135754692583419925cc7263c6ae01',
                        '0289ed58be746252bbc8d17e04b397bd68fbf32ede2b0a65b020c4c0df94e88c86',
                    ],
                    sequence: 4294967293,
                },
                {
                    txid: '1c2c583439c40bc88d03a12ddac783543a1d7508c05e759d4babf88811382e64',
                    vout: 0,
                    scriptSig: {
                        asm: '',
                        hex: '',
                    },
                    txinwitness: [
                        '304402202eb1999ff3bbfd23c7b53c8db41f37984d3e50ca649e0cc30d2714abd9924bbc02205eff5ac2856e0d1b2940b84570f7bc744d96c952f9f4e70ba05a3f95f56c42d001',
                        '02a7b99a5b3975242b7155722b29e36e0a16db15f92825886a90dcd99a0e324edf',
                    ],
                    sequence: 4294967293,
                },
                {
                    txid: '793c71e597c6c23452b9986311aa0276c6527ecd76fa434c4e2a4e83f5814ffc',
                    vout: 0,
                    scriptSig: {
                        asm: '',
                        hex: '',
                    },
                    txinwitness: [
                        '3044022036f1dc16d106c5679e308470802896692af60114ba3b8d025fdbc934f29a46b902206fa1751fcda7e095382940a331145bbf74f6f5ca316229e9cf87a51da79a6ca701',
                        '033a06335899335a4cdc81abb4d19b604456cc9c6a8ec56afebf09b8a0ad026a3d',
                    ],
                    sequence: 4294967293,
                },
            ],
            vout: [
                {
                    value: 11.56096634,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 fed893be0f774fe69825cafd9a4d721ceaf4d635',
                        desc: 'addr(bcrt1qlmvf80s0wa87dxp9et7e5ntjrn40f4343wh4cg)#l6637rsn',
                        hex: '0014fed893be0f774fe69825cafd9a4d721ceaf4d635',
                        address: 'bcrt1qlmvf80s0wa87dxp9et7e5ntjrn40f4343wh4cg',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 1.0,
                    n: 1,
                    scriptPubKey: {
                        asm: '0 e0d0621ec10bfb9ee7902f8c46562e808e464940',
                        desc: 'addr(bcrt1qurgxy8kpp0aeaeus97xyv43wsz8yvj2q7ywagm)#hpx4jtc8',
                        hex: '0014e0d0621ec10bfb9ee7902f8c46562e808e464940',
                        address: 'bcrt1qurgxy8kpp0aeaeus97xyv43wsz8yvj2q7ywagm',
                        type: 'witness_v0_keyhash',
                    },
                },
            ],
        },
    ],
    [
        'b259d69a672e1de1f72617c65a7cff5e23d9da7a7374880fed7a51c738f8ce9e',
        {
            txid: 'b259d69a672e1de1f72617c65a7cff5e23d9da7a7374880fed7a51c738f8ce9e',
            hash: '9faee815492dadb1443993820c4915e2ad169d203989244e3d552a03f26f9365',
            version: 2,
            size: 169,
            vsize: 142,
            weight: 568,
            locktime: 0,
            vin: [
                {
                    coinbase: '02660100',
                    txinwitness: [
                        '0000000000000000000000000000000000000000000000000000000000000000',
                    ],
                    sequence: 4294967295,
                },
            ],
            vout: [
                {
                    value: 12.5,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 a3b1fba843829bcb81c3619c02c5cf168fd4f67e',
                        desc: 'addr(bcrt1q5wclh2zrs2duhqwrvxwq93w0z68afan7uzv0yx)#sfeflmc5',
                        hex: '0014a3b1fba843829bcb81c3619c02c5cf168fd4f67e',
                        address: 'bcrt1q5wclh2zrs2duhqwrvxwq93w0z68afan7uzv0yx',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 0.0,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        desc: 'raw(6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9)#cav96mf3',
                        hex: '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        type: 'nulldata',
                    },
                },
            ],
        },
    ],
    [
        '1c2c583439c40bc88d03a12ddac783543a1d7508c05e759d4babf88811382e64',
        {
            txid: '1c2c583439c40bc88d03a12ddac783543a1d7508c05e759d4babf88811382e64',
            hash: '039fafb4075ddf4a556971fcc2fa84fd1b976120da6c0752dbb3ef3d5a0158f8',
            version: 2,
            size: 169,
            vsize: 142,
            weight: 568,
            locktime: 0,
            vin: [
                {
                    coinbase: '02f70700',
                    txinwitness: [
                        '0000000000000000000000000000000000000000000000000000000000000000',
                    ],
                    sequence: 4294967295,
                },
            ],
            vout: [
                {
                    value: 0.00610351,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 c2ee20ce3d95f7f7602016fba155f95d0cb43903',
                        desc: 'addr(bcrt1qcthzpn3ajhmlwcpqzma6z40et5xtgwgrs3ypnj)#wrvj8tww',
                        hex: '0014c2ee20ce3d95f7f7602016fba155f95d0cb43903',
                        address: 'bcrt1qcthzpn3ajhmlwcpqzma6z40et5xtgwgrs3ypnj',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 0.0,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        desc: 'raw(6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9)#cav96mf3',
                        hex: '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        type: 'nulldata',
                    },
                },
            ],
        },
    ],
    [
        '793c71e597c6c23452b9986311aa0276c6527ecd76fa434c4e2a4e83f5814ffc',
        {
            txid: '793c71e597c6c23452b9986311aa0276c6527ecd76fa434c4e2a4e83f5814ffc',
            hash: '46d86e1ae00eb92990d9cb83dbe473008d3ec1d182d8792c645d29c20ee7fcec',
            version: 2,
            size: 169,
            vsize: 142,
            weight: 568,
            locktime: 0,
            vin: [
                {
                    coinbase: '025e0600',
                    txinwitness: [
                        '0000000000000000000000000000000000000000000000000000000000000000',
                    ],
                    sequence: 4294967295,
                },
            ],
            vout: [
                {
                    value: 0.04882812,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 befc45ec32f57c0fe72bce2c8b078b0eee2f2b67',
                        desc: 'addr(bcrt1qhm7ytmpj747qleeteckgkputpmhz72m8rjadc4)#n4nyswj0',
                        hex: '0014befc45ec32f57c0fe72bce2c8b078b0eee2f2b67',
                        address: 'bcrt1qhm7ytmpj747qleeteckgkputpmhz72m8rjadc4',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 0.0,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        desc: 'raw(6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9)#cav96mf3',
                        hex: '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        type: 'nulldata',
                    },
                },
            ],
        },
    ],
    [
        'be25e07424144f5e4dd7344b3f7c069df1ce8384c29ad28abde4382bf0e31297',
        {
            txid: 'be25e07424144f5e4dd7344b3f7c069df1ce8384c29ad28abde4382bf0e31297',
            hash: 'd8bcf790763ca7a3666a38c5acfb0346fabb328e93e361793588171a5726ba65',
            version: 2,
            size: 169,
            vsize: 142,
            weight: 568,
            locktime: 0,
            vin: [
                {
                    coinbase: '02300800',
                    txinwitness: [
                        '0000000000000000000000000000000000000000000000000000000000000000',
                    ],
                    sequence: 4294967295,
                },
            ],
            vout: [
                {
                    value: 0.00610351,
                    n: 0,
                    scriptPubKey: {
                        asm: '0 5266deca187c876b2dde472fd7499f008aed5256',
                        desc: 'addr(bcrt1q2fndajsc0jrkktw7guhawjvlqz9w65jk73ksde)#gjvv2dap',
                        hex: '00145266deca187c876b2dde472fd7499f008aed5256',
                        address: 'bcrt1q2fndajsc0jrkktw7guhawjvlqz9w65jk73ksde',
                        type: 'witness_v0_keyhash',
                    },
                },
                {
                    value: 0.0,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        desc: 'raw(6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9)#cav96mf3',
                        hex: '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
                        type: 'nulldata',
                    },
                },
            ],
        },
    ],
]);

export const parsedTransactions = new Map([
    [
        '5dfe2f917dd266a1a962c52b50b40ab9fe446f87c39d8a25a92703292222c3a5',
        {
            txid: '5dfe2f917dd266a1a962c52b50b40ab9fe446f87c39d8a25a92703292222c3a5',
            vin: [
                {
                    txid: 'b259d69a672e1de1f72617c65a7cff5e23d9da7a7374880fed7a51c738f8ce9e',
                    vout: 0,
                    scriptSig: '',
                    witness: [
                        '3044022051f8c942399cfe1f1c042eb5b64592a371198611632883e6c18d82389e739c4b02201ecb2a5fa89c5c77f17d086092812c2e7e8ba30a8ab3334f7f01085da7d57af001',
                        '03306cbab059279881befea7cb2bcf7add57b969dc731379dd8043223a5960aa6b',
                    ],
                    prevOutScript:
                        '0014a3b1fba843829bcb81c3619c02c5cf168fd4f67e',
                },
                {
                    txid: 'be25e07424144f5e4dd7344b3f7c069df1ce8384c29ad28abde4382bf0e31297',
                    vout: 0,
                    scriptSig: '',
                    witness: [
                        '304402206ec7bf72d98b90a91f6c3f000b3103a25241aa73e7400523a73cb575918f7d2402203219c5af051f5cea980186d59d145deced29135754692583419925cc7263c6ae01',
                        '0289ed58be746252bbc8d17e04b397bd68fbf32ede2b0a65b020c4c0df94e88c86',
                    ],
                    prevOutScript:
                        '00145266deca187c876b2dde472fd7499f008aed5256',
                },
                {
                    txid: '1c2c583439c40bc88d03a12ddac783543a1d7508c05e759d4babf88811382e64',
                    vout: 0,
                    scriptSig: '',
                    witness: [
                        '304402202eb1999ff3bbfd23c7b53c8db41f37984d3e50ca649e0cc30d2714abd9924bbc02205eff5ac2856e0d1b2940b84570f7bc744d96c952f9f4e70ba05a3f95f56c42d001',
                        '02a7b99a5b3975242b7155722b29e36e0a16db15f92825886a90dcd99a0e324edf',
                    ],
                    prevOutScript:
                        '0014c2ee20ce3d95f7f7602016fba155f95d0cb43903',
                },
                {
                    txid: '793c71e597c6c23452b9986311aa0276c6527ecd76fa434c4e2a4e83f5814ffc',
                    vout: 0,
                    scriptSig: '',
                    witness: [
                        '3044022036f1dc16d106c5679e308470802896692af60114ba3b8d025fdbc934f29a46b902206fa1751fcda7e095382940a331145bbf74f6f5ca316229e9cf87a51da79a6ca701',
                        '033a06335899335a4cdc81abb4d19b604456cc9c6a8ec56afebf09b8a0ad026a3d',
                    ],
                    prevOutScript:
                        '0014befc45ec32f57c0fe72bce2c8b078b0eee2f2b67',
                },
            ],
            vout: [
                {
                    scriptPubKey:
                        '0014fed893be0f774fe69825cafd9a4d721ceaf4d635',
                    value: 1156096634,
                },
                {
                    scriptPubKey:
                        '0014e0d0621ec10bfb9ee7902f8c46562e808e464940',
                    value: 100000000,
                },
            ],
            blockHeight: 7110,
            blockHash:
                '5e8033c92511917056519dbfd9269d912d3e9c1f82619e4f80c86e7112c1d01c',
        },
    ],
]);
