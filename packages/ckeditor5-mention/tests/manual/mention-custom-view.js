/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Mention from '../../src/mention';

class CustomMentionAttributeView extends Plugin {
	init() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'a',
				key: 'data-mention',
				classes: 'mention',
				attributes: {
					href: true
				}
			},
			model: {
				key: 'mention',
				value: viewItem => {
					return editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
						link: viewItem.getAttribute( 'href' )
					} );
				}
			},
			converterPriority: 'high'
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: ( modelAttributeValue, viewWriter ) => {
				if ( !modelAttributeValue ) {
					return;
				}

				return viewWriter.createAttributeElement( 'a', {
					class: 'mention',
					'data-mention': modelAttributeValue.id,
					'href': modelAttributeValue.link
				}, { id: modelAttributeValue._uid } );
			},
			converterPriority: 'high'
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Underline, Font, Mention, CustomMentionAttributeView ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'underline', 'link',
			'|', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'|', 'insertTable',
			'|', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: getFeed
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

function getFeed( feedText ) {
	return [
		{ id: '@Barney Stinson', text: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
		{ id: '@Lily Aldrin', text: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
		{ id: '@Marshall Eriksen', text: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
		{ id: '@Robin Scherbatsky', text: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
		{ id: '@Ted Mosby', text: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
	].filter( item => {
		const searchString = feedText.toLowerCase();

		return item.id.toLowerCase().includes( searchString );
	} );
}
