/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/common
 */

/**
 * Removes paragraph wrapping content inside list item.
 *
 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} elementOrDocumentFragment
 * @param {module:engine/view/upcastwriter~UpcastWriter} writer
 */
export function unwrapParagraph( elementOrDocumentFragment, writer ) {
	const iterableNodes = elementOrDocumentFragment.is( 'element' ) ? elementOrDocumentFragment.getChildren() : elementOrDocumentFragment;

	for ( const element of iterableNodes ) {
		if ( element.is( 'element', 'p' ) && element.parent.is( 'element', 'li' ) ) {
			unwrapSingleElement( element, writer );
		}

		if ( element.is( 'element' ) && element.childCount ) {
			unwrapParagraph( element, writer );
		}
	}
}

/**
 * Moves nested list inside previous sibling element, what is a proper HTML standard.
 *
 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} elementOrDocumentFragment
 * @param {module:engine/view/upcastwriter~UpcastWriter} writer
 */
export function moveNestedListToListItem( elementOrDocumentFragment, writer ) {
	// There are 2 situations which are fixed in the for loop:
	//
	// 1. Move list to previous list item:
	// OL                      OL
	// |-> LI                  |-> LI
	// |-> OL                      |-> OL
	//     |-> LI                      |-> LI
	//
	// 2. Unwrap nested list to avoid situation that UL or OL is direct child of another UL or OL.
	// OL                     OL
	// |-> LI                 |-> LI
	//     |-> OL                  |-> OL
	//         |-> OL                   |-> LI
	//         |   |-> OL               |-> LI
	//         |       |-> OL
	//         |           |-> LI
	//         |-> LI
	const iterableNodes = elementOrDocumentFragment.is( 'element' ) ? elementOrDocumentFragment.getChildren() : elementOrDocumentFragment;

	for ( const element of iterableNodes ) {
		if ( isList( element ) && isList( element.parent ) ) {
			// 1.
			const previous = element.previousSibling;

			writer.remove( element );
			writer.insertChild( previous.childCount, element, previous );

			// 2.
			let firstChild = element.getChild( 0 );

			while ( isList( firstChild ) ) {
				unwrapSingleElement( firstChild, writer );
				firstChild = element.getChild( 0 );
			}
		}

		if ( element.is( 'element' ) && element.childCount ) {
			moveNestedListToListItem( element, writer );
		}
	}
}

function isList( element ) {
	return element.is( 'element', 'ol' ) || element.is( 'element', 'ul' );
}

function unwrapSingleElement( element, writer ) {
	const parent = element.parent;
	const childIndex = parent.getChildIndex( element );

	writer.remove( element );
	writer.insertChild( childIndex, element.getChildren(), parent );
}
