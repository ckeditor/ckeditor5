/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

function getChildren( editor, viewElement ) {
	return Array.from( editor.editing.view.createRangeIn( viewElement ) )
		.filter( ( { type } ) => type === 'elementStart' )
		.map( ( { item } ) => item );
}

function getBoxUpcastConverter( editor ) {
	return dispatcher => dispatcher.on( 'element:figure', ( event, data, conversionApi ) => {
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
		const content = elements.find( element => element.hasClass( 'box-content' ) );
		const captions = elements.filter( element => element.is( 'element', 'figcaption' ) );

		conversionApi.convertChildren( content, box );
		conversionApi.consumable.consume( content, { name: true } );

		for ( const caption of captions ) {
			conversionApi.convertItem( caption, writer.createPositionAt( box, 'end' ) );
		}

		conversionApi.updateConversionResult( box, data );
	} );
}

function getBoxDowncastCreator() {
	return ( modelElement, conversionApi ) => {
		const { writer, slotFor } = conversionApi;

		const viewBox = writer.createContainerElement( 'figure', { class: 'box' } );
		const contentWrap = writer.createContainerElement( 'div', { class: 'box-content' } );

		writer.insert( writer.createPositionAt( viewBox, 0 ), contentWrap );
		writer.insert( writer.createPositionAt( contentWrap, 0 ), slotFor( element => !element.is( 'element', 'boxCaption' ) ) );
		writer.insert( writer.createPositionAt( viewBox, 'end' ), slotFor( element => element.is( 'element', 'boxCaption' ) ) );

		return viewBox;
	};
}

function Box( editor ) {
	editor.model.schema.register( 'box', {
		allowIn: '$root',
		isObject: true,
		isSelectable: true,
		allowContentOf: '$root'
	} );

	editor.model.schema.register( 'boxCaption', {
		allowContentOf: '$block',
		allowIn: 'box',
		isLimit: true
	} );

	editor.conversion.for( 'upcast' ).add( getBoxUpcastConverter( editor ) );
	editor.conversion.for( 'upcast' ).elementToElement( { view: 'figcaption', model: 'boxCaption' } );

	editor.conversion.for( 'downcast' ).elementToStructure( {
		model: {
			name: 'box',
			children: true
		},
		view: getBoxDowncastCreator()
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'boxCaption',
		view: 'figcaption'
	} );

	editor.ui.componentFactory.add( 'addCaption', locale => {
		const view = new ButtonView( locale );

		view.set( { label: 'Add caption', withText: true } );

		view.listenTo( view, 'execute', () => {
			const box = editor.model.document.selection.getFirstPosition().findAncestor( 'box' );

			if ( box ) {
				editor.model.change( writer => {
					writer.insertElement( 'boxCaption', box, 'end' );
				} );
			}
		} );

		return view;
	} );

	editor.ui.componentFactory.add( 'removeCaption', locale => {
		const view = new ButtonView( locale );

		view.set( { label: 'Remove caption', withText: true } );

		view.listenTo( view, 'execute', () => {
			const boxCaption = editor.model.document.selection.getFirstPosition().findAncestor( 'boxCaption' );

			if ( boxCaption ) {
				editor.model.change( writer => {
					writer.remove( boxCaption );
				} );
			}
		} );

		return view;
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

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ ArticlePluginSet, CodeBlock, Box, AddRenderCount ],
	toolbar: [
		'heading',
		'|',
		'addCaption',
		'removeCaption',
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
		'codeBlock',
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
} ).then( editor => {
	window.editor = editor;
} );
