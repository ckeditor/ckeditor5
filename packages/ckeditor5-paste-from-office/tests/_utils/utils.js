/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/**
 * Checks whether for a given editor instance pasting specific content (input) gives expected result (output).
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} input Data to paste.
 * @param {String} output Expected output.
 */
export function expectPaste( editor, input, output ) {
	pasteHtml( editor, input );

	expect( getData( editor.model ) ).to.equal( output );
}

// Fires paste event on a given editor instance with a specific HTML data.
//
// @param {module:core/editor/editor~Editor} editor Editor instance on which paste event will be fired.
// @param {String} html The HTML data with which paste event will be fired.
function pasteHtml( editor, html ) {
	editor.editing.view.document.fire( 'paste', {
		dataTransfer: createDataTransfer( { 'text/html': html } ),
		preventDefault() {}
	} );
}

// Mocks dataTransfer object which can be used for simulating paste.
//
// @param {Object} data Object containing "mime type - data" pairs.
// @returns {Object} DataTransfer mock object.
function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}
