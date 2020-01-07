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

	describe( 'merge', () => {
		describe( 'by merge', () => {
			it( 'elements into paragraph', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]<paragraph>Abc</paragraph>' );

				john.merge();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBarAbc</paragraph>' );
			} );

			it( 'elements into paragraph with undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]<paragraph>Abc</paragraph>' );

				john.merge();
				kate.merge();

				syncClients();

				kate.undo();
				john.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
			} );

			it.skip( 'same element with undo', () => {
				// Unnecessary SplitOperation.
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph></paragraph>' );

				john.merge();
				kate.merge();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'merge to different element (insert) with undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.merge();
				kate.insert( '<paragraph></paragraph>' );
				kate.setSelection( [ 2 ], [ 2 ] );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph><paragraph></paragraph>' );

				john.undo();
				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph></paragraph>' );

				kate.undo();
				syncClients();
				expectClients( '<paragraph>FooBar</paragraph><paragraph></paragraph><paragraph></paragraph>' );
			} );

			it( 'merge to different element (wrap) with undo #1', () => {
				// Merging to an element happens during using BlockQuote plugin. `Foo` paragraph is first wrapped and
				// then merged to the existing `blockQuote`.
				john.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );

				john._processExecute( 'blockQuote' );
				kate._processExecute( 'blockQuote' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);

				john.undo();
				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);

				kate.undo();
				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'merge to different element (wrap) with undo #2', () => {
				// Merging to an element happens during using BlockQuote plugin. `Foo` paragraph is first wrapped and
				// then merged to the existing `blockQuote`.
				john.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );

				john._processExecute( 'blockQuote' );
				kate._processExecute( 'blockQuote' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);

				kate.undo();
				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>' +
					'<paragraph>Foo</paragraph>'
				);

				john.undo();
				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'merge to different element (wrap) with undo #3', () => {
				// Merging to an element happens during using BlockQuote plugin. `Foo` paragraph is first wrapped and
				// then merged to the existing `blockQuote`.
				john.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>F[oo</paragraph><blockQuote><paragraph>B]ar</paragraph></blockQuote>' );

				john._processExecute( 'blockQuote' );
				kate._processExecute( 'blockQuote' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);

				john.undo();
				kate.undo();
				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );
		} );

		describe( 'by remove', () => {
			it( 'remove merged element', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.merge();
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'remove merged element then undo #1', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.merge();
				kate.remove();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'remove merged element then undo #2', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.merge();
				kate.remove();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'remove merged element then undo #3', () => {
				john.setData( '[<paragraph>A</paragraph><paragraph>B</paragraph>]<paragraph>C</paragraph>' );
				kate.setData( '<paragraph>A</paragraph>[]<paragraph>B</paragraph><paragraph>C</paragraph>' );

				kate.merge();
				john.remove();

				syncClients();
				expectClients( '<paragraph>C</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>A</paragraph><paragraph>B</paragraph><paragraph>C</paragraph>' );
			} );

			it( 'remove merged element then undo #4', () => {
				john.setData( '<paragraph>A</paragraph>[<paragraph>B</paragraph><paragraph>C</paragraph>]' );
				kate.setData( '<paragraph>A</paragraph>[]<paragraph>B</paragraph><paragraph>C</paragraph>' );

				kate.merge();
				john.remove();

				syncClients();
				expectClients( '<paragraph>A</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>A</paragraph><paragraph>B</paragraph><paragraph>C</paragraph>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text from two elements', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.merge();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>For</paragraph>' );
			} );

			it( 'merged elements and some text', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph></paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>F[oo</paragraph><paragraph></paragraph><paragraph>Ba]r</paragraph>' );

				john.merge();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>Fr</paragraph>' );
			} );
		} );

		describe( 'by wrap', () => {
			it( 'wrap merged element', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.merge();
				kate.wrap( 'blockQuote' );

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'wrap in merged element', () => {
				// This is pretty weird case. Right now it cannot be reproduced with the features that we have.
				john.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				john.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				kate.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				kate.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				john.setData(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
					'</listItem>' +
					'[]' +
					'<listItem>' +
						'<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>' +
					'</listItem>'
				);

				kate.setData(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
					'</listItem>' +
					'<listItem>' +
						'[<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>]' +
					'</listItem>'
				);

				john.merge();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
						'<blockQuote>' +
							'<paragraph>B</paragraph>' +
							'<paragraph>C</paragraph>' +
						'</blockQuote>' +
					'</listItem>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'merge to unwrapped element', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote><blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.merge();
				kate.unwrap();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'merge to unwrapped element with undo #1', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote><blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.merge();
				john.undo();
				kate.unwrap();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				expectClients( '<paragraph>Foo</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
			} );

			it( 'merge to unwrapped element with undo #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote><blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.merge();
				kate.unwrap();
				kate.undo();

				syncClients();

				// Below would be the expected effect with correct wrap transformation.
				// expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph>' );

				expectClients( '<blockQuote><paragraph>Foo</paragraph><paragraph>Bar</paragraph></blockQuote>' );
			} );

			it( 'unwrap in merged element', () => {
				// This is pretty weird case. Right now it cannot be reproduced with the features that we have.
				john.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				john.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				kate.editor.model.schema.extend( 'paragraph', { allowIn: 'listItem' } );
				kate.editor.model.schema.extend( 'blockQuote', { allowIn: 'listItem' } );

				john.setData(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
					'</listItem>' +
					'[]' +
					'<listItem>' +
						'<blockQuote>' +
							'<paragraph>B</paragraph>' +
							'<paragraph>C</paragraph>' +
						'</blockQuote>' +
					'</listItem>'
				);

				kate.setData(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
					'</listItem>' +
					'<listItem>' +
						'<blockQuote>' +
							'[]<paragraph>B</paragraph>' +
							'<paragraph>C</paragraph>' +
						'</blockQuote>' +
					'</listItem>'
				);

				john.merge();
				kate.unwrap();

				syncClients();

				expectClients(
					'<listItem>' +
						'<paragraph>A</paragraph>' +
						'<paragraph>B</paragraph>' +
						'<paragraph>C</paragraph>' +
					'</listItem>'
				);
			} );
		} );

		describe( 'by split', () => {
			it( 'merge element which got split (the element is in blockquote) and undo', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>B[]ar</paragraph></blockQuote>' );

				john._processExecute( 'delete' );
				kate.split();

				syncClients();
				expectClients( '<paragraph>FooB</paragraph><paragraph>ar</paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><blockQuote><paragraph>B</paragraph><paragraph>ar</paragraph></blockQuote>' );
			} );
		} );
	} );
} );
