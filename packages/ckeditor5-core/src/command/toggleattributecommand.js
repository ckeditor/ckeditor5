/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/command/toggleattributecommand
 */

import Command from './command';
import getSchemaValidRanges from './helpers/getschemavalidranges';
import isAttributeAllowedInSelection from './helpers/isattributeallowedinselection';

/**
 * An extension of the base {@link module:core/command/command~Command} class, which provides utilities for a command which toggles a single
 * attribute on a text or an element. `ToggleAttributeCommand` uses {@link module:engine/model/document~Document#selection}
 * to decide which nodes (if any) should be changed, and applies or removes attributes from them.
 *
 * The command checks {@link module:engine/model/document~Document#schema} to decide if it should be enabled.
 */
export default class ToggleAttributeCommand extends Command {
	/**
	 * @see module:core/command/command~Command
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {String} attributeKey Attribute that will be set by the command.
	 */
	constructor( editor, attributeKey ) {
		super( editor );

		/**
		 * Attribute that will be set by the command.
		 *
		 * @member {String}
		 */
		this.attributeKey = attributeKey;

		/**
		 * Flag indicating whether command is active. For collapsed selection it means that typed characters will have
		 * the command's attribute set. For range selection it means that all nodes inside have the attribute applied.
		 *
		 * @observable
		 * @member {Boolean} #value
		 */
		this.set( 'value', false );

		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshValue();
			this.refreshState();
		} );
	}

	/**
	 * Updates command's {@link #value value} based on the current selection.
	 */
	refreshValue() {
		this.value = this.editor.document.selection.hasAttribute( this.attributeKey );
	}

	/**
	 * Checks if {@link module:engine/model/document~Document#schema} allows to create attribute in
	 * {@link module:engine/model/document~Document#selection}.
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
	 * @private
	 * @param {Object} [options] Options of command.
	 * @param {Boolean} [options.forceValue] If set it will force command behavior. If `true`, command will apply attribute,
	 * otherwise command will remove attribute. If not set, command will look for it's current value to decide what it should do.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to group undo steps.
	 */
	_doExecute( options = {} ) {
		const document = this.editor.document;
		const selection = document.selection;
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges.
		document.enqueueChanges( () => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					selection.setAttribute( this.attributeKey, true );
				} else {
					selection.removeAttribute( this.attributeKey );
				}
			} else {
				const ranges = getSchemaValidRanges( this.attributeKey, selection.getRanges(), document.schema );

				// Keep it as one undo step.
				const batch = options.batch || document.batch();

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
