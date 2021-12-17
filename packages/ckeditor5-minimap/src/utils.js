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
