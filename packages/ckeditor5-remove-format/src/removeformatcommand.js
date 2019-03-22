/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module removeformat/removeformat
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

const removedAttributes = [
	'bold',
	'italic',
	'underline',
	'highlight'
];

/**
 * The removeformat command. It is used by the {@link module:removeformat/removeformatediting~HighlightEditing removeformat feature}
 * to apply the text removeformating.
 *
 *		editor.execute( 'removeformat', { value: 'greenMarker' } );
 *
 * **Note**: Executing the command without a value removes the attribute from the model. If the selection is collapsed
 * inside a text with the removeformat attribute, the command will remove the attribute from the entire range
 * of that text.
 *
 * @extends module:core/command~Command
 */
export default class RemoveFormatCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const doc = this.editor.model.document;

		let commandEnabled = false;

		for ( const range of doc.selection.getRanges() ) {
			if ( this._containsRemovableFormat( range ) ) {
				commandEnabled = true;
				continue;
			}
		}

		if ( !commandEnabled ) {
			for ( const attribute of removedAttributes ) {
				if ( doc.selection.hasAttribute( attribute ) ) {
					commandEnabled = true;
					continue;
				}
			}
		}

		this.isEnabled = commandEnabled;
	}

	// Tells whether provided range contains any removable format.
	_containsRemovableFormat( range ) {
		const walker = range.getWalker();

		for ( const value of walker ) {
			for ( const attribute of removedAttributes ) {
				if ( value.item.hasAttribute( attribute ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const document = model.document;
			const selection = document.selection;

			const ranges = selection.getRanges();

			for ( const curRange of ranges ) {
				for ( const attributeName of removedAttributes ) {
					writer.removeAttribute( attributeName, curRange );
				}
			}

			writer.removeSelectionAttribute( removedAttributes );
		} );
	}
}
