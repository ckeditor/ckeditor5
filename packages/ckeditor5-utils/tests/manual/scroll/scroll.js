/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll';

document.getElementById( 'scrollToBlue' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' );

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-blue button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-red .target' );

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-red button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-green .target' );

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

document.querySelector( '#target-green button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' );

	scrollViewportToShowTarget( { target, ...getConfig() } );
} );

function getConfig() {
	return {
		viewportOffset: parseInt( document.getElementById( 'viewportOffset' ).value ),
		ancestorOffset: parseInt( document.getElementById( 'ancestorOffset' ).value ),
		alignToTop: document.getElementById( 'alignToTop' ).checked
	};
}
