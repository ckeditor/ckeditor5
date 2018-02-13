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

import AttributeContainer from '../../../../src/view/attributeelement';
import ViewContainer from '../../../../src/view/containerelement';
import { downcastElementToElement } from '../../../../src/conversion/downcast-converters';
import { setData } from '../../../../src/dev-utils/model';
import ViewEditable from '../../../../src/view/editableelement';

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
				view: () => {
					const b = new AttributeContainer( 'b' );
					const div = new ViewContainer( 'div', null, b );

					return toWidget( div, { label: 'element label' } );
				}
			} ) )
			.add( downcastElementToElement( {
				model: 'nested',
				view: () => new ViewEditable( 'figcaption', { contenteditable: true } )
			} ) );

		setData( editor.model,
			'<paragraph>foo[]</paragraph>' +
			'<widget><nested>bar</nested></widget>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
