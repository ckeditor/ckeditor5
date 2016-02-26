/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Element from './element.js';
import Text from './text.js';
import utils from '../utils.js';

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

	insertIntoContainer( position, nodes ) {
		const container = this.getParentContainer( position );

		const insertionPosition = this.breakAttributes( position, container );

		container.insertChildren( insertionPosition, nodes );

		const length = utils.isIterable( nodes ) ? utils.count( nodes ) : 1;
		const endPosition = insertionPosition.getShiftedBy( length );

		this.mergeAttributes( endPosition );
		this.mergeAttributes( insertionPosition );
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
				const nodeClone = positionParent.clone();

				// Clone priority.
				this.setPriority( nodeClone, this.getPriority( positionParent ) );

				// Insert cloned node to position's parent node.
				positionParent.parent.insertChildren( offsetAfter, nodeClone );

				// Get nodes to move.
				const count = positionParent.getChildCount() - positionOffset;
				const nodesToMove = positionParent.removeChildren( positionOffset, count );

				// Move nodes to cloned node.
				nodeClone.appendChildren( nodesToMove );

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

	//removeFromContainer( range ) {
	//}
    //
	//// <p><u><b>"|"</b></u></p>
	//// <p><u><b>|</b></u></p>
	//// <p><u>|</u></p>
	//// <p>|</p>
	//removeEmptyAttributes( position ) {
	//}
    //
	//// f[o]o -> f<b>o</b>o
	//// <b>f</b>[o]<b>o</b> -> <b>f</b><b>o</b><b>o</b> -> <b>foo</b>
	//// <b>f</b>o[o<u>bo]m</u> -> <b>f</b>o<b>o</b><u><b>bo</b>m</u>
	//// Range have to] be inside single container.
	//wrap( range, element, priority ) {
	//	// this._priorities.set( element, priority );
	//}
    //
	//unwrap( range, element ) {
	//}
}
