/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import findAttributeRange from './findattributerange';

/**
 * @module typing/utils/inlinehighlight
 */

/**
 * Adds a visual highlight style to an attribute element in which the selection is anchored.
 * Together with two-step caret movement, they indicate that the user is typing inside the element.
 *
 * Highlight is turned on by adding the given class to the attribute element in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * Usage:
 *
 *		import inlineHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';
 *
 *		// Make `ck-link_selected` class be applied on an `a` element
 *		// whenever the corresponding `linkHref` attribute element is selected.
 *		inlineHighlight( editor, 'linkHref', 'a', 'ck-link_selected' );
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @param {String} attributeName The attribute name to check.
 * @param {String} tagName The tagName of a view item.
 * @param {String} className The class name to apply in the view.
 */
export default function inlineHighlight( editor, attributeName, tagName, className ) {
	const view = editor.editing.view;
	const highlightedElements = new Set();

	// Adding the class.
	view.document.registerPostFixer( writer => {
		const selection = editor.model.document.selection;
		let changed = false;

		if ( selection.hasAttribute( attributeName ) ) {
			const modelRange = findAttributeRange(
				selection.getFirstPosition(),
				attributeName,
				selection.getAttribute( attributeName ),
				editor.model
			);
			const viewRange = editor.editing.mapper.toViewRange( modelRange );

			// There might be multiple view elements in the `viewRange`, for example, when the `a` element is
			// broken by a UIElement.
			for ( const item of viewRange.getItems() ) {
				if ( item.is( 'element', tagName ) && !item.hasClass( className ) ) {
					writer.addClass( className, item );
					highlightedElements.add( item );
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
				for ( const item of highlightedElements.values() ) {
					writer.removeClass( className, item );
					highlightedElements.delete( item );
				}
			} );
		}
	} );
}
