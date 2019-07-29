/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/common
 */

export function unwrapParagraph( elementOrDocumentFragment, writer ) {
	const iterableNodes = elementOrDocumentFragment.is( 'element' ) ? elementOrDocumentFragment.getChildren() : elementOrDocumentFragment;

	for ( const element of iterableNodes ) {
		if ( element.is( 'element', 'p' ) && element.parent.is( 'element', 'li' ) ) {
			const parent = element.parent;
			const childIndex = parent.getChildIndex( element );
			const removedElement = writer.remove( element )[ 0 ];

			writer.insertChild( childIndex, removedElement.getChildren(), parent );
		}

		if ( element.is( 'element' ) && element.childCount ) {
			unwrapParagraph( element, writer );
		}
	}
}

export function moveNestedListToListItem( elementOrDocumentFragment, writer ) {
	const iterableNodes = elementOrDocumentFragment.is( 'element' ) ? elementOrDocumentFragment.getChildren() : elementOrDocumentFragment;

	for ( const element of iterableNodes ) {
		if ( isList( element ) && isList( element.parent ) ) {
			const previous = element.previousSibling;
			const removedElement = writer.remove( element )[ 0 ];

			writer.insertChild( previous.childCount, removedElement, previous );
		}

		if ( element.is( 'element' ) && element.childCount ) {
			moveNestedListToListItem( element, writer );
		}
	}
}

function isList( element ) {
	return element.is( 'element', 'ol' ) || element.is( 'element', 'ul' );
}
