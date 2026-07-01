/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/list
 */

import {
	Matcher,
	ViewUpcastWriter,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewNode,
	type ViewText
} from '@ckeditor/ckeditor5-engine';

import {
	convertCssLengthToPx,
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
 * @param hasMultiLevelListPlugin Whether the editor has the multi-level list plugin enabled.
 * @param enableSkipLevelLists Whether to enable skip-level lists.
 * @internal
 */
export function transformListItemLikeElementsIntoLists(
	documentFragment: ViewDocumentFragment,
	stylesString: string,
	hasMultiLevelListPlugin: boolean,
	enableSkipLevelLists: boolean = false
): void {
	if ( !documentFragment.childCount ) {
		return;
	}

	const writer = new ViewUpcastWriter( documentFragment.document );
	const itemLikeElements = findAllItemLikeElements( documentFragment, writer );

	if ( !itemLikeElements.length ) {
		return;
	}

	// Tracks how many items have been added to each encountered list, keyed by indent level and list ID.
	// Used to set the `start` attribute on a new <ol> when a list at a given indent is interrupted by
	// a non-list block (e.g. a paragraph) and then resumed.
	// Structure: [ { [listId:level]: itemCount } ] (array index is the indent level)
	// Example: [ { '1:1': 3 }, { '0:2': 2 } ] means the top-level list (id=1) has 3 items,
	// and the nested list (id=0) has 2 items so the next continuation should start at 3.
	const encounteredLists: Array<Record<string, number>> = [];

	const stack: ListStack = [];

	let topLevelListInfo: TopLevelListInfo = createTopLevelListInfo();

	for ( const itemLikeElement of itemLikeElements ) {
		if ( itemLikeElement.indent !== undefined ) {
			if ( !isListContinuation( itemLikeElement ) ) {
				applyIndentationToTopLevelList( writer, stack, topLevelListInfo );
				topLevelListInfo = createTopLevelListInfo();
				// Clear counters for nested levels only. The top-level counter (index 0) must survive
				// so that a resumed top-level list (same id, interrupted by a paragraph) can still
				// receive the correct `start` attribute. Nested counters must be cleared because
				// a sibling top-level list item should not inherit the nested list counts from
				// a previous top-level list item.
				encounteredLists.length = 1;
				stack.length = 0;
			}

			// Key used to look up this list inside `encounteredLists[indent]`.
			// Combines the list id and level so that two different lists at the same indent
			// level (e.g. first an <ol>, then a <ul> after a paragraph break) don't share a counter.
			const originalListId = `${ itemLikeElement.id }:${ itemLikeElement.indent }`;

			// When the editor opts into skip-level lists, preserve Word indent gaps (the fill loop below
			// inserts `<li style="list-style-type:none">` wrappers for them). Otherwise clamp to one
			// level below the current stack top — the original pre-skip-level behavior — so the editor's
			// list post-fixer doesn't have to bridge the gap with empty filler paragraphs.
			const indent = enableSkipLevelLists ?
				itemLikeElement.indent - 1 :
				Math.min( itemLikeElement.indent - 1, stack.length );

			// Trimming of the list stack on list ID change.
			if ( indent < stack.length && stack[ indent ].id !== itemLikeElement.id ) {
				// A different list at the top level starts here. `isListContinuation` returned true
				// (the previous sibling in the DOM is the prior list's `<ol>/<ul>`), so the outer reset
				// path didn't run. Flush the prior list's accumulated margin onto its own `<ol>/<ul>`
				// BEFORE the stack reference is replaced — otherwise a later flush would hoist that
				// margin onto the wrong (interrupting) list and strip it from the original list's
				// `<li>`s. The flush is a no-op unless the prior list actually had uniform-margin
				// items pushed, so single-item / mixed-margin lists keep their pre-existing
				// per-`<li>` margin semantics.
				if (
					indent == 0 &&
					topLevelListInfo.canApplyMarginOnList &&
					topLevelListInfo.topLevelListItemElements.length > 0
				) {
					applyIndentationToTopLevelList( writer, stack, topLevelListInfo );
					topLevelListInfo = createTopLevelListInfo();
				}

				// A different list started at this indent level — counters for this level and deeper
				// belong to the previous list context and must not carry over.
				encounteredLists.length = indent;
				stack.length = indent;
			}

			// Trimming of the list stack on lower indent list encountered.
			if ( indent < stack.length - 1 ) {
				// We jumped back to a shallower indent — any counters deeper than the new top are stale.
				encounteredLists.length = indent + 1;
				stack.length = indent + 1;
			}

			const listStyle = detectListStyle( itemLikeElement, stylesString );

			// Word can jump indent levels (e.g. from level 1 directly to level 3) without producing
			// items for the in-between levels. Fill the missing levels with intermediate wrappers —
			// an `<ol>`/`<ul>` of the deepest item's type containing a single `<li style="list-style-type:none">` —
			// so the resulting view matches the shape the skip-level upcast (`listItemSkipLevelConsumer`) expects.
			while ( stack.length < indent ) {
				const intermediateList = writer.createElement( listStyle.type );
				const intermediateListItem = writer.createElement( 'li' );

				writer.setStyle( 'list-style-type', 'none', intermediateListItem );

				if ( stack.length == 0 ) {
					const parent = itemLikeElement.element.parent!;
					const index = parent.getChildIndex( itemLikeElement.element ) + 1;

					writer.insertChild( index, intermediateList, parent );
				} else {
					const parentListItems = stack[ stack.length - 1 ].listItemElements;

					writer.appendChild( intermediateList, parentListItems[ parentListItems.length - 1 ] );
				}

				writer.appendChild( intermediateListItem, intermediateList );

				stack.push( {
					...itemLikeElement,
					listElement: intermediateList,
					listItemElements: [ intermediateListItem ],
					isIntermediate: true,
					// Intermediate wrappers hold no real list item, so they must not pretend to "own" the
					// deep item's `margin-left` — otherwise `stack.find` (matching non-list multi-block
					// continuations by margin) returns the shallower intermediate before the real item.
					marginLeft: undefined
				} );
			}

			// Create a new OL/UL if required (greater indent or different list type).
			if (
				indent > stack.length - 1 ||
				stack[ indent ].listElement.name != listStyle.type
			) {
				// If this list was seen before at this indent (i.e. it was interrupted by a non-list block
				// and is now resuming), set `start` so the numbering continues from where it left off.
				if (
					listStyle.type == 'ol' &&
					itemLikeElement.id !== undefined &&
					encounteredLists[ indent ] &&
					encounteredLists[ indent ][ originalListId ]
				) {
					listStyle.startIndex = encounteredLists[ indent ][ originalListId ];
				}

				const listElement = createNewEmptyList( listStyle, writer, hasMultiLevelListPlugin );

				// Insert the new OL/UL.
				if ( stack.length == 0 ) {
					const parent = itemLikeElement.element.parent!;
					const index = parent.getChildIndex( itemLikeElement.element ) + 1;

					writer.insertChild( index, listElement, parent );
				} else if ( indent == 0 ) {
					// A real list at root indent while a skip-level intermediate of a different type
					// already sits there — insert the new list as a sibling of the intermediate in the
					// same parent (can't merge two lists of different types).
					const existingList = stack[ 0 ].listElement;
					const listParent = existingList.parent!;
					const insertIndex = listParent.getChildIndex( existingList ) + 1;

					writer.insertChild( insertIndex, listElement, listParent );
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

				// Record the starting value for this list so that if it is interrupted and resumed later,
				// the continuation list can pick up numbering from the right value.
				// For a fresh list `listStyle.startIndex` is undefined, so we fall back to 1.
				if ( itemLikeElement.id !== undefined ) {
					if ( !encounteredLists[ indent ] ) {
						encounteredLists[ indent ] = {};
					}

					encounteredLists[ indent ][ originalListId ] = listStyle.startIndex || 1;
				}
			} else if ( stack[ indent ].isIntermediate ) {
				// Same type as the intermediate — reuse its `<ol>`/`<ul>`. The intermediate was created
				// without `list-style-type`, `start`, or the `legal-list` class (the fill loop only sets
				// the tag name); apply them now from the claiming item so the reused element no longer
				// looks like a styleless wrapper.
				applyListStyleToElement( stack[ indent ].listElement, listStyle, writer, hasMultiLevelListPlugin );

				// Update the wrapper to represent the claiming item (id, marginLeft, …) so later lookups
				// don't see stale data from the deep item that originally seeded the intermediate.
				stack[ indent ] = {
					...itemLikeElement,
					listElement: stack[ indent ].listElement,
					listItemElements: stack[ indent ].listItemElements
				};

				// Same as the create-new path: track this list so that if it is interrupted (e.g. by a
				// multi-block paragraph matched against an ancestor frame) and later resumed via a fresh
				// `<ol>`, the continuation can set the correct `start` attribute instead of restarting from 1.
				/* v8 ignore else -- @preserve */
				if ( itemLikeElement.id !== undefined ) {
					/* v8 ignore else -- @preserve */
					if ( !encounteredLists[ indent ] ) {
						encounteredLists[ indent ] = {};
					}

					encounteredLists[ indent ][ originalListId ] = listStyle.startIndex || 1;
				}
			}

			// Use LI if it is already it or create a new LI element.
			// https://github.com/ckeditor/ckeditor5/issues/15964
			const listItem = itemLikeElement.element.name == 'li' ? itemLikeElement.element : writer.createElement( 'li' );

			applyListItemMarginLeftAndUpdateTopLevelInfo( writer, stack, topLevelListInfo, itemLikeElement, listItem, indent );

			// Append the LI to OL/UL.
			writer.appendChild( listItem, stack[ indent ].listElement );
			stack[ indent ].listItemElements.push( listItem );

			// Count the item so that `encounteredLists` always holds the value the *next* continuation list should start at.
			if ( itemLikeElement.id !== undefined && encounteredLists[ indent ] ) {
				encounteredLists[ indent ][ originalListId ]++;
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

			// A non-list block (e.g. a plain paragraph) whose margin-left matches one of the active list items.
			// The match is done by margin-left value — nested list items sometimes have no explicit margin-left,
			// so the match typically resolves to an ancestor <li> rather than the deepest one.
			if ( stackItem ) {
				const listItems = stackItem.listItemElements;

				// Append block to LI.
				writer.appendChild( itemLikeElement.element, listItems[ listItems.length - 1 ] );
				writer.removeStyle( 'margin-left', itemLikeElement.element );

				// Trim the stack to the matched level. Without this, the next nested list item would
				// be appended to the existing nested <ol>/<ul> that appears *before* this paragraph
				// in the DOM, instead of creating a new one *after* it.
				stack.length = stack.indexOf( stackItem ) + 1;
				// Clear counters only for levels deeper than the direct children of the matched <li>.
				// The counter at `stack.length` must survive so the next nested list can continue
				// numbering from where it left off (e.g. <ol start="3">).
				encounteredLists.length = stack.length + 1;
			} else {
				// A non-list block whose margin matches no active list wrapper fully interrupts the
				// current top-level list. Flush the pending uniform margin onto that list (while
				// `stack[ 0 ]` still exists) and reset the info, mirroring the non-continuation reset
				// above — otherwise the stale `topLevelListInfo` would later be flushed against an
				// already-cleared stack, dereferencing `stack[ 0 ]` when it is `undefined`.
				// See https://github.com/ckeditor/ckeditor5-commercial/issues/10255.
				applyIndentationToTopLevelList( writer, stack, topLevelListInfo );
				topLevelListInfo = createTopLevelListInfo();
				stack.length = 0;
			}
		}
	}

	applyIndentationToTopLevelList( writer, stack, topLevelListInfo );
}

function applyListItemMarginLeftAndUpdateTopLevelInfo(
	writer: ViewUpcastWriter,
	stack: ListStack,
	topLevelListInfo: TopLevelListInfo,
	itemLikeElement: ListLikeElement,
	listItem: ViewElement,
	indent: number
) {
	if ( itemLikeElement.marginLeft === undefined ) {
		// If at least one of the list items at indent = 0 does not have margin-left style, we cannot set margin-left on the list.
		if ( indent == 0 ) {
			topLevelListInfo.canApplyMarginOnList = false;
		}

		return;
	}

	const listItemBlockMarginLeft = parseFloat( itemLikeElement.marginLeft );

	let currentListBlockIndent = 0;

	// Sum the relative `margin-left` of the last `<li>` in every ancestor stack frame.
	// Browser nesting cumulates: each ancestor `<li>`'s margin pushes its descendants further right,
	// so to convert Word's absolute `margin-left` into the editor's relative value we have to subtract
	// every ancestor's contribution — not only the immediate parent. Skip-level intermediate wrappers
	// contribute 0 (no margin set) and so naturally drop out of the sum.
	for ( let ancestorIndex = 0; ancestorIndex < stack.length - 1; ancestorIndex++ ) {
		const ancestorListItems = stack[ ancestorIndex ].listItemElements;
		const ancestorMargin = ancestorListItems[ ancestorListItems.length - 1 ].getStyle( 'margin-left' );

		if ( ancestorMargin !== undefined ) {
			currentListBlockIndent += parseFloat( ancestorMargin );
		}
	}

	// Add 40px for each indent level because by default HTML lists have 40px indentation (padding-inline-start: 40px).
	// So every nested list is indented by another 40px.
	currentListBlockIndent += stack.length * 40;

	// Calculate relative list item indentation to the list it is in.
	const adjustedListItemIndent = listItemBlockMarginLeft - currentListBlockIndent;
	const listItemBlockMarginLeftPx = adjustedListItemIndent !== 0 ? toPx( adjustedListItemIndent ) : undefined;

	if ( listItemBlockMarginLeftPx ) {
		writer.setStyle( 'margin-left', listItemBlockMarginLeftPx, listItem );

		if ( indent == 0 && topLevelListInfo.canApplyMarginOnList ) {
			if ( topLevelListInfo.marginLeft === undefined ) {
				topLevelListInfo.marginLeft = listItemBlockMarginLeftPx;
			}

			if ( listItemBlockMarginLeftPx !== topLevelListInfo.marginLeft ) {
				topLevelListInfo.canApplyMarginOnList = false;
			}

			topLevelListInfo.topLevelListItemElements.push( listItem );
		}
	}
}

function createTopLevelListInfo(): TopLevelListInfo {
	return {
		marginLeft: undefined,
		canApplyMarginOnList: true,
		topLevelListItemElements: []
	};
}

/**
 * Sets margin-left style to the top-level list if all its items have the same margin-left.
 * If margin-left is set on the list, it is removed from all its items to avoid doubling of margins.
 */
function applyIndentationToTopLevelList( writer: ViewUpcastWriter, stack: ListStack, topLevelListInfo: TopLevelListInfo ) {
	if (
		topLevelListInfo.canApplyMarginOnList &&
		topLevelListInfo.marginLeft &&
		topLevelListInfo.topLevelListItemElements.length > 0
	) {
		// Apply margin-left to the top-level list if all its items have the same margin-left.
		writer.setStyle( 'margin-left', topLevelListInfo.marginLeft, stack[ 0 ].listElement );

		// Remove margin-left from all top-level list items.
		for ( const topLevelListItem of topLevelListInfo.topLevelListItemElements ) {
			writer.removeStyle( 'margin-left', topLevelListItem );
		}
	}
}

/**
 * Removes paragraph wrapping content inside a list item.
 *
 * @internal
 */
export function unwrapParagraphInListItem(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter
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
 * @returns Array of found list-like items. Each item is an object containing
 * @internal
 */
function findAllItemLikeElements(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter
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
		if (
			( item.hasStyle( 'mso-list' ) && item.getStyle( 'mso-list' ) !== 'none' ) ||
			( marginLeft !== undefined && foundMargins.has( marginLeft ) )
		) {
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
	let previousSibling = currentItem.element.previousSibling;

	// Skip past stray inline markers that Word leaves between list paragraphs (e.g. empty
	// `<span style='mso-bookmark:...'></span>` or empty `<o:p></o:p>`). They have no visual effect
	// but would otherwise break list continuity here — which matters most for nested items pasted
	// right after their parent, where breaking the chain causes PFO to clamp the deeper item to
	// indent 0 instead of nesting it.
	while ( previousSibling && isStrayInlineMarker( previousSibling ) ) {
		previousSibling = previousSibling.previousSibling;
	}

	if ( !previousSibling ) {
		const parent = currentItem.element.parent as ViewElement;

		// If it's a li inside ul or ol like in here: https://github.com/ckeditor/ckeditor5/issues/15964.
		// If the parent has previous sibling, which is not a list, then it is not a continuation.
		return isList( parent ) && ( !parent.previousSibling || isList( parent.previousSibling ) );
	}

	// Even with the same id the list does not have to be continuous (https://github.com/ckeditor/ckeditor5/issues/43).
	return isList( previousSibling );
}

/**
 * True for empty inline elements Word emits as residue between paragraphs (`<span>`, `<a>`, `<o:p>`).
 * Used by `isListContinuation` to look past these when checking whether the prior block is a list —
 * they're layout artefacts, not real content.
 */
function isStrayInlineMarker( node: ViewNode ): boolean {
	return (
		node.is( 'element' ) &&
		node.childCount === 0 &&
		/^(?:span|a|o:p)$/.test( node.name )
	);
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

	/* v8 ignore next -- @preserve */
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
	writer: ViewUpcastWriter,
	hasMultiLevelListPlugin: boolean
) {
	const list = writer.createElement( listStyle.type );

	applyListStyleToElement( list, listStyle, writer, hasMultiLevelListPlugin );

	return list;
}

/**
 * Applies `list-style-type`, `start`, and the `legal-list` class to a list element based on the detected
 * list style. Used both when creating a fresh list and when a real item claims a previously-intermediate
 * wrapper (which was created without any of these).
 */
function applyListStyleToElement(
	list: ViewElement,
	listStyle: ReturnType<typeof detectListStyle>,
	writer: ViewUpcastWriter,
	hasMultiLevelListPlugin: boolean
) {
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
 * * `l1` is a list id (however it does not mean this is a continuous list - see https://github.com/ckeditor/ckeditor5/issues/43),
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
function removeBulletElement( element: ViewElement, writer: ViewUpcastWriter ) {
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

type ListStack = Array<ListLikeElement & {
	listElement: ViewElement;
	listItemElements: Array<ViewElement>;

	/**
	 * Set on frames created by the skip-level fill loop to mark them as intermediate wrappers
	 * for indent levels Word jumped over. A real list item arriving at this indent (e.g. after
	 * a deeper item) replaces the frame with a real one of the correct type.
	 */
	isIntermediate?: boolean;
}>;

type TopLevelListInfo = {
	marginLeft: string | undefined;
	canApplyMarginOnList: boolean;
	topLevelListItemElements: Array<ViewElement>;
};
