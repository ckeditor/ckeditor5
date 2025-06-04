/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

import ViewPosition from '../../../../src/view/position.js';
import { setData } from '../../../../src/dev-utils/model.js';

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
			.elementToElement( {
				model: 'widget',
				view: ( modelItem, { writer } ) => {
					const b = writer.createAttributeElement( 'b' );
					const div = writer.createContainerElement( 'div' );

					writer.insert( ViewPosition._createAt( div, 0 ), b );

					return toWidget( div, writer, { label: 'element label' } );
				}
			} )
			.elementToElement( {
				model: 'nested',
				view: ( item, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
			} );

		setData( editor.model,
			'<paragraph>foo[]</paragraph>' +
			'<widget><nested>bar</nested></widget>' +
			'<widget><nested>bom</nested></widget>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
