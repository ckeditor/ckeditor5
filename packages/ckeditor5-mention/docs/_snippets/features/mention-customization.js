/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document, setTimeout */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-mention-customization' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ MentionCustomization ],
		toolbar: {
			items: [
				'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: getFeedItems,
					itemRenderer: customItemRenderer
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

function MentionCustomization( editor ) {
	// The upcast converter will convert view <a class="mention" href="" data-user-id="">
	// elements to the model 'mention' text attribute.
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
				// The mention feature expects that the mention attribute value
				// in the model is a plain object with a set of additional attributes.
				// In order to create a proper object use the toMentionAttribute() helper method:
				const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
					// Add any other properties that you need.
					link: viewItem.getAttribute( 'href' ),
					userId: viewItem.getAttribute( 'data-user-id' )
				} );

				return mentionAttribute;
			}
		},
		converterPriority: 'high'
	} );

	// Downcast the model 'mention' text attribute to a view <a> element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, { writer } ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			return writer.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				'data-user-id': modelAttributeValue.userId,
				'href': modelAttributeValue.link
			}, {
				// Make mention attribute to be wrapped by other attribute elements.
				priority: 20,
				// Prevent merging mentions together.
				id: modelAttributeValue.uid
			} );
		},
		converterPriority: 'high'
	} );
}

const items = [
	{ id: '@swarley', userId: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
	{ id: '@lilypad', userId: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
	{ id: '@marshmallow', userId: '3', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
	{ id: '@rsparkles', userId: '4', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '@tdog', userId: '5', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( queryText ) {
	// As an example of an asynchronous action, return a promise
	// that resolves after a 100ms timeout.
	// This can be a server request or any sort of delayed action.
	return new Promise( resolve => {
		setTimeout( () => {
			const itemsToDisplay = items
				// Filter out the full list of all items to only those matching the query text.
				.filter( isItemMatching )
				// Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
				.slice( 0, 10 );

			resolve( itemsToDisplay );
		}, 100 );
	} );

	// Filtering function - it uses the `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make the search case-insensitive.
		const searchString = queryText.toLowerCase();

		// Include an item in the search results if the name or username includes the current user input.
		return (
			item.name.toLowerCase().includes( searchString ) ||
			item.id.toLowerCase().includes( searchString )
		);
	}
}

function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );

	itemElement.classList.add( 'custom-item' );
	itemElement.id = `mention-list-item-id-${ item.userId }`;
	itemElement.textContent = `${ item.name } `;

	const usernameElement = document.createElement( 'span' );

	usernameElement.classList.add( 'custom-item-username' );
	usernameElement.textContent = item.id;

	itemElement.appendChild( usernameElement );

	return itemElement;
}
