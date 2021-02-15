const SMALLEST_B64_CHAR_CODE = 45; // "-".charCodeAt(0) === 45

function chunkString(numeric: string, chunk_size: number): string[] {
    const array = numeric.split('');
    const arrayLength = array.length;
    let tempArray = [];
    if (arrayLength % chunk_size !== 0) {
        throw new Error(`Cannot parse array of length ${arrayLength} into parts of length ${chunk_size}`);
    }

    for (let index = 0; index < arrayLength; index += chunk_size) {
        const myChunk = array.slice(index, index + chunk_size);
        tempArray.push(myChunk.join(''));
    }

    return tempArray;
}

export function encodeToNumeric(jws: string): number[] {
    return jws
        .split("")
        .map(c => c.charCodeAt(0) - SMALLEST_B64_CHAR_CODE)
        .flatMap(c => [
            Math.floor(c / 10),
            c % 10
        ]);
}

/**
 * Converts a numericly encoded string (Ord 45) to an ascii string.
 * Rough algorithm:
 * 1. Split string by every 2nd character. Will error when length is not divisible by 2 
 * 2. Cast string to a 2 digit integer with validation. May throw an error.
 * 3. Map the integers to character codes
 * 4. Join the mapped characters into JWS string
 */
export function decodeFromNumeric(numeric: string): string {
    /**
     * Function checks that parsed whole number matches the original string.
     * Throws a validation error if found
     */
    function parserCheck(str: string, num: number, radix: number) {
        const checkString = (str.startsWith('0')) ? str.substring(1) : str;
        if (checkString !== num.toString(radix)) {
            throw new Error(`Numeric decoding error. ${str} should be a two digit whole number`);
        }
    }
    return chunkString(numeric, 2).map((str) => {
        const RADIX = 10;
        const int = parseInt(str, RADIX);
        if (int < 0) {
            throw new Error(`Character code '${int}' encountered. Codes must be >0`);
        }
        parserCheck(str, int, RADIX);
        return String.fromCharCode(int + SMALLEST_B64_CHAR_CODE);
    }).join('');
}