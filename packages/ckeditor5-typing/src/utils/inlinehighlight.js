/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import findAttributeRange from './findattributerange';

/**
 * @module typing/utils/inlinehighlight
 */

/**
 * Adds a visual highlight style to a link in which the selection is anchored.
 * Together with two-step caret movement, they indicate that the user is typing inside the link.
 *
 * Highlight is turned on by adding the given class to the link in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * @param {String} className The class name to apply in the view.
 */
export default function setupLinkHighlight( editor, className ) {
	const view = editor.editing.view;
	const highlightedLinks = new Set();

	// Adding the class.
	view.document.registerPostFixer( writer => {
		const selection = editor.model.document.selection;
		let changed = false;

		if ( selection.hasAttribute( 'linkHref' ) ) {
			const modelRange = findAttributeRange(
				selection.getFirstPosition(),
				'linkHref',
				selection.getAttribute( 'linkHref' ),
				editor.model
			);
			const viewRange = editor.editing.mapper.toViewRange( modelRange );

			// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
			// broken by a UIElement.
			for ( const item of viewRange.getItems() ) {
				if ( item.is( 'a' ) && !item.hasClass( className ) ) {
					writer.addClass( className, item );
					highlightedLinks.add( item );
					changed = true;
				}
			}
		}

		return changed;
	} );

	// Removing the class.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		// Make sure the highlight is removed on every possible event, before conversion is started.
		dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

		function removeHighlight() {
			view.change( writer => {
				for ( const item of highlightedLinks.values() ) {
					writer.removeClass( className, item );
					highlightedLinks.delete( item );
				}
			} );
		}
	} );
}
