/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentioncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

/**
 * The mention command.
 *
 * The command is registered by the {@link module:mention/mentionediting~MentionEditing} as `'mention'`.
 *
 * To insert mention on range, execute the command and specify, mention object and range to replace:
 *
 *		const focus = editor.model.document.selection.focus;
 *
 *		editor.execute( 'mention', {
 *			mention: {
 *				name: 'Foo',
 *				id: '1234',
 *				title: 'Big Foo'
 *			},
 *			marker: '#',
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
	 * @param {String} [options.marker='@'] The mention marker to insert.
	 * @param {String} [options.range] Range to replace. Note that replace range might be shorter then inserted text with mention attribute.
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const marker = options.marker || '@';

		const mention = typeof options.mention == 'string' ? { name: options.mention } : options.mention;

		// Set internal attributes on mention object.
		mention._id = uid();
		mention._marker = marker;

		const range = options.range || selection.getFirstRange();

		model.change( writer => {
			const currentAttributes = toMap( selection.getAttributes() );
			const attributesWithMention = new Map( currentAttributes.entries() );
			attributesWithMention.set( 'mention', mention );

			const mentionText = `${ marker }${ mention.name }`;

			// Replace range with a text with mention.
			writer.remove( range );
			writer.insertText( mentionText, attributesWithMention, range.start );

			// Insert space after a mention.
			writer.insertText( ' ', currentAttributes, model.document.selection.focus );
		} );
	}
}
