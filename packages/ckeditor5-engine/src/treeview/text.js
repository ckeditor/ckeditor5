/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import Element from './element.js';

export default class Text extends Node {
	constructor( text ) {
		super();

		this._text = text;
	}

	getCorespondingDom() {
		const previousSibling = this.getPreviousSibling();

		if ( previousSibling && previousSibling.getCorespondingDom() ) {
			return previousSibling.getCorespondingDom().nextSibling;
		}

		if ( !previousSibling && this.parent.getCorespondingDom() ) {
			return this.parent.getCorespondingDom().childNodes[ 0 ];
		}

		return null;
	}

	getText() {
		return this._text;
	}

	setText( text ) {
		this.markToSync( 'TEXT_NEEDS_UPDATE' );

		this._text = text;
	}

	static getCorespondingView( domText ) {
		const previousSibling = domText.previousSibling;

		if ( previousSibling ) {
			const viewElement = Element.getCorespondingView( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling;
			}
		} else {
			const viewElement = Element.getCorespondingView( domText.parentElement );

			if ( viewElement ) {
				return viewElement.getChild( 0 );
			}
		}

		return null;
	}
}
