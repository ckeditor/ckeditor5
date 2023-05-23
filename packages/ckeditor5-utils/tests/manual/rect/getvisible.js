/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import Rect from '../../../src/dom/rect';
import RectDrawer from '../../_utils/rectdrawer';

document.addEventListener( 'scroll', drawVisibleRects );
window.addEventListener( 'resize', drawVisibleRects );
drawVisibleRects();

function drawVisibleRects() {
	RectDrawer.clear();

	const children = Array.from( document.querySelectorAll( '.child' ) );

	for ( const child of children ) {
		const visibleRect = new Rect( child ).getVisible();

		RectDrawer.draw( new Rect( child ), {
			opacity: '1',
			background: 'none',
			outline: '1px dashed rgba(0,0,0,.3)'
		} );

		if ( visibleRect ) {
			RectDrawer.draw( visibleRect, {
				opacity: '1',
				// eslint-disable-next-line max-len
				backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIuMDAwMDEgMkwxOTAgMTkwTTE5MCAyTDIgMTkwIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+Cg==")',
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100% 100%',
				outline: '2px solid black'
			} );
		}
	}
}
