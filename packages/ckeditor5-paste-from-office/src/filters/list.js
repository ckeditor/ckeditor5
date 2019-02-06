/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/list
 */

import Element from '@ckeditor/ckeditor5-engine/src/view/element';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

/**
 * Transforms Word specific list-like elements to the semantic HTML lists.
 *
 * Lists in Word are represented by block elements with special attributes like:
 *
 *		<p class=MsoListParagraphCxSpFirst style='mso-list:l1 level1 lfo1'>...</p> // Paragraph based list.
 *		<h1 style='mso-list:l0 level1 lfo1'>...</h1> // Heading 1 based list.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment The view structure which to transform.
 * @param {String} stylesString Styles from which list-like elements styling will be extracted.
 */
export function transformListItemLikeElementsIntoLists( documentFragment, stylesString ) {
	if ( !documentFragment.childCount ) {
		return;
	}

	const writer = new UpcastWriter();
	const itemLikeElements = findAllItemLikeElements( documentFragment, writer );

	if ( !itemLikeElements.length ) {
		return;
	}

	let currentList = null;

	itemLikeElements.forEach( ( itemLikeElement, i ) => {
		if ( !currentList || isNewListNeeded( itemLikeElements[ i - 1 ], itemLikeElement ) ) {
			const listStyle = detectListStyle( itemLikeElement, stylesString );

			currentList = insertNewEmptyList( listStyle, itemLikeElement.element, writer );
		}

		const listItem = transformElementIntoListItem( itemLikeElement.element, writer );

		writer.appendChild( listItem, currentList );
	} );
}

// Finds all list-like elements in a given document fragment.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment
// in which to look for list-like nodes.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {Array.<Object>} Array of found list-like items. Each item is an object containing:
//
//		* {module:engine/src/view/element~Element} element List-like element.
//		* {Number} id List item id parsed from `mso-list` style (see `getListItemData()` function).
//		* {Number} order List item creation order parsed from `mso-list` style (see `getListItemData()` function).
//		* {Number} indent List item indentation level parsed from `mso-list` style (see `getListItemData()` function).
function findAllItemLikeElements( documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	// Matcher for finding list-like elements.
	const itemLikeElementsMatcher = new Matcher( {
		name: /^p|h\d+$/,
		styles: {
			'mso-list': /.*/
		}
	} );

	const itemLikeElements = [];

	for ( const value of range ) {
		if ( value.type === 'elementStart' && itemLikeElementsMatcher.match( value.item ) ) {
			const itemData = getListItemData( value.item );

			itemLikeElements.push( {
				element: value.item,
				id: itemData.id,
				order: itemData.order,
				indent: itemData.indent
			} );
		}
	}

	return itemLikeElements;
}

// Extracts list item style from the provided CSS.
//
// List item style is extracted from CSS stylesheet. Each list with its specific style attribute
// value (`mso-list:l1 level1 lfo1`) has its dedicated properties in a CSS stylesheet defined with a selector like:
//
// 		@list l1:level1 { ... }
//
// It contains `mso-level-number-format` property which defines list numbering/bullet style. If this property
// is not defined it means default `decimal` numbering.
//
// Here CSS string representation is used as `mso-level-number-format` property is an invalid CSS property
// and will be removed during CSS parsing.
//
// @param {Object} listLikeItem List-like item for which list style will be searched for. Usually
// a result of `findAllItemLikeElements()` function.
// @param {String} stylesString CSS stylesheet.
// @returns {Object} result
// @returns {String} result.type List type, could be `ul` or `ol`.
// @returns {String} result.style List style, for example: `decimal`, `lower-roman`, etc. It is extracted
// directly from Word stylesheet without further processing and may be not compatible
// with CSS `list-style-type` property accepted values.
function detectListStyle( listLikeItem, stylesString ) {
	const listStyleRegexp = new RegExp( `@list l${ listLikeItem.id }:level${ listLikeItem.indent }\\s*({[^}]*)`, 'gi' );
	const listStyleTypeRegex = /mso-level-number-format:([^;]*);/gi;

	const listStyleMatch = listStyleRegexp.exec( stylesString );

	let listStyleType = 'decimal'; // Decimal is default one.
	if ( listStyleMatch && listStyleMatch[ 1 ] ) {
		const listStyleTypeMatch = listStyleTypeRegex.exec( listStyleMatch[ 1 ] );

		if ( listStyleTypeMatch && listStyleTypeMatch[ 1 ] ) {
			listStyleType = listStyleTypeMatch[ 1 ].trim();
		}
	}

	return {
		type: listStyleType !== 'bullet' && listStyleType !== 'image' ? 'ol' : 'ul',
		style: listStyleType
	};
}

