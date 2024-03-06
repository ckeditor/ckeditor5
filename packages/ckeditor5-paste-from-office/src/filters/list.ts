/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
	type ViewText
} from 'ckeditor5/src/engine.js';

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

	const stack: Array<ListLikeElement & {
		listElement: ViewElement;
		listItemElements: Array<ViewElement>;
	}> = [];

	for ( const itemLikeElement of itemLikeElements ) {
		if ( itemLikeElement.indent !== undefined ) {
			const indent = itemLikeElement.indent - 1;

			if ( indent < stack.length && stack[ indent ].id != itemLikeElement.id ) {
				stack.length = indent;
			}

			if ( indent < stack.length - 1 ) {
				stack.length = indent + 1;
			}
			else if ( indent > stack.length - 1 ) {
				const listStyle = detectListStyle( itemLikeElement, stylesString );
				const listElement = createNewEmptyList( listStyle, writer );

				if ( stack.length == 0 ) {
					const parent = itemLikeElement.element.parent!;
					const index = parent.getChildIndex( itemLikeElement.element ) + 1;

					writer.insertChild( index, listElement, parent );
				} else {
					const parentListItems = stack[ indent - 1 ].listItemElements;

					writer.appendChild( listElement, parentListItems[ parentListItems.length - 1 ] );
				}

				stack[ indent ] = {
					...itemLikeElement,
					listElement,
					listItemElements: []
				};
			}

			const listItem = writer.createElement( 'li' );

			writer.appendChild( listItem, stack[ indent ].listElement );
			stack[ indent ].listItemElements.push( listItem );

			writer.appendChild( itemLikeElement.element, listItem );

			removeBulletElement( itemLikeElement.element, writer );
			writer.removeStyle( 'text-indent', itemLikeElement.element ); // #12361
			writer.removeStyle( 'margin-left', itemLikeElement.element ); // TODO maybe preserve difference (list item vs block indent)
		}
		else {
			// Other blocks in a list item.
			// TODO: find first of equal margin or bigger
			const stackItem = stack.find( stackItem => stackItem.marginLeft == itemLikeElement.marginLeft );

			if ( stackItem ) {
				const listItems = stackItem.listItemElements;

				writer.appendChild( itemLikeElement.element, listItems[ listItems.length - 1 ] );
				writer.removeStyle( 'margin-left', itemLikeElement.element ); // TODO substract stack-item margin
			} else {
				stack.length = 0;
			}
		}
	}
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
	const itemLikeElements: Array<ListLikeElement> = [];
	const foundMargins = new Set<string>();

	for ( const item of range.getItems() ) {
		if ( item.is( 'element' ) && item.name.match( /^(p|h\d+)$/ ) ) {
			// Try to rely on margin-left style to find paragraphs visually aligned with previously encountered list item.
			let marginLeft = item.getStyle( 'margin-left' );

			// Ignore margin-left 0 style if there is no MsoList... class.
			if (
				marginLeft !== undefined &&
				parseFloat( marginLeft ) == 0 &&
				!Array.from( item.getClassNames() ).find( className => className.startsWith( 'MsoList' ) )
			) {
				marginLeft = undefined;
			}

			// List item or a following list item block.
			// TODO make sure that foundMargins has unified units
			if ( item.hasStyle( 'mso-list' ) || marginLeft !== undefined && foundMargins.has( marginLeft ) ) {
				const itemData = getListItemData( item );

				itemLikeElements.push( {
					element: item,
					id: itemData.id,
					order: itemData.order,
					indent: itemData.indent,
					marginLeft
				} );

				if ( marginLeft !== undefined ) {
					foundMargins.add( marginLeft );
				}
			}
			// Clear found margins as we found block after a list.
			else {
				foundMargins.clear();
			}
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

		const textNodeOrElement = childNode.getChild( 0 );

		if ( !textNodeOrElement ) {
			continue;
		}

		// If already found the marker element, use it.
		if ( textNodeOrElement.is( '$text' ) ) {
			return textNodeOrElement;
		}

		return ( textNodeOrElement as any ).getChild( 0 );
	}

	/* istanbul ignore next -- @preserve */
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
 * TODO
 */
function createNewEmptyList(
	listStyle: ReturnType<typeof detectListStyle>,
	writer: UpcastWriter
) {
	const list = writer.createElement( listStyle.type );

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
	const listStyle = element.getStyle( 'mso-list' );

	if ( listStyle === undefined ) {
		return {};
	}

	const idMatch = listStyle.match( /(^|\s{1,100})l(\d+)/i );
	const orderMatch = listStyle.match( /\s{0,100}lfo(\d+)/i );
	const indentMatch = listStyle.match( /\s{0,100}level(\d+)/i );

	if ( idMatch && orderMatch && indentMatch ) {
		return {
			id: idMatch[ 2 ],
			order: orderMatch[ 1 ],
			indent: parseInt( indentMatch[ 1 ] )
		};
	}

	return {
		indent: 1 // Handle empty mso-list style as a marked for default list item.
	};
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

interface ListItemData {

	/**
	 * Parent list id.
	 */
	id?: string;

	/**
	 * List item creation order.
	 */
	order?: string;

	/**
	 * List item indentation level.
	 */
	indent?: number;
}

interface ListLikeElement extends ListItemData {

	/**
	 * List-like element.
	 */
	element: ViewElement;

	/**
	 * TODO
	 */
	marginLeft?: string;
}
