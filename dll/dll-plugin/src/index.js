/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window, prompt */

import sanitizeHtml from 'sanitize-html';
import { clone } from 'lodash-es';
import {
	Plugin,
	ClassicEditor,
	HtmlEmbedEditing,
	HtmlEmbedUI,
	ButtonView,
	createElement,
	toWidgetEditable,
	toWidget,
	findOptimalInsertionPosition,
	Command
} from '@ckeditor/ckeditor5-dll/index';

/**
 * Helper for extracting the side card type from a view element based on its CSS class.
 */
const getTypeFromViewElement = viewElement => {
	for ( const type of [ 'default', 'alternate' ] ) {
		if ( viewElement.hasClass( `side-card-${ type }` ) ) {
			return type;
		}
	}

	return 'default';
};

/**
 * Single upcast converter to the <sideCard/> element with all its attributes.
 */
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

/**
 * Helper for creating a DOM button with an editor callback.
 */
const addActionButton = ( text, callback, domElement, editor ) => {
	const domDocument = domElement.ownerDocument;

	const button = createElement( domDocument, 'button', {}, [ text ] );

	button.addEventListener( 'click', () => {
		editor.model.change( callback );
	} );

	domElement.appendChild( button );

	return button;
};

/**
 * Helper function that creates the card editing UI inside the card.
 */
const createActionsView = ( editor, modelElement ) => function( domElement ) {
	//
	// Set the URL action button.
	//
	addActionButton( 'Set URL', writer => {
		// eslint-disable-next-line no-alert
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'cardURL' ) || '' );

		writer.setAttribute( 'cardURL', newURL, modelElement );
	}, domElement, editor );

	const currentType = modelElement.getAttribute( 'cardType' );
	const newType = currentType === 'default' ? 'alternate' : 'default';

	//
	// Change the card action button.
	//
	addActionButton( 'Change type', writer => {
		writer.setAttribute( 'cardType', newType, modelElement );
	}, domElement, editor );

	const childCount = modelElement.childCount;

	//
	// Add the content section to the card action button.
	//
	const addButton = addActionButton( 'Add section', writer => {
		writer.insertElement( 'sideCardSection', modelElement, 'end' );
	}, domElement, editor );

	// Disable the button so only 1-3 content boxes are in the card (there will always be a title).
	if ( childCount > 4 ) {
		addButton.setAttribute( 'disabled', 'disabled' );
	}

	//
	// Remove the content section from the card action button.
	//
	const removeButton = addActionButton( 'Remove section', writer => {
		writer.remove( modelElement.getChild( childCount - 1 ) );
	}, domElement, editor );

	// Disable the button so only 1-3 content boxes are in the card (there will always be a title).
	if ( childCount < 3 ) {
		removeButton.setAttribute( 'disabled', 'disabled' );
	}
};

/**
 * The downcast converter for the <sideCard/> element.
 *
 * It returns the full view structure based on the current state of the model element.
 */
const downcastSideCard = ( editor, { asWidget } ) => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const type = modelElement.getAttribute( 'cardType' ) || 'default';

		// The main view element for the side card.
		const sideCardView = writer.createContainerElement( 'aside', {
			class: `side-card side-card-${ type }`
		} );

		// Create inner views from the side card children.
		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			// Child is either a "title" or "section".
			if ( child.is( 'element', 'sideCardTitle' ) ) {
				writer.addClass( 'side-card-title', childView );
			} else {
				writer.addClass( 'side-card-section', childView );
			}

			// It is important to consume and bind converted elements.
			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			// Make it an editable part of the widget.
			if ( asWidget ) {
				toWidgetEditable( childView, writer );
			}

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'cardURL' );

		// Do not render an empty URL field.
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'side-card-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
		}

		// Inner element used to render a simple UI that allows to change the side card's attributes.
		// It will only be needed in the editing view inside the widgetized element.
		// The data output should not contain this section.
		if ( asWidget ) {
			const actionsView = writer.createRawElement( 'div', {
				class: 'side-card-actions',
				contenteditable: 'false', 			// Prevents editing of the element.
				'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside the editing view.
			}, createActionsView( editor, modelElement ) ); // See the full code for details.

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

			toWidget( sideCardView, writer, { widgetLabel: 'Side card', hasSelectionHandle: true } );
		}

		return sideCardView;
	};
};

