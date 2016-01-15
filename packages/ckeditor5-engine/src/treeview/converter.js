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
	viewToDom: function( view, domDocument ) {
		if ( view instanceof ViewText ) {
			return domDocument.createTextNode( view.getText() );
		} else {
			if ( converter.getCorespondingDom( view ) ) {
				return converter.getCorespondingDom( view );
			}

			const domElement = domDocument.createElement( view.name );
			converter.bindElement( view, domElement );

			for ( let key of view.getAttrKeys() ) {
				domElement.setAttribute( key, view.getAttr( key ) );
			}

			for ( let childView of view.getChildren() ) {
				domElement.appendChild( converter.viewToDom( childView ) );
			}

			return domElement;
		}
	},

	// Note that created elements will not have coresponding DOM elements created it these did not exist before.
	domToView: function( domElement ) {
		let viewElement = converter.getCorespondingView( domElement );

		if ( viewElement ) {
			return viewElement;
		}

		if ( domElement instanceof Text ) {
			return new ViewText( domElement.data );
		} else {
			viewElement = new Element( domElement.tagName.toLowerCase() );
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

	getCorespondingView: function( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return domNode.getCorespondingViewElement( domNode );
		} else {
			return domNode.getCorespondingViewText( domNode );
		}
	},

	// Coresponding elements exists only for rendered elementes.
	getCorespondingViewElement: function( domElement ) {
		return _domToViewMapping.get( domElement );
	},

	getCorespondingViewText: function( domText ) {
		const previousSibling = domText.previousSibling;

		if ( previousSibling ) {
			const viewElement = Element.getCorespondingView( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling();
			}
		} else {
			const viewElement = Element.getCorespondingView( domText.parentElement );

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

	bindElement: function( viewElement, domElement ) {
		_domToViewMapping.set( domElement, viewElement );
		_viewToDomMapping.set( viewElement, domElement );
	},

	cloneDomAttrs: function( domElement, viewElement ) {
		for ( let i = domElement.attributes.length - 1; i >= 0; i-- ) {
			let attr = domElement.attributes[ i ];
			viewElement.setAttr( attr.name, attr.value );
		}
	}
};

export default converter;