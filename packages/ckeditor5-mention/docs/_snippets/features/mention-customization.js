/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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

function MentionCustomization( editor ) {
	// The upcast converter will convert <a class="mention" href="" data-user-id="">
	// elements to the model 'mention' attribute.
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
				// in the model is a plain object:
				const mentionValue = {
					// The name attribute is required.
					name: viewItem.getAttribute( 'data-mention' ),

					// Add any other properties that you need.
					link: viewItem.getAttribute( 'href' ),
					id: viewItem.getAttribute( 'data-user-id' )
				};

				return mentionValue;
			}
		},
		converterPriority: 'high'
	} );

	// Do not forget to define a downcast converter as well:
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, viewWriter ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			return viewWriter.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue._marker + modelAttributeValue.name,
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

function getFeedItems( queryText ) {
	// As an example of an asynchronous action, let's return a promise
	// that resolves after a 100ms timeout.
	// This can be a server request, or any sort of delayed action.
	return new Promise( resolve => {
		setTimeout( () => {
			resolve( items.filter( isItemMatching ) );
		}, 100 );
	} );

	// Filtering function - it uses `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make search case-insensitive.
		const searchString = queryText.toLowerCase();

		// Include an item in the search results if name or username includes the current user input.
		return (
			item.name.toLowerCase().includes( searchString ) ||
			item.username.toLowerCase().includes( searchString )
		);
	}
}

function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );

	itemElement.classList.add( 'custom-item' );
	itemElement.id = `mention-list-item-id-${ item.id }`;
	itemElement.textContent = `${ item.name } `;

	const usernameElement = document.createElement( 'span' );

	usernameElement.classList.add( 'custom-item-username' );
	usernameElement.textContent = `@${ item.username }`;

	itemElement.appendChild( usernameElement );

	return itemElement;
}
