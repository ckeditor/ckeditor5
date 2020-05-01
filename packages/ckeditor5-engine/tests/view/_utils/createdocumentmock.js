/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import DocumentSelection from '../../../src/view/documentselection';
import { StylesProcessor } from '../../../src/view/stylesmap';

/**
 * Creates {@link module:engine/view/document~Document view Document} mock.
 *
 * @returns {utils.ObservableMixin} Document mock
 */
export default function createDocumentMock() {
	const doc = Object.create( ObservableMixin );
	doc.set( 'isFocused', false );
	doc.set( 'isReadOnly', false );
	doc.selection = new DocumentSelection();
	doc.stylesProcessor = new StylesProcessor();

	return doc;
}
