/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/list
 */

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

	const writer = new UpcastWriter( documentFragment.document );
	const itemLikeElements = findAllItemLikeElements( documentFragment, writer );

	if ( !itemLikeElements.length ) {
		return;
	}

	let currentList = null;

	itemLikeElements.forEach( ( itemLikeElement, i ) => {
		const isDifferentList = belongsToTheSameList( itemLikeElements[ i - 1 ], itemLikeElement );
		const previousItemLikeElement = isDifferentList ? null : itemLikeElements[ i - 1 ];
		const indentationDifference = getIndentationDifference( previousItemLikeElement, itemLikeElement );

		// If item from a new list is encountered, reset "currentList" which points to a previous list element.
		if ( isDifferentList ) {
			currentList = null;
		}

		if ( !currentList || indentationDifference !== 0 ) {
			const listStyle = detectListStyle( itemLikeElement, stylesString );

			// Current list item has indentation level lower than the previous item.
			// Find the list element with correct indentation level where current list item should be inserted.
			if ( indentationDifference < 0 ) {
				currentList = findParentListAtLevel( currentList, indentationDifference );

				// List might have been inserted with a different list style (triggered by the item nested inside
				// it with different list style) so it should be adjusted to the current list item style.
				if ( !currentList.is( listStyle.type ) ) {
					currentList = writer.rename( listStyle.type, currentList );
				}
			// Current list item has indentation level greater than the previous item. Insert correctly nested new list.
			} else if ( indentationDifference > 0 ) {
				if ( currentList ) {
					const lastListItem = currentList.getChild( currentList.childCount - 1 );
					const lastListItemChild = lastListItem.getChild( lastListItem.childCount - 1 );

					// Insert new list element on the end of the last list item in the current list. Since new list element
					// will be inserted inside list item we need one level less of nesting ("indentationDifference - 1").
					currentList = insertNewEmptyList( listStyle, lastListItemChild, writer, indentationDifference - 1 );
				} else {
					// First item in the list has indentation.
					currentList = insertNewEmptyList( listStyle, itemLikeElement.element, writer, indentationDifference );
				}
			// Current list item has indentation level at the same level as previous item.
			} else {
				currentList = insertNewEmptyList( listStyle, itemLikeElement.element, writer );
			}
		}

		const listItem = transformElementIntoListItem( itemLikeElement.element, writer );

		writer.appendChild( listItem, currentList );
	} );
}

/**
 * Removes paragraph wrapping content inside a list item.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment
 * @param {module:engine/view/upcastwriter~UpcastWriter} writer
 */
export function unwrapParagraphInListItem( documentFragment, writer ) {
	for ( const value of writer.createRangeIn( documentFragment ) ) {
		const element = value.item;

		if ( element.is( 'li' ) ) {
			// Google Docs allows on single paragraph inside LI.
			const firstChild = element.getChild( 0 );

			if ( firstChild.is( 'p' ) ) {
				writer.unwrapElement( firstChild );
			}
		}
	}
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
// @param {module:engine/view/element~Element} element Element after which list is inserted.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @param {Number} [wrap=0] How many times new empty list element should be wrapped into another list to created nested structure.
// @returns {module:engine/view/element~Element} Newly created list element.
function insertNewEmptyList( listStyle, element, writer, wrap = 0 ) {
	const parent = element.parent;
	const list = writer.createElement( listStyle.type );
	const position = parent.getChildIndex( element ) + 1;

	let currentList = list;

	// Wrap new list into li's depending on indentation level.
	if ( wrap > 0 ) {
		for ( let i = 0; i < wrap; i++ ) {
			const parentList = new Element( listStyle.type );
			const parentLi = new Element( 'li' );
			writer.appendChild( currentList, parentLi );
			writer.appendChild( parentLi, parentList );
			currentList = parentList;
		}
	}

	writer.insertChild( position, currentList, parent );

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
		const idMatch = listStyle.match( /(^|\s+)l(\d+)/i );
		const orderMatch = listStyle.match( /\s*lfo(\d+)/i );
		const indentMatch = listStyle.match( /\s*level(\d+)/i );

		if ( idMatch && orderMatch && indentMatch ) {
			data.id = idMatch[ 2 ];
			data.order = orderMatch[ 1 ];
			data.indent = indentMatch[ 1 ];
		}
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
function belongsToTheSameList( previousItem, currentItem ) {
	if ( !previousItem ) {
		return true;
	}

	if ( previousItem.id !== currentItem.id ) {
		return true;
	}

	const previousSibling = currentItem.element.previousSibling;

	if ( !previousSibling ) {
		return true;
	}

	// Even with the same id the list does not have to be continuous (#43).
	return !isList( previousSibling );
}

function isList( element ) {
	return element.is( 'ol' ) || element.is( 'ul' );
}

// Calculates the indentation difference between two given list items (based on indent attribute
// extracted from `mso-list` style, see #getListItemData).
//
// @param {Object} previousItem
// @param {Object} currentItem
// @returns {Number}
function getIndentationDifference( previousItem, currentItem ) {
	return previousItem ? currentItem.indent - previousItem.indent : currentItem.indent - 1;
}

// Finds parent list element (ul/ol) of a given list element with indentation level lower by a given value.
//
// @param {module:engine/view/element~Element} listElement List element from which to start looking for a parent list.
// @param {Number} indentationDifference Indentation difference between lists.
// @returns {module:engine/view/element~Element} Found list element with indentation level lower by a given value.
function findParentListAtLevel( listElement, indentationDifference ) {
	const ancestors = listElement.getAncestors( { parentFirst: true } );

	let parentList = null;
	let levelChange = 0;

	for ( const ancestor of ancestors ) {
		if ( ancestor.name === 'ul' || ancestor.name === 'ol' ) {
			levelChange--;
		}

		if ( levelChange === indentationDifference ) {
			parentList = ancestor;
			break;
		}
	}

	return parentList;
}
