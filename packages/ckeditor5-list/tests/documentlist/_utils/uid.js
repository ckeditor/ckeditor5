/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Mocks the `uid()` with sequential numbers.
 *
 * @param {Number} [start=0] The uid start number.
 */
export default function stubUid( start = 0 ) {
	const seq = sequence( start );

	sinon.stub( Math, 'random' ).callsFake( () => seq.next().value );
}

function* sequence( start ) {
	let num = start << 2;

	while ( true ) {
		if ( num % 4 == 3 ) {
			const flipped =
				( num >> 2 & 0xff000000 ) >>> 24 |
				( num >> 2 & 0x00ff0000 ) >> 8 |
				( num >> 2 & 0x0000ff00 ) << 8 |
				( num >> 2 & 0x000000ff ) << 24;

			yield flipped / 0xffffffff;
		} else {
			yield 0;
		}

		num++;
	}
}
