/**
* @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
* For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

/**
* @module table/tablecaption/toggletablecaptioncommand
*/

import { Command } from 'ckeditor5/src/core';
import { Element } from 'ckeditor5/src/engine';

import { getCaptionFromTableModelElement } from './utils';

/**
 * The toggle table caption command.
 *
 * This command is registered by {@link module:table/tablecaption/tablecaptionediting~TableCaptionEditing} as the
 * `'toggleTableCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the table caption of a selected table (depending on whether the caption is present or not),
 * * removes the table caption if the selection is anchored in one.
 *
 *		// Toggle the presence of the caption.
 *		editor.execute( 'toggleTableCaption' );
 *
 * **Note**: Upon executing this command, the selection will be set on the table if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 *		editor.execute( 'toggleTableCaption', { focusCaptionOnShow: true } );
 *
 * @extends module:core/command~Command
 */
export default class ToggleTableCaptionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableParent = selection.getFirstPosition().findAncestor( 'table' );

		this.isEnabled = !!tableParent;

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromTableModelElement( tableParent );
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'toggleTableCaption' );
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.focusCaptionOnShow] When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */
	execute( options = {} ) {
		const { focusCaptionOnShow } = options;

		this.editor.model.change( writer => {
			if ( this.value ) {
				this._hideTableCaption( writer );
			} else {
				this._showTableCaption( writer, focusCaptionOnShow );
			}
		} );
	}

	/**
	 * Shows the table caption. Also:
	 *
	 * * it attempts to restore the caption content from the `caption` attribute,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_showTableCaption( writer, focusCaptionOnShow ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedTable = selection.getFirstPosition().findAncestor( 'table' );

		let newCaptionElement;

		// Try restoring the caption from the attribute.
		if ( selectedTable.hasAttribute( 'caption' ) ) {
			newCaptionElement = Element.fromJSON( selectedTable.getAttribute( 'caption' ) );

			// The model attribute is no longer needed if the caption was created out of it.
			writer.removeAttribute( 'caption', selectedTable );
		} else {
			newCaptionElement = writer.createElement( 'caption' );
		}

		writer.append( newCaptionElement, selectedTable );

		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		}
	}

	/**
	 * Hides the caption of a selected image (or an image caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `caption` model attribute of the image
	 * to make this a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_hideTableCaption( writer ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const tableParent = selection.getFirstPosition().findAncestor( 'table' );
		const captionElement = getCaptionFromTableModelElement( tableParent );

		// Store the caption content so it can be restored quickly if the user changes their mind.
		if ( captionElement.childCount ) {
			writer.setAttribute( 'caption', captionElement.toJSON(), tableParent );
		}

		writer.setSelection( tableParent, 'on' );
		writer.remove( captionElement );
	}
}
