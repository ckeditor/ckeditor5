/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals InputEvent */

/**
 * Fires the `beforeinput` DOM event on the editor's editing root DOM
 * element with given data.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {Object} evtData
 * @param {String} evtData.inputType
 * @param {String} [ evtData.data ]
 * @param {DataTransfer} [ evtData.dataTransfer ]
 * @param {Array.<DOMRange>} [ evtData.ranges ]
 */
export function fireBeforeInputEvent( editor, evtData ) {
	const { inputType, data, dataTransfer, ranges } = evtData;

	const event = new InputEvent( 'beforeinput', {
		data,
		inputType,
		dataTransfer
	} );

	if ( ranges ) {
		event.getTargetRanges = () => ranges;
	}

	editor.ui.getEditableElement().dispatchEvent( event );
}
