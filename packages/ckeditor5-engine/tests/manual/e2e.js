/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const byClassName = className => element => element.hasClass( className );

function getChildren( editor, viewElement ) {
	return Array.from( editor.editing.view.createRangeIn( viewElement ) )
		.filter( ( { type } ) => type === 'elementStart' )
		.map( ( { item } ) => item );
}

function getBoxUpcastConverter( editor ) {
	return dispatcher => dispatcher.on( 'element:div', ( event, data, conversionApi ) => {
		const viewElement = data.viewItem;
		const writer = conversionApi.writer;

		if ( !viewElement.hasClass( 'box' ) ) {
			return;
		}

		const box = writer.createElement( 'box' );

		if ( !conversionApi.safeInsert( box, data.modelCursor ) ) {
			return;
		}

		const elements = getChildren( editor, viewElement );
		const fields = elements.filter( byClassName( 'box-content-field' ) );

		for ( const field of fields ) {
			const boxField = writer.createElement( 'boxField' );

			conversionApi.safeInsert( boxField, writer.createPositionAt( box, 'end' ) );
			conversionApi.convertChildren( field, boxField );
		}

		conversionApi.consumable.consume( viewElement, { name: true } );
		elements.forEach( element => conversionApi.consumable.consume( element, { name: true } ) );

		conversionApi.updateConversionResult( box, data );
	} );
}

function getBoxDowncastCreator() {
	return ( modelElement, { writer } ) => {
		return writer.createContainerElement( 'div', { class: 'box', 'data-children': modelElement.childCount } );
	};
}

function addButton( editor, uiName, label, callback ) {
	editor.ui.componentFactory.add( uiName, locale => {
		const view = new ButtonView( locale );

		view.set( { label, withText: true } );

		view.listenTo( view, 'execute', () => {
			const parent = editor.model.document.selection.getFirstPosition().parent;
			const boxField = parent.findAncestor( 'boxField' );

			if ( !boxField ) {
				return;
			}

			editor.model.change( writer => callback( writer, boxField.findAncestor( 'box' ), boxField ) );
		} );

		return view;
	} );
}

function Box( editor ) {
	editor.model.schema.register( 'box', {
		allowIn: '$root',
		isObject: true,
		isSelectable: true,
		allowAttributes: [ 'meta' ]
	} );

	editor.model.schema.register( 'boxField', {
		allowContentOf: '$root',
		allowIn: 'box',
		isLimit: true
	} );

	editor.conversion.for( 'upcast' ).add( getBoxUpcastConverter( editor ) );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: {
			name: 'box',
			children: true
		},
		view: getBoxDowncastCreator()
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'boxField',
		view: { name: 'div', classes: 'box-content-field' }
	} );

	addButton( editor, 'addBoxField', '+', ( writer, box, boxField ) => {
		const newBoxField = writer.createElement( 'boxField' );
		writer.insert( newBoxField, box, boxField.index );
		writer.insert( writer.createElement( 'paragraph' ), newBoxField, 0 );
	} );

	addButton( editor, 'removeBoxField', '-', ( writer, box, boxField ) => {
		writer.remove( boxField );
	} );
}

function AddRenderCount( editor ) {
	let insertCount = 0;

	const nextInsert = () => insertCount++;

	editor.conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( 'insert', ( event, data, conversionApi ) => {
		const view = conversionApi.mapper.toViewElement( data.item );

		if ( view ) {
			const insertCount = nextInsert();

			conversionApi.writer.setAttribute( 'data-insert-count', `${ insertCount }`, view );
			conversionApi.writer.setAttribute( 'title', `Insertion counter: ${ insertCount }`, view );
		}
	}, { priority: 'lowest' } ) );
}

async function createEditor() {
	const editor = await ClassicEditor.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Box, AddRenderCount ],
		toolbar: [
			'heading',
			'|',
			'boxTitle',
			'boxAuthor',
			'addBoxField',
			'removeBoxField',
			'|',
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
	} );

	window.editor = editor;
}

createEditor();
