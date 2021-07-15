/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global CSSMediaRule */

/**
 * @module minimap/utils
 */

import { Rect, global } from 'ckeditor5/src/utils';
import { DomConverter, Renderer } from 'ckeditor5/src/engine';

/**
 * Clones the editing view DOM root by using a dedicated pair of {@link module:engine/view/renderer~Renderer} and
 * {@link module:engine/view/domconverter~DomConverter}. The DOM root clone updates incrementally to stay in sync with the
 * source root.
 *
 * @protected
 * @param {module:core/editor/editor~Editor} editor The editor instance the original editing root belongs to.
 * @param {String} rootName The name of the root to clone.
 * @returns {HTMLElement} The editing root DOM clone element.
 */
export function cloneEditingViewDomRoot( editor, rootName ) {
	const viewDocument = editor.editing.view.document;
	const viewRoot = viewDocument.getRoot( rootName );
	const domConverter = new DomConverter( viewDocument );
	const renderer = new Renderer( domConverter, viewDocument.selection );
	const domRootClone = editor.editing.view.getDomRoot().cloneNode();

	domConverter.bindElements( domRootClone, viewRoot );

	renderer.markToSync( 'children', viewRoot );
	renderer.markToSync( 'attributes', viewRoot );

	viewRoot.on( 'change:children', ( evt, node ) => renderer.markToSync( 'children', node ) );
	viewRoot.on( 'change:attributes', ( evt, node ) => renderer.markToSync( 'attributes', node ) );
	viewRoot.on( 'change:text', ( evt, node ) => renderer.markToSync( 'text', node ) );

	renderer.render();

	editor.editing.view.on( 'render', () => renderer.render() );

	// TODO: Cleanup after destruction.
	editor.on( 'destroy', () => {
		domConverter.unbindDomElement( domRootClone );
	} );

	return domRootClone;
}

/**
 * Harvests all web page styles, for instance, to allow re-using them in an `<iframe>` preserving the look of the content.
 *
 * The returned data format is as follows:
 *
 *		[
 *			'p { color: red; ... } h2 { font-size: 2em; ... } ...',
 *			'.spacing { padding: 1em; ... }; ...',
 *			'...',
 *			{ href: 'http://link.to.external.stylesheet' },
 *			{ href: '...' }
 *		]
 *
 * **Note**: For stylesheets with `href` different than window origin, an object is returned because
 * accessing rules of these styles may cause CORS errors (depending on the configuration of the web page).
 *
 * @protected
 * @returns {Array.<String|Object>}
 */
export function getPageStyles() {
	return Array.from( global.document.styleSheets )
		.map( styleSheet => {
			// CORS
			if ( styleSheet.href && !styleSheet.href.startsWith( global.window.location.origin ) ) {
				return { href: styleSheet.href };
			}

			return Array.from( styleSheet.cssRules )
				.filter( rule => !( rule instanceof CSSMediaRule ) )
				.map( rule => rule.cssText )
				.join( ' \n' );
		} );
}

/**
 * TODO
 *
 * @protected
 * @returns {module:utils/dom/rect~Rect}
 */
export function getDomElementRect( domElement ) {
	return new Rect( domElement === global.document.body ? global.window : domElement );
}

/**
 * TODO
 *
 * @protected
 * @returns {Number}
 */
export function getClientHeight( domElement ) {
	return domElement === global.document.body ? global.window.innerHeight : domElement.clientHeight;
}

/**
 * TODO
 *
 * @protected
 * @returns {HTMLElement}
 */
export function getScrollable( domElement ) {
	return domElement === global.document.body ? global.window : domElement;
}

/**
 * Returns the closest scrollable ancestor of a DOM element.
 *
 * TODO: Move to shared utils.
 *
 * @protected
 * @param {HTMLElement} domElement
 * @returns {HTMLElement|null}
 */
export function findClosestScrollableAncestor( domElement ) {
	do {
		domElement = domElement.parentElement;

		if ( !domElement ) {
			return null;
		}

		const overflow = global.window.getComputedStyle( domElement ).overflowY;

		if ( overflow === 'auto' || overflow === 'scroll' ) {
			break;
		}
	} while ( domElement.tagName != 'BODY' );

	return domElement;
}

/**
 * A helper class that makes it possible to visualize {@link module:utils/dom/rect~Rect rect objects}.
 *
 * TODO: Move this class to shared utils.
 *
 * @protected
 */
export class RectDrawer {
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

		const rectGeometryStyles = {
			top: `${ rect.top }px`,
			left: `${ rect.left }px`,
			width: `${ rect.width }px`,
			height: `${ rect.height }px`
		};

		Object.assign( element.style, RectDrawer._defaultStyles, rectGeometryStyles, userStyles );

		element.classList.add( 'ck-rect-preview' );

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
			div.ck-rect-preview::after {
				content: attr(data-name);
				position: absolute;
				left: 3px;
				top: 3px;
				font-family: monospace;
				background: #000;
				color: #fff;
				font-size: 10px;
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
