/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global DOMParser */

/**
 * @module ui/icon/iconview
 */

import View from '../view';
import Template from '../template';

/**
 * The icon view class.
 *
 * @extends module:ui/view~View
 */
export default class IconView extends View {
	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		/**
		 * The inline SVG or in legacy mode the name of the icon
		 * which corresponds with the name of the file in the
		 * {@link module:theme/iconmanagermodel~IconManagerModel}.
		 *
		 * @observable
		 * @member {String} #content
		 */
		this.set( 'content' );

		/**
		 * This attribute specifies the boundaries to which the
		 * icon content should stretch.
		 *
		 * @observable
		 * @default '0 0 20 20'
		 * @member {String} #viewBox
		 */
		this.set( 'viewBox', '0 0 20 20' );

		this.template = new Template( {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: 'ck-icon',
				viewBox: bind.to( 'viewBox' )
			}
		} );

		// This is a hack for lack of innerHTML binding.
		// See: https://github.com/ckeditor/ckeditor5-ui/issues/99.
		//
		// Temporarily 2 types of icon content are supported:
		//   * Inline SVG - content of svg file as plan text.
		//   * Icon name (legacy) - name of icon corresponds with name of the
		//     file in the {@link module:theme/iconmanagermodel~IconManagerModel}.
		this.on( 'change:content', ( evt, name, value ) => {
			if ( /</.test( value ) ) {
				const svg = new DOMParser()
					.parseFromString( value.trim(), 'image/svg+xml' )
					.firstChild;

				while ( svg.childNodes.length > 0 ) {
					this.element.appendChild( svg.childNodes[ 0 ] );
				}
			} else {
				this.element.innerHTML = `<use xlink:href="#ck-icon-${ value }"></use>`;
			}
		} );
	}
}
