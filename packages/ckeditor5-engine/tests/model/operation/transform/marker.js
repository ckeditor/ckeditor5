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

	describe( 'marker', () => {
		describe( 'by marker', () => {
			it( 'in different paths', () => {
				john.setData( '<paragraph>[Fo]o</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Ba]r</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Fo<m1:end></m1:end>o</paragraph>' +
					'<paragraph><m2:start></m2:start>Ba<m2:end></m2:end>r</paragraph>'
				);
			} );

			it( 'in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Foo<m1:end></m1:end> ' +
						'<m2:start></m2:start>Bar<m2:end></m2:end>' +
					'</paragraph>'
				);
			} );

			it( 'in same range', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>[Foo]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start><m2:start></m2:start>Foo<m1:end></m1:end><m2:end></m2:end>' +
					'</paragraph>'
				);
			} );

			it( 'in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Fo<m2:start></m2:start>o B<m2:end></m2:end>ar<m1:end></m1:end>' +
					'</paragraph>'
				);
			} );

			it( 'change marker vs remove marker', () => {
				john.setData( '<paragraph>F[o]o</paragraph>' );
				kate.setData( '<paragraph>[]Foo</paragraph>' );

				john.setMarker( 'm1' );

				syncClients();

				john.setSelection( [ 0, 0 ], [ 0, 1 ] );
				john.setMarker( 'm1' );
				kate.removeMarker( 'm1' );

				syncClients();
				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>F<m1:end></m1:end>oo' +
					'</paragraph>'
				);
			} );

			it( 'then wrap and split', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Fo<m2:start></m2:start>o<m1:end></m1:end> Bar<m2:end></m2:end>' +
					'</paragraph>'
				);

				john.setSelection( [ 0 ], [ 1 ] );
				kate.setSelection( [ 0, 3 ] );

				john.wrap( 'blockQuote' );
				kate.split();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>' +
							'<m1:start></m1:start>Fo<m2:start></m2:start>o<m1:end></m1:end>' +
						'</paragraph>' +
						'<paragraph>' +
							' Bar<m2:end></m2:end>' +
						'</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'then unwrap and split', () => {
				john.setData( '<blockQuote><paragraph>[Foo] Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Fo[o Bar]</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.setSelection( [ 0, 0 ], [ 0, 1 ] );
				kate.setSelection( [ 0, 0, 3 ] );

				john.unwrap();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Fo<m2:start></m2:start>o<m1:end></m1:end>' +
					'</paragraph>' +
					'<paragraph>' +
						' Bar<m2:end></m2:end>' +
					'</paragraph>'
				);
			} );

			it( 'then remove text', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.setSelection( [ 0, 0 ], [ 0, 3 ] );
				kate.setSelection( [ 0, 2 ], [ 0, 7 ] );

				john.remove();
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );

			it.skip( 'then remove text and undo', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Fo<m2:start></m2:start>o<m1:end></m1:end> Bar<m2:end></m2:end>' +
					'</paragraph>'
				);

				john.remove();
				kate.remove();

				syncClients();
				expectClients( '<paragraph></paragraph>' );

				john.undo();
				kate.undo();

				syncClients();

				// Wrong markers transforming.
				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Foo<m1:end></m1:end><m2:start></m2:start> Bar<m2:end></m2:end>' +
					'</paragraph>'
				);
			} );

			it( 'then move and remove', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Foo<m1:end></m1:end> <m2:start></m2:start>Bar<m2:end></m2:end>' +
					'</paragraph>'
				);

				john.setSelection( [ 0, 1 ], [ 0, 3 ] );
				kate.setSelection( [ 0, 4 ], [ 0, 7 ] );

				john.move( [ 0, 4 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>F<m1:end></m1:end> oo</paragraph>' );
			} );

			it( 'then unwrap and merge', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph><paragraph> Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph> [Bar]</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.setSelection( [ 0, 0 ], [ 0, 1 ] );
				kate.setSelection( [ 0, 1 ] );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Foo<m1:end></m1:end> ' +
						'<m2:start></m2:start>Bar<m2:end></m2:end>' +
					'</paragraph>'
				);
			} );

			it( 'then merge elements', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph> Bar</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph> [Bar]</paragraph><paragraph>Abc</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.setSelection( [ 1 ] );
				kate.setSelection( [ 2 ] );

				john.merge();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>Foo<m1:end></m1:end> ' +
						'<m2:start></m2:start>Bar<m2:end></m2:end>Abc' +
					'</paragraph>'
				);
			} );

			it( 'then split text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.setSelection( [ 0, 3 ] );
				kate.setSelection( [ 0, 4 ] );

				john.split();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph> </paragraph>' +
					'<paragraph><m2:start></m2:start>Bar<m2:end></m2:end></paragraph>'
				);
			} );

			it( 'then remove markers', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm2' );

				syncClients();

				john.removeMarker( 'm2' );
				kate.removeMarker( 'm1' );

				syncClients();

				expectClients( '<paragraph>Foo Bar</paragraph>' );
			} );

			it( 'with the same name', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.setMarker( 'm1' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> Bar</paragraph>' );
			} );
		} );

		describe( 'by move', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Fo]o</paragraph>' );
				kate.setData( '<paragraph>Fo[o]</paragraph>' );

				john.setMarker( 'm1' );
				kate.move( [ 0, 0 ] );

				syncClients();

				expectClients( '<paragraph>o<m1:start></m1:start>Fo<m1:end></m1:end></paragraph>' );
			} );

			it( 'text from other user\'s range #1', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Foo [Ba]r</paragraph>' );

				john.setMarker( 'm1' );
				kate.move( [ 0, 0 ] );

				syncClients();

				// Actual result for Kate:
				// <paragraph>Ba<m1:start></m1:start>Foo r<m1:end></m1:end></paragraph>
				expectClients( '<paragraph><m1:start></m1:start>BaFoo r<m1:end></m1:end></paragraph>' );
			} );

			it( 'text from other user\'s range #2', () => {
				john.setData( '<paragraph>Fo[o Bar]</paragraph><paragraph></paragraph>' );
				kate.setData( '<paragraph>[Foo B]ar</paragraph><paragraph></paragraph>' );

				john.setMarker( 'm1' );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph>' +
						'<m1:start></m1:start>ar<m1:end></m1:end>' +
					'</paragraph>' +
					'<paragraph>Foo B</paragraph>'
				);
			} );

			it( 'text from other user\'s range #3', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph><paragraph></paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph><paragraph></paragraph>' );

				john.setMarker( 'm1' );
				kate.move( [ 1, 0 ] );

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph><m1:start></m1:start>Foo Bar<m1:end></m1:end></paragraph>'
				);
			} );

			it( 'left side of marker moved, insertion at the moved range start, move undo', () => {
				john.setData( '<paragraph>Foo[bar]</paragraph><paragraph></paragraph>' );
				kate.setData( '<paragraph>Foo[bar]</paragraph><paragraph></paragraph>' );

				john.setMarker( 'm1' );
				john.setSelection( [ 0, 2 ], [ 0, 4 ] );
				john.move( [ 1, 0 ] );

				syncClients();

				kate.setSelection( [ 0, 2 ] );
				kate.type( 'xx' );

				syncClients();

				expectClients( '<paragraph>Foxx<m1:start></m1:start>ar<m1:end></m1:end></paragraph><paragraph>ob</paragraph>' );

				john.undo();
				syncClients();

				expectClients( '<paragraph>Foobxx<m1:start></m1:start>ar<m1:end></m1:end></paragraph><paragraph></paragraph>' );
			} );

			it( 'right side of marker moved, insertion at the moved range start, move undo', () => {
				john.setData( '<paragraph>[Foo]bar</paragraph><paragraph></paragraph>' );
				kate.setData( '<paragraph>[Foo]bar</paragraph><paragraph></paragraph>' );

				john.setMarker( 'm1' );
				john.setSelection( [ 0, 2 ], [ 0, 4 ] );
				john.move( [ 1, 0 ] );

				syncClients();

				kate.setSelection( [ 0, 2 ] );
				kate.type( 'xx' );

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Fo<m1:end></m1:end>xxar</paragraph><paragraph>ob</paragraph>' );

				john.undo();
				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end>bxxar</paragraph><paragraph></paragraph>' );
			} );
		} );

		describe( 'by remove', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Ba]r</paragraph>' );

				john.setMarker( 'm1' );
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>r</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo [Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> </paragraph>' );
			} );

			it( 'text in other user\'s selection #1', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>F[oo]</paragraph>' );

				john.setMarker( 'm1' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>F<m1:end></m1:end></paragraph>' );
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.setMarker( 'm1' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph></paragraph>' );
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.setMarker( 'm1' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.setMarker( 'm1' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path, then undo', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.setMarker( 'm1' );
				kate.wrap( 'blockQuote' );

				syncClients();

				john.undo();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote><m1:start></m1:start>Foo<m1:end></m1:end></blockQuote>' );
			} );

			it( 'element in same path, then undo', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'text in same path, then undo', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.unwrap();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end></paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> </paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in same path, then undo', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> </paragraph>' +
					'<paragraph>Bar</paragraph>'
				);

				john.undo();

				syncClients();

				expectClients(
					'<paragraph>Foo </paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>Fo[]o</paragraph>' );

				john.setMarker( 'm1' );
				kate.split();

				syncClients();

				expectClients(
					'<paragraph><m1:start></m1:start>Fo</paragraph>' +
					'<paragraph>o<m1:end></m1:end></paragraph>'
				);
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph> Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph> Bar</paragraph>' );

				john.setMarker( 'm1' );
				kate.merge();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> Bar</paragraph>' );
			} );

			it( 'elements into paragraph', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph> Bar</paragraph><paragraph> Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph> Bar</paragraph>[]<paragraph> Abc</paragraph>' );

				john.setMarker( 'm1' );
				kate.merge();

				syncClients();

				kate.setSelection( [ 1 ] );

				kate.merge();

				syncClients();

				expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> Bar Abc</paragraph>' );
			} );

			it( 'wrapped element into wrapped paragraph', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph><paragraph> Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph> Bar</paragraph></blockQuote>' );

				john.setMarker( 'm1' );
				kate.merge();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph><m1:start></m1:start>Foo<m1:end></m1:end> Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'only marker end is inside merged element #1', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>B]ar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.setMarker( 'm1' );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>Foo<m1:start></m1:start>B<m1:end></m1:end>ar</paragraph>' );
			} );

			it( 'only marker end is inside merged element #2', () => {
				john.setData( '<paragraph>Foo[]Bar</paragraph>' );
				kate.setData( '<paragraph>Foo[]Bar</paragraph>' );

				kate.split();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				john.setSelection( [ 1 ] );
				john.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Xyz</paragraph><paragraph>Bar</paragraph>' );

				john.setSelection( [ 1 ], [ 2, 1 ] );
				john.setMarker( 'm1' );
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo<m1:start></m1:start>Bar</paragraph><paragraph>Xyz</paragraph><m1:end></m1:end>' );
			} );
		} );

		describe( 'by rename', () => {
			it( 'in different path', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );

				john.setMarker( 'm1' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph><m1:start></m1:start>Bar<m1:end></m1:end></paragraph>'
				);
			} );

			it( 'in same path', () => {
				john.setData( '<paragraph>Fo[o]</paragraph>' );
				kate.setData( '<paragraph>[]Foo</paragraph>' );

				john.setMarker( 'm1' );
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>Fo<m1:start></m1:start>o<m1:end></m1:end></heading1>' );
			} );
		} );
	} );
} );
