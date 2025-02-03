/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClipboardPipeline from '../src/clipboardpipeline.js';
import ClipboardObserver from '../src/clipboardobserver.js';
import DataTransfer from '@ckeditor/ckeditor5-engine/src/view/datatransfer.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment.js';
import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment.js';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text.js';
import {
	stringify as stringifyView,
	parse as parseView
} from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import {
	stringify as stringifyModel,
	setData as setModelData,
	getData as getModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ClipboardPipeline feature', () => {
	let editor, view, viewDocument, clipboardPlugin, scrollSpy;

	testUtils.createSinonSandbox();

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
				scrollSpy = sinon.stub( view, 'scrollToTheSelection' );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ClipboardPipeline.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ClipboardPipeline.isPremiumPlugin ).to.be.false;
	} );

	describe( 'constructor()', () => {
		it( 'registers ClipboardObserver', () => {
			expect( view.getObserver( ClipboardObserver ) ).to.be.instanceOf( ClipboardObserver );
		} );
	} );

	describe( 'clipboard paste pipeline', () => {
		describe( 'takes HTML data from the dataTransfer', () => {
			it( 'and fires the clipboardInput event on the editingView', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				viewDocument.on( 'clipboardInput', ( evt, data ) => {
					expect( preventDefaultSpy.calledOnce ).to.be.true;
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyView( data.content ) ).to.equal( '<p>x</p>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ModelDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyModel( data.content ) ).to.equal( '<paragraph>x</paragraph>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		describe( 'takes plain text data from the dataTransfer if there is no HTML', () => {
			it( 'and fires the clipboardInput event on the editingView', done => {
				const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
				const preventDefaultSpy = sinon.spy();

				viewDocument.on( 'clipboardInput', ( evt, data ) => {
					expect( preventDefaultSpy.calledOnce ).to.be.true;
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy,
					method: 'paste'
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyView( data.content ) ).to.equal( '<p>x</p><p>y  z</p>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy,
					method: 'paste'
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ModelDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyModel( data.content ) ).to.equal( '<paragraph>x</paragraph><paragraph>y  z</paragraph>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy,
					method: 'paste'
				} );
			} );
		} );

		describe( 'should be possible to override clipboardInput data', () => {
			it( 'fires the inputTransformation event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				viewDocument.on( 'clipboardInput', ( evt, data ) => {
					const fragment = new ViewDocumentFragment();

					fragment._appendChild( parseView( '<p>foo</p>' ) );
					data.content = fragment;
				} );

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyView( data.content ) ).to.equal( '<p>foo</p>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'and fires the contentInsertion event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				viewDocument.on( 'clipboardInput', ( evt, data ) => {
					const fragment = new ViewDocumentFragment();

					fragment._appendChild( parseView( '<p>foo</p>' ) );
					data.content = fragment;
				} );

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ModelDocumentFragment );
					expect( data.dataTransfer ).to.equal( dataTransferMock );
					expect( data.method ).to.equal( 'paste' );
					expect( stringifyModel( data.content ) ).to.equal( '<paragraph>foo</paragraph>' );

					done();
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'fires events with empty data if there is no HTML nor plain text', done => {
			const dataTransferMock = createDataTransfer( {} );
			const preventDefaultSpy = sinon.spy();
			const editorViewCalled = sinon.spy();

			viewDocument.on( 'clipboardInput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				editorViewCalled();
			} );

			clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( data.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( data.content ) ).to.equal( '' );

				expect( editorViewCalled.calledOnce ).to.be.true;

				done();
			} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'uses low priority observer for the paste event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.spy();

			viewDocument.on( 'paste', evt => {
				evt.stop();
			} );

			viewDocument.on( 'clipboardInput', spy );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'inserts content to the editor', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = sinon.stub( editor.model, 'insertContent' );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy.calledOnce ).to.be.true;
			expect( stringifyModel( spy.args[ 0 ][ 0 ] ) ).to.equal( '<paragraph>x</paragraph>' );
		} );

		it( 'does not insert content when editor is read-only', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = sinon.stub( editor.model, 'insertContent' );

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'stops `clipboardInput` event on highest priority when editor is read-only', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = sinon.spy();

			viewDocument.on( 'clipboardInput', spy, { priority: 'high' } );

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				method: 'paste'
			} );

			sinon.assert.notCalled( spy );

			editor.disableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'does not insert content if the whole content was invalid', () => {
			// Whole content is invalid. Even though there is "view" content, the "model" content would be empty.
			// Do not insert content in this case.
			const dataTransferMock = createDataTransfer( { 'text/html': '<unknownTag></unknownTag>', 'text/plain': '' } );
			const insertContentSpy = sinon.stub( editor.model, 'insertContent' );
			const contentInsertionSpy = sinon.spy();

			clipboardPlugin.on( 'contentInsertion', () => contentInsertionSpy() );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			sinon.assert.notCalled( insertContentSpy );
			sinon.assert.notCalled( contentInsertionSpy );
		} );

		it( 'converts content in an "all allowed" context', () => {
			// It's enough if we check this here with a text node and paragraph because if the conversion was made
			// in a normal root, then text or paragraph wouldn't be allowed here.
			const dataTransferMock = createDataTransfer( { 'text/html': 'x<p>y</p>', 'text/plain': 'z' } );
			const spy = sinon.stub( editor.model, 'insertContent' );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy.calledOnce ).to.be.true;
			expect( stringifyModel( spy.args[ 0 ][ 0 ] ) ).to.equal( 'x<paragraph>y</paragraph>' );
		} );

		it( 'does nothing when pasted content is empty', () => {
			const dataTransferMock = createDataTransfer( { 'text/plain': '' } );
			const spy = sinon.stub( editor.model, 'insertContent' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'scrolls the editing document to the selection after the pasted content is inserted', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const inputTransformationSpy = sinon.spy();

			clipboardPlugin.on( 'inputTransformation', inputTransformationSpy );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			sinon.assert.calledOnce( scrollSpy );
			sinon.assert.callOrder( inputTransformationSpy, scrollSpy );
		} );

		it( 'uses low priority observer for the clipboardInput event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.stub( editor.model, 'insertContent' );

			viewDocument.on( 'clipboardInput', evt => {
				evt.stop();
			} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		// https://github.com/ckeditor/ckeditor5/issues/6464
		it( 'should stop propagation of the original event if CKEditor handled the input', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.spy();

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 1 );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		// https://github.com/ckeditor/ckeditor5/issues/6464
		it( 'should stop propagation of the original event if inputTransformation listener called stop (for file drop)', () => {
			const fileMock = {
				type: 'application/zip',
				size: 1024
			};
			const dataTransferMock = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ], getData: () => {} } );
			const spy = sinon.spy();

			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );

			clipboardPlugin.on( 'inputTransformation', evt => {
				evt.stop();
			} );

			viewDocument.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation: spy,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 1 );
		} );

		describe( 'source editor ID in events', () => {
			it( 'should be null when pasting content from outside the editor', () => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>external content</p>' } );
				const inputTransformationSpy = sinon.spy();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					inputTransformationSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				sinon.assert.calledWith( inputTransformationSpy, null );
			} );

			it( 'should contain an editor ID when pasting content copied from the same editor (in dataTransfer)', () => {
				const spy = sinon.spy();

				setModelData( editor.model, '<paragraph>f[oo]bar</paragraph>' );

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

				sinon.assert.calledWith( spy, editor.id );
			} );

			it( 'should contain an editor ID when pasting content copied from the same editor', () => {
				const spy = sinon.spy();

				setModelData( editor.model, '<paragraph>f[oo]bar</paragraph>' );

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

				sinon.assert.calledWith( spy, editor.id );
			} );

			it( 'should be propagated to contentInsertion event (when it\'s external content)', () => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>external content</p>' } );
				const contentInsertionSpy = sinon.spy();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					contentInsertionSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				sinon.assert.calledWith( contentInsertionSpy, null );
			} );

			it( 'should be propagated to contentInsertion event (when it\'s internal content)', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html': '<p>internal content</p>',
					'application/ckeditor5-editor-id': editor.id
				} );

				const contentInsertionSpy = sinon.spy();

				clipboardPlugin.on( 'contentInsertion', ( evt, data ) => {
					contentInsertionSpy( data.sourceEditorId );
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				sinon.assert.calledWith( contentInsertionSpy, editor.id );
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
		it( 'fires the outputTransformation event on the clipboardPlugin', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			clipboardPlugin.on( 'outputTransformation', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.method ).to.equal( 'copy' );
				expect( data.dataTransfer ).to.equal( dataTransferMock );
				expect( data.content ).is.instanceOf( ModelDocumentFragment );
				expect( stringifyModel( data.content ) ).to.equal( '<paragraph>bc</paragraph><paragraph>de</paragraph>' );
				done();
			} );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'triggers the conversion with the `isClipboardPipeline` flag', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();
			const toViewSpy = sinon.spy( editor.data, 'toView' );

			setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			clipboardPlugin.on( 'outputTransformation', ( evt, data ) => {
				expect( toViewSpy ).calledWithExactly( data.content, { isClipboardPipeline: true } );

				done();
			}, { priority: 'lowest' } );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'fires clipboardOutput for copy with the selected content and correct method', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			viewDocument.on( 'clipboardOutput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;
				expect( data.method ).to.equal( 'copy' );

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '<p>bc</p><p>de</p>' );

				done();
			} );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'fires clipboardOutput for cut with the selected content and correct method', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			viewDocument.on( 'clipboardOutput', ( evt, data ) => {
				expect( data.method ).to.equal( 'cut' );

				done();
			} );

			viewDocument.fire( 'cut', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'not fires clipboardOutput and preventDefault event for cut when editor is read-only', () => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();
			const spy = sinon.spy();

			setModelData( editor.model, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );
			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.on( 'clipboardOutput', spy );

			viewDocument.fire( 'cut', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'uses low priority observer for the copy event', () => {
			const dataTransferMock = createDataTransfer();
			const spy = sinon.spy();

			viewDocument.on( 'copy', evt => {
				evt.stop();
			} );

			viewDocument.on( 'clipboardOutput', spy );

			viewDocument.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
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
				content: parseView( input ),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).to.equal( output );
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
				content: parseView( input ),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/plain' ) ).to.equal( output );
		} );

		it( 'does not set clipboard HTML data if content is empty', () => {
			const dataTransferMock = createDataTransfer();

			viewDocument.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment(),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).to.be.undefined;
		} );

		it( 'deletes selected content in case of cut', () => {
			const dataTransferMock = createDataTransfer();

			setModelData( editor.model, '<paragraph>f[o</paragraph><paragraph>x]o</paragraph>' );

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

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>f[]o</paragraph>' );
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

			expect( dataTransferMock.getData( 'text/html' ) ).to.be.undefined;
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
