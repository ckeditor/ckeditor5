/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/view
 */

/**
 * Checks if view element is a list type (ul or ol).
 *
 * @protected
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isListView( viewElement ) {
	return viewElement.is( 'element', 'ol' ) || viewElement.is( 'element', 'ul' );
}

/**
 * Checks if view element is a list item (li).
 *
 * @protected
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isListItemView( viewElement ) {
	return viewElement.is( 'element', 'li' );
}

/**
 * Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
 *
 * Also, fixes non HTML compliant lists indents:
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
 * 		    |-> OL                                  |-> OL
 * 		        |-> OL                                  |
 * 		        |   |-> OL                              |
 * 		        |       |-> OL                          |
 * 		        |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
 * 		        |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> OL                                      |
 * 		    |-> OL                                  |
 * 		         |-> OL                             |
 * 		             |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
 * 		|-> OL                                          |-> OL
 * 		    |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
 *
 * @protected
 * @param {module:engine/view/element~Element} listItem
 * @returns {Number}
 */
export function getIndent( listItem ) {
	let indent = 0;
	let parent = listItem.parent;

	while ( parent ) {
		// Each LI in the tree will result in an increased indent for HTML compliant lists.
		if ( isListItemView( parent ) ) {
			indent++;
		} else {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = parent.previousSibling;

			// ...because the we might need increase its indent:
			//		before:                           fixed list:
			//		OL                                OL
			//		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
			//		|-> OL                                |-> OL
			//		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
			if ( previousSibling && isListItemView( previousSibling ) ) {
				indent++;
			}
		}

		parent = parent.parent;
	}

	return indent;
}

/**
 * Creates a list attribute element (ol or ul).
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The downcast writer.
 * @param {Number} indent The list item indent.
 * @param {'bulleted'|'numbered'} type The list type.
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createListElement( writer, indent, type, id = getViewElementIdForListType( type, indent ) ) {
	// Negative priorities so that restricted editing attribute won't wrap lists.
	return writer.createAttributeElement( getViewElementNameForListType( type ), null, {
		priority: 2 * indent / 100 - 100,
		id
	} );
}

/**
 * Creates a list item attribute element (li).
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The downcast writer.
 * @param {Number} indent The list item indent.
 * @param {String} id The list item ID.
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createListItemElement( writer, indent, id ) {
	// Negative priorities so that restricted editing attribute won't wrap list items.
	return writer.createAttributeElement( 'li', null, {
		priority: ( 2 * indent + 1 ) / 100 - 100,
		id
	} );
}

/**
 * Returns a view element name for the given list type.
 *
 * @protected
 * @param {'bulleted'|'numbered'} type The list type.
 * @returns {String}
 */
export function getViewElementNameForListType( type ) {
	return type == 'numbered' ? 'ol' : 'ul';
}

/**
 * Returns a view element ID for the given list type and indent.
 *
 * @protected
 * @param {'bulleted'|'numbered'} type The list type.
 * @param {Number} indent The list indent level.
 * @returns {String}
 */
export function getViewElementIdForListType( type, indent ) {
	return `list-${ type }-${ indent }`;
}
