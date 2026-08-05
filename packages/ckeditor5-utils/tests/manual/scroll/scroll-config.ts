/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll.js';

document.getElementById( 'navigation' )!.addEventListener( 'click', evt => {
	if ( ( evt.target as HTMLElement ).nodeName == 'BUTTON' ) {
		const target = document.getElementById( ( evt.target as HTMLElement ).dataset.scrollTo! );
		scrollViewportToShowTarget( {
			target: target!,
			...getConfig()
		} );

		target!.classList.add( 'highlight' );

		setTimeout( () => {
			target!.classList.remove( 'highlight' );
		}, 200 );
	}
}, { useCapture: true } as AddEventListenerOptions );

document.getElementById( 'alignToTop' )!.addEventListener( 'change', event => {
	( document.getElementById( 'forceScroll' ) as HTMLInputElement ).disabled = !( event.currentTarget as HTMLInputElement ).checked;
} );

( document.getElementById( 'forceScroll' ) as HTMLInputElement ).disabled =
	!( document.getElementById( 'alignToTop' ) as HTMLInputElement ).checked;

function getConfig() {
	return {
		viewportOffset: parseInt( ( document.getElementById( 'viewportOffset' ) as HTMLInputElement ).value ),
		ancestorOffset: parseInt( ( document.getElementById( 'ancestorOffset' ) as HTMLInputElement ).value ),
		alignToTop: ( document.getElementById( 'alignToTop' ) as HTMLInputElement ).checked,
		forceScroll: ( document.getElementById( 'forceScroll' ) as HTMLInputElement ).checked as any
	};
}
