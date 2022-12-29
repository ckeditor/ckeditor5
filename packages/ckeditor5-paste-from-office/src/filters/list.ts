/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/list
 */

import {
	Matcher,
	UpcastWriter,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewNode,
	type ViewText
} from 'ckeditor5/src/engine';

/**
 * Transforms Word specific list-like elements to the semantic HTML lists.
 *
 * Lists in Word are represented by block elements with special attributes like:
 *
 * ```xml
 * <p class=MsoListParagraphCxSpFirst style='mso-list:l1 level1 lfo1'>...</p> // Paragraph based list.
 * <h1 style='mso-list:l0 level1 lfo1'>...</h1> // Heading 1 based list.
 * ```
 *
 * @param documentFragment The view structure to be transformed.
 * @param stylesString Styles from which list-like elements styling will be extracted.
 */
export function transformListItemLikeElementsIntoLists(
	documentFragment: ViewDocumentFragment,
	stylesString: string
): void {
	if ( !documentFragment.childCount ) {
		return;
	}

	const writer = new UpcastWriter( documentFragment.document );
	const itemLikeElements = findAllItemLikeElements( documentFragment, writer );

	if ( !itemLikeElements.length ) {
		return;
	}

	let currentList: ViewElement | null = null;
	let currentIndentation = 1;

	itemLikeElements.forEach( ( itemLikeElement, i ) => {
		const isDifferentList = isNewListNeeded( itemLikeElements[ i - 1 ], itemLikeElement );
		const previousItemLikeElement = isDifferentList ? null : itemLikeElements[ i - 1 ];
		const indentationDifference = getIndentationDifference( previousItemLikeElement, itemLikeElement );

		if ( isDifferentList ) {
			currentList = null;
			currentIndentation = 1;
		}

		if ( !currentList || indentationDifference !== 0 ) {
			const listStyle = detectListStyle( itemLikeElement, stylesString );

			if ( !currentList ) {
				currentList = insertNewEmptyList( listStyle, itemLikeElement.element, writer );
			} else if ( itemLikeElement.indent > currentIndentation ) {
				const lastListItem = currentList.getChild( currentList.childCount - 1 ) as ViewElement;
				const lastListItemChild = lastListItem!.getChild( lastListItem.childCount - 1 ) as ViewElement;

				currentList = insertNewEmptyList( listStyle, lastListItemChild, writer );
				currentIndentation += 1;
			} else if ( itemLikeElement.indent < currentIndentation ) {
				const differentIndentation = currentIndentation - itemLikeElement.indent;

				currentList = findParentListAtLevel( currentList, differentIndentation );
				currentIndentation = itemLikeElement.indent;
			}

			if ( itemLikeElement.indent <= currentIndentation ) {
				if ( !currentList.is( 'element', listStyle.type ) ) {
					currentList = writer.rename( listStyle.type, currentList );
				}
			}
		}

		const listItem = transformElementIntoListItem( itemLikeElement.element, writer );

		writer.appendChild( listItem, currentList! );
	} );
}

/**
 * Removes paragraph wrapping content inside a list item.
 */
export function unwrapParagraphInListItem(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): void {
	for ( const value of writer.createRangeIn( documentFragment ) ) {
		const element = value.item;

		if ( element.is( 'element', 'li' ) ) {
			// Google Docs allows for single paragraph inside LI.
			const firstChild = element.getChild( 0 );

			if ( firstChild && firstChild.is( 'element', 'p' ) ) {
				writer.unwrapElement( firstChild );
			}
		}
	}
}

/**
 * Finds all list-like elements in a given document fragment.
 *
 * @param documentFragment Document fragment in which to look for list-like nodes.
 * @returns Array of found list-like items. Each item is an object containing:
 */
function findAllItemLikeElements(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): Array<ListLikeElement> {
	const range = writer.createRangeIn( documentFragment );

	// Matcher for finding list-like elements.
	const itemLikeElementsMatcher = new Matcher( {
		name: /^p|h\d+$/,
		styles: {
			'mso-list': /.*/
		}
	} );

	const itemLikeElements: Array<ListLikeElement> = [];

	for ( const value of range ) {
		if ( value.type === 'elementStart' && itemLikeElementsMatcher.match( value.item as ViewElement ) ) {
			const itemData = getListItemData( value.item as ViewElement );

			itemLikeElements.push( {
				element: value.item as ViewElement,
				id: itemData.id,
				order: itemData.order,
				indent: itemData.indent
			} );
		}
	}

	return itemLikeElements;
}

/**
 * Extracts list item style from the provided CSS.
 *
 * List item style is extracted from the CSS stylesheet. Each list with its specific style attribute
 * value (`mso-list:l1 level1 lfo1`) has its dedicated properties in a CSS stylesheet defined with a selector like:
 *
 * ```css
 * @list l1:level1 { ... }
 * ```
 *
 * It contains `mso-level-number-format` property which defines list numbering/bullet style. If this property
 * is not defined it means default `decimal` numbering.
 *
 * Here CSS string representation is used as `mso-level-number-format` property is an invalid CSS property
 * and will be removed during CSS parsing.
 *
 * @param listLikeItem List-like item for which list style will be searched for. Usually
 * a result of `findAllItemLikeElements()` function.
 * @param stylesString CSS stylesheet.
 * @returns An object with properties:
 *
 * * type - List type, could be `ul` or `ol`.
 * * startIndex - List start index, valid only for ordered lists.
 * * style - List style, for example: `decimal`, `lower-roman`, etc. It is extracted
 *     directly from Word stylesheet and adjusted to represent proper values for the CSS `list-style-type` property.
 *     If it cannot be adjusted, the `null` value is returned.
 */
function detectListStyle( listLikeItem: ListLikeElement, stylesString: string ) {
	const listStyleRegexp = new RegExp( `@list l${ listLikeItem.id }:level${ listLikeItem.indent }\\s*({[^}]*)`, 'gi' );
	const listStyleTypeRegex = /mso-level-number-format:([^;]{0,100});/gi;
	const listStartIndexRegex = /mso-level-start-at:\s{0,100}([0-9]{0,10})\s{0,100};/gi;

	const listStyleMatch = listStyleRegexp.exec( stylesString );

	let listStyleType = 'decimal'; // Decimal is default one.
	let type = 'ol'; // <ol> is default list.
	let startIndex = null;

	if ( listStyleMatch && listStyleMatch[ 1 ] ) {
		const listStyleTypeMatch = listStyleTypeRegex.exec( listStyleMatch[ 1 ] );

		if ( listStyleTypeMatch && listStyleTypeMatch[ 1 ] ) {
			listStyleType = listStyleTypeMatch[ 1 ].trim();
			type = listStyleType !== 'bullet' && listStyleType !== 'image' ? 'ol' : 'ul';
		}

		// Styles for the numbered lists are always defined in the Word CSS stylesheet.
		// Unordered lists MAY contain a value for the Word CSS definition `mso-level-text` but sometimes
		// this tag is missing. And because of that, we cannot depend on that. We need to predict the list style value
		// based on the list style marker element.
		if ( listStyleType === 'bullet' ) {
			const bulletedStyle = findBulletedListStyle( listLikeItem.element );

			if ( bulletedStyle ) {
				listStyleType = bulletedStyle;
			}
		} else {
			const listStartIndexMatch = listStartIndexRegex.exec( listStyleMatch[ 1 ] );

			if ( listStartIndexMatch && listStartIndexMatch[ 1 ] ) {
				startIndex = parseInt( listStartIndexMatch[ 1 ] );
			}
		}
	}

	return {
		type,
		startIndex,
		style: mapListStyleDefinition( listStyleType )
	};
}

/**
 * Tries to extract the `list-style-type` value based on the marker element for bulleted list.
 */
