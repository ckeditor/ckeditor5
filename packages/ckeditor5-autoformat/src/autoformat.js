/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autoformat/autoformat
 */

import BlockAutoformatEngine from './blockautoformatengine';
import InlineAutoformatEngine from './inlineautoformatengine';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * Includes a set of predefined autoformatting actions.
 *
 * ## Bulleted list
 *
 * You can create a bulleted list by staring a line with:
 *
 * * `* `
 * * `- `
 *
 * ## Numbered list
 *
 * You can create a numbered list by staring a line with:
 *
 * * `1. `
 * * `1) `
 *
 * ## Headings
 *
 * You can create a heading by starting a line with:
 *
 * `# ` – will create Heading 1,
 * `## ` – will create Heading 2,
 * `### ` – will create Heading 3.
 *
 * ## Bold and italic
 *
 * You can apply bold or italic to a text by typing Markdown formatting:
 *
 * * `**foo bar**` or `__foo bar__` – will bold the text,
 * * `*foo bar*` or `_foo bar_` – will italicize the text,
 *
 * NOTE: Remember to add proper features to editor configuration. Autoformatting will be enabled only for those
 * commands that are included in current configuration. For example: `bold` autoformatting will not work if there is no
 * `bold` command registered in editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Autoformat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'autoformat/autoformat';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		this._addListAutoformats();
		this._addBasicStylesAutoformats();
		this._addHeadingAutoformats();
	}

	/**
	 * Adds autoformatting related to `bulletedList` and `numberedList` commands.
	 *
	 * When typed:
	 * - `* ` or `- ` - paragraph will be changed to a bulleted list,
	 * - `1. ` or `1) ` - paragraph will be changed to a numbered list (1 can be any digit or list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		const commands = this.editor.commands;

		if ( commands.has( 'bulletedList' ) ) {
			new BlockAutoformatEngine( this.editor, /^[\*\-]\s$/, 'bulletedList' );
		}

		if ( commands.has( 'numberedList' ) ) {
			new BlockAutoformatEngine( this.editor, /^\d+[\.|)]?\s$/, 'numberedList' );
		}
	}

	/**
	 *Adds autoformatting related to `bold` and `italic` commands.
	 *
	 * When typed:
	 * - `**foobar**`: `**` characters are removed, and `foobar` is set to bold,
	 * - `__foobar__`: `__` characters are removed, and `foobar` is set to bold,
	 * - `*foobar*`: `*` characters are removed, and `foobar` is set to italic,
	 * - `_foobar_`: `_` characters are removed, and `foobar` is set to italic.
	 *
	 * @private
	 */
	_addBasicStylesAutoformats() {
		const commands = this.editor.commands;

		if ( commands.has( 'bold' ) ) {
			new InlineAutoformatEngine( this.editor, /(\*\*)([^\*]+)(\*\*)$/g, 'bold' );
			new InlineAutoformatEngine( this.editor, /(__)([^_]+)(__)$/g, 'bold' );
		}

		if ( commands.has( 'italic' ) ) {
			// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
			// text before the pattern (e.g. `(?:^|[^\*])`).
			new InlineAutoformatEngine( this.editor, /(?:^|[^\*])(\*)([^\*_]+)(\*)$/g, 'italic' );
			new InlineAutoformatEngine( this.editor, /(?:^|[^_])(_)([^_]+)(_)$/g, 'italic' );
		}
	}

	/**
	 * Adds autoformatting related to heading commands.
	 * It is using number at the end of the command name to associate it with proper trigger:
	 * * `heading1` will be executed when typing `#`,
	 * * `heading2` will be executed when typing `##`,
	 * * `heading3` will be executed when typing `###`.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		const commands = this.editor.commands;
		const options = this.editor.config.get( 'heading.options' );

		if ( options ) {
			for ( let option of options ) {
				const commandName = option.modelElement;
				let match;

				if ( commands.has( commandName ) && ( match = commandName.match( /\d+$/ ) ) ) {
					const level = match[ 0 ];
					const regExp = new RegExp( `^(#{${ level }})\\s$` );

					new BlockAutoformatEngine( this.editor, regExp, ( context ) => {
						const { batch } = context;

						this.editor.execute( commandName, { batch } );
					} );
				}
			}
		}
	}
}
