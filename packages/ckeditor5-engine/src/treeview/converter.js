/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';

const _domToViewMapping = new WeakMap();
const _viewToDomMapping = new WeakMap();

const converter = {
	bindElements: function( domElement, viewElement ) {
		_domToViewMapping.set( domElement, viewElement );
		_viewToDomMapping.set( viewElement, domElement );
	},

	compareNodes: function( domNode, viewNode ) {
		// Elements.
		if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
			return domNode === converter.getCorespondingDomElement( viewNode );
		}
		// Texts.
		else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
			return domNode.data === viewNode.getText();
		}

		// Not matching types.
		return false;
	},

	cloneDomAttrs: function( domElement, viewElement ) {
		for ( let i = domElement.attributes.length - 1; i >= 0; i-- ) {
			let attr = domElement.attributes[ i ];
			viewElement.setAttr( attr.name, attr.value );
		}
	},

	// viewToDom do bind elements
	viewToDom: function( viewNode, domDocument ) {
		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.getText() );
		} else {
			if ( converter.getCorespondingDom( viewNode ) ) {
				return converter.getCorespondingDom( viewNode );
			}

			const domElement = domDocument.createElement( viewNode.name );
			converter.bindElements( domElement, viewNode );

			for ( let key of viewNode.getAttrKeys() ) {
				domElement.setAttribute( key, viewNode.getAttr( key ) );
			}

			for ( let childView of viewNode.getChildren() ) {
				domElement.appendChild( converter.viewToDom( childView, domDocument ) );
			}

			return domElement;
		}
	},

	// Note that created elements will not have coresponding DOM elements created it these did not exist before.
	// domToView do not bind elements
	domToView: function( domElement ) {
		let viewElement = converter.getCorespondingView( domElement );

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

				viewElement.appendChildren( converter.domToView( domChild ) );
			}

			return viewElement;
		}
	},

	getCorespondingView: function( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return converter.getCorespondingViewElement( domNode );
		} else {
			return converter.getCorespondingViewText( domNode );
		}
	},

	// Coresponding elements exists only for rendered elementes.
	getCorespondingViewElement: function( domElement ) {
		return _domToViewMapping.get( domElement );
	},

	getCorespondingViewText: function( domText ) {
		const previousSibling = domText.previousSibling;

		if ( previousSibling ) {
			const viewElement = converter.getCorespondingView( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling();
			}
		} else {
			const viewElement = converter.getCorespondingView( domText.parentElement );

			if ( viewElement ) {
				return viewElement.getChild( 0 );
			}
		}

		return null;
	},

	getCorespondingDom: function( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return converter.getCorespondingDomElement( viewNode );
		} else {
			return converter.getCorespondingDomText( viewNode );
		}
	},

	getCorespondingDomElement: function( viewElement ) {
		return _viewToDomMapping.get( viewElement );
	},

	getCorespondingDomText: function( viewText ) {
		const previousSibling = viewText.getPreviousSibling();

		if ( previousSibling && converter.getCorespondingDom( previousSibling ) ) {
			return converter.getCorespondingDom( previousSibling ).nextSibling;
		}

		if ( !previousSibling && converter.getCorespondingDom( viewText.parent ) ) {
			return converter.getCorespondingDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	},
};

export default converter;