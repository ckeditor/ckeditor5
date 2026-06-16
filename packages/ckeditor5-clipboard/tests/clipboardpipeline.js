/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClipboardPipeline } from '../src/clipboardpipeline.js';
import { ClipboardObserver } from '../src/clipboardobserver.js';
import { ViewDataTransfer, ViewDocumentFragment, ModelDocumentFragment, ViewText,
	_stringifyView,
	_parseView,
	_stringifyModel,
	_setModelData,
	_getModelData
} from '@ckeditor/ckeditor5-engine';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'ClipboardPipeline feature', () => {
	let editor, view, viewDocument, clipboardPlugin, scrollSpy;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ClipboardPipeline, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = editor.editing.view.document;
				clipboardPlugin = editor.plugins.get( 'ClipboardPipeline' );

				// VirtualTestEditor has no DOM, so this method must be stubbed for all tests.
				// Otherwise it will throw as it accesses the DOM to do its job.
				scrollSpy = vi.spyOn( view, 'scrollToTheSelection' ).mockImplementation( () => {} );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
		vi.restoreAllMocks();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ClipboardPipeline.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ClipboardPipeline.isPremiumPlugin ).toBe( false );
	} );

	describe( 'constructor()', () => {
		it( 'registers ClipboardObserver', () => {
			expect( view.getObserver( ClipboardObserver ) ).toBeInstanceOf( ClipboardObserver );
		} );
	} );

	describe( 'clipboard paste pipeline', () => {
		describe( 'takes HTML data from the dataTransfer', () => {
			it( 'and fires the clipboardInput event on the editingView', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
					const preventDefaultSpy = vi.fn();

					viewDocument.on( 'clipboardInput', ( evt, data ) => {
						expect( preventDefaultSpy ).toHaveBeenCalledOnce();
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy
					} );
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
					const preventDefaultSpy = vi.fn();

					clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyView( data.content ) ).toBe( '<p>x</p>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy
					} );
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
					const preventDefaultSpy = vi.fn();

					clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ModelDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyModel( data.content ) ).toBe( '<paragraph>x</paragraph>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy
					} );
				} );
			} );
		} );

		describe( 'takes plain text data from the dataTransfer if there is no HTML', () => {
			it( 'and fires the clipboardInput event on the editingView', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
					const preventDefaultSpy = vi.fn();

					viewDocument.on( 'clipboardInput', ( evt, data ) => {
						expect( preventDefaultSpy ).toHaveBeenCalledOnce();
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy,
						method: 'paste'
					} );
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
					const preventDefaultSpy = vi.fn();

					clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyView( data.content ) ).toBe( '<p>x</p><p>y  z</p>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy,
						method: 'paste'
					} );
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
					const preventDefaultSpy = vi.fn();

					clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ModelDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyModel( data.content ) ).toBe( '<paragraph>x</paragraph><paragraph>y  z</paragraph>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy,
						method: 'paste'
					} );
				} );
			} );
		} );

		describe( 'should be possible to override clipboardInput data', () => {
			it( 'fires the inputTransformation event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
					const preventDefaultSpy = vi.fn();

					viewDocument.on( 'clipboardInput', ( evt, data ) => {
						const fragment = new ViewDocumentFragment();

						fragment._appendChild( _parseView( '<p>foo</p>' ) );
						data.content = fragment;
					} );

					clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyView( data.content ) ).toBe( '<p>foo</p>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy
					} );
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', () => {
				return new Promise( resolve => {
					const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
					const preventDefaultSpy = vi.fn();

					viewDocument.on( 'clipboardInput', ( evt, data ) => {
						const fragment = new ViewDocumentFragment();

						fragment._appendChild( _parseView( '<p>foo</p>' ) );
						data.content = fragment;
					} );

					clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
						expect( data.content ).toBeInstanceOf( ModelDocumentFragment );
						expect( data.dataTransfer ).toBe( dataTransferMock );
						expect( data.method ).toBe( 'paste' );
						expect( _stringifyModel( data.content ) ).toBe( '<paragraph>foo</paragraph>' );

						resolve();
					} );

					viewDocument.fire( 'paste', {
						dataTransfer: dataTransferMock,
						preventDefault: preventDefaultSpy
					} );
				} );
			} );
		} );

		it( 'fires events with empty data if there is no HTML nor plain text', () => {
			return new Promise( resolve => {
				const dataTransferMock = createDataTransfer( {} );
				const preventDefaultSpy = vi.fn();
				const editorViewCalled = vi.fn();

				viewDocument.on( 'clipboardInput', ( evt, data ) => {
					expect( preventDefaultSpy ).toHaveBeenCalledOnce();

					expect( data.dataTransfer ).toBe( dataTransferMock );

					editorViewCalled();
				} );

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
					expect( data.dataTransfer ).toBe( dataTransferMock );
					expect( _stringifyView( data.content ) ).toBe( '' );

					expect( editorViewCalled ).toHaveBeenCalledOnce();

					resolve();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'uses low priority observer for the paste event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = vi.fn();

			viewDocument.on( 'paste', evt => {
				evt.stop();
			} );

			viewDocument.on( 'clipboardInput', spy );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'inserts content to the editor', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( _stringifyModel( spy.mock.calls[ 0 ][ 0 ] ) ).toBe( '<paragraph>x</paragraph>' );
		} );

		it( 'does not insert content when editor is read-only', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'stops `clipboardInput` event on highest priority when editor is read-only', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = vi.fn();

			viewDocument.on( 'clipboardInput', spy, { priority: 'high' } );

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: dataTransferMock.getData( 'text/html' ),
				method: 'paste'
			} );

			expect( spy ).not.toHaveBeenCalled();

			editor.disableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: dataTransferMock.getData( 'text/html' )
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'does not insert content if the whole content was invalid', () => {
			// Whole content is invalid. Even though there is "view" content, the "model" content would be empty.
			// Do not insert content in this case.
			const dataTransferMock = createDataTransfer( { 'text/html': '<unknownTag></unknownTag>', 'text/plain': '' } );
			const insertContentSpy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );
			const contentInsertionSpy = vi.fn();

			clipboardPlugin.on( 'contentInsertion', () => contentInsertionSpy() );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( insertContentSpy ).not.toHaveBeenCalled();
			expect( contentInsertionSpy ).not.toHaveBeenCalled();
		} );

		it( 'converts content in an "all allowed" context', () => {
			// It's enough if we check this here with a text node and paragraph because if the conversion was made
			// in a normal root, then text or paragraph wouldn't be allowed here.
			const dataTransferMock = createDataTransfer( { 'text/html': 'x<p>y</p>', 'text/plain': 'z' } );
			const spy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( _stringifyModel( spy.mock.calls[ 0 ][ 0 ] ) ).toBe( 'x<paragraph>y</paragraph>' );
		} );

		it( 'does nothing when pasted content is empty', () => {
			const dataTransferMock = createDataTransfer( { 'text/plain': '' } );
			const spy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			expect( spy ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'scrolls the editing document to the selection after the pasted content is inserted', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const inputTransformationSpy = vi.fn();

			clipboardPlugin.on( 'inputTransformation', inputTransformationSpy );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			expect( scrollSpy ).toHaveBeenCalledOnce();
			expect( inputTransformationSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( scrollSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'uses low priority observer for the clipboardInput event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = vi.spyOn( editor.model, 'insertContent' ).mockImplementation( () => {} );

			viewDocument.on( 'clipboardInput', evt => {
				evt.stop();
			} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 0 );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		// https://github.com/ckeditor/ckeditor5/issues/6464
		it( 'should stop propagation of the original event if CKEditor handled the input', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = vi.fn();

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		// https://github.com/ckeditor/ckeditor5/issues/6464
		it( 'should stop propagation of the original event if inputTransformation listener called stop (for file drop)', () => {
			const fileMock = {
				type: 'application/zip',
				size: 1024
			};
			const dataTransferMock = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ], getData: () => {} } );
			const spy = vi.fn();

			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 0 );

			clipboardPlugin.on( 'inputTransformation', evt => {
				evt.stop();
			} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		describe( 'source editor ID in events', () => {
			it( 'should be null when pasting content from outside the editor', () => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>external content</p>' } );
				const inputTransformationSpy = vi.fn();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					inputTransformationSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( inputTransformationSpy ).toHaveBeenCalledWith( null );
			} );

			it( 'should contain an editor ID when pasting content copied from the same editor (in dataTransfer)', () => {
				const spy = vi.fn();

				_setModelData( editor.model, '<paragraph>f[oo]bar</paragraph>' );

				// Copy selected content.
				const dataTransferMock = createDataTransfer();

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {}
				} );

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					spy( data.dataTransfer.getData( 'application/ckeditor5-editor-id' ) );
				} );

				// Paste the copied content.
				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( spy ).toHaveBeenCalledWith( editor.id );
			} );

			it( 'should contain an editor ID when pasting content copied from the same editor', () => {
				const spy = vi.fn();

				_setModelData( editor.model, '<paragraph>f[oo]bar</paragraph>' );

				// Copy selected content.
				const dataTransferMock = createDataTransfer();

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {}
				} );

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					spy( data.sourceEditorId );
				} );

				// Paste the copied content.
				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( spy ).toHaveBeenCalledWith( editor.id );
			} );

			it( 'should be propagated to contentInsertion event (when it\'s external content)', () => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>external content</p>' } );
				const contentInsertionSpy = vi.fn();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					contentInsertionSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( contentInsertionSpy ).toHaveBeenCalledWith( null );
			} );

			it( 'should be propagated to contentInsertion event (when it\'s internal content)', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html': '<p>internal content</p>',
					'application/ckeditor5-editor-id': editor.id
				} );

				const contentInsertionSpy = vi.fn();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					contentInsertionSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( contentInsertionSpy ).toHaveBeenCalledWith( editor.id );
			} );
		} );

		function createDataTransfer( data ) {
			const state = Object.create( data || {} );

			return {
				getData( type ) {
					return state[ type ];
				},
				setData( type, newData ) {
					state[ type ] = newData;
				}
			};
		}
	} );

	describe( 'clipboard copy/cut pipeline', () => {
		it( 'fires the outputTransformation event on the clipboardPlugin', () => {
			return new Promise( resolve => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = vi.fn();

				_setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

				clipboardPlugin.on( 'outputTransformation', ( evt, data ) => {
					expect( preventDefaultSpy ).toHaveBeenCalledOnce();

					expect( data.method ).toBe( 'copy' );
					expect( data.dataTransfer ).toBe( dataTransferMock );
					expect( data.content ).toBeInstanceOf( ModelDocumentFragment );
					expect( _stringifyModel( data.content ) ).toBe( '<paragraph>bc</paragraph><paragraph>de</paragraph>' );
					resolve();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'triggers the conversion with the `isClipboardPipeline` flag', () => {
			return new Promise( resolve => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = vi.fn();
				const toViewSpy = vi.spyOn( editor.data, 'toView' );

				_setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

				clipboardPlugin.on( 'outputTransformation', ( evt, data ) => {
					expect( toViewSpy ).toHaveBeenCalledWith( data.content, { isClipboardPipeline: true } );

					resolve();
				}, { priority: 'lowest' } );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'fires clipboardOutput for copy with the selected content and correct method', () => {
			return new Promise( resolve => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = vi.fn();

				_setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( preventDefaultSpy ).toHaveBeenCalledOnce();
					expect( data.method ).toBe( 'copy' );

					expect( data.dataTransfer ).toBe( dataTransferMock );

					expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
					expect( _stringifyView( data.content ) ).toBe( '<p>bc</p><p>de</p>' );

					resolve();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'fires clipboardOutput for cut with the selected content and correct method', () => {
			return new Promise( resolve => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = vi.fn();

				_setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( data.method ).toBe( 'cut' );

					resolve();
				} );

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'not fires clipboardOutput and preventDefault event for cut when editor is read-only', () => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = vi.fn();
			const spy = vi.fn();

			_setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );
			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.on( 'clipboardOutput', spy );

			viewDocument.fire( 'cut', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );

			expect( spy ).not.toHaveBeenCalled();
			expect( preventDefaultSpy ).toHaveBeenCalledOnce();
		} );

		it( 'uses low priority observer for the copy event', () => {
			const dataTransferMock = createDataTransfer();
			const spy = vi.fn();

			viewDocument.on( 'copy', evt => {
				evt.stop();
			} );

			viewDocument.on( 'clipboardOutput', spy );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'sets clipboard HTML data', () => {
			const dataTransferMock = createDataTransfer();

			const input =
				'<blockquote>' +
					'<p>foo</p>' +
					'<p>bar</p>' +
				'</blockquote>' +
				'<ul>' +
					'<li>u<strong>l ite</strong>m</li>' +
					'<li>ul item</li>' +
				'</ul>' +
				'<p>foobar</p>' +
				'<ol>' +
					'<li>o<a href="foo">l ite</a>m</li>' +
					'<li>ol item</li>' +
				'</ol>' +
				'<figure>' +
					'<img src="foo.jpg" alt="image foo" />' +
					'<figcaption>caption</figcaption>' +
				'</figure>';

			const output =
				'<blockquote>' +
					'<p>foo</p>' +
					'<p>bar</p>' +
				'</blockquote>' +
				'<ul>' +
					'<li>u<strong>l ite</strong>m</li>' +
					'<li>ul item</li>' +
				'</ul>' +
				'<p>foobar</p>' +
				'<ol>' +
					'<li>o<a href="foo">l ite</a>m</li>' +
					'<li>ol item</li>' +
				'</ol>' +
				'<figure>' +
					'<img src="foo.jpg" alt="image foo">' +
					'<figcaption>caption</figcaption>' +
				'</figure>';

			viewDocument.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: _parseView( input ),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).toBe( output );
		} );

		it( 'sets clipboard plain text data', () => {
			const dataTransferMock = createDataTransfer();

			const input =
				'<container:blockquote>' +
					'<container:p>foo</container:p>' +
					'<container:p>bar</container:p>' +
				'</container:blockquote>' +
				'<container:ul>' +
					'<container:li>u<strong>l ite</strong>m</container:li>' +
					'<container:li>ul item</container:li>' +
				'</container:ul>' +
				'<container:p>foobar</container:p>' +
				'<container:ol>' +
					'<container:li>o<a href="foo">l ite</a>m</container:li>' +
					'<container:li>ol item</container:li>' +
				'</container:ol>' +
				'<container:figure>' +
					'<img alt="image foo" src="foo.jpg" />' +
					'<container:figcaption>caption</container:figcaption>' +
				'</container:figure>';

			const output =
				'foo\n' +
				'\n' +
				'bar\n' +
				'\n' +
				'ul item\n' +
				'ul item\n' +
				'\n' +
				'foobar\n' +
				'\n' +
				'ol item\n' +
				'ol item\n' +
				'\n' +
				'image foo\n' +
				'caption';

			viewDocument.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: _parseView( input ),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/plain' ) ).toBe( output );
		} );

		it( 'does not set clipboard HTML data if content is empty', () => {
			const dataTransferMock = createDataTransfer();

			viewDocument.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment(),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).toBeUndefined();
		} );

		it( 'deletes selected content in case of cut', () => {
			const dataTransferMock = createDataTransfer();

			_setModelData( editor.model, '<paragraph>f[o</paragraph><paragraph>x]o</paragraph>' );

			// Change block is only to get writer instance.
			// Writer should not be passed along this event.
			editor.model.change( writer => {
				viewDocument.fire( 'clipboardOutput', {
					dataTransfer: dataTransferMock,
					content: new ViewDocumentFragment(),
					method: 'cut',
					writer
				} );
			} );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>f[]o</paragraph>' );
		} );

		it( 'uses low priority observer for the clipboardOutput event', () => {
			const dataTransferMock = createDataTransfer();

			viewDocument.on( 'clipboardOutput', evt => {
				evt.stop();
			} );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment( [ new ViewText( 'abc' ) ] ),
				preventDefault() {}
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).toBeUndefined();
		} );

		function createDataTransfer() {
			const store = new Map();

			return {
				setData( type, data ) {
					store.set( type, data );
				},

				getData( type ) {
					return store.get( type );
				}
			};
		}
	} );
} );