class InsertCardCommand extends Command {
	/**
	 * Refresh used schema definition to check if a side card can be inserted in the current selection.
	 */
	refresh() {
		const model = this.editor.model;
		const validParent = findOptimalInsertionPosition( model.document.selection, model );

		this.isEnabled = model.schema.checkChild( validParent, 'sideCard' );
	}

	/**
	 * Creates a full side card element with all required children and attributes.
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const insertPosition = findOptimalInsertionPosition( selection, model );

		model.change( writer => {
			const sideCard = writer.createElement( 'sideCard', { cardType: 'default' } );
			const title = writer.createElement( 'sideCardTitle' );
			const section = writer.createElement( 'sideCardSection' );
			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( title, sideCard, 0 );
			writer.insert( section, sideCard, 1 );
			writer.insert( paragraph, section, 0 );

			model.insertContent( sideCard, insertPosition );

			writer.setSelection( writer.createPositionAt( title, 0 ) );
		} );
	}
}

class ComplexBox extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
		this._defineConversion();

		editor.commands.add( 'insertCard', new InsertCardCommand( editor ) );

		this._defineUI();
	}

	_defineConversion() {
		const editor = this.editor;
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
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'sideCard',
			view: downcastSideCard( editor, { asWidget: true } ),
			triggerBy: {
				attributes: [ 'cardType', 'cardURL' ],
				children: [ 'sideCardSection' ]
			}
		} );
		// The data downcast is always executed from the current model stat, so `triggerBy` will take no effect.
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'sideCard',
			view: downcastSideCard( editor, { asWidget: false } )
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		// The main element with attributes for type and URL:
		schema.register( 'sideCard', {
			allowWhere: '$block',
			isObject: true,
			allowAttributes: [ 'cardType', 'cardURL' ]
		} );
		// Disallow side card nesting.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( [ ...context.getNames() ].includes( 'sideCard' ) && childDefinition.name === 'sideCard' ) {
				return false;
			}
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

	_defineUI() {
		const editor = this.editor;

		// Defines a simple text button.
		editor.ui.componentFactory.add( 'insertCard', locale => {
			const button = new ButtonView( locale );

			const command = editor.commands.get( 'insertCard' );

			button.set( {
				withText: true,
				icon: false,
				label: 'Insert card'
			} );

			button.bind( 'isEnabled' ).to( command );

			button.on( 'execute', () => {
				editor.execute( 'insertCard' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}

class MahPlugin extends Plugin {
	init() {
		console.log( 'MahPlugin: works.' );
	}
}

class CustomHtmlEmbed extends Plugin {
	static get requires() {
		return [ HtmlEmbedEditing, HtmlEmbedUI ];
	}

	init() {
		console.log( 'CustomHtmlEmbed: works.' );
	}
}

const config = Object.assign( {}, ClassicEditor.defaultConfig, {
	extraPlugins: [ MahPlugin, ComplexBox, CustomHtmlEmbed ],
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml( rawHtml ) {
			const config = getSanitizeHtmlConfig( sanitizeHtml.defaults );
			const cleanHtml = sanitizeHtml( rawHtml, config );

			return {
				html: cleanHtml,
				hasChanged: rawHtml !== cleanHtml
			};
		}
	}
} );

config.toolbar.items.push( 'htmlEmbed' );

ClassicEditor.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;
	} );

function getSanitizeHtmlConfig( defaultConfig ) {
	const config = clone( defaultConfig );

	config.allowedTags.push(
		// Allows embedding iframes.
		'iframe',

		// Allows embedding media.
		'audio',
		'video',
		'picture',
		'source',
		'img'
	);

	config.selfClosing.push( 'source' );

	// Remove duplicates.
	config.allowedTags = [ ...new Set( config.allowedTags ) ];

	config.allowedSchemesAppliedToAttributes.push(
		// Responsive images.
		'srcset'
	);

	for ( const htmlTag of config.allowedTags ) {
		if ( !Array.isArray( config.allowedAttributes[ htmlTag ] ) ) {
			config.allowedAttributes[ htmlTag ] = [];
		}

		// Allow inlining styles for all elements.
		config.allowedAttributes[ htmlTag ].push( 'style' );
	}

	config.allowedAttributes.audio.push( 'controls' );
	config.allowedAttributes.video.push( 'width', 'height', 'controls' );

	config.allowedAttributes.iframe.push( 'src' );
	config.allowedAttributes.img.push( 'srcset', 'sizes', 'src' );
	config.allowedAttributes.source.push( 'src', 'srcset', 'media', 'sizes', 'type' );

	return config;
}
