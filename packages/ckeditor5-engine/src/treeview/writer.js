/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * @class treeView.Writer
 */
 export default class Writer {
	constructor() {
		this._priorities = new WeakMap();
	}

	isContainer( node ) {
		return !this._priorities.has( node );
	}

	isAttribute( node ) {
		return this._priorities.has( node );
	}

	getPriority( node ) {
		return this._priorities.get( node );
	}

	insertIntoContainer( position, nodes ) {
		const container = getParentContainer( position );

		const insertionPosition = this.breakAttributes( position, container );

		container.insertChildren( insertionPosition, nodes );

		const length = utils.isIterable( nodes ) ? utils.getIterableCount( nodes ) : 1;
		const endPosition = insertionPosition.getShiftedBy( length );

		this.mergeAttributes( endPosition );
		this.mergeAttributes( insertionPosition );
	}

	getParentContainer( position ) {
		let container = position.parent;

		while ( !this.isContainer( container ) ) {
			container = container.parent;
		}

		return container;
	}

	// return position
	breakAttributes( position, limit ) {
		if ( !limit ) {
			limit = this.getParentContainer( position );
		}

		let offset = position.offset;
		let node = position.parent;

		if ( this.isContainer( node ) ) {
			return position;
		}

		const parentIsText = node instanceof Text;
		const length = parentIsText ? node.data.length : node.getChildCount();

		// <p>foo<b><u>bar|</u></b></p>
		// <p>foo<b><u>bar</u>|</b></p>
		// <p>foo<b><u>bar</u></b>|</p>
		if ( offset == length ) {
			const parentPosition = new Position( node.parent, node.getIndex() + 1 );

			return this.breakAttributes( parentPosition, limit );
		} else
		// <p>foo<b><u>|bar</u></b></p>
		// <p>foo<b>|<u>bar</u></b></p>
		// <p>foo|<b><u>bar</u></b></p>
		if ( offset == 0 ) {
			const parentPosition = new Position( node.parent, node.getIndex() );

			return this.breakAttributes( parentPosition, limit );
		}
		// <p>foo<b><u>"b|ar"</u></b></p>
		// <p>foo<b><u>"b"|"ar"</u></b></p>
		// <p>foo<b><u>b</u>|</u>ar</u></b></p>
		// <p>foo<b><u>b</u></b>|<b><u>ar</u></b></p>
		else {
			// Break.
			const offsetAfter = node.getIndex() + 1;

			if ( parentIsText ) {
				// Break text.
				const textToMove = node.data.slice( offset );
				node.data = node.data.slice( 0, offset );
				node.parent.insertChildren( offsetAfter, new Text( textToMove ) );

				return new Position( node.parent, offsetAfter );
			} else {
				// Break element.
				const nodeClone = node.cloneNode();
				// Clone priority.
				this._priorities.set( nodeClone, this._priorities.get( node ) );

				node.parent.insertChildren( offsetAfter, nodeClone );

				const nodesToMove = sourceElement.removeChildren( sourceOffset, this.howMany );

				nodeClone.appendChildren( nodesToMove );

				return new Position( node.parent, offsetAfter );
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

	removeFromContainer( range ) {
	}

	// <p><u><b>"|"</b></u></p>
	// <p><u><b>|</b></u></p>
	// <p><u>|</u></p>
	// <p>|</p>
	removeEmptyAttributes( position ) {
	}

	// f[o]o -> f<b>o</b>o
	// <b>f</b>[o]<b>o</b> -> <b>f</b><b>o</b><b>o</b> -> <b>foo</b>
	// <b>f</b>o[o<u>bo]m</u> -> <b>f</b>o<b>o</b><u><b>bo</b>m</u>
	// Range have to] be inside single container.
	wrap( range, element, priority ) {
		// this._priorities.set( element, priority );
	}

	unwrap( range, element ) {
	}
}
