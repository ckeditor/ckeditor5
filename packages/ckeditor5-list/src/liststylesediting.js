/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststylesediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListEditing from './listediting';

const DEFAULT_TYPE = 'default';

/**
 * The list styles engine feature.
 *
 * It sets value for the `listItem` attribute for the {@link module:list/list~List `<listItem>`} element that
 * allows modifying list style type.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStylesEditing extends Plugin {
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
		return 'ListStylesEditing';
	}

	init() {
		const editor = this.editor;
		const model = editor.model;

		// Extend schema.
		model.schema.extend( 'listItem', {
			allowAttributes: [ 'listStyle' ]
		} );

		// Disallow the `listStyle` attribute on to-do lists.
		model.schema.addAttributeCheck( ( context, attributeName ) => {
			const item = context.last;

			if ( attributeName == 'listStyle' && item.name == 'listItem' && item.getAttribute( 'listType' ) == 'todo' ) {
				return false;
			}
		} );

		// Set up conversion.
		editor.conversion.for( 'upcast' ).add( upcastListItem() );
		editor.conversion.for( 'downcast' ).add( downcastListStyleAttribute() );
	}
}

// Returns a converter that consumes the `style` attribute and search for `list-style-type` definition.
// If not found, the `"default"` value will be used.
//
// @private
// @returns {Function}
function upcastListItem() {
	return dispatcher => {
		dispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.viewItem, { attributes: [ 'style' ] } ) ) {
				return;
			}

			const listParent = data.viewItem.parent;
			const listStyle = listParent.getStyle( 'list-style-type' ) || DEFAULT_TYPE;
			const listItem = data.modelRange.start.nodeAfter;

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
			const currentItem = data.item;
			const previousItem = currentItem.previousSibling;
			const viewItem = conversionApi.mapper.toViewElement( currentItem );
			const listStyle = data.attributeNewValue;

			// Parsing the first element in a list. Just set the attribute.
			if ( !previousItem || !previousItem.is( 'element', 'listItem' ) ) {
				return setListStyle( viewWriter, listStyle, viewItem.parent );
			}

			// But if previous element is the list item, we must be sure that those two items belong to the same list.
			// So, we should check whether the values of the `listType`, `listIndent` and `listStyle` attributes are equal.
			//
			// If the current parsed list item does not belong to the same list that the previous element,
			// the `listStyle` attribute must be set once again since another list is being processed.
			//
			// Note: We ignore the check of the `listStyle` attribute since that case must be handled another way.
			// If two items have the same values for `listType` and `listIndent` but not for `listStyle`,
			// we must split the list container (`<ol>` or `<ul>`) since we're processing two different lists.
			if ( !areRepresentingSameList( previousItem, currentItem ) ) {
				return setListStyle( viewWriter, listStyle, viewItem.parent );
			}

			const previousListStyle = previousItem.getAttribute( 'listStyle' );

			// Since we were ignoring the `listStyle` check, it must be checked before splitting the list container.
			// No change is needed if previous element has the same value of the `listStyle` attribute.
			if ( previousListStyle === listStyle ) {
				return;
			}

			// But if those attributes are different, we must split the parent element
			// and set the attribute for the new created container.
			viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
			viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );

			setListStyle( viewWriter, listStyle, viewItem.parent );
		}, { priority: 'low' } );
	};

	// Checks whether specified list items belong to the same list.
	//
	// Comparing the `listStyle` attribute is by design since it requires additional actions.
	//
	// @param {module:engine/model/element~Element} listItem1 The first list item to check.
	// @param {module:engine/model/element~Element} listItem2 The second list item to check.
	// @returns {Boolean}
	function areRepresentingSameList( listItem1, listItem2 ) {
		if ( listItem1.getAttribute( 'listType' ) !== listItem2.getAttribute( 'listType' ) ) {
			return false;
		}

		if ( listItem1.getAttribute( 'listIndent' ) !== listItem2.getAttribute( 'listIndent' ) ) {
			return false;
		}

		return true;
	}

	// Updates or removes the `list-style-type` from the `element`.
	//
	// @param {module:engine/view/downcastwriter~DowncastWriter} writer
	// @param {String} listStyle
	// @param {module:engine/view/element~Element} element
	function setListStyle( writer, listStyle, element ) {
		if ( listStyle && listStyle !== DEFAULT_TYPE ) {
			writer.setStyle( 'list-style-type', listStyle, element );
		} else {
			writer.removeStyle( 'list-style-type', element );
		}
	}
}
