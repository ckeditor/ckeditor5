/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { scrollViewportToShowTarget } from '../../../src/dom/scroll.js';

document.getElementById( 'scroll' ).addEventListener( 'click', () => {
	const target = window.frames[ 0 ].document.querySelector( '#target' );

	scrollViewportToShowTarget( { target } );
} );
