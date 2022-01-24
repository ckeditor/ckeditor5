/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listpropertiesediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ListEditing from './listediting';
import ListStyleCommand from './liststylecommand';
import ListReversedCommand from './listreversedcommand';
import ListStartCommand from './liststartcommand';
import { getSiblingListItem, getSiblingNodes } from './utils';

const DEFAULT_LIST_TYPE = 'default';

/**
 * The engine of the list properties feature.
 *
 * It sets the value for the `listItem` attribute of the {@link module:list/list~List `<listItem>`} element that
 * allows modifying the list style type.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listproperties~ListPropertiesConfig}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListPropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListPropertiesEditing';
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

		// Extend schema.
		model.schema.extend( 'listItem', {
			allowAttributes: strategies.map( s => s.attributeName )
		} );

		for ( const strategy of strategies ) {
			strategy.addCommand( editor );
		}

		// Fix list attributes when modifying their nesting levels (the `listIndent` attribute).
		this.listenTo( editor.commands.get( 'indentList' ), '_executeCleanup', fixListAfterIndentListCommand( editor, strategies ) );
		this.listenTo( editor.commands.get( 'outdentList' ), '_executeCleanup', fixListAfterOutdentListCommand( editor, strategies ) );

		this.listenTo( editor.commands.get( 'bulletedList' ), '_executeCleanup', restoreDefaultListStyle( editor ) );
		this.listenTo( editor.commands.get( 'numberedList' ), '_executeCleanup', restoreDefaultListStyle( editor ) );

		// Register a post-fixer that ensures that the attributes is specified in each `listItem` element.
		model.document.registerPostFixer( fixListAttributesOnListItemElements( editor, strategies ) );

		// Set up conversion.
		editor.conversion.for( 'upcast' ).add( upcastListItemAttributes( strategies ) );
		editor.conversion.for( 'downcast' ).add( downcastListItemAttributes( strategies ) );

		// Handle merging two separated lists into the single one.
		this._mergeListAttributesWhileMergingLists( strategies );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		// Enable post-fixer that removes the attributes from to-do list items only if the "TodoList" plugin is on.
		// We need to registry the hook here since the `TodoList` plugin can be added after the `ListPropertiesEditing`.
		if ( editor.commands.get( 'todoList' ) ) {
			editor.model.document.registerPostFixer( removeListItemAttributesFromTodoList( editor ) );
		}
	}

	/**
	 * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether two lists will be merged into a single
	 * one after deleting the content.
	 *
	 * The purpose of this action is to adjust the `listStyle`, `listReversed` and `listStart` values
	 * for the list that was merged.
	 *
	 * Consider the following model's content:
	 *
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 *     <paragraph>[A paragraph.]</paragraph>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 1</listItem>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 2</listItem>
	 *
	 * After removing the paragraph element, the second list will be merged into the first one.
	 * We want to inherit the `listStyle` attribute for the second list from the first one.
	 *
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 *     <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/7879.
	 *
	 * @private
	 * @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies Strategies for the enabled attributes.
	 */
	_mergeListAttributesWhileMergingLists( attributeStrategies ) {
		const editor = this.editor;
		const model = editor.model;

		// First the outer-most`listItem` in the first list reference.
		// If found, the lists should be merged and this `listItem` provides the attributes
		// and it is also a starting point when searching for items in the second list.
		let firstMostOuterItem;

		// Check whether the removed content is between two lists.
		this.listenTo( model, 'deleteContent', ( evt, [ selection ] ) => {
			const firstPosition = selection.getFirstPosition();
			const lastPosition = selection.getLastPosition();

			// Typing or removing content in a single item. Aborting.
			if ( firstPosition.parent === lastPosition.parent ) {
				return;
			}

			// An element before the content that will be removed is not a list.
			if ( !firstPosition.parent.is( 'element', 'listItem' ) ) {
				return;
			}

			const nextSibling = lastPosition.parent.nextSibling;

			// An element after the content that will be removed is not a list.
			if ( !nextSibling || !nextSibling.is( 'element', 'listItem' ) ) {
				return;
			}

			// Find the outermost list item based on the `listIndent` attribute. We can't assume that `listIndent=0`
			// because the selection can be hooked in nested lists.
			//
			// <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
			// <listItem listIndent="1" listType="bulleted" listStyle="square">UL List [item 1.1</listItem>
			// <listItem listIndent="0" listType="bulleted" listStyle="circle">[]UL List item 1.</listItem>
			// <listItem listIndent="1" listType="bulleted" listStyle="circle">UL List ]item 1.1</listItem>
			//
			// After deleting the content, we would like to inherit the "square" attribute for the last element:
			//
			// <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
			// <listItem listIndent="1" listType="bulleted" listStyle="square">UL List []item 1.1</listItem>
			const mostOuterItemList = getSiblingListItem( firstPosition.parent, {
				sameIndent: true,
				listIndent: nextSibling.getAttribute( 'listIndent' )
			} );

			// The outermost list item may not exist while removing elements between lists with different value
			// of the `listIndent` attribute. In such a case we don't want to update anything. See: #8073.
			if ( !mostOuterItemList ) {
				return;
			}

			if ( mostOuterItemList.getAttribute( 'listType' ) === nextSibling.getAttribute( 'listType' ) ) {
				firstMostOuterItem = mostOuterItemList;
			}
		}, { priority: 'high' } );

		// If so, update the `listStyle` attribute for the second list.
		this.listenTo( model, 'deleteContent', () => {
			if ( !firstMostOuterItem ) {
				return;
			}

			model.change( writer => {
				// Find the first most-outer item list in the merged list.
				// A case when the first list item in the second list was merged into the last item in the first list.
				//
				// <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
				// <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
				// <listItem listIndent="0" listType="bulleted" listStyle="circle">[]UL List item 1</listItem>
				// <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 2</listItem>
				const secondListMostOuterItem = getSiblingListItem( firstMostOuterItem.nextSibling, {
					sameIndent: true,
					listIndent: firstMostOuterItem.getAttribute( 'listIndent' ),
					direction: 'forward'
				} );

				// If the selection ends in a non-list element, there are no <listItem>s that would require adjustments.
				// See: #8642.
				if ( !secondListMostOuterItem ) {
					firstMostOuterItem = null;
					return;
				}

				const items = [
					secondListMostOuterItem,
					...getSiblingNodes( writer.createPositionAt( secondListMostOuterItem, 0 ), 'forward' )
				];

				for ( const listItem of items ) {
					for ( const strategy of attributeStrategies ) {
						if ( strategy.appliesToListItem( listItem ) ) {
							const attributeName = strategy.attributeName;
							const value = firstMostOuterItem.getAttribute( attributeName );

							writer.setAttribute( attributeName, value, listItem );
						}
					}
				}
			} );

			firstMostOuterItem = null;
		}, { priority: 'low' } );
	}
}

