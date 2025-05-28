/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FocusTracker from '../../../src/focustracker.js';

const focusTracker = new FocusTracker();
const counters = document.querySelectorAll( '.status b' );

[].forEach.call( document.querySelectorAll( '.track' ), el => focusTracker.add( el ) );

focusTracker.on( 'change:isFocused', ( evt, name, value ) => {
	const el = counters[ value ? 0 : 1 ];
	el.textContent = parseInt( el.textContent ) + 1;
} );
