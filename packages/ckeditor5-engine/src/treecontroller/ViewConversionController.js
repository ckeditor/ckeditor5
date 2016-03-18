/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class ViewConversionController {
	constructor( context ) {
		this.context = context;
	}

	convert( source ) {
		// data.consumable()
		// data.convert

		const data = {
			source: source,
			target: null
		};

		this.fire( 'element:' + source.name, data, this.context );

		this.fire( 'post', data.target );

		return data.target;
	}
}