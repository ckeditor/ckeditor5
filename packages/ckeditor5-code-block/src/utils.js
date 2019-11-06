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
