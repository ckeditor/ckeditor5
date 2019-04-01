/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module remove-format/removeformatcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The remove format command.
 *
 * It is used by the {@link module:remove-format/removeformat~RemoveFormat remove format feature}
 * to clear the formatting in the selection.
 *
 *		editor.execute( 'removeFormat' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveFormatCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;

		this.isEnabled = !this._getFormattedElements( model.document.selection, model.schema ).next().done;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const schema = model.schema;

		model.change( writer => {
			for ( const item of this._getFormattedElements( model.document.selection, schema ) ) {
				if ( item.is( 'selection' ) ) {
					for ( const attributeName of this._getFormattingAttributes( item, schema ) ) {
						writer.removeSelectionAttribute( attributeName );
					}
				} else {
					// Workaround for items with multiple removable attributes. See
					// https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
					const itemRange = writer.createRangeOn( item );

					for ( const attributeName of this._getFormattingAttributes( item, schema ) ) {
						writer.removeAttribute( attributeName, itemRange );
					}
				}
			}
		} );
	}

	/**
	 * Yields items from a selection (including selection itself) that contain styles to be removed
	 * by the remove format feature.
	 *
	 * @protected
	 * @param {module:engine/model/documentselection~DocumentSelection} selection
	 * @param {module:engine/model/schema~Schema} schema Schema describing the item.
	 * @returns {Iterable.<module:engine/model/item~Item>|Iterable.<module:engine/model/documentselection~DocumentSelection>}
	 */
	* _getFormattedElements( selection, schema ) {
		const itemHasRemovableFormatting = item => {
			return !this._getFormattingAttributes( item, schema ).next().done;
		}

		for ( const curRange of selection.getRanges() ) {
			for ( const item of curRange.getItems() ) {
				if ( itemHasRemovableFormatting( item ) ) {
					yield item;
				}
			}
		}

		// Finally the selection might be styles as well, so make sure to check it.
		if ( itemHasRemovableFormatting( selection ) ) {
			yield selection;
		}
	}

	/**
	 * Returns a list formatting attributes in a given element.
	 *
	 * @protected
	 * @param {module:engine/model/item~Item|module:engine/model/documentselection~DocumentSelection} item
	 * @param {module:engine/model/schema~Schema} schema Schema describing the item.
	 * @returns {Iterable.<String>} Names of formatting attributes found in a given item.
	 */
	* _getFormattingAttributes( item, schema ) {
		for ( const [ attributeName ] of item.getAttributes() ) {
			if ( ( schema.getAttributeProperties( attributeName ) || {} ).isFormatting ) {
				yield attributeName;
			}
		}
	}
}
