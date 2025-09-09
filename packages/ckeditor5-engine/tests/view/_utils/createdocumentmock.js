/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ObservableMixin } from '@ckeditor/ckeditor5-utils';
import { ViewDocumentSelection } from '../../../src/view/documentselection.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

/**
 * Creates {@link module:engine/view/document~ViewDocument view Document} mock.
 *
 * @returns {utils.ObservableMixin} Document mock
 */
export function createViewDocumentMock() {
	const doc = new ( ObservableMixin() )();
	doc.set( 'isFocused', false );
	doc.set( 'isReadOnly', false );
	doc.selection = new ViewDocumentSelection();
	doc.stylesProcessor = new StylesProcessor();

	return doc;
}
