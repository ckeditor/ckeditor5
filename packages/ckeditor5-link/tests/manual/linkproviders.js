/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import { IconLink } from '@ckeditor/ckeditor5-icons';
import LinkUI from '../../src/linkui.js';
import Link from '../../src/link.js';

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
	label: '🌐 Social links 🌐 Social links 🌐 Social links 🌐 Social links 🌐 Social links',
	getListItems: () => [
		{
			id: 'facebook',
			href: 'https://facebook.com',
			label: '👥 Facebook',
			icon: IconLink,
			tooltip: 'Visit Facebook'
		},
		{
			id: 'twitter',
			href: 'https://twitter.com',
			label: '🐦 Twitter',
			icon: IconLink,
			tooltip: 'Visit Twitter'
		},
		{
			id: 'linkedin',
			href: 'https://linkedin.com',
			label: '💼 LinkedIn',
			icon: IconLink,
			tooltip: 'Visit LinkedIn'
		},
		{
			id: 'instagram',
			href: 'https://instagram.com',
			label: '📸 Instagram',
			icon: IconLink,
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
			icon: IconLink,
			tooltip: 'Shop on Amazon'
		},
		{
			id: 'ebay',
			href: 'https://ebay.com',
			label: '🛍️ eBay',
			icon: IconLink,
			tooltip: 'Shop on eBay'
		},
		{
			id: 'allegro',
			href: 'https://allegro.com',
			label: '🛒 Allegro',
			icon: IconLink,
			tooltip: 'Shop on Allegro'
		}
	],
	navigate: item => {
		window.open( `${ item.href }?test=1`, '_blank' );
		return true;
	}
} );

const EmptyLinkList = createPredefinedLinksProvider( {
	label: 'No links',
	getListItems: () => []
} );

const CKLinkList = createPredefinedLinksProvider( {
	label: 'CK links',
	getListItems: () => [
		{
			id: 'ckeditor',
			href: 'https://ckeditor.com',
			label: 'CKEditor5',
			icon: IconLink
		},
		{
			id: 'cksource',
			href: 'https://cksource.com',
			label: 'CKSource',
			icon: IconLink
		}
	],
	navigate: item => {
		window.open( `${ item.href }`, '_blank' );
		return true;
	}
} );

const DummyLinkList = createPredefinedLinksProvider( {
	label: 'Dummy links',
	getListItems: () => [
		{
			id: 'dummy1',
			href: 'https://example.com',
			label: 'Example 1',
			icon: IconLink
		},
		{
			id: 'dummy2',
			href: 'https://example.com',
			label: 'Example 2',
			icon: IconLink
		},
		{
			id: 'dummy3',
			href: 'https://example.com',
			label: 'Example 3',
			icon: IconLink
		}
	]
} );

ClassicEditor
	.create( document.querySelector( '#editor-with-link-providers' ), {
		plugins: [
			Link, Typing, Paragraph, Undo, Enter,
			SocialLinksPlugin, ShopsLinksPlugin, EmptyLinkList, CKLinkList
		],
		toolbar: [ 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-with-many-link-providers' ), {
		plugins: [
			Link, Typing, Paragraph, Undo, Enter,
			SocialLinksPlugin, ShopsLinksPlugin, EmptyLinkList, CKLinkList, DummyLinkList
		],
		toolbar: [ 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
