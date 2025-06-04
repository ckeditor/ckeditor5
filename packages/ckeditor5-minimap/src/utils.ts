/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module minimap/utils
 */

import { Rect, global } from 'ckeditor5/src/utils.js';
import { DomConverter, Renderer } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';

/**
 * Clones the editing view DOM root by using a dedicated pair of {@link module:engine/view/renderer~Renderer} and
 * {@link module:engine/view/domconverter~DomConverter}. The DOM root clone updates incrementally to stay in sync with the
 * source root.
 *
 * @internal
 * @param editor The editor instance the original editing root belongs to.
 * @param rootName The name of the root to clone.
 * @returns The editing root DOM clone element.
 */
export function cloneEditingViewDomRoot( editor: Editor, rootName?: string ): HTMLElement {
	const viewDocument = editor.editing.view.document;
	const viewRoot = viewDocument.getRoot( rootName )!;
	const domConverter = new DomConverter( viewDocument );
	const renderer = new Renderer( domConverter, viewDocument.selection );
	const domRootClone = editor.editing.view.getDomRoot()!.cloneNode() as HTMLElement;

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
 * ```ts
 * [
 * 	'p { color: red; ... } h2 { font-size: 2em; ... } ...',
 * 	'.spacing { padding: 1em; ... }; ...',
 * 	'...',
 * 	{ href: 'http://link.to.external.stylesheet' },
 * 	{ href: '...' }
 * ]
 * ```
 *
 * **Note**: For stylesheets with `href` different than window origin, an object is returned because
 * accessing rules of these styles may cause CORS errors (depending on the configuration of the web page).
 *
 * @internal
 */
export function getPageStyles(): Array<string | { href: string }> {
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
 * Gets dimensions rectangle according to passed DOM element. Returns whole window's size for `body` element.
 *
 * @internal
 */
export function getDomElementRect( domElement: HTMLElement ): Rect {
	return new Rect( domElement === global.document.body ? global.window : domElement );
}

/**
 * Gets client height according to passed DOM element. Returns window's height for `body` element.
 *
 * @internal
 */
export function getClientHeight( domElement: HTMLElement ): number {
	return domElement === global.document.body ? global.window.innerHeight : domElement.clientHeight;
}

/**
 * Returns the DOM element itself if it's not a `body` element, whole window otherwise.
 *
 * @internal
 */
export function getScrollable( domElement: HTMLElement ): Window | HTMLElement {
	return domElement === global.document.body ? global.window : domElement;
}
