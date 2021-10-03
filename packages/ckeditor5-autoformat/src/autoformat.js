/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module autoformat/autoformat
 */

import { Plugin } from 'ckeditor5/src/core';
import { Delete } from 'ckeditor5/src/typing';

import blockAutoformatEditing from './blockautoformatediting';
import inlineAutoformatEditing from './inlineautoformatediting';

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
	 * @inheritdoc
	 */
	static get requires() {
		return [ Delete ];
	}

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
		this._addHorizontalLineAutoformats();
	}

	/**
	 * Adds autoformatting related to the {@link module:list/list~List}.
	 *
	 * When typed:
	 * - `* ` or `- ` &ndash; A paragraph will be changed to a bulleted list.
	 * - `1. ` or `1) ` &ndash; A paragraph will be changed to a numbered list ("1" can be any digit or a list of digits).
	 * - `[] ` or `[ ] ` &ndash; A paragraph will be changed to a to-do list.
	 * - `[x] ` or `[ x ] ` &ndash; A paragraph will be changed to a checked to-do list.
	 *
	 * @private
	 */
	_addListAutoformats() {
		const commands = this.editor.commands;

		if ( commands.get( 'bulletedList' ) ) {
			blockAutoformatEditing( this.editor, this, /^[*-]\s$/, 'bulletedList' );
		}

		if ( commands.get( 'numberedList' ) ) {
			blockAutoformatEditing( this.editor, this, /^1[.|)]\s$/, 'numberedList' );
		}

		if ( commands.get( 'todoList' ) ) {
			blockAutoformatEditing( this.editor, this, /^\[\s?\]\s$/, 'todoList' );
		}

		if ( commands.get( 'checkTodoList' ) ) {
			blockAutoformatEditing( this.editor, this, /^\[\s?x\s?\]\s$/, () => {
				this.editor.execute( 'todoList' );
				this.editor.execute( 'checkTodoList' );
			} );
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
			const boldCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'bold' );

			inlineAutoformatEditing( this.editor, this, /(?:^|\s)(\*\*)([^*]+)(\*\*)$/g, boldCallback );
			inlineAutoformatEditing( this.editor, this, /(?:^|\s)(__)([^_]+)(__)$/g, boldCallback );
		}

		if ( commands.get( 'italic' ) ) {
			const italicCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'italic' );

			// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
			// text before the pattern (e.g. `(?:^|[^\*])`).
			inlineAutoformatEditing( this.editor, this, /(?:^|\s)(\*)([^*_]+)(\*)$/g, italicCallback );
			inlineAutoformatEditing( this.editor, this, /(?:^|\s)(_)([^_]+)(_)$/g, italicCallback );
		}

		if ( commands.get( 'code' ) ) {
			const codeCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'code' );

			inlineAutoformatEditing( this.editor, this, /(`)([^`]+)(`)$/g, codeCallback );
		}

		if ( commands.get( 'strikethrough' ) ) {
			const strikethroughCallback = getCallbackFunctionForInlineAutoformat( this.editor, 'strikethrough' );

			inlineAutoformatEditing( this.editor, this, /(~~)([^~]+)(~~)$/g, strikethroughCallback );
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
				.forEach( modelName => {
					const level = modelName[ 7 ];
					const pattern = new RegExp( `^(#{${ level }})\\s$` );

					blockAutoformatEditing( this.editor, this, pattern, () => {
						// Should only be active if command is enabled and heading style associated with pattern is inactive.
						if ( !command.isEnabled || command.value === modelName ) {
							return false;
						}

						this.editor.execute( 'heading', { value: modelName } );
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
			blockAutoformatEditing( this.editor, this, /^>\s$/, 'blockQuote' );
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
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( editor.commands.get( 'codeBlock' ) ) {
			blockAutoformatEditing( editor, this, /^```$/, () => {
				if ( selection.getFirstPosition().parent.is( 'element', 'listItem' ) ) {
					return false;
				}
				this.editor.execute( 'codeBlock', {
					usePreviousLanguageChoice: true
				} );
			} );
		}
	}

	/**
	 * Adds autoformatting related to {@link module:horizontal-line/horizontalline~HorizontalLine}.
	 *
	 * When typed:
	 * - `` --- `` &ndash; Will be replaced with a horizontal line.
	 *
	 * @private
	 */
	_addHorizontalLineAutoformats() {
		if ( this.editor.commands.get( 'horizontalLine' ) ) {
			blockAutoformatEditing( this.editor, this, /^---$/, 'horizontalLine' );
		}
	}
}

// Helper function for getting `inlineAutoformatEditing` callbacks that checks if command is enabled.
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
