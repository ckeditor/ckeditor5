/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/crc32
 */

/**
 * Generates a CRC lookup table.
 * This function creates and returns a 256-element array of pre-computed CRC values for quick CRC calculation.
 * It uses the polynomial 0xEDB88320 to compute each value in the loop, optimizing future CRC calculations.
 */
function makeCrcTable(): Array<number> {
	const crcTable: Array<number> = [];

	for ( let n = 0; n < 256; n++ ) {
		let c: number = n;

		for ( let k = 0; k < 8; k++ ) {
			if ( c & 1 ) {
				c = 0xEDB88320 ^ ( c >>> 1 );
			} else {
				c = c >>> 1;
			}
		}

		crcTable[ n ] = c;
	}

	return crcTable;
}

/**
 * Calculates CRC-32 checksum for a given inputData to verify the integrity of data.
 *
 * @param inputData Accepts a single value (string, number, boolean), an array of strings, or an array of all of the above types.
 * Non-string values are converted to strings before calculating the checksum.
 * The checksum calculation is based on the concatenated string representation of the input values:
 * * `crc32('foo')` is equivalent to `crc32(['foo'])`
 * * `crc32(123)` is equivalent to `crc32(['123'])`
 * * `crc32(true)` is equivalent to `crc32(['true'])`
 * * `crc32(['foo', 123, true])` produces the same result as `crc32('foo123true')`
 * * Nested arrays of strings are flattened, so `crc32([['foo', 'bar'], 'baz'])` is equivalent to `crc32(['foobar', 'baz'])`
 *
 * @returns The CRC-32 checksum, returned as a hexadecimal string.
 */
export default function crc32( inputData: CRCData ): string {
	const dataArray = Array.isArray( inputData ) ? inputData : [ inputData ];
	const crcTable: Array<number> = makeCrcTable();
	let crc: number = 0 ^ ( -1 );

	// Convert data to a single string.
	const dataString: string = dataArray.map( item => {
		if ( Array.isArray( item ) ) {
			return item.join( '' );
		}

		return String( item );
	} ).join( '' );

	// Calculate the CRC for the resulting string.
	for ( let i = 0; i < dataString.length; i++ ) {
		const byte: number = dataString.charCodeAt( i );
		crc = ( crc >>> 8 ) ^ crcTable[ ( crc ^ byte ) & 0xFF ];
	}

	crc = ( crc ^ ( -1 ) ) >>> 0; // Force unsigned integer.

	return crc.toString( 16 ).padStart( 8, '0' );
}

/**
 * The input data for the CRC-32 checksum calculation.
 * Can be a single value (string, number, boolean), an array of strings, or an array of all of the above types.
 */
export type CRCData = CRCValue | Array<CRCValue>;

type CRCValue = string | number | boolean | Array<string>;
