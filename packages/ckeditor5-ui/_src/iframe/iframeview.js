/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/iframe/iframeview
 */

import View from '../view';

/**
 * The iframe view class.
 *
 * 		const iframe = new IframeView();
 *
 *		iframe.render();
 *		document.body.appendChild( iframe.element );
 *
 * 		iframe.on( 'loaded', () => {
 *			console.log( 'The iframe has loaded', iframe.element.contentWindow );
 *		} );
 *
 * 		iframe.element.src = 'https://ckeditor.com';
 *
 * @extends module:ui/view~View
 */
export default class IframeView extends View {
	/**
	 * Creates a new instance of the iframe view.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 */
	constructor( locale ) {
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
	 * @returns {Promise} A promise which resolves once the iframe `contentDocument` has
	 * been {@link #event:loaded}.
	 */
	render() {
		return new Promise( resolve => {
			this.on( 'loaded', resolve );
			super.render();
		} );
	}
}

/**
 * Fired when the DOM iframe's `contentDocument` finished loading.
 *
 * @event loaded
 */
