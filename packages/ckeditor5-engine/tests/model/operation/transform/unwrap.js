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

	describe( 'unwrap', () => {
		describe( 'by unwrap', () => {
			it( 'unwrap two siblings', () => {
				john.setData(
					'<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);

				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote>[]<paragraph>Bar</paragraph></blockQuote>'
				);

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'unwrap two siblings then undo', () => {
				john.setData(
					'<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);

				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote>[]<paragraph>Bar</paragraph></blockQuote>'
				);

				john.unwrap();
				kate.unwrap();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();
				expectClients(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);
			} );

			it( 'text in different path', () => {
				john.setData(
					'<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);

				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>[]Bar</paragraph></blockQuote>'
				);

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients(
					'<blockQuote>Foo</blockQuote>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'the same element', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'the same element, then undo', () => {
				john.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients( '<paragraph>Foo</paragraph>' );

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

				kate.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients( '<paragraph>Foo</paragraph>' );

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text from two elements #1', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote><paragraph>Bar</paragraph>' );
				kate.setData( '<blockQuote><paragraph>Fo[o</paragraph></blockQuote><paragraph>Ba]r</paragraph>' );

				john.unwrap();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>For</paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote><paragraph>F[oo]</paragraph></blockQuote>' );

				john.unwrap();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>F</paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'unwrapped element', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'unwrap merge target element', () => {
				john.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Foo</paragraph>' +
				// 	'<paragraph>Bar</paragraph>'
				// );

				expectClients( '<paragraph>Foo</paragraph>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'unwrap, then split and undo', () => {
				// This is pretty weird case. Right now it cannot be reproduced with the features that we have.
				john.editor.model.schema.register( 'containerBlock', { inheritAllFrom: '$block' } );
				john.editor.model.schema.extend( 'paragraph', { allowIn: 'containerBlock' } );
				john.editor.model.schema.extend( 'blockQuote', { allowIn: 'containerBlock' } );

				kate.editor.model.schema.register( 'containerBlock', { inheritAllFrom: '$block' } );
				kate.editor.model.schema.extend( 'paragraph', { allowIn: 'containerBlock' } );
				kate.editor.model.schema.extend( 'blockQuote', { allowIn: 'containerBlock' } );

				john.setData(
					'<containerBlock>' +
						'<blockQuote>' +
							'[]' +
							'<paragraph>A</paragraph>' +
							'<paragraph>B</paragraph>' +
						'</blockQuote>' +
					'</containerBlock>'
				);

				kate.setData(
					'<containerBlock>' +
						'<blockQuote>' +
							'[]' +
							'<paragraph>A</paragraph>' +
							'<paragraph>B</paragraph>' +
						'</blockQuote>' +
					'</containerBlock>'
				);

				john.unwrap();

				syncClients();

				expectClients(
					'<containerBlock>' +
						'<paragraph>A</paragraph>' +
						'<paragraph>B</paragraph>' +
					'</containerBlock>'
				);

				john.undo();
				kate.setSelection( [ 0, 1 ] );
				kate.split();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<containerBlock>' +
				// 		'<paragraph>A</paragraph>' +
				// 	'</containerBlock>' +
				// 	'<containerBlock>' +
				// 		'<paragraph>B</paragraph>' +
				// 	'</containerBlock>'
				// );

				expectClients(
					'<containerBlock>' +
						'<blockQuote>' +
							'<paragraph>A</paragraph>' +
							'<paragraph>B</paragraph>' +
						'</blockQuote>' +
					'</containerBlock>' +
					'<containerBlock></containerBlock>'
				);

				kate.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<containerBlock>' +
				// 		'<paragraph>A</paragraph>' +
				// 		'<paragraph>B</paragraph>' +
				// 	'</containerBlock>'
				// );

				expectClients(
					'<containerBlock><blockQuote><paragraph>A</paragraph><paragraph>B</paragraph></blockQuote></containerBlock>'
				);
			} );
		} );

		describe( 'by wrap', () => {
			it( 'unwrap, then undo and wrap #1', () => {
				john.setData(
					'<blockQuote>' +
						'[]' +
						'<paragraph>A</paragraph>' +
						'<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>' +
					'</blockQuote>'
				);

				kate.setData(
					'<blockQuote>' +
						'[]' +
						'<paragraph>A</paragraph>' +
						'<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>' +
					'</blockQuote>'
				);

				john.unwrap();

				syncClients();
				expectClients(
					'<paragraph>A</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>C</paragraph>'
				);

				john.undo();
				kate.setSelection( [ 1 ], [ 2 ] );
				kate.wrap( 'blockQuote' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>A</paragraph>' +
						'<blockQuote>' +
							'<paragraph>B</paragraph>' +
						'</blockQuote>' +
						'<paragraph>C</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'unwrap, then undo and wrap #2', () => {
				john.setData(
					'<paragraph>A</paragraph>' +
					'<blockQuote>' +
						'[]' +
						'<paragraph>B</paragraph>' +
					'</blockQuote>' +
					'<paragraph>C</paragraph>'
				);

				kate.setData(
					'<paragraph>A</paragraph>' +
					'<blockQuote>' +
						'[]' +
						'<paragraph>B</paragraph>' +
					'</blockQuote>' +
					'<paragraph>C</paragraph>'
				);

				john.unwrap();

				syncClients();
				expectClients(
					'<paragraph>A</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>C</paragraph>'
				);

				john.undo();
				kate.setSelection( [ 1 ], [ 2 ] );
				kate.wrap( 'blockQuote' );

				syncClients();
				expectClients(
					'<paragraph>A</paragraph>' +
					'<blockQuote>' +
						'<paragraph>B</paragraph>' +
					'</blockQuote>' +
					'<paragraph>C</paragraph>'
				);
			} );
		} );
	} );
} );
