/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, setTimeout */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '@ckeditor/ckeditor5-image/src/image';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { setData, stringify as stringifyModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import PasteFromOffice from '../../src/pastefromoffice';
import { parseHtml } from '../../src/filters/utils';
import { replaceImagesSourceWithBase64 } from '../../src/filters/image';
import { browserFixtures } from '../_data/image/index';

describe( 'Filters', () => {
	describe( 'image', () => {
		let editor;

		describe( 'replaceImagesSourceWithBase64', () => {
			describe( 'with RTF', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {} )
						.then( editorInstance => {
							editor = editorInstance;
						} );
				} );

				afterEach( () => {
					editor.destroy();
				} );

				it( 'should handle correctly empty RTF data', () => {
					const input = '<p>Foo <img src="file://test.jpg" /></p>';
					const rtfString = '';
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );

				it( 'should not change image with "http://" source', () => {
					const input = '<p>Foo <img src="http://ckeditor.com/logo.jpg" /></p>';
					const rtfString = browserFixtures.chrome.inputRtf.onlineOffline;
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );

				it( 'should not change image with "file://" source if not images in RTF data', () => {
					const input = '<p>Foo <img src="file://test.jpg" /></p>';
					const rtfString = '{\\rtf1\\adeflang1025\\ansi\\ansicpg1252\\uc1\\adeff31507}';
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );
			} );

			describe( 'with Blob', () => {
				let xhr, requests, element;

				before( () => {
					element = document.createElement( 'div' );

					document.body.appendChild( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ Clipboard, Paragraph, Image, PasteFromOffice ]
						} )
						.then( editorInstance => {
							editor = editorInstance;
						} );
				} );

				beforeEach( () => {
					setData( editor.model, '<paragraph>[]</paragraph>' );

					xhr = sinon.useFakeXMLHttpRequest();
					requests = [];

					xhr.onCreate = function( xhrInstance ) {
						requests.push( xhrInstance );
					};
				} );

				afterEach( () => {
					xhr.restore();
				} );

				after( () => {
					editor.destroy();

					element.remove();
				} );

				it( 'should replace image source when blob successfully fetched', done => {
					const model = editor.editing.model;
					const modelData = '<paragraph>Foo</paragraph><image src="blob://http://local/test.jpg"></image>';
					const input = '<p>Foo<img src="blob://http://local/test.jpg" /></p>';
					const { body } = parseHtml( input );

					setData( model, modelData );

					replaceImagesSourceWithBase64( body, '', model );

					editor.editing.model.document.on( 'change', () => {
						const expectedModel = '<paragraph>Foo</paragraph><image src="data:image/jpeg;base64,Rm9vQmFy"></image>';

						try {
							expect( stringifyModel( model.document.getRoot() ) ).to.equal( expectedModel );
							done();
						} catch ( err ) {
							done( err );
						}
					} );

					requests[ 0 ].respond( 200, { 'Content-type': 'image/jpeg' }, 'FooBar' );
				} );

				it( 'should not replace image source if blob fetching errored', done => {
					const model = editor.editing.model;
					const modelData = '<paragraph>Foo</paragraph><image src="blob://http://local/test.jpg"></image>';
					const input = '<p>Foo<img src="blob://http://local/test.jpg" /></p>';
					const { body } = parseHtml( input );

					setData( model, modelData );

					replaceImagesSourceWithBase64( body, '', model );

					requests[ 0 ].addEventListener( 'error', () => {
						// Wait 50ms to validate model.
						setTimeout( () => {
							expect( stringifyModel( model.document.getRoot() ) ).to.equal( modelData );
							done();
						}, 50 );
					} );

					requests[ 0 ].error();
				} );

				it( 'should not replace image source if blob fetching aborted', done => {
					const model = editor.editing.model;
					const modelData = '<paragraph>Foo</paragraph><image src="blob://http://local/test.jpg"></image>';
					const input = '<p>Foo<img src="blob://http://local/test.jpg" /></p>';
					const { body } = parseHtml( input );

					setData( model, modelData );

					replaceImagesSourceWithBase64( body, '', model );

					requests[ 0 ].addEventListener( 'abort', () => {
						// Wait 50ms to validate model.
						setTimeout( () => {
							expect( stringifyModel( model.document.getRoot() ) ).to.equal( modelData );
							done();
						}, 50 );
					} );

					requests[ 0 ].abort();
				} );
			} );
		} );
	} );
} );
