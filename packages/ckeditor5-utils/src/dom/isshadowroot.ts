/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/isshadowroot
 */

/**
 * Checks if the object is a native DOM ShadowRoot.
 */
export default function isShadowRoot( obj: any ): obj is ShadowRoot {
	if ( !obj ) {
		return false;
	}

	if ( obj.ownerDocument && obj.ownerDocument.defaultView ) {
		return obj instanceof obj.ownerDocument.defaultView.ShadowRoot;
	}

	return false;
}
