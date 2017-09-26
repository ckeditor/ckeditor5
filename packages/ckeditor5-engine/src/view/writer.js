/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module module:engine/view/writer
 */

import Position from './position';
import ContainerElement from './containerelement';
import AttributeElement from './attributeelement';
import EmptyElement from './emptyelement';
import UIElement from './uielement';
import Text from './text';
import Range from './range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import DocumentFragment from './documentfragment';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * Contains functions used for composing view tree.
 *
 * @namespace writer
 */

const writer = {
	breakAttributes,
	breakContainer,
	mergeAttributes,
	mergeContainers,
	insert,
	remove,
	clear,
	move,
	wrap,
	wrapPosition,
	unwrap,
	rename
};

export default writer;

/**
 * Breaks attribute nodes at provided position or at boundaries of provided range. It breaks attribute elements inside
 * up to a container element.
 *
 * In following examples `<p>` is a container, `<b>` and `<u>` are attribute nodes:
 *
 *		<p>foo<b><u>bar{}</u></b></p> -> <p>foo<b><u>bar</u></b>[]</p>
 *		<p>foo<b><u>{}bar</u></b></p> -> <p>foo{}<b><u>bar</u></b></p>
 *		<p>foo<b><u>b{}ar</u></b></p> -> <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
 *		<p><b>fo{o</b><u>ba}r</u></p> -> <p><b>fo</b><b>o</b><u>ba</u><u>r</u></b></p>
 *
 * **Note:** {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
 *
 * **Note:** Difference between {@link module:engine/view/writer~writer.breakAttributes breakAttributes} and
 * {@link module:engine/view/writer~writer.breakContainer breakContainer} is that `breakAttributes` breaks all
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of given `position`, up to the first
 * encountered {@link module:engine/view/containerelement~ContainerElement container element}. `breakContainer` assumes that given
 * `position`
 * is directly in container element and breaks that container element.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container`
 * when {@link module:engine/view/range~Range#start start}
 * and {@link module:engine/view/range~Range#end end} positions of a passed range are not placed inside same parent container.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-empty-element`
 * when trying to break attributes
 * inside {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-ui-element`
 * when trying to break attributes
 * inside {@link module:engine/view/uielement~UIElement UIElement}.
 *
 * @see module:engine/view/attributeelement~AttributeElement
 * @see module:engine/view/containerelement~ContainerElement
 * @see module:engine/view/writer~writer.breakContainer
 * @function module:engine/view/writer~writer.breakAttributes
 * @param {module:engine/view/position~Position|module:engine/view/range~Range} positionOrRange Position where to break attribute elements.
 * @returns {module:engine/view/position~Position|module:engine/view/range~Range} New position or range, after breaking the attribute
 * elements.
 */
export function breakAttributes( positionOrRange ) {
	if ( positionOrRange instanceof Position ) {
		return _breakAttributes( positionOrRange );
	} else {
		return _breakAttributesRange( positionOrRange );
	}
}

/**
 * Breaks {@link module:engine/view/containerelement~ContainerElement container view element} into two, at the given position. Position
 * has to be directly inside container element and cannot be in root. Does not break if position is at the beginning
 * or at the end of it's parent element.
 *
 *		<p>foo^bar</p> -> <p>foo</p><p>bar</p>
 *		<div><p>foo</p>^<p>bar</p></div> -> <div><p>foo</p></div><div><p>bar</p></div>
 *		<p>^foobar</p> -> ^<p>foobar</p>
 *		<p>foobar^</p> -> <p>foobar</p>^
 *
 * **Note:** Difference between {@link module:engine/view/writer~writer.breakAttributes breakAttributes} and
 * {@link module:engine/view/writer~writer.breakContainer breakContainer} is that `breakAttributes` breaks all
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of given `position`, up to the first
 * encountered {@link module:engine/view/containerelement~ContainerElement container element}. `breakContainer` assumes that given
 * `position`
 * is directly in container element and breaks that container element.
 *
 * @see module:engine/view/attributeelement~AttributeElement
 * @see module:engine/view/containerelement~ContainerElement
 * @see module:engine/view/writer~writer.breakAttributes
 * @function module:engine/view/writer~writer.breakContainer
 * @param {module:engine/view/position~Position} position Position where to break element.
 * @returns {module:engine/view/position~Position} Position between broken elements. If element has not been broken, the returned position
 * is placed either before it or after it.
 */
export function breakContainer( position ) {
	const element = position.parent;

	if ( !( element.is( 'containerElement' ) ) ) {
		/**
		 * Trying to break an element which is not a container element.
		 *
		 * @error view-writer-break-non-container-element
		 */
		throw new CKEditorError( 'view-writer-break-non-container-element: Trying to break an element which is not a container element.' );
	}

	if ( !element.parent ) {
		/**
		 * Trying to break root element.
		 *
		 * @error view-writer-break-root
		 */
		throw new CKEditorError( 'view-writer-break-root: Trying to break root element.' );
	}

	if ( position.isAtStart ) {
		return Position.createBefore( element );
	} else if ( !position.isAtEnd ) {
		const newElement = element.clone( false );

		insert( Position.createAfter( element ), newElement );

		const sourceRange = new Range( position, Position.createAt( element, 'end' ) );
		const targetPosition = new Position( newElement, 0 );

		move( sourceRange, targetPosition );
	}

	return Position.createAfter( element );
}

