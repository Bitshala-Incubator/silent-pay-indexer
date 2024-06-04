export interface OutputScriptFixture {
    description: string;
    scriptPubKey: string;
    scriptSig: string;
    witness: string[];
    pubkey: string | null;
}

export const p2pkh_valid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2PKH',
        scriptPubKey: '76a91419c2f3ae0ca3b642bd3e49598b8da89f50c1416188ac',
        scriptSig:
            '483046022100ad79e6801dd9a8727f342f31c71c4912866f59dc6e7981878e92c5844a0ce929022100fb0d2393e813968648b9753b7e9871d90ab3d815ebf91820d704b19f4ed224d621025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
        witness: [],
        pubkey: '025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
    },
    {
        description: 'P2PKH',
        scriptPubKey: '76a914d9317c66f54ff0a152ec50b1d19c25be50c8e15988ac',
        scriptSig:
            '48304602210086783ded73e961037e77d49d9deee4edc2b23136e9728d56e4491c80015c3a63022100fda4c0f21ea18de29edbce57f7134d613e044ee150a89e2e64700de2d4e83d4e2103bd85685d03d111699b15d046319febe77f8de5286e9e512703cdee1bf3be3792',
        witness: [],
        pubkey: '03bd85685d03d111699b15d046319febe77f8de5286e9e512703cdee1bf3be3792',
    },
    {
        description: 'P2PKH',
        scriptPubKey: '76a9148cbc7dfe44f1579bff3340bbef1eddeaeb1fc97788ac',
        scriptSig:
            '463044021f24e010c6e475814740ba24c8cf9362c4db1276b7f46a7b1e63473159a80ec30221008198e8ece7b7f88e6c6cc6bb8c86f9f00b7458222a8c91addf6e1577bcf7697e2103e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d',
        witness: [],
        pubkey: '03e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d',
    },
    {
        description: 'P2PKH',
        scriptPubKey: '76a914c82c5ec473cbc6c86e5ef410e36f9495adcf979988ac',
        scriptSig:
            '5163473045022100e7d26e77290b37128f5215ade25b9b908ce87cc9a4d498908b5bb8fd6daa1b8d022002568c3a8226f4f0436510283052bfb780b76f3fe4aa60c4c5eb118e43b187372102e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d67483046022100c0d3c851d3bd562ae93d56bcefd735ea57c027af46145a4d5e9cac113bfeb0c2022100ee5b2239af199fa9b7aa1d98da83a29d0a2cf1e4f29e2f37134ce386d51c544c2102ad0f26ddc7b3fcc340155963b3051b85289c1869612ecb290184ac952e2864ec68',
        witness: [],
        pubkey: '02e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d',
    },
    {
        description: 'P2PKH -- Non Malleanted',
        scriptPubKey: '76a9147cdd63cc408564188e8e472640e921c7c90e651d88ac',
        scriptSig:
            '473045022100a8c61b2d470e393279d1ba54f254b7c237de299580b7fa01ffcc940442ecec4502201afba952f4e4661c40acde7acc0341589031ba103a307b886eb867b23b850b972103782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
        witness: [],
        pubkey: '03782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
    },
    {
        description: 'P2PKH -- Malleanated',
        scriptPubKey: '76a9147cdd63cc408564188e8e472640e921c7c90e651d88ac',
        scriptSig:
            '0075473045022100a8c61b2d470e393279d1ba54f254b7c237de299580b7fa01ffcc940442ecec4502201afba952f4e4661c40acde7acc0341589031ba103a307b886eb867b23b850b972103782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
        witness: [],
        pubkey: '03782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
    },
];

export const p2pkh_invalid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2PKH - uncompressed key used',
        scriptPubKey: '76a9144b92ac4ac6fe6212393894addda332f2e47a315688ac',
        scriptSig:
            '473045022100a8c61b2d470e393279d1ba54f254b7c237de299580b7fa01ffcc940442ecec4502201afba952f4e4661c40acde7acc0341589031ba103a307b886eb867b23b850b974104782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c3799373233387c5343bf58e23269e903335b958a12182f9849297321e8d710e49a8727129cab',
        witness: [],
        pubkey: null,
    },
    {
        description: 'P2PKH - uncompressed key used',
        scriptPubKey: '76a914460e8b41545d2dbe7e0671f0f573e2232814260a88ac',
        scriptSig:
            '483046022100ad79e6801dd9a8727f342f31c71c4912866f59dc6e7981878e92c5844a0ce929022100fb0d2393e813968648b9753b7e9871d90ab3d815ebf91820d704b19f4ed224d641045a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5c61836c9b1688ba431f7ea3039742251f62f0dca3da1bee58a47fa9b456c2d52',
        witness: [],
        pubkey: null,
    },
];

export const p2tr_valid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2TR',
        scriptPubKey:
            '51205a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
        scriptSig: '',
        witness: [
            'c459b671370d12cfb5acee76da7e3ba7cc29b0b4653e3af8388591082660137d087fdc8e89a612cd5d15be0febe61fc7cdcf3161a26e599a4514aa5c3e86f47b',
        ],
        pubkey: '025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
    },
    {
        description: 'P2TR',
        scriptPubKey:
            '5120782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
        scriptSig: '',
        witness: [
            'bd1e708f92dbeaf24a6b8dd22e59c6274355424d62baea976b449e220fd75b13578e262ab11b7aa58e037f0c6b0519b66803b7d9decaa1906dedebfb531c56c1',
        ],
        pubkey: '02782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c379937323338',
    },
    {
        description: 'P2TR',
        scriptPubKey:
            '51208c8d23d4764feffcd5e72e380802540fa0f88e3d62ad5e0b47955f74d7b283c4',
        scriptSig: '',
        witness: [
            '0a4d0dca6293f40499394d7eefe14a1de11e0e3454f51de2e802592abf5ee549042a1b1a8fb2e149ee9dd3f086c1b69b2f182565ab6ecf599b1ec9ebadfda6c5',
        ],
        pubkey: '028c8d23d4764feffcd5e72e380802540fa0f88e3d62ad5e0b47955f74d7b283c4',
    },
];

