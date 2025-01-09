/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/iframe/iframeview
 */

import View from '../view.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The iframe view class.
 *
 * ```ts
 * const iframe = new IframeView();
 *
 * iframe.render();
 * document.body.appendChild( iframe.element );
 *
 * iframe.on( 'loaded', () => {
 * 	console.log( 'The iframe has loaded', iframe.element.contentWindow );
 * } );
 *
 * iframe.element.src = 'https://ckeditor.com';
 * ```
 */
export default class IframeView extends View<HTMLIFrameElement> {
	/**
	 * Creates a new instance of the iframe view.
	 *
	 * @param locale The locale instance.
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'iframe',
			attributes: {
				class: [
					'ck',
					'ck-reset_all'
				],
				// It seems that we need to allow scripts in order to be able to listen to events.
				// TODO: Research that. Perhaps the src must be set?
				sandbox: 'allow-same-origin allow-scripts'
			},
			on: {
				load: bind.to( 'loaded' )
			}
		} );
	}

	/**
	 * Renders the iframe's {@link #element} and returns a `Promise` for asynchronous
	 * child `contentDocument` loading process.
	 *
	 * @returns A promise which resolves once the iframe `contentDocument` has
	 * been {@link #event:loaded}.
	 */
	public override render(): Promise<unknown> {
		return new Promise( resolve => {
			this.on<IframeViewLoadedEvent>( 'loaded', resolve );

			return super.render();
		} );
	}
}

/**
 * Fired when the DOM iframe's `contentDocument` finished loading.
 *
 * @eventName ~IframeView#loaded
 */
export type IframeViewLoadedEvent = {
	name: 'loaded';
	args: [];
};
