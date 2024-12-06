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
	getItems: () => [
		{
			id: 'facebook',
			label: '👥 Facebook',
			icon: linkIcon,
			href: 'https://facebook.com',
			preview: {
				icon: null
			}
		},
		{
			id: 'twitter',
			label: '🐦 Twitter',
			icon: linkIcon,
			href: 'https://twitter.com',
			preview: {
				icon: null
			}
		},
		{
			id: 'linkedin',
			label: '💼 LinkedIn',
			icon: linkIcon,
			href: 'https://linkedin.com',
			preview: {
				icon: null
			}
		},
		{
			id: 'instagram',
			label: '📸 Instagram',
			icon: linkIcon,
			href: 'https://instagram.com',
			preview: {
				icon: null
			}
		}
	]
} );

const ShopsLinksPlugin = createPredefinedLinksProvider( {
	label: '🛍️ Shops links',
	getItems: () => [
		{
			id: 'amazon',
			label: '🛒 Amazon',
			icon: linkIcon,
			href: 'https://amazon.com',
			preview: {
				icon: null
			}
		},
		{
			id: 'ebay',
			label: '🛍️ eBay',
			icon: linkIcon,
			href: 'https://ebay.com',
			preview: {
				icon: null
			}
		},
		{
			id: 'allegro',
			label: '🛒 Allegro',
			icon: linkIcon,
			href: 'https://allegro.com'
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
