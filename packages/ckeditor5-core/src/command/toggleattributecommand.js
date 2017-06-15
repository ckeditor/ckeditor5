/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/command/toggleattributecommand
 */

import Command from '../command';
import getSchemaValidRanges from './helpers/getschemavalidranges';
import isAttributeAllowedInSelection from './helpers/isattributeallowedinselection';

/**
 * An extension of the base {@link module:core/command~Command} class, which provides utilities for a command which toggles a single
 * attribute on a text or an element. `ToggleAttributeCommand` uses {@link module:engine/model/document~Document#selection}
 * to decide which nodes (if any) should be changed, and applies or removes attributes from them.
 *
 * The command checks {@link module:engine/model/document~Document#schema} to decide if it should be enabled.
 *
 * @extends module:core/command~Command
 */
export default class ToggleAttributeCommand extends Command {
	/**
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {String} attributeKey Attribute that will be set by the command.
	 */
	constructor( editor, attributeKey ) {
		super( editor );

		/**
		 * Attribute that will be set by the command.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.attributeKey = attributeKey;

		/**
		 * Flag indicating whether the command is active. For collapsed selection it means that typed characters will have
		 * the command's attribute set. For range selection it means that all nodes inside have the attribute applied.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * Updates command's {@link #value} based on the current selection.
	 */
	refresh() {
		const doc = this.editor.document;

		this.value = doc.selection.hasAttribute( this.attributeKey );
		this.isEnabled = isAttributeAllowedInSelection( this.attributeKey, doc.selection, doc.schema );
	}

	/**
	 * Executes the command: adds or removes attributes to nodes or selection.
	 *
	 * If the command is active (`value == true`), it will remove attributes. Otherwise, it will set attributes.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~Document#selection}:
	 * * if selection is on a range, the command applies the attribute on all nodes in that ranges
	 * (if they are allowed to have this attribute by the {@link module:engine/model/schema~Schema schema}),
	 * * if selection is collapsed in non-empty node, the command applies attribute to the
	 * {@link module:engine/model/document~Document#selection} itself (note that typed characters copy attributes from selection),
	 * * if selection is collapsed in empty node, the command applies attribute to the parent node of selection (note
	 * that selection inherits all attributes from a node if it is in empty node).
	 *
	 * If the command is disabled (`isEnabled == false`) when it is executed, nothing will happen.
	 *
	 * @fires execute
	 * @param {Object} [options] Options of command.
	 * @param {Boolean} [options.forceValue] If set it will force command behavior. If `true`, command will apply attribute,
	 * otherwise command will remove attribute. If not set, command will look for it's current value to decide what it should do.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to group undo steps.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const selection = doc.selection;
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges.
		doc.enqueueChanges( () => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					selection.setAttribute( this.attributeKey, true );
				} else {
					selection.removeAttribute( this.attributeKey );
				}
			} else {
				const ranges = getSchemaValidRanges( this.attributeKey, selection.getRanges(), doc.schema );

				// Keep it as one undo step.
				const batch = options.batch || doc.batch();

				for ( const range of ranges ) {
					if ( value ) {
						batch.setAttribute( range, this.attributeKey, value );
					} else {
						batch.removeAttribute( range, this.attributeKey );
					}
				}
			}
		} );
	}
}
