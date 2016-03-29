/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Consumable from './viewconsumable.js';
import ConversionController from './viewconversioncontroller.js';
import EmitterMixin from '../../utils/emittermixin.js';
import utils from '../../utils/utils.js';

/**
 *
 *		coversionDispatcher.on( 'element:p', ( data, controller ) => {
 *			const paragraph = new ModelElement( 'paragraph' );
 *			const schemaQuery = {
 *				name: 'paragraph',
 *				inside: data.context
 *			};
 *
 *			if ( controller.schema.checkQuery( schemaQuery ) ) {
 *				if ( !controller.consumable.consume( data.input, { name: true } ) ) {
 *					const context = data.context.concat( paragraph );
 *					const children = controller.convertChildren( data.input, context );
 *					paragraph.appendChildren( children );
 *					data.output = paragraph;
 *				}
 *			}
 *		} );
 *
 *		coversionDispatcher.on( 'element:a', ( data, controller ) => {
 *			if ( controller.consumable.consume( data.input, { name: true, attributes: [ 'href' ] } ) ) {
 *				data.output = controller.convertChildren( data.input, data.context );
 *
 *				for ( let item of Range.createFrom( data.output ) ) {
 *					const schemaQuery = {
 *						name: item.name || '$text',
 *						attribute: 'link',
 *						inside: data.context
 *					};
 *					if ( controller.schema.checkQuery( schemaQuery ) ) {
 *						item.setAttribute( 'link', data.input.getAttribute( 'href' ) );
 *					}
 *				}
 *			}
 *		} );
 */

export default class ViewConversionDispatcher {
	convert( viewDocumentFragment ) {
		this.fire( 'viewCleanup', viewDocumentFragment );

		const consumable = Consumable.createFrom( viewDocumentFragment );

		const conversionController = new ConversionController( this, consumable );

		return conversionController.convert( viewDocumentFragment );
	}
}

utils.mix( ViewConversionDispatcher, EmitterMixin );
