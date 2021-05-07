/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const chalk = require( 'chalk' );

const DESTINATION_DOCS_PATH = 'docs/builds/guides/integration/features-overview.md';
const PACKAGE_METADATA_RELATIVE_PATHS = [ 'packages', 'external/*/packages', 'scripts/docs/features-overview/3rd-party-packages' ];
const PACKAGE_METADATA_GLOB_PATTERN = `{${ PACKAGE_METADATA_RELATIVE_PATHS.join( ',' ) }}/*/ckeditor5-metadata.json`;

try {
	const numberOfParsedFiles = parseMetadataFiles();

	console.log( `✨ ${ chalk.green( `Content from ${ numberOfParsedFiles } package metadata files has been generated successfully.` ) }` );
} catch ( error ) {
	console.log( `❌ ${ chalk.red( 'An error occurred during parsing a package metadata file.' ) }` );
	console.log( error );
}

/**
 * Main parser function. Its purpose is to:
 * - read all package metadata files,
 * - parse and prepare the data for generating the features' output,
 * - use the parsed data to create a table containing all packages, plugins and their possible HTML output.
 * Returns total number of parsed files.
 *
 * The output table contains 3 columns: "Package", "Plugin" and "HTML output". The "Package" column contains all package names, for which
 * the package metadata file was found. Each table cell in the "Plugin" column has a human-readable name of the plugin (which is a link to
 * the feature documentation) and the name of the class used to create the plugin (which is a link to the API documentation). For each row
 * in the "Plugin" column there is at least one row in the "HTML output" column. If given plugin does not generate any output, the one and
 * only row in the "HTML output" column contains the word "None". Each item from the `htmlOutput` property from the package metadata file
 * corresponds to a separate row in the "HTML output" column. It contains one or more paragraphs with text describing the possible output:
 * HTML elements, their CSS classes, inline styles, other attributes and comments.
 *
 * ┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     Package     ┃    Plugin    ┃           HTML output          ┃
 * ┣━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
 * ┃    package A    │ first plugin │ output #1 for the first plugin ┃
 * ┃                 │              ├────────────────────────────────┨
 * ┃                 │              ┄                                ┄
 * ┃                 │              ├────────────────────────────────┨
 * ┃                 │              │ output #N for the first plugin ┃
 * ┃                 ├──────────────┼────────────────────────────────┨
 * ┃                 ┄              ┄                                ┄
 * ┃                 ├──────────────┼────────────────────────────────┨
 * ┃                 │ last plugin  │ output #1 for the last plugin  ┃
 * ┃                 │              ├────────────────────────────────┨
 * ┃                 │              ┄                                ┄
 * ┃                 │              ├────────────────────────────────┨
 * ┃                 │              │ output #N for the last plugin  ┃
 * ┠─────────────────┼──────────────┼────────────────────────────────┨
 * ┃    package B    │   plugins    │       outputs per plugin       ┃
 * ┄                 ┄              ┄                                ┄
 * ┠─────────────────┼──────────────┼────────────────────────────────┨
 * ┃    package C    │   plugins    │       outputs per plugin       ┃
 * ┄                 ┄              ┄                                ┄
 * ┗━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 *
 * @returns {Number}
 */
function parseMetadataFiles() {
	const parsedFiles = parseFiles()
		.map( packageMetadata => {
			const numberOfRowsPerPackage = packageMetadata.plugins
				.reduce( ( result, plugin ) => result + plugin.htmlOutput.length, 0 );

			const packageNameRowspan = numberOfRowsPerPackage > 1 ?
				`rowspan="${ numberOfRowsPerPackage }"` :
				'';

			return packageMetadata.plugins
				.map( ( plugin, pluginIndex ) => {
					const numberOfRowsPerPlugin = plugin.htmlOutput.length;

					const pluginNameRowspan = numberOfRowsPerPlugin > 1 ?
						`rowspan="${ numberOfRowsPerPlugin }"` :
						'';

					return plugin.htmlOutput
						.map( ( htmlOutput, htmlOutputIndex ) => {
							const packageNameCell = pluginIndex === 0 && htmlOutputIndex === 0 ?
								`<td ${ packageNameRowspan }><code>${ packageMetadata.packageName }</code></td>` :
								'';

							const pluginNameCell = htmlOutputIndex === 0 ?
								`<td ${ pluginNameRowspan }>${ plugin.name }</td>` :
								'';

							return `<tr>${ packageNameCell }${ pluginNameCell }<td>${ htmlOutput }</td></tr>`;
						} )
						.join( '' );
				} )
				.join( '' );
		} );

	const generatedOutput = parsedFiles.join( '' );

	saveGeneratedOutput( generatedOutput );

	return parsedFiles.length;
}

