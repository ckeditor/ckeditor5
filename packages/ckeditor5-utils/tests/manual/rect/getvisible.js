/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import Rect from '../../../src/dom/rect';
import RectDrawer from '../../_utils/rectdrawer';

window.addEventListener( 'scroll', drawVisibleRects, true );
window.addEventListener( 'resize', drawVisibleRects );
drawVisibleRects();

function drawVisibleRects() {
	RectDrawer.clear();

	const children = Array.from( document.querySelectorAll( '.child' ) );
	const parents = Array.from( document.querySelectorAll( '.parent' ) );

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
			RectDrawer.draw( visibleRect, {
				opacity: '1',
				// eslint-disable-next-line max-len
				backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIuMDAwMDEgMkwxOTAgMTkwTTE5MCAyTDIgMTkwIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+Cg==")',
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100% 100%',
				outlineWidth: '2px',
				outlineStyle: 'solid',
				outlineColor: 'black'
			} );
		}
	}
}
