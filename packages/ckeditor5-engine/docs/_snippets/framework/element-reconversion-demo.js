/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, toWidget, toWidgetEditable, console, window, prompt, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

const getTypeFromViewElement = viewElement => {
	for ( const type of [ 'info', 'warning' ] ) {
		if ( viewElement.hasClass( `side-card-${ type }` ) ) {
			return type;
		}
	}

	return 'info';
};

const upcastCard = ( viewElement, { writer } ) => {
	const sideCard = writer.createElement( 'sideCard' );

	const type = getTypeFromViewElement( viewElement );
	writer.setAttribute( 'cardType', type, sideCard );

	const urlWrapper = [ ...viewElement.getChildren() ].find( child => {
		return child.is( 'element', 'div' ) && child.hasClass( 'side-card-url' );
	} );

	if ( urlWrapper ) {
		writer.setAttribute( 'cardURL', urlWrapper.getChild( 0 ).data, sideCard );
	}

	return sideCard;
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
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'cardURL' ) || '' );

		writer.setAttribute( 'cardURL', newURL, modelElement );
	}, domElement, editor );

	const currentType = modelElement.getAttribute( 'cardType' );
	const newType = currentType === 'info' ? 'warning' : 'info';

	addActionButton( 'Change type', writer => {
		writer.setAttribute( 'cardType', newType, modelElement );
	}, domElement, editor );

	const childCount = modelElement.childCount;

	const addButton = addActionButton( 'Add section', writer => {
		writer.insertElement( 'sideCardSection', modelElement, 'end' );
	}, domElement, editor );

	if ( childCount > 4 ) {
		addButton.setAttribute( 'disabled', 'disabled' );
	}

	const removeButton = addActionButton( 'Remove section', writer => {
		writer.remove( modelElement.getChild( childCount - 1 ) );
	}, domElement, editor );

	if ( childCount < 3 ) {
		removeButton.setAttribute( 'disabled', 'disabled' );
	}
};

const downcastSideCard = editor => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const type = modelElement.getAttribute( 'cardType' ) || 'info';

		const sideCardView = writer.createContainerElement( 'aside', {
			class: `side-card side-card-${ type }`
		} );

		// Create inner views from side card children.
		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			// Child is either a "title" or "section".
			if ( child.is( 'element', 'sideCardTitle' ) ) {
				writer.addClass( 'side-card-title', childView );
			} else {
				writer.addClass( 'side-card-section', childView );
			}

			// It is important to consume & bind converted elements.
			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			// Make it an editable part of the widget.
			toWidgetEditable( childView, writer );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'cardURL' );

		// Do not render empty URL field
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'side-card-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
		}

		// Inner element used to render simple UI that allows to change side card's attributes.
		const actionsView = writer.createRawElement( 'div', {
			class: 'side-card-actions',
			contenteditable: 'false', 			// Prevent editing of the element:
			'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside editing view.
		}, renderActionsView( editor, modelElement ) ); // See the full code for details.

		writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

		return toWidget( sideCardView, writer, { widgetLabel: 'Side card' } );
	};
};

class ComplexBox {
	constructor( editor ) {
		this._defineSchema( editor );
		this._defineConversion( editor );
	}

	_defineConversion( editor ) {
		const conversion = editor.conversion;

		conversion.for( 'upcast' )
			.elementToElement( {
				view: { name: 'aside', classes: [ 'side-card' ] },
				model: upcastCard
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-title' ] },
				model: 'sideCardTitle'
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-section' ] },
				model: 'sideCardSection'
			} );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		conversion.for( 'downcast' ).elementToElement( {
			model: 'sideCard',
			view: downcastSideCard( editor ),
			triggerBy: {
				attributes: [ 'cardType', 'cardURL' ],
				children: [ 'sideCardSection' ]
			}
		} );
	}

	_defineSchema( editor ) {
		const schema = editor.model.schema;

		// The main element with attributes for type and URL:
		schema.register( 'sideCard', {
			allowWhere: '$block',
			isObject: true,
			allowAttributes: [ 'cardType', 'cardURL' ]
		} );

		// A text-only title.
		schema.register( 'sideCardTitle', {
			isLimit: true,
			allowIn: 'sideCard'
		} );
		// Allow text in title...
		schema.extend( '$text', { allowIn: 'sideCardTitle' } );
		// ...but disallow any text attribute inside.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'sideCardTitle $text' ) ) {
				return false;
			}
		} );

		// A content block which can have any content allowed in $root.
		schema.register( 'sideCardSection', {
			isLimit: true,
			allowIn: 'sideCard',
			allowContentOf: '$root'
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor-element-reconversion' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ ComplexBox ],
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
