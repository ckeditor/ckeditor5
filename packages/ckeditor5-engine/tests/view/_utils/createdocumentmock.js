/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Selection from '../../../src/view/selection';

/**
 * Creates {@link module:engine/view/document~Document view Document} mock.
 *
 * @returns {utils.ObservableMixin} Document mock
 */
export default function createDocumentMock() {
	const doc = Object.create( ObservableMixin );
	doc.set( 'isFocused', false );
	doc.set( 'isReadOnly', false );
	doc.selection = new Selection();

	return doc;
}
