/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	class Text extends Node {
		constructor( text ) {
			this._text = text;
		}

		getText() {
			return this._text;
		}

		setText( text ) {
			this.parent.markToSync( Node.CHILDREN_NEED_UPDATE );

			this._text = text;
		}
	}
} );