/**
 * Reads and parses all package metadata files, that match the `glob` pattern. The returned array is sorted alphabetically by package name.
 *
 * @returns {Array.<ParsedFile>}
 */
function parseFiles() {
	return glob.sync( PACKAGE_METADATA_GLOB_PATTERN )
		.map( readFile )
		.map( file => {
			try {
				return parseFile( file );
			} catch ( error ) {
				error.message = `Failed to parse ${ chalk.bold( file.path ) }\n${ error.message }`;

				throw error;
			}
		} )
		.sort( ( parsedFileA, parsedFileB ) => parsedFileA.packageName.localeCompare( parsedFileB.packageName ) );
}

/**
 * Reads the package metadata file.
 *
 * @param {String} path File path relative to CWD.
 * @returns {File}
 */
function readFile( path ) {
	return {
		path,
		content: fs.readFileSync( path, 'utf-8' )
	};
}

/**
 * Parses the package metadata file.
 *
 * @param {File} file Contains file path and its content to parse.
 * @returns {ParsedFile}
 */
function parseFile( file ) {
	const metadata = JSON.parse( file.content );

	const packageName = path.basename( path.dirname( file.path ) );

	const isExternalPackage = file.path.startsWith( 'external/' );

	const is3rdPartyPackage = file.path.startsWith( 'scripts/docs/features-overview/3rd-party-packages/' );

	const packageData = {
		name: packageName,
		isExternal: isExternalPackage,
		is3rdParty: is3rdPartyPackage
	};

	const plugins = preparePlugins( packageData, metadata.plugins );

	return {
		packageName,
		plugins
	};
}

/**
 * Parses all plugins from package metadata file.
 *
 * @param {Package} packageData Package properties.
 * @param {Array.<Plugin>} plugins Plugins to parse.
 * @returns {Array.<ParsedPlugin>}
 */
function preparePlugins( packageData, plugins = [] ) {
	return plugins
		.map( plugin => {
			const pluginName = prepareFeatureLink( packageData, plugin );

			const pluginClassName = prepareApiLink( packageData, plugin );

			const htmlOutput = plugin.htmlOutput ?
				prepareHtmlOutput( plugin.htmlOutput ) :
				[ '<p>None.</p>' ];

			return {
				name: `<p>${ pluginName }</p><p>${ pluginClassName }</p>`,
				htmlOutput
			};
		} );
}

/**
 * Creates link to the plugin's feature documentation. If the feature documentation is missing, just the plugin name is returned.
 *
 * @param {Package} packageData Package properties.
 * @param {Plugin} plugin Plugin definition.
 * @returns {String}
 */
function prepareFeatureLink( packageData, plugin ) {
	if ( !plugin.docs ) {
		return plugin.name;
	}

	const link = /http(s)?:/.test( plugin.docs ) ?
		plugin.docs :
		`../../../${ plugin.docs }`;

	const skipLinkValidation = packageData.isExternal ? 'data-skip-validation' : '';

	return `<a href="${ link }" ${ skipLinkValidation }>${ plugin.name }</a>`;
}

/**
 * Creates link to the plugin's API documentation. If given plugin is a 3rd party one, just the plugin class name is returned.
 *
 * @param {Package} packageData Package properties.
 * @param {Plugin} plugin Plugin definition.
 * @returns {String}
 */
