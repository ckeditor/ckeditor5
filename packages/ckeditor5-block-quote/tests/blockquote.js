/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockQuote from '../src/blockquote';
import BlockQuoteEditing from '../src/blockquoteediting';
import BlockQuoteUI from '../src/blockquoteui';

describe( 'BlockQuote', () => {
	it( 'requires BlockQuoteEditing and BlockQuoteUI', () => {
		expect( BlockQuote.requires ).to.deep.equal( [ BlockQuoteEditing, BlockQuoteUI ] );
	} );
} );
