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

	describe( 'move', () => {
		describe( 'by move', () => {
			it( 'elements in different paths', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.move( [ 2 ] );
				kate.move( [ 0 ] );

				syncClients();

				expectClients(
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'text in same path #1', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.move( [ 0, 4 ] );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>Bar Foo</paragraph>' );
			} );

			it( 'text in same path #2', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 0, 4 ] );

				syncClients();

				expectClients( '<paragraph>ooF arB</paragraph>' );
			} );

			it( 'text in same path #3', () => {
				john.setData( '<paragraph>Foo [Bar]</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>BarFoo </paragraph>' );
			} );

			it( 'text in same path #4', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.move( [ 0, 6 ] );
				kate.move( [ 0, 2 ] );

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );

			it( 'text at different paths #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients( '<paragraph>ooF</paragraph><paragraph>arB</paragraph>' );
			} );

			it( 'text in different paths #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.move( [ 1, 0 ] );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>Bar</paragraph><paragraph>Foo</paragraph>' );
			} );

			it( 'text in different paths #3', () => {
				john.setData( '<paragraph>F[oo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>B[ar]</paragraph></blockQuote>' );

				john.move( [ 1, 0, 0 ] );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients(
					'<paragraph>arF</paragraph>' +
					'<blockQuote>' +
						'<paragraph>ooB</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'text inside other client\'s range #1', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 0, 7 ] );

				syncClients();

				expectClients( '<paragraph>oo BaFr</paragraph>' );
			} );

			it( 'text inside other client\'s range #2', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 0, 2 ] );

				syncClients();

				expectClients( '<paragraph>oo BaFr</paragraph>' );
			} );

			it( 'text inside other client\'s range #3', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph>' );
				kate.setData( '<paragraph>[Foo B]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.move( [ 0, 7 ] );

				syncClients();

				expectClients( '<paragraph>oo BarF</paragraph>' );
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.move( [ 0, 0 ] );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph>ooF</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in different path #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.move( [ 1, 0 ] );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<blockQuote>' +
						'<paragraph>FooBar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>F[oo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.move( [ 0, 0 ] );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>ooF</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element while moving', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.move( [ 2 ] );
				kate.wrap( 'blockQuote' );

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Bar</paragraph>' +
				// 	'<blockQuote>' +
				// 		'<paragraph>Foo</paragraph>' +
				// 	'</blockQuote>'
				// );

				expectClients(
					'<paragraph>Bar</paragraph><paragraph>Foo</paragraph>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.move( [ 0, 0 ] );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>ooF</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'element in different path #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.move( [ 1, 0, 0 ] );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>FooBar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.move( [ 0, 0 ] );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>ooF</paragraph>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>F[oo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.move( [ 0, 0, 0 ] );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>ooF</paragraph>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'text in different path #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>ooF</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in different path #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.move( [ 1, 1 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>BFoo</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>ooF B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.move( [ 0, 4 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph> FooBar</paragraph>'
				);
			} );

			it( 'moved element', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Ba[]r</paragraph>' );

				john.move( [ 0 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>Ba</paragraph>' +
					'<paragraph>r</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'inside moved text', () => {
				john.setData( '<paragraph>F[oo Ba]r</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo[] Bar</paragraph><paragraph>Abc</paragraph>' );

				john.move( [ 1, 0 ] );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>r</paragraph>' +
					'<paragraph>oo BaAbc</paragraph>'
				);
			} );
		} );

		describe( 'by remove', () => {
			it( 'text in same path #1', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.move( [ 0, 4 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph> Foo</paragraph>' );
			} );

			it( 'text in same path #2', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>ooF B</paragraph>' );
			} );

			it( 'text in same path #3', () => {
				john.setData( '<paragraph>Foo [Bar]</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Foo </paragraph>' );
			} );

			it( 'text at different paths #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>ooF</paragraph><paragraph>B</paragraph>' );
			} );

			it( 'text in different paths #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.move( [ 1, 0 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph><paragraph>Foo</paragraph>' );
			} );

			it( 'text in different paths #3', () => {
				john.setData( '<paragraph>F[oo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>B[ar]</paragraph></blockQuote>' );

				john.move( [ 1, 0, 0 ] );
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<blockQuote>' +
						'<paragraph>ooB</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'text in other user\'s selection, then undo', () => {
				john.setData( '<paragraph>Fo[o B]ar</paragraph>' );
				kate.setData( '<paragraph>[Foo B]ar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.remove();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>ooFBar</paragraph>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>arFooB</paragraph>' );
			} );

			it( 'element into paragraph #3', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 1, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'wrapped element into wrapped paragraph #1', () => {
				john.setData( '<blockQuote><paragraph>F[oo]</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.move( [ 0, 0, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>ooFBar</paragraph></blockQuote>' );
			} );

			it( 'wrapped element into wrapped paragraph #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph>B[ar]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.move( [ 0, 0, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>arFooB</paragraph></blockQuote>' );
			} );

			it( 'wrapped element into wrapped paragraph #3', () => {
				john.setData( '<blockQuote><paragraph>F[oo]</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.move( [ 0, 1, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FooBar</paragraph></blockQuote>' );
			} );

			it( 'moved element', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'moved element, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0 ] );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );

				john.undo();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'move multiple elements, then undo', () => {
				john.setData( '<paragraph>A</paragraph>[<paragraph>B</paragraph><paragraph>C</paragraph>]' );
				kate.setData( '<paragraph>A</paragraph>[]<paragraph>B</paragraph><paragraph>C</paragraph>' );

				john.move( [ 0 ] );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>C</paragraph><paragraph>AB</paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<paragraph>AB</paragraph><paragraph>C</paragraph>' );
			} );

			it( 'moved text', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>arFooB</paragraph>' );
			} );

			it( 'moved text, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.merge();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );
		} );

		describe( 'by rename', () => {
			it( 'element in different path #1', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

				john.move( [ 1, 0 ] );
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>Foo</heading1><paragraph>arB</paragraph>' );
			} );

			it( 'element in different path #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph>[Bar]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph><paragraph>Bar</paragraph></blockQuote>' );

				john.move( [ 0, 0, 0 ] );
				kate.rename( 'blockQuote2' );

				syncClients();

				expectClients(
					'<blockQuote2>' +
					'<paragraph>BarFoo</paragraph>' +
					'<paragraph></paragraph>' +
					'</blockQuote2>'
				);
			} );

			it( 'element in different path #3', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph><paragraph>Bar</paragraph></blockQuote>' );

				john.move( [ 0, 1, 0 ] );
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<blockQuote>' +
					'<heading1></heading1>' +
					'<paragraph>FooBar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>Foo [Bar]</paragraph>' );
				kate.setData( '<paragraph>[]Foo Bar</paragraph>' );

				john.move( [ 0, 0 ] );
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>BarFoo </heading1>' );
			} );
		} );
	} );
} );
