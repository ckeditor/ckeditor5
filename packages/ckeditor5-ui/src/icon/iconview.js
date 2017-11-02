/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global DOMParser */

/**
 * @module ui/icon/iconview
 */

import View from '../view';

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
		 * The SVG source of the icon.
		 *
		 * @observable
		 * @member {String} #content
		 */
		this.set( 'content', '' );

		/**
		 * This attribute specifies the boundaries to which the
		 * icon content should stretch.
		 *
		 * @observable
		 * @default '0 0 20 20'
		 * @member {String} #viewBox
		 */
		this.set( 'viewBox', '0 0 20 20' );

		this.setTemplate( {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: 'ck-icon',
				viewBox: bind.to( 'viewBox' )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._updateXMLContent();

		// This is a hack for lack of innerHTML binding.
		// See: https://github.com/ckeditor/ckeditor5-ui/issues/99.
		this.on( 'change:content', () => this._updateXMLContent() );
	}

	/**
	 * Updates the {@link #element} with the value of {@link #content}.
	 *
	 * @private
	 */
	_updateXMLContent() {
		if ( this.content ) {
			const svg = new DOMParser()
				.parseFromString( this.content.trim(), 'image/svg+xml' )
				.firstChild;

			this.element.innerHTML = '';

			while ( svg.childNodes.length > 0 ) {
				this.element.appendChild( svg.childNodes[ 0 ] );
			}
		}
	}
}
