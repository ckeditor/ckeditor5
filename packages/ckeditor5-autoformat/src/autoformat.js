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
 * NOTE: Remember to add proper features to the editor configuration. Autoformatting will be enabled only for those
 * commands that are included in the actual configuration. For example: `bold` autoformatting will not work if there is no
 * `bold` command registered in the editor.
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
		this._addBlockQuoteAutoformats();
	}

	/**
	 * Adds autoformatting related to the {@link module:list/list~List}.
	 *
	 * When typed:
	 * - `* ` or `- ` - a paragraph will be changed to a bulleted list,
	 * - `1. ` or `1) ` - a paragraph will be changed to a numbered list ("1" can be any digit or list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		const commands = this.editor.commands;

		if ( commands.has( 'bulletedList' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEngine( this.editor, /^[*-]\s$/, 'bulletedList' );
		}

		if ( commands.has( 'numberedList' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEngine( this.editor, /^\d+[.|)]?\s$/, 'numberedList' );
		}
	}

	/**
	 * Adds autoformatting related to the {@link module:basic-styles/bold~Bold} and
	 * {@link module:basic-styles/italic~Italic}.
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
			/* eslint-disable no-new */
			new InlineAutoformatEngine( this.editor, /(\*\*)([^*]+)(\*\*)$/g, 'bold' );
			new InlineAutoformatEngine( this.editor, /(__)([^_]+)(__)$/g, 'bold' );
			/* eslint-enable no-new */
		}

		if ( commands.has( 'italic' ) ) {
			// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
			// text before the pattern (e.g. `(?:^|[^\*])`).

			/* eslint-disable no-new */
			new InlineAutoformatEngine( this.editor, /(?:^|[^*])(\*)([^*_]+)(\*)$/g, 'italic' );
			new InlineAutoformatEngine( this.editor, /(?:^|[^_])(_)([^_]+)(_)$/g, 'italic' );
			/* eslint-enable no-new */
		}
	}

	/**
	 * Adds autoformatting related to {@link module:heading/heading~Heading}.
	 *
	 * It is using a number at the end of the command name to associate it with the proper trigger:
	 *
	 * * `heading1` will be executed when typing `#`,
	 * * `heading2` will be executed when typing `##`,
	 * * ... up to `heading6` and `######`.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		const commands = this.editor.commands;

		Array.from( commands.keys() )
			.filter( name => name.match( /^heading[1-6]$/ ) )
			.forEach( commandName => {
				const level = commandName[ 7 ];
				const pattern = new RegExp( `^(#{${ level }})\\s$` );

				// eslint-disable-next-line no-new
				new BlockAutoformatEngine( this.editor, pattern, context => {
					const { batch } = context;

					this.editor.execute( commandName, { batch } );
				} );
			} );
	}

	/**
	 * Adds autoformatting related to {@link module:block-quote/blockquote~BlockQuote}.
	 * When typed:
	 * * `> ` - a paragraph will be changed to a block quote.
	 *
	 * @private
	 */
	_addBlockQuoteAutoformats() {
		if ( this.editor.commands.has( 'blockQuote' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEngine( this.editor, /^>\s$/, 'blockQuote' );
		}
	}
}
