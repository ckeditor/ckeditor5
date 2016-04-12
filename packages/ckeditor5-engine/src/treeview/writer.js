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
	 *		<p>{foo}<b><u>{bar}|</u></b></p> -> <p>{foo}<b><u>{bar}</u></b>|</p>
	 *		<p>{foo}<b><u>|{bar}</u></b></p> -> <p>{foo}|<b><u>{bar}</u></b></p>
	 *		<p>{foo}<b><u>{b|ar}</u></b></p> -> <p>{foo}<b><u>{b}</u></b>|<b><u>{ar}</u></b></p>
	 *
	 * @see engine.treeView.Writer#isContainer
	 * @see engine.treeView.Writer#isAttribute
	 *
	 * @param {engine.treeView.Position} position Position where to break attributes.
	 * @returns {engine.treeView.Position} New position after breaking the attributes.
	 */
	breakAttributes( position ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// Position's parent is container, so no attributes to break.
		if ( positionParent instanceof ContainerElement ) {
			return Position.createFromPosition( position );
		}

		const parentIsText = positionParent instanceof Text;
		const length = parentIsText ? positionParent.data.length : positionParent.getChildCount();

		// <p>foo<b><u>bar|</u></b></p>
		// <p>foo<b><u>bar</u>|</b></p>
		// <p>foo<b><u>bar</u></b>|</p>
		if ( positionOffset == length ) {
			const newPosition = new Position( positionParent.parent, positionParent.getIndex() + 1 );

			return this.breakAttributes( newPosition );
		} else
		// <p>foo<b><u>|bar</u></b></p>
		// <p>foo<b>|<u>bar</u></b></p>
		// <p>foo|<b><u>bar</u></b></p>
		if ( positionOffset === 0 ) {
			const newPosition = new Position( positionParent.parent, positionParent.getIndex() );

			return this.breakAttributes( newPosition );
		}
		// <p>foo<b><u>"b|ar"</u></b></p>
		// <p>foo<b><u>"b"|"ar"</u></b></p>
		// <p>foo<b><u>b</u>|<u>ar</u></b></p>
		// <p>foo<b><u>b</u></b>|<b><u>ar</u></b></p>
		else {
			const offsetAfter = positionParent.getIndex() + 1;

			if ( parentIsText ) {
				// Break text.
				// Get part of the text that need to be moved.
				const textToMove = positionParent.data.slice( positionOffset );

				// Leave rest of the text in position's parent.
				positionParent.data = positionParent.data.slice( 0, positionOffset );

				// Insert new text node after position's parent text node.
				positionParent.parent.insertChildren( offsetAfter, new Text( textToMove ) );

				// Create new position to work on.
				const newPosition = new Position( positionParent.parent, offsetAfter );

				return this.breakAttributes( newPosition );
			} else {
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

				return this.breakAttributes( newPosition );
			}
		}
	}

	/**
	 * Uses {@link engine.treeView.Writer#breakAttributes breakAttribute} method to break attributes on
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
			const position = this.breakAttributes( range.start );

			return new Range( position, position );
		}

		const breakEnd = this.breakAttributes( rangeEnd );
		const count = breakEnd.parent.getChildCount();
		const breakStart = this.breakAttributes( rangeStart );

		// Calculate new break end offset.
		breakEnd.offset += breakEnd.parent.getChildCount() - count;

		return new Range( breakStart, breakEnd );
	}

	/**
	 * Merges attribute nodes. It also merges text nodes if needed.
	 * Only {@link engine.treeView.Element#isSimilar similar} `attribute` nodes, with same priority can be merged.
	 *
	 * In following examples `<p>` is a container and `<b>` is an attribute node:
	 *
	 *		<p>{foo}|{bar}</p> -> <p>{foo|bar}</p>
	 *		<p><b>{foo}</b>|<b>{bar}</b> -> <p><b>{foo|bar}</b></b>
	 *		<p><b foo="bar">{a}</b>|<b foo="baz">{b}</b> -> <p><b foo="bar">{a}</b>|<b foo="baz">{b}</b>
	 *
	 * @see engine.treeView.Writer#isContainer
	 * @see engine.treeView.Writer#isAttribute
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

		// When selection is between two text nodes.
		if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
			// Merge text data into first text node and remove second one.
			const nodeBeforeLength = nodeBefore.data.length;
			nodeBefore.data += nodeAfter.data;
			positionParent.removeChildren( positionOffset );

			return new Position( nodeBefore, nodeBeforeLength );
		}
		// When selection is between same nodes.
		else if ( nodeBefore.isSimilar( nodeAfter ) ) {
			// Do not merge same nodes with different priorities.
			if ( !( nodeBefore instanceof AttributeElement ) || nodeBefore.priority !== nodeAfter.priority ) {
				return Position.createFromPosition( position );
			}

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
	 * @param {engine.treeView.Position} position Insertion position.
	 * @param {engine.treeView.Node|Iterable.<engine.treeView.Node>} nodes Node or nodes to insert.
	 * @returns {engine.treeView.Range} Range around inserted nodes.
	 */
	insert( position, nodes ) {
		const container = this.getParentContainer( position );
		const insertionPosition = this.breakAttributes( position );

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
		const { start: breakStart, end: breakEnd } = this.breakRange( range );
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
	 * Wraps elements within range with provided attribute element.
	 *
	 * Throws {@link utils.CKEditorError} `treeview-writer-invalid-range-container` when {@link engine.treeView.Range#start}
	 * and {@link engine.treeView.Range#end} positions are not placed inside same parent container.
	 *
	 * @param {engine.treeView.Range} range Range to wrap.
	 * @param {engine.treeView.AttributeElement} attribute Attribute element to use as wrapper.
	 * @param {Number} priority Priority to set.
	 */
	wrap( range, attribute, priority ) {
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

		// Sets wrapper element priority.
		attribute.priority = priority;

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this.breakRange( range );
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

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this.breakRange( range );
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

		// If attributes are the similar and have same priority, then unwrap.
		if (  child.isSimilar( attribute ) && child.priority == attribute.priority ) {
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
