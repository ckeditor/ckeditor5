/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Rect from '../../../src/dom/rect.js';
import RectDrawer, { diagonalStylesBlack } from '../../_utils/rectdrawer.js';

window.addEventListener( 'scroll', drawVisibleRects, true );
window.addEventListener( 'resize', drawVisibleRects );
drawVisibleRects();

function drawVisibleRects() {
	RectDrawer.clear();

	const children = Array.from( document.querySelectorAll( '.js-child' ) );
	const parents = Array.from( document.querySelectorAll( '.js-parent' ) );

	for ( const element of [ ...parents, ...children ] ) {
		const elementRect = new Rect( element );
		const overflow = window.getComputedStyle( element ).overflow;
		const position = window.getComputedStyle( element ).position;

		RectDrawer.draw( elementRect, {
			outlineWidth: '1px',
			outlineStyle: 'dashed',
			outlineColor: 'rgba(0,0,0,.3)',
			opacity: 1
		}, `ovf:${ overflow.slice( 0, 3 ) } pos:${ position.slice( 0, 4 ) }` );
	}

	for ( const child of children ) {
		const visibleRect = new Rect( child ).getVisible();

		if ( visibleRect ) {
			RectDrawer.draw( visibleRect, Object.assign( {}, diagonalStylesBlack, {
				opacity: '1',
				outlineWidth: '2px',
				outlineStyle: 'solid',
				outlineColor: 'black'
			} ) );
		}
	}
}
