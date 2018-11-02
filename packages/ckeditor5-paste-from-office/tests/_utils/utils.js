/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, atob, Blob, URL */

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
 *
 * @param {Boolean} [config.withBlobsHandling = false] If special flow with generating and asserting blob URLs data
 * should be used. This param has effect only for integration tests.
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

	const withBlobsHandling = config.withBlobsHandling || false;
	const groups = groupFixturesByBrowsers( config.browsers, config.input, config.skip );
	const generateSuiteFn = config.type === 'normalization' ? generateNormalizationTests : generateIntegrationTests;

	describe( config.type, () => {
		describe( config.input, () => {
			const editorConfig = config.editorConfig || {};

			for ( const group of Object.keys( groups ) ) {
				const skip = config.skip && config.skip[ group ] ? config.skip[ group ] : [];

				if ( groups[ group ] ) {
					generateSuiteFn( group, groups[ group ], editorConfig, skip, withBlobsHandling );
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
// @param {Boolean} [withBlobsHandling = false] If special `expectModelWithBlobs()` function should be used to assert model data.
function generateIntegrationTests( title, fixtures, editorConfig, skip, withBlobsHandling ) {
	describe( title, () => {
		let element, editor;
		let data = {};

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

			const editorModel = editor.model;
			const insertContent = editorModel.insertContent;

			data = {};

			sinon.stub( editorModel, 'insertContent' ).callsFake( ( content, selection ) => {
				// Save model string representation now as it may change after `insertContent()` function call
				// so accessing it later may not work as it may have emptied/changed structure.
				data.actual = stringifyModel( content );
				insertContent.call( editorModel, content, selection );
			} );
		} );

		afterEach( () => {
			sinon.restore();
		} );

		after( () => {
			editor.destroy();

			element.remove();
		} );

		for ( const name of Object.keys( fixtures.input ) ) {
			if ( !withBlobsHandling ) {
				( skip.indexOf( name ) !== -1 ? it.skip : it )( name, () => {
					data.input = fixtures.input[ name ];
					data.model = fixtures.model[ name ];
					expectModel( data, editor, fixtures.inputRtf && fixtures.inputRtf[ name ] );
				} );
			} else {
				( skip.indexOf( name ) !== -1 ? it.skip : it )( name, done => {
					data.input = fixtures.input[ name ];
					data.model = fixtures.model[ name ];
					expectModelWithBlobs( data, editor, fixtures.inputBlob && fixtures.inputBlob[ name ], done );
				} );
			}
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
// actualView Actual HTML.
// @param {String} expectedHtml Expected HTML.
function expectNormalized( actualView, expectedHtml ) {
	// We are ok with both spaces and non-breaking spaces in the actual content.
	// Replace `&nbsp;` with regular spaces to align with expected content.
	const actualNormalized = stringifyView( actualView ).replace( /\u00A0/g, ' ' );
	const expectedNormalized = normalizeHtml( inlineData( expectedHtml ) );

	compareContentWithBase64Images( actualNormalized, expectedNormalized );
}

// Compares two models string representations. The input HTML is processed through paste
// pipeline where it is transformed into model. This function hooks into {@link module:engine/model/model~Model#insertContent}
// to get the model representation before it is inserted.
//
// @param {Object} data
// @param {String} data.input Input HTML which will be pasted into the editor.
// @param {String} data.actual Actual model data.
// @param {String} data.model Expected model data.
// @param {module:core/editor/editor~Editor} editor Editor instance.
// @param {String} [inputRtf] Additional RTF input data which will be pasted into the editor as `text/rtf` together with regular input data.
function expectModel( data, editor, inputRtf = null ) {
	firePasteEvent( editor, {
		'text/html': data.input,
		'text/rtf': inputRtf
	} );

	compareContentWithBase64Images( data.actual, inlineData( data.model ) );
}

// Compares two models string representations. The input HTML is processed through paste
// pipeline where it is transformed into model. This function hooks into {@link module:engine/model/model~Model#insertContent}
// to get the model representation before it is inserted.
//
// @param {Object} data
// @param {String} data.input Input HTML which will be pasted into the editor.
// @param {String} data.actual Actual model data.
// @param {String} data.model Expected model data.
// @param {module:core/editor/editor~Editor} editor Editor instance.
// @param {String} inputBlobs Additional data which will be used to generate blobs for a test.
// @param {Function} done The callback function which should be called when test has finished.
function expectModelWithBlobs( data, editor, inputBlobs, done ) {
	// If the browser stores images as blob urls, we need to generate blobs based on a provided images base64 data
	// and then replace original blob urls with the local ones. This allows Paste from Office to correctly extract
	// data checking if the transformations flow works in real use cases.
	const base64 = inputBlobs.split( '------' ).map( item => item.replace( /\s/g, '' ) );
	const blobUrls = createBlobsFromBase64Data( base64 );

	const input = replaceBlobUrls( data.input, blobUrls );
	const expected = replaceBlobUrls( inlineData( data.model ), blobUrls );

	let counter = 0;
	const onChange = function() {
		counter++;

		// Each blob is fetched asynchronously generating separate `change` event. Also first content insertion
		// (with blob urls still) generates one `change` event. This means the content is fully transformed when
		// number of change events is number of blob urls in the content + 1.
		if ( counter > blobUrls.length ) {
			editor.editing.model.document.off( 'change', onChange );
			counter = 0;

			const expectedData = replaceBlobUrls( expected, base64 );
			const actualData = replaceBlobUrls( data.actual, base64 );

			try {
				compareContentWithBase64Images( actualData, expectedData );
				done();
			} catch ( err ) {
				done( err );
			}
		}
	};

	editor.editing.model.document.on( 'change', onChange );

	firePasteEvent( editor, {
		'text/html': input
	} );

	// In some rare cases there might be `&nbsp;` in a model data
	// (see https://github.com/ckeditor/ckeditor5-paste-from-office/issues/27).
	data.actual = data.actual.replace( /\u00A0/g, ' ' );

	// Check if initial data with blob urls is correct.
	expect( data.actual ).to.equal( expected );
}

// Compares actual and expected content. Before comparison the base64 images data is extracted so data diff is more readable.
// If there were any images extracted their base64 data is also compared.
//
// @param {String} actual Actual content.
// @param {String} expected Expected content.
function compareContentWithBase64Images( actual, expected ) {
	// Extract base64 images so they do not pollute model diff and can be compared separately.
	const { data: actualModel, images: actualImages } = extractBase64Srcs( actual );
	const { data: expectedModel, images: expectedImages } = extractBase64Srcs( expected );

	expect( actualModel ).to.equal( expectedModel );

	if ( actualImages.length > 0 && expectedImages.length > 0 ) {
		expect( actualImages.length ).to.equal( expectedImages.length );
		expect( actualImages ).to.deep.equal( expectedImages );
	}
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
	const replacements = [];

	let match;
	while ( ( match = regexp.exec( data ) ) !== null ) {
		images.push( match[ 2 ].toLowerCase() );
		replacements.push( match[ 2 ] );
	}

	for ( const replacement of replacements ) {
		data = data.replace( replacement, '' );
	}

	return { data, images };
}

// Fires paste event on a given editor instance with a specific HTML data.
//
// @param {module:core/editor/editor~Editor} editor Editor instance on which paste event will be fired.
// @param {Object} data Object with `type: content` pairs used as data transfer data in the fired paste event.
function firePasteEvent( editor, data ) {
	editor.editing.view.document.fire( 'paste', {
		dataTransfer: createDataTransfer( data ),
		preventDefault() {}
	} );
}

// Replaces all blob urls (`blob:`) in the given HTML with given replacements data.
//
// @param {String} html The HTML data in which blob urls will be replaced.
// @param {Array.<String>} replacements Array of string which will replace found blobs in the order of occurrence.
// @returns {String} The HTML data with all blob urls replaced.
function replaceBlobUrls( html, replacements ) {
	const blobRegexp = /src="(blob:[^"]*)"/g;
	const toReplace = [];

	let match;
	while ( ( match = blobRegexp.exec( html ) ) !== null ) {
		toReplace.push( match[ 1 ] );
	}

	for ( let i = 0; i < toReplace.length; i++ ) {
		if ( replacements[ i ] ) {
			html = html.replace( toReplace[ i ], replacements[ i ] );
		}
	}

	return html;
}

// Creates blob urls from the given base64 data.
//
// @param {Array.<String>} base64Data Array of base64 strings from which blob urls will be generated.
// @returns {Array} Array of generated blob urls.
function createBlobsFromBase64Data( base64Data ) {
	const blobUrls = [];

	for ( const data of base64Data ) {
		blobUrls.push( URL.createObjectURL( base64toBlob( data.trim() ) ) );
	}

	return blobUrls;
}

// Transforms base64 data into a blob object.
//
// @param {String} The base64 data to be transformed.
// @returns {Blob} Blob object representing given base64 data.
function base64toBlob( base64Data ) {
	const [ type, data ] = base64Data.split( ',' );
	const byteCharacters = atob( data );
	const byteArrays = [];

	for ( let offset = 0; offset < byteCharacters.length; offset += 512 ) {
		const slice = byteCharacters.slice( offset, offset + 512 );
		const byteNumbers = new Array( slice.length );

		for ( let i = 0; i < slice.length; i++ ) {
			byteNumbers[ i ] = slice.charCodeAt( i );
		}

		byteArrays.push( new Uint8Array( byteNumbers ) );
	}

	return new Blob( byteArrays, { type } );
}
