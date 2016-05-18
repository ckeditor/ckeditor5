/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import ContainerElement from './containerelement.js';
import AttributeElement from './attributeelement.js';
import Text from './text.js';
import Range from './range.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import DocumentFragment from './documentfragment.js';
import isIterable from '../../utils/isiterable.js';

/**
 * Tree View Writer class.
 * Writer defines a high-level API for TreeView manipulations.
 *
 * @memberOf engine.treeView
 */
 export default class Writer {
	/**
	 * Returns first parent container of specified {@link engine.treeView.Position Position}.
	 * Position's parent node is checked as first, then next parents are checked.
	 *
	 * @param {engine.treeView.Position} position Position used as a start point to locate parent container.
	 * @returns {engine.treeView.Element|undefined} Parent container element or `undefined` if container is not found.
	 */
	getParentContainer( position ) {
		let parent = position.parent;

		while ( !( parent instanceof ContainerElement ) ) {
			if ( !parent ) {
				return undefined;
			}
			parent = parent.parent;
		}

		return parent;
	}

	/**
	 * Breaks attribute nodes at provided position. It breaks `attribute` nodes inside `container` node.
	 *
	 * In following examples `<p>` is a container, `<b>` and `<u>` are attribute nodes:
	 *
	 *		<p>foo<b><u>bar{}</u></b></p> -> <p>foo<b><u>bar</u></b>[]</p>
	 *		<p>foo<b><u>{}bar</u></b></p> -> <p>foo{}<b><u>bar</u></b></p>
	 *		<p>foo<b><u>b{}ar</u></b></p> -> <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
	 *
	 * @see engine.treeView.AttributeElement
	 * @see engine.treeView.ContainerElement
	 * @param {engine.treeView.Position} position Position where to break attributes.
	 * @returns {engine.treeView.Position} New position after breaking the attributes.
	 */
	breakAttributes( position ) {
		return this._breakAttributes( position, false );
	}

	/**
	 * Private method used by both public breakAttributes (without splitting text nodes) and by other methods (with
	 * splitting text nodes).
	 *
	 * @private
	 * @param {engine.treeView.Position} position Position where to break attributes.
	 * @param {Boolean} [forceSplitText = false] If set to `true`, will break text nodes even if they are directly in
	 * container element. This behavior will result in incorrect view state, but is needed by other `Writer` methods
	 * which then fixes view state. Defaults to `false`.
	 * @returns {engine.treeView.Position} New position after breaking the attributes.
	 */
	_breakAttributes( position, forceSplitText = false ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// There are no attributes to break and text nodes breaking is not forced.
		if ( !forceSplitText && positionParent instanceof Text && positionParent.parent instanceof ContainerElement ) {
			return Position.createFromPosition( position );
		}

		// Position's parent is container, so no attributes to break.
		if ( positionParent instanceof ContainerElement ) {
			return Position.createFromPosition( position );
		}

		// Break text and start again in new position.
		if ( positionParent instanceof Text ) {
			return this._breakAttributes( breakTextNode( position ), forceSplitText );
		}

		const length = positionParent.getChildCount();

		// <p>foo<b><u>bar{}</u></b></p>
		// <p>foo<b><u>bar</u>[]</b></p>
		// <p>foo<b><u>bar</u></b>[]</p>
		if ( positionOffset == length ) {
			const newPosition = new Position( positionParent.parent, positionParent.getIndex() + 1 );

			return this._breakAttributes( newPosition, forceSplitText );
		} else
		// <p>foo<b><u>{}bar</u></b></p>
		// <p>foo<b>[]<u>bar</u></b></p>
		// <p>foo{}<b><u>bar</u></b></p>
		if ( positionOffset === 0 ) {
			const newPosition = new Position( positionParent.parent, positionParent.getIndex() );

			return this._breakAttributes( newPosition, forceSplitText );
		}
		// <p>foo<b><u>b{}ar</u></b></p>
		// <p>foo<b><u>b[]ar</u></b></p>
		// <p>foo<b><u>b</u>[]<u>ar</u></b></p>
		// <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
		else {
			const offsetAfter = positionParent.getIndex() + 1;

			// Break element.
			const clonedNode = positionParent.clone();

			// Insert cloned node to position's parent node.
			positionParent.parent.insertChildren( offsetAfter, clonedNode );

			// Get nodes to move.
			const count = positionParent.getChildCount() - positionOffset;
			const nodesToMove = positionParent.removeChildren( positionOffset, count );

			// Move nodes to cloned node.
			clonedNode.appendChildren( nodesToMove );

			// Create new position to work on.
			const newPosition = new Position( positionParent.parent, offsetAfter );

			return this._breakAttributes( newPosition, forceSplitText );
		}
	}

	/**
	 * Uses {@link engine.treeView.Writer#breakAttributes breakAttributes} method to break attributes on
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions of
	 * provided {@link engine.treeView.Range Range}.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-invalid-range-container` when
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @see engine.treeView.Writer#breakAttribute
	 * @param {engine.treeView.Range} range Range which `start` and `end` positions will be used to break attributes.
	 * @returns {engine.treeView.Range} New range with located at break positions.
	 */
	breakRange( range ) {
		return this._breakRange( range );
	}

	/**
	 * Private method used by both public breakRange (without splitting text nodes) and by other methods (with
	 * splitting text nodes).
	 *
	 * @private
	 * @see engine.treeView.Writer#_breakAttribute
	 * @param {engine.treeView.Range} range Range which `start` and `end` positions will be used to break attributes.
	 * @param {Boolean} [forceSplitText = false] If set to `true`, will break text nodes even if they are directly in
	 * container element. This behavior will result in incorrect view state, but is needed by other `Writer` methods
	 * which then fixes view state. Defaults to `false`.
	 * @returns {engine.treeView.Range} New range with located at break positions.
	 */
	_breakRange( range, forceSplitText = false ) {
		const rangeStart = range.start;
		const rangeEnd = range.end;

		// Range should be placed inside one container.
		if ( this.getParentContainer( rangeStart ) !== this.getParentContainer( rangeEnd ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-invalid-range-container
			 */
			throw new CKEditorError( 'treeview-writer-invalid-range-container' );
		}

		// Break at the collapsed position. Return new collapsed range.
		if ( range.isCollapsed ) {
			const position = this._breakAttributes( range.start, forceSplitText );

			return new Range( position, position );
		}

		const breakEnd = this._breakAttributes( rangeEnd, forceSplitText );
		const count = breakEnd.parent.getChildCount();
		const breakStart = this._breakAttributes( rangeStart, forceSplitText );

		// Calculate new break end offset.
		breakEnd.offset += breakEnd.parent.getChildCount() - count;

		return new Range( breakStart, breakEnd );
	}

	/**
	 * Merges attribute nodes. It also merges text nodes if needed.
	 * Only {@link engine.treeView.AttributeElement#isSimilar similar} `attribute` nodes can be merged.
	 *
	 * In following examples `<p>` is a container and `<b>` is an attribute node:
	 *
	 *		<p>foo[]bar</p> -> <p>foo{}bar</p>
	 *		<p><b>foo</b>[]<b>bar</b> -> <p><b>foo{}bar</b></b>
	 *		<p><b foo="bar">a</b>[]<b foo="baz">b</b> -> <p><b foo="bar">a</b>[]<b foo="baz">b</b>
	 *
	 * @see engine.treeView.AttributeElement
	 * @see engine.treeView.ContainerElement
	 * @param {engine.treeView.Position} position Merge position.
	 * @returns {engine.treeView.Position} Position after merge.
	 */
	mergeAttributes( position ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// When inside text node - nothing to merge.
		if ( positionParent instanceof Text ) {
			return position;
		}

		const nodeBefore = positionParent.getChild( positionOffset - 1 );
		const nodeAfter = positionParent.getChild( positionOffset );

		// Position should be placed between two nodes.
		if ( !nodeBefore || !nodeAfter ) {
			return position;
		}

		// When one or both nodes are containers - no attributes to merge.
		if ( ( nodeBefore instanceof ContainerElement ) || ( nodeAfter instanceof ContainerElement ) ) {
			return position;
		}

		// When position is between two text nodes.
		if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
			return mergeTextNodes( nodeBefore, nodeAfter );
		}

		// When selection is between same nodes.
		else if ( nodeBefore.isSimilar( nodeAfter ) ) {
			// Move all children nodes from node placed after selection and remove that node.
			const count = nodeBefore.getChildCount();
			nodeBefore.appendChildren( nodeAfter.getChildren() );
			nodeAfter.remove();

			// New position is located inside the first node, before new nodes.
			// Call this method recursively to merge again if needed.
			return this.mergeAttributes( new Position( nodeBefore, count ) );
		}

		return position;
	}

	/**
	 * Insert node or nodes at specified position. Takes care about breaking attributes before insertion
	 * and merging them afterwards.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-insert-invalid-node` when nodes to insert
	 * contains instances that are not {@link engine.treeView.Text Texts},
	 * {@link engine.treeView.AttributeElement AttributeElements} or
	 * {@link engine.treeView.ContainerElement ContainerElements}.
	 *
	 * @param {engine.treeView.Position} position Insertion position.
	 * @param {engine.treeView.Text|engine.treeView.AttributeElement|engine.treeView.ContainerElement
	 * |Iterable.<engine.treeView.Text|engine.treeView.AttributeElement|engine.treeView.ContainerElement>} nodes Node or
	 * nodes to insert.
	 * @returns {engine.treeView.Range} Range around inserted nodes.
	 */
	insert( position, nodes ) {
		nodes = isIterable( nodes ) ? [ ...nodes ] : [ nodes ];

		// Check if nodes to insert are instances of AttributeElements, ContainerElements or Text.
		validateNodesToInsert( nodes );

		const container = this.getParentContainer( position );
		const insertionPosition = this._breakAttributes( position, true );

		const length = container.insertChildren( insertionPosition.offset, nodes );
		const endPosition = insertionPosition.getShiftedBy( length );
		const start = this.mergeAttributes( insertionPosition );

		// When no nodes were inserted - return collapsed range.
		if ( length === 0 ) {
			return new Range( start, start );
		} else {
			// If start position was merged - move end position.
			if ( !start.isEqual( insertionPosition ) ) {
				endPosition.offset--;
			}

			const end = this.mergeAttributes( endPosition );

			return new Range( start, end );
		}
	}

	/**
	 * Removes provided range from the container.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-invalid-range-container` when
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {engine.treeView.Range} range Range to remove from container. After removing, it will be updated
	 * to a collapsed range showing the new position.
	 * @returns {engine.treeView.DocumentFragment} Document fragment containing removed nodes.
	 */
	remove( range ) {
		// Range should be placed inside one container.
		if ( this.getParentContainer( range.start ) !== this.getParentContainer( range.end ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-invalid-range-container
			 */
			throw new CKEditorError( 'treeview-writer-invalid-range-container' );
		}

		// If range is collapsed - nothing to remove.
		if ( range.isCollapsed ) {
			return new DocumentFragment();
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakRange( range, true );
		const parentContainer = breakStart.parent;

		const count = breakEnd.offset - breakStart.offset;

		// Remove nodes in range.
		const removed = parentContainer.removeChildren( breakStart.offset, count );

		// Merge after removing.
		const mergePosition = this.mergeAttributes( breakStart );
		range.start = mergePosition;
		range.end = Position.createFromPosition( mergePosition );

		// Return removed nodes.
		return new DocumentFragment( removed );
	}

	/**
	 * Moves nodes from provided range to target position.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-invalid-range-container` when
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {engine.treeView.Range} sourceRange Range containing nodes to move.
	 * @param {engine.treeView.Position} targetPosition Position to insert.
	 * @returns {engine.treeView.Range} Range in target container. Inserted nodes are placed between
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions.
	 */
	move( sourceRange, targetPosition ) {
		const nodes = this.remove( sourceRange );

		return this.insert( targetPosition, nodes );
	}

	/**
	 * Wraps elements within range with provided {@link engine.treeView.AttributeElement AttributeElement}.
	 *
	 * Throws {@link utils.CKEditorError} `treeview-writer-invalid-range-container` when {@link engine.treeView.Range#start}
	 * and {@link engine.treeView.Range#end} positions are not placed inside same parent container.
	 * Throws {@link utils.CKEditorError} `treeview-writer-wrap-invalid-attribute` when passed attribute element is not
	 * an instance of {engine.treeView.AttributeElement AttributeElement}.
	 *
	 * @param {engine.treeView.Range} range Range to wrap.
	 * @param {engine.treeView.AttributeElement} attribute Attribute element to use as wrapper.
	 */
	wrap( range, attribute ) {
		if ( !( attribute instanceof AttributeElement ) ) {
			/**
			 * Attribute element need to be instance of attribute element.
			 *
			 * @error treeview-writer-wrap-invalid-attribute
			 */
			throw new CKEditorError( 'treeview-writer-wrap-invalid-attribute' );
		}

		// Range should be placed inside one container.
		if ( this.getParentContainer( range.start ) !== this.getParentContainer( range.end ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-invalid-range-container
			 */
			throw new CKEditorError( 'treeview-writer-invalid-range-container' );
		}

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
			const index = range.start.parent.getIndex();

			return Range.createFromParentsAndOffsets( parent, index, parent, index + 1 ) ;
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakRange( range, true );
		const parentContainer = breakStart.parent;

		// Unwrap children located between break points.
		const unwrappedRange = unwrapChildren( this, parentContainer, breakStart.offset, breakEnd.offset, attribute );

		// Wrap all children with attribute.
		const newRange = wrapChildren( this, parentContainer, unwrappedRange.start.offset, unwrappedRange.end.offset, attribute );

		// Merge attributes at the both ends and return a new range.
		const start = this.mergeAttributes( newRange.start );

		// If start position was merged - move end position back.
		if ( !start.isEqual( newRange.start ) ) {
			newRange.end.offset--;
		}
		const end = this.mergeAttributes( newRange.end );

		return new Range( start, end );
	}

	/**
	 * Wraps position with provided attribute. Returns new position after wrapping. This method will also merge newly
	 * added attribute with its siblings whenever possible.
	 *
	 * Throws {@link utils.CKEditorError} `treeview-writer-wrap-invalid-attribute` when passed attribute element is not
	 * an instance of {engine.treeView.AttributeElement AttributeElement}.
	 *
	 * @param {engine.treeView.Position} position
	 * @param {engine.treeView.AttributeElement} attribute
	 * @returns {Position} New position after wrapping.
	 */
	wrapPosition( position, attribute ) {
		if ( !( attribute instanceof AttributeElement ) ) {
			/**
			 * Attribute element need to be instance of attribute element.
			 *
			 * @error treeview-writer-wrap-invalid-attribute
			 */
			throw new CKEditorError( 'treeview-writer-wrap-invalid-attribute' );
		}

		// Return same position when trying to wrap with attribute similar to position parent.
		if ( attribute.isSimilar( position.parent ) ) {
			return movePositionToTextNode( Position.createFromPosition( position ) );
		}

		// When position is inside text node - break it and place new position between two text nodes.
		if ( position.parent instanceof Text ) {
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
		this.wrap( wrapRange, attribute );

		// Remove fake element and place new position there.
		const newPosition = new Position( fakePosition.parent, fakePosition.getIndex() );
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
	 * Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-invalid-range-container` when
	 * {@link engine.treeView.Range#start start} and {@link engine.treeView.Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {engine.treeView.Range} range
	 * @param {engine.treeView.AttributeElement} element
	 */
	unwrap( range, attribute ) {
		if ( !( attribute instanceof AttributeElement ) ) {
			/**
			 * Attribute element need to be instance of attribute element.
			 *
			 * @error treeview-writer-unwrap-invalid-attribute
			 */
			throw new CKEditorError( 'treeview-writer-unwrap-invalid-attribute' );
		}

		// Range should be placed inside one container.
		if ( this.getParentContainer( range.start ) !== this.getParentContainer( range.end ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-invalid-range-container
			 */
			throw new CKEditorError( 'treeview-writer-invalid-range-container' );
		}

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
		const { start: breakStart, end: breakEnd } = this._breakRange( range, true );
		const parentContainer = breakStart.parent;

		// Unwrap children located between break points.
		const newRange = unwrapChildren( this, parentContainer, breakStart.offset, breakEnd.offset, attribute );

		// Merge attributes at the both ends and return a new range.
		const start = this.mergeAttributes( newRange.start );

		// If start position was merged - move end position back.
		if ( !start.isEqual( newRange.start ) ) {
			newRange.end.offset--;
		}
		const end = this.mergeAttributes( newRange.end );

		return new Range( start, end );
	}
}

// Unwraps children from provided `attribute`. Only children contained in `parent` element between
// `startOffset` and `endOffset` will be unwrapped.
//
// @private
// @param {engine.treeView.Writer} writer
// @param {engine.treeView.Element} parent
// @param {Number} startOffset
// @param {Number} endOffset
// @param {engine.treeView.Element} attribute
function unwrapChildren( writer, parent, startOffset, endOffset, attribute ) {
	let i = startOffset;
	const unwrapPositions = [];

	// Iterate over each element between provided offsets inside parent.
	while ( i < endOffset ) {
		const child = parent.getChild( i );

		// If attributes are the similar, then unwrap.
		if (  child.isSimilar( attribute ) ) {
			const unwrapped = child.getChildren();
			const count = child.getChildCount();

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
			if ( child instanceof AttributeElement ) {
				unwrapChildren( writer, child, 0, child.getChildCount(), attribute );
			}

			i++;
		}
	}

	// Merge at each unwrap.
	let offsetChange = 0;

	for ( let position of unwrapPositions ) {
		position.offset -= offsetChange;

		// Do not merge with elements outside selected children.
		if ( position.offset == startOffset || position.offset == endOffset ) {
			continue;
		}

		const newPosition = writer.mergeAttributes( position );

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

// @private
// @param {engine.treeView.Writer} writer
// @param {engine.treeView.Element} parent
// @param {Number} startOffset
// @param {Number} endOffset
// @param {engine.treeView.Element} attribute
function wrapChildren( writer, parent, startOffset, endOffset, attribute ) {
	let i = startOffset;
	const wrapPositions = [];

	while ( i < endOffset ) {
		const child = parent.getChild( i );
		const isText = child instanceof Text;
		const isAttribute = child instanceof AttributeElement;

		// Wrap text or attributes with higher or equal priority.
		if ( isText || ( isAttribute && attribute.priority <= child.priority ) ) {
			// Clone attribute.
			const newAttribute = attribute.clone();

			// Wrap current node with new attribute;
			child.remove();
			newAttribute.appendChildren( child );
			parent.insertChildren( i, newAttribute );

			wrapPositions.push(	new Position( parent, i ) );
		} else {
			// If other nested attribute is found start wrapping there.
			if ( child instanceof AttributeElement ) {
				wrapChildren( writer, child, 0, child.getChildCount(), attribute );
			}
		}

		i++;
	}

	// Merge at each wrap.
	let offsetChange = 0;

	for ( let position of wrapPositions ) {
		// Do not merge with elements outside selected children.
		if ( position.offset == startOffset ) {
			continue;
		}

		const newPosition = writer.mergeAttributes( position );

		// If nodes were merged - other merge offsets will change.
		if ( !newPosition.isEqual( position ) ) {
			offsetChange++;
			endOffset--;
		}
	}

	return Range.createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
}

// Returns new position that is moved to near text node. Returns same position if there is no text node before of after
// specified position.
//
//		<p>foo[]</p>  ->  <p>foo{}</p>
//		<p>[]foo</p>  ->  <p>{}foo</p>
//
// @private
// @param {engine.treeView.Position} position
// @returns {engine.treeView.Position} Position located inside text node or same position if there is no text nodes
// before or after position location.
function movePositionToTextNode( position ) {
	const nodeBefore = position.nodeBefore;

	if ( nodeBefore && nodeBefore instanceof Text ) {
		return new Position( nodeBefore, nodeBefore.data.length );
	}

	const nodeAfter = position.nodeAfter;

	if ( nodeAfter && nodeAfter instanceof Text ) {
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
// @private
// @param {engine.treeView.Position} position Position that need to be placed inside text node.
// @returns {engine.treeView.Position} New position after breaking text node.
function breakTextNode( position ) {
	if ( position.offset == position.parent.data.length ) {
		return new Position( position.parent.parent, position.parent.getIndex() + 1 );
	}

	if ( position.offset === 0 ) {
		return new Position( position.parent.parent, position.parent.getIndex() );
	}

	// Get part of the text that need to be moved.
	const textToMove = position.parent.data.slice( position.offset );

	// Leave rest of the text in position's parent.
	position.parent.data = position.parent.data.slice( 0, position.offset );

	// Insert new text node after position's parent text node.
	position.parent.parent.insertChildren( position.parent.getIndex() + 1, new Text( textToMove ) );

	// Return new position between two newly created text nodes.
	return new Position( position.parent.parent, position.parent.getIndex() + 1 );
}

// Merges two text nodes into first node. Removes second node and returns merge position.
//
// @private
// @param {engine.treeView.Text} t1 First text node to merge. Data from second text node will be moved at the end of
// this text node.
// @param {engine.treeView.Text} t2 Second text node to merge. This node will be removed after merging.
// @returns {engine.treeView.Position} Position after merging text nodes.
function mergeTextNodes( t1, t2 ) {
	// Merge text data into first text node and remove second one.
	const nodeBeforeLength = t1.data.length;
	t1.data += t2.data;
	t2.remove();

	return new Position( t1, nodeBeforeLength );
}

// Wraps one {@link engine.treeView.AttributeElement AttributeElement} into another by merging them if possible.
// Two AttributeElements can be merged when there is no attribute or style conflicts between them.
// When merging is possible - all attributes, styles and classes are moved from wrapper element to element being
// wrapped.
//
// @private
// @param {engine.treeView.AttributeElement} wrapper Wrapper AttributeElement.
// @param {engine.treeView.AttributeElement} toWrap AttributeElement to wrap using wrapper element.
// @returns {Boolean} Returns `true` if elements are merged.
function wrapAttributeElement( wrapper, toWrap ) {
	// Can't merge if name or priority differs.
	if ( wrapper.name !== toWrap.name || wrapper.priority !== toWrap.priority ) {
		return false;
	}

	// Check if attributes can be merged.
	for ( let key of wrapper.getAttributeKeys() ) {
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
	for ( let key of wrapper.getStyleNames() ) {
		if ( toWrap.hasStyle( key ) && toWrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
			return false;
		}
	}

	// Move all attributes/classes/styles from wrapper to wrapped AttributeElement.
	for ( let key of wrapper.getAttributeKeys() ) {
		// Classes and styles should be checked separately.
		if ( key === 'class' || key === 'style' ) {
			continue;
		}

		// Move only these attributes that are not present - other are similar.
		if ( !toWrap.hasAttribute( key ) ) {
			toWrap.setAttribute( key, wrapper.getAttribute( key ) );
		}
	}

	for ( let key of wrapper.getStyleNames() ) {
		if ( !toWrap.hasStyle( key ) ) {
			toWrap.setStyle( key, wrapper.getStyle( key ) );
		}
	}

	for ( let key of wrapper.getClassNames() ) {
		if ( !toWrap.hasClass( key ) ) {
			toWrap.addClass( key );
		}
	}

	return true;
}

// Unwraps {@link engine.treeView.AttributeElement AttributeElement} from another by removing corresponding attributes,
// classes and styles. All attributes, classes and styles from wrapper should be present inside element being unwrapped.
//
// @private
// @param {engine.treeView.AttributeElement} wrapper Wrapper AttributeElement.
// @param {engine.treeView.AttributeElement} toUnwrap AttributeElement to unwrap using wrapper element.
// @returns {Boolean} Returns `true` if elements are unwrapped.
function unwrapAttributeElement( wrapper, toUnwrap ) {
	// Can't unwrap if name or priority differs.
	if ( wrapper.name !== toUnwrap.name || wrapper.priority !== toUnwrap.priority ) {
		return false;
	}

	// Check if AttributeElement has all wrapper attributes.
	for ( let key of wrapper.getAttributeKeys() ) {
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
	for ( let key of wrapper.getStyleNames() ) {
		// If some styles are missing or different we cannot unwrap.
		if ( !toUnwrap.hasStyle( key ) || toUnwrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
			return false;
		}
	}

	// Remove all wrapper's attributes from unwrapped element.
	for ( let key of wrapper.getAttributeKeys() ) {
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

// Returns `true` if range is located in same {@link engine.treeView.AttributeElement AttributeElement}
// (`start` and `end` positions are located inside same {@link engine.treeView.AttributeElement AttributeElement}),
// starts on 0 offset and ends after last child node.
//
// @private
// @param {engine.treeView.Range} Range
// @returns {Boolean}
function rangeSpansOnAllChildren( range ) {
	return range.start.parent == range.end.parent && range.start.parent instanceof AttributeElement &&
		range.start.offset === 0 && range.end.offset === range.start.parent.getChildCount();
}

// Checks if provided nodes are valid to insert by writer. Checks if each node is an instance of
// {@link engine.treeView.Text Text} or {@link engine.treeView.AttributeElement AttributeElement} or
// {@link engine.treeView.ContainerElement ContainerElement}.
//
// Throws {@link utils.CKEditorError CKEditorError} `treeview-writer-insert-invalid-node` when nodes to insert
// contains instances that are not {@link engine.treeView.Text Texts},
// {@link engine.treeView.AttributeElement AttributeElements} or
// {@link engine.treeView.ContainerElement ContainerElements}.
//
// @private
// @param Iterable.<engine.treeView.Text|engine.treeView.AttributeElement|engine.treeView.ContainerElement> nodes
function validateNodesToInsert( nodes ) {
	for ( let node of nodes ) {
		if ( !( node instanceof Text || node instanceof AttributeElement || node instanceof ContainerElement ) ) {
			/**
			 * Inserted nodes should be instance of {@link engine.treeView.AttributeElement AttributeElement},
			 * {@link engine.treeView.ContainerElement ContainerElement} or {@link engine.treeView.Text Text}.
			 *
			 * @error treeview-writer-insert-invalid-node
			 */
			throw new CKEditorError( 'treeview-writer-insert-invalid-node' );
		}

		if ( !( node instanceof Text ) ) {
			validateNodesToInsert( node.getChildren() );
		}
	}
}
