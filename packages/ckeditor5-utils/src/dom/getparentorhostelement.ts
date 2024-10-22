/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getparentorhostelement
 */

import isShadowRoot from './isshadowroot.js';

/**
 * TODO
 */
export default function getParentOrHostElement( node: Node ): Element | null {
	return isShadowRoot( node.parentNode ) ? node.parentNode.host : node.parentElement;
}
