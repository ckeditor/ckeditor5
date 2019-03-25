/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module removeformat/removeformat
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';

const removedAttributes = [
	'bold',
	'italic',
	'underline',
	'highlight'
];

/**
 * The removeformat command. It is used by the {@link module:removeformat/removeformat~RemoveFormat remove format feature}
 * to clear formatting form current user selection.
 *
 *		editor.execute( 'removeformat' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveFormatCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selection = this.editor.model.document.selection;

		this.isEnabled = !this._getStylableElements( selection ).next().done;
	}

	/**
	 * @inheritdoc
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			for ( const item of this._getStylableElements( model.document.selection ) ) {
				for ( const attributeName of removedAttributes ) {
					if ( item instanceof DocumentSelection ) {
						writer.removeSelectionAttribute( attributeName );
					} else {
						writer.removeAttribute( attributeName, item );
					}
				}
			}
		} );
	}

	/**
	 * Yields elements from a selection range that contains styles to be removed by remove format feature.
	 *
	 * Finds any stylable items (including selection itself) in a given selection that contains any formatting that
	 * could be removed by remove format feature.
	 *
	 * @protected
	 * @param {module:engine/model/documentselection~DocumentSelection} selection
	 * @returns {Iterable.<module:engine/model/item~Item>|module:engine/model/documentselection~DocumentSelection}
	 */
	* _getStylableElements( selection ) {
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

		function itemHasRemovableFormatting( item ) {
			for ( const attributeName of removedAttributes ) {
				if ( item.hasAttribute( attributeName ) ) {
					return true;
				}
			}
		}
	}
}
