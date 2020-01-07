/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

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

		this.isEnabled = !!first( this._getFormattingItems( model.document.selection, model.schema ) );
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const schema = model.schema;

		model.change( writer => {
			for ( const item of this._getFormattingItems( model.document.selection, schema ) ) {
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
	 * Returns an iterable of items in a selection (including the selection itself) that have formatting model
	 * attributes to be removed by the feature.
	 *
	 * @protected
	 * @param {module:engine/model/documentselection~DocumentSelection} selection
	 * @param {module:engine/model/schema~Schema} schema The schema describing the item.
	 * @returns {Iterable.<module:engine/model/item~Item>|Iterable.<module:engine/model/documentselection~DocumentSelection>}
	 */
	* _getFormattingItems( selection, schema ) {
		const itemHasRemovableFormatting = item => {
			return !!first( this._getFormattingAttributes( item, schema ) );
		};

		for ( const curRange of selection.getRanges() ) {
			for ( const item of curRange.getItems() ) {
				if ( itemHasRemovableFormatting( item ) ) {
					yield item;
				}
			}
		}

		// Finally the selection might be formatted as well, so make sure to check it.
		if ( itemHasRemovableFormatting( selection ) ) {
			yield selection;
		}
	}

	/**
	 * Returns an iterable of formatting attributes of a given model item.
	 *
	 * **Note:** Formatting items have the `isFormatting` property set to `true`.
	 *
	 * @protected
	 * @param {module:engine/model/item~Item|module:engine/model/documentselection~DocumentSelection} item
	 * @param {module:engine/model/schema~Schema} schema The schema describing the item.
	 * @returns {Iterable.<String>} The names of formatting attributes found in a given item.
	 */
	* _getFormattingAttributes( item, schema ) {
		for ( const [ attributeName ] of item.getAttributes() ) {
			const attributeProperties = schema.getAttributeProperties( attributeName );

			if ( attributeProperties && attributeProperties.isFormatting ) {
				yield attributeName;
			}
		}
	}
}
