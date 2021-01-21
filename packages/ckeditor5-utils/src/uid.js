/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/uid
 */

// A hash table of hex numbers to avoid using toString() in uid() which is costly.
// [ '00', '01', '02', ..., 'fe', 'ff' ]
const HEX_NUMBERS = new Array( 256 ).fill()
	.map( ( val, index ) => ( '0' + ( index ).toString( 16 ) ).slice( -2 ) );

/**
 * Returns a unique id. The id starts with an "e" character and a randomly generated string of
 * 32 alphanumeric characters.
 *
 * **Note**: The characters the unique id is built from correspond to the hex number notation
 * (from "0" to "9", from "a" to "f"). In other words, each id corresponds to an "e" followed
 * by 16 8-bit numbers next to each other.
 *
 * @returns {String} An unique id string.
 */
export default function uid() {
	// Let's create some positive random 32bit integers first.
	//
	// 1. Math.random() is a float between 0 and 1.
	// 2. 0x100000000 is 2^32 = 4294967296.
	// 3. >>> 0 enforces integer (in JS all numbers are floating point).
	//
	// For instance:
	//		Math.random() * 0x100000000 = 3366450031.853859
	// but
	//		Math.random() * 0x100000000 >>> 0 = 3366450031.
	const r1 = Math.random() * 0x100000000 >>> 0;
	const r2 = Math.random() * 0x100000000 >>> 0;
	const r3 = Math.random() * 0x100000000 >>> 0;
	const r4 = Math.random() * 0x100000000 >>> 0;

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
