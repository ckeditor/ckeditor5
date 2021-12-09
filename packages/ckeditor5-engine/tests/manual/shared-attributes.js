/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import { setData as setModelData } from '../../src/dev-utils/model';

class SharedAttributesTest extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		//
		// Text attributes.
		//

		schema.extend( '$text', {
			allowAttributes: [ 'itemId', 'standardOnText', 'sharedOnText' ]
		} );
		schema.setAttributeProperties( 'sharedOnText', {
			sharedReferenceAttribute: 'itemId'
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

		//
		// Element attributes.
		//

		schema.extend( 'paragraph', {
			allowAttributes: [ 'itemId', 'groupId', 'standardOnElement', 'groupSharedOnElement', 'itemSharedOnElement' ]
		} );

		schema.setAttributeProperties( 'groupId', {
			sharedReferenceAttribute: 'itemId'
		} );
		schema.setAttributeProperties( 'groupSharedOnElement', {
			sharedReferenceAttribute: 'groupId'
		} );
		schema.setAttributeProperties( 'itemSharedOnElement', {
			sharedReferenceAttribute: 'itemId'
		} );

		editor.conversion.attributeToAttribute( {
			model: 'standardOnElement',
			view: 'data-standard'
		} );

		editor.conversion.attributeToAttribute( {
			model: 'groupSharedOnElement',
			view: 'data-shared'
		} );

		editor.conversion.attributeToAttribute( {
			model: 'itemSharedOnElement',
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
		},
		initialData: ''
	} )
	.then( editor => {
		window.editor = editor;

		setModelData( editor.model,
			'<paragraph groupId="g1" itemId="g1i1" groupSharedOnElement="first-group" itemSharedOnElement="1aaa">1a1</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i1" groupSharedOnElement="first-group" itemSharedOnElement="1aaa">1a2</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i2" groupSharedOnElement="first-group" itemSharedOnElement="1bbb">1b1</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i2" groupSharedOnElement="first-group" itemSharedOnElement="1bbb">1b2</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i1" groupSharedOnElement="second-group" itemSharedOnElement="2aaa">2a1</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i1" groupSharedOnElement="second-group" itemSharedOnElement="2aaa">2a2</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i2" groupSharedOnElement="second-group" itemSharedOnElement="2bbb">2b1</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i2" groupSharedOnElement="second-group" itemSharedOnElement="2bbb">2b2</paragraph>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
