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

	describe( 'split', () => {
		describe( 'by wrap', () => {
			it( 'split inside wrapped element', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>F</paragraph>' +
						'<paragraph>oo</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'split inside wrapped element, then undo', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();

				kate.undo();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>'
				);
			} );

			it( 'element in same path, then undo', () => {
				// This is pretty weird case. Right now it cannot be reproduced with the features that we have.
				john.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				john.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				kate.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				kate.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				john.setData( '<listItem><paragraph>A</paragraph>[]<paragraph>B</paragraph><paragraph>C</paragraph></listItem>' );
				kate.setData( '<listItem><paragraph>A</paragraph><paragraph>B</paragraph>[<paragraph>C</paragraph>]</listItem>' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();
				expectClients(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
					'</listItem>' +
					'<listItem>' +
						'<paragraph>B</paragraph>' +
						'<blockQuote>' +
							'<paragraph>C</paragraph>' +
						'</blockQuote>' +
					'</listItem>'
				);

				john.undo();
				kate.undo();

				syncClients();

				expectClients(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
						'<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>' +
					'</listItem>'
				);
			} );

			it( 'multiple elements', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>F</paragraph>' +
						'<paragraph>oo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'multiple elements, then undo', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'intersecting wrap', () => {
				john.setData( '<paragraph>Fo[]o</paragraph>' );
				kate.setData( '<paragraph>F[oo]</paragraph>' );

				john.split();
				kate.wrap( 'blockQuote' );

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Fo</paragraph>' +
				// 	'<paragraph>o</paragraph>'
				// );

				expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'element in same position', () => {
				john.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();
				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'element in same path, then undo', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'element in same path, then undo both', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'text in same path, then undo', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'multiple elements', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]</blockQuote>' );

				john.split();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );
		} );

		describe( 'by split', () => {
			it( 'text in same path #1', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>o</paragraph>' +
					'<paragraph>o</paragraph>'
				);
			} );

			it( 'text in same path #2', () => {
				john.setData( '<paragraph>[]Foo</paragraph>' );
				kate.setData( '<paragraph>Foo[]</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'text in same position', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>'
				);
			} );

			it( 'text in same position, then undo', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'text in same position, then undo and redo', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				john.undo();

				syncClients();

				kate.undo();
				kate.redo();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>Fo[]o</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>Fo</paragraph>' +
					'<paragraph>oBar</paragraph>'
				);
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'element into paragraph #3', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'element into paragraph #4', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();
				expectClients(
					'<paragraph>FooB</paragraph>' +
					'<paragraph>ar</paragraph>'
				);

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'element into heading', () => {
				john.setData( '<heading1>Foo</heading1><paragraph>B[]ar</paragraph>' );
				kate.setData( '<heading1>Foo</heading1>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();
				expectClients(
					'<heading1>FooB</heading1>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'element into heading with undo #1', () => {
				john.setData( '<heading1>Foo</heading1><paragraph>B[]ar</paragraph>' );
				kate.setData( '<heading1>Foo</heading1>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();

				syncClients();
				expectClients(
					'<heading1>FooB</heading1>' +
					'<paragraph>ar</paragraph>'
				);

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<heading1>Foo</heading1><paragraph>Bar</paragraph>' );
			} );

			it( 'element into heading with undo #2', () => {
				john.setData( '<heading1>Foo</heading1><paragraph>B[]ar</paragraph>' );
				kate.setData( '<heading1>Foo</heading1>[]<paragraph>Bar</paragraph>' );

				john.split();
				kate.merge();
				kate.undo();

				syncClients();
				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );
		} );

		describe( 'by delete', () => {
			it( 'text from two elements #1', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>B]ar</paragraph>' );

				john.split();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>F</paragraph><paragraph>oar</paragraph>' );
			} );

			it( 'text from two elements #2', () => {
				john.setData( '<paragraph>Fo[]o</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>F[oo</paragraph><paragraph>B]ar</paragraph>' );

				john.split();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>F</paragraph><paragraph>ar</paragraph>' );
			} );

			it( 'text from one element', () => {
				john.setData( '<paragraph>F[]oo Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.split();
				kate.delete();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo B</paragraph>'
				);
			} );
		} );

		describe( 'by move', () => {
			it( 'move inside split element after split position', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Ba]r</paragraph>' );

				john.split();
				kate.move( [ 0, 3 ] );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>ooBa</paragraph>' +
					'<paragraph>r</paragraph>'
				);
			} );

			it( 'move operation does not really move anything', () => {
				john.setData( '<paragraph>[F]oobar</paragraph>' );
				kate.setData( '<paragraph>F[oo]bar</paragraph>' );

				john.remove();
				john.setSelection( [ 0, 4 ] );
				john.split();

				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients(
					'<paragraph>ooba</paragraph>' +
					'<paragraph>r</paragraph>'
				);
			} );
		} );
	} );
} );
