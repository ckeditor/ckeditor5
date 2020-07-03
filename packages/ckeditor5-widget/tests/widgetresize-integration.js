/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

describe( 'WidgetResize - integration', () => {
	let editor, model, view, viewDocument, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, { plugins: [ Image, ImageResize ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should not fire viewDocument#mousedown events after starting resizing', () => {
		const eventSpy = sinon.spy().named( 'ViewDocument#mousedown' );

		setModelData( model, '[<image src="/assets/sample.png"></image>]' );

		const resizeSquareUI = [ ...viewDocument.getRoot().getChild( 0 ).getChildren() ]
			.find( element => element.hasClass( 'ck-widget__resizer' ) );

		const squareDomElement = view.domConverter.mapViewToDom( resizeSquareUI ).querySelector( '.ck-widget__resizer__handle-top-left' );

		viewDocument.on( 'mousedown', eventSpy );
		viewDocument.fire( 'mousedown', { domTarget: squareDomElement } );

		expect( eventSpy.called ).to.equal( false );
	} );
} );
