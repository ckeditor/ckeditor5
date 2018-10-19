/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { setData, stringify as stringifyModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { fixtures, browserFixtures } from './fixtures';

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
 * Generates test groups based on provided parameters. Generated tests are specifically designed
 * to test pasted content transformations.
 *
 * This function generates test groups based on available fixtures:
 *
 * 1. If only generic fixtures are available they will be used for all listed browsers and combined into one test group.
 * 2. If there are browser-specific fixtures available they will be used for matching browser resulting in a separate
 * test group. All unmatched browsers will use generic fixtures combined into one separate test group.
 * 3. If some fixtures are marked to be skipped for a specific browser, the separate test group will be created for this browser.
 *
 * @param {Object} config
 * @param {String} config.type Type of tests to generate, could be 'normalization' or 'integration'.
 * @param {String} config.input Name of the fixtures group. Usually stored in `/tests/_data/groupname/`.
 * @param {Array.<String>} config.browsers List of all browsers for which to generate tests.
 * @param {Object} [config.editorConfig] Editor config which is passed to editor `create()` method.
 * @param {Object} [config.skip] List of fixtures for any browser to skip. The supported format is:
 *
 *		{
 *			browserName: [ fixtureName1, fixtureName2 ]
 *		}
 */
export function generateTests( config ) {
	if ( [ 'normalization', 'integration' ].indexOf( config.type ) === -1 ) {
		throw new Error( `Invalid tests type - \`config.type\`: '${ config.type }'.` );
	}

	if ( !config.input ) {
		throw new Error( 'No `config.input` option provided.' );
	}

	if ( !config.browsers || !config.browsers.length ) {
		throw new Error( 'No or empty `config.browsers` option provided.' );
	}

	const groups = groupFixturesByBrowsers( config.browsers, config.input, config.skip );
	const generateSuiteFn = config.type === 'normalization' ? generateNormalizationTests : generateIntegrationTests;

	describe( config.type, () => {
		describe( config.input, () => {
			const editorConfig = config.editorConfig || {};

			for ( const group of Object.keys( groups ) ) {
				const skip = config.skip && config.skip[ group ] ? config.skip[ group ] : [];

				if ( groups[ group ] ) {
					generateSuiteFn( group, groups[ group ], editorConfig, skip );
				}
			}
		} );
	} );
}

// Creates browser groups combining all browsers using same fixtures. Each browser which have
// some fixtures marked to be skipped automatically create separate groups.
//
// @param {Array.<String>} browsers List of all browsers for which fixture groups will be created.
// @param {String} fixturesGroup Fixtures group name.
// @returns {Object} Object containing browsers groups where key is the name of the group and value is fixtures object:
//
//		{
// 			'safari': { ... }
//			'edge': { ... }
//			'chrome, firefox': { ... }
// 		}
function groupFixturesByBrowsers( browsers, fixturesGroup, skipBrowsers ) {
	const browsersGroups = {};
	const browsersGeneric = browsers.slice( 0 );

	// Create separate groups for browsers with browser-specific fixtures available.
	for ( const browser of browsers ) {
		if ( browserFixtures[ fixturesGroup ] && browserFixtures[ fixturesGroup ][ browser ] ) {
			browsersGroups[ browser ] = browserFixtures[ fixturesGroup ][ browser ];
			browsersGeneric.splice( browsersGeneric.indexOf( browser ), 1 );
		}
	}

	// Create separate groups for browsers with skipped tests.
	if ( skipBrowsers ) {
		for ( const browser of Object.keys( skipBrowsers ) ) {
			if ( browsersGeneric.indexOf( browser ) !== -1 ) {
				browsersGroups[ browser ] = fixtures[ fixturesGroup ] ? fixtures[ fixturesGroup ] : null;
				browsersGeneric.splice( browsersGeneric.indexOf( browser ), 1 );
			}
		}
	}

	// Use generic fixtures (if available) for browsers left.
	if ( browsersGeneric.length ) {
		browsersGroups[ browsersGeneric.join( ', ' ) ] = fixtures[ fixturesGroup ] ? fixtures[ fixturesGroup ] : null;
	}

	return browsersGroups;
}

// Generates normalization tests based on a provided fixtures. For each input fixture one test is generated.
//
// @param {String} title Tests group title.
// @param {Object} fixtures Object containing fixtures.
// @param {Object} editorConfig Editor config with which test editor will be created.
// @param {Array.<String>} skip Array of fixtures names which tests should be skipped.
function generateNormalizationTests( title, fixtures, editorConfig, skip ) {
	describe( title, () => {
		let editor, pasteFromOfficePlugin;

		beforeEach( () => {
			return VirtualTestEditor
				.create( editorConfig )
				.then( newEditor => {
					editor = newEditor;

					pasteFromOfficePlugin = editor.plugins.get( 'PasteFromOffice' );
				} );
		} );

		for ( const name of Object.keys( fixtures.input ) ) {
			( skip.indexOf( name ) !== -1 ? it.skip : it )( name, () => {
				const dataTransfer = createDataTransfer( {
					'text/rtf': fixtures.inputRtf && fixtures.inputRtf[ name ]
				} );

				expectNormalized(
					pasteFromOfficePlugin._normalizeWordInput( fixtures.input[ name ], dataTransfer ),
					fixtures.normalized[ name ]
				);
			} );
		}
	} );
}

// Generates integration tests based on a provided fixtures. For each input fixture one test is generated.
//
// @param {String} title Tests group title.
// @param {Object} fixtures Object containing fixtures.
// @param {Object} editorConfig Editor config with which test editor will be created.
// @param {Array.<String>} skip Array of fixtures names which tests should be skipped.
function generateIntegrationTests( title, fixtures, editorConfig, skip ) {
	describe( title, () => {
		let element, editor;

		before( () => {
			element = document.createElement( 'div' );

			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, editorConfig )
				.then( editorInstance => {
					editor = editorInstance;
				} );
		} );

		beforeEach( () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
		} );

		after( () => {
			editor.destroy();

			element.remove();
		} );

		for ( const name of Object.keys( fixtures.input ) ) {
			( skip.indexOf( name ) !== -1 ? it.skip : it )( name, () => {
				expectModel( editor, fixtures.input[ name ], fixtures.model[ name ] );
			} );
		}
	} );
}

