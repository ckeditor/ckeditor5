/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import LinkUI from '@ckeditor/ckeditor5-link/src/linkui.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import linkIcon from '@ckeditor/ckeditor5-link/theme/icons/link.svg';
import { AutoLink, LinkImage } from '@ckeditor/ckeditor5-link';
import { Bookmark } from '@ckeditor/ckeditor5-bookmark';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

class SocialLinksPlugin extends Plugin {
	static get requires() {
		return [ Link ];
	}

	async init() {
		const linkUI = this.editor.plugins.get( LinkUI );

		linkUI.registerLinksListProvider( {
			label: 'Social links',
			getListItems: () => [
				{
					id: 'facebook',
					href: 'https://facebook.com',
					label: 'Facebook',
					icon: linkIcon
				},
				{
					id: 'twitter',
					href: 'https://twitter.com',
					label: 'Twitter',
					icon: linkIcon
				},
				{
					id: 'linkedin',
					href: 'https://linkedin.com',
					label: 'LinkedIn',
					icon: linkIcon
				},
				{
					id: 'instagram',
					href: 'https://instagram.com',
					label: 'Instagram',
					icon: linkIcon
				}
			],

			// Optionally: You can customize your link preview by custom implementation of link getter.
			getItem: href => {
				return {
					href,
					icon: linkIcon,
					label: 'My custom label in link preview',
					tooltip: 'My custom tooltip in link preview'
				};
			}
		} );
	}
}

window.CKEditorPlugins = {
	AutoLink,
	Bookmark,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit,
	SocialLinksPlugin
};

window.ClassicEditor = ClassicEditor;
window.CS_CONFIG = CS_CONFIG;
