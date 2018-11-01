/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import ViewPosition from '../../../../src/view/position';
import { downcastElementToElement } from '../../../../src/conversion/downcast-converters';
import { setData } from '../../../../src/dev-utils/model';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Widget ],
		toolbar: [ 'undo', 'redo' ]
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

		editor.conversion.for( 'downcast' )
			.add( downcastElementToElement( {
				model: 'widget',
				view: ( modelItem, writer ) => {
					const b = writer.createAttributeElement( 'b' );
					const div = writer.createContainerElement( 'div' );

					writer.insert( ViewPosition._createAt( div ), b );

					return toWidget( div, writer, { label: 'element label' } );
				}
			} ) )
			.add( downcastElementToElement( {
				model: 'nested',
				view: ( item, writer ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
			} ) );

		setData( editor.model,
			'<paragraph>foo[]</paragraph>' +
			'<widget><nested>bar</nested></widget>' +
			'<widget><nested>bom</nested></widget>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