// Checks if provided view element instance equals expected HTML. The element is stringified
// before comparing so its entire structure can be compared.
// If the given `actual` or `expected` structure contains base64 encoded images,
// these images are extracted (so HTML diff is readable) and compared
// one by one separately (so it is visible if base64 representation is malformed).
//
// This function is designed for comparing normalized data so expected input is preprocessed before comparing:
//
//		* Tabs on the lines beginnings are removed.
//		* Line breaks and empty lines are removed.
//
// The expected input should be prepared in the above in mind which means every element containing text nodes must start
// and end in the same line. So expected input may be formatted like:
//
// 		<span lang=PL style='mso-ansi-language:PL'>	03<span style='mso-spacerun:yes'>   </span><o:p></o:p></span>
//
// 	but not like:
//
// 		<span lang=PL style='mso-ansi-language:PL'>
// 			03<span style='mso-spacerun:yes'>   </span>
// 			<o:p></o:p>
// 		</span>
//
// 	because tab preceding `03` text will be treated as formatting character and will be removed.
//
// @param {module:engine/view/text~Text|module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
// actual Actual HTML.
// @param {String} expected Expected HTML.
function expectNormalized( actual, expected ) {
	const expectedInlined = inlineData( expected );

	// We are ok with both spaces and non-breaking spaces in the actual content.
	// Replace `&nbsp;` with regular spaces to align with expected content.
	const actualNormalized = stringifyView( actual ).replace( /\u00A0/g, ' ' );
	const expectedNormalized = normalizeHtml( expectedInlined );

	// Extract base64 images so they do not pollute HTML diff and can be compared separately.
	const { data: actualSimplified, images: actualImages } = extractBase64Srcs( actualNormalized );
	const { data: expectedSimplified, images: expectedImages } = extractBase64Srcs( expectedNormalized );

	expect( actualSimplified ).to.equal( expectedSimplified );

	if ( actualImages.length > 0 && expectedImages.length > 0 ) {
		expect( actualImages.length ).to.equal( expectedImages.length );
		expect( actualImages ).to.deep.equal( expectedImages );
	}
}

// Compares two models string representations. The input HTML is processed through paste
// pipeline where it is transformed into model. This function hooks into {@link module:engine/model/model~Model#insertContent}
// to get the model representation before it is inserted.
//
// @param {module:core/editor/editor~Editor} editor Editor instance.
// @param {String} input Input HTML which will be pasted into the editor.
// @param {String} expected Expected model.
function expectModel( editor, input, expected ) {
	const editorModel = editor.model;
	const insertContent = editorModel.insertContent;

	let actual = '';

	sinon.stub( editorModel, 'insertContent' ).callsFake( ( content, selection ) => {
		// Save model string representation now as it may change after `insertContent()` function call
		// so accessing it later may not work as it may have emptied/changed structure.
		actual = stringifyModel( content );
		insertContent.call( editorModel, content, selection );
	} );

	firePasteEvent( editor, input );

	sinon.restore();

	expect( actual ).to.equal( inlineData( expected ) );
}

// Inlines given HTML / model representation string by removing preceding tabs and line breaks.
//
// @param {String} data Data to be inlined.
function inlineData( data ) {
	return data
		// Replace tabs on the lines beginning as normalized input files are formatted.
		.replace( /^\t*</gm, '<' )
		// Replace line breaks (after closing tags) too.
		.replace( /[\r\n]/gm, '' );
}

// Extracts base64 part representing an image from the given HTML / model representation.
//
// @param {String} data Data from which bas64 strings will be extracted.
// @returns {Object} result
// @returns {String} result.data Data without bas64 strings.
// @returns {Array.<String>} result.images Array of extracted base64 strings.
function extractBase64Srcs( data ) {
	const regexp = /src="data:image\/(png|jpe?g);base64,([^"]*)"/gm;
	const images = [];

	let match;
	while ( ( match = regexp.exec( data ) ) !== null ) {
		images.push( match[ 2 ].toLowerCase() );
		data = data.replace( match[ 2 ], '' );
	}

	return { data, images };
}

// Fires paste event on a given editor instance with a specific HTML data.
//
// @param {module:core/editor/editor~Editor} editor Editor instance on which paste event will be fired.
// @param {String} html The HTML data with which paste event will be fired.
function firePasteEvent( editor, html ) {
	editor.editing.view.document.fire( 'paste', {
		dataTransfer: createDataTransfer( { 'text/html': html } ),
		preventDefault() {}
	} );
}
