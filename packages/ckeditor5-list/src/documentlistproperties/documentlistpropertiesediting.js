/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/documentlistpropertiesediting
 */

import { Plugin } from 'ckeditor5/src/core';
import DocumentListEditing from '../documentlist/documentlistediting';
import DocumentListStyleCommand from './documentliststylecommand';
import { listPropertiesDowncastConverter, listPropertiesUpcastConverter } from './converters';
import { iterateSiblingListBlocks } from '../documentlist/utils/listwalker';

const DEFAULT_LIST_TYPE = 'default';

/**
 * The document list properties engine feature.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they're enabled in config.
 * Read more in {@link module:list/documentlistproperties~DocumentListPropertiesConfig}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListPropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DocumentListEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListPropertiesEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'list', {
			properties: {
				styles: true,
				startIndex: false,
				reversed: false
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		const enabledProperties = editor.config.get( 'list.properties' );
		const strategies = createAttributeStrategies( enabledProperties );

		model.schema.extend( '$container', {
			allowAttributes: strategies.map( s => s.attributeName )
		} );

		for ( const strategy of strategies ) {
			strategy.addCommand( editor );
		}

		// Set up conversion.
		const baseListAttributes = [ 'listItemId', 'listType', 'listIndent' ];

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			for ( const strategy of strategies ) {
				dispatcher.on( 'element:ol', listPropertiesUpcastConverter( strategy ) );
				dispatcher.on( 'element:ul', listPropertiesUpcastConverter( strategy ) );
			}
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			for ( const strategy of strategies ) {
				for ( const attributeName of [ ...baseListAttributes, strategy.attributeName ] ) {
					dispatcher.on( `attribute:${ attributeName }`, listPropertiesDowncastConverter( strategy, baseListAttributes, model ) );
				}
			}
		} );

		const documentListEditing = editor.plugins.get( DocumentListEditing );

		// Verify if the list view element (ul or ol) requires refreshing.
		documentListEditing.on( 'refreshChecker:list', ( evt, { viewElement, modelAttributes } ) => {
			for ( const strategy of strategies ) {
				if ( strategy.getAttributeOnUpcast( viewElement ) != modelAttributes[ strategy.attributeName ] ) {
					evt.return = true;
					evt.stop();
				}
			}
		} );

		// Fixing the missing list properties attributes.
		documentListEditing.on( 'postFixer', ( evt, { listHead, writer } ) => {
			for ( const { node } of iterateSiblingListBlocks( listHead, 'forward' ) ) {
				for ( const strategy of strategies ) {
					if ( strategy.appliesToListItem( node ) ) {
						// Add missing default property attributes.
						if ( !node.hasAttribute( strategy.attributeName ) ) {
							writer.setAttribute( strategy.attributeName, strategy.defaultValue, node );
							evt.return = true;
						}
					}
				}
			}
		} );
	}
}

/**
 * Strategy for dealing with `listItem` attributes supported by this plugin.
 *
 * @typedef {Object} AttributeStrategy
 * @protected
 * @property {String} #attributeName
 * @property {*} #defaultValue
 * @property {Function} #addCommand
 * @property {Function} #appliesToListItem
 * @property {Function} #setAttributeOnDowncast
 * @property {Function} #getAttributeOnUpcast
 */

// Creates an array of strategies for dealing with enabled listItem attributes.
//
// @param {Object} enabledProperties
// @param {Boolean} enabledProperties.styles
// @param {Boolean} enabledProperties.reversed
// @param {Boolean} enabledProperties.startIndex
// @returns {Array.<module:list/listpropertiesediting~AttributeStrategy>}
function createAttributeStrategies( enabledProperties ) {
	const strategies = [];

	if ( enabledProperties.styles ) {
		strategies.push( {
			attributeName: 'listStyle',
			defaultValue: DEFAULT_LIST_TYPE,
			viewConsumables: { styles: 'list-style-type' },

			addCommand( editor ) {
				editor.commands.add( 'listStyle', new DocumentListStyleCommand( editor, DEFAULT_LIST_TYPE ) );
			},

			appliesToListItem() {
				return true;
			},

			setAttributeOnDowncast( writer, listStyle, element ) {
				if ( listStyle && listStyle !== DEFAULT_LIST_TYPE ) {
					writer.setStyle( 'list-style-type', listStyle, element );
				} else {
					writer.removeStyle( 'list-style-type', element );
				}
			},

			getAttributeOnUpcast( listParent ) {
				return listParent.getStyle( 'list-style-type' ) || DEFAULT_LIST_TYPE;
			}
		} );
	}

	if ( enabledProperties.reversed ) {
		strategies.push( {
			attributeName: 'listReversed',
			defaultValue: false,
			viewConsumables: { attributes: 'reversed' },

			addCommand( /* editor */ ) {
				// editor.commands.add( 'listReversed', new ListReversedCommand( editor ) );
			},

			appliesToListItem( item ) {
				return item.getAttribute( 'listType' ) == 'numbered';
			},

			setAttributeOnDowncast( writer, listReversed, element ) {
				if ( listReversed ) {
					writer.setAttribute( 'reversed', 'reversed', element );
				} else {
					writer.removeAttribute( 'reversed', element );
				}
			},

			getAttributeOnUpcast( listParent ) {
				return listParent.hasAttribute( 'reversed' );
			}
		} );
	}

	if ( enabledProperties.startIndex ) {
		strategies.push( {
			attributeName: 'listStart',
			defaultValue: 1,
			viewConsumables: { attributes: 'start' },

			addCommand( /* editor */ ) {
				// editor.commands.add( 'listStart', new ListStartCommand( editor ) );
			},

			appliesToListItem( item ) {
				return item.getAttribute( 'listType' ) == 'numbered';
			},

			setAttributeOnDowncast( writer, listStart, element ) {
				if ( listStart && listStart > 1 ) {
					writer.setAttribute( 'start', listStart, element );
				} else {
					writer.removeAttribute( 'start', element );
				}
			},

			getAttributeOnUpcast( listParent ) {
				return listParent.getAttribute( 'start' ) || 1;
			}
		} );
	}

	return strategies;
}
