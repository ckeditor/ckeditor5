/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentioncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { _addMentionAttributes } from './mentionediting';

/**
 * The mention command.
 *
 * The command is registered by the {@link module:mention/mentionediting~MentionEditing} as `'mention'`.
 *
 * To insert a mention on a range, execute the command and specify a mention object and a range to replace:
 *
 *		const focus = editor.model.document.selection.focus;
 *
 *		// It will replace one character before selection focus with '#1234' text
 *		// with mention attribute filled with passed attributes.
 *		editor.execute( 'mention', {
 *			marker: '#',
 *			mention: {
 *				id: '#1234',
 *				name: 'Foo',
 *				title: 'Big Foo'
 *			},
 *			range: model.createRange( focus, focus.getShiftedBy( -1 ) )
 *		} );
 *
 *		// It will replace one character before selection focus with 'Teh "Big Foo"' text
 *		// with attribute filled with passed attributes.
 *		editor.execute( 'mention', {
 *			marker: '#',
 *			mention: {
 *				id: '#1234',
 *				name: 'Foo',
 *				title: 'Big Foo'
 *			},
 *			text: 'The "Big Foo"',
 *			range: model.createRange( focus, focus.getShiftedBy( -1 ) )
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class MentionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'mention' );
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Object|String} options.mention Mention object to insert. If passed a string it will be used to create a plain object with
	 * name attribute equal to passed string.
	 * @param {String} options.marker The marker character (e.g. `'@'`).
	 * @param {String} [options.text] The text of inserted mention. Defaults to full mention string composed from `marker` and
	 * `mention` string or `mention.id` if object is passed.
	 * @param {String} [options.range] Range to replace. Note that replace range might be shorter then inserted text with mention attribute.
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const mentionData = typeof options.mention == 'string' ? { id: options.mention } : options.mention;
		const mentionID = mentionData.id;

		const range = options.range || selection.getFirstRange();

		const mentionText = options.text || mentionID;

		const mention = _addMentionAttributes( { _text: mentionText, id: mentionID }, mentionData );

		if ( mentionID.charAt( 0 ) != options.marker ) {
			throw new CKEditorError( 'foo' );
		}

		if ( options.marker.length != 1 ) {
			throw new CKEditorError( 'foo2' );
		}

		model.change( writer => {
			const currentAttributes = toMap( selection.getAttributes() );
			const attributesWithMention = new Map( currentAttributes.entries() );

			attributesWithMention.set( 'mention', mention );

			// Replace range with a text with mention.
			writer.remove( range );
			writer.insertText( mentionText, attributesWithMention, range.start );

			// Insert space after a mention.
			writer.insertText( ' ', currentAttributes, model.document.selection.focus );
		} );
	}
}
