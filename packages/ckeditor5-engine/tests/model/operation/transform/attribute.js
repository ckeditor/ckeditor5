/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Client, syncClients, expectClients, clearBuffer } from './utils.js';

describe( 'transform', () => {
	let john, kate;

	beforeEach( () => {
		return Promise.all( [
			Client.get( 'john' ).then( client => ( john = client ) ),
			Client.get( 'kate' ).then( client => ( kate = client ) )
		] );
	} );

	afterEach( () => {
		clearBuffer();

		return Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'attribute', () => {
		describe( 'by attribute', () => {
			it( 'in text at same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foo</$text> <$text italic="true">Bar</$text></paragraph>' );
			} );

			it( 'in text at same path, then undo', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();
				expectClients( '<paragraph><$text bold="true">Foo</$text> <$text italic="true">Bar</$text></paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<paragraph>Foo <$text italic="true">Bar</$text></paragraph>' );
			} );

			it( 'in text in different path', () => {
				john.setData( '<paragraph>F[o]o</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[a]r</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients(
					'<paragraph>F<$text bold="true">o</$text>o</paragraph>' +
					'<paragraph>B<$text italic="true">a</$text>r</paragraph>'
				);
			} );

			it( 'in text with selection inside other client\'s selection #1', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<$text bold="true">Fo</$text><$text bold="true" italic="true">o B</$text><$text bold="true">ar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'in text with selection inside other client\'s selection #2', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients(
					'<paragraph>' +
						'F' +
						'<$text bold="true">oo </$text>' +
						'<$text bold="true" italic="true">Ba</$text>' +
						'<$text italic="true">r</$text>' +
					'</paragraph>'
				);
			} );

			it( 'in text with selection inside other client\'s selection #3', () => {
				john.setData( '<paragraph><$text bold="true">[Foo Bar]</$text></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">Fo[o] Bar</$text></paragraph>' );

				john.setAttribute( 'italic', true );
				kate.setAttribute( 'underline', true );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<$text bold="true" italic="true">Fo</$text>' +
						'<$text bold="true" italic="true" underline="true">o</$text>' +
						'<$text bold="true" italic="true"> Bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'in text at same position', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients( '<paragraph><$text bold="true" italic="true">Foo Bar</$text></paragraph>' );
			} );

			it( 'in element at same position', () => {
				john.setData( '[<paragraph>Foo Bar</paragraph>]' );
				kate.setData( '[<paragraph>Foo Bar</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients( '<paragraph bold="true" italic="true">Foo Bar</paragraph>' );
			} );

			it( 'in collapsed selection', () => {
				john.setData( '<paragraph>F[]oo Bar</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setAttribute( 'italic', true );

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );

			it( 'in same range, then change attribute', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.setAttribute( 'attr', 'foo' );
				kate.setAttribute( 'attr', 'bar' );

				syncClients();

				expectClients( '<paragraph><$text attr="foo">Foo Bar</$text></paragraph>' );

				kate.setAttribute( 'attr', 'bar' );

				syncClients();

				expectClients( '<paragraph><$text attr="bar">Foo Bar</$text></paragraph>' );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/6265
			it( 'on elements on different but intersecting "levels"', () => {
				john.setData( '[<table><tableRow><tableCell><paragraph>Foo</paragraph></tableCell></tableRow></table>]' );
				kate.setData( '<table><tableRow>[<tableCell><paragraph>Foo</paragraph></tableCell>]</tableRow></table>' );

				john.setAttribute( 'attr', 'foo' );
				kate.setAttribute( 'attr', 'bar' );

				syncClients();

				expectClients(
					'<table attr="foo"><tableRow><tableCell attr="bar"><paragraph>Foo</paragraph></tableCell></tableRow></table>'
				);
			} );
		} );

		describe( 'by insert', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[]Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'Abc' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foo</$text></paragraph><paragraph>AbcBar</paragraph>' );
			} );

			it( 'text in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[]Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'Abc' );

				syncClients();

				expectClients( '<paragraph bold="true">Foo</paragraph><paragraph>AbcBar</paragraph>' );
			} );

			it( 'text at same path', () => {
				john.setData( '<paragraph>[F]oo</paragraph>' );
				kate.setData( '<paragraph>Foo[]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'Abc' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">F</$text>ooAbc</paragraph>' );
			} );

			it( 'text inside other client\'s selection', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'Abc' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">FoAbco</$text></paragraph>' );
			} );

			it( 'element between changed elements', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.insert( '<paragraph>Abc</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<paragraph>Abc</paragraph>' +
					'<paragraph bold="true">Bar</paragraph>'
				);
			} );

			it( 'text between changed nodes', () => {
				john.setData( '<paragraph>[Foo</paragraph><paragraph>Bar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'Abc' );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph><$text bold="true">BAbcar</$text></paragraph>'
				);
			} );

			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]' );

				john.setAttribute( 'bold', true );
				kate.insert( '<paragraph>Abc</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it( 'element in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]' );

				john.setAttribute( 'bold', true );
				kate.insert( '<paragraph>Abc</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '<paragraph>[]Foo</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.type( 'Abc' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>AbcFoo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '<paragraph>[]Foo</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.type( 'Abc' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>AbcFoo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'remove attribute from text while typing in client\'s range', () => {
				john.setData( '<paragraph>F<$text bold="true">o[]o</$text></paragraph>' );
				kate.setData( '<paragraph>F<$text bold="true">[oo]</$text></paragraph>' );

				john.type( 'Bar' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>FoBaro</paragraph>' );
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '<paragraph bold="true">[]Foo</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.type( 'Bar' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>BarFoo</paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes while typing in client\'s range', () => {
				john.setData( '<paragraph>F<$text bold="true" italic="true">o[]o</$text></paragraph>' );
				kate.setData( '<paragraph>F<$text bold="true" italic="true">[oo]</$text></paragraph>' );

				john.type( 'Bar', john.document.selection.getAttributes() );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>F<$text italic="true">oBaro</$text></paragraph>' );
			} );

			it( 'multiple typing', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph>' );

				john.setAttribute( 'bold', true );

				kate.setSelection( [ 0, 2 ] );
				kate.type( 'x' );
				kate.setSelection( [ 0, 3 ] );
				kate.type( 'x' );
				kate.setSelection( [ 0, 4 ] );
				kate.type( 'x' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foxxxo</$text></paragraph>' );
			} );

			it( 'type inside element which attribute changes', () => {
				john.setData( '[<paragraph></paragraph>]' );
				kate.setData( '<paragraph>[]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.type( 'x' );

				syncClients();

				expectClients( '<paragraph bold="true">x</paragraph>' );
			} );
		} );

		describe( 'by move', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'text in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 0, 4 ] );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foo</$text> arB</paragraph>' );
			} );

			it( 'text to other client\'s selection', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 0, 1 ] );

				syncClients();

				expectClients( '<paragraph><$text bold="true">F</$text>Bar<$text bold="true">oo</$text> </paragraph>' );
			} );

			it( 'text from other client\'s selection', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>F[oo] Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 0, 7 ] );

				syncClients();

				expectClients( '<paragraph><$text bold="true">F</$text> Bar<$text bold="true">oo</$text></paragraph>' );
			} );

			it( 'text from other client\'s selection #2', () => {
				john.setData( '[<paragraph>Foo Bar</paragraph>]' );
				kate.setData( '<paragraph>F[oo] Bar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.move( [ 0, 7 ] );

				syncClients();

				expectClients( '<paragraph bold="true">F Baroo</paragraph>' );
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.move( [ 1, 0 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>ooBar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.move( [ 1, 0 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>ooBar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.move( [ 0, 3 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>oFo</paragraph>' );
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '<paragraph bold="true">[Fo]o</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.move( [ 0, 3 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>oFo</paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true" italic="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.move( [ 0, 3 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text italic="true">o</$text>Fo</paragraph>' );
			} );

			it( 'remove attribute from text in other user\'s selection', () => {
				john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph><paragraph></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph><paragraph></paragraph>' );

				john.move( [ 1, 0 ] );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element into blockQuote in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);
			} );

			it( 'element into blockQuote in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);
			} );

			it( 'element into blockQuote in same path #1', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element into blockQuote in same path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph bold="true">Foo</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.wrap( 'blockQuote' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path', () => {
				john.setData( '[<paragraph>Fo<$text bold="true">o</$text></paragraph>]' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.wrap( 'blockQuote' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '[<paragraph bold="true">Foo</paragraph>]' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path', () => {
				john.setData( '[<paragraph>Fo<$text bold="true" italic="true">o</$text></paragraph>]' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.wrap( 'blockQuote' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Fo<$text italic="true">o</$text></paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'element in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'element in same path #1', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foo</$text></paragraph>' );
			} );

			it( 'element in same path #2', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph bold="true">Foo</paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.setAttribute( 'bold', true );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote><$text bold="true">Foo</$text></blockQuote>' );
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData(
					'<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' +
					'<paragraph bold="true">Bar</paragraph>' );
				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'[<paragraph bold="true">Bar</paragraph>]' );

				john.unwrap();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData(
					'<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' +
					'<paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.unwrap();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<blockQuote>Foo</blockQuote>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path', () => {
				john.setData( '<blockQuote><paragraph>[]Fo<$text bold="true">o</$text></paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Fo<$text bold="true">[o]</$text></paragraph></blockQuote>' );

				john.unwrap();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '<blockQuote><paragraph bold="true">[]Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph bold="true">Foo</paragraph>]</blockQuote>' );

				john.unwrap();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path', () => {
				john.setData( '<blockQuote><paragraph>[]Fo<$text bold="true" italic="true">o</$text></paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph></blockQuote>' );

				john.unwrap();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<blockQuote>Fo<$text italic="true">o</$text></blockQuote>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Ba[]r</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>Ba</paragraph>' +
					'<paragraph>r</paragraph>'
				);
			} );

			it( 'text in different path #2', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Ba[]r</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo</paragraph>' +
					'<paragraph>Ba</paragraph>' +
					'<paragraph>r</paragraph>'
				);
			} );

			it( 'text in same path #1', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[]ar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text> B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.split();

				syncClients();

				expect(
					'<paragraph><$text bold="true">Fo</$text></paragraph>' +
					'<paragraph><$text bold="true">o</$text></paragraph>'
				);
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '[<paragraph>Foo Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo B[]ar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph bold="true">Foo B</paragraph>' +
					'<paragraph bold="true">ar</paragraph>'
				);
			} );

			it( 'text while changing attribute', () => {
				john.setData( '<paragraph><$text attr="foo">Foo B[ar]</$text></paragraph>' );
				kate.setData( '<paragraph><$text attr="foo">Foo B[]ar</$text></paragraph>' );

				john.setAttribute( 'attr', 'bar' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><$text attr="foo">Foo B</$text></paragraph>' +
					'<paragraph><$text attr="bar">ar</$text></paragraph>'
				);
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path #1', () => {
				john.setData( '<paragraph>F[]o<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' );
			} );

			it( 'remove attribute from text in same path #2', () => {
				john.setData( '<paragraph>F<$text bold="true">o[]o</$text></paragraph>' );
				kate.setData( '<paragraph>F<$text bold="true">[oo]</$text></paragraph>' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>Fo</paragraph>' +
					'<paragraph>o</paragraph>' );
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '<paragraph bold="true">F[]oo</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path', () => {
				john.setData( '<paragraph>F<$text bold="true" italic="true">o[]o</$text></paragraph>' );
				kate.setData( '<paragraph>F<$text bold="true" italic="true">[oo]</$text></paragraph>' );

				john.split();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F<$text italic="true">o</$text></paragraph>' +
					'<paragraph><$text italic="true">o</$text></paragraph>'
				);
			} );
		} );

		describe( 'by remove', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Fo]o</paragraph>' );
				kate.setData( '<paragraph>Fo[o]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.remove();

				syncClients();

				expectClients( '<paragraph><$text bold="true">Fo</$text></paragraph>' );
			} );

			it( 'text in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>F[oo]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.remove();

				syncClients();

				expectClients( '<paragraph><$text bold="true">F</$text></paragraph>' );
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path #1', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>o</paragraph>' );
			} );

			it( 'remove attribute from text in same path #2', () => {
				john.setData( '<paragraph>F[o<$text bold="true">o]z</$text>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[oz]</$text>Bar</paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>FzBar</paragraph>'
				);
			} );

			it( 'remove attribute from element in same path', () => {
				john.setData( '<paragraph bold="true">[Fo]o</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph>o</paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path #1', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true" italic="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text italic="true">o</$text></paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path #2', () => {
				john.setData( '<paragraph>F[o<$text bold="true" italic="true">o]z</$text>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[oz]</$text>Bar</paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F<$text italic="true">z</$text>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in other user\'s selection', () => {
				john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );
		} );

		describe( 'by remove attribute', () => {
			it( 'from element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.setAttribute( 'bold', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'from text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.setAttribute( 'bold', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph><$text bold="true">Foo</$text></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'from text in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.setAttribute( 'bold', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Fo</$text>o</paragraph>' );
			} );

			it( 'from element in same path', () => {
				john.setData( '<paragraph bold="true">[Fo]o</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.setAttribute( 'italic', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text italic="true">Fo</$text>o</paragraph>' );
			} );

			it( 'from text with 2 attributes in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true" italic="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.setAttribute( 'bold', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Fo</$text><$text italic="true">o</$text></paragraph>' );
			} );

			it( 'from text in other user\'s selection', () => {
				john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );

				john.setAttribute( 'italic', true );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><$text italic="true">Foo</$text></paragraph>' );
			} );
		} );

		describe( 'by marker', () => {
			it( 'in text at same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients( '<paragraph><$text bold="true">Foo</$text> <m1:start></m1:start>Bar<m1:end></m1:end></paragraph>' );
			} );

			it( 'in text at same path #2', () => {
				john.setData( '[<paragraph>Foo Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph bold="true">' +
						'Foo <m1:start></m1:start>Bar<m1:end></m1:end>' +
					'</paragraph>'
				);
			} );

			it( 'in text in different path', () => {
				john.setData( '<paragraph>F[o]o</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[a]r</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph>F<$text bold="true">o</$text>o</paragraph>' +
					'<paragraph>B<m1:start></m1:start>a<m1:end></m1:end>r</paragraph>'
				);
			} );

			it( 'in text with selection inside other client\'s selection #1', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<$text bold="true">Fo<m1:start></m1:start>o B<m1:end></m1:end>ar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'in text with selection inside other client\'s selection #2', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'F<$text bold="true">oo <m1:start></m1:start>Ba</$text>r<m1:end></m1:end>' +
					'</paragraph>'
				);
			} );

			it( 'in text at same position', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.setAttribute( 'bold', true );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start><$text bold="true">Foo Bar</$text><m1:end></m1:end></paragraph>' );
			} );

			it( 'remove attribute from element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'remove attribute from text in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Fo<m1:end></m1:end>o</paragraph>' );
			} );

			it( 'remove attribute from text in same path, then undo', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				kate.undo();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Fo<m1:end></m1:end><$text bold="true">o</$text></paragraph>' );
			} );

			it( 'remove attribute from text with 2 attributes in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true" italic="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Fo<m1:end></m1:end><$text italic="true">o</$text></paragraph>' );
			} );

			it( 'remove attribute from text in other user\'s selection', () => {
				john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );

				john.setMarker( 'm1' );
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.setAttribute( 'bold', 'true' );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooB<$text bold="true">ar</$text></paragraph>' );
			} );

			it( 'element into paragraph #2, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.setAttribute( 'bold', 'true' );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );

				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph bold="true">Bar</paragraph>' );
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[<paragraph>Baz</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph><paragraph>Baz</paragraph>' );

				john.setAttribute( 'bold', 'true' );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph><paragraph bold="true">Baz</paragraph>' );

				kate.undo();
				john.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Baz</paragraph>' );
			} );
		} );
	} );

	describe( 'by rename', () => {
		it( 'element in different path', () => {
			john.setData( '<paragraph>Foo</paragraph><paragraph>[Ba]r</paragraph>' );
			kate.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );

			john.setAttribute( 'bold', true );
			kate.rename( 'heading1' );

			syncClients();

			expectClients(
				'<heading1>Foo</heading1>' +
				'<paragraph><$text bold="true">Ba</$text>r</paragraph>'
			);
		} );

		it( 'element in same path', () => {
			john.setData( '<paragraph>[Foo Bar]</paragraph>' );
			kate.setData( '<paragraph>[]Foo Bar</paragraph>' );

			john.setAttribute( 'bold', true );
			kate.rename( 'heading1' );

			syncClients();

			expectClients( '<heading1><$text bold="true">Foo Bar</$text></heading1>' );
		} );

		it( 'element in user\'s selection', () => {
			john.setData( '<paragraph>[Foo]</paragraph>' );
			kate.setData( '<paragraph>[Foo]</paragraph>' );

			john.setAttribute( 'bold', true );
			kate.rename( 'heading1' );

			syncClients();

			expectClients( '<heading1><$text bold="true">Foo</$text></heading1>' );
		} );

		it( 'element in user\'s selection, then undo', () => {
			john.setData( '<paragraph>[Foo]</paragraph>' );
			kate.setData( '<paragraph>[Foo]</paragraph>' );

			john.setAttribute( 'bold', true );
			kate.rename( 'heading1' );

			syncClients();

			john.undo();
			kate.undo();

			syncClients();

			expectClients( '<paragraph>Foo</paragraph>' );
		} );

		it( 'remove attribute from element in different path', () => {
			john.setData( '<paragraph>F[]oo</paragraph><paragraph bold="true">Bar</paragraph>' );
			kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients(
				'<heading1>Foo</heading1>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'remove attribute from text in different path', () => {
			john.setData( '<paragraph>F[]oo</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
			kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients(
				'<heading1>Foo</heading1>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'remove attribute from text in same path', () => {
			john.setData( '<paragraph>F[]o<$text bold="true">o</$text></paragraph>' );
			kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients( '<heading1>Foo</heading1>' );
		} );

		it( 'remove attribute from element in same path', () => {
			john.setData( '<paragraph bold="true">F[]oo</paragraph>' );
			kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients( '<heading1>Foo</heading1>' );
		} );

		it( 'remove attribute from text with 2 attributes in same path', () => {
			john.setData( '<paragraph>F[o]<$text bold="true" italic="true">o</$text></paragraph>' );
			kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients( '<heading1>Fo<$text italic="true">o</$text></heading1>' );
		} );

		it( 'remove attribute from text in other user\'s selection', () => {
			john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );
			kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );

			john.rename( 'heading1' );
			kate.removeAttribute( 'bold' );

			syncClients();

			expectClients( '<heading1>Foo</heading1>' );
		} );
	} );
} );
