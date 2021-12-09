/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

class SharedAttributesTest extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.extend( 'paragraph', {
			allowAttributes: [ 'referenceId', 'groupId', 'standardOnElement', 'sharedOnElement' ]
		} );

		schema.extend( '$text', {
			allowAttributes: [ 'referenceId', 'standardOnText', 'sharedOnText' ]
		} );

		schema.setAttributeProperties( 'sharedOnElement', {
			sharedReferenceAttribute: 'groupId'
		} );
		schema.setAttributeProperties( 'groupId', {
			sharedReferenceAttribute: 'referenceId'
		} );

		schema.setAttributeProperties( 'sharedOnText', {
			sharedReferenceAttribute: 'referenceId'
		} );

		editor.conversion.for( 'upcast' )
			.elementToAttribute( {
				view: { name: 'span', attributes: 'data-standard' },
				model: {
					key: 'standardOnText',
					value: viewElement => viewElement.getAttribute( 'data-standard' )
				}
			} )
			.elementToAttribute( {
				view: { name: 'span', attributes: 'data-shared' },
				model: {
					key: 'sharedOnText',
					value: viewElement => viewElement.getAttribute( 'data-shared' )
				}
			} );

		editor.conversion.for( 'downcast' )
			.attributeToElement( {
				model: 'standardOnText',
				view: ( value, { writer } ) => writer.createAttributeElement( 'span', { 'data-standard': value } )
			} )
			.attributeToElement( {
				model: 'sharedOnText',
				view: ( value, { writer } ) => writer.createAttributeElement( 'span', { 'data-shared': value } )
			} );

		editor.conversion.attributeToAttribute( {
			model: 'standardOnElement',
			view: 'data-standard'
		} );

		editor.conversion.attributeToAttribute( {
			model: 'sharedOnElement',
			view: 'data-shared'
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, SourceEditing, SharedAttributesTest ],
		toolbar: [
			'sourceEditing', '|',
			'heading', '|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
