/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '../../src/dom/global.js';

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
	static draw( rect, userStyles = {}, name, options = {} ) {
		if ( !RectDrawer._stylesElement ) {
			RectDrawer._injectStyles();
		}

		const element = global.document.createElement( 'div' );

		// Make it work when the browser viewport is zoomed in (mainly on mobiles).
		const { offsetLeft, offsetTop } = options.visualViewportOrigin ? { offsetLeft: 0, offsetTop: 0 } : global.window.visualViewport;

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
				font-size: 8px;
				padding: 1px 3px;
				pointer-events: none;
				white-space: pre;
			}
		`;

		global.document.head.appendChild( RectDrawer._stylesElement );
	}
}

// eslint-disable-next-line @stylistic/max-len
const sharedDiagonalBackgroundSvg = 'url("data:image/svg+xml;utf8,<svg width=\x27100\x27 height=\x27100\x27 fill=\x27none\x27 xmlns=\x27http://www.w3.org/2000/svg\x27><path d=\x27M0 0L100 100\x27 stroke=\x27black\x27 stroke-width=\x271\x27 vector-effect=\x27non-scaling-stroke\x27/><path d=\x27M100 0L-4.37114e-06 100\x27 stroke=\x27black\x27 stroke-width=\x271\x27 vector-effect=\x27non-scaling-stroke\x27/></svg>")';
const sharedDiagonalStyles = {
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 100%',
	outlineStyle: 'solid',
	outlineWidth: '1px'
};

export const diagonalStylesBlack = {
	backgroundImage: sharedDiagonalBackgroundSvg,
	outlineColor: 'black',
	...sharedDiagonalStyles
};

export const diagonalStylesGreen = {
	backgroundImage: sharedDiagonalBackgroundSvg.replaceAll( 'black', 'green' ),
	outlineColor: 'green',
	...sharedDiagonalStyles
};

export const diagonalStylesRed = {
	backgroundImage: sharedDiagonalBackgroundSvg.replaceAll( 'black', 'red' ),
	outlineColor: 'red',
	...sharedDiagonalStyles
};

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
