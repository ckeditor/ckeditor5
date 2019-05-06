/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module core/editor/utils/preventrunintextarea
 */

import { isElement } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Function returns rejected promise, when passed argument is a textarea element.
 * In any other case is returned empty resolved promise.
 *
 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
 * or the editor's initial data.
 * @returns {Promise}
 */
export default function preventRunInTextarea( someElementOrData ) {
	if ( isElement( someElementOrData ) && someElementOrData.tagName.toLowerCase() === 'textarea' ) {
		return Promise.reject(
			new CKEditorError( 'editor-wrong-element: This type of editor cannot be initialised inside <textarea> element.' )
		);
	}
	return Promise.resolve();
}
