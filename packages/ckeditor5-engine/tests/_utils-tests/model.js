/**
 * @license Copyright (c) 2003-20'INSERT'6, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { getData } from '/tests/engine/_utils/model.js';
import Document from '/ckeditor5/engine/treemodel/document.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import Text from '/ckeditor5/engine/treemodel/text.js';
import Range from '/ckeditor5/engine/treemodel/range.js';

describe( 'model test utils', () => {
	let document, root, selection;

	beforeEach( () => {
		document = new Document();
		root = document.createRoot( 'main', '$root' );
		selection = document.selection;

		selection.removeAllRanges();
	} );

	describe( 'getData', () => {
		it( 'writes elements and texts', () => {
			root.appendChildren( [
				new Element( 'a', null, [ 'atext' ] ),
				new Element( 'b', null, [
					new Element( 'c1' ),
					'ctext',
					new Element( 'c2' )
				] ),
				new Element( 'd' )
			] );

			expect( getData( document, 'main' ) ).to.equal(
				'<a>atext</a><b><c1></c1>ctext<c2></c2></b><d></d>'
			);
		} );

		it( 'writes element attributes', () => {
			root.appendChildren(
				new Element( 'a', { foo: true, bar: 1, car: false }, [
					new Element( 'b', { fooBar: 'x y', barFoo: { x: 1, y: 2 } } )
				] )
			);

			// Note: attributes are written in a very simplistic way, because they are not to be parsed. They are just
			// to be compared in the tests with some patterns.
			expect( getData( document, 'main' ) ).to.equal(
				'<a bar=1 car=false foo=true><b barFoo={"x":1,"y":2} fooBar="x y"></b></a>'
			);
		} );

		it( 'writes text attributes', () => {
			root.appendChildren( [
				new Text( 'foo', { bold: true } ),
				'bar',
				new Text( 'bom', { bold: true, italic: true } ),
				new Element( 'a', null, [
					new Text( 'pom', { underline: true, bold: true } )
				] )
			] );

			expect( getData( document, 'main' ) ).to.equal(
				'<$text bold=true>foo</$text>' +
				'bar' +
				'<$text bold=true italic=true>bom</$text>' +
				'<a><$text bold=true underline=true>pom</$text></a>'
			);
		} );

		describe( 'options.selection', () => {
			let elA, elB;
			const options = { selection: true };

			beforeEach( () => {
				elA = new Element( 'a' );
				elB = new Element( 'b' );

				root.appendChildren( [
					elA,
					'foo',
					new Text( 'bar', { bold: true } ),
					elB
				] );
			} );

			it( 'writes selection collapsed in an element', () => {
				selection.collapse( root );

				expect( getData( document, 'main', options ) ).to.equal(
					'<selection /><a></a>foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed in a text', () => {
				selection.collapse( root, 3 );

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a>fo<selection />o<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text boundary', () => {
				selection.collapse( elA, 'AFTER' );

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a><selection />foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text boundary', () => {
				selection.collapse( elA, 'AFTER' );

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a><selection />foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the end of the root', () => {
				selection.collapse( root, 'END' );

				// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/320.
				selection.clearAttributes();

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a>foo<$text bold=true>bar</$text><b></b><selection />'
				);
			} );

			it( 'writes selection attributes', () => {
				selection.collapse( root );
				selection.setAttributesTo( { italic: true, bold: true } );

				expect( getData( document, 'main', options ) ).to.equal(
					'<selection bold=true italic=true /><a></a>foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed selection in a text with attributes', () => {
				selection.collapse( root, 5 );

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a>foo<$text bold=true>b<selection bold=true />ar</$text><b></b>'
				);
			} );

			it( 'writes flat selection containing couple of nodes', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 0, root, 4 )
				);

				expect( getData( document, 'main', options ) ).to.equal(
					'<selection><a></a>foo</selection><$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes flat selection within text', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 2, root, 3 )
				);

				expect( getData( document, 'main', options ) ).to.equal(
					'<a></a>f<selection>o</selection>o<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes multi-level selection', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 )
				);

				expect( getData( document, 'main', options ) ).to.equal(
					'<a><selection></a>foo<$text bold=true>bar</$text><b></selection></b>'
				);
			} );

			it( 'writes backward selection', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 ),
					true
				);

				expect( getData( document, 'main', options ) ).to.equal(
					'<a><selection backward></a>foo<$text bold=true>bar</$text><b></selection></b>'
				);
			} );
		} );
	} );
} );
