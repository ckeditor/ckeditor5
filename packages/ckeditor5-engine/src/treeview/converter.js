/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';

// Converter is a class in the future it may take a configuration in the constructor (e.g. what should be inserted into empty elements).
export default class Converter {
	constructor() {
		this._domToViewMapping = new WeakMap();
		this._viewToDomMapping = new WeakMap();
	}

	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	compareNodes( domNode, viewNode ) {
		// Elements.
		if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
			return domNode === this.getCorespondingDomElement( viewNode );
		}
		// Texts.
		else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
			return domNode.data === viewNode.getText();
		}

		// Not matching types.
		return false;
	}

	cloneDomAttrs( domElement, viewElement ) {
		for ( let i = domElement.attributes.length - 1; i >= 0; i-- ) {
			let attr = domElement.attributes[ i ];
			viewElement.setAttr( attr.name, attr.value );
		}
	}

	// viewToDom do bind elements
	viewToDom( viewNode, domDocument ) {
		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.getText() );
		} else {
			if ( this.getCorespondingDom( viewNode ) ) {
				return this.getCorespondingDom( viewNode );
			}

			const domElement = domDocument.createElement( viewNode.name );
			this.bindElements( domElement, viewNode );

			for ( let key of viewNode.getAttrKeys() ) {
				domElement.setAttribute( key, viewNode.getAttr( key ) );
			}

			for ( let childView of viewNode.getChildren() ) {
				domElement.appendChild( this.viewToDom( childView, domDocument ) );
			}

			return domElement;
		}
	}

	// Note that created elements will not have coresponding DOM elements created it these did not exist before.
	// domToView do not bind elements
	domToView( domElement ) {
		let viewElement = this.getCorespondingView( domElement );

		if ( viewElement ) {
			return viewElement;
		}

		if ( domElement instanceof Text ) {
			return new ViewText( domElement.data );
		} else {
			viewElement = new ViewElement( domElement.tagName.toLowerCase() );
			const attrs = domElement.attributes;

			for ( let i = attrs.length - 1; i >= 0; i-- ) {
				viewElement.setAttr( attrs[ i ].name, attrs[ i ].value );
			}

			for ( let i = 0, len = domElement.childNodes.length; i < len; i++ ) {
				let domChild = domElement.childNodes[ i ];

				viewElement.appendChildren( this.domToView( domChild ) );
			}

			return viewElement;
		}
	}

	getCorespondingView( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return this.getCorespondingViewElement( domNode );
		} else {
			return this.getCorespondingViewText( domNode );
		}
	}

	// Coresponding elements exists only for rendered elementes.
	getCorespondingViewElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	getCorespondingViewText( domText ) {
		const previousSibling = domText.previousSibling;

		if ( previousSibling ) {
			const viewElement = this.getCorespondingView( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling();
			}
		} else {
			const viewElement = this.getCorespondingView( domText.parentElement );

			if ( viewElement ) {
				return viewElement.getChild( 0 );
			}
		}

		return null;
	}

	getCorespondingDom( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return this.getCorespondingDomElement( viewNode );
		} else {
			return this.getCorespondingDomText( viewNode );
		}
	}

	getCorespondingDomElement( viewElement ) {
		return this._viewToDomMapping.get( viewElement );
	}

	getCorespondingDomText( viewText ) {
		const previousSibling = viewText.getPreviousSibling();

		if ( previousSibling && this.getCorespondingDom( previousSibling ) ) {
			return this.getCorespondingDom( previousSibling ).nextSibling;
		}

		if ( !previousSibling && this.getCorespondingDom( viewText.parent ) ) {
			return this.getCorespondingDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	}
}