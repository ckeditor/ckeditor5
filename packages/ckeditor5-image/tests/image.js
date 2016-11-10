/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import Image from 'ckeditor5/image/image.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import ImageEngine from 'ckeditor5/image/imageengine.js';
import MouseDownObserver from 'ckeditor5/image/mousedownobserver.js';
import { getData as getModelData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'Image', () => {
	let editor, document, viewDocument, imageFeature;

	beforeEach( () => {
		const editorElement = window.document.createElement( 'div' );
		window.document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			features: [ Image, Paragraph ]
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
				imageFeature = editor.plugins.get( Image );
			} );
	} );

	it( 'should be loaded', () => {
		expect( imageFeature ).to.instanceOf( Image );
	} );

	it( 'should load ImageEngine', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.instanceOf( ImageEngine );
	} );

	it( 'should add MouseDownObserver', () => {
		expect( viewDocument.getObserver( MouseDownObserver ) ).to.be.instanceOf( MouseDownObserver );
	} );

	it( 'should create selection in model on mousedown event', () => {
		editor.setData( '<figure class="image"><img src="image.png" alt="alt text" /></figure>' );
		const imageWidget = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: imageWidget,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.calledOnce( domEventDataMock.preventDefault );
		expect( getModelData( document ) ).to.equal( '[<image alt="alt text" src="image.png"></image>]' );
	} );

	it( 'should do not change model if mousedown event is not on image', () => {
		editor.setData( '<p>foo bar</p><figure class="image"><img src="image.png" alt="alt text" /></figure>' );

		const paragraph = viewDocument.getRoot().getChild( 0 );

		const domEventDataMock = {
			target: paragraph,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );
		sinon.assert.notCalled( domEventDataMock.preventDefault );

		expect( getModelData( document ) )
			.to.equal( '<paragraph>[]foo bar</paragraph><image alt="alt text" src="image.png"></image>' );
	} );

	it( 'should not focus editable if already is focused', () => {
		editor.setData( '<figure class="image"><img src="image.png" alt="alt text" /></figure>' );
		const imageWidget = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: imageWidget,
			preventDefault: sinon.spy()
		};
		const focusSpy = sinon.spy( viewDocument, 'focus' );

		viewDocument.isFocused = true;
		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.calledOnce( domEventDataMock.preventDefault );
		sinon.assert.notCalled( focusSpy );
		expect( getModelData( document ) ).to.equal( '[<image alt="alt text" src="image.png"></image>]' );
	} );
} );