/**
 * Merges {@link module:engine/view/attributeelement~AttributeElement attribute elements}. It also merges text nodes if needed.
 * Only {@link module:engine/view/attributeelement~AttributeElement#isSimilar similar} attribute elements can be merged.
 *
 * In following examples `<p>` is a container and `<b>` is an attribute element:
 *
 *		<p>foo[]bar</p> -> <p>foo{}bar</p>
 *		<p><b>foo</b>[]<b>bar</b></p> -> <p><b>foo{}bar</b></p>
 *		<p><b foo="bar">a</b>[]<b foo="baz">b</b></p> -> <p><b foo="bar">a</b>[]<b foo="baz">b</b></p>
 *
 * It will also take care about empty attributes when merging:
 *
 *		<p><b>[]</b></p> -> <p>[]</p>
 *		<p><b>foo</b><i>[]</i><b>bar</b></p> -> <p><b>foo{}bar</b></p>
 *
 * **Note:** Difference between {@link module:engine/view/writer~writer.mergeAttributes mergeAttributes} and
 * {@link module:engine/view/writer~writer.mergeContainers mergeContainers} is that `mergeAttributes` merges two
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
 *
 * @see module:engine/view/attributeelement~AttributeElement
 * @see module:engine/view/containerelement~ContainerElement
 * @see module:engine/view/writer~writer.mergeContainers
 * @function module:engine/view/writer~writer.mergeAttributes
 * @param {module:engine/view/position~Position} position Merge position.
 * @returns {module:engine/view/position~Position} Position after merge.
 */
export function mergeAttributes( position ) {
	const positionOffset = position.offset;
	const positionParent = position.parent;

	// When inside text node - nothing to merge.
	if ( positionParent.is( 'text' ) ) {
		return position;
	}

	// When inside empty attribute - remove it.
	if ( positionParent.is( 'attributeElement' ) && positionParent.childCount === 0 ) {
		const parent = positionParent.parent;
		const offset = positionParent.index;
		positionParent.remove();

		return mergeAttributes( new Position( parent, offset ) );
	}

	const nodeBefore = positionParent.getChild( positionOffset - 1 );
	const nodeAfter = positionParent.getChild( positionOffset );

	// Position should be placed between two nodes.
	if ( !nodeBefore || !nodeAfter ) {
		return position;
	}

	// When position is between two text nodes.
	if ( nodeBefore.is( 'text' ) && nodeAfter.is( 'text' ) ) {
		return mergeTextNodes( nodeBefore, nodeAfter );
	}
	// When selection is between two same attribute elements.
	else if ( nodeBefore.is( 'attributeElement' ) && nodeAfter.is( 'attributeElement' ) && nodeBefore.isSimilar( nodeAfter ) ) {
		// Move all children nodes from node placed after selection and remove that node.
		const count = nodeBefore.childCount;
		nodeBefore.appendChildren( nodeAfter.getChildren() );
		nodeAfter.remove();

		// New position is located inside the first node, before new nodes.
		// Call this method recursively to merge again if needed.
		return mergeAttributes( new Position( nodeBefore, count ) );
	}

	return position;
}

/**
 * Merges two {@link module:engine/view/containerelement~ContainerElement container elements} that are before and after given position.
 * Precisely, the element after the position is removed and it's contents are moved to element before the position.
 *
 *		<p>foo</p>^<p>bar</p> -> <p>foo^bar</p>
 *		<div>foo</div>^<p>bar</p> -> <div>foo^bar</div>
 *
 * **Note:** Difference between {@link module:engine/view/writer~writer.mergeAttributes mergeAttributes} and
 * {@link module:engine/view/writer~writer.mergeContainers mergeContainers} is that `mergeAttributes` merges two
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
 *
 * @see module:engine/view/attributeelement~AttributeElement
 * @see module:engine/view/containerelement~ContainerElement
 * @see module:engine/view/writer~writer.mergeAttributes
 * @function module:engine/view/writer~writer.mergeContainers
 * @param {module:engine/view/position~Position} position Merge position.
 * @returns {module:engine/view/position~Position} Position after merge.
 */
export function mergeContainers( position ) {
	const prev = position.nodeBefore;
	const next = position.nodeAfter;

	if ( !prev || !next || !prev.is( 'containerElement' ) || !next.is( 'containerElement' ) ) {
		/**
		 * Element before and after given position cannot be merged.
		 *
		 * @error view-writer-merge-containers-invalid-position
		 */
		throw new CKEditorError( 'view-writer-merge-containers-invalid-position: ' +
			'Element before and after given position cannot be merged.' );
	}

	const lastChild = prev.getChild( prev.childCount - 1 );
	const newPosition = lastChild instanceof Text ? Position.createAt( lastChild, 'end' ) : Position.createAt( prev, 'end' );

	move( Range.createIn( next ), Position.createAt( prev, 'end' ) );
	remove( Range.createOn( next ) );

	return newPosition;
}

/**
 * Insert node or nodes at specified position. Takes care about breaking attributes before insertion
 * and merging them afterwards.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
 * contains instances that are not {@link module:engine/view/text~Text Texts},
 * {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
 * {@link module:engine/view/containerelement~ContainerElement ContainerElements},
 * {@link module:engine/view/emptyelement~EmptyElement EmptyElements} or
 * {@link module:engine/view/uielement~UIElement UIElements}.
 *
 * @function insert
 * @param {module:engine/view/position~Position} position Insertion position.
 * @param {module:engine/view/text~Text|module:engine/view/attributeelement~AttributeElement|
 * module:engine/view/containerelement~ContainerElement|module:engine/view/emptyelement~EmptyElement|
 * module:engine/view/uielement~UIElement|Iterable.<module:engine/view/text~Text|
 * module:engine/view/attributeelement~AttributeElement|module:engine/view/containerelement~ContainerElement|
 * module:engine/view/emptyelement~EmptyElement|module:engine/view/uielement~UIElement>} nodes Node or nodes to insert.
 * @returns {module:engine/view/range~Range} Range around inserted nodes.
 */
