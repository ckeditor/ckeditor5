/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ListItemUid } from '../../../src/documentlist/utils/model';

/**
 * Mocks the `ListItemUid.next()` with sequential numbers.
 *
 * @param {Number} [start=0xa00] The uid start number.
 */
export default function stubUid( start = 0xa00 ) {
	const seq = sequence( start );

	sinon.stub( ListItemUid, 'next' ).callsFake( () => seq.next().value );
}

function* sequence( num ) {
	while ( true ) {
		yield ( num++ ).toString( 16 ).padStart( 3, '000' );
	}
}
