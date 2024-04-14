export const camelToSnakeCase = (inputString: string) => {
    return inputString
        .split('.')
        .map((string) => {
            return string.replace(/[A-Z]/g, (letter) => `_${letter}`);
        })
        .join('_')
        .toUpperCase();
};

export const extractPubKeyFromScript = (script: string): string | null => {
    throw new Error(
        `Not implemented! Cannot extract public key from script: ${script}`,
    );
};
