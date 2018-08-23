/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/**
 * Checks whether for a given editor instance pasting specific content (input) gives expected result (output).
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} input Data to paste.
 * @param {String} expectedModel Expected model.
 * @param {String} [expectedView=null] Expected view.
 */
export function expectPaste( editor, input, expectedModel, expectedView = null ) {
	pasteHtml( editor, input );

	expect( getModelData( editor.model ) ).to.equal( expectedModel );

	if ( expectedView ) {
		expect( getViewData( editor.editing.view ) ).to.equal( expectedView );
	}
}

/**
 * Mocks dataTransfer object which can be used for simulating paste.
 *
 * @param {Object} data Object containing "mime type - data" pairs.
 * @returns {Object} DataTransfer mock object.
 */
export function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}

/**
 * Fires paste event on a given editor instance with a specific HTML data.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance on which paste event will be fired.
 * @param {String} html The HTML data with which paste event will be fired.
 */
export function pasteHtml( editor, html ) {
	editor.editing.view.document.fire( 'paste', {
		dataTransfer: createDataTransfer( { 'text/html': html } ),
		preventDefault() {}
	} );
}
