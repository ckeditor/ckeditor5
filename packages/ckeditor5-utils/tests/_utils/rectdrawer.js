/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import global from '../../src/dom/global';

/**
 * A helper class that makes it possible to visualize {@link module:utils/dom/rect~Rect rect objects}.
 */
export default class RectDrawer {
	/**
	 * Draws a rect object on the screen.
	 *
	 *		const rect = new Rect( domElement );
	 *
	 *		// Simple usage.
	 *		RectDrawer.draw( rect );
	 *
	 *		// With custom styles.
	 *		RectDrawer.draw( rect, { outlineWidth: '3px', opacity: '.8' } );
	 *
	 *		// With custom styles and a name.
	 *		RectDrawer.draw( rect, { outlineWidth: '3px', opacity: '.8' }, 'Main element' );
	 *
	 * **Note**: In most cases, drawing a rect should be preceded by {@link module:minimap/utils~RectDrawer.clear}.
	 *
	 * @static
	 * @param {module:utils/dom/rect~Rect} rect The rect to be drawn.
	 * @param {Object} [userStyles] An optional object with custom styles for the rect.
	 * @param {String} [name] The optional name of the rect.
	 */
	static draw( rect, userStyles = {}, name ) {
		if ( !RectDrawer._stylesElement ) {
			RectDrawer._injectStyles();
		}

		const element = global.document.createElement( 'div' );

		// Make it work when the browser viewport is zoomed in (mainly on mobiles).
		const { offsetLeft, offsetTop } = global.window.visualViewport;

		const rectGeometryStyles = {
			top: `${ rect.top + offsetTop }px`,
			left: `${ rect.left + offsetLeft }px`,
			width: `${ rect.width }px`,
			height: `${ rect.height }px`
		};

		Object.assign( element.style, RectDrawer._defaultStyles, rectGeometryStyles, userStyles );

		element.classList.add( 'ck-rect-drawer-preview' );

		if ( name ) {
			element.dataset.name = name;
		}

		global.document.body.appendChild( element );

		this._domElements.push( element );
	}

	/**
	 * Clears all previously {@link module:minimap/utils~RectDrawer.draw drawn} rects.
	 *
	 * @static
	 */
	static clear() {
		for ( const element of this._domElements ) {
			element.remove();
		}

		this._domElements.length = 0;
	}

	/**
	 * @private
	 * @static
	 */
	static _injectStyles() {
		RectDrawer._stylesElement = global.document.createElement( 'style' );
		RectDrawer._stylesElement.innerHTML = `
			div.ck-rect-drawer-preview[data-name]::after {
				content: attr(data-name);
				position: absolute;
				left: 3px;
				top: 3px;
				font-family: monospace;
				background: #000;
				color: #fff;
				font-size: 9px;
				padding: 1px 3px;
				pointer-events: none;
			}
		`;

		global.document.head.appendChild( RectDrawer._stylesElement );
	}
}

/**
 * @private
 * @member {Object} module:minimap/utils~RectDrawer._defaultStyles
 */
RectDrawer._defaultStyles = {
	position: 'fixed',
	outlineWidth: '1px',
	outlineStyle: 'solid',
	outlineColor: 'blue',
	outlineOffset: '-1px',
	zIndex: 999,
	opacity: .5,
	pointerEvents: 'none'
};

/**
 * @private
 * @member {Array.<HTMLElement>} module:minimap/utils~RectDrawer._domElements
 */
RectDrawer._domElements = [];

/**
 * @private
 * @member {HTMLElement|null} module:minimap/utils~RectDrawer._stylesElement
 */
RectDrawer._stylesElement = null;
