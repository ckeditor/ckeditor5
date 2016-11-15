/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import Clipboard from 'ckeditor5/clipboard/clipboard.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';

import ClipboardObserver from 'ckeditor5/clipboard/clipboardobserver.js';

import { stringify as stringifyView } from 'ckeditor5/engine/dev-utils/view.js';
import { stringify as stringifyModel } from 'ckeditor5/engine/dev-utils/model.js';

import ViewDocumentFragment from 'ckeditor5/engine/view/documentfragment.js';

describe( 'Clipboard feature', () => {
	let editor, editingView;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ Clipboard, Paragraph ]
			} )
			.then( ( newEditor ) => {
				editor = newEditor;
				editingView = editor.editing.view;
			} );
	} );

	describe( 'constructor()', () => {
		it( 'registers ClipboardObserver', () => {
			expect( editingView.getObserver( ClipboardObserver ) ).to.be.instanceOf( ClipboardObserver );
		} );
	} );

	describe( 'clipboard pipeline', () => {
		it( 'takes HTML data from the dataTransfer', ( done ) => {
			const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );
			const preventDefaultSpy = sinon.spy();

			editingView.on( 'clipboardInput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '<p>x</p>' );

				done();
			} );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'takes plain text data from the dataTransfer if there is no HTML', ( done ) => {
			const dataTransferMock = createDataTransfer( { 'text/plain': 'x\n\ny  z' } );
			const preventDefaultSpy = sinon.spy();

			editingView.on( 'clipboardInput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '<p>x</p><p>y  z</p>' );

				done();
			} );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'fires clipboardInput event with empty data if there is no HTML nor plain text', ( done ) => {
			const dataTransferMock = createDataTransfer( {} );
			const preventDefaultSpy = sinon.spy();

			editingView.on( 'clipboardInput', ( evt, data ) => {
				expect( preventDefaultSpy.calledOnce ).to.be.true;

				expect( data.dataTransfer ).to.equal( dataTransferMock );

				expect( data.content ).is.instanceOf( ViewDocumentFragment );
				expect( stringifyView( data.content ) ).to.equal( '' );

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

			editingView.on( 'paste', ( evt ) => {
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

		it( 'uses low priority observer for the clipboardInput event', () => {
			const dataTransferMock = createDataTransfer( { 'text/html': 'x' } );
			const spy = sinon.stub( editor.data, 'insertContent' );

			editingView.on( 'clipboardInput', ( evt ) => {
				evt.stop();
			} );

			editingView.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( spy.callCount ).to.equal( 0 );
		} );
	} );
} );

function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}
