/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/utils
 */

/**
 * Returns code block languages as defined in `config.codeBlock.languages` but processed to consider
 * the editor localization, i.e. to display {@link module:code-block/codeblock~CodeBlockLanguageDefinition}
 * in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>}.
 */
export function getLocalizedLanguageDefinitions( editor ) {
	const t = editor.t;
	const languagesDefs = editor.config.get( 'codeBlock.languages' );

	for ( const def of languagesDefs ) {
		if ( def.label === 'Plain text' ) {
			def.label = t( 'Plain text' );
			break;
		}
	}

	return languagesDefs;
}

/**
 * For a given model text node, it returns white spaces that precede other characters in that node.
 * This corresponds to the indentation part of the code block line.
 *
 * @param {module:engine/model/text~Text} codeLineNodes
 * @returns {String}
 */
export function getLeadingWhiteSpaces( textNode ) {
	return textNode.data.match( /^(\s*)/ )[ 0 ];
}

/**
 * For a plain text containing the code (snippet), it returns a document fragment containing
 * model text nodes separated by soft breaks (in place of new line characters "\n"), for instance:
 *
 * Input:
 *
 *		"foo()
 *		bar()"
 *
 * Output:
 *
 *		<DocumentFragment>
 *			"foo()"
 *			<softBreak></softBreak>
 *			"bar()"
 *		</DocumentFragment>
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {String} text A raw code text to be converted.
 */
export function rawSnippetTextToModelDocumentFragment( writer, text ) {
	const fragment = writer.createDocumentFragment();
	const textLines = text.split( '\n' ).map( data => writer.createText( data ) );
	const lastLine = textLines[ textLines.length - 1 ];

	for ( const node of textLines ) {
		writer.append( node, fragment );

		if ( node !== lastLine ) {
			writer.appendElement( 'softBreak', fragment );
		}
	}

	return fragment;
}
