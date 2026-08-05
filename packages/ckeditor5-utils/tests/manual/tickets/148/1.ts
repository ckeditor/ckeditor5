/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getOptimalPosition } from '../../../../src/dom/position.js';
import type { Rect } from '../../../../src/dom/rect.js';

const source = document.querySelector( '.source' ) as HTMLElement;
const target = document.querySelector( '.target' ) as HTMLElement;
const limiter = document.querySelector( '.limiter' ) as HTMLElement;
const positions = {
	above: ( targetRect: Rect, sourceRect: Rect ) => ( {
		top: targetRect.top - sourceRect.height - 50,
		left: targetRect.left,
		name: 'above'
	} ),
	below: ( targetRect: Rect ) => ( {
		top: targetRect.bottom + 50,
		left: targetRect.left,
		name: 'below'
	} )
};

function updateSourcePosition() {
	const position = getOptimalPosition( {
		element: source,
		target,
		positions: [
			positions.above,
			positions.below
		],
		limiter
	} );

	source.style.top = position!.top + 'px';
	source.style.left = position!.left + 'px';
}

updateSourcePosition();

document.addEventListener( 'scroll', updateSourcePosition, true );
