/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention/mentioncommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Range } from 'ckeditor5/src/engine.js';
import { CKEditorError, toMap } from 'ckeditor5/src/utils.js';

import { _addMentionAttributes } from './mentionediting.js';

const BRACKET_PAIRS = {
	'(': ')',
	'[': ']',
	'{': '}'
} as const;

/**
 * The mention command.
 *
 * The command is registered by {@link module:mention/mentionediting~MentionEditing} as `'mention'`.
 *
 * To insert a mention into a range, execute the command and specify a mention object with a range to replace:
 *
 * ```ts
 * const focus = editor.model.document.selection.focus;
 *
 * // It will replace one character before the selection focus with the '#1234' text
 * // with the mention attribute filled with passed attributes.
 * editor.execute( 'mention', {
 * 	marker: '#',
 * 	mention: {
 * 		id: '#1234',
 * 		name: 'Foo',
 * 		title: 'Big Foo'
 * 	},
 * 	range: editor.model.createRange( focus.getShiftedBy( -1 ), focus )
 * } );
 *
 * // It will replace one character before the selection focus with the 'The "Big Foo"' text
 * // with the mention attribute filled with passed attributes.
 * editor.execute( 'mention', {
 * 	marker: '#',
 * 	mention: {
 * 		id: '#1234',
 * 		name: 'Foo',
 * 		title: 'Big Foo'
 * 	},
 * 	text: 'The "Big Foo"',
 * 	range: editor.model.createRange( focus.getShiftedBy( -1 ), focus )
 * } );
 *	```
 */
export default class MentionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		// Since this command may pass range in execution parameters, it should be checked directly in execute block.
		this._isEnabledBasedOnSelection = false;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'mention' );
	}

	/**
	 * Executes the command.
	 *
	 * @param options Options for the executed command.
	 * @param options.mention The mention object to insert. When a string is passed, it will be used to create a plain
	 * object with the name attribute that equals the passed string.
	 * @param options.marker The marker character (e.g. `'@'`).
	 * @param options.text The text of the inserted mention. Defaults to the full mention string composed from `marker` and
	 * `mention` string or `mention.id` if an object is passed.
	 * @param options.range The range to replace.
	 * Note that the replaced range might be shorter than the inserted text with the mention attribute.
	 * @fires execute
	 */
	public override execute( options: {
		mention: string | { id: string; [ key: string ]: unknown };
		marker: string;
		text?: string;
		range?: Range;
	} ): void {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const mentionData = typeof options.mention == 'string' ? { id: options.mention } : options.mention;
		const mentionID = mentionData.id;

		const range = options.range || selection.getFirstRange();

		// Don't execute command if range is in non-editable place.
		if ( !model.canEditAt( range ) ) {
			return;
		}

		const mentionText = options.text || mentionID;

		const mention = _addMentionAttributes( { _text: mentionText, id: mentionID }, mentionData );

		if ( !mentionID.startsWith( options.marker ) ) {
			/**
			 * The feed item ID must start with the marker character(s).
			 *
			 * Correct mention feed setting:
			 *
			 * ```ts
			 * mentions: [
			 * 	{
			 * 		marker: '@',
			 * 		feed: [ '@Ann', '@Barney', ... ]
			 * 	}
			 * ]
			 * ```
			 *
			 * Incorrect mention feed setting:
			 *
			 * ```ts
			 * mentions: [
			 * 	{
			 * 		marker: '@',
			 * 		feed: [ 'Ann', 'Barney', ... ]
			 * 	}
			 * ]
			 * ```
			 *
			 * See {@link module:mention/mentionconfig~MentionConfig}.
			 *
			 * @error mentioncommand-incorrect-id
			 */
			throw new CKEditorError(
				'mentioncommand-incorrect-id',
				this
			);
		}

		model.change( writer => {
			const currentAttributes = toMap( selection.getAttributes() );
			const attributesWithMention = new Map( currentAttributes.entries() );

			attributesWithMention.set( 'mention', mention );

			// Replace a range with the text with a mention.
			const insertionRange = model.insertContent( writer.createText( mentionText, attributesWithMention ), range );
			const nodeBefore = insertionRange.start.nodeBefore;
			const nodeAfter = insertionRange.end.nodeAfter;

			const isFollowedByWhiteSpace = nodeAfter && nodeAfter.is( '$text' ) && nodeAfter.data.startsWith( ' ' );
			let isInsertedInBrackets = false;

			if ( nodeBefore && nodeAfter && nodeBefore.is( '$text' ) && nodeAfter.is( '$text' ) ) {
				const precedingCharacter = nodeBefore.data.slice( -1 );
				const isPrecededByOpeningBracket = precedingCharacter in BRACKET_PAIRS;
				const isFollowedByBracketClosure = isPrecededByOpeningBracket && nodeAfter.data.startsWith(
					BRACKET_PAIRS[ precedingCharacter as keyof typeof BRACKET_PAIRS ]
				);

				isInsertedInBrackets = isPrecededByOpeningBracket && isFollowedByBracketClosure;
			}

			// Don't add a white space if either of the following is true:
			// * there's already one after the mention;
			// * the mention was inserted in the empty matching brackets.
			// https://github.com/ckeditor/ckeditor5/issues/4651
			if ( !isInsertedInBrackets && !isFollowedByWhiteSpace ) {
				model.insertContent( writer.createText( ' ', currentAttributes ), range!.start.getShiftedBy( mentionText.length ) );
			}
		} );
	}
}
