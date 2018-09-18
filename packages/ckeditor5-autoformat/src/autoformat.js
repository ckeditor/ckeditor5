/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autoformat/autoformat
 */

import BlockAutoformatEditing from './blockautoformatediting';
import InlineAutoformatEditing from './inlineautoformatediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * Enables a set of predefined autoformatting actions.
 *
 * For a detailed overview, check the {@glink features/autoformat Autoformatting feature documentation}
 * and the {@glink api/autoformat package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Autoformat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Autoformat';
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
	 * - `* ` or `- ` &ndash; A paragraph will be changed to a bulleted list.
	 * - `1. ` or `1) ` &ndash; A paragraph will be changed to a numbered list ("1" can be any digit or a list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		const commands = this.editor.commands;

		if ( commands.get( 'bulletedList' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEditing( this.editor, /^[*-]\s$/, 'bulletedList' );
		}

		if ( commands.get( 'numberedList' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEditing( this.editor, /^\d+[.|)]\s$/, 'numberedList' );
		}
	}

	/**
	 * Adds autoformatting related to the {@link module:basic-styles/bold~Bold},
	 * {@link module:basic-styles/italic~Italic} and {@link module:basic-styles/code~Code}.
	 *
	 * When typed:
	 * - `**foobar**` &ndash; `**` characters are removed and `foobar` is set to bold,
	 * - `__foobar__` &ndash; `__` characters are removed and `foobar` is set to bold,
	 * - `*foobar*` &ndash; `*` characters are removed and `foobar` is set to italic,
	 * - `_foobar_` &ndash; `_` characters are removed and `foobar` is set to italic,
	 * - ``` `foobar` &ndash; ``` ` ``` characters are removed and `foobar` is set to code.
	 *
	 * @private
	 */
	_addBasicStylesAutoformats() {
		const commands = this.editor.commands;

		if ( commands.get( 'bold' ) ) {
			/* eslint-disable no-new */
			new InlineAutoformatEditing( this.editor, /(\*\*)([^*]+)(\*\*)$/g, 'bold' );
			new InlineAutoformatEditing( this.editor, /(__)([^_]+)(__)$/g, 'bold' );
			/* eslint-enable no-new */
		}

		if ( commands.get( 'italic' ) ) {
			// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
			// text before the pattern (e.g. `(?:^|[^\*])`).

			/* eslint-disable no-new */
			new InlineAutoformatEditing( this.editor, /(?:^|[^*])(\*)([^*_]+)(\*)$/g, 'italic' );
			new InlineAutoformatEditing( this.editor, /(?:^|[^_])(_)([^_]+)(_)$/g, 'italic' );
			/* eslint-enable no-new */
		}

		if ( commands.get( 'code' ) ) {
			/* eslint-disable no-new */
			new InlineAutoformatEditing( this.editor, /(`)([^`]+)(`)$/g, 'code' );
			/* eslint-enable no-new */
		}
	}

	/**
	 * Adds autoformatting related to {@link module:heading/heading~Heading}.
	 *
	 * It is using a number at the end of the command name to associate it with the proper trigger:
	 *
	 * * `heading` with value `heading1` will be executed when typing `#`,
	 * * `heading` with value `heading2` will be executed when typing `##`,
	 * * ... up to `heading6` and `######`.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		const command = this.editor.commands.get( 'heading' );

		if ( command ) {
			command.modelElements
				.filter( name => name.match( /^heading[1-6]$/ ) )
				.forEach( commandValue => {
					const level = commandValue[ 7 ];
					const pattern = new RegExp( `^(#{${ level }})\\s$` );

					// eslint-disable-next-line no-new
					new BlockAutoformatEditing( this.editor, pattern, () => {
						this.editor.execute( 'heading', { value: commandValue } );
					} );
				} );
		}
	}

	/**
	 * Adds autoformatting related to {@link module:block-quote/blockquote~BlockQuote}.
	 *
	 * When typed:
	 * * `> ` &ndash; A paragraph will be changed to a block quote.
	 *
	 * @private
	 */
	_addBlockQuoteAutoformats() {
		if ( this.editor.commands.get( 'blockQuote' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEditing( this.editor, /^>\s$/, 'blockQuote' );
		}
	}
}