export function insert( position, nodes ) {
	nodes = isIterable( nodes ) ? [ ...nodes ] : [ nodes ];

	// Check if nodes to insert are instances of AttributeElements, ContainerElements, EmptyElements, UIElements or Text.
	validateNodesToInsert( nodes );

	const container = getParentContainer( position );

	if ( !container ) {
		/**
		 * Position's parent container cannot be found.
		 *
		 * @error view-writer-invalid-position-container
		 */
		throw new CKEditorError( 'view-writer-invalid-position-container' );
	}

	const insertionPosition = _breakAttributes( position, true );

	const length = container.insertChildren( insertionPosition.offset, nodes );
	const endPosition = insertionPosition.getShiftedBy( length );
	const start = mergeAttributes( insertionPosition );

	// When no nodes were inserted - return collapsed range.
	if ( length === 0 ) {
		return new Range( start, start );
	} else {
		// If start position was merged - move end position.
		if ( !start.isEqual( insertionPosition ) ) {
			endPosition.offset--;
		}

		const end = mergeAttributes( endPosition );

		return new Range( start, end );
	}
}

/**
 * Removes provided range from the container.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
 * same parent container.
 *
 * @function module:engine/view/writer~writer.remove
 * @param {module:engine/view/range~Range} range Range to remove from container. After removing, it will be updated
 * to a collapsed range showing the new position.
 * @returns {module:engine/view/documentfragment~DocumentFragment} Document fragment containing removed nodes.
 */
export function remove( range ) {
	validateRangeContainer( range );

	// If range is collapsed - nothing to remove.
	if ( range.isCollapsed ) {
		return new DocumentFragment();
	}

	// Break attributes at range start and end.
	const { start: breakStart, end: breakEnd } = _breakAttributesRange( range, true );
	const parentContainer = breakStart.parent;

	const count = breakEnd.offset - breakStart.offset;

	// Remove nodes in range.
	const removed = parentContainer.removeChildren( breakStart.offset, count );

	// Merge after removing.
	const mergePosition = mergeAttributes( breakStart );
	range.start = mergePosition;
	range.end = Position.createFromPosition( mergePosition );

	// Return removed nodes.
	return new DocumentFragment( removed );
}

/**
 * Removes matching elements from given range.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
 * same parent container.
 *
 * @function module:engine/view/writer~writer.clear
 * @param {module:engine/view/range~Range} range Range to clear.
 * @param {module:engine/view/element~Element} element Element to remove.
 */
export function clear( range, element ) {
	validateRangeContainer( range );

	// Create walker on given range.
	// We walk backward because when we remove element during walk it modifies range end position.
	const walker = range.getWalker( {
		direction: 'backward',
		ignoreElementEnd: true
	} );

	// Let's walk.
	for ( const current of walker ) {
		const item = current.item;
		let rangeToRemove;

		// When current item matches to the given element.
		if ( item.is( 'element' ) && element.isSimilar( item ) ) {
			// Create range on this element.
			rangeToRemove = Range.createOn( item );
		// When range starts inside Text or TextProxy element.
		} else if ( !current.nextPosition.isAfter( range.start ) && ( item.is( 'text' ) || item.is( 'textProxy' ) ) ) {
			// We need to check if parent of this text matches to given element.
			const parentElement = item.getAncestors().find( ancestor => {
				return ancestor.is( 'element' ) && element.isSimilar( ancestor );
			} );

			// If it is then create range inside this element.
			if ( parentElement ) {
				rangeToRemove = Range.createIn( parentElement );
			}
		}

		// If we have found element to remove.
		if ( rangeToRemove ) {
			// We need to check if element range stick out of the given range and truncate if it is.
			if ( rangeToRemove.end.isAfter( range.end ) ) {
				rangeToRemove.end = range.end;
			}

			if ( rangeToRemove.start.isBefore( range.start ) ) {
				rangeToRemove.start = range.start;
			}

			// At the end we remove range with found element.
			remove( rangeToRemove );
		}
	}
}

/**
 * Moves nodes from provided range to target position.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
 * same parent container.
 *
 * @function module:engine/view/writer~writer.move
 * @param {module:engine/view/range~Range} sourceRange Range containing nodes to move.
 * @param {module:engine/view/position~Position} targetPosition Position to insert.
 * @returns {module:engine/view/range~Range} Range in target container. Inserted nodes are placed between
 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions.
 */
export function move( sourceRange, targetPosition ) {
	let nodes;

	if ( targetPosition.isAfter( sourceRange.end ) ) {
		targetPosition = _breakAttributes( targetPosition, true );

		const parent = targetPosition.parent;
		const countBefore = parent.childCount;

		sourceRange = _breakAttributesRange( sourceRange, true );

		nodes = remove( sourceRange );

		targetPosition.offset += ( parent.childCount - countBefore );
	} else {
		nodes = remove( sourceRange );
	}

	return insert( targetPosition, nodes );
}

