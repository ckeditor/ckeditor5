/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, IconLink, Link, LinkUI } from 'ckeditor5';

export class SocialLinksPlugin extends Plugin {
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
					icon: IconLink
				},
				{
					id: 'twitter',
					href: 'https://twitter.com',
					label: 'Twitter',
					icon: IconLink
				},
				{
					id: 'linkedin',
					href: 'https://linkedin.com',
					label: 'LinkedIn',
					icon: IconLink
				},
				{
					id: 'instagram',
					href: 'https://instagram.com',
					label: 'Instagram',
					icon: IconLink
				}
			],

			// Optionally: You can customize your link preview by custom implementation of link getter.
			getItem: href => {
				return {
					href,
					icon: IconLink,
					label: 'My custom label in link preview',
					tooltip: 'My custom tooltip in link preview'
				};
			}
		} );
	}
}
