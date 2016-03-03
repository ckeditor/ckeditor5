/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Element from './element.js';
import Text from './text.js';
import Range from './range.js';
import utils from '../utils.js';
import CKEditorError from '../ckeditorerror.js';

/**
 * Tree model Writer class.
 *
 * @memberOf core.treeModel
 */
 export default class Writer {
	constructor() {
		/**
		 * Priorities map. Maps node to priority.
		 * Nodes with priorities are considered as attributes.
		 *
		 * @member {WeakMap} core.treeView.Writer#_priorities
         * @protected
         */
		this._priorities = new WeakMap();
	}

	/**
	 * Returns true if provided node is a container node.
	 *
	 * @param {core.treeView.Element} node
	 * @returns {Boolean}
     */
	isContainer( node ) {
		const isElement = node instanceof Element;

		return isElement && !this._priorities.has( node );
	}

	/**
	 * Returns true if provided node is an attribute node.
	 *
	 * @param {core.treeView.Element} node
	 * @returns {Boolean}
	 */
	isAttribute( node ) {
		const isElement = node instanceof Element;

		return isElement && this._priorities.has( node );
	}

	/**
	 * Sets node priority.
	 *
	 * @param {core.treeView.Node} node
	 * @param {Number} priority
     */
	setPriority( node, priority ) {
		this._priorities.set( node, priority );
	}

	/**
	 * Returns node's priority, undefined if node's priority cannot be found.
	 *
	 * @param {core.treeView.Node} node
	 * @returns {Number|undefined}
     */
	getPriority( node ) {
		return this._priorities.get( node );
	}

	/**
	 * Returns first parent container of specified position. Position's parent is checked as first, then
	 * next parent is checked. Returns null if no parent container can be found.
	 *
	 * @param {core.treeView.Position} position
	 * @returns {core.treeView.Element|null}
	 */
	getParentContainer( position ) {
		let parent = position.parent;

		while ( !this.isContainer( parent ) ) {
			if ( !parent ) {
				return null;
			}
			parent = parent.parent;
		}

		return parent;
	}

	/**
	 * Breaks attributes at provided position. Returns new position.
	 * Examples:
	 *        <p>foo<b><u>bar|</u></b></p> -> <p>foo<b><u>bar</u></b>|</p>
	 *        <p>foo<b><u>|bar</u></b></p> -> <p>foo|<b><u>bar</u></b></p>
	 *        <p>foo<b><u>b|ar</u></b></p> -> <p>foo<b><u>b</u></b>|<b><u>ar</u></b></p>
	 *
	 * @param {core.treeView.Position} position
	 * @returns {core.treeView.Position}
	 */
	breakAttributes( position ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// Position's parent is container, so no attributes to break.
		if ( this.isContainer( positionParent ) ) {
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

				// Clone priority.
				this.setPriority( clonedNode, this.getPriority( positionParent ) );

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
	 * Merges attribute nodes. It also merges text nodes if needed.
	 * Two attribute nodes can be merged into one when they are similar and have the same priority.
	 * Examples:
	 *        <p>{foo}|{bar}</p> -> <p>{foo|bar}</p>
	 *        <p><b></b>|<b></b> -> <p><b>|</b></b>
	 *        <p><b foo="bar"></b>|<b foo="baz"></b> -> <p><b foo="bar"></b>|<b foo="baz"></b>
	 *        <p><b></b><b></b> -> <p><b></b></b>
	 *        <p><b>{foo}</b>|<b>{bar}</b></p> -> <p><b>{foo|bar}</b>
	 *
	 * @param {core.treeView.Position} position Merge position.
	 * @returns {core.treeView.Position} Position after merge.
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
		if ( this.isContainer( nodeBefore ) || this.isContainer( nodeAfter ) ) {
			return position;
		}

		if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
			// When selection is between two text nodes.
			// Merge text data into first text node and remove second one.
			const nodeBeforeLength = nodeBefore.data.length;
			nodeBefore.data += nodeAfter.data;
			positionParent.removeChildren( positionOffset );

			return new Position( nodeBefore, nodeBeforeLength );
		} else if ( nodeBefore.same( nodeAfter ) ) {
			// When selection is between same nodes.
			const nodeBeforePriority = this._priorities.get( nodeBefore );
			const nodeAfterPriority = this._priorities.get( nodeAfter );

			// Do not merge same nodes with different priorities.
			if ( nodeBeforePriority === undefined || nodeBeforePriority !== nodeAfterPriority ) {
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
	 * and merging them after.
	 *
	 * @param {core.treeView.Position} position Insertion position.
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} nodes Node or nodes to insert.
	 */
	insert( position, nodes ) {
		const container = this.getParentContainer( position );
		const insertionPosition = this.breakAttributes( position );

		container.insertChildren( insertionPosition.offset, nodes );

		const length = utils.isIterable( nodes ) ? utils.count( nodes ) : 1;
		const endPosition = insertionPosition.getShiftedBy( length );

		this.mergeAttributes( endPosition );
		this.mergeAttributes( insertionPosition );
	}

	//removeFromContainer( range ) {
	//}
    //
	//// <p><u><b>"|"</b></u></p>
	//// <p><u><b>|</b></u></p>
	//// <p><u>|</u></p>
	//// <p>|</p>
	//removeEmptyAttributes( position ) {
	//}

	//// f[o]o -> f<b>o</b>o
	//// <b>f</b>[o]<b>o</b> -> <b>f</b><b>o</b><b>o</b> -> <b>foo</b>
	//// <b>f</b>o[o<u>bo]m</u> -> <b>f</b>o<b>o</b><u><b>bo</b>m</u>
	//// Range have to] be inside single container.

	/**
	 * Wraps range with provided attribute element. Range's start and end positions should be placed inside same
	 * container element. Method will wrap elements inside that container but wil not enter nested containers.
	 *
	 * Throws {@link core.CKEditorError} `treeview-writer-wrap-invalid-range` when {@link core.treeView.Range#end} and
	 * {@link core.treeView.Range#start} position are not placed inside same parent container node.
	 *
	 * @param range
	 * @param element
	 * @param priority
	 */
	wrap( range, element, priority ) {
		const rangeStart = range.start;
		const rangeEnd = range.end;

		// Range should be placed inside one container.
		if ( this.getParentContainer( rangeStart ) !== this.getParentContainer( rangeEnd ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-wrap-invalid-range
			 */
			throw new CKEditorError( 'treeview-writer-wrap-invalid-range' );
		}

		// If range is collapsed - nothing to wrap.
		if ( range.isCollapsed ) {
			return range;
		}

		// Sets wrapper element priority.
		this.setPriority( element, priority );

		// Break attributes at range start and end.
		const breakStart = this.breakAttributes( rangeStart );
		const breakEnd = this.breakAttributes( rangeEnd );
		const parentBlock = breakStart.parent;

		// Wrap range. Start collapsed.
		let wrapRange = new Range( breakStart, breakStart );

		// Iterate over all elements inside break points.
		for ( let i = breakStart.offset; i < breakEnd.offset; i++ ) {
			const child = parentBlock.getChild( i );

			if ( child instanceof Text ) {
				wrapRange.end.offset++;
			} else {
				// Don't enter container nodes. Wrap them.
				if ( this.isContainer( child ) ) {
					// mark as true to wrap
					wrapRange.end.offset++;
				} else {
					// if child is same as element - unwrap its contents
					if ( child.same( element ) && priority == this.getPriority( child ) ) {
						// unwrap
					} else {
						// scan elements children for the same atribute and check if cannot be changes to be at the top
						// if yes - unwrap it
						// if no mark this child as unable to wrap, go deeper and try to wrap.
					}
				}
			}
		}

		// Get nodes to move.
		const count = wrapRange.end.offset - wrapRange.start.offset;
		const nodesToMove = parentBlock.removeChildren( wrapRange.start.offset, count );
		//
		//// TODO: What if element already have some children?
		//element.insertChildren( 0, nodesToMove );
		//
		//// Insert wrapper with elements to parent container.
		//parentBlock.insertChildren( breakStart.offset, element );
		//
		//// Return new range around wrapper.
		//return new Range( breakStart, new Position( breakStart.parent , breakStart.offset + 1 ) );
	}

	/**
	 * Unwraps elements within provided range from element attribute. Range's start and end positions should be placed
	 * inside same  container element.
	 *
	 * Throws {@link core.CKEditorError} `treeview-writer-wrap-invalid-range` when {@link core.treeView.Range#end} and
	 * {@link core.treeView.Range#start} position are not placed inside same parent container node.
	 *
	 * @param range
	 * @param element
	 */
	unwrap( range, attribute ) {
		const rangeStart = range.start;
		const rangeEnd = range.end;

		// Range should be placed inside one container.
		if ( this.getParentContainer( rangeStart ) !== this.getParentContainer( rangeEnd ) ) {
			/**
			 * Range is not placed inside same container.
			 *
			 * @error treeview-writer-wrap-invalid-range
			 */
			throw new CKEditorError( 'treeview-writer-unwrap-invalid-range' );
		}

		// If range is collapsed - nothing to unwrap.
		if ( range.isCollapsed ) {
			return range;
		}

		// Break attributes at range start and end.
		const breakStart = this.breakAttributes( rangeStart );
		const breakEnd = this.breakAttributes( rangeEnd );
		const parentContainer = breakStart.parent;

		// Unwrap children located between break points.
		const newRange = this.unwrapChildren( parentContainer, breakStart.offset, breakEnd.offset, attribute );

		// Merge attributes at the both ends and return a new range.
		const start = this.mergeAttributes( newRange.start );
		// If start position was merged - move end position back.
		if ( !start.isEqual( newRange.start ) ) {
			newRange.end.offset--;
		}
		const end = this.mergeAttributes( newRange.end );

		return new Range( start, end );
	}

	unwrapChildren( parent, startOffset, endOffset, attribute ) {
		let i = startOffset;
		const unwrapPositions = [];

		// Iterate over each element between provided offsets inside parent.
		while ( i < endOffset ) {
			const child = parent.getChild( i );

			// If attributes are the same and have same priority, then unwrap.
			if (  child.same( attribute ) && this.getPriority( child ) == this.getPriority( attribute ) ) {
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
				// If nested attribute is found - start unwrapping there.
				if ( this.isAttribute( child ) ) {
					this.unwrapChildren( child, 0, child.getChildCount(), attribute );
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

			const newPosition = this.mergeAttributes( position );

			// If nodes were merged - other merge offsets will change.
			if ( !newPosition.isEqual( position ) ) {
				offsetChange++;
				endOffset--;
			}
		}

		return Range.createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
	}

}

// 1. If wrapper element is container - wrap everything with that container.
// 2. If wrapping with attribute element:
//		2.1. Take a child list.
//		2.2. Check if each node can be wrapped by provided element.
//		2.3a. If each node can be wrapped - wrap all nodes.
//		2.3b. If some nodes cannot be wrapped - wrap groups that can be wrapped.
//		2.4. For each node that could not be wrapped - go to step 2.1.

// <p>[foo<u>bar<c>baz<b>quz</b>toz</c>fli</u>bak]</p>

// 1. Wrapping with container.
// <div>[<p class="test">foobar</p><p>bazqux</p>]</div>
// 2. Wrapping containers:
// <article>[<p>foobar</p><p>bazqux</p>]</article>
// 3. Nested elements.
// <p>[foo<span>this is <u><b>bolded</b></u> text</span>foobar]</p>