/**
 * Wraps elements within range with provided {@link module:engine/view/attributeelement~AttributeElement AttributeElement}.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-invalid-range-container`
 * when {@link module:engine/view/range~Range#start}
 * and {@link module:engine/view/range~Range#end} positions are not placed inside same parent container.
 * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
 * an instance of {module:engine/view/attributeelement~AttributeElement AttributeElement}.
 *
 * @function module:engine/view/writer~writer.wrap
 * @param {module:engine/view/range~Range} range Range to wrap.
 * @param {module:engine/view/attributeelement~AttributeElement} attribute Attribute element to use as wrapper.
 */
export function wrap( range, attribute ) {
	if ( !( attribute instanceof AttributeElement ) ) {
		throw new CKEditorError( 'view-writer-wrap-invalid-attribute' );
	}

	validateRangeContainer( range );

	// If range is collapsed - nothing to wrap.
	if ( range.isCollapsed ) {
		return range;
	}

	// Range around one element.
	if ( range.end.isEqual( range.start.getShiftedBy( 1 ) ) ) {
		const node = range.start.nodeAfter;

		if ( node instanceof AttributeElement && wrapAttributeElement( attribute, node ) ) {
			return range;
		}
	}

	// Range is inside single attribute and spans on all children.
	if ( rangeSpansOnAllChildren( range ) && wrapAttributeElement( attribute, range.start.parent ) ) {
		const parent = range.start.parent.parent;
		const index = range.start.parent.index;

		return Range.createFromParentsAndOffsets( parent, index, parent, index + 1 );
	}

	// Break attributes at range start and end.
	const { start: breakStart, end: breakEnd } = _breakAttributesRange( range, true );
	const parentContainer = breakStart.parent;

	// Unwrap children located between break points.
	const unwrappedRange = unwrapChildren( parentContainer, breakStart.offset, breakEnd.offset, attribute );

	// Wrap all children with attribute.
	const newRange = wrapChildren( parentContainer, unwrappedRange.start.offset, unwrappedRange.end.offset, attribute );

	// Merge attributes at the both ends and return a new range.
	const start = mergeAttributes( newRange.start );

	// If start position was merged - move end position back.
	if ( !start.isEqual( newRange.start ) ) {
		newRange.end.offset--;
	}
	const end = mergeAttributes( newRange.end );

	return new Range( start, end );
}

/**
 * Wraps position with provided attribute. Returns new position after wrapping. This method will also merge newly
 * added attribute with its siblings whenever possible.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
 * an instance of {module:engine/view/attributeelement~AttributeElement AttributeElement}.
 *
 * @param {module:engine/view/position~Position} position
 * @param {module:engine/view/attributeelement~AttributeElement} attribute
 * @returns {module:engine/view/position~Position} New position after wrapping.
 */
export function wrapPosition( position, attribute ) {
	if ( !( attribute instanceof AttributeElement ) ) {
		throw new CKEditorError( 'view-writer-wrap-invalid-attribute' );
	}

	// Return same position when trying to wrap with attribute similar to position parent.
	if ( attribute.isSimilar( position.parent ) ) {
		return movePositionToTextNode( Position.createFromPosition( position ) );
	}

	// When position is inside text node - break it and place new position between two text nodes.
	if ( position.parent.is( 'text' ) ) {
		position = breakTextNode( position );
	}

	// Create fake element that will represent position, and will not be merged with other attributes.
	const fakePosition = new AttributeElement();
	fakePosition.priority = Number.POSITIVE_INFINITY;
	fakePosition.isSimilar = () => false;

	// Insert fake element in position location.
	position.parent.insertChildren( position.offset, fakePosition );

	// Range around inserted fake attribute element.
	const wrapRange = new Range( position, position.getShiftedBy( 1 ) );

	// Wrap fake element with attribute (it will also merge if possible).
	wrap( wrapRange, attribute );

	// Remove fake element and place new position there.
	const newPosition = new Position( fakePosition.parent, fakePosition.index );
	fakePosition.remove();

	// If position is placed between text nodes - merge them and return position inside.
	const nodeBefore = newPosition.nodeBefore;
	const nodeAfter = newPosition.nodeAfter;

	if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
		return mergeTextNodes( nodeBefore, nodeAfter );
	}

	// If position is next to text node - move position inside.
	return movePositionToTextNode( newPosition );
}

/**
 * Unwraps nodes within provided range from attribute element.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
 * same parent container.
 *
 * @param {module:engine/view/range~Range} range
 * @param {module:engine/view/attributeelement~AttributeElement} element
 */
export function unwrap( range, attribute ) {
	if ( !( attribute instanceof AttributeElement ) ) {
		/**
		 * Attribute element need to be instance of attribute element.
		 *
		 * @error view-writer-unwrap-invalid-attribute
		 */
		throw new CKEditorError( 'view-writer-unwrap-invalid-attribute' );
	}

	validateRangeContainer( range );

	// If range is collapsed - nothing to unwrap.
	if ( range.isCollapsed ) {
		return range;
	}

	// Range around one element - check if AttributeElement can be unwrapped partially when it's not similar.
	// For example:
	// <b class="foo bar" title="baz"></b> unwrap with:	<b class="foo"></p> result: <b class"bar" title="baz"></b>
	if ( range.end.isEqual( range.start.getShiftedBy( 1 ) ) ) {
		const node = range.start.nodeAfter;

		// Unwrap single attribute element.
		if ( !attribute.isSimilar( node ) && node instanceof AttributeElement && unwrapAttributeElement( attribute, node ) ) {
			return range;
		}
	}

	// Break attributes at range start and end.
	const { start: breakStart, end: breakEnd } = _breakAttributesRange( range, true );
	const parentContainer = breakStart.parent;

	// Unwrap children located between break points.
	const newRange = unwrapChildren( parentContainer, breakStart.offset, breakEnd.offset, attribute );

	// Merge attributes at the both ends and return a new range.
	const start = mergeAttributes( newRange.start );

	// If start position was merged - move end position back.
	if ( !start.isEqual( newRange.start ) ) {
		newRange.end.offset--;
	}
	const end = mergeAttributes( newRange.end );

	return new Range( start, end );
}

