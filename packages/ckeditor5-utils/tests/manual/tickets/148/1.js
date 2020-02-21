/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { getOptimalPosition } from '../../../../src/dom/position';

const source = document.querySelector( '.source' );
const target = document.querySelector( '.target' );
const limiter = document.querySelector( '.limiter' );
const positions = {
	above: ( targetRect, sourceRect ) => ( {
		top: targetRect.top - sourceRect.height - 50,
		left: targetRect.left,
		name: 'above'
	} ),
	below: targetRect => ( {
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

	source.style.top = position.top + 'px';
	source.style.left = position.left + 'px';
}

updateSourcePosition();

document.addEventListener( 'scroll', updateSourcePosition, true );
