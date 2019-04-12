/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/utils/automaticdecorators
 */

/**
 * Helper class which stores information about automatic decorators for link plugin
 * and provides dispatcher which applies all of them to the view.
 */
export default class AutomaticDecorators {
	constructor() {
		/**
		 * Stores definition of automatic decorators. Based on those values proper conversion has happens.
		 *
		 * @private
		 * @type {Set}
		 */
		this._definitions = new Set();
	}

	/**
	 * Add item or array of items with autoamtic rules for applying decorators to link plugin.
	 *
	 * @param {Object|Array.<Object>} item configuration object of automatic rules for decorating links.
	 * It might be also array of such objects.
	 */
	add( item ) {
		if ( Array.isArray( item ) ) {
			item.forEach( item => this._definitions.add( item ) );
		} else {
			this._definitions.add( item );
		}
	}

	/**
	 * Gets the conversion helper used in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method.
	 *
	 * @returns {Function} dispatcher function used as conversion helper
	 * in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}
	 */
	getDispatcher() {
		return dispatcher => {
			dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
				// There is only test as this behavior decorates links and
				// it is run before dispatcher which actually consumes this node.
				// This allows on writing own dispatcher with highest priority,
				// which blocks both native converter and this additional decoration.
				if ( !conversionApi.consumable.test( data.item, 'attribute:linkHref' ) ) {
					return;
				}
				const viewWriter = conversionApi.writer;
				const viewSelection = viewWriter.document.selection;

				for ( const item of this._definitions ) {
					const viewElement = viewWriter.createAttributeElement( 'a', item.attributes, {
						priority: 5
					} );
					viewWriter.setCustomProperty( 'link', true, viewElement );
					if ( item.callback( data.attributeNewValue ) ) {
						if ( data.item.is( 'selection' ) ) {
							viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
						} else {
							viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
						}
					} else {
						viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
					}
				}
			}, { priority: 'high' } );
		};
	}
}
