/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module select-all/selectallcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The select all command.
 *
 * It is used by the {@link module:select-all/selectallediting~SelectAllEditing select all editing feature} to handle
 * the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke.
 *
 * Executing this command changes the {@glink framework/guides/architecture/editing-engine#model model}
 * selection so it contains the entire content of the editable root of the editor the selection is
 * {@link module:engine/model/selection~Selection#anchor anchored} in.
 *
 * If the selection was anchored in a {@glink framework/guides/tutorials/implementing-a-block-widget nested editable}
 * (e.g. a caption of an image), the new selection will contain its entire content.
 *
 * @extends module:core/command~Command
 */
export default class SelectAllCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const limitElement = model.schema.getLimitElement( model.document.selection );

		model.change( writer => {
			writer.setSelection( limitElement, 'in' );
		} );
	}
}
