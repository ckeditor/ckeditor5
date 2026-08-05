/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll.js';

document.getElementById( 'scrollToBlue' )!.addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' ) as HTMLElement;

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-blue button' )!.addEventListener( 'click', () => {
	const target = document.querySelector( '#target-red .target' ) as HTMLElement;

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-red button' )!.addEventListener( 'click', () => {
	const target = document.querySelector( '#target-green .target' ) as HTMLElement;

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-green button' )!.addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' ) as HTMLElement;

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

function getConfig() {
	return {
		viewportOffset: parseInt( ( document.getElementById( 'viewportOffset' ) as HTMLInputElement ).value ),
		ancestorOffset: parseInt( ( document.getElementById( 'ancestorOffset' ) as HTMLInputElement ).value ),
		alignToTop: ( document.getElementById( 'alignToTop' ) as HTMLInputElement ).checked
	};
}
