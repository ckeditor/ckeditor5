/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/iseventtarget
 */

/* global window */

import isNode from './isnode.js';
import isWindow from './iswindow.js';

/**
 * Checks if the object is a native DOM EventTarget.
 */
export default function isEventTarget( obj: any ): obj is EventTarget {
	if ( !obj ) {
		return false;
	}

	if ( isNode( obj ) || isWindow( obj ) ) {
		return true;
	}

	// TODO this is safe for EditContext (it's created from window.EditContext) but unsure for other cases.
	return obj instanceof window.EventTarget;
}
