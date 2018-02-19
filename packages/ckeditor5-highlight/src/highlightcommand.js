/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

/**
 * The highlight command. It is used by the {@link module:highlight/highlightediting~HighlightEditing highlight feature}
 * to apply text highlighting.
 *
 *		editor.execute( 'highlight', { value: 'greenMarker' } );
 *
 * **Note**: Executing the command without the value removes the attribute from the model. If selection is collapsed inside
 * text with highlight attribute the whole range with that attribute will be removed from the model.
 *
 * @extends module:core/command~Command
 */
export default class HighlightCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A value indicating whether the command is active. If the selection has highlight attribute
		 * set the value will be set to highlight attribute value.
		 *
		 * @observable
		 * @readonly
		 * @member {undefined|String} module:highlight/highlightcommand~HighlightCommand#value
		 */
		this.value = doc.selection.getAttribute( 'highlight' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'highlight' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] a value to apply.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const highlighter = options.value;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );

			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `highlight` attribute.
				if ( selection.hasAttribute( 'highlight' ) ) {
					// Find the full highlighted range.
					const isSameHighlight = value => {
						return value.item.hasAttribute( 'highlight' ) && value.item.getAttribute( 'highlight' ) === this.value;
					};

					const highlightStart = position.getLastMatchingPosition( isSameHighlight, { direction: 'backward' } );
					const highlightEnd = position.getLastMatchingPosition( isSameHighlight );

					const highlightRange = new Range( highlightStart, highlightEnd );

					// Then depending on current value...
					if ( !highlighter || this.value === highlighter ) {
						// ...remove attribute when passing highlighter different then current or executing "eraser".
						writer.removeAttribute( 'highlight', highlightRange );
						writer.removeSelectionAttribute( 'highlight' );
					} else {
						// ...update `highlight` value.
						writer.setAttribute( 'highlight', highlighter, highlightRange );
					}
				} else if ( highlighter ) {
					writer.setSelectionAttribute( 'highlight', highlighter );
				}
			} else {
				for ( const range of ranges ) {
					if ( highlighter ) {
						writer.setAttribute( 'highlight', highlighter, range );
					} else {
						writer.removeAttribute( 'highlight', range );
					}
				}
			}
		} );
	}
}
