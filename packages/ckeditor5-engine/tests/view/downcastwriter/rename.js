/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '../../../src/view/downcastwriter.js';
import { parse } from '../../../src/dev-utils/view.js';
import Document from '../../../src/view/document.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'rename()', () => {
		let root, foo, writer;

		before( () => {
			writer = new DowncastWriter( new Document( new StylesProcessor() ) );
		} );

		beforeEach( () => {
			root = parse( '<container:div><container:foo foo="1">xxx</container:foo></container:div>' );

			foo = root.getChild( 0 );
		} );

		it( 'should rename given element by inserting a new element in the place of the old one', () => {
			const text = foo.getChild( 0 );

			writer.rename( 'bar', foo );

			const bar = root.getChild( 0 );

			expect( bar ).not.to.equal( foo );
			expect( bar.name ).to.equal( 'bar' );
			expect( bar.getAttribute( 'foo' ) ).to.equal( '1' );
			expect( bar.getChild( 0 ) ).to.equal( text );
		} );

		it( 'should return a reference to the inserted element', () => {
			const bar = writer.rename( 'bar', foo );

			expect( bar ).to.equal( root.getChild( 0 ) );
		} );
	} );
} );
