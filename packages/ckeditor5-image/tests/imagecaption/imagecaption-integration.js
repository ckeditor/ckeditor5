/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Image from '../../src/image.js';
import ImageCaption from '../../src/imagecaption.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

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
			setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/assets/sample.png"><caption>Foo.[]</caption></imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);

			const domEvent = new DomEventData( viewDocument, getDomEvent(), { isSoft: true } );
			const preventDefaultOriginal = domEvent.preventDefault;
			const preventDefaultStub = sinon.stub( domEvent, 'preventDefault' ).callsFake( preventDefaultOriginal );

			viewDocument.fire( 'enter', domEvent );

			expect( preventDefaultStub.callCount ).to.equal( 1 );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/assets/sample.png">' +
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
			setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'<imageBlock src="/assets/sample.png"><caption>Foo.[]</caption></imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);

			const domEvent = new DomEventData( viewDocument, getDomEvent(), { isSoft: true } );
			const preventDefaultOriginal = domEvent.preventDefault;
			const preventDefaultStub = sinon.stub( domEvent, 'preventDefault' ).callsFake( preventDefaultOriginal );

			viewDocument.fire( 'enter', domEvent );

			// One call comes from Enter plugin, the second one from ShiftEnter.
			expect( preventDefaultStub.callCount ).to.equal( 2 );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
					'<imageBlock src="/assets/sample.png">' +
						'<caption>Foo.<softBreak></softBreak>[]</caption>' +
					'</imageBlock>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}

	function assertModelData( output ) {
		expect( getModelData( model ) ).to.equal( output );
	}
} );
