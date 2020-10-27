/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, toWidget, toWidgetEditable, console, window, prompt, document */

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

	const urlWrapper = [ ...viewElement.getChildren() ].find( child => child.hasClass( 'info-box-url' ) );

	if ( urlWrapper ) {
		writer.setAttribute( 'infoBoxURL', urlWrapper.getChild( 0 ).data, complexInfoBox );
	}

	return complexInfoBox;
};

function addActionButton( text, callback, domElement, editor ) {
	const domDocument = domElement.ownerDocument;

	const button = createElement( domDocument, 'button', {}, [ text ] );

	button.addEventListener( 'click', () => {
		editor.model.change( callback );
	} );

	domElement.appendChild( button );

	return button;
}

const renderActionsView = ( editor, modelElement ) => function( domElement ) {
	addActionButton( 'Set URL', writer => {
		// eslint-disable-next-line no-alert
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'infoBoxURL' ) || '' );

		writer.setAttribute( 'infoBoxURL', newURL, modelElement );
	}, domElement, editor );

	const currentType = modelElement.getAttribute( 'infoBoxType' );
	const newType = currentType === 'info' ? 'warning' : 'info';

	addActionButton( `Change to ${ newType }`, writer => {
		writer.setAttribute( 'infoBoxType', newType, modelElement );
	}, domElement, editor );

	const childCount = modelElement.childCount;

	const addButton = addActionButton( 'Add content box', writer => {
		writer.insertElement( 'complexInfoBoxContent', modelElement, 'end' );
	}, domElement, editor );

	if ( childCount > 4 ) {
		addButton.setAttribute( 'disabled', 'disabled' );
	}

	const removeButton = addActionButton( 'Remove content box', writer => {
		writer.remove( modelElement.getChild( childCount - 1 ) );
	}, domElement, editor );

	if ( childCount < 3 ) {
		removeButton.setAttribute( 'disabled', 'disabled' );
	}
};

const downcastInfoBox = editor => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const complexInfoBoxView = writer.createContainerElement( 'div', {
			class: 'info-box'
		} );

		const type = modelElement.getAttribute( 'infoBoxType' ) || 'info';

		writer.addClass( `info-box-${ type }`, complexInfoBoxView );

		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			if ( child.is( 'element', 'complexInfoBoxTitle' ) ) {
				writer.addClass( 'info-box-title', childView );
			} else {
				writer.addClass( 'info-box-content', childView );
			}

			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			toWidgetEditable( childView, writer );

			writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'infoBoxURL' );

		// Do not render empty URL field
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'info-box-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), urlBox );
		}

		const actionsView = writer.createRawElement( 'div', {
			class: 'info-box-actions',
			contenteditable: 'false', 			// Prevent editing of the element:
			'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside editing view.
		}, renderActionsView( editor, modelElement ) );

		writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), actionsView );

		return toWidget( complexInfoBoxView, writer, {
			widgetLabel: 'Complex Info Box'
		} );
	};
};

class ComplexInfoBox {
	constructor( editor ) {
		this._defineSchema( editor );
		this._defineConversion( editor );
	}

	_defineConversion( editor ) {
		const conversion = editor.conversion;

		conversion.for( 'upcast' )
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
		conversion.for( 'downcast' ).elementToElement( {
			model: 'complexInfoBox',
			view: downcastInfoBox( editor ),
			triggerBy: {
				attributes: [ 'infoBoxType', 'infoBoxURL' ],
				children: [ 'complexInfoBoxContent' ]
			}
		} );
	}

	_defineSchema( editor ) {
		const schema = editor.model.schema;

		// The main element with attributes for type and URL:
		schema.register( 'complexInfoBox', {
			allowWhere: '$block',
			isObject: true,
			allowAttributes: [ 'infoBoxType', 'infoBoxURL' ]
		} );

		// A text-only title.
		schema.register( 'complexInfoBoxTitle', {
			isLimit: true,
			allowIn: 'complexInfoBox'
		} );
		// Allow text in title...
		schema.extend( '$text', { allowIn: 'complexInfoBoxTitle' } );
		// ...but disallow any text attribute inside.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'complexInfoBoxTitle $text' ) ) {
				return false;
			}
		} );

		// A content block which can have any content allowed in $root.
		schema.register( 'complexInfoBoxContent', {
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
