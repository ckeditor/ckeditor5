/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

/**
 * Fires the `beforeinput` DOM event on the editor's editing root DOM
 * element with given data.
 *
 * @param {HTMLElement} domRoot
 * @param {Object} evtData
 * @param {String} evtData.inputType
 * @param {String} [ evtData.data ]
 * @param {DataTransfer} [ evtData.dataTransfer ]
 * @param {Array.<DOMRange>} [ evtData.ranges ]
 */
export function fireBeforeInputDomEvent( domRoot, evtData ) {
	const { inputType, data, dataTransfer, ranges } = evtData;

	const event = new Event( 'beforeinput' );

	Object.assign( event, {
		data,
		dataTransfer,
		inputType,
		getTargetRanges: () => ranges || []
	} );

	domRoot.dispatchEvent( event );
}

/**
 * Fires the `compositionend` DOM event on the editor's editing root DOM
 * element with given data.
 *
 * @param {HTMLElement} domRoot
 * @param {Object} evtData
 */
export function fireCompositionEndDomEvent( domRoot, evtData ) {
	domRoot.dispatchEvent( Object.assign( new Event( 'compositionend' ), evtData ) );
}
