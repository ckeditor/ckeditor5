/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/br
 */

import {
	DomConverter,
	ViewDocument,
	type UpcastWriter,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewNode
} from 'ckeditor5/src/engine.js';

/**
 * Transforms `<br>` elements that are siblings to some block element into a paragraphs.
 *
 * @param documentFragment The view structure to be transformed.
 */
export default function transformBlockBrsToParagraphs(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): void {
	const viewDocument = new ViewDocument( writer.document.stylesProcessor );
	const domConverter = new DomConverter( viewDocument, { renderingMode: 'data' } );

	const blockElements = domConverter.blockElements;
	const inlineObjectElements = domConverter.inlineObjectElements;

	const elementsToReplace = [];

	for ( const value of writer.createRangeIn( documentFragment ) ) {
		const element = value.item;

		if ( element.is( 'element', 'br' ) ) {
			const nextSibling = findSibling( element, 'forward', writer, { blockElements, inlineObjectElements } );
			const previousSibling = findSibling( element, 'backward', writer, { blockElements, inlineObjectElements } );

			const nextSiblingIsBlock = isBlockViewElement( nextSibling, blockElements );
			const previousSiblingIsBlock = isBlockViewElement( previousSibling, blockElements );

			// If the <br> is surrounded by blocks then convert it to a paragraph:
			// * <p>foo</p>[<br>]<p>bar</p> -> <p>foo</p>[<p></p>]<p>bar</p>
			// * <p>foo</p>[<br>] -> <p>foo</p>[<p></p>]
			// * [<br>]<p>foo</p> -> [<p></p>]<p>foo</p>
			if ( previousSiblingIsBlock || nextSiblingIsBlock ) {
				elementsToReplace.push( element );
			}
		}
	}

	for ( const element of elementsToReplace ) {
		if ( element.hasClass( 'Apple-interchange-newline' ) ) {
			writer.remove( element );
		} else {
			writer.replace( element, writer.createElement( 'p' ) );
		}
	}
}

/**
 * Returns sibling node, threats inline elements as transparent (but should stop on an inline objects).
 */
function findSibling(
	viewElement: ViewElement,
	direction: 'forward' | 'backward',
	writer: UpcastWriter,
	{ blockElements, inlineObjectElements }: { blockElements: Array<string>; inlineObjectElements: Array<string> }
) {
	let position = writer.createPositionAt( viewElement, direction == 'forward' ? 'after' : 'before' );

	// Find first position that is just before a first:
	// * text node,
	// * block element,
	// * inline object element.
	// It's ignoring any inline (non-object) elements like span, strong, etc.
	position = position.getLastMatchingPosition( ( { item } ) => (
		item.is( 'element' ) &&
		!blockElements.includes( item.name ) &&
		!inlineObjectElements.includes( item.name )
	), { direction } );

	return direction == 'forward' ? position.nodeAfter : position.nodeBefore;
}

/**
 * Returns true for view elements that are listed as block view elements.
 */
function isBlockViewElement( node: ViewNode | null, blockElements: Array<string> ) {
	return !!node && node.is( 'element' ) && blockElements.includes( node.name );
}
