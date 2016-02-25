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

	// Should also merge text nodes
	mergeAttributes( position ) {
		let offset = position.offset;
		let parentNode = position.parent;

		if ( parentNode instanceof Text ) {
			return position;
		}

		let nodeBefore = parentNode.getChild( offset - 1 );
		let nodeAfter = parentNode.getChild( offset );

		if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
			const nodeBeforeLength = nodeBefore.data.length;

			nodeBefore.data += nodeAfter.data;
			parentNode.removeChildren( offset );

			return new Position( nodeBefore, nodeBeforeLength );
		} else if ( nodeBefore.same( nodeAfter ) ) {
			const nodeBeforePriority = this._priorities.get( nodeBefore );
			const nodeAfterPriority = this._priorities.get( nodeAfter );

			if ( nodeBeforePriority === undefined || nodeBeforePriority !== nodeAfterPriority ) {
				return position;
			}

			nodeBefore.appendChildren( nodeAfter.getChildren() );

			nodeAfter.remove();
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
