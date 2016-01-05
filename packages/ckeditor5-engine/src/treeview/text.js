/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import Element from './element.js';

export default class Text extends Node {
	constructor( text ) {
		this._text = text;
	}

	getText() {
		return this._text;
	}

	setText( text ) {
		this.markToSync( Node.TEXT_NEEDS_UPDATE );

		this._text = text;
	}

	getDomText() {
		const previousSibling = this.getPreviousSibling();

		if ( previousSibling && previousSibling.domElement ) {
			return previousSibling.domElement.nextSibling;
		}

		if ( !previousSibling && this.parent.domElement ) {
			return this.parent.domElement.childNodes[ 0 ];
		}

		return null;
	}

	static getCorespondingText( domText ) {
		const previousSibling = domText.previousSibling;

		if ( previousSibling ) {
			const viewElement = Element.getCorespondingElement( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling;
			}
		} else {
			const viewElement = Element.getCorespondingElement( this.parent );

			if ( viewElement ) {
				return viewElement.getChild[ 0 ];
			}
		}

		if ( !previousSibling && this.parent.domElement ) {
			return this.parent.domElement.childNodes[ 0 ];
		}

		return null;
	}
}
