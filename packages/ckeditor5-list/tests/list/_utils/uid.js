/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi } from 'vitest';

import { ListItemUid } from '../../../src/list/utils/model.js';

/**
 * Mocks the `ListItemUid.next()` with sequential numbers.
 *
 * @param {Number} [start=0xa00] The uid start number.
 */
export function stubUid( start = 0xa00 ) {
	const seq = sequence( start );

	vi.spyOn( ListItemUid, 'next' ).mockImplementation( () => seq.next().value );
}

function* sequence( num ) {
	while ( true ) {
		yield ( num++ ).toString( 16 ).padStart( 3, '000' );
	}
}
