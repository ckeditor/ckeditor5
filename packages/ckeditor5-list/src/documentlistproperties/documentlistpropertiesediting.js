/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/documentlistpropertiesediting
 */

import { Plugin } from 'ckeditor5/src/core';

import DocumentListEditing from '../documentlist/documentlistediting';
import DocumentListStartCommand from './documentliststartcommand';
import DocumentListStyleCommand from './documentliststylecommand';
import DocumentListReversedCommand from './documentlistreversedcommand';
import {
	listPropertiesDowncastConverter,
	listPropertiesUpcastConverter
} from './converters';
import { iterateSiblingListBlocks } from '../documentlist/utils/listwalker';
import { LIST_BASE_ATTRIBUTES } from '../documentlist/utils/model';
import { getListTypeFromListStyleType } from './utils/style';

const DEFAULT_LIST_TYPE = 'default';

/**
 * The document list properties engine feature.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listproperties~ListPropertiesConfig}.
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
		const documentListEditing = editor.plugins.get( DocumentListEditing );

		const enabledProperties = editor.config.get( 'list.properties' );
		const strategies = createAttributeStrategies( enabledProperties );

		for ( const strategy of strategies ) {
			strategy.addCommand( editor );
			model.schema.extend( '$container', { allowAttributes: strategy.attributeName } );
			model.schema.extend( '$block', { allowAttributes: strategy.attributeName } );
			model.schema.extend( '$blockObject', { allowAttributes: strategy.attributeName } );
		}

		// Set up conversion.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			for ( const strategy of strategies ) {
				dispatcher.on( 'element:ol', listPropertiesUpcastConverter( strategy ) );
				dispatcher.on( 'element:ul', listPropertiesUpcastConverter( strategy ) );
			}
		} );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			for ( const strategy of strategies ) {
				for ( const attributeName of [ ...LIST_BASE_ATTRIBUTES, strategy.attributeName ] ) {
					dispatcher.on( `attribute:${ attributeName }`, listPropertiesDowncastConverter( strategy, model ) );
				}
			}
		} );

		// Verify if the list view element (ul or ol) requires refreshing.
		documentListEditing.on( 'checkAttributes:list', ( evt, { viewElement, modelAttributes } ) => {
			for ( const strategy of strategies ) {
				if ( strategy.getAttributeOnUpcast( viewElement ) != modelAttributes[ strategy.attributeName ] ) {
					evt.return = true;
					evt.stop();
				}
			}
		} );

		// Add or remove list properties attributes depending of the list type.
		documentListEditing.on( 'postFixer', ( evt, { listHead, writer } ) => {
			for ( const { node } of iterateSiblingListBlocks( listHead, 'forward' ) ) {
				for ( const strategy of strategies ) {
					// Check if attribute is valid.
					if ( strategy.hasValidAttribute( node ) ) {
						continue;
					}

					// Add missing default property attributes...
					if ( strategy.appliesToListItem( node ) ) {
						writer.setAttribute( strategy.attributeName, strategy.defaultValue, node );
					}
					// ...or remove invalid property attributes.
					else {
						writer.removeAttribute( strategy.attributeName, node );
					}

					evt.return = true;
				}
			}
		} );

		// Make sure that all items in a single list (items at the same level & listType) have the same properties.
		documentListEditing.on( 'postFixer', ( evt, { listHead, writer } ) => {
			const stack = [];
			let listType = null;
			let listProperties = null;
			let indent = -1;

			for ( const { node } of iterateSiblingListBlocks( listHead, 'forward' ) ) {
				const nodeIndent = node.getAttribute( 'listIndent' );

				if ( nodeIndent > indent ) {
					stack.push( {
						listType,
						listProperties,
						indent
					} );

					listType = null;
					listProperties = null;
					indent = nodeIndent;
				} else {
					while ( nodeIndent < indent ) {
						( { listType, listProperties, indent } = stack.pop() );
					}
				}

				const nodeListType = node.getAttribute( 'listType' );

				if ( nodeListType != listType ) {
					// This node starts a list - save its properties.
					listType = nodeListType;
					listProperties = {};

					for ( const strategy of strategies ) {
						const { attributeName } = strategy;

						listProperties[ attributeName ] = node.getAttribute( attributeName );
					}
				} else {
					// This node belongs to already started list - copy properties from the first node.
					for ( const strategy of strategies ) {
						const { attributeName } = strategy;

						if (
							strategy.appliesToListItem( node ) &&
							node.getAttribute( attributeName ) != listProperties[ attributeName ]
						) {
							writer.setAttribute( attributeName, listProperties[ attributeName ], node );
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

			hasValidAttribute( item ) {
				if ( !item.hasAttribute( 'listStyle' ) ) {
					return false;
				}

				const value = item.getAttribute( 'listStyle' );

				if ( value == DEFAULT_LIST_TYPE ) {
					return true;
				}

				return getListTypeFromListStyleType( value ) == item.getAttribute( 'listType' );
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

			addCommand( editor ) {
				editor.commands.add( 'listReversed', new DocumentListReversedCommand( editor ) );
			},

			appliesToListItem( item ) {
				return item.getAttribute( 'listType' ) == 'numbered';
			},

			hasValidAttribute( item ) {
				return this.appliesToListItem( item ) == item.hasAttribute( 'listReversed' );
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

			addCommand( editor ) {
				editor.commands.add( 'listStart', new DocumentListStartCommand( editor ) );
			},

			appliesToListItem( item ) {
				return item.getAttribute( 'listType' ) == 'numbered';
			},

			hasValidAttribute( item ) {
				return this.appliesToListItem( item ) == item.hasAttribute( 'listStart' );
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
