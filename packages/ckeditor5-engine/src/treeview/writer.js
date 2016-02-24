/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import utils from '../utils.js';

/**
 * @class treeView.Writer
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
	 * @param {treeView.Node} node
	 * @returns {Boolean}
     */
	isContainer( node ) {
		return !this._priorities.has( node );
	}

	/**
	 * Returns true if provided node is an attribute node.
	 *
	 * @param {treeView.Node} node
	 * @returns {Boolean}
	 */
	isAttribute( node ) {
		return this._priorities.has( node );
	}

	/**
	 * Sets node priority.
	 *
	 * @param {treeView.Node} node
	 * @param {Number} priority
     */
	setPriority( node, priority ) {
		this._priorities.set( node, priority );
	}

	/**
	 * Returns node's priority, undefined if node's priority cannot be found.
	 *
	 * @param {treeView.Node} node
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

	// return position
	breakAttributes( position ) {
		let positionOffset = position.offset;
		let positionParent = position.parent;

		if ( this.isContainer( positionParent ) ) {
			return position;
		}

		const parentIsText = positionParent instanceof Text;
		const length = parentIsText ? positionParent.data.length : positionParent.getChildCount();

		// <p>foo<b><u>bar|</u></b></p>
		// <p>foo<b><u>bar</u>|</b></p>
		// <p>foo<b><u>bar</u></b>|</p>
		if ( positionOffset == length ) {
			const parentPosition = new Position( positionParent.parent, positionParent.getIndex() + 1 );

			return this.breakAttributes( parentPosition );
		} else
		// <p>foo<b><u>|bar</u></b></p>
		// <p>foo<b>|<u>bar</u></b></p>
		// <p>foo|<b><u>bar</u></b></p>
		if ( positionOffset === 0 ) {
			const parentPosition = new Position( positionParent.parent, positionParent.getIndex() );

			return this.breakAttributes( parentPosition );
		}
		// <p>foo<b><u>"b|ar"</u></b></p>
		// <p>foo<b><u>"b"|"ar"</u></b></p>
		// <p>foo<b><u>b</u>|</u>ar</u></b></p>
		// <p>foo<b><u>b</u></b>|<b><u>ar</u></b></p>
		else {
			// Break.
			const offsetAfter = positionParent.getIndex() + 1;

			if ( parentIsText ) {
				// Break text.
				const textToMove = positionParent.data.slice( positionOffset );
				positionParent.data = positionParent.data.slice( 0, positionOffset );
				positionParent.parent.insertChildren( offsetAfter, new Text( textToMove ) );

				return new Position( positionParent.parent, offsetAfter );
			} else {
				// Break element.
				const nodeClone = positionParent.cloneNode();
				// Clone priority.
				this._priorities.set( nodeClone, this._priorities.get( positionParent ) );

				positionParent.parent.insertChildren( offsetAfter, nodeClone );

				//const nodesToMove = sourceElement.removeChildren( sourceOffset, this.howMany );

				//nodeClone.appendChildren( nodesToMove );

				return new Position( positionParent.parent, offsetAfter );
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
