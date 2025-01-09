/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/attributecommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';

/**
 * An extension of the base {@link module:core/command~Command} class, which provides utilities for a command
 * that toggles a single attribute on a text or an element.
 *
 * `AttributeCommand` uses {@link module:engine/model/document~Document#selection}
 * to decide which nodes (if any) should be changed, and applies or removes the attribute from them.
 *
 * The command checks the {@link module:engine/model/model~Model#schema} to decide if it can be enabled
 * for the current selection and to which nodes the attribute can be applied.
 */
export default class AttributeCommand extends Command {
	/**
	 * Flag indicating whether the command is active. The command is active when the
	 * {@link module:engine/model/selection~Selection#hasAttribute selection has the attribute} which means that:
	 *
	 * * If the selection is not empty &ndash; That the attribute is set on the first node in the selection that allows this attribute.
	 * * If the selection is empty &ndash; That the selection has the attribute itself (which means that newly typed
	 * text will have this attribute, too).
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: boolean;

	/**
	 * The attribute that will be set by the command.
	 */
	public readonly attributeKey: string;

	/**
	 * @param attributeKey Attribute that will be set by the command.
	 */
	constructor( editor: Editor, attributeKey: string ) {
		super( editor );

		this.attributeKey = attributeKey;
	}

	/**
	 * Updates the command's {@link #value} and {@link #isEnabled} based on the current selection.
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.value = this._getValueFromFirstAllowedNode();
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, this.attributeKey );
	}

	/**
	 * Executes the command &ndash; applies the attribute to the selection or removes it from the selection.
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
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`,
	 * the command will apply the attribute, otherwise the command will remove the attribute.
	 * If not set, the command will look for its current value to decide what it should do.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( this.attributeKey, true );
				} else {
					writer.removeSelectionAttribute( this.attributeKey );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), this.attributeKey );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( this.attributeKey, value, range );
					} else {
						writer.removeAttribute( this.attributeKey, range );
					}
				}
			}
		} );
	}

	/**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection returns the selection attribute.
	 *
	 * @returns The attribute value.
	 */
	private _getValueFromFirstAllowedNode(): boolean {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			return selection.hasAttribute( this.attributeKey );
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, this.attributeKey ) ) {
					return item.hasAttribute( this.attributeKey );
				}
			}
		}

		return false;
	}
}
