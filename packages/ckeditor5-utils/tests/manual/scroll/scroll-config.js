/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll.js';

document.getElementById( 'navigation' ).addEventListener( 'click', evt => {
	if ( evt.target.nodeName == 'BUTTON' ) {
		const target = document.getElementById( evt.target.dataset.scrollTo );
		scrollViewportToShowTarget( {
			target,
			...getConfig()
		} );

		target.classList.add( 'highlight' );

		setTimeout( () => {
			target.classList.remove( 'highlight' );
		}, 200 );
	}
}, { useCapture: true } );

document.getElementById( 'alignToTop' ).addEventListener( 'change', event => {
	document.getElementById( 'forceScroll' ).disabled = !event.currentTarget.checked;
} );

document.getElementById( 'forceScroll' ).disabled = !document.getElementById( 'alignToTop' ).checked;

function getConfig() {
	return {
		viewportOffset: parseInt( document.getElementById( 'viewportOffset' ).value ),
		ancestorOffset: parseInt( document.getElementById( 'ancestorOffset' ).value ),
		alignToTop: document.getElementById( 'alignToTop' ).checked,
		forceScroll: document.getElementById( 'forceScroll' ).checked
	};
}
