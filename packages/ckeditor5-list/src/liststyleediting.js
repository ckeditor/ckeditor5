/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListEditing from './listediting';
import ListStyleCommand from './liststylecommand';
import { getSiblingListItem } from './utils';

const DEFAULT_LIST_TYPE = 'default';

/**
 * The list styles engine feature.
 *
 * It sets value for the `listItem` attribute for the {@link module:list/list~List `<listItem>`} element that
 * allows modifying list style type.
 *
 * It registers the `'listStyle'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStyleEditing extends Plugin {
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
		return 'ListStyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		// Extend schema.
		model.schema.extend( 'listItem', {
			allowAttributes: [ 'listStyle' ]
		} );

		editor.commands.add( 'listStyle', new ListStyleCommand( editor, DEFAULT_LIST_TYPE ) );

		// Fix list attributes when modifying their nesting levels (the `listIndent` attribute).
		this.listenTo( editor.commands.get( 'indentList' ), '_executeCleanup', fixListAfterIndentListCommand( editor ) );
		this.listenTo( editor.commands.get( 'outdentList' ), '_executeCleanup', fixListAfterOutdentListCommand( editor ) );

		this.listenTo( editor.commands.get( 'bulletedList' ), '_executeCleanup', restoreDefaultListStyle( editor ) );
		this.listenTo( editor.commands.get( 'numberedList' ), '_executeCleanup', restoreDefaultListStyle( editor ) );

		// Register a post-fixer that ensures that the `listStyle` attribute is specified in each `listItem` element.
		model.document.registerPostFixer( fixListStyleAttributeOnListItemElements( editor ) );

		// Set up conversion.
		editor.conversion.for( 'upcast' ).add( upcastListItemStyle() );
		editor.conversion.for( 'downcast' ).add( downcastListStyleAttribute() );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		// Enable post-fixer that removes the `listStyle` attribute from to-do list items only if the "TodoList" plugin is on.
		// We need to registry the hook here since the `TodoList` plugin can be added after the `ListStyleEditing`.
		if ( editor.commands.get( 'todoList' ) ) {
			editor.model.document.registerPostFixer( removeListStyleAttributeFromTodoList( editor ) );
		}
	}
}

// Returns a converter that consumes the `style` attribute and search for `list-style-type` definition.
// If not found, the `"default"` value will be used.
//
// @private
// @returns {Function}
function upcastListItemStyle() {
	return dispatcher => {
		dispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
			const listParent = data.viewItem.parent;
			const listStyle = listParent.getStyle( 'list-style-type' ) || DEFAULT_LIST_TYPE;
			const listItem = data.modelRange.end.nodeBefore;

			conversionApi.writer.setAttribute( 'listStyle', listStyle, listItem );
		}, { priority: 'low' } );
	};
}

// Returns a converter that adds the `list-style-type` definition as a value for the `style` attribute.
// The `"default"` value is removed and not present in the view/data.
//
// @private
// @returns {Function}
function downcastListStyleAttribute() {
	return dispatcher => {
		dispatcher.on( 'attribute:listStyle:listItem', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const currentElement = data.item;
			const listStyle = data.attributeNewValue;

			const previousElement = getSiblingListItem( currentElement.previousSibling, {
				sameIndent: true,
				listIndent: currentElement.getAttribute( 'listIndent' ),
				direction: 'backward'
			} );

			const viewItem = conversionApi.mapper.toViewElement( currentElement );

			// Single item list.
			if ( !previousElement ) {
				setListStyle( viewWriter, listStyle, viewItem.parent );
			} else if ( !areRepresentingSameList( previousElement, currentElement ) ) {
				viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
				viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );

				setListStyle( viewWriter, listStyle, viewItem.parent );
			}
		}, { priority: 'low' } );
	};

	// Checks whether specified list items belong to the same list.
	//
	// @param {module:engine/model/element~Element} listItem1 The first list item to check.
	// @param {module:engine/model/element~Element} listItem2 The second list item to check.
	// @returns {Boolean}
	function areRepresentingSameList( listItem1, listItem2 ) {
		return listItem1.getAttribute( 'listType' ) === listItem2.getAttribute( 'listType' ) &&
			listItem1.getAttribute( 'listIndent' ) === listItem2.getAttribute( 'listIndent' ) &&
			listItem1.getAttribute( 'listStyle' ) === listItem2.getAttribute( 'listStyle' );
	}

	// Updates or removes the `list-style-type` from the `element`.
	//
	// @param {module:engine/view/downcastwriter~DowncastWriter} writer
	// @param {String} listStyle
	// @param {module:engine/view/element~Element} element
	function setListStyle( writer, listStyle, element ) {
		if ( listStyle && listStyle !== DEFAULT_LIST_TYPE ) {
			writer.setStyle( 'list-style-type', listStyle, element );
		} else {
			writer.removeStyle( 'list-style-type', element );
		}
	}
}

// When indenting list, nested list should clear its value for the `listStyle` attribute or inherit from nested lists.
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
// @private
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function fixListAfterIndentListCommand( editor ) {
	return ( evt, changedItems ) => {
		let valueToSet;

		const root = changedItems[ 0 ];
		const rootIndent = root.getAttribute( 'listIndent' );

		const itemsToUpdate = changedItems.filter( item => item.getAttribute( 'listIndent' ) === rootIndent );

		// A case where a few list items are intended must be checked separately
		// since `getSiblingListItem()` returns the first changed element.
		// ■ List item 1.
		//     ○ [List item 2.
		//     ○ List item 3.]
		// ■ List item 4.
		//
		// List items: `2` and `3` should be adjusted.
		if ( root.previousSibling.getAttribute( 'listIndent' ) + 1 === rootIndent ) {
			// valueToSet = root.previousSibling.getAttribute( 'listStyle' ) || DEFAULT_LIST_TYPE;
			valueToSet = DEFAULT_LIST_TYPE;
		} else {
			const previousSibling = getSiblingListItem( root.previousSibling, {
				sameIndent: true, direction: 'backward', listIndent: rootIndent
			} );

			valueToSet = previousSibling.getAttribute( 'listStyle' );
		}

		editor.model.change( writer => {
			for ( const item of itemsToUpdate ) {
				writer.setAttribute( 'listStyle', valueToSet, item );
			}
		} );
	};
}

// When outdenting a list, a nested list should copy its value for the `listStyle` attribute
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
// @private
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function fixListAfterOutdentListCommand( editor ) {
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
				writer.setAttribute( 'listStyle', listItem.getAttribute( 'listStyle' ), item );
			}
		} );
	};
}

// Each `listItem` element must have specified the `listStyle` attribute.
// This post-fixer checks whether inserted elements `listItem` elements should inherit the `listStyle` value from
// their sibling nodes or should use the default value.
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
// @private
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function fixListStyleAttributeOnListItemElements( editor ) {
	return writer => {
		let wasFixed = false;
		let insertedListItems = [];

		for ( const change of editor.model.document.differ.getChanges() ) {
			if ( change.type == 'insert' && change.name == 'listItem' ) {
				insertedListItems.push( change.position.nodeAfter );
			}
		}

		// Don't touch todo lists.
		insertedListItems = insertedListItems.filter( item => item.getAttribute( 'listType' ) !== 'todo' );

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
				}
			}
		}

		for ( const item of insertedListItems ) {
			if ( !item.hasAttribute( 'listStyle' ) ) {
				if ( shouldInheritListType( existingListItem ) ) {
					writer.setAttribute( 'listStyle', existingListItem.getAttribute( 'listStyle' ), item );
				} else {
					writer.setAttribute( 'listStyle', DEFAULT_LIST_TYPE, item );
				}

				wasFixed = true;
			}
		}

		return wasFixed;
	};

	// Checks whether the `listStyle` attribute should be copied from the `baseItem` element.
	//
	// The attribute should be copied if the inserted element does not have defined it and
	// the value for the element is other than default in the base element.
	//
	// @param {module:engine/model/element~Element|null} baseItem
	// @returns {Boolean}
	function shouldInheritListType( baseItem ) {
		if ( !baseItem ) {
			return false;
		}

		const baseListStyle = baseItem.getAttribute( 'listStyle' );

		if ( !baseListStyle ) {
			return false;
		}

		if ( baseListStyle === DEFAULT_LIST_TYPE ) {
			return false;
		}

		return true;
	}
}

// Removes the `listStyle` attribute from "todo" list items.
//
// @private
// @param {module:core/editor/editor~Editor} editor
// @returns {Function}
function removeListStyleAttributeFromTodoList( editor ) {
	return writer => {
		let todoListItems = [];

		for ( const change of editor.model.document.differ.getChanges() ) {
			const item = getItemFromChange( change );

			if ( item && item.is( 'element', 'listItem' ) && item.getAttribute( 'listType' ) === 'todo' ) {
				todoListItems.push( item );
			}
		}

		todoListItems = todoListItems.filter( item => item.hasAttribute( 'listStyle' ) );

		if ( !todoListItems.length ) {
			return false;
		}

		for ( const item of todoListItems ) {
			writer.removeAttribute( 'listStyle', item );
		}

		return true;
	};

	function getItemFromChange( change ) {
		if ( change.type === 'attribute' ) {
			return change.range.start.nodeAfter;
		}

		if ( change.type === 'insert' ) {
			return change.position.nodeAfter;
		}

		return null;
	}
}

// Restores the `listStyle` attribute after changing the list type.
//
// @private
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