/**
 * Renames element by creating a copy of renamed element but with changed name and then moving contents of the
 * old element to the new one. Keep in mind that this will invalidate all {@link module:engine/view/position~Position positions} which
 * has renamed element as {@link module:engine/view/position~Position#parent a parent}.
 *
 * New element has to be created because `Element#tagName` property in DOM is readonly.
 *
 * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
 *
 * @param {module:engine/view/containerelement~ContainerElement} viewElement Element to be renamed.
 * @param {String} newName New name for element.
 */
export function rename( viewElement, newName ) {
	const newElement = new ContainerElement( newName, viewElement.getAttributes() );

	insert( Position.createAfter( viewElement ), newElement );
	move( Range.createIn( viewElement ), Position.createAt( newElement ) );
	remove( Range.createOn( viewElement ) );

	return newElement;
}

/**
 * Attribute element need to be instance of attribute element.
 *
 * @error view-writer-wrap-invalid-attribute
 */

// Returns first parent container of specified {@link module:engine/view/position~Position Position}.
// Position's parent node is checked as first, then next parents are checked.
// Note that {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
//
// @param {module:engine/view/position~Position} position Position used as a start point to locate parent container.
// @returns {module:engine/view/containerelement~ContainerElement|module:engine/view/documentfragment~DocumentFragment|undefined}
// Parent container element or `undefined` if container is not found.
function getParentContainer( position ) {
	let parent = position.parent;

	while ( !isContainerOrFragment( parent ) ) {
		if ( !parent ) {
			return undefined;
		}
		parent = parent.parent;
	}

	return parent;
}

// Function used by both public breakAttributes (without splitting text nodes) and by other methods (with
// splitting text nodes).
//
// @param {module:engine/view/range~Range} range Range which `start` and `end` positions will be used to break attributes.
// @param {Boolean} [forceSplitText = false] If set to `true`, will break text nodes even if they are directly in
// container element. This behavior will result in incorrect view state, but is needed by other view writing methods
// which then fixes view state. Defaults to `false`.
// @returns {module:engine/view/range~Range} New range with located at break positions.
function _breakAttributesRange( range, forceSplitText = false ) {
	const rangeStart = range.start;
	const rangeEnd = range.end;

	validateRangeContainer( range );

	// Break at the collapsed position. Return new collapsed range.
	if ( range.isCollapsed ) {
		const position = _breakAttributes( range.start, forceSplitText );

		return new Range( position, position );
	}

	const breakEnd = _breakAttributes( rangeEnd, forceSplitText );
	const count = breakEnd.parent.childCount;
	const breakStart = _breakAttributes( rangeStart, forceSplitText );

	// Calculate new break end offset.
	breakEnd.offset += breakEnd.parent.childCount - count;

	return new Range( breakStart, breakEnd );
}

// Function used by public breakAttributes (without splitting text nodes) and by other methods (with
// splitting text nodes).
//
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-empty-element` when break position
// is placed inside {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
//
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-ui-element` when break position
// is placed inside {@link module:engine/view/uielement~UIElement UIElement}.
//
// @param {module:engine/view/position~Position} position Position where to break attributes.
// @param {Boolean} [forceSplitText = false] If set to `true`, will break text nodes even if they are directly in
// container element. This behavior will result in incorrect view state, but is needed by other view writing methods
// which then fixes view state. Defaults to `false`.
// @returns {module:engine/view/position~Position} New position after breaking the attributes.
function _breakAttributes( position, forceSplitText = false ) {
	const positionOffset = position.offset;
	const positionParent = position.parent;

	// If position is placed inside EmptyElement - throw an exception as we cannot break inside.
	if ( position.parent.is( 'emptyElement' ) ) {
		/**
		 * Cannot break inside EmptyElement instance.
		 *
		 * @error view-writer-cannot-break-empty-element
		 */
		throw new CKEditorError( 'view-writer-cannot-break-empty-element' );
	}

	// If position is placed inside UIElement - throw an exception as we cannot break inside.
	if ( position.parent.is( 'uiElement' ) ) {
		/**
		 * Cannot break inside UIElement instance.
		 *
		 * @error view-writer-cannot-break-ui-element
		 */
		throw new CKEditorError( 'view-writer-cannot-break-ui-element' );
	}

	// There are no attributes to break and text nodes breaking is not forced.
	if ( !forceSplitText && positionParent.is( 'text' ) && isContainerOrFragment( positionParent.parent ) ) {
		return Position.createFromPosition( position );
	}

	// Position's parent is container, so no attributes to break.
	if ( isContainerOrFragment( positionParent ) ) {
		return Position.createFromPosition( position );
	}

	// Break text and start again in new position.
	if ( positionParent.is( 'text' ) ) {
		return _breakAttributes( breakTextNode( position ), forceSplitText );
	}

	const length = positionParent.childCount;

	// <p>foo<b><u>bar{}</u></b></p>
	// <p>foo<b><u>bar</u>[]</b></p>
	// <p>foo<b><u>bar</u></b>[]</p>
	if ( positionOffset == length ) {
		const newPosition = new Position( positionParent.parent, positionParent.index + 1 );

		return _breakAttributes( newPosition, forceSplitText );
	} else
	// <p>foo<b><u>{}bar</u></b></p>
	// <p>foo<b>[]<u>bar</u></b></p>
	// <p>foo{}<b><u>bar</u></b></p>
	if ( positionOffset === 0 ) {
		const newPosition = new Position( positionParent.parent, positionParent.index );

		return _breakAttributes( newPosition, forceSplitText );
	}
	// <p>foo<b><u>b{}ar</u></b></p>
	// <p>foo<b><u>b[]ar</u></b></p>
	// <p>foo<b><u>b</u>[]<u>ar</u></b></p>
	// <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
	else {
		const offsetAfter = positionParent.index + 1;

		// Break element.
		const clonedNode = positionParent.clone();

		// Insert cloned node to position's parent node.
		positionParent.parent.insertChildren( offsetAfter, clonedNode );

		// Get nodes to move.
		const count = positionParent.childCount - positionOffset;
		const nodesToMove = positionParent.removeChildren( positionOffset, count );

		// Move nodes to cloned node.
		clonedNode.appendChildren( nodesToMove );

		// Create new position to work on.
		const newPosition = new Position( positionParent.parent, offsetAfter );

		return _breakAttributes( newPosition, forceSplitText );
	}
}

