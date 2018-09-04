/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Widget ],
		toolbar: [ 'undo', 'redo', 'bold' ]
	} )
	.then( editor => {
		window.editor = editor;

		const model = editor.model;

		model.schema.register( 'widget', {
			inheritAllFrom: '$block',
			isObject: true
		} );

		model.schema.extend( '$text', {
			allowIn: 'nested'
		} );

		model.schema.register( 'nested', {
			allowIn: 'widget',
			isLimit: true
		} );

		editor.conversion.for( 'dataDowncast' )
			.add( downcastElementToElement( {
				model: 'widget',
				view: ( modelItem, writer ) => {
					return writer.createContainerElement( 'div', { class: 'widget' } );
				}
			} ) )
			.add( downcastElementToElement( {
				model: 'nested',
				view: ( modelItem, writer ) => {
					return writer.createEditableElement( 'div', { class: 'nested' } );
				}
			} ) );

		editor.conversion.for( 'editingDowncast' )
			.add( downcastElementToElement( {
				model: 'widget',
				view: ( modelItem, writer ) => {
					const div = writer.createContainerElement( 'div', { class: 'widget' } );

					return toWidget( div, writer, { label: 'widget label' } );
				}
			} ) )
			.add( downcastElementToElement( {
				model: 'nested',
				view: ( modelItem, writer ) => {
					const nested = writer.createEditableElement( 'div', { class: 'nested' } );

					return toWidgetEditable( nested, writer );
				}
			} ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: {
					name: 'div',
					class: 'widget'
				},
				model: 'widget'
			} ) )
			.add( upcastElementToElement( {
				view: {
					name: 'div',
					class: 'nested'
				},
				model: 'nested'
			} ) );

		editor.setData(
			'<p>foobar</p>' +
			'<div class="widget"><div class="nested">bar</div></div>' +
			'<p>foobar</p>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
