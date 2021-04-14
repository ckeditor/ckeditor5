/**
* @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
* For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

/**
* @module table/tablecaption/toggletablecaptioncommand
*/

import { Command } from 'ckeditor5/src/core';
import { Element } from 'ckeditor5/src/engine';

import { getCaptionFromTableModelElement, findClosestParentTable } from './utils';

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
		const tableElement = findClosestParentTable( editor.model.document.selection );

		this.isEnabled = !!tableElement;

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromTableModelElement( tableElement );
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
	 * @param {Boolean} focusCaptionOnShow Default focus behavior when showing the caption.
	 */
	_showTableCaption( writer, focusCaptionOnShow ) {
		const model = this.editor.model;
		const tableElement = findClosestParentTable( model.document.selection );

		let newCaptionElement;

		// Try restoring the caption from the attribute.
		if ( tableElement.hasAttribute( 'caption' ) ) {
			newCaptionElement = Element.fromJSON( tableElement.getAttribute( 'caption' ) );

			// The model attribute is no longer needed if the caption was created out of it.
			writer.removeAttribute( 'caption', tableElement );
		} else {
			newCaptionElement = writer.createElement( 'caption' );
		}

		writer.append( newCaptionElement, tableElement );

		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		}
	}

	/**
	 * Hides the caption of a selected table (or an table caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `caption` model attribute of the table
	 * to make this a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_hideTableCaption( writer ) {
		const model = this.editor.model;
		const tableElement = findClosestParentTable( model.document.selection );
		const captionElement = getCaptionFromTableModelElement( tableElement );

		// Store the caption content so it can be restored quickly if the user changes their mind.
		if ( captionElement.childCount ) {
			writer.setAttribute( 'caption', captionElement.toJSON(), tableElement );
		}

		writer.setSelection( writer.createRangeIn( tableElement.getChild( 0 ).getChild( 0 ) ) );
		writer.remove( captionElement );
	}
}
