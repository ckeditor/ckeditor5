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
			allowAttributes: [ 'itemId', 'groupId', 'standard', 'groupShared', 'itemShared' ]
		} );

		schema.setAttributeProperties( 'groupId', {
			sharedReferenceAttribute: 'itemId'
		} );
		schema.setAttributeProperties( 'groupShared', {
			sharedReferenceAttribute: 'groupId'
		} );
		schema.setAttributeProperties( 'itemShared', {
			sharedReferenceAttribute: 'itemId'
		} );

		editor.conversion.attributeToAttribute( {
			model: 'standard',
			view: 'data-standard'
		} );
		editor.conversion.attributeToAttribute( {
			model: 'itemId',
			view: 'data-item-id'
		} );
		editor.conversion.attributeToAttribute( {
			model: 'groupId',
			view: 'data-group-id'
		} );
		editor.conversion.attributeToAttribute( {
			model: 'groupShared',
			view: 'data-group-shared'
		} );
		editor.conversion.attributeToAttribute( {
			model: 'itemShared',
			view: 'data-item-shared'
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
			'<paragraph groupId="g1" itemId="g1i1" groupShared="first-group" itemShared="1aaa">1a1</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i1" groupShared="first-group" itemShared="1aaa">1a2</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i2" groupShared="first-group" itemShared="1bbb">1b1</paragraph>' +
			'<paragraph groupId="g1" itemId="g1i2" groupShared="first-group" itemShared="1bbb">1b2</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i1" groupShared="second-group" itemShared="2aaa">2a1</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i1" groupShared="second-group" itemShared="2aaa">2a2</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i2" groupShared="second-group" itemShared="2bbb">2b1</paragraph>' +
			'<paragraph groupId="g2" itemId="g2i2" groupShared="second-group" itemShared="2bbb">2b2</paragraph>'
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
