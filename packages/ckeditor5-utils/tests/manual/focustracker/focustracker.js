/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FocusTracker from '../../../src/focustracker';

const focusTracker = new FocusTracker();
const counters = document.querySelectorAll( '.status b' );

[].forEach.call( document.querySelectorAll( '.track' ), el => focusTracker.add( el ) );

focusTracker.on( 'change:isFocused', ( evt, name, value ) => {
	const el = counters[ value ? 0 : 1 ];
	el.textContent = parseInt( el.textContent ) + 1;
} );
