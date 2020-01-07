/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, setTimeout */

import { getOptimalPosition } from '../../../src/dom/position';

const boxes = document.querySelectorAll( '.test-box' );
const sources = document.querySelectorAll( '.source' );
const target = document.querySelector( '.target' );

target.scrollIntoView();

const positions = {
	nw: targetRect => ( {
		top: targetRect.top,
		left: targetRect.left,
		name: 'nw'
	} ),
	ne: ( targetRect, sourceRect ) => ( {
		top: targetRect.top,
		left: targetRect.right - sourceRect.width,
		name: 'ne'
	} ),
	sw: ( targetRect, sourceRect ) => ( {
		top: targetRect.bottom - sourceRect.height,
		left: targetRect.left,
		name: 'sw'
	} ),
	se: ( targetRect, sourceRect ) => ( {
		top: targetRect.bottom - sourceRect.height,
		left: targetRect.right - sourceRect.width,
		name: 'se'
	} )
};

for ( const box of boxes ) {
	box.scrollTop = box.scrollHeight;
	box.scrollLeft = box.scrollWidth;
}

// Wait for the scroll to stabilize.
setTimeout( () => {
	for ( const source of sources ) {
		const position = getOptimalPosition( {
			element: source,
			target,
			positions: [
				positions[ source.className.split( '-' )[ 1 ] ]
			],
			limiter: document.body
		} );

		source.style.top = position.top + 'px';
		source.style.left = position.left + 'px';
	}
}, 100 );