// Creates empty list of a given type and inserts it after a specified element.
//
// @param {Object} listStyle List style object which determines the type of newly created list.
// Usually a result of `detectListStyle()` function.
// @param {module:engine/view/element~Element} element Element before which list is inserted.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {module:engine/view/element~Element} Newly created list element.
function insertNewEmptyList( listStyle, element, writer ) {
	const list = new Element( listStyle.type );
	const position = element.parent.getChildIndex( element );

	writer.insertChild( position, list, element.parent );

	return list;
}

// Transforms given element into a semantic list item. As the function operates on a provided
// {module:engine/src/view/element~Element element} it will modify the view structure to which this element belongs.
//
// @param {module:engine/view/element~Element} element Element which will be transformed into list item.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {module:engine/view/element~Element} New element to which the given one was transformed. It is
// inserted in place of the old element (the reference to the old element is lost due to renaming).
function transformElementIntoListItem( element, writer ) {
	removeBulletElement( element, writer );

	return writer.rename( 'li', element );
}

// Extracts list item information from Word specific list-like element style:
//
//		`style="mso-list:l1 level1 lfo1"`
//
// where:
//
//		* `l1` is a list id (however it does not mean this is a continuous list - see #43),
//		* `level1` is a list item indentation level,
//		* `lfo1` is a list insertion order in a document.
//
// @param {module:engine/view/element~Element} element Element from which style data is extracted.
// @returns {Object} result
// @returns {Number} result.id Parent list id.
// @returns {Number} result.order List item creation order.
// @returns {Number} result.indent List item indentation level.
function getListItemData( element ) {
	const data = {};
	const listStyle = element.getStyle( 'mso-list' );

	if ( listStyle ) {
		data.id = parseInt( listStyle.match( /(^|\s+)l(\d+)/i )[ 2 ] );
		data.order = parseInt( listStyle.match( /\s*lfo(\d+)/i )[ 1 ] );
		data.indent = parseInt( listStyle.match( /\s*level(\d+)/i )[ 1 ] );
	}

	return data;
}

// Removes span with a numbering/bullet from a given element.
//
// @param {module:engine/view/element~Element} element
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
function removeBulletElement( element, writer ) {
	// Matcher for finding `span` elements holding lists numbering/bullets.
	const bulletMatcher = new Matcher( {
		name: 'span',
		styles: {
			'mso-list': 'Ignore'
		}
	} );

	const range = writer.createRangeIn( element );

	for ( const value of range ) {
		if ( value.type === 'elementStart' && bulletMatcher.match( value.item ) ) {
			writer.remove( value.item );
		}
	}
}

// Whether previous and current item belongs to the same list. It is determined based on `item.id`
// (extracted from `mso-list` style, see #getListItemData) and previous sibling of the current item.
//
// @param {Object} previousItem
// @param {Object} currentItem
// @returns {Boolean}
function isNewListNeeded( previousItem, currentItem ) {
	if ( previousItem.id !== currentItem.id ) {
		return true;
	}

	const previousSibling = currentItem.element.previousSibling;

	if ( !previousSibling ) {
		return true;
	}

	// Even with the same id the list does not have to be continuous (#43).
	return !previousSibling.is( 'ul' ) && !previousSibling.is( 'ol' );
}
