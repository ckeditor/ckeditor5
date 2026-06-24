/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Image } from '../../src/image.js';
import { ImageCaption } from '../../src/imagecaption.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ViewDocumentDomEventData, _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';

import { global } from '@ckeditor/ckeditor5-utils';

describe( 'ImageCaption integration', () => {
	let editorElement, editor, model, view, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'with Enter plugin only', () => {
		beforeEach( () => {
			return ClassicEditor
				.create( editorElement, {
					plugins: [
						Enter, Typing, Paragraph, Image, ImageCaption
					]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
					viewDocument = view.document;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'does nothing if soft enter was pressed', () => {
			_setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/sample.png"><caption>Foo.[]</caption></imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);

			const domEvent = new ViewDocumentDomEventData( viewDocument, getDomEvent(), { isSoft: true } );
			const preventDefaultOriginal = domEvent.preventDefault.bind( domEvent );
			const preventDefaultStub = vi.spyOn( domEvent, 'preventDefault' ).mockImplementation( preventDefaultOriginal );

			viewDocument.fire( 'enter', domEvent );

			expect( preventDefaultStub.mock.calls.length ).toBe( 1 );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/sample.png">' +
					'<caption>Foo.[]</caption>' +
				'</imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );
	} );

	describe( 'with Enter and ShiftEnter plugins', () => {
		beforeEach( () => {
			return ClassicEditor
				.create( editorElement, {
					plugins: [
						Enter, ShiftEnter, Typing, Paragraph, Image, ImageCaption
					]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
					viewDocument = view.document;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'inserts a soft break when soft enter was pressed', () => {
			_setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/sample.png"><caption>Foo.[]</caption></imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);

			const domEvent = new ViewDocumentDomEventData( viewDocument, getDomEvent(), { isSoft: true } );
			const preventDefaultOriginal = domEvent.preventDefault.bind( domEvent );
			const preventDefaultStub = vi.spyOn( domEvent, 'preventDefault' ).mockImplementation( preventDefaultOriginal );

			viewDocument.fire( 'enter', domEvent );

			// One call comes from Enter plugin, the second one from ShiftEnter.
			expect( preventDefaultStub.mock.calls.length ).toBe( 2 );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
					'<imageBlock src="/sample.png">' +
						'<caption>Foo.<softBreak></softBreak>[]</caption>' +
					'</imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}

	function assertModelData( output ) {
		expect( _getModelData( model ) ).toBe( output );
	}
} );
