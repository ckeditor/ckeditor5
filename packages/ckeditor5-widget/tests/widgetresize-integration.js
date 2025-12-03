/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { Image, ImageResize } from '@ckeditor/ckeditor5-image';
import { waitForAllImagesLoaded } from '@ckeditor/ckeditor5-image/tests/imageresize/_utils/utils.js';

describe( 'WidgetResize - integration', () => {
	let editor, model, view, viewDocument, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Image, ImageResize ]
		} );

		model = editor.model;
		view = editor.editing.view;
		viewDocument = view.document;
	} );

	afterEach( async () => {
		editorElement.remove();

		vi.restoreAllMocks();

		await editor.destroy();
	} );

	it( 'should not fire viewDocument#mousedown events after starting resizing', async () => {
		const eventSpy = vi.fn();

		_setModelData( model, '[<imageBlock src="/sample.png"></imageBlock>]' );

		await waitForAllImagesLoaded( editor );

		const resizeSquareUI = [ ...viewDocument.getRoot().getChild( 0 ).getChildren() ]
			.find( element => element.hasClass( 'ck-widget__resizer' ) );

		const squareDomElement = view.domConverter.mapViewToDom( resizeSquareUI ).querySelector( '.ck-widget__resizer__handle-top-left' );

		viewDocument.on( 'mousedown', eventSpy );

		squareDomElement.dispatchEvent( new Event( 'mousedown' ) );

		expect( eventSpy ).not.toHaveBeenCalled();
	} );
} );
