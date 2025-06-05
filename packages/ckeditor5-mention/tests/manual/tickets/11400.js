/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Mention from '../../../src/mention.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Font from '@ckeditor/ckeditor5-font/src/font.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-mention-customization' ), {
		cloudServices: CS_CONFIG,
		plugins: [ ArticlePluginSet, Mention, Underline, Font ],
		toolbar: {
			items: [
				'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			]
		},
		mention: {
			dropdownLimit: 4,
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

const items = [
	{ id: '@john', userId: '1', name: 'John Doe' },
	{ id: '@jack', userId: '2', name: 'Jack Smith' },
	{ id: '@marry', userId: '3', name: 'Marry Foo' },
	{ id: '@marry', userId: '4', name: 'Marry Bar' },
	{ id: '@marry', userId: '5', name: 'Marry Baz' },
	{ id: '@linda', userId: '6', name: 'Linda Novak' },
	{ id: '@peter', userId: '7', name: 'Peter Pan' },
	{ id: '@mark', userId: '8', name: 'Mark Polack' }
];

function getFeedItems( queryText ) {
	return items.filter( isItemMatching );

	function isItemMatching( item ) {
		const searchString = queryText.toLowerCase();

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
