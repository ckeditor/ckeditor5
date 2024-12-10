/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import LinkUI from '../../src/linkui.js';
import Link from '../../src/link.js';

import linkIcon from '../../theme/icons/link.svg';

const createPredefinedLinksProvider = provider => class MyLinkProvider extends Plugin {
	static get requires() {
		return [ Link ];
	}

	async init() {
		const linkUI = this.editor.plugins.get( LinkUI );

		linkUI.registerLinksListProvider( provider );
	}
};

const SocialLinksPlugin = createPredefinedLinksProvider( {
	label: '🌐 Social links',
	getListItems: () => [
		{
			id: 'facebook',
			href: 'https://facebook.com',
			label: '👥 Facebook',
			icon: linkIcon,
			tooltip: 'Visit Facebook'
		},
		{
			id: 'twitter',
			href: 'https://twitter.com',
			label: '🐦 Twitter',
			icon: linkIcon,
			tooltip: 'Visit Twitter'
		},
		{
			id: 'linkedin',
			href: 'https://linkedin.com',
			label: '💼 LinkedIn',
			icon: linkIcon,
			tooltip: 'Visit LinkedIn'
		},
		{
			id: 'instagram',
			href: 'https://instagram.com',
			label: '📸 Instagram',
			icon: linkIcon,
			tooltip: 'Visit Instagram'
		}
	]
} );

const ShopsLinksPlugin = createPredefinedLinksProvider( {
	label: '🛍️ Shops links',
	getListItems: () => [
		{
			id: 'amazon',
			href: 'https://amazon.com',
			label: '🛒 Amazon',
			icon: linkIcon,
			tooltip: 'Shop on Amazon'
		},
		{
			id: 'ebay',
			href: 'https://ebay.com',
			label: '🛍️ eBay',
			icon: linkIcon,
			tooltip: 'Shop on eBay'
		},
		{
			id: 'allegro',
			href: 'https://allegro.com',
			label: '🛒 Allegro',
			icon: linkIcon,
			tooltip: 'Shop on Allegro'
		}
	],
	navigate: item => {
		window.open( `${ item.href }?test=1`, '_blank' );
		return true;
	}
} );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Typing, Paragraph, Undo, Enter, SocialLinksPlugin, ShopsLinksPlugin ],
		toolbar: [ 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
