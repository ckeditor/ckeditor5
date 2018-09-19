/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global navigator */

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

import { stringify as stringifyModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/**
 * Compares two models string representations. The input HTML is processed through paste
 * pipeline where it is transformed into model. This function hooks into {@link module:engine/model/model~Model#insertContent}
 * to get the model representation before it is inserted.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 * @param {String} input Input HTML which will be pasted into the editor.
 * @param {String} expected Expected model.
 */
export function expectModel( editor, input, expected ) {
	const editorModel = editor.model;
	const insertContent = editorModel.insertContent;

	let actual = '';

	sinon.stub( editorModel, 'insertContent' ).callsFake( ( content, selection ) => {
		// Save model string representation now as it may change after `insertContent()` function call
		// so accessing it later may not work as it may have empty/changed structure.
		actual = stringifyModel( content );
		insertContent.call( editorModel, content, selection );
	} );

	pasteHtml( editor, input );

	sinon.restore();

	expect( actual ).to.equal( expected );
}

/**
 * Compares two HTML strings.
 *
 * This function is designed for comparing normalized data so expected input is preprocessed before comparing:
 *
 *		* Tabs on the lines beginnings are removed.
 *		* Line breaks and empty lines are removed.
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
 * 	because tab preceding `03` text will be treated as formatting character and will be removed.
 *
 * @param {String} actual Actual HTML.
 * @param {String} expected Expected HTML.
 */
export function expectNormalized( actual, expected ) {
	const expectedInlined = expected
	// Replace tabs on the lines beginning as normalized input files are formatted.
		.replace( /^\t*</gm, '<' )
		// Replace line breaks (after closing tags) too.
		.replace( /[\r\n]/gm, '' );

	// We are ok with both spaces and non-breaking spaces in the actual content.
	// Replace `&nbsp;` with regular spaces to align with expected content (where regular spaces are only used).
	const actualNormalized = stringifyView( actual ).replace( /\u00A0/g, ' ' );

	expect( actualNormalized ).to.equal( normalizeHtml( expectedInlined ) );
}

/**
 * Mocks dataTransfer object which can be used for simulating paste.
 *
 * @param {Object} data Object containing 'mime type - data' pairs.
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
 * Returns the name of the browser in which code is executed based on `window.navigator` object.
 *
 * @returns {String|null} Lowercase browser name or null if non-standard browser is used.
 */
export function getBrowserName() {
	const browsers = detectBrowsers( navigator );

	const browser = Object.keys( browsers ).filter( browserName => !!browsers[ browserName ] );

	return browser.length ? browser[ 0 ] : null;
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

// Checks if current browser is one of the predefined ones (Chrome, Edge, Firefox, IE, Safari).
//
// @param {Navigator} navigator Browser `window.navigator` object on which detection is based.
// @returns {{chrome: Boolean, edge: Boolean, firefox: Boolean, ie: Boolean, safari: Boolean}}
function detectBrowsers( navigator ) {
	const agent = navigator.userAgent.toLowerCase();
	const edge = agent.match( /edge[ /](\d+.?\d*)/ );
	const trident = agent.indexOf( 'trident/' ) > -1;
	const ie = !!( edge || trident );
	const webkit = !ie && ( agent.indexOf( ' applewebkit/' ) > -1 );
	const gecko = navigator.product === 'Gecko' && !webkit && !ie;
	const chrome = webkit && agent.indexOf( 'chrome' ) > -1;

	return {
		chrome,
		edge: !!edge,
		firefox: gecko,
		ie,
		safari: webkit && !chrome,
	};
}
