/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import Node from './node.js';
import utils from '../utils.js';

export default class Element extends Node {
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

		this.domElement = null;
	}

	setDomElement( domElement ) {
		this.domElement = domElement;

		Element._domToViewMapping.set( domElement, this );
	}

	// Note that created elements will not have coresponding DOM elements created it these did not exist before.
	static createFromDom( domElement ) {
		let viewElement = this.getCorespondingElement( domElement );

		if ( viewElement ) {
			return viewElement;
		}

		if ( domElement instanceof Text ) {
			return new ViewText( domElement.data );
		} else {
			viewElement = new Element( domElement.name );
			const attrs = domElement.attributes;

			for ( let i = attrs.length - 1; i >= 0; i-- ) {
				viewElement.setAttr( attrs[ i ].name, attrs[ i ].value );
			}

			for ( let childView of viewElement.getChildren() ) {
				domElement.appendChild( this.createFromDom( childView ) );
			}

			return domElement;
		}
	}

	// Coresponding elements exists only for rendered elementes.
	static getCorespondingElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	getChildren() {
		return this._children[ Symbol.iterator ]();
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
		this.markToSync( Node.CHILDREN_NEED_UPDATE );

		if ( !utils.isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
		}
	}

	removeChildren( index, number ) {
		this.markToSync( Node.CHILDREN_NEED_UPDATE );

		for ( let i = index; i < index + number; i++ ) {
			this._children[ i ].parent = null;
		}

		return new this._children.splice( index, number );
	}

	getAttrKeys() {
		return this._attrs.keys();
	}

	getAttr( key ) {
		return this._attrs.get( key );
	}

	hasAttr( key ) {
		return this._attrs.has( key );
	}

	setAttr( key, value ) {
		this.markToSync( Node.ATTRIBUTES_NEED_UPDATE );

		this._attrs.set( key, value );
	}

	cloneDOMAttrs( element ) {
		this.markToSync( Node.ATTRIBUTES_NEED_UPDATE );

		const attrKeys = element.attributes;

		for ( let key of attrKeys ) {
			this.setAttr( key, element.getAttribute( key ) );
		}
	}

	removeAttr( key ) {
		this.markToSync( Node.ATTRIBUTES_NEED_UPDATE );

		return this._attrs.delete( key );
	}
}

Element._domToViewMapping = new WeakMap();
