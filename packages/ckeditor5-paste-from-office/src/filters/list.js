/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/list
 */

import Element from '@ckeditor/ckeditor5-engine/src/view/element';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import Position from '@ckeditor/ckeditor5-engine/src/view/position';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/view/treewalker';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

/**
 * Transforms Word specific list-like elements to the semantic HTML lists.
 *
 * Lists in Word are represented by block elements with special attributes like:
 *
 *		<p class=MsoListParagraphCxSpFirst style='mso-list:l1 level1 lfo1'>...</p> // Paragraph based list.
 *		<h1 style='mso-list:l0 level1 lfo1'>...</h1> // Heading 1 based list.
 *
 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} bodyView The view
 * structure which to transform.
 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} The view
 * structure instance with list-like elements transformed into semantic lists.
 */
export function transformParagraphsToLists( bodyView, stylesString ) {
	const firstChild = bodyView.getChild( 0 );

	if ( firstChild ) {
		const listNodes = findAllListNodes( Position.createBefore( firstChild ) );
		createLists( listNodes, stylesString );
	}

	return bodyView;
}

// Finds all list-like nodes starting from a given position.
//
// @param {module:engine/src/view/position~Position} startPosition Position from which to start looking.
// @returns {Array.<Object>} Array of found list items. Each item is an object containing:
//
//		* {module:engine/src/view/element~Element} element List-like element.
//		* {Number} id List item id parsed from `mso-list` style (see `getListItemData()` function).
//		* {Number} order List item creation order parsed from `mso-list` style (see `getListItemData()` function).
//		* {Number} indent List item indentation level parsed from `mso-list` style (see `getListItemData()` function).
function findAllListNodes( startPosition ) {
	const treeWalker = new TreeWalker( { startPosition, ignoreElementEnd: true } );

	// Matcher for finding list-like elements.
	const listMatcher = new Matcher( {
		name: /^p|h\d+$/,
		styles: {
			'mso-list': /.*/
		}
	} );

	// Find all list nodes.
	const listNodes = [];

	for ( const value of treeWalker ) {
		if ( value.type === 'elementStart' && listMatcher.match( value.item ) ) {
			const itemData = getListItemData( value.item );

			listNodes.push( {
				element: value.item,
				id: itemData.id,
				order: itemData.order,
				indent: itemData.indent
			} );
		}
	}

	return listNodes;
}

// Transforms given list-like nodes into semantic lists. As the function operates on a provided
// {module:engine/src/view/element~Element elements}, it will modify the view structure to which those list elements belongs.
//
// @param {Array.<Object>} listItems Array containing list items data. Usually it is the output of `findAllListNodes()` function.
// @param {String} styles CSS styles which may contain additional data about lists format.
function createLists( listItems, styles ) {
	if ( listItems.length ) {
		const writer = new UpcastWriter();

		let currentList = null;
		let previousListItem = null;

		for ( const listItem of listItems ) {
			const listNode = listItem.element;

			if ( !previousListItem || previousListItem.id !== listItem.id ) {
				const listStyle = findListType( listItem, styles );
				currentList = new Element( listStyle.type );
				writer.insertChild( listNode.parent.getChildIndex( listNode ), currentList, listNode.parent );
			}

			removeBulletElement( listNode, writer );

			writer.appendChild( listNode, currentList );
			writer.rename( 'li', listNode );

			previousListItem = listItem;
		}
	}
}

// Extracts list information from Word specific list style like:
//
//		`style="mso-list:l1 level1 lfo1"`
//
// where:
//
//		* `l1` is a list id (all elements with the same id belongs to the same list),
//		* `level1` is a list item indentation level,
//		* `lfo1` is a list insertion order in a document.
//
// @param {module:engine/view/element~Element} element List-like element from which data is extracted.
// @returns {Object} result
// @returns {Number} result.id List id.
// @returns {Number} result.order List creation order.
// @returns {Number} result.indent List indentation level.
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

// Checks list item style based on a provided CSS.
//
// List item style is extracted from CSS stylesheet. Each list with its specific style attribute value (`mso-list:l1 level1 lfo1`)
// has its dedicated properties in a CSS stylesheet defined with a selector like:
//
// 		@list l1:level1 { ... }
//
// It contains `mso-level-number-format` property which defines list numbering/bullet style. If this property
// is not defined it means default `decimal` numbering.
//
// Here CSS string representation is used as `mso-level-number-format` is invalid CSS property which gets removed during parsing.
//
// @param {Object} listItem List item for which list style will be searched for.
// @param {String} styles CSS stylesheet.
// @returns {Object} result
// @returns {String} result.type Type of the list, could be `ul` or `ol`.
// @returns {String} result.style List style like `decimal`, `lower-roman`, etc. It is passed directly from Word stylesheet
// so may be not compatible with CSS `list-style-type` accepted values.
function findListType( listItem, styles ) {
	const listStyleRegexp = new RegExp( `@list l${ listItem.id }:level${ listItem.indent }\\s*({[^}]*)`, 'gi' );
	const listStyleTypeRegex = /mso-level-number-format:([^;]*);/gi;

	const listStyleMatch = listStyleRegexp.exec( styles );

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

// Removes span with a numbering/bullet from the given list element.
//
// @param {module:engine/view/element~Element} listElement
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
function removeBulletElement( listElement, writer ) {
	// Matcher for finding `span` elements holding lists numbering/bullets.
	const bulletMatcher = new Matcher( {
		name: 'span',
		styles: {
			'mso-list': 'Ignore'
		}
	} );

	const treeWalker = new TreeWalker( { startPosition: Position.createBefore( listElement.getChild( 0 ) ), ignoreElementEnd: true } );

	for ( const value of treeWalker ) {
		if ( value.type === 'elementStart' && bulletMatcher.match( value.item ) ) {
			writer.remove( value.item );
		}
	}
}