function prepareApiLink( packageData, plugin ) {
	const pluginClassName = `<code>${ plugin.className }</code>`;

	if ( packageData.is3rdParty ) {
		return pluginClassName;
	}

	const shortPackageName = packageData.name.replace( /^ckeditor5-/g, '' );

	const packagePath = plugin.path
		.replace( /(^src\/)|(\.js$)/g, '' )
		.replace( /\//g, '_' );

	const link = `../../../api/module_${ shortPackageName }_${ packagePath }-${ plugin.className }.html`;

	const skipLinkValidation = packageData.isExternal ? 'data-skip-validation' : '';

	return `<a href="${ link }" ${ skipLinkValidation }>${ pluginClassName }</a>`;
}

/**
 * Prepares the HTML output to a format, that is ready to be displayed. The generated array of strings contains paragraphs with applied
 * visual formatting (i.e. <strong> or <code> tags).
 *
 * @param {HtmlOutput} htmlOutput
 * @returns {Array.<String>}
 */
function prepareHtmlOutput( htmlOutput ) {
	return htmlOutput
		.map( entry => {
			const elements = entry.elements ?
				`<p>${
					toArray( entry.elements )
						.map( wrapBy( { prefix: '<strong>', suffix: '</strong>' } ) )
						.map( wrapBy( { prefix: '&lt;', suffix: '&gt;' } ) )
						.map( wrapBy( { prefix: '<code>', suffix: '</code>' } ) )
						.join( ', ' )
				}</p>` :
				'';

			const classes = entry.classes ?
				`<p><code>&lt;… <strong>class</strong>="${
					toArray( entry.classes )
						.join( ' ' )
				}"&gt;</code></p>` :
				'';

			const styles = entry.styles ?
				`<p><code>&lt;… <strong>style</strong>="${
					toArray( entry.styles )
						.map( wrapBy( { suffix: ':*' } ) )
						.join( '; ' )
				}"&gt;</code></p>` :
				'';

			const attributes = entry.attributes ?
				`<p><code>&lt;… ${
					toArray( entry.attributes )
						.map( wrapBy( { prefix: '<strong>', suffix: '</strong>' } ) )
						.map( wrapBy( { suffix: '="*"' } ) )
						.join( ' ' )
				}&gt;</code></p>` :
				'';

			const others = entry.implements ?
				`<p>HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the ${
					toArray( entry.implements )
						.map( wrapBy( { prefix: '&lt;', suffix: '&gt;' } ) )
						.map( wrapBy( { prefix: '<code>', suffix: '</code>' } ) )
						.join( ', ' )
				} element.</p>` :
				'';

			const comment = entry._comment ?
				`<p>${
					entry._comment
						.replace( '<', '&lt;' )
						.replace( '>', '&gt;' )
						.replace( /`(.*?)`/g, '<code>$1</code>' )
						.replace( /\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>' )
				}</p>` :
				'';

			return [ elements, classes, styles, attributes, others, comment ]
				.filter( item => !!item )
				.join( '' );
		} );
}

/**
 * Saves generated output in the destination file.
 *
 * @param {String} output Generated output to be saved in the destination file.
 */
function saveGeneratedOutput( output ) {
	output =
		'<table class="features-overview">' +
			'<thead>' +
				'<tr>' +
					'<th>Package</th>' +
					'<th>Plugin</th>' +
					'<th>HTML output</th>' +
				'</tr>' +
			'</thead>' +
			'<tbody>' +
				output +
			'</tbody>' +
		'</table>';

	output = beautify( output );

	output = fs
		.readFileSync( DESTINATION_DOCS_PATH, 'utf-8' )
		.replace( /(<!-- features-overview-output-marker -->)[\s\S]*/, `$1${ output }` );

	fs.writeFileSync( DESTINATION_DOCS_PATH, output );
}

/**
 * Beautifies the input HTML string by adding new lines and then indenting some HTML elements. It does not validate the input HTML string,
 * so if it is invalid (i.e. has missing closing tags) then probably this function will fail.
 *
 * @param {String} input String containing HTML elements to beutify.
 * @returns {String}
 */
function beautify( input ) {
	const lines = input
		// Add new line before `<tag>` or `</tag>`, but only if it is not already preceded by a new line (negative lookbehind).
		.replace( /(?<!\n)<(\/)?(table|thead|tbody|tr|th|td|p)(.*?)>/g, '\n<$1$2$3>' )
		// Add new line after `<tag>` or `</tag>`, but only if it is not already followed by a new line (negative lookahead).
		.replace( /<(\/)?(table|thead|tbody|tr|th|td|p)(.*?)>(?!\n)/g, '<$1$2$3>\n' )
		// Remove whitespace before `>`, that may appear there after adding an empty attribute.
		.replace( /\s+>/g, '>' )
		// Divide input string into lines, which start with either an opening tag, a closing tag, or just a text.
		.split( '\n' );

	let indentCount = 0;

	return lines
		.map( ( line, index ) => {
			if ( isOpeningTag( line ) && hasClosingTagFor( line, lines.slice( index ) ) ) {
				return indentLine( line, indentCount++ );
			}

			if ( isClosingTag( line ) ) {
				return indentLine( line, --indentCount );
			}

			return indentLine( line, indentCount );
		} )
		.join( '\n' );
}

/**
 * Checks, if an argument is an opening tag.
 *
 * @param {String} line String to check.
 * @returns {Boolean}
 */
function isOpeningTag( line ) {
	return line.startsWith( '<' ) && !isClosingTag( line );
}

/**
 * Checks, if an argument is a closing tag.
 *
 * @param {String} line String to check.
 * @returns {Boolean}
 */
function isClosingTag( line ) {
	return line.startsWith( '</' );
}

/**
 * Checks, if there is a closing tag for currently examined opening tag.
 *
 * @param {String} tag Currently examined opening tag.
 * @param {Array.<String>} lines Next lines to search for a closing tag.
 * @returns {Boolean}
 */
function hasClosingTagFor( tag, lines ) {
	const closingTag = tag.replace( /<([a-z]+).*>/, '</$1>' );

	return lines.some( line => line === closingTag );
}

/**
 * Indents a line by a specified number of characters.
 *
 * @param {String} line Line to indent.
 * @param {Number} indentCount Number of characters to use for indentation.
 * @param {String} [indentChar] Indentation character.
 * @returns {String}
 */
function indentLine( line, indentCount, indentChar = '\t' ) {
	return `${ indentChar.repeat( indentCount ) }${ line }`;
}

/**
 * Helper, which transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @param {*} data The value to transform to an array.
 * @returns {Array.<*>} An array created from data.
 */
function toArray( data ) {
	return Array.isArray( data ) ? data : [ data ];
}

/**
 * Helper (factory), which creates a function, that prepends and/or appends provided value by another value.
 *
 * @param {Object} options Options to define prefix and/or suffix.
 * @param {String} [options.prefix] A string to add as a prefix to provided value. Empty string by default.
 * @param {String} [options.suffix] A string to add as a suffix to provided value. Empty string by default.
 * @returns {Function}
 */
function wrapBy( { prefix = '', suffix = '' } = {} ) {
	return item => `${ prefix }${ item }${ suffix }`;
}

/**
 * @typedef {Object} HtmlOutput
 * @property {String|Array.<String>} elements HTML elements, that are created or altered by the plugin.
 * @property {String|Array.<String>} classes CSS class names, that may be applied to the HTML elements.
 * @property {String|Array.<String>} styles Inline CSS styles, that may be applied to the HTML elements.
 * @property {String|Array.<String>} attributes Other HTML attributes, that may be applied to the HTML elements.
 * @property {String} implements A name of an element or a pseudo-element, which classes, styles or attributes may be inherited from.
 * @property {String} _comment A human-readable description.
 */

/**
 * @typedef {Object} Plugin
 * @property {String} name Plugin name.
 * @property {String} className Plugin class name.
 * @property {String} docs An absolute or relative URL to the plugin's documentation.
 * @property {String} path A path to the file, relative to the metadata file, that exports the plugin.
 * @property {HtmlOutput} htmlOutput An array of objects, that defines all possible HTML elements which can be created by a given plugin.
 */

/**
 * @typedef {Object} ParsedPlugin
 * @property {String} name Plugin name.
 * @property {Array.<String>} htmlOutput Each item in this array contains a separate output definition. This output definition is a string
 * with all elements, classes, styles, attributes and comment combined together with applied visual formatting (i.e. working links, visual
 * emphasis, etc.) and ready to be displayed.
 */

/**
 * @typedef {Object} Package
 * @property {String} name Package name.
 * @property {String} isExternal Determines, if a given package is considered as external one in the context of the CKEditor 5. If package
 * is not created by CKSource, then isExternal = false. Otherwise, it informs if it belongs to a CKEditor 5 repo (isExternal = false), or if
 * it comes from an external folder: from Collaboration Features or Internal (isExternal = true).
 * @property {String} is3rdParty Determines whether a given package has been created outside CKSource. A 3rd party package is not considered
 * as external one.
 */

/**
 * @typedef {Object} File
 * @property {String} path File path relative to CWD.
 * @property {String} content File content.
 */

/**
 * @typedef {Object} ParsedFile
 * @property {String} packageName Package name.
 * @property {Array.<ParsedPlugin>} plugins An array of all parsed plugins.
 */
