/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import utils from '../utils.js';
import langUtils from '../lib/lodash/lang.js';

export default class Element extends Node {
	constructor( name, attrs, children ) {
		super();

		/**
		 * @readolny
		 */
		this.name = name;

		if ( langUtils.isPlainObject( attrs ) ) {
			this._attrs = utils.objectToMap( attrs );
		} else {
			this._attrs = new Map( attrs );
		}

		this._children = [];

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	getChild( index ) {
		return this._children[ index ];
	}

	getChildCount() {
		return this._children.length;
	}

	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	getAttributeKeys() {
		return this._attrs.keys();
	}

	getAttribute( key ) {
		return this._attrs.get( key );
	}

	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	setAttribute( key, value ) {
		this._fireChange( 'ATTRIBUTES', this );

		this._attrs.set( key, value );
	}

	insertChildren( index, nodes ) {
		this._fireChange( 'CHILDREN', this );

		if ( !utils.isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
		}
	}

	removeAttribute( key ) {
		this._fireChange( 'ATTRIBUTES', this );

		return this._attrs.delete( key );
	}

	removeChildren( index, number ) {
		this._fireChange( 'CHILDREN', this );

		for ( let i = index; i < index + number; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, number );
	}
}
