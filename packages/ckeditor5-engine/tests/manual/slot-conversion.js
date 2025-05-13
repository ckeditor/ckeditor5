/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

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
		const metaElements = elements.filter( byClassName( 'box-meta' ) );

		const meta = metaElements.map( mapMeta( editor ) ).reduce( ( prev, current ) => Object.assign( prev, current ), {} );

		writer.setAttribute( 'meta', meta, box );

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

function getBoxDowncastCreator( multiSlot ) {
	return ( modelElement, conversionApi ) => {
		const { writer } = conversionApi;

		const viewBox = writer.createContainerElement( 'div', { class: 'box' } );
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

		if ( !multiSlot ) {
			writer.insert( writer.createPositionAt( contentWrap, 0 ), writer.createSlot() );
		} else {
			writer.insert( writer.createPositionAt( contentWrap, 0 ), writer.createSlot( element => element.index < 2 ) );

			const contentWrap2 = writer.createContainerElement( 'div', { class: 'box-content' } );

			writer.insert( writer.createPositionAt( viewBox, 'end' ), contentWrap2 );
			writer.insert( writer.createPositionAt( contentWrap2, 0 ), writer.createSlot( element => element.index >= 2 ) );

			const footer = writer.createRawElement( 'div', { class: 'box-footer' }, domElement => {
				domElement.innerHTML = 'Footer';
			} );

			writer.insert( writer.createPositionAfter( contentWrap2 ), footer );
		}

		return viewBox;
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
		allowAttributes: [ 'meta' ]
	} );

	editor.model.schema.register( 'boxField', {
		allowContentOf: '$root',
		allowIn: 'box',
		isLimit: true
	} );

	editor.conversion.for( 'upcast' ).add( getBoxUpcastConverter( editor ) );

	editor.conversion.for( 'downcast' ).elementToStructure( {
		model: {
			name: 'box',
			attributes: [ 'meta' ],
			children: true
		},
		view: getBoxDowncastCreator( editor.config.get( 'box.multiSlot' ) )
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'boxField',
		view: { name: 'div', classes: 'box-content-field' }
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

async function createEditor( multiSlot ) {
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
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		box: { multiSlot }
	} );

	window.editor = editor;
}

for ( const option of document.querySelectorAll( 'input[name=box-mode]' ) ) {
	option.addEventListener( 'change', async event => {
		if ( window.editor ) {
			await window.editor.destroy();
		}

		await createEditor( event.target.value == 'multi' );
	} );

	if ( option.checked ) {
		createEditor( option.value == 'multi' );
	}
}
