/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/attributecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * An extension of the base {@link module:core/command~Command} class, which provides utilities for a command
 * that toggles a single attribute on a text or an element.
 *
 * `AttributeCommand` uses {@link module:engine/model/document~Document#selection}
 * to decide which nodes (if any) should be changed, and applies or removes the attribute from them.
 *
 * The command checks the {@link module:engine/model/document~Document#schema} to decide if it can be enabled
 * for the current selection and to which nodes the attribute can be applied.
 *
 * @extends module:core/command~Command
 */
export default class AttributeCommand extends Command {
	/**
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {String} attributeKey Attribute that will be set by the command.
	 */
	constructor( editor, attributeKey ) {
		super( editor );

		/**
		 * The attribute that will be set by the command.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.attributeKey = attributeKey;

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection#hasAttribute selection has the attribute} which means that:
		 *
		 * * If the selection is not empty &ndash; That it starts in a text (or another node) which has the attribute set.
		 * * If the selection is empty &ndash; That the selection has the attribute itself (which means that newly typed
		 * text will have this attribute, too).
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * Updates the command's {@link #value} based on the current selection.
	 */
	refresh() {
		const doc = this.editor.document;

		this.value = doc.selection.hasAttribute( this.attributeKey );
		this.isEnabled = doc.schema.checkAttributeInSelection( doc.selection, this.attributeKey );
	}

	/**
	 * Executes the command &mdash; applies the attribute to the selection or removes it from the selection.
	 *
	 * If the command is active (`value == true`), it will remove attributes. Otherwise, it will set attributes.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~Document#selection}:
	 *
	 * * If the selection is on a range, the command applies the attribute to all nodes in that range
	 * (if they are allowed to have this attribute by the {@link module:engine/model/schema~Schema schema}).
	 * * If the selection is collapsed in a non-empty node, the command applies the attribute to the
	 * {@link module:engine/model/document~Document#selection} itself (note that typed characters copy attributes from the selection).
	 * * If the selection is collapsed in an empty node, the command applies the attribute to the parent node of the selection (note
	 * that the selection inherits all attributes from a node if it is in an empty node).
	 *
	 * @fires execute
	 * @param {Object} [options] Command options.
	 * @param {Boolean} [options.forceValue] If set, it will force the command behavior. If `true`, the command will apply the attribute,
	 * otherwise the command will remove the attribute.
	 * If not set, the command will look for its current value to decide what it should do.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to group undo steps.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const selection = doc.selection;
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		doc.enqueueChanges( () => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					selection.setAttribute( this.attributeKey, true );
				} else {
					selection.removeAttribute( this.attributeKey );
				}
			} else {
				const ranges = doc.schema.getValidRanges( selection.getRanges(), this.attributeKey );
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
