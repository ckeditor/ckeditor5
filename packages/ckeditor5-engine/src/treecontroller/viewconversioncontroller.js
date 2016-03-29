/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewElement from '../treview/element.js';
import ViewText from '../treview/text.js';

export default class ViewConversionController {
	constructor( dispatcher, consumable ) {
		this.consumable = consumable;

		this._dispatcher = dispatcher;
	}

	convert( input, context ) {
		const data = {
			input: input,
			output: null,
			context: context
		};

		if ( input instanceof ViewElement ) {
			this._dispatcher.fire( 'element:' + input.name, data, this );
		} else if ( input instanceof ViewText ) {
			this._dispatcher.fire( 'text', data, this );
		} else { // DocumentFragment
			this._dispatcher.fire( 'documentFragment', data, this );
		}

		return data.output;
	}

	convertChildren( input, context ) {
		// TODO: flatten array (single convert may return multiple elements as an array.
		return Array.from( input.getChildren() ).map( ( viewChild ) => this.convert( viewChild, context ) );
	}
}
