/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global DOMParser */

/**
 * @module ui/icon/iconview
 */

import View from '../view';

import '../../theme/components/icon/icon.css';

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

		/**
		 * The fill color of the child `path.ck-icon__fill`.
		 *
		 * @observable
		 * @default ''
		 * @member {String} #fillColor
		 */
		this.set( 'fillColor', '' );

		this.setTemplate( {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: [
					'ck',
					'ck-icon'
				],
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
		this._colorFillPaths();

		// This is a hack for lack of innerHTML binding.
		// See: https://github.com/ckeditor/ckeditor5-ui/issues/99.
		this.on( 'change:content', () => {
			this._updateXMLContent();
			this._colorFillPaths();
		} );

		this.on( 'change:fillColor', () => {
			this._colorFillPaths();
		} );
	}

	/**
	 * Updates the {@link #element} with the value of {@link #content}.
	 *
	 * @private
	 */
	_updateXMLContent() {
		if ( this.content ) {
			const parsed = new DOMParser().parseFromString( this.content.trim(), 'image/svg+xml' );
			const svg = parsed.querySelector( 'svg' );
			const viewBox = svg.getAttribute( 'viewBox' );

			if ( viewBox ) {
				this.viewBox = viewBox;
			}

			this.element.innerHTML = '';

			while ( svg.childNodes.length > 0 ) {
				this.element.appendChild( svg.childNodes[ 0 ] );
			}
		}
	}

	/**
	 * Fills all child `path.ck-icon__fill` with the `#fillColor`.
	 *
	 * @private
	 */
	_colorFillPaths() {
		if ( this.fillColor ) {
			this.element.querySelectorAll( '.ck-icon__fill' ).forEach( path => {
				path.style.fill = this.fillColor;
			} );
		}
	}
}
