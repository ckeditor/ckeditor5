/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/ui/linkpreviewbuttonview
 */

import { ButtonView, type ButtonLabel } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

/**
 * TODO
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
	constructor( locale: Locale, labelView?: ButtonLabel ) {
		super( locale, labelView );

		const bind = this.bindTemplate;

		this.set( {
			href: undefined,
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-link-toolbar__preview'
				],
				href: bind.to( 'href' ),
				target: '_blank',
				rel: 'noopener noreferrer'
			},

			on: {
				click: bind.to( evt => {
					if ( this.href ) {
						const cancel = () => evt.preventDefault();

						this.fire<LinkPreviewButtonExecuteEvent>( 'execute', this.href, cancel );
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
 * @eventName ~LinkPreviewButtonView#execute
 */
export type LinkPreviewButtonExecuteEvent = {
	name: 'execute';
	args: [ string, () => void ];
};
