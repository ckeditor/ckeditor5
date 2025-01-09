/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/uid
 */

/**
 * A hash table of hex numbers to avoid using toString() in uid() which is costly.
 * [ '00', '01', '02', ..., 'fe', 'ff' ]
 */
const HEX_NUMBERS = new Array( 256 ).fill( '' )
	.map( ( _, index ) => ( '0' + ( index ).toString( 16 ) ).slice( -2 ) );

/**
 * Returns a unique id. The id starts with an "e" character and a randomly generated string of
 * 32 alphanumeric characters.
 *
 * **Note**: The characters the unique id is built from correspond to the hex number notation
 * (from "0" to "9", from "a" to "f"). In other words, each id corresponds to an "e" followed
 * by 16 8-bit numbers next to each other.
 *
 * @returns An unique id string.
 */
export default function uid(): string {
	// Let's create some positive random 32bit integers first.
	const [ r1, r2, r3, r4 ] = crypto.getRandomValues( new Uint32Array( 4 ) );

	// Make sure that id does not start with number.
	return 'e' +
		HEX_NUMBERS[ r1 >> 0 & 0xFF ] +
		HEX_NUMBERS[ r1 >> 8 & 0xFF ] +
		HEX_NUMBERS[ r1 >> 16 & 0xFF ] +
		HEX_NUMBERS[ r1 >> 24 & 0xFF ] +
		HEX_NUMBERS[ r2 >> 0 & 0xFF ] +
		HEX_NUMBERS[ r2 >> 8 & 0xFF ] +
		HEX_NUMBERS[ r2 >> 16 & 0xFF ] +
		HEX_NUMBERS[ r2 >> 24 & 0xFF ] +
		HEX_NUMBERS[ r3 >> 0 & 0xFF ] +
		HEX_NUMBERS[ r3 >> 8 & 0xFF ] +
		HEX_NUMBERS[ r3 >> 16 & 0xFF ] +
		HEX_NUMBERS[ r3 >> 24 & 0xFF ] +
		HEX_NUMBERS[ r4 >> 0 & 0xFF ] +
		HEX_NUMBERS[ r4 >> 8 & 0xFF ] +
		HEX_NUMBERS[ r4 >> 16 & 0xFF ] +
		HEX_NUMBERS[ r4 >> 24 & 0xFF ];
}
