/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelDocumentFragment from '../treemodel/documentfragment.js';
import ModelText from '../treemodel/text.js';

export function convertChildren() {
	return ( evt, data, controller ) => {
		if ( !data.output && controller.consumable.test( data.input ) ) {
			data.output = new ModelDocumentFragment( controller.convertChildren( data.input, data.context ) );
		}
	};
}

export function convertText() {
	return ( evt, data, controller ) => {
		if ( controller.consumable.consume( data.input ) ) {
			data.output = new ModelText( data.input.data );
		}
	};
}