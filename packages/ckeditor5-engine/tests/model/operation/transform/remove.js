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

	describe( 'remove', () => {
		describe( 'by remove', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph>F</paragraph><paragraph>B</paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph>F B</paragraph>' );
			} );

			it( 'text in other user\'s selection #1', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it( 'text in other user\'s selection, then undo', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<blockQuote><paragraph></paragraph></blockQuote>' );
			} );

			it( 'element while removing', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'element while removing, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Foo</paragraph>' +
				// 	'<blockQuote>' +
				// 		'<paragraph>Bar</paragraph>' +
				// 	'</blockQuote>'
				// );

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'element while removing, then undo #2', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				john.undo();
				kate.wrap( 'blockQuote' );

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Foo</paragraph>' +
				// 	'<blockQuote>' +
				// 		'<paragraph>Bar</paragraph>' +
				// 	'</blockQuote>'
				// );

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it( 'element while removing', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'element while removing, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Foo</paragraph>' +
				// 	'<paragraph>Bar</paragraph>'
				// );

				expectClients( '<paragraph>Foo</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph> </paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection #1', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph> Bar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'text, then remove and undo', () => {
				john.setData( '<paragraph>[Foo ]Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				john.setSelection( [ 1, 0 ], [ 1, 3 ] );

				john.remove();
				kate.undo();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it( 'remove split element', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph><paragraph>Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();
				expectClients( '<paragraph>Bar</paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FBar</paragraph>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooB</paragraph>' );
			} );

			it( 'element into paragraph, then undo', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FBar</paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'wrapped element into wrapped paragraph #1', () => {
				john.setData( '<blockQuote><paragraph>F[oo]</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FBar</paragraph></blockQuote>' );
			} );

			it( 'wrapped element into wrapped paragraph #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph>B[ar]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FooB</paragraph></blockQuote>' );
			} );

			it( 'removed element, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );
		} );

		describe( 'by rename', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );

				john.remove();
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>F[o]o</paragraph>' );
				kate.setData( '<paragraph>[]Foo</paragraph>' );

				john.remove();
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>Fo</heading1>' );
			} );

			it( 'element in other user\'s selection', () => {
				kate.setData( '<paragraph>[Foo]</paragraph>' );
				john.setData( '<paragraph>[Foo]</paragraph>' );

				kate.remove();
				john.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1></heading1>' );
			} );
		} );
	} );
} );
