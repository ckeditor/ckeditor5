/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/inline-highlight
 */

/**
 * Adds a visual highlight style to an element in which the selection is anchored.
 * Together with two-step caret movement, they indicate that the user is typing inside the element.
 *
 * Highlight is turned on by adding the `className` class to the element in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
 * @param {String} attribute The attribute name to check.
 * @param {String} tagName The tagName of a view item.
 * @param {String} className The class name to apply in the view.
 */
export default function setupHighlight( editor, view, attributeName, tagName, className ) {
	const highlightedLinks = new Set();

	// Adding the class.
	view.document.registerPostFixer( writer => {
		const selection = editor.model.document.selection;
		let changed = false;

		if ( selection.hasAttribute( attributeName ) ) {
			const modelRange = _findElementRange(
				selection.getFirstPosition(),
				attributeName,
				selection.getAttribute( attributeName ),
				editor.model
			);
			const viewRange = editor.editing.mapper.toViewRange( modelRange );

			// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
			// broken by a UIElement.
			for ( const item of viewRange.getItems() ) {
				if ( item.is( tagName ) && !item.hasClass( className ) ) {
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

// Returns a range containing the entire element in which the given `position` is placed.
//
// It can be used e.g. to get the entire range on which the `linkHref` attribute needs to be changed when having a
// selection inside a link.
//
// @param {module:engine/model/position~Position} position The start position.
// @param {String} attributeName The attribute name.
// @param {String} value The attribute value.
// @returns {module:engine/model/range~Range} The link range.
function _findElementRange( position, attributeName, value, model ) {
	return model.createRange(
		_findBound( position, attributeName, value, true, model ),
		_findBound( position, attributeName, value, false, model )
	);
}

// Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
// and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
//
// @param {module:engine/model/position~Position} position The start position.
// @param {String} attributeName The attribute name.
// @param {String} value The attribute value.
// @param {Boolean} lookBack Whether the walk direction is forward (`false`) or backward (`true`).
// @returns {module:engine/model/position~Position} The position just before the last matched node.
function _findBound( position, attributeName, value, lookBack, model ) {
	// Get node before or after position (depends on `lookBack` flag).
	// When position is inside text node then start searching from text node.
	let node = position.textNode || ( lookBack ? position.nodeBefore : position.nodeAfter );

	let lastNode = null;

	while ( node && node.getAttribute( attributeName ) == value ) {
		lastNode = node;
		node = lookBack ? node.previousSibling : node.nextSibling;
	}

	return lastNode ? model.createPositionAt( lastNode, lookBack ? 'before' : 'after' ) : position;
}
