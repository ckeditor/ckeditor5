/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Rect, global } from 'ckeditor5/src/utils';
import {
	DomConverter,
	Renderer
} from 'ckeditor5/src/engine';

/**
 * TODO
 *
 * @private
 * @param {*} editor
 * @param {*} rootName
 * @returns
 */
export function cloneDomRoot( editor, rootName ) {
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

	editor.on( 'destroy', () => {
		// console.log( 'TODO clone cleanup' );
	} );

	return domRootClone;
}

/**
 * TODO
 *
 * @returns
 */
export function getPageStyles() {
	let pageStyles = '';

	const styleSheets = Array.from( global.document.styleSheets )
		.filter( styleSheet => {
			// CORS
			return !styleSheet.href || styleSheet.href.startsWith( global.window.location.origin );
		} );

	for ( const styleSheet of styleSheets ) {
		for ( const rule of styleSheet.cssRules ) {
			pageStyles += rule.cssText + ' \n';
		}
	}

	return pageStyles;
}

/**
 * TODO
 *
 * @returns
 */
export function getDomElementRect( domElement ) {
	return new Rect( domElement === global.document.body ? global.window : domElement );
}

/**
 * TODO
 *
 * @returns
 */
export function getClientHeight( domElement ) {
	return domElement === global.document.body ? global.window.innerHeight : domElement.clientHeight;
}

/**
 * TODO
 *
 * @returns
 */
export function getScrollable( domElement ) {
	return domElement === global.document.body ? global.window : domElement;
}

/**
 * Returns closest scrollable ancestor DOM element.
 *
 * TODO: Move to shared utils.
 *
 * @param {*} domNode
 * @returns
 */
export function findClosestScrollableAncestor( domNode ) {
	let domElement = domNode;

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
 * TODO
 *
 * TODO: Move to shared utils.
 *
 * @private
 */
export class RectDrawer {
	static draw( rect, userStyles = {}, name ) {
		if ( !RectDrawer.stylesElement ) {
			RectDrawer.injectStyles();
		}

		const element = global.document.createElement( 'div' );

		const rectGeometryStyles = {
			top: `${ rect.top }px`,
			left: `${ rect.left }px`,
			width: `${ rect.width }px`,
			height: `${ rect.height }px`
		};

		Object.assign( element.style, RectDrawer.defaultStyles, rectGeometryStyles, userStyles );

		element.classList.add( 'ck-rect-preview' );

		if ( name ) {
			element.dataset.name = name;
		}

		global.document.body.appendChild( element );

		this.domElements.push( element );
	}

	static clear() {
		for ( const element of this.domElements ) {
			element.remove();
		}

		this.domElements.length = 0;
	}

	static injectStyles() {
		RectDrawer.stylesElement = global.document.createElement( 'style' );
		RectDrawer.stylesElement.innerHTML = `
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

		global.document.head.appendChild( RectDrawer.stylesElement );
	}
}

RectDrawer.defaultStyles = {
	position: 'fixed',
	outlineWidth: '1px',
	outlineStyle: 'solid',
	outlineColor: 'blue',
	outlineOffset: '-1px',
	zIndex: 999,
	opacity: .5,
	pointerEvents: 'none'
};

RectDrawer.domElements = [];

RectDrawer.stylesElement = null;