/**
 * Strategy for dealing with `listItem` attributes supported by this plugin.
 *
 * @typedef {Object} AttributeStrategy
 * @private
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

			addCommand( editor ) {
				editor.commands.add( 'listStyle', new ListStyleCommand( editor, DEFAULT_LIST_TYPE ) );
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

			addCommand( editor ) {
				editor.commands.add( 'listReversed', new ListReversedCommand( editor ) );
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

			addCommand( editor ) {
				editor.commands.add( 'listStart', new ListStartCommand( editor ) );
			},

			appliesToListItem( item ) {
				return item.getAttribute( 'listType' ) == 'numbered';
			},

			setAttributeOnDowncast( writer, listStart, element ) {
				if ( listStart != 1 ) {
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

// Returns a converter consumes the `style`, `reversed` and `start` attribute.
// In `style` it searches for the `list-style-type` definition.
// If not found, the `"default"` value will be used.
//
// @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies
// @returns {Function}
function upcastListItemAttributes( attributeStrategies ) {
	return dispatcher => {
		dispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
			const listParent = data.viewItem.parent;

			// It may happen that the native spell checker fixes a word inside a list item.
			// When the children mutation is fired, the `<li>` does not have the parent element. See: #9325.
			if ( !listParent ) {
				return;
			}

			const listItem = data.modelRange.start.nodeAfter || data.modelRange.end.nodeBefore;

			for ( const strategy of attributeStrategies ) {
				if ( strategy.appliesToListItem( listItem ) ) {
					const listStyle = strategy.getAttributeOnUpcast( listParent );
					conversionApi.writer.setAttribute( strategy.attributeName, listStyle, listItem );
				}
			}
		}, { priority: 'low' } );
	};
}

// Returns a converter that adds `reversed`, `start` attributes and adds `list-style-type` definition as a value for the `style` attribute.
// The `"default"` values are removed and not present in the view/data.
//
// @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies
// @returns {Function}
function downcastListItemAttributes( attributeStrategies ) {
	return dispatcher => {
		for ( const strategy of attributeStrategies ) {
			dispatcher.on( `attribute:${ strategy.attributeName }:listItem`, ( evt, data, conversionApi ) => {
				const viewWriter = conversionApi.writer;
				const currentElement = data.item;

				const previousElement = getSiblingListItem( currentElement.previousSibling, {
					sameIndent: true,
					listIndent: currentElement.getAttribute( 'listIndent' ),
					direction: 'backward'
				} );

				const viewItem = conversionApi.mapper.toViewElement( currentElement );

				// A case when elements represent different lists. We need to separate their container.
				if ( !areRepresentingSameList( currentElement, previousElement ) ) {
					viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
				}
				strategy.setAttributeOnDowncast( viewWriter, data.attributeNewValue, viewItem.parent );
			}, { priority: 'low' } );
		}
	};

	// Checks whether specified list items belong to the same list.
	//
	// @param {module:engine/model/element~Element} `listItem1` The first list item to check.
	// @param {module:engine/model/element~Element|null} `listItem2` The second list item to check.
	// @returns {Boolean}
	function areRepresentingSameList( listItem1, listItem2 ) {
		return listItem2 &&
			listItem1.getAttribute( 'listType' ) === listItem2.getAttribute( 'listType' ) &&
			listItem1.getAttribute( 'listIndent' ) === listItem2.getAttribute( 'listIndent' ) &&
			listItem1.getAttribute( 'listStyle' ) === listItem2.getAttribute( 'listStyle' ) &&
			listItem1.getAttribute( 'listReversed' ) === listItem2.getAttribute( 'listReversed' ) &&
			listItem1.getAttribute( 'listStart' ) === listItem2.getAttribute( 'listStart' );
	}
}

// When indenting list, nested list should clear its value for the attributes or inherit from nested lists.
//
// ■ List item 1.
// ■ List item 2.[]
// ■ List item 3.
// editor.execute( 'indentList' );
//
// ■ List item 1.
//     ○ List item 2.[]
// ■ List item 3.
//
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies
// @returns {Function}
function fixListAfterIndentListCommand( editor, attributeStrategies ) {
	return ( evt, changedItems ) => {
		const root = changedItems[ 0 ];
		const rootIndent = root.getAttribute( 'listIndent' );

		const itemsToUpdate = changedItems.filter( item => item.getAttribute( 'listIndent' ) === rootIndent );

		// A case where a few list items are indented must be checked separately
		// since `getSiblingListItem()` returns the first changed element.
		// ■ List item 1.
		//     ○ [List item 2.
		//     ○ List item 3.]
		// ■ List item 4.
		//
		// List items: `2` and `3` should be adjusted.
		let previousSibling = null;

		if ( root.previousSibling.getAttribute( 'listIndent' ) + 1 !== rootIndent ) {
			previousSibling = getSiblingListItem( root.previousSibling, {
				sameIndent: true, direction: 'backward', listIndent: rootIndent
			} );
		}

		editor.model.change( writer => {
			for ( const item of itemsToUpdate ) {
				for ( const strategy of attributeStrategies ) {
					if ( strategy.appliesToListItem( item ) ) {
						const valueToSet = previousSibling == null ?
							strategy.defaultValue :
							previousSibling.getAttribute( strategy.attributeName );

						writer.setAttribute( strategy.attributeName, valueToSet, item );
					}
				}
			}
		} );
	};
}

// When outdenting a list, a nested list should copy attribute values
// from the previous sibling list item including the same value for the `listIndent` value.
//
// ■ List item 1.
//     ○ List item 2.[]
// ■ List item 3.
//
// editor.execute( 'outdentList' );
//
// ■ List item 1.
// ■ List item 2.[]
// ■ List item 3.
//
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies
// @returns {Function}
function fixListAfterOutdentListCommand( editor, attributeStrategies ) {
	return ( evt, changedItems ) => {
		changedItems = changedItems.reverse().filter( item => item.is( 'element', 'listItem' ) );

		if ( !changedItems.length ) {
			return;
		}

		const indent = changedItems[ 0 ].getAttribute( 'listIndent' );
		const listType = changedItems[ 0 ].getAttribute( 'listType' );
		let listItem = changedItems[ 0 ].previousSibling;

		// ■ List item 1.
		//     ○ List item 2.
		//     ○ List item 3.[]
		// ■ List item 4.
		//
		// After outdenting a list, `List item 3` should inherit the `listStyle` attribute from `List item 1`.
		//
		// ■ List item 1.
		//     ○ List item 2.
		// ■ List item 3.[]
		// ■ List item 4.
		if ( listItem.is( 'element', 'listItem' ) ) {
			while ( listItem.getAttribute( 'listIndent' ) !== indent ) {
				listItem = listItem.previousSibling;
			}
		} else {
			listItem = null;
		}

		// Outdenting such a list should restore values based on `List item 4`.
		// ■ List item 1.[]
		//     ○ List item 2.
		//     ○ List item 3.
		// ■ List item 4.
		if ( !listItem ) {
			listItem = changedItems[ changedItems.length - 1 ].nextSibling;
		}

		// And such a list should not modify anything.
		// However, `listItem` can indicate a node below the list. Be sure that we have the `listItem` element.
		// ■ List item 1.[]
		//     ○ List item 2.
		//     ○ List item 3.
		// <paragraph>The later if check.</paragraph>
		if ( !listItem || !listItem.is( 'element', 'listItem' ) ) {
			return;
		}

		// Do not modify the list if found `listItem` represents other type of list than outdented list items.
		if ( listItem.getAttribute( 'listType' ) !== listType ) {
			return;
		}

		editor.model.change( writer => {
			const itemsToUpdate = changedItems.filter( item => item.getAttribute( 'listIndent' ) === indent );

			for ( const item of itemsToUpdate ) {
				for ( const strategy of attributeStrategies ) {
					if ( strategy.appliesToListItem( item ) ) {
						const attributeName = strategy.attributeName;
						const valueToSet = listItem.getAttribute( attributeName );

						writer.setAttribute( attributeName, valueToSet, item );
					}
				}
			}
		} );
	};
}

// Each `listItem` element must have specified the `listStyle`, `listReversed` and `listStart` attributes
// if they are enabled and supported by its `listType`.
// This post-fixer checks whether inserted elements `listItem` elements should inherit the attribute values from
// their sibling nodes or should use the default values.
//
// Paragraph[]
// ■ List item 1. // [listStyle="square", listType="bulleted"]
// ■ List item 2. // ...
// ■ List item 3. // ...
//
// editor.execute( 'bulletedList' )
//
// ■ Paragraph[]  // [listStyle="square", listType="bulleted"]
// ■ List item 1. // [listStyle="square", listType="bulleted"]
// ■ List item 2.
// ■ List item 3.
//
// It also covers a such change:
//
// [Paragraph 1
// Paragraph 2]
// ■ List item 1. // [listStyle="square", listType="bulleted"]
// ■ List item 2. // ...
// ■ List item 3. // ...
//
// editor.execute( 'numberedList' )
//
// 1. [Paragraph 1 // [listStyle="default", listType="numbered"]
// 2. Paragraph 2] // [listStyle="default", listType="numbered"]
// ■ List item 1.  // [listStyle="square", listType="bulleted"]
// ■ List item 2.  // ...
// ■ List item 3.  // ...
//
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:list/listpropertiesediting~AttributeStrategy>} attributeStrategies
// @returns {Function}
function fixListAttributesOnListItemElements( editor, attributeStrategies ) {
	return writer => {
		let wasFixed = false;

		const insertedListItems = getChangedListItems( editor.model.document.differ.getChanges() )
			.filter( item => {
				// Don't touch todo lists. They are handled in another post-fixer.
				return item.getAttribute( 'listType' ) !== 'todo';
			} );

		if ( !insertedListItems.length ) {
			return wasFixed;
		}

		// Check whether the last inserted element is next to the `listItem` element.
		//
		// ■ Paragraph[]  // <-- The inserted item.
		// ■ List item 1.
		let existingListItem = insertedListItems[ insertedListItems.length - 1 ].nextSibling;

		// If it doesn't, maybe the `listItem` was inserted at the end of the list.
		//
		// ■ List item 1.
		// ■ Paragraph[]  // <-- The inserted item.
		if ( !existingListItem || !existingListItem.is( 'element', 'listItem' ) ) {
			existingListItem = insertedListItems[ insertedListItems.length - 1 ].previousSibling;

			if ( existingListItem ) {
				const indent = insertedListItems[ 0 ].getAttribute( 'listIndent' );

				// But we need to find a `listItem` with the `listIndent=0` attribute.
				// If doesn't, maybe the `listItem` was inserted at the end of the list.
				//
				// ■ List item 1.
				//     ○ List item 2.
				// ■ Paragraph[]  // <-- The inserted item.
				while ( existingListItem.is( 'element', 'listItem' ) && existingListItem.getAttribute( 'listIndent' ) !== indent ) {
					existingListItem = existingListItem.previousSibling;

					// If the item does not exist, most probably there is no other content in the editor. See: #8072.
					if ( !existingListItem ) {
						break;
					}
				}
			}
		}

		for ( const strategy of attributeStrategies ) {
			const attributeName = strategy.attributeName;

			for ( const item of insertedListItems ) {
				if ( !strategy.appliesToListItem( item ) ) {
					writer.removeAttribute( attributeName, item );

					continue;
				}

				if ( !item.hasAttribute( attributeName ) ) {
					if ( shouldInheritListType( existingListItem, item, strategy ) ) {
						writer.setAttribute( attributeName, existingListItem.getAttribute( attributeName ), item );
					} else {
						writer.setAttribute( attributeName, strategy.defaultValue, item );
					}
					wasFixed = true;
				} else {
					// Adjust the `listStyle`, `listReversed` and `listStart`
					// attributes for inserted (pasted) items. See #8160.
					//
					// ■ List item 1. // [listStyle="square", listType="bulleted"]
					//     ○ List item 1.1. // [listStyle="circle", listType="bulleted"]
					//     ○ [] (selection is here)
					//
					// Then, pasting a list with different attributes (listStyle, listType):
					//
					// 1. First. // [listStyle="decimal", listType="numbered"]
					// 2. Second // [listStyle="decimal", listType="numbered"]
					//
					// The `listType` attribute will be corrected by the `ListEditing` converters.
					// We need to adjust the `listStyle` attribute. Expected structure:
					//
					// ■ List item 1. // [listStyle="square", listType="bulleted"]
					//     ○ List item 1.1. // [listStyle="circle", listType="bulleted"]
					//     ○ First. // [listStyle="circle", listType="bulleted"]
					//     ○ Second // [listStyle="circle", listType="bulleted"]
					const previousSibling = item.previousSibling;

					if ( shouldInheritListTypeFromPreviousItem( previousSibling, item, strategy.attributeName ) ) {
						writer.setAttribute( attributeName, previousSibling.getAttribute( attributeName ), item );

						wasFixed = true;
					}
				}
			}
		}

		return wasFixed;
	};
}

// Checks whether the `listStyle`, `listReversed` and `listStart` attributes
// should be copied from the `baseItem` element.
//
// The attribute should be copied if the inserted element does not have defined it and
// the value for the element is other than default in the base element.
//
// @param {module:engine/model/element~Element|null} baseItem
// @param {module:engine/model/element~Element} itemToChange
// @param {module:list/listpropertiesediting~AttributeStrategy} attributeStrategy
// @returns {Boolean}
function shouldInheritListType( baseItem, itemToChange, attributeStrategy ) {
	if ( !baseItem ) {
		return false;
	}

	const baseListAttribute = baseItem.getAttribute( attributeStrategy.attributeName );

	if ( !baseListAttribute ) {
		return false;
	}

	if ( baseListAttribute == attributeStrategy.defaultValue ) {
		return false;
	}

	if ( baseItem.getAttribute( 'listType' ) !== itemToChange.getAttribute( 'listType' ) ) {
		return false;
	}

	return true;
}

// Checks whether the `listStyle`, `listReversed` and `listStart` attributes
// should be copied from previous list item.
//
// The attribute should be copied if there's a mismatch of styles of the pasted list into a nested list.
// Top-level lists are not normalized as we allow side-by-side list of different types.
//
// @param {module:engine/model/element~Element|null} previousItem
// @param {module:engine/model/element~Element} itemToChange
// @returns {Boolean}
function shouldInheritListTypeFromPreviousItem( previousItem, itemToChange, attributeName ) {
	if ( !previousItem || !previousItem.is( 'element', 'listItem' ) ) {
		return false;
	}

	if ( itemToChange.getAttribute( 'listType' ) !== previousItem.getAttribute( 'listType' ) ) {
		return false;
	}

	const previousItemIndent = previousItem.getAttribute( 'listIndent' );

	if ( previousItemIndent < 1 || previousItemIndent !== itemToChange.getAttribute( 'listIndent' ) ) {
		return false;
	}

	const previousItemListAttribute = previousItem.getAttribute( attributeName );

	if ( !previousItemListAttribute || previousItemListAttribute === itemToChange.getAttribute( attributeName ) ) {
		return false;
	}

	return true;
}

// Removes the `listStyle`, `listReversed` and `listStart` attributes from "todo" list items.
//
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function removeListItemAttributesFromTodoList( editor ) {
	return writer => {
		const todoListItems = getChangedListItems( editor.model.document.differ.getChanges() )
			.filter( item => {
				// Handle the todo lists only. The rest is handled in another post-fixer.
				return item.getAttribute( 'listType' ) === 'todo' && (
					item.hasAttribute( 'listStyle' ) ||
					item.hasAttribute( 'listReversed' ) ||
					item.hasAttribute( 'listStart' )
				);
			} );

		if ( !todoListItems.length ) {
			return false;
		}

		for ( const item of todoListItems ) {
			writer.removeAttribute( 'listStyle', item );
			writer.removeAttribute( 'listReversed', item );
			writer.removeAttribute( 'listStart', item );
		}

		return true;
	};
}

// Restores the `listStyle` attribute after changing the list type.
//
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function restoreDefaultListStyle( editor ) {
	return ( evt, changedItems ) => {
		changedItems = changedItems.filter( item => item.is( 'element', 'listItem' ) );

		editor.model.change( writer => {
			for ( const item of changedItems ) {
				// Remove the attribute. Post-fixer will restore the proper value.
				writer.removeAttribute( 'listStyle', item );
			}
		} );
	};
}

// Returns the `listItem` that was inserted or changed.
//
// @param {Array.<Object>} changes The changes list returned by the differ.
// @returns {Array.<module:engine/model/element~Element>}
function getChangedListItems( changes ) {
	const items = [];

	for ( const change of changes ) {
		const item = getItemFromChange( change );

		if ( item && item.is( 'element', 'listItem' ) ) {
			items.push( item );
		}
	}

	return items;
}

function getItemFromChange( change ) {
	if ( change.type === 'attribute' ) {
		return change.range.start.nodeAfter;
	}

	if ( change.type === 'insert' ) {
		return change.position.nodeAfter;
	}

	return null;
}

