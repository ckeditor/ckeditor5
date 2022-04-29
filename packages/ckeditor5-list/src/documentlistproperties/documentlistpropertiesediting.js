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
import { listPropertiesUpcastConverter } from './converters';
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

			// Register downcast strategy.
			documentListEditing.registerDowncastStrategy( {
				scope: 'list',
				attributeName: strategy.attributeName,

				setAttributeOnDowncast( writer, attributeValue, viewElement ) {
					strategy.setAttributeOnDowncast( writer, attributeValue, viewElement );
				}
			} );
		}

		// Set up conversion.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			for ( const strategy of strategies ) {
				dispatcher.on( 'element:ol', listPropertiesUpcastConverter( strategy ) );
				dispatcher.on( 'element:ul', listPropertiesUpcastConverter( strategy ) );
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

		// Reset list properties after indenting list items.
		this.listenTo( editor.commands.get( 'indentList' ), 'afterExecute', ( evt, changedBlocks ) => {
			model.change( writer => {
				for ( const node of changedBlocks ) {
					for ( const strategy of strategies ) {
						if ( strategy.appliesToListItem( node ) ) {
							// Just reset the attribute.
							// If there is a previous indented list that this node should be merged into,
							// the postfixer will unify all the attributes of both sub-lists.
							writer.setAttribute( strategy.attributeName, strategy.defaultValue, node );
						}
					}
				}
			} );
		} );

		// Add or remove list properties attributes depending on the list type.
		documentListEditing.on( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node } of listNodes ) {
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
		documentListEditing.on( 'postFixer', ( evt, { listNodes, writer } ) => {
			const previousNodesByIndent = []; // Last seen nodes of lower indented lists.

			for ( const { node, previous } of listNodes ) {
				// For the first list block there is nothing to compare with.
				if ( !previous ) {
					continue;
				}

				const nodeIndent = node.getAttribute( 'listIndent' );
				const previousNodeIndent = previous.getAttribute( 'listIndent' );

				let previousNodeInList = null; // It's like `previous` but has the same indent as current node.

				// Let's find previous node for the same indent.
				// We're going to need that when we get back to previous indent.
				if ( nodeIndent > previousNodeIndent ) {
					previousNodesByIndent[ previousNodeIndent ] = previous;
				}
				// Restore the one for given indent.
				else if ( nodeIndent < previousNodeIndent ) {
					previousNodeInList = previousNodesByIndent[ nodeIndent ];
					previousNodesByIndent.length = nodeIndent;
				}
				// Same indent.
				else {
					previousNodeInList = previous;
				}

				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				// This is a first block of a list of a different type.
				if ( previousNodeInList.getAttribute( 'listType' ) != node.getAttribute( 'listType' ) ) {
					continue;
				}

				// Copy properties from the previous one.
				for ( const strategy of strategies ) {
					const { attributeName } = strategy;

					if ( !strategy.appliesToListItem( node ) ) {
						continue;
					}

					const value = previousNodeInList.getAttribute( attributeName );

					if ( node.getAttribute( attributeName ) != value ) {
						writer.setAttribute( attributeName, value, node );
						evt.return = true;
					}
				}
			}
		} );
	}
}

/**
 * Strategy for dealing with `listItem` attributes supported by this plugin.
 *
 * @typedef {Object} module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy
 * @protected
 * @property {String} attributeName The model attribute name.
 * @property {*} defaultValue The model attribute default value.
 * @property {Object} viewConsumables The view consumable as expected by
 * {@link module:engine/conversion/viewconsumable~ViewConsumable#consume `ViewConsumable`}.
 * @property {Function} addCommand Registers an editor command.
 * @property {Function} appliesToListItem Verifies whether the strategy is applicable for the specified model element.
 * @property {Function} hasValidAttribute Verifies whether the model attribute value is valid.
 * @property {Function} setAttributeOnDowncast Sets the property on the view element.
 * @property {Function} getAttributeOnUpcast Retrieves the property value from the view element.
 */

// Creates an array of strategies for dealing with enabled listItem attributes.
//
// @param {Object} enabledProperties
// @param {Boolean} enabledProperties.styles
// @param {Boolean} enabledProperties.reversed
// @param {Boolean} enabledProperties.startIndex
// @returns {Array.<module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy>}
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
