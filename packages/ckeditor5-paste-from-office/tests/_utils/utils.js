/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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

const spacesElementsOnlyRegex = />(\s+)<\//g;

/**
 * Compares two HTML strings.
 *
 * This function is designed for comparing normalized data so expected input is preprocessed before comparing:
 *
 *		* Tabs on the lines beginning are removed.
 *		* Line breaks and empty lines are removed.
 *		* Space preceding `<o:p></o:p>` tag is replaced with `&nbsp;`.
 *		* Elements with spaces only have them replaced with `&nbsp;`'s.
 *
 * The expected input should be prepared in the above in mind which means every element containing text nodes must start
 * and end in the same line. So expected input may be formatted like:
 *
 * 		<span lang=PL style='mso-ansi-language:PL'>	03<span style='mso-spacerun:yes'>   </span><o:p></o:p></span>
 *
 * 	but not like:
 *
 * 		<span lang=PL style='mso-ansi-language:PL'>
 * 			03<span style='mso-spacerun:yes'>   </span>
 * 			<o:p></o:p>
 * 		</span>
 *
 * 	because tabulator preceding `03` text will be treated as formatting character and will be removed.
 *
 * @param {String} actual
 * @param {String} expected
 */
export function expectNormalized( actual, expected ) {
	let expectedNormalized = expected
		// Replace tabs on the lines beginning as normalized input files are formatted.
		.replace( /^\t*</gm, '<' )
		// Replace line breaks (after closing tags), as they may produce additional spaces during HTML normalization.
		.replace( /[\r\n]/gm, '' )
		// Replaces space before Word `<o:p></o:p>` tags so it is not removed during `normalizeHtml()` function call.
		.replace( / <o:p>/g, '\u00A0<o:p>' );

	// Replace spaces with `&nbsp;` inside elements with spaces only to prevent them from being removed during normalization.
	expectedNormalized = expectedNormalized.replace( spacesElementsOnlyRegex, ( match, spaces ) => {
		return `>${ Array( spaces.length + 1 ).join( '\u00A0' ) }</`;
	} );

	expect( stringify( actual ) ).to.equal( normalizeHtml( expectedNormalized ) );
}
