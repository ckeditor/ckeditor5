/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/symbolgridview
 */

import SymbolTileView from './symboltileview';
import GridView from '@ckeditor/ckeditor5-ui/src/gridview';

/**
 * A grid of {@link module:special-characters/ui/symboltileview~symbolTileView symbol tiles}.
 *
 * @extends module:ui/grid~Grid
 */
export default class SymbolGridView extends GridView {
	/**
	 * Creates an instance of a symbol grid containing {@link module:special-characters/ui/symboltileview~symbolTileView tiles}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options Component configuration
	 * @param {Array.<module:ui/symbolgrid/symbolgrid~symbolDefinition>} [options.symbolDefinitions] Array with definitions
	 * required to create the {@link module:special-characters/ui/symboltileview~symbolTileView tiles}.
	 * @param {Number} options.columns A number of columns to display the tiles.
	 */
	constructor( locale, options ) {
		super( locale, options );

		const symbolDefinitions = options && options.symbolDefinitions || [];
		const viewStyleAttribute = {};

		if ( options && options.columns ) {
			viewStyleAttribute.gridTemplateColumns = `repeat( ${ options.columns }, 1fr)`;
		}

		symbolDefinitions.forEach( item => {
			const symbolTile = this.createSymbolTile( item.character, item.title );

			this.items.add( symbolTile );
		} );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-symbol-grid' ]
			}
		} );
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param {String} character A character that will be displayed on the button.
	 * @param {String} title A label that descrbied the character.
	 * @returns {module:special-characters/ui/symboltileview~SymbolTileView}
	 */
	createSymbolTile( character, title ) {
		const symbolTile = new SymbolTileView();

		symbolTile.set( {
			symbol: character,
			label: character,
			tooltip: title,
			withText: true
		} );

		symbolTile.on( 'execute', () => {
			this.fire( 'execute', { title } );
		} );

		return symbolTile;
	}
}
