/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
		this._addCodeBlockAutoformats();
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
			new BlockAutoformatEditing( this.editor, this, /^[*-]\s$/, 'bulletedList' );
		}

		if ( commands.get( 'numberedList' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEditing( this.editor, this, /^1[.|)]\s$/, 'numberedList' );
		}
	}

	/**
	 * Adds autoformatting related to the {@link module:basic-styles/bold~Bold},
	 * {@link module:basic-styles/italic~Italic}, {@link module:basic-styles/code~Code}
	 * and {@link module:basic-styles/strikethrough~Strikethrough}
	 *
	 * When typed:
	 * - `**foobar**` &ndash; `**` characters are removed and `foobar` is set to bold,
	 * - `__foobar__` &ndash; `__` characters are removed and `foobar` is set to bold,
	 * - `*foobar*` &ndash; `*` characters are removed and `foobar` is set to italic,
	 * - `_foobar_` &ndash; `_` characters are removed and `foobar` is set to italic,
	 * - ``` `foobar` &ndash; ``` ` ``` characters are removed and `foobar` is set to code,
	 * - `~~foobar~~` &ndash; `~~` characters are removed and `foobar` is set to strikethrough.
	 *
	 * @private
	 */
	_addBasicStylesAutoformats() {
		const commands = this.editor.commands;

		if ( commands.get( 'bold' ) ) {
			/* eslint-disable no-new */
			const boldCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'bold' );

			new InlineAutoformatEditing( this.editor, this, /(\*\*)([^*]+)(\*\*)$/g, boldCallback );
			new InlineAutoformatEditing( this.editor, this, /(__)([^_]+)(__)$/g, boldCallback );
			/* eslint-enable no-new */
		}

		if ( commands.get( 'italic' ) ) {
			/* eslint-disable no-new */
			const italicCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'italic' );

			// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
			// text before the pattern (e.g. `(?:^|[^\*])`).
			new InlineAutoformatEditing( this.editor, this, /(?:^|[^*])(\*)([^*_]+)(\*)$/g, italicCallback );
			new InlineAutoformatEditing( this.editor, this, /(?:^|[^_])(_)([^_]+)(_)$/g, italicCallback );
			/* eslint-enable no-new */
		}

		if ( commands.get( 'code' ) ) {
			/* eslint-disable no-new */
			const codeCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'code' );

			new InlineAutoformatEditing( this.editor, this, /(`)([^`]+)(`)$/g, codeCallback );
			/* eslint-enable no-new */
		}

		if ( commands.get( 'strikethrough' ) ) {
			/* eslint-disable no-new */
			const strikethroughCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'strikethrough' );

			new InlineAutoformatEditing( this.editor, this, /(~~)([^~]+)(~~)$/g, strikethroughCallback );
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
					new BlockAutoformatEditing( this.editor, this, pattern, () => {
						if ( !command.isEnabled ) {
							return false;
						}

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
			new BlockAutoformatEditing( this.editor, this, /^>\s$/, 'blockQuote' );
		}
	}

	/**
	 * Adds autoformatting related to {@link module:code-block/codeblock~CodeBlock}.
	 *
	 * When typed:
	 * - `` ``` `` &ndash; A paragraph will be changed to a code block.
	 *
	 * @private
	 */
	_addCodeBlockAutoformats() {
		if ( this.editor.commands.get( 'codeBlock' ) ) {
			// eslint-disable-next-line no-new
			new BlockAutoformatEditing( this.editor, this, /^```$/, 'codeBlock' );
		}
	}
}

// Helper function for getting `InlineAutoformatEditing` callbacks that checks if command is enabled.
//
// @param {module:core/editor/editor~Editor} editor
// @param {String} attributeKey
// @returns {Function}
function getCallbackFunctionForInlineAutoformat( editor, attributeKey ) {
	return ( writer, rangesToFormat ) => {
		const command = editor.commands.get( attributeKey );

		if ( !command.isEnabled ) {
			return false;
		}

		const validRanges = editor.model.schema.getValidRanges( rangesToFormat, attributeKey );

		for ( const range of validRanges ) {
			writer.setAttribute( attributeKey, true, range );
		}

		// After applying attribute to the text, remove given attribute from the selection.
		// This way user is able to type a text without attribute used by auto formatter.
		writer.removeSelectionAttribute( attributeKey );
	};
}
