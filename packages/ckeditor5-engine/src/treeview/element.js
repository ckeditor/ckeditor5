/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils', 'treeview/Node' ], ( utils, Node ) => {
	class Element extends Node {
		constructor( name, attrs, children ) {
			/**
			 * @readolny
			 */
			this.name = name;

			if ( utils.isPlainObject( attrs ) ) {
				this._attrs = utils.objectToMap( attrs );
			} else {
				this._attrs = new Map( attrs );
			}

			this._children = utils.clone( children );

			this.updateChildren = false;
			this.updateAttrs = false;

			this.DOMElement = null;
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

		insertChildren( index, nodes ) {
			if ( !utils.isIterable( nodes ) ) {
				nodes = [ nodes ];
			}

			for ( node of nodes ) {
				node.parent = this;

				this._children.splice( index, 0, node );
			}

			this.updateChildList = true;
		}

		removeChildren( index, number ) {
			for ( let i = index; i < index + number; i++ ) {
				this._children[ i ].parent = null;
			}

			this.updateChildList = true;

			return new this._children.splice( index, number );
		}

		getAttr( key ) {
			return this._attrs.get( key );
		}

		setAttr( key, value ) {
			this.updateAttrs = true;

			this._attrs.set( key, value );
		}

		hasAttr( key ) {
			return this._attrs.has( key );
		}

		removeAttr( key ) {
			return this._attrs.delete( key );
		}
	}
} );
