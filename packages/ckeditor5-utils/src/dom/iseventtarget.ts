/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/iseventtarget
 */

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

	// Check if obj is an instance of the EditContext.
	if ( obj.attachedElements && typeof obj.attachedElements == 'function' ) {
		const defaultView = obj.attachedElements()[ 0 ].ownerDocument.defaultView;

		return obj instanceof defaultView.EventTarget;
	}

	return false;
}
