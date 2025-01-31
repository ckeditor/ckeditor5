/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import isEmojiSupported from '../../src/utils/isemojisupported.js';

describe( 'isEmojiSupported()', () => {
	it( 'should return true when emoji is supported', () => {
		expect( isEmojiSupported( '🙂' ) ).to.equal( true );
	} );
} );
