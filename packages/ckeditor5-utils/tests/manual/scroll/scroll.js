/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';

document.getElementById( 'scrollToBlue' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' );

	scrollViewportToShowTarget( { target } );
} );

document.querySelector( '#target-blue button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-red .target' );

	scrollViewportToShowTarget( { target } );
} );

document.querySelector( '#target-red button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-green .target' );

	scrollViewportToShowTarget( { target } );
} );

document.querySelector( '#target-green button' ).addEventListener( 'click', () => {
	const target = document.querySelector( '#target-blue .target' );

	scrollViewportToShowTarget( { target } );
} );
