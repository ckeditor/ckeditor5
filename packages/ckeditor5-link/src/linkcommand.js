/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import getSchemaValidRanges from '../core/command/helpers/getschemavalidranges.js';
import isAttributeAllowedInSelection from '../core/command/helpers/isattributeallowedinselection.js';

/**
 * An extension of basic {@link core.command.Command} class, which provides utilities for a command that toggle a single
 * attribute on a text or element with value `true`. ToggleAttributeCommand uses {@link engine.model.Document#selection}
 * to decide which nodes (if any) should be changed, and applies or removes attributes from them.
 * See {@link engine.view.Converter#execute} for more.
 *
 * The command checks {@link engine.model.Document#schema} to decide if it should be enabled.
 * See {@link engine.view.Converter#checkSchema} for more.
 *
 * @memberOf core.command
 */
export default class ToggleAttributeCommand extends Command {
	/**
	 * Checks if {@link engine.model.Document#schema} allows to create attribute in {@link engine.model.Document#selection}
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_checkEnabled() {
		const document = this.editor.document;

		return isAttributeAllowedInSelection( this.attributeKey, document.selection, document.schema );
	}

	/**
	 * Executes the command: adds or removes attributes to nodes or selection.
	 *
	 * If the command is active (`value == true`), it will remove attributes. Otherwise, it will set attributes.
	 *
	 * The execution result differs, depending on the {@link engine.model.Document#selection}:
	 * * if selection is on a range, the command applies the attribute on all nodes in that ranges
	 * (if they are allowed to have this attribute by the {@link engine.model.Schema schema}),
	 * * if selection is collapsed in non-empty node, the command applies attribute to the {@link engine.model.Document#selection}
	 * itself (note that typed characters copy attributes from selection),
	 * * if selection is collapsed in empty node, the command applies attribute to the parent node of selection (note
	 * that selection inherits all attributes from a node if it is in empty node).
	 *
	 * If the command is disabled (`isEnabled == false`) when it is executed, nothing will happen.
	 *
	 * @private
	 * @param {Boolean} [forceValue] If set it will force command behavior. If `true`, command will apply attribute,
	 * otherwise command will remove attribute. If not set, command will look for it's current value to decide what it should do.
	 */
	_doExecute( href ) {
		const document = this.editor.document;
		const selection = document.selection;

		if ( selection.isCollapsed ) {
			selection.setAttribute( 'link', href );
		} else {
			// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges.
			document.enqueueChanges( () => {
				const ranges = getSchemaValidRanges( 'link', selection.getRanges(), document.schema );

				// Keep it as one undo step.
				const batch = document.batch();

				for ( let range of ranges ) {
					batch.setAttribute( range, 'link', href );
				}
			} );
		}
	}
}
