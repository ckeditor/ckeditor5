/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, prompt, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

const getTypeFromViewElement = viewElement => {
	for ( const type of [ 'info', 'warning' ] ) {
		if ( viewElement.hasClass( `info-box-${ type }` ) ) {
			return type;
		}
	}

	return 'info';
};

const upcastInfoBox = ( viewElement, { writer } ) => {
	const complexInfoBox = writer.createElement( 'complexInfoBox' );

	const type = getTypeFromViewElement( viewElement );

	writer.setAttribute( 'infoBoxType', type, complexInfoBox );
	writer.setAttribute( 'infoBoxURL', 'https://ckeditor.com', complexInfoBox );

	return complexInfoBox;
};

const renderActionsView = ( editor, modelElement ) => function( domElement ) {
	const domDocument = domElement.ownerDocument;
	const urlButton = createElement( domDocument, 'button', {}, 'Set URL' );

	urlButton.addEventListener( 'click', () => {
		// eslint-disable-next-line no-alert
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'infoBoxURL' ) || '' );

		editor.model.change( writer => {
			writer.setAttribute( 'infoBoxURL', newURL, modelElement );
		} );
	} );

	const currentType = modelElement.getAttribute( 'infoBoxType' );
	const newType = currentType === 'info' ? 'warning' : 'info';

	const typeButton = createElement( domDocument, 'button', {}, `Change to ${ newType }` );

	typeButton.addEventListener( 'click', () => {
		editor.model.change( writer => {
			writer.setAttribute( 'infoBoxType', newType, modelElement );
		} );
	} );

	domElement.appendChild( urlButton );
	domElement.appendChild( typeButton );
};

// TODO: simplify to hide complexity
const downcastInfoBox = editor => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const complexInfoBoxView = writer.createContainerElement( 'div', {
			class: 'info-box'
		} );

		const type = modelElement.getAttribute( 'infoBoxType' ) || 'info';

		writer.addClass( `info-box-${ type }`, complexInfoBoxView );

		const actionsView = writer.createRawElement( 'div', {
			class: 'info-box-actions',
			contenteditable: 'false', 			// Prevent editing of the element:
			'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside editing view.
		}, renderActionsView( editor, modelElement ) );

		writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), actionsView );

		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createContainerElement( 'div' );

			if ( child.is( 'element', 'complexInfoBoxTitle' ) ) {
				writer.addClass( 'info-box-title', childView );
			} else {
				writer.addClass( 'info-box-content', childView );
			}

			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );
			writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), childView );
		}

		return complexInfoBoxView;
	};
};

class ComplexInfoBox {
	constructor( editor ) {
		this._defineSchema( editor );
		this._defineConversion( editor );
	}

	_defineConversion( editor ) {
		editor.conversion.for( 'upcast' )
			.elementToElement( {
				view: { name: 'div', classes: [ 'info-box' ] },
				model: upcastInfoBox
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'info-box-title' ] },
				model: 'complexInfoBoxTitle'
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'info-box-content' ] },
				model: 'complexInfoBoxContent'
			} );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'complexInfoBox',
			view: downcastInfoBox( editor ),
			triggerBy: {
				attributes: [ 'infoBoxType', 'infoBoxURL' ],
				children: [ 'complexInfoBoxContent' ]
			}
		} );
	}

	_defineSchema( editor ) {
		// The main element with attributes for type and URL:
		editor.model.schema.register( 'complexInfoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType', 'infoBoxURL' ]
		} );

		// A text-only title.
		editor.model.schema.register( 'complexInfoBoxTitle', {
			isLimit: true,
			allowIn: 'complexInfoBox'
		} );
		editor.model.schema.extend( '$text', { allowIn: 'complexInfoBoxTitle' } );

		// A content which can have any content allowed in $root.
		editor.model.schema.register( 'complexInfoBoxContent', {
			isLimit: true,
			allowIn: 'complexInfoBox',
			allowContentOf: '$root'
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor-element-reconversion' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ ComplexInfoBox ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		toolbar: {
			items: [ 'heading', '|', 'bold', 'italic' ],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
