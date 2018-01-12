/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Writer from '../../../src/view/writer';
import { parse } from '../../../src/dev-utils/view';

describe( 'Writer', () => {
	describe( 'rename()', () => {
		let root, foo, writer;

		before( () => {
			writer = new Writer();
		} );

		beforeEach( () => {
			root = parse( '<container:div><container:foo foo="1">xxx</container:foo></container:div>' );

			foo = root.getChild( 0 );
		} );

		it( 'should rename given element by inserting a new element in the place of the old one', () => {
			const text = foo.getChild( 0 );

			writer.rename( foo, 'bar' );

			const bar = root.getChild( 0 );

			expect( bar ).not.to.equal( foo );
			expect( bar.name ).to.equal( 'bar' );
			expect( bar.getAttribute( 'foo' ) ).to.equal( '1' );
			expect( bar.getChild( 0 ) ).to.equal( text );
		} );

		it( 'should return a reference to the inserted element', () => {
			const bar = writer.rename( foo, 'bar' );

			expect( bar ).to.equal( root.getChild( 0 ) );
		} );
	} );
} );
