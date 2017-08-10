/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '../src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClipboardObserver from '../src/clipboardobserver';

import {
	stringify as stringifyView,
	parse as parseView
} from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import {
	stringify as stringifyModel,
	setData as setModelData,
	getData as getModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';

describe( 'Clipboard feature', () => {
	let editor, editingView, clipboardPlugin, scrollSpy;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Clipboard, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
				clipboardPlugin = editor.plugins.get( 'Clipboard' );

				// VirtualTestEditor has no DOM, so this method must be stubbed for all tests.
				// Otherwise it will throw as it accesses the DOM to do its job.
				scrollSpy = sinon.stub( editingView, 'scrollToTheSelection' );
			} );
	} );

	describe( 'constructor()', () => {
		it( 'registers ClipboardObserver', () => {
			expect( editingView.getObserver( ClipboardObserver ) ).to.be.instanceOf( ClipboardObserver );
		} );
	} );

	describe( 'clipboard paste pipeline', () => {
		describe( 'takes HTML data from the dataTransfer', () => {
			it( 'and fires the clipboardInput event on the editingView', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				editingView.on( 'clipboardInput', ( evt, data ) => {
					expect( preventDefaultSpy.calledOnce ).to.be.true;
					expect( data.dataTransfer ).to.equal( dataTransferMock );

					done();
				} );

				editingView.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( stringifyView( data.content ) ).to.equal( '<p>x</p>' );

					done();
				} );

				editingView.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		describe( 'takes plain text data from the dataTransfer if there is no HTML', () => {
			it( 'and fires the clipboardInput event on the editingView', done => {
				const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
				const preventDefaultSpy = sinon.spy();

				editingView.on( 'clipboardInput', ( evt, data ) => {
					expect( preventDefaultSpy.calledOnce ).to.be.true;
					expect( data.dataTransfer ).to.equal( dataTransferMock );

					done();
				} );

				editingView.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'and fires the inputTransformation event on the clipboardPlugin', done => {
				const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
				const preventDefaultSpy = sinon.spy();

				clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( stringifyView( data.content ) ).to.equal( '<p>x</p><p>y  z</p>' );

					done();
				} );

				editingView.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );
		} );

		it( 'fires events with empty data if there is no HTML nor plain text', done => {
			const dataTransferMock = createDataTransfer( {} );
			const preventDefaultSpy = sinon.spy();
			const editorViewCalled = sinon.spy();

			editingView.on( 'clipboardInput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				editorViewCalled();
			} );

			clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '' );

				expect( editorViewCalled.calledOnce ).to.be.true;

				done();
			} );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'uses low priority observer for the paste event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.spy();

			editingView.on( 'paste', evt => {
				evt.stop();
			} );

			editingView.on( 'clipboardInput', spy );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'inserts content to the editor', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.calledOnce ).to.be.true;
			expect( stringifyModel( spy.args[ 0 ][ 0 ] ) ).to.equal( '<paragraph>x</paragraph>' );
		} );

		it( 'do not insert content when editor is read-only', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editor.isReadOnly = true;

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'converts content in an "all allowed" context', () => {
			// It's enough if we check this here with a text node and paragraph because if the conversion was made
			// in a normal root, then text or paragraph wouldn't be allowed here.
			const dataTransferMock = createDataTransfer( { 'text/html': 'x<p>y</p>', 'text/plain': 'z' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.calledOnce ).to.be.true;
			expect( stringifyModel( spy.args[ 0 ][ 0 ] ) ).to.equal( 'x<paragraph>y</paragraph>' );
		} );

		it( 'does nothing when pasted content is empty', () => {
			const dataTransferMock = createDataTransfer( { 'text/plain': '' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editingView.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'scrolls the editing document to the selection after the pasted content is inserted', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const inputTransformationSpy = sinon.spy();

			clipboardPlugin.on( 'inputTransformation', inputTransformationSpy );

			editingView.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment()
			} );

			sinon.assert.calledOnce( scrollSpy );
			sinon.assert.callOrder( inputTransformationSpy, scrollSpy );
		} );

		it( 'uses low priority observer for the clipboardInput event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editingView.on( 'clipboardInput', evt => {
				evt.stop();
			} );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );

		function createDataTransfer( data ) {
			return {
				getData( type ) {
					return data[ type ];
				}
			};
		}
	} );

	describe( 'clipboard copy/cut pipeline', () => {
		it( 'fires clipboardOutput for copy with the selected content and correct method', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			setModelData( editor.document, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			editingView.on( 'clipboardOutput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;
				expect( data.method ).to.equal( 'copy' );

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '<p>bc</p><p>de</p>' );

				done();
			} );

			editingView.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'fires clipboardOutput for cut with the selected content and correct method', done => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			setModelData( editor.document, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );

			editingView.on( 'clipboardOutput', ( evt, data ) => {
				expect( data.method ).to.equal( 'cut' );

				done();
			} );

			editingView.fire( 'cut', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'not fires clipboardOutput and preventDefault event for cut when editor is read-only', () => {
			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();
			const spy = sinon.spy();

			setModelData( editor.document, '<paragraph>a[bc</paragraph><paragraph>de]f</paragraph>' );
			editor.isReadOnly = true;

			editingView.on( 'clipboardOutput', spy );

			editingView.fire( 'cut', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'uses low priority observer for the copy event', () => {
			const dataTransferMock = createDataTransfer();
			const spy = sinon.spy();

			editingView.on( 'copy', evt => {
				evt.stop();
			} );

			editingView.on( 'clipboardOutput', spy );

			editingView.fire( 'copy', {
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
					'<img alt="image foo" src="foo.jpg">' + // Weird attributes ordering behavior + no closing "/>".
					'<figcaption>caption</figcaption>' +
				'</figure>';

			editingView.fire( 'clipboardOutput', {
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

			editingView.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: parseView( input ),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/plain' ) ).to.equal( output );
		} );

		it( 'does not set clipboard HTML data if content is empty', () => {
			const dataTransferMock = createDataTransfer();

			editingView.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment(),
				method: 'copy'
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).to.be.undefined;
		} );

		it( 'deletes selected content in case of cut', () => {
			const dataTransferMock = createDataTransfer();

			setModelData( editor.document, '<paragraph>f[o</paragraph><paragraph>x]o</paragraph>' );

			editingView.fire( 'clipboardOutput', {
				dataTransfer: dataTransferMock,
				content: new ViewDocumentFragment(),
				method: 'cut'
			} );

			expect( getModelData( editor.document ) ).to.equal( '<paragraph>f[]o</paragraph>' );
		} );

		it( 'uses low priority observer for the clipboardOutput event', () => {
			const dataTransferMock = createDataTransfer();

			editingView.on( 'clipboardOutput', evt => {
				evt.stop();
			} );

			editingView.fire( 'copy', {
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
