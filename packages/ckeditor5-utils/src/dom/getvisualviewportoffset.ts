/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getvisualviewportoffset
 */

import global from './global.js';
import env from '../env.js';

/**
 * Returns the visual viewport offsets to adjust elements with `position: fixed` style.
 */
export default function getVisualViewportOffset(): { left: number; top: number } {
	const visualViewport = global.window.visualViewport;

	if ( !visualViewport || !( env.isiOS || env.isSafari ) ) {
		return { left: 0, top: 0 };
	}

	const left = Math.max( Math.round( visualViewport.offsetLeft ), 0 );
	const top = Math.max( Math.round( visualViewport.offsetTop ), 0 );

	return { left, top };
}
