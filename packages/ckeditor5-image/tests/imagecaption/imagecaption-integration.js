/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Image from '../../src/image';
import ImageCaption from '../../src/imagecaption';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'ImageCaption integration', () => {
	let editorElement, editor, model, view, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'Enter plugin', () => {
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
				'<paragraph>Foo.</paragraph><image src="foo.png"><caption>Foo.[]</caption></image><paragraph>Bar.</paragraph>'
			);

			viewDocument.fire( 'enter', new DomEventData( viewDocument, getDomEvent(), { isSoft: true } ) );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
				'<image src="foo.png">' +
					'<caption>Foo.[]</caption>' +
				'</image>' +
				'<paragraph>Bar.</paragraph>'
			);

			/* eslint-disable max-len */
			assertViewData(
				'<p>Foo.</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src="foo.png"></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" data-placeholder="Enter image caption">' +
						'Foo.{}' +
					'</figcaption>' +
				'</figure>' +
				'<p>Bar.</p>'
			);
			/* eslint-enable max-len */
		} );
	} );

	describe( 'ShiftEnter plugin', () => {
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
				'<paragraph>Foo.</paragraph><image src="foo.png"><caption>Foo.[]</caption></image><paragraph>Bar.</paragraph>'
			);

			viewDocument.fire( 'enter', new DomEventData( viewDocument, getDomEvent(), { isSoft: true } ) );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
					'<image src="foo.png">' +
						'<caption>Foo.<softBreak></softBreak>[]</caption>' +
					'</image>' +
				'<paragraph>Bar.</paragraph>'
			);

			/* eslint-disable max-len */
			assertViewData(
				'<p>Foo.</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src="foo.png"></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" data-placeholder="Enter image caption">' +
						'Foo.<br></br>[]' +
					'</figcaption>' +
				'</figure>' +
				'<p>Bar.</p>'
			);
			/* eslint-enable max-len */
		} );
	} );

	describe( 'Enter and ShiftEnter plugins', () => {
		beforeEach( () => {
			return ClassicEditor
				.create( editorElement, {
					plugins: [
						ShiftEnter, Typing, Paragraph, Image, ImageCaption
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

		it( 'inserts soft break and text in the caption element', () => {
			setModelData(
				model,
				'<paragraph>Foo.</paragraph><image src="foo.png"><caption>Foo.[]</caption></image><paragraph>Bar.</paragraph>'
			);

			viewDocument.fire( 'enter', new DomEventData( viewDocument, getDomEvent(), { isSoft: true } ) );
			editor.commands.execute( 'input', { text: 'Abc.' } );
			viewDocument.fire( 'enter', new DomEventData( viewDocument, getDomEvent(), { isSoft: false } ) );

			assertModelData(
				'<paragraph>Foo.</paragraph>' +
					'<image src="foo.png"><caption>Foo.<softBreak></softBreak>Abc.[]</caption></image>' +
				'<paragraph>Bar.</paragraph>'
			);

			/* eslint-disable max-len */
			assertViewData(
				'<p>Foo.</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src="foo.png"></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" data-placeholder="Enter image caption">' +
						'Foo.<br></br>Abc.{}' +
					'</figcaption>' +
				'</figure>' +
				'<p>Bar.</p>'
			);
			/* eslint-enable max-len */
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

	function assertViewData( output ) {
		expect( getViewData( view ) ).to.equal( output );
	}
} );
