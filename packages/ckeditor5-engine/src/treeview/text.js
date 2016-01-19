/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

export default class Text extends Node {
	constructor( text ) {
		super();

		this._text = text;
	}

	getText() {
		return this._text;
	}

	setText( text ) {
		this._fireChange( 'TEXT', this );

		this._text = text;
	}
}
