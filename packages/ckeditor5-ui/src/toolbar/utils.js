/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/utils
 */

import ToolbarSeparatorView from './toolbarseparatorview';

/**
 * A utility which expands a plain toolbar configuration into a collection
 * of {@link module:ui/view~View views} using a given factory.
 *
 * @param {Array} config The toolbar config.
 * @param {module:utils/collection~Collection} collection A collection into which the config
 * is expanded.
 * @param {module:ui/componentfactory~ComponentFactory} factory A factory producing toolbar items.
 * @returns {Promise} A promise resolved when all toolbar items are initialized.
 */
export function getItemsFromConfig( config, collection, factory ) {
	let promises = [];

	if ( config ) {
		promises = config.map( name => {
			const component = name == '|' ? new ToolbarSeparatorView() : factory.create( name );

			return collection.add( component );
		} );
	}

	return Promise.all( promises );
}