function findBulletedListStyle( element: ViewElement ) {
	const listMarkerElement = findListMarkerNode( element );

	if ( !listMarkerElement ) {
		return null;
	}

	const listMarker = listMarkerElement._data;

	if ( listMarker === 'o' ) {
		return 'circle';
	} else if ( listMarker === '·' ) {
		return 'disc';
	}
	// Word returns '§' instead of '■' for the square list style.
	else if ( listMarker === '§' ) {
		return 'square';
	}

	return null;
}

/**
 * Tries to find a text node that represents the marker element (list-style-type).
 */
function findListMarkerNode( element: ViewElement ): ViewText | null {
	// If the first child is a text node, it is the data for the element.
	// The list-style marker is not present here.
	if ( element.getChild( 0 )!.is( '$text' ) ) {
		return null;
	}

	for ( const childNode of element.getChildren() ) {
		// The list-style marker will be inside the `<span>` element. Let's ignore all non-span elements.
		// It may happen that the `<a>` element is added as the first child. Most probably, it's an anchor element.
		if ( !childNode.is( 'element', 'span' ) ) {
			continue;
		}

		const textNodeOrElement = childNode.getChild( 0 )!;

		// If already found the marker element, use it.
		if ( textNodeOrElement.is( '$text' ) ) {
			return textNodeOrElement;
		}

		return ( textNodeOrElement as any ).getChild( 0 );
	}

	/* istanbul ignore next */
	return null;
}

/**
 * Parses the `list-style-type` value extracted directly from the Word CSS stylesheet and returns proper CSS definition.
 */
function mapListStyleDefinition( value: string ) {
	if ( value.startsWith( 'arabic-leading-zero' ) ) {
		return 'decimal-leading-zero';
	}

	switch ( value ) {
		case 'alpha-upper':
			return 'upper-alpha';
		case 'alpha-lower':
			return 'lower-alpha';
		case 'roman-upper':
			return 'upper-roman';
		case 'roman-lower':
			return 'lower-roman';
		case 'circle':
		case 'disc':
		case 'square':
			return value;
		default:
			return null;
	}
}

/**
 * Creates an empty list of a given type and inserts it after a specified element.
 *
 * @param listStyle List style object which determines the type of newly created list.
 * Usually a result of `detectListStyle()` function.
 * @param element Element after which list is inserted.
 * @returns Newly created list element.
 */
function insertNewEmptyList(
	listStyle: ReturnType<typeof detectListStyle>,
	element: ViewElement,
	writer: UpcastWriter
) {
	const parent = element.parent!;
	const list = writer.createElement( listStyle.type );
	const position = parent.getChildIndex( element ) + 1;

	writer.insertChild( position, list, parent );

	// We do not support modifying the marker for a particular list item.
	// Set the value for the `list-style-type` property directly to the list container.
	if ( listStyle.style ) {
		writer.setStyle( 'list-style-type', listStyle.style, list );
	}

	if ( listStyle.startIndex && listStyle.startIndex > 1 ) {
		writer.setAttribute( 'start', listStyle.startIndex, list );
	}

	return list;
}

/**
 * Transforms a given element into a semantic list item. As the function operates on a provided
 * {module:engine/src/view/element~Element element} it will modify the view structure to which this element belongs.
 *
 * @param element Element which will be transformed into a list item.
 * @returns New element to which the given one was transformed. It is
 * inserted in place of the old element (the reference to the old element is lost due to renaming).
 */
function transformElementIntoListItem( element: ViewElement, writer: UpcastWriter ) {
	removeBulletElement( element, writer );

	return writer.rename( 'li', element )!;
}

/**
 * Extracts list item information from Word specific list-like element style:
 *
 * ```
 * `style="mso-list:l1 level1 lfo1"`
 * ```
 *
 * where:
 *
 * ```
 * * `l1` is a list id (however it does not mean this is a continuous list - see #43),
 * * `level1` is a list item indentation level,
 * * `lfo1` is a list insertion order in a document.
 * ```
 *
 * @param element Element from which style data is extracted.
 */
