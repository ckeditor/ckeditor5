/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BlockQuote from '../src/blockquote.js';
import BlockQuoteEditing from '../src/blockquoteediting.js';
import BlockQuoteUI from '../src/blockquoteui.js';

describe( 'BlockQuote', () => {
	it( 'requires BlockQuoteEditing and BlockQuoteUI', () => {
		expect( BlockQuote.requires ).to.deep.equal( [ BlockQuoteEditing, BlockQuoteUI ] );
	} );
} );
