/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document, setTimeout */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-mention-customization' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ CustomMention ],
		toolbar: {
			items: [
				'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig(),
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: getFeedItems,
					itemRenderer: customItemRenderer,
					minimumCharacters: 1
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function CustomMention( editor ) {
	// The upcast converter will convert <a class="mention"> elements to the model 'mention' attribute.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'a',
			key: 'data-mention',
			classes: 'mention',
			attributes: {
				href: true,
				'data-user-id': true
			}
		},
		model: {
			key: 'mention',
			value: viewItem => {
				// Optionally: do not convert partial mentions.
				if ( !isFullMention( viewItem ) ) {
					return;
				}

				// The mention feature expects that mention attribute value in the model is a plain object:
				const mentionValue = {
					// The name attribute is required by mention editing.
					name: viewItem.getAttribute( 'data-mention' ),
					// Add any other properties as required.
					link: viewItem.getAttribute( 'href' ),
					id: viewItem.getAttribute( 'data-user-id' )
				};

				return mentionValue;
			}
		},
		converterPriority: 'high'
	} );

	function isFullMention( viewElement ) {
		const textNode = viewElement.getChild( 0 );
		const dataMention = viewElement.getAttribute( 'data-mention' );

		// Do not parse empty mentions.
		if ( !textNode || !textNode.is( 'text' ) ) {
			return false;
		}

		const mentionString = textNode.data;

		// Assume that mention is set as marker + mention name.
		const name = mentionString.slice( 1 );

		// Do not upcast partial mentions - might come from copy-paste of partially selected mention.
		return name == dataMention;
	}

	// Don't forget to define a downcast converter as well:
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, viewWriter ) => {
			if ( !modelAttributeValue ) {
				// Do not convert empty attributes.
				return;
			}

			return viewWriter.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.name,
				'data-user-id': modelAttributeValue.id,
				'href': modelAttributeValue.link
			} );
		},
		converterPriority: 'high'
	} );
}

const items = [
	{ id: '1', name: 'Barney Stinson', username: 'swarley', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
	{ id: '2', name: 'Lily Aldrin', username: 'lilypad', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
	{ id: '3', name: 'Marshall Eriksen', username: 'marshmallow', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
	{ id: '4', name: 'Robin Scherbatsky', username: 'rsparkles', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '5', name: 'Ted Mosby', username: 'tdog', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( feedText ) {
	// As an example of asynchronous action return a promise that resolves after a 100ms timeout.
	return new Promise( resolve => {
		setTimeout( () => {
			resolve( items.filter( isItemMatching ) );
		}, 100 );
	} );

	// Filtering function - it uses `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make search case-insensitive.
		const searchString = feedText.toLowerCase();

		// Include an item in the search results if name or username includes the current user input.
		return textIncludesSearchSting( item.name, searchString ) || textIncludesSearchSting( item.username, searchString );
	}

	function textIncludesSearchSting( text, searchString ) {
		return text.toLowerCase().includes( searchString );
	}
}

function customItemRenderer( item ) {
	const span = document.createElement( 'span' );

	span.classList.add( 'custom-item' );
	span.id = `mention-list-item-id-${ item.id }`;

	span.innerHTML = `${ item.name } <span class="custom-item-username">@${ item.username }</span>`;

	return span;
}