function getListItemData( element: ViewElement ): ListItemData {
	const data: ListItemData = {} as any;
	const listStyle = element.getStyle( 'mso-list' );

	if ( listStyle ) {
		const idMatch = listStyle.match( /(^|\s{1,100})l(\d+)/i );
		const orderMatch = listStyle.match( /\s{0,100}lfo(\d+)/i );
		const indentMatch = listStyle.match( /\s{0,100}level(\d+)/i );

		if ( idMatch && orderMatch && indentMatch ) {
			data.id = idMatch[ 2 ];
			data.order = orderMatch[ 1 ];
			data.indent = parseInt( indentMatch[ 1 ] );
		}
	}

	return data;
}

/**
 * Removes span with a numbering/bullet from a given element.
 */
function removeBulletElement( element: ViewElement, writer: UpcastWriter ) {
	// Matcher for finding `span` elements holding lists numbering/bullets.
	const bulletMatcher = new Matcher( {
		name: 'span',
		styles: {
			'mso-list': 'Ignore'
		}
	} );

	const range = writer.createRangeIn( element );

	for ( const value of range ) {
		if ( value.type === 'elementStart' && bulletMatcher.match( value.item as ViewElement ) ) {
			writer.remove( value.item as ViewElement );
		}
	}
}

/**
 * Whether the previous and current items belong to the same list. It is determined based on `item.id`
 * (extracted from `mso-list` style, see #getListItemData) and a previous sibling of the current item.
 *
 * However, it's quite easy to change the `id` attribute for nested lists in Word. It will break the list feature while pasting.
 * Let's check also the `indent` attribute. If the difference between those two elements is equal to 1, we can assume that
 * the `currentItem` is a beginning of the nested list because lists in CKEditor 5 always start with the `indent=0` attribute.
 * See: https://github.com/ckeditor/ckeditor5/issues/7805.
 */
function isNewListNeeded( previousItem: ListLikeElement, currentItem: ListLikeElement ) {
	if ( !previousItem ) {
		return true;
	}

	if ( previousItem.id !== currentItem.id ) {
		// See: https://github.com/ckeditor/ckeditor5/issues/7805.
		//
		// * List item 1.
		//     - Nested list item 1.
		if ( currentItem.indent - previousItem.indent === 1 ) {
			return false;
		}

		return true;
	}

	const previousSibling = currentItem.element.previousSibling;

	if ( !previousSibling ) {
		return true;
	}

	// Even with the same id the list does not have to be continuous (#43).
	return !isList( previousSibling );
}

function isList( element: ViewNode ) {
	return element.is( 'element', 'ol' ) || element.is( 'element', 'ul' );
}

/**
 * Calculates the indentation difference between two given list items (based on the indent attribute
 * extracted from the `mso-list` style, see #getListItemData).
 */
function getIndentationDifference( previousItem: ListLikeElement | null, currentItem: ListLikeElement ) {
	return previousItem ? currentItem.indent - previousItem.indent : currentItem.indent - 1;
}

/**
 * Finds the parent list element (ul/ol) of a given list element with indentation level lower by a given value.
 *
 * @param listElement List element from which to start looking for a parent list.
 * @param indentationDifference Indentation difference between lists.
 * @returns Found list element with indentation level lower by a given value.
 */
function findParentListAtLevel( listElement: ViewElement, indentationDifference: number ) {
	const ancestors = listElement.getAncestors( { parentFirst: true } );

	let parentList = null;
	let levelChange = 0;

	for ( const ancestor of ancestors ) {
		if ( ancestor.is( 'element', 'ul' ) || ancestor.is( 'element', 'ol' ) ) {
			levelChange++;
		}

		if ( levelChange === indentationDifference ) {
			parentList = ancestor;
			break;
		}
	}

	return parentList as ViewElement;
}

interface ListItemData {

	/**
	 * Parent list id.
	 */
	id: string;

	/**
	 * List item creation order.
	 */
	order: string;

	/**
	 * List item indentation level.
	 */
	indent: number;
}

interface ListLikeElement extends ListItemData {

	/**
	 * List-like element.
	 */
	element: ViewElement;
}
