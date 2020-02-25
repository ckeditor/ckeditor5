/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DowncastWriter from '../../../src/view/downcastwriter';
import { parse } from '../../../src/dev-utils/view';
import Document from '../../../src/view/document';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'DowncastWriter', () => {
	let stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
	} );

	describe( 'rename()', () => {
		let root, foo, writer;

		before( () => {
			writer = new DowncastWriter( new Document( stylesProcessor ) );
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
