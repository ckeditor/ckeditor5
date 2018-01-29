/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Writer from '../../../src/view/writer';
import Document from '../../../src/view/document';
import Text from '../../../src/view/text';

describe( 'Writer', () => {
	let writer;

	before( () => {
		writer = new Writer( new Document() );
	} );

	describe( 'createText()', () => {
		it( 'should create Text instance', () => {
			const text = writer.createText( 'foo bar' );

			expect( text ).to.be.instanceOf( Text );
			expect( text.data ).to.equal( 'foo bar' );
		} );
	} );
} );
