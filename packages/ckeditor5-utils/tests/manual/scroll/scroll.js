/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll';

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
