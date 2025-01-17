/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
} from 'ckeditor5/src/engine.js';

import {
	convertCssLengthToPx,
	isPx,
	toPx
} from './utils.js';

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
	stylesString: string,
	hasMultiLevelListPlugin: boolean
): void {
	if ( !documentFragment.childCount ) {
		return;
	}

	const writer = new UpcastWriter( documentFragment.document );
	const itemLikeElements = findAllItemLikeElements( documentFragment, writer );

	if ( !itemLikeElements.length ) {
		return;
	}

	const encounteredLists: Record<string, number> = {};

	const stack: Array<ListLikeElement & {
		listElement: ViewElement;
		listItemElements: Array<ViewElement>;
	}> = [];

	for ( const itemLikeElement of itemLikeElements ) {
		if ( itemLikeElement.indent !== undefined ) {
			if ( !isListContinuation( itemLikeElement ) ) {
				stack.length = 0;
			}

			// Combined list ID for addressing encounter lists counters.
			const originalListId = `${ itemLikeElement.id }:${ itemLikeElement.indent }`;

			// Normalized list item indentation.
			const indent = Math.min( itemLikeElement.indent - 1, stack.length );

			// Trimming of the list stack on list ID change.
			if ( indent < stack.length && stack[ indent ].id !== itemLikeElement.id ) {
				stack.length = indent;
			}

			// Trimming of the list stack on lower indent list encountered.
			if ( indent < stack.length - 1 ) {
				stack.length = indent + 1;
			}
			else {
				const listStyle = detectListStyle( itemLikeElement, stylesString );

				// Create a new OL/UL if required (greater indent or different list type).
				if ( indent > stack.length - 1 || stack[ indent ].listElement.name != listStyle.type ) {
					// Check if there is some start index to set from a previous list.
					if (
						indent == 0 &&
						listStyle.type == 'ol' &&
						itemLikeElement.id !== undefined &&
						encounteredLists[ originalListId ]
					) {
						listStyle.startIndex = encounteredLists[ originalListId ];
					}

					const listElement = createNewEmptyList( listStyle, writer, hasMultiLevelListPlugin );

					// Apply list padding only if we have margins for the item and the parent item.
					if (
						isPx( itemLikeElement.marginLeft ) &&
						( indent == 0 || isPx( stack[ indent - 1 ].marginLeft ) )
					) {
						let marginLeft = itemLikeElement.marginLeft;

						if ( indent > 0 ) {
							// Convert the padding from absolute to relative.
							marginLeft = toPx( parseFloat( marginLeft ) - parseFloat( stack[ indent - 1 ].marginLeft! ) );
						}

						writer.setStyle( 'padding-left', marginLeft, listElement );
					}

					// Insert the new OL/UL.
					if ( stack.length == 0 ) {
						const parent = itemLikeElement.element.parent!;
						const index = parent.getChildIndex( itemLikeElement.element ) + 1;

						writer.insertChild( index, listElement, parent );
					} else {
						const parentListItems = stack[ indent - 1 ].listItemElements;

						writer.appendChild( listElement, parentListItems[ parentListItems.length - 1 ] );
					}

					// Update the list stack for other items to reference.
					stack[ indent ] = {
						...itemLikeElement,
						listElement,
						listItemElements: []
					};

					// Prepare list counter for start index.
					if ( indent == 0 && itemLikeElement.id !== undefined ) {
						encounteredLists[ originalListId ] = listStyle.startIndex || 1;
					}
				}
			}

			// Use LI if it is already it or create a new LI element.
			// https://github.com/ckeditor/ckeditor5/issues/15964
			const listItem = itemLikeElement.element.name == 'li' ? itemLikeElement.element : writer.createElement( 'li' );

			// Append the LI to OL/UL.
			writer.appendChild( listItem, stack[ indent ].listElement );
			stack[ indent ].listItemElements.push( listItem );

			// Increment list counter.
			if ( indent == 0 && itemLikeElement.id !== undefined ) {
				encounteredLists[ originalListId ]++;
			}

			// Append list block to LI.
			if ( itemLikeElement.element != listItem ) {
				writer.appendChild( itemLikeElement.element, listItem );
			}

			// Clean list block.
			removeBulletElement( itemLikeElement.element, writer );
			writer.removeStyle( 'text-indent', itemLikeElement.element ); // #12361
			writer.removeStyle( 'margin-left', itemLikeElement.element );
		}
		else {
			// Other blocks in a list item.
			const stackItem = stack.find( stackItem => stackItem.marginLeft == itemLikeElement.marginLeft );

			// This might be a paragraph that has known margin, but it is not a real list block.
			if ( stackItem ) {
				const listItems = stackItem.listItemElements;

				// Append block to LI.
				writer.appendChild( itemLikeElement.element, listItems[ listItems.length - 1 ] );
				writer.removeStyle( 'margin-left', itemLikeElement.element );
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
		// https://github.com/ckeditor/ckeditor5/issues/15964
		if ( !item.is( 'element' ) || !item.name.match( /^(p|h\d+|li|div)$/ ) ) {
			continue;
		}

		// Try to rely on margin-left style to find paragraphs visually aligned with previously encountered list item.
		let marginLeft = getMarginLeftNormalized( item );

		// Ignore margin-left 0 style if there is no MsoList... class.
		if (
			marginLeft !== undefined &&
			parseFloat( marginLeft ) == 0 &&
			!Array.from( item.getClassNames() ).find( className => className.startsWith( 'MsoList' ) )
		) {
			marginLeft = undefined;
		}

		// List item or a following list item block.
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

	return itemLikeElements;
}

/**
 * Whether the given element is possibly a list continuation. Previous element was wrapped into a list
 * or the current element already is inside a list.
 */
function isListContinuation( currentItem: ListLikeElement ) {
	const previousSibling = currentItem.element.previousSibling;

	if ( !previousSibling ) {
		// If it's a li inside ul or ol like in here: https://github.com/ckeditor/ckeditor5/issues/15964.
		return isList( currentItem.element.parent as ViewElement );
	}

	// Even with the same id the list does not have to be continuous (#43).
	return isList( previousSibling );
}

function isList( element: ViewNode ) {
	return element.is( 'element', 'ol' ) || element.is( 'element', 'ul' );
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
	const legalStyleListRegex = new RegExp( `@list\\s+l${ listLikeItem.id }:level\\d\\s*{[^{]*mso-level-text:"%\\d\\\\.`, 'gi' );
	const multiLevelNumberFormatTypeRegex = new RegExp( `@list l${ listLikeItem.id }:level\\d\\s*{[^{]*mso-level-number-format:`, 'gi' );

	const legalStyleListMatch = legalStyleListRegex.exec( stylesString );
	const multiLevelNumberFormatMatch = multiLevelNumberFormatTypeRegex.exec( stylesString );

	// Multi level lists in Word have mso-level-number-format attribute except legal lists,
	// so we used that. If list has legal list match and doesn't has mso-level-number-format
	// then this is legal-list.
	const islegalStyleList = legalStyleListMatch && !multiLevelNumberFormatMatch;

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

		if ( islegalStyleList ) {
			type = 'ol';
		}
	}

	return {
		type,
		startIndex,
		style: mapListStyleDefinition( listStyleType ),
		isLegalStyleList: islegalStyleList
	};
}

/**
 * Tries to extract the `list-style-type` value based on the marker element for bulleted list.
 */
function findBulletedListStyle( element: ViewElement ) {
	// https://github.com/ckeditor/ckeditor5/issues/15964
	if ( element.name == 'li' && element.parent!.name == 'ul' && element.parent!.hasAttribute( 'type' ) ) {
		return element.parent!.getAttribute( 'type' );
	}

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
 * Creates a new list OL/UL element.
 */
function createNewEmptyList(
	listStyle: ReturnType<typeof detectListStyle>,
	writer: UpcastWriter,
	hasMultiLevelListPlugin: boolean
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

	if ( listStyle.isLegalStyleList && hasMultiLevelListPlugin ) {
		writer.addClass( 'legal-list', list );
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

/**
 * Returns element left margin normalized to 'px' if possible.
 */
function getMarginLeftNormalized( element: ViewElement ): string | undefined {
	const value = element.getStyle( 'margin-left' );

	if ( value === undefined || value.endsWith( 'px' ) ) {
		return value;
	}

	return convertCssLengthToPx( value );
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
	 * The margin-left normalized to 'px' if possible.
	 */
	marginLeft?: string;
}
