/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

	describe( 'insert', () => {
		describe( 'by insert', () => {
			it( 'elements at same position #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '[]<paragraph>Foo</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'elements at same position #2', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '[]<paragraph>Foo</paragraph>' );

				kate.insert( '<paragraph>Xyz</paragraph>' );
				john.insert( '<paragraph>Abc</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'elements in same parent', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Xyz</paragraph>'
				);
			} );

			it( 'elements in same path', () => {
				john.setData( '[]<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Xyz</paragraph>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'text at different paths', () => {
				john.setData( '<paragraph>Abc[]</paragraph><paragraph>Xyz</paragraph>' );
				kate.setData( '<paragraph>Abc</paragraph><paragraph>[]Xyz</paragraph>' );

				john.type( 'Foo' );
				kate.type( 'Bar' );

				syncClients();

				expectClients(
					'<paragraph>AbcFoo</paragraph>' +
					'<paragraph>BarXyz</paragraph>'
				);
			} );

			it( 'text, then wrap and undo', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '<paragraph>Foo[]</paragraph>' );

				john.type( 'Bar' );
				kate.type( 'Abc' );

				syncClients();

				john.setSelection( [ 0 ], [ 1 ] );

				john.wrap( 'blockQuote' );
				kate.undo();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>FooBar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'text, then insert element and merge', () => {
				john.setData( '<paragraph>[]</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>[]</paragraph><paragraph>Abc</paragraph>' );

				john.type( 'Foo' );
				kate.type( ' Bar' );

				syncClients();

				expectClients(
					'<paragraph>Foo Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);

				john.setSelection( [ 1 ] );
				kate.setSelection( [ 1 ] );

				john.insert( '<paragraph>Xyz</paragraph>' );
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>Foo BarAbc</paragraph>' +
					'<paragraph>Xyz</paragraph>'
				);
			} );

			it( 'text, then split and undo', () => {
				john.setData( '<paragraph>[]</paragraph>' );
				kate.setData( '<paragraph>[]</paragraph>' );

				john.type( 'Foo' );
				kate.type( ' Bar' );

				syncClients();

				john.setSelection( [ 0, 1 ] );
				kate.setSelection( [ 0, 4 ] );

				john.split();
				kate.split();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );
		} );

		describe( 'by move', () => {
			it( 'element at different paths #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'element at different paths #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph>[]</blockQuote><paragraph>Bar</paragraph>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>B[ar]</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.move( [ 0, 0, 0 ] );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>arFoo</paragraph>' +
						'<paragraph>Abc</paragraph>' +
					'</blockQuote>' +
					'<paragraph>B</paragraph>'
				);
			} );

			it( 'text at different paths', () => {
				john.setData( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph>AbcFoo</paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'text at same path', () => {
				john.setData( '<paragraph>F[]oo Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>arFAbcoo B</paragraph>' );
			} );

			it( 'text at same position #1', () => {
				john.setData( '<paragraph>Foo[] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 3 ] );

				syncClients();

				expectClients( '<paragraph>FooBarAbc </paragraph>' );
			} );

			it( 'text at same position #2', () => {
				john.setData( '<paragraph>Foo []Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>BarFoo Abc</paragraph>' );
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in same path #1', () => {
				john.setData( '<paragraph>Foo Bar</paragraph>[]' );
				kate.setData( '[<paragraph>Foo Bar</paragraph>]' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo Bar</paragraph>' +
					'</blockQuote>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it( 'element in same path #2', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.type( ' Bar' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in different paths #1', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Abc</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in different paths #2', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>Bar[]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.type( 'Abc' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>' +
					'<paragraph>BarAbc</paragraph>'
				);
			} );

			it( 'element, then unwrap and split', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.type( ' Bar' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo Bar</paragraph></blockQuote>' );

				john.setSelection( [ 0, 0 ] );
				kate.setSelection( [ 0, 0, 2 ] );

				john.unwrap();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>Fo</paragraph>' +
					'<paragraph>o Bar</paragraph>'
				);
			} );

			it( 'element, then add marker and split', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.type( ' Bar' );
				kate.wrap( 'blockQuote' );

				syncClients();

				john.setSelection( [ 0, 0, 0 ], [ 0, 0, 3 ] );
				kate.setSelection( [ 0, 0, 2 ] );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph><m1:start></m1:start>Fo</paragraph>' +
						'<paragraph>o<m1:end></m1:end> Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element, then split at the same position and undo', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.type( ' Bar' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo Bar</paragraph></blockQuote>' );

				john.setSelection( [ 0, 0, 3 ] );
				kate.setSelection( [ 0, 0, 3 ] );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph> Bar</paragraph>' +
					'</blockQuote>'
				);

				kate.undo();

				syncClients();

				// Below is not the best result ever but it is acceptable.
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo Bar</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>Foo[]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.type( 'Abc' );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>FooAbc</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>Foo[]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.type( 'Abc' );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>FooAbc</paragraph><blockQuote>Bar</blockQuote>' );
			} );

			it( 'element in same path #1', () => {
				john.setData( '<blockQuote><paragraph>Foo[]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.type( ' Bar' );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );

			it( 'element in same path #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph>[]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.unwrap();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients(
				// 	'<paragraph>Foo</paragraph>' +
				// 	'<paragraph>Bar</paragraph>'
				// );

				expectClients(
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'element, then wrap and undo on both clients', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph>[]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.unwrap();

				syncClients();

				kate.setSelection( [ 0 ], [ 1 ] );

				kate.wrap( 'blockQuote' );
				john.undo();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element, then wrap, unwrap and undo', () => {
				john.setData( '<blockQuote><paragraph>Foo[]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.type( ' Bar' );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );

				john.setSelection( [ 0 ], [ 1 ] );
				john.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo Bar</paragraph></blockQuote>' );

				john.undo();

				kate.setSelection( [ 0, 0 ], [ 0, 1 ] );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'text in same path #1', () => {
				john.setData( '<paragraph>Foo</paragraph>[]' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>oo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in same path #2', () => {
				john.setData( '<paragraph>Fo[]o</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.type( 'Bar' );
				kate.split();

				syncClients();

				expectClients( '<paragraph>F</paragraph><paragraph>oBaro</paragraph>' );
			} );

			it( 'text in different paths #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in different paths #2', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.type( 'Abc' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>FooAbc</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text at same position', () => {
				john.setData( '<paragraph>F[]oo</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.type( 'Bar' );
				kate.split();

				syncClients();

				expectClients( '<paragraph>FBar</paragraph><paragraph>oo</paragraph>' );
			} );

			it( 'text at same position #2', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '<paragraph>Foo[]</paragraph>' );

				john.type( 'Bar' );
				kate.split();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph><paragraph></paragraph>' );
			} );

			it( 'text, then insert element and split', () => {
				john.setData( '<paragraph>[]Foo</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.type( 'Bar' );
				kate.split();

				syncClients();

				john.setSelection( [ 1 ] );
				kate.setSelection( [ 1, 1 ] );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>BarF</paragraph>' +
					'<paragraph>Abc</paragraph>' +
					'<paragraph>o</paragraph>' +
					'<paragraph>o</paragraph>'
				);
			} );
		} );

		describe( 'by remove', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.type( 'Abc' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>FooAbc</paragraph><paragraph></paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>Foo[]</paragraph>' );
				kate.setData( '<paragraph>[Foo]</paragraph>' );

				john.type( 'Bar' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Bar</paragraph>' );
			} );

			it( 'element in different path', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.type( 'Abc' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>FooAbc</paragraph>' );
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.type( 'Abc' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Bar</paragraph>' );
			} );

			it( 'text, then rename, split and undo', () => {
				john.setData( '<paragraph>Foo Bar[]</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.type( 'Bar' );
				kate.remove();

				syncClients();
				expectClients( '<paragraph>Foo Bar</paragraph>' );

				john.setSelection( [ 0, 0 ] );
				kate.setSelection( [ 0, 4 ] );

				john.rename( 'heading1' );
				kate.split();

				syncClients();
				expectClients( '<heading1>Foo </heading1><heading1>Bar</heading1>' );

				kate.undo();

				syncClients();

				expectClients( '<heading1>Foo Bar</heading1>' );
			} );

			it( 'element, then add marker, split and undo with type #1', () => {
				john.setData( '<paragraph>Foo</paragraph>[]' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Bar</paragraph><paragraph></paragraph>' ); // Autoparagraphing.

				john.setSelection( [ 0, 0 ], [ 0, 3 ] );
				kate.setSelection( [ 0, 2 ] );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Ba</paragraph>' +
					'<paragraph>r<m1:end></m1:end></paragraph>' +
					'<paragraph></paragraph>'
				);

				john.undo();
				john.setSelection( [ 1, 1 ] );
				john.type( 'Abc' );

				kate.undo();

				syncClients();

				expectClients( '<paragraph>BarAbc</paragraph><paragraph></paragraph>' );

				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>BarAbc</paragraph>' );
			} );

			it( 'element, then add marker, split and undo with type #2', () => {
				john.setData( '<paragraph>Foo</paragraph>[]' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Bar</paragraph><paragraph></paragraph>' ); // Autoparagraphing.

				john.setSelection( [ 0, 0 ], [ 0, 3 ] );
				kate.setSelection( [ 0, 2 ] );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Ba</paragraph>' +
					'<paragraph>r<m1:end></m1:end></paragraph>' +
					'<paragraph></paragraph>'
				);

				john.undo();
				john.setSelection( [ 1, 1 ] );
				john.type( 'Abc' );

				kate.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>BarAbc</paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>[]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph></paragraph>' );

				john.type( ' Bar' );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );
		} );

		describe( 'by marker', () => {
			it( 'in different path #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph><m1:start></m1:start>Bar<m1:end></m1:end></paragraph>'
				);
			} );

			it( 'in different path #2', () => {
				john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.type( 'Abc' );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients(
					'<paragraph>FooAbc</paragraph>' +
					'<paragraph><m1:start></m1:start>Bar<m1:end></m1:end></paragraph>'
				);
			} );

			it( 'in same path', () => {
				john.setData( '<paragraph>[]Foo</paragraph>' );
				kate.setData( '<paragraph>Fo[o]</paragraph>' );

				john.type( 'Bar' );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients( '<paragraph>BarFo<m1:start></m1:start>o<m1:end></m1:end></paragraph>' );
			} );
		} );

		describe( 'by rename', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]' );
				kate.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>Foo</paragraph>[]' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.insert( '<paragraph>Bar</paragraph>' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>Foo[] Bar</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.type( 'Abc' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>FooAbc Bar</heading1>' );
			} );

			it( 'text in different paths', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>B[]ar</paragraph>' );
				kate.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote><paragraph>Bar</paragraph>' );

				john.type( 'Abc' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<blockQuote>' +
					'<heading1>Foo</heading1>' +
					'</blockQuote>' +
					'<paragraph>BAbcar</paragraph>'
				);
			} );
		} );
	} );
} );
