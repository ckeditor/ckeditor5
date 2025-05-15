/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module autoformat/autoformat
 */
import type { HeadingCommand } from '@ckeditor/ckeditor5-heading';

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { Range, Writer } from 'ckeditor5/src/engine.js';
import { Delete } from 'ckeditor5/src/typing.js';

import blockAutoformatEditing from './blockautoformatediting.js';
import inlineAutoformatEditing from './inlineautoformatediting.js';

/**
 * Enables a set of predefined autoformatting actions.
 *
 * For a detailed overview, check the {@glink features/autoformat Autoformatting} feature guide
 * and the {@glink api/autoformat package page}.
 */
export default class Autoformat extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Delete ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Autoformat' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const t = this.editor.t;

		this._addListAutoformats();
		this._addBasicStylesAutoformats();
		this._addHeadingAutoformats();
		this._addBlockQuoteAutoformats();
		this._addCodeBlockAutoformats();
		this._addHorizontalLineAutoformats();

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Revert autoformatting action' ),
					keystroke: 'Backspace'
				}
			]
		} );
	}

	/**
	 * Adds autoformatting related to the {@link module:list/list~List}.
	 *
	 * When typed:
	 * - `* ` or `- ` &ndash; A paragraph will be changed into a bulleted list.
	 * - `1. ` or `1) ` &ndash; A paragraph will be changed into a numbered list ("1" can be any digit or a list of digits).
	 * - `[] ` or `[ ] ` &ndash; A paragraph will be changed into a to-do list.
	 * - `[x] ` or `[ x ] ` &ndash; A paragraph will be changed into a checked to-do list.
	 */
	private _addListAutoformats(): void {
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
	 */
	private _addBasicStylesAutoformats(): void {
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
	 * * `heading` with a `heading1` value will be executed when typing `#`,
	 * * `heading` with a `heading2` value will be executed when typing `##`,
	 * * ... up to `heading6` for `######`.
	 */
	private _addHeadingAutoformats(): void {
		const command: HeadingCommand | undefined = this.editor.commands.get( 'heading' );

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
	 */
	private _addBlockQuoteAutoformats(): void {
		if ( this.editor.commands.get( 'blockQuote' ) ) {
			blockAutoformatEditing( this.editor, this, /^>\s$/, 'blockQuote' );
		}
	}

	/**
	 * Adds autoformatting related to {@link module:code-block/codeblock~CodeBlock}.
	 *
	 * When typed:
	 * - `` ``` `` &ndash; A paragraph will be changed to a code block.
	 */
	private _addCodeBlockAutoformats(): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( editor.commands.get( 'codeBlock' ) ) {
			blockAutoformatEditing( editor, this, /^```$/, () => {
				if ( selection.getFirstPosition()!.parent.is( 'element', 'listItem' ) ) {
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
	 */
	private _addHorizontalLineAutoformats(): void {
		if ( this.editor.commands.get( 'horizontalLine' ) ) {
			blockAutoformatEditing( this.editor, this, /^---$/, 'horizontalLine' );
		}
	}
}

/**
 * Helper function for getting `inlineAutoformatEditing` callbacks that checks if command is enabled.
 */
function getCallbackFunctionForInlineAutoformat( editor: Editor, attributeKey: string ) {
	return ( writer: Writer, rangesToFormat: Array<Range> ): boolean | undefined => {
		const command = editor.commands.get( attributeKey )!;

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