export const p2tr_invalid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2TR - annex present, NUMS_H used as internal key',
        scriptPubKey:
            '5120da6f0595ecb302bbe73e2f221f05ab10f336b06817d36fd28fc6691725ddaa85',
        scriptSig: '',
        witness: [
            'c459b671370d12cfb5acee76da7e3ba7cc29b0b4653e3af8388591082660137d087fdc8e89a612cd5d15be0febe61fc7cdcf3161a26e599a4514aa5c3e86f47b',
            '205a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5ac',
            'c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
            '50',
        ],
        pubkey: null,
    },
    {
        description: 'P2TR - annex absent, NUMS_H used as internal key',
        scriptPubKey:
            '51200a3c9365ceb131f89b0a4feb6896ebd67bb15a98c31eaa3da143bb955a0f3fcb',
        scriptSig: '',
        witness: [
            '268d31a9276f6380107d5321cafa6d9e8e5ea39204318fdc8206b31507c891c3bbcea3c99e2208d73bd127a8e8c5f1e45a54f1bd217205414ddb566ab7eda009',
            '20e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85dac',
            'c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
        ],
        pubkey: null,
    },
];

export const p2wpkh_valid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2WPKH - uncompressed key used',
        scriptPubKey: '00140a5d7a9bacdc180f7970586317bd92791d048cc2',
        scriptSig: '',
        witness: [
            '3045022100be811b872d507a06fd62d04f7a414751209e9e07db9ac8b3dc4752859b89b6ba022025c5d14a201640f22e77f926fd2dbcf30e063eed174b2cc2e2e1fc91157baa9201',
            '033c7c580916663fab75cb294e4a95ec281dc8025f487bb75b94ffd3fdd90fa360',
        ],
        pubkey: '033c7c580916663fab75cb294e4a95ec281dc8025f487bb75b94ffd3fdd90fa360',
    },
];

export const p2wpkh_invalid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2WPKH - uncompressed key used',
        scriptPubKey: '00140423f731a07491364e8dce98b7c00bda63336950',
        scriptSig: '',
        witness: [
            '3045022100e7d26e77290b37128f5215ade25b9b908ce87cc9a4d498908b5bb8fd6daa1b8d022002568c3a8226f4f0436510283052bfb780b76f3fe4aa60c4c5eb118e43b18737',
            '04e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d6fe8190e189be57d0d5bcd17dbcbcd04c9b4a1c5f605b10d5c90abfcc0d12884',
        ],
        pubkey: null,
    },
];

export const p2sh_p2wpkh_valid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2SH-P2WPKH',
        scriptPubKey: 'a9148629db5007d5fcfbdbb466637af09daf9125969387',
        scriptSig: '16001419c2f3ae0ca3b642bd3e49598b8da89f50c14161',
        witness: [
            '3046022100ad79e6801dd9a8727f342f31c71c4912866f59dc6e7981878e92c5844a0ce929022100fb0d2393e813968648b9753b7e9871d90ab3d815ebf91820d704b19f4ed224d6',
            '025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
        ],
        pubkey: '025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5',
    },
];

export const p2sh_p2wpkh_invalid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2SH-P2WPKH - uncompressed key used',
        scriptPubKey: 'a9146c9bf136fbb7305fd99d771a95127fcf87dedd0d87',
        scriptSig: '1600144b92ac4ac6fe6212393894addda332f2e47a3156',
        witness: [
            '3045022100a8c61b2d470e393279d1ba54f254b7c237de299580b7fa01ffcc940442ecec4502201afba952f4e4661c40acde7acc0341589031ba103a307b886eb867b23b850b97',
            '04782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c3799373233387c5343bf58e23269e903335b958a12182f9849297321e8d710e49a8727129cab',
        ],
        pubkey: null,
    },
];

export const other_invalid_fixtures: OutputScriptFixture[] = [
    {
        description: 'P2SH - 2 of 3 multisig',
        scriptPubKey: 'a9141044ddc6cea09e4ac40fbec2ba34ad62de6db25b87',
        scriptSig:
            '00493046022100ad79e6801dd9a8727f342f31c71c4912866f59dc6e7981878e92c5844a0ce929022100fb0d2393e813968648b9753b7e9871d90ab3d815ebf91820d704b19f4ed224d601483045022100a8c61b2d470e393279d1ba54f254b7c237de299580b7fa01ffcc940442ecec4502201afba952f4e4661c40acde7acc0341589031ba103a307b886eb867b23b850b97014c695221025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be52103782eeb913431ca6e9b8c2fd80a5f72ed2024ef72a3c6fb10263c3799373233382102e0ec4f64b3fa2e463ccfcf4e856e37d5e1e20275bc89ec1def9eb098eff1f85d53ae',
        witness: [],
        pubkey: null,
    },
];
