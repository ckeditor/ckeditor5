/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/ui/linkpreviewbuttonview
 */

import { ButtonView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

/**
 * The link button class. Rendered as an `<a>` tag with link opening in a new tab.
 *
 * Provides a custom `navigate` cancelable event.
 */
export default class LinkPreviewButtonView extends ButtonView {
	/**
	 * The value of the "href" attribute of the link.
	 *
	 * @observable
	 */
	declare public href: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( {
			href: undefined,
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-link-toolbar__preview' ],
				href: bind.to( 'href' ),
				target: '_blank',
				rel: 'noopener noreferrer'
			},

			on: {
				click: bind.to( evt => {
					if ( this.href ) {
						const cancel = () => evt.preventDefault();

						this.fire<LinkPreviewButtonNavigateEvent>( 'navigate', this.href, cancel );
					}
				} )
			}
		} );

		this.template!.tag = 'a';
	}
}

/**
 * Fired when the button view is clicked.
 *
 * @eventName ~LinkPreviewButtonView#navigate
 */
export type LinkPreviewButtonNavigateEvent = {
	name: 'navigate';
	args: [ href: string, cancel: () => void ];
};
