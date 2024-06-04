import { extractPubKeyFromScript } from '@/common/common';
import {
    OutputScriptFixture,
    p2pkh_invalid_fixtures,
    p2pkh_valid_fixtures,
    p2sh_p2wpkh_invalid_fixtures,
    p2sh_p2wpkh_valid_fixtures,
    p2tr_invalid_fixtures,
    p2tr_valid_fixtures,
    p2wpkh_valid_fixtures,
} from '@/common/test_fixtures';

describe('Common', () => {
    const extractPubKey = (output: OutputScriptFixture): string => {
        const { scriptPubKey, scriptSig, witness } = output;
        const computedPubKey = extractPubKeyFromScript(
            Buffer.from(scriptPubKey, 'hex'),
            Buffer.from(scriptSig, 'hex'),
            witness.map((w) => Buffer.from(w, 'hex')),
        );
        return computedPubKey ? computedPubKey.toString('hex') : null;
    };

    describe('extractPubKeyFromScript', () => {
        it(`should process P2PKH script accurately `, () => {
            // verify the valid outputs are parsed
            for (const outputScript of p2pkh_valid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(outputScript.pubkey);
            }

            // verify that malleability dosn't affect pubkey derivation
            const non_malleanated_output = p2pkh_valid_fixtures[4];
            const malleanated_output = p2pkh_valid_fixtures[5];

            const computed_non_malleanated_output = extractPubKey(
                non_malleanated_output,
            );
            const computed_malleanated_output =
                extractPubKey(malleanated_output);
            expect(computed_non_malleanated_output).toEqual(
                computed_malleanated_output,
            );

            // verify that invalid output aren't parsed
            for (const outputScript of p2pkh_invalid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(null);
            }
        });

        it(`should process P2TR script accurately `, () => {
            // verify the valid outputs are parsed
            for (const outputScript of p2tr_valid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(outputScript.pubkey);
            }

            // verify that pubkeys aren't derived for output with presence of NUMS_H
            for (const outputScript of p2tr_invalid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(null);
            }
        });

        it(`should process P2SH-P2WPKH script accurately `, () => {
            // verify the valud outputs are parsed
            for (const outputScript of p2sh_p2wpkh_valid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(outputScript.pubkey);
            }

            // verify that invalid output which are cause due to the presence of uncompressed keys aren't parsed
            for (const outputScript of p2sh_p2wpkh_invalid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(null);
            }
        });

        it(`should process P2WPKH script accurately `, () => {
            // verify the valid outputs are parsed
            for (const outputScript of p2wpkh_valid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(outputScript.pubkey);
            }

            // verify that invalid output which are cause due to the presence of uncompressed keys aren't parsed
            for (const outputScript of p2sh_p2wpkh_invalid_fixtures) {
                const computedPubKey = extractPubKey(outputScript);
                expect(computedPubKey).toEqual(null);
            }
        });
    });
});
