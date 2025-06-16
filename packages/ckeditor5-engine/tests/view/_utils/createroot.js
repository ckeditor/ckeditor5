/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewRootEditableElement } from '../../../src/view/rooteditableelement.js';

/**
 * Creates view root element and sets it to {@link module:engine/view/document~ViewDocument#roots roots collection}.
 *
 * @param {module:engine/view/document~ViewDocument} doc View document.
 * @param {String} name Root element name.
 * @param {String} rootName Root name.
 * @returns {module:engine/view/rooteditableelement~ViewRootEditableElement} Root element.
 */
export function createViewRoot( doc, name = 'div', rootName = 'main' ) {
	const root = new ViewRootEditableElement( doc, name );

	root.rootName = rootName;
	doc.roots.add( root );

	return root;
}