// Unwraps children from provided `attribute`. Only children contained in `parent` element between
// `startOffset` and `endOffset` will be unwrapped.
//
// @param {module:engine/view/element~Element} parent
// @param {Number} startOffset
// @param {Number} endOffset
// @param {module:engine/view/element~Element} attribute
function unwrapChildren( parent, startOffset, endOffset, attribute ) {
	let i = startOffset;
	const unwrapPositions = [];

	// Iterate over each element between provided offsets inside parent.
	while ( i < endOffset ) {
		const child = parent.getChild( i );

		// If attributes are the similar, then unwrap.
		if ( child.isSimilar( attribute ) ) {
			const unwrapped = child.getChildren();
			const count = child.childCount;

			// Replace wrapper element with its children
			child.remove();
			parent.insertChildren( i, unwrapped );

			// Save start and end position of moved items.
			unwrapPositions.push(
				new Position( parent, i ),
				new Position( parent, i + count )
			);

			// Skip elements that were unwrapped. Assuming that there won't be another element to unwrap in child
			// elements.
			i += count;
			endOffset += count - 1;
		} else {
			// If other nested attribute is found start unwrapping there.
			if ( child.is( 'attributeElement' ) ) {
				unwrapChildren( child, 0, child.childCount, attribute );
			}

			i++;
		}
	}

	// Merge at each unwrap.
	let offsetChange = 0;

	for ( const position of unwrapPositions ) {
		position.offset -= offsetChange;

		// Do not merge with elements outside selected children.
		if ( position.offset == startOffset || position.offset == endOffset ) {
			continue;
		}

		const newPosition = mergeAttributes( position );

		// If nodes were merged - other merge offsets will change.
		if ( !newPosition.isEqual( position ) ) {
			offsetChange++;
			endOffset--;
		}
	}

	return Range.createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
}

// Wraps children with provided `attribute`. Only children contained in `parent` element between
// `startOffset` and `endOffset` will be wrapped.
//
// @param {module:engine/view/element~Element} parent
// @param {Number} startOffset
// @param {Number} endOffset
// @param {module:engine/view/element~Element} attribute
function wrapChildren( parent, startOffset, endOffset, attribute ) {
	let i = startOffset;
	const wrapPositions = [];

	while ( i < endOffset ) {
		const child = parent.getChild( i );
		const isText = child.is( 'text' );
		const isAttribute = child.is( 'attributeElement' );
		const isEmpty = child.is( 'emptyElement' );
		const isUI = child.is( 'uiElement' );

		// Wrap text, empty elements, ui elements or attributes with higher or equal priority.
		if ( isText || isEmpty || isUI || ( isAttribute && shouldABeOutsideB( attribute, child ) ) ) {
			// Clone attribute.
			const newAttribute = attribute.clone();

			// Wrap current node with new attribute;
			child.remove();
			newAttribute.appendChildren( child );
			parent.insertChildren( i, newAttribute );

			wrapPositions.push(	new Position( parent, i ) );
		}
		// If other nested attribute is found start wrapping there.
		else if ( isAttribute ) {
			wrapChildren( child, 0, child.childCount, attribute );
		}

		i++;
	}

	// Merge at each wrap.
	let offsetChange = 0;

	for ( const position of wrapPositions ) {
		position.offset -= offsetChange;

		// Do not merge with elements outside selected children.
		if ( position.offset == startOffset ) {
			continue;
		}

		const newPosition = mergeAttributes( position );

		// If nodes were merged - other merge offsets will change.
		if ( !newPosition.isEqual( position ) ) {
			offsetChange++;
			endOffset--;
		}
	}

	return Range.createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
}

