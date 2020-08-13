/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const byClassName = className => element => element.hasClass( className );

const getRandom = () => parseInt( Math.random() * 1000 );

function mapMeta( editor ) {
	return metaElement => {
		if ( metaElement.hasClass( 'box-meta-header' ) ) {
			const title = getChildren( editor, metaElement )
				.filter( byClassName( 'box-meta-header-title' ) )
				.pop().getChild( 0 ).getChild( 0 ).data;

			return {
				header: {
					title
				}
			};
		}

		if ( metaElement.hasClass( 'box-meta-author' ) ) {
			const link = metaElement.getChild( 0 );

			return {
				author: {
					name: link.getChild( 0 ).data,
					website: link.getAttribute( 'href' )
				}
			};
		}
	};
}

function getChildren( editor, viewElement ) {
	return [ ...( editor.editing.view.createRangeIn( viewElement ) ) ]
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
		const metaElements = elements.filter( byClassName( 'box-meta' ) );

		const meta = metaElements.map( mapMeta( editor ) ).reduce( ( prev, current ) => Object.assign( prev, current ), {} );

		writer.setAttribute( 'meta', meta, box );

		for ( const field of fields ) {
			const boxField = writer.createElement( 'boxField' );

			conversionApi.safeInsert( boxField, writer.createPositionAt( box, field.index ) );
			conversionApi.convertChildren( field, boxField );
		}

		conversionApi.consumable.consume( viewElement, { name: true } );
		elements.map( element => {
			conversionApi.consumable.consume( element, { name: true } );
		} );

		conversionApi.updateConversionResult( box, data );
	} );
}

function downcastBox( modelElement, conversionApi ) {
	const { writer } = conversionApi;

	const viewBox = writer.createContainerElement( 'div', { class: 'box' } );
	conversionApi.mapper.bindElements( modelElement, viewBox );

	const contentWrap = writer.createContainerElement( 'div', { class: 'box-content' } );
	writer.insert( writer.createPositionAt( viewBox, 0 ), contentWrap );

	for ( const [ meta, metaValue ] of Object.entries( modelElement.getAttribute( 'meta' ) ) ) {
		if ( meta === 'header' ) {
			const header = writer.createRawElement( 'div', {
				class: 'box-meta box-meta-header'
			}, domElement => {
				domElement.innerHTML = `<div class="box-meta-header-title"><h2>${ metaValue.title }</h2></div>`;
			} );

			writer.insert( writer.createPositionBefore( contentWrap ), header );
		}

		if ( meta === 'author' ) {
			const author = writer.createRawElement( 'div', {
				class: 'box-meta box-meta-author'
			}, domElement => {
				domElement.innerHTML = `<a href="${ metaValue.website }">${ metaValue.name }</a>`;
			} );

			writer.insert( writer.createPositionAfter( contentWrap ), author );
		}
	}

	for ( const field of modelElement.getChildren() ) {
		const viewField = writer.createContainerElement( 'div', { class: 'box-content-field' } );

		writer.insert( writer.createPositionAt( contentWrap, field.index ), viewField );
		conversionApi.mapper.bindSlotElements( field, viewField );

		// Might be simplified to:
		//
		// writer.defineSlot( field, viewField, field.index );
		//
		// but would require a converter:
		//
		// editor.conversion.for( 'downcast' ).elementToElement( {	// .slotToElement()?
		// 		model: 'viewField',
		// 		view: { name: 'div', class: 'box-content-field' }
		// 	} );
	}

	// At this point we're inserting whole "component". Equivalent to (JSX-like notation):
	//
	//	"rendered" view																					Mapping/source
	//
	//	<div:container class="box">												<-- top-level			box
	//		<div:raw class="box-meta box-meta-header">...</div:raw>										box[meta.header]
	//		<div:container class="box-content">
	//			<div:container class="box-content-field">...</div:container>	<-- this is "slot"		boxField
	//			... many
	//			<div:container class="box-content-field">...</div:container>	<-- this is "slot"		boxField
	//		</div:container>
	//		<div:raw class="box-meta box-meta-author">...</div:raw>										box[meta.author]
	//	</div:container>

	return viewBox;
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

function addBoxMetaButton( editor, uiName, label, updateWith ) {
	addButton( editor, uiName, label, ( writer, box ) => {
		writer.setAttribute( 'meta', {
			...box.getAttribute( 'meta' ),
			...updateWith()
		}, box );
	} );
}

function Box( editor ) {
	editor.model.schema.register( 'box', {
		allowIn: '$root',
		isObject: true,
		isSelectable: true,
		allowAttributes: [ 'infoBoxMeta' ]
	} );

	editor.model.schema.register( 'boxField', {
		allowContentOf: '$root',
		allowIn: 'box',
		isLimit: true
	} );

	editor.conversion.for( 'upcast' ).add( getBoxUpcastConverter( editor ) );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'box',
		view: downcastBox,
		triggerBy: [
			'attribute:meta:box',
			'insert:boxField',
			'remove:boxField'
		]
	} );

	addBoxMetaButton( editor, 'boxTitle', 'Box title', () => ( {
		header: { title: `Random title no. ${ getRandom() }.` }
	} ) );

	addBoxMetaButton( editor, 'boxAuthor', 'Box author', () => ( {
		author: {
			website: `www.example.com/${ getRandom() }`,
			name: `Random author no. ${ getRandom() }`
		}
	} ) );

	addButton( editor, 'addBoxField', '+', ( writer, box, boxField ) => {
		const newBoxField = writer.createElement( 'boxField' );
		writer.insert( newBoxField, box, boxField.index );
		writer.insert( writer.createElement( 'paragraph' ), newBoxField, 0 );
	} );

	addButton( editor, 'removeBoxField', '-', ( writer, box, boxField ) => {
		writer.remove( boxField );
	} );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Box ],
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
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
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
