/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/mentioncommand
 */
import { Command } from 'ckeditor5/src/core';
import type { Range } from 'ckeditor5/src/engine';
import type { MentionAttribute } from './mention';
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
    refresh(): void;
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
    execute(options: {
        mention: string | MentionAttribute;
        marker: string;
        text?: string;
        range?: Range;
    }): void;
}