// Checks if first {@link module:engine/view/attributeelement~AttributeElement AttributeElement} provided to the function
// can be wrapped otuside second element. It is done by comparing elements'
// {@link module:engine/view/attributeelement~AttributeElement#priority priorities}, if both have same priority
// {@link module:engine/view/element~Element#getIdentity identities} are compared.
//
// @param {module:engine/view/attributeelement~AttributeElement} a
// @param {module:engine/view/attributeelement~AttributeElement} b
// @returns {Boolean}
function shouldABeOutsideB( a, b ) {
	if ( a.priority < b.priority ) {
		return true;
	} else if ( a.priority > b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use identities.
	return a.getIdentity() < b.getIdentity();
}

// Returns new position that is moved to near text node. Returns same position if there is no text node before of after
// specified position.
//
//		<p>foo[]</p>  ->  <p>foo{}</p>
//		<p>[]foo</p>  ->  <p>{}foo</p>
//
// @param {module:engine/view/position~Position} position
// @returns {module:engine/view/position~Position} Position located inside text node or same position if there is no text nodes
// before or after position location.
function movePositionToTextNode( position ) {
	const nodeBefore = position.nodeBefore;

	if ( nodeBefore && nodeBefore.is( 'text' ) ) {
		return new Position( nodeBefore, nodeBefore.data.length );
	}

	const nodeAfter = position.nodeAfter;

	if ( nodeAfter && nodeAfter.is( 'text' ) ) {
		return new Position( nodeAfter, 0 );
	}

	return position;
}

// Breaks text node into two text nodes when possible.
//
//		<p>foo{}bar</p> -> <p>foo[]bar</p>
//		<p>{}foobar</p> -> <p>[]foobar</p>
//		<p>foobar{}</p> -> <p>foobar[]</p>
//
// @param {module:engine/view/position~Position} position Position that need to be placed inside text node.
// @returns {module:engine/view/position~Position} New position after breaking text node.
function breakTextNode( position ) {
	if ( position.offset == position.parent.data.length ) {
		return new Position( position.parent.parent, position.parent.index + 1 );
	}

	if ( position.offset === 0 ) {
		return new Position( position.parent.parent, position.parent.index );
	}

	// Get part of the text that need to be moved.
	const textToMove = position.parent.data.slice( position.offset );

	// Leave rest of the text in position's parent.
	position.parent.data = position.parent.data.slice( 0, position.offset );

	// Insert new text node after position's parent text node.
	position.parent.parent.insertChildren( position.parent.index + 1, new Text( textToMove ) );

	// Return new position between two newly created text nodes.
	return new Position( position.parent.parent, position.parent.index + 1 );
}

// Merges two text nodes into first node. Removes second node and returns merge position.
//
// @param {module:engine/view/text~Text} t1 First text node to merge. Data from second text node will be moved at the end of
// this text node.
// @param {module:engine/view/text~Text} t2 Second text node to merge. This node will be removed after merging.
// @returns {module:engine/view/position~Position} Position after merging text nodes.
function mergeTextNodes( t1, t2 ) {
	// Merge text data into first text node and remove second one.
	const nodeBeforeLength = t1.data.length;
	t1.data += t2.data;
	t2.remove();

	return new Position( t1, nodeBeforeLength );
}

// Wraps one {@link module:engine/view/attributeelement~AttributeElement AttributeElement} into another by merging them if possible.
// When merging is possible - all attributes, styles and classes are moved from wrapper element to element being
// wrapped.
//
// @param {module:engine/view/attributeelement~AttributeElement} wrapper Wrapper AttributeElement.
// @param {module:engine/view/attributeelement~AttributeElement} toWrap AttributeElement to wrap using wrapper element.
// @returns {Boolean} Returns `true` if elements are merged.
function wrapAttributeElement( wrapper, toWrap ) {
	// Can't merge if name or priority differs.
	if ( wrapper.name !== toWrap.name || wrapper.priority !== toWrap.priority ) {
		return false;
	}

	// Check if attributes can be merged.
	for ( const key of wrapper.getAttributeKeys() ) {
		// Classes and styles should be checked separately.
		if ( key === 'class' || key === 'style' ) {
			continue;
		}

		// If some attributes are different we cannot wrap.
		if ( toWrap.hasAttribute( key ) && toWrap.getAttribute( key ) !== wrapper.getAttribute( key ) ) {
			return false;
		}
	}

	// Check if styles can be merged.
	for ( const key of wrapper.getStyleNames() ) {
		if ( toWrap.hasStyle( key ) && toWrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
			return false;
		}
	}

	// Move all attributes/classes/styles from wrapper to wrapped AttributeElement.
	for ( const key of wrapper.getAttributeKeys() ) {
		// Classes and styles should be checked separately.
		if ( key === 'class' || key === 'style' ) {
			continue;
		}

		// Move only these attributes that are not present - other are similar.
		if ( !toWrap.hasAttribute( key ) ) {
			toWrap.setAttribute( key, wrapper.getAttribute( key ) );
		}
	}

	for ( const key of wrapper.getStyleNames() ) {
		if ( !toWrap.hasStyle( key ) ) {
			toWrap.setStyle( key, wrapper.getStyle( key ) );
		}
	}

	for ( const key of wrapper.getClassNames() ) {
		if ( !toWrap.hasClass( key ) ) {
			toWrap.addClass( key );
		}
	}

	return true;
}

// Unwraps {@link module:engine/view/attributeelement~AttributeElement AttributeElement} from another by removing corresponding attributes,
// classes and styles. All attributes, classes and styles from wrapper should be present inside element being unwrapped.
//
// @param {module:engine/view/attributeelement~AttributeElement} wrapper Wrapper AttributeElement.
// @param {module:engine/view/attributeelement~AttributeElement} toUnwrap AttributeElement to unwrap using wrapper element.
// @returns {Boolean} Returns `true` if elements are unwrapped.
function unwrapAttributeElement( wrapper, toUnwrap ) {
	// Can't unwrap if name or priority differs.
	if ( wrapper.name !== toUnwrap.name || wrapper.priority !== toUnwrap.priority ) {
		return false;
	}

	// Check if AttributeElement has all wrapper attributes.
	for ( const key of wrapper.getAttributeKeys() ) {
		// Classes and styles should be checked separately.
		if ( key === 'class' || key === 'style' ) {
			continue;
		}

		// If some attributes are missing or different we cannot unwrap.
		if ( !toUnwrap.hasAttribute( key ) || toUnwrap.getAttribute( key ) !== wrapper.getAttribute( key ) ) {
			return false;
		}
	}

	// Check if AttributeElement has all wrapper classes.
	if ( !toUnwrap.hasClass( ...wrapper.getClassNames() ) ) {
		return false;
	}

	// Check if AttributeElement has all wrapper styles.
	for ( const key of wrapper.getStyleNames() ) {
		// If some styles are missing or different we cannot unwrap.
		if ( !toUnwrap.hasStyle( key ) || toUnwrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
			return false;
		}
	}

	// Remove all wrapper's attributes from unwrapped element.
	for ( const key of wrapper.getAttributeKeys() ) {
		// Classes and styles should be checked separately.
		if ( key === 'class' || key === 'style' ) {
			continue;
		}

		toUnwrap.removeAttribute( key );
	}

	// Remove all wrapper's classes from unwrapped element.
	toUnwrap.removeClass( ...wrapper.getClassNames() );

	// Remove all wrapper's styles from unwrapped element.
	toUnwrap.removeStyle( ...wrapper.getStyleNames() );

	return true;
}

// Returns `true` if range is located in same {@link module:engine/view/attributeelement~AttributeElement AttributeElement}
// (`start` and `end` positions are located inside same {@link module:engine/view/attributeelement~AttributeElement AttributeElement}),
// starts on 0 offset and ends after last child node.
//
// @param {module:engine/view/range~Range} Range
// @returns {Boolean}
function rangeSpansOnAllChildren( range ) {
	return range.start.parent == range.end.parent && range.start.parent.is( 'attributeElement' ) &&
		range.start.offset === 0 && range.end.offset === range.start.parent.childCount;
}

// Checks if provided nodes are valid to insert. Checks if each node is an instance of
// {@link module:engine/view/text~Text Text} or {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
// {@link module:engine/view/containerelement~ContainerElement ContainerElement},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElement} or
// {@link module:engine/view/uielement~UIElement UIElement}.
//
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
// contains instances that are not {@link module:engine/view/text~Text Texts},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElements},
// {@link module:engine/view/uielement~UIElement UIElements},
// {@link module:engine/view/attributeelement~AttributeElement AttributeElements} or
// {@link module:engine/view/containerelement~ContainerElement ContainerElements}.
//
// @param Iterable.<module:engine/view/text~Text|module:engine/view/attributeelement~AttributeElement
// |module:engine/view/containerelement~ContainerElement> nodes
function validateNodesToInsert( nodes ) {
	for ( const node of nodes ) {
		if ( !validNodesToInsert.some( ( validNode => node instanceof validNode ) ) ) { // eslint-disable-line no-use-before-define
			/**
			 * Inserted nodes should be valid to insert. of {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
			 * {@link module:engine/view/containerelement~ContainerElement ContainerElement},
			 * {@link module:engine/view/emptyelement~EmptyElement EmptyElement},
			 * {@link module:engine/view/uielement~UIElement UIElement}, {@link module:engine/view/text~Text Text}.
			 *
			 * @error view-writer-insert-invalid-node
			 */
			throw new CKEditorError( 'view-writer-insert-invalid-node' );
		}

		if ( !node.is( 'text' ) ) {
			validateNodesToInsert( node.getChildren() );
		}
	}
}

const validNodesToInsert = [ Text, AttributeElement, ContainerElement, EmptyElement, UIElement ];

// Checks if node is ContainerElement or DocumentFragment, because in most cases they should be treated the same way.
//
// @param {module:engine/view/node~Node} node
// @returns {Boolean} Returns `true` if node is instance of ContainerElement or DocumentFragment.
function isContainerOrFragment( node ) {
	return node && ( node.is( 'containerElement' ) || node.is( 'documentFragment' ) );
}

// Checks if {@link module:engine/view/range~Range#start range start} and {@link module:engine/view/range~Range#end range end} are placed
// inside same {@link module:engine/view/containerelement~ContainerElement container element}.
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when validation fails.
//
// @param {module:engine/view/range~Range} range
function validateRangeContainer( range ) {
	const startContainer = getParentContainer( range.start );
	const endContainer = getParentContainer( range.end );

	if ( !startContainer || !endContainer || startContainer !== endContainer ) {
		/**
		 * Range container is invalid. This can happen if {@link module:engine/view/range~Range#start range start} and
		 * {@link module:engine/view/range~Range#end range end} positions are not placed inside same container or
		 * parent container for these positions cannot be found.
		 *
		 * @error view-writer-invalid-range-container
		 */
		throw new CKEditorError( 'view-writer-invalid-range-container' );
	}
}
