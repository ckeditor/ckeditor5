/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module widget/widgettypearound/utils
 */

import { isWidget } from '../utils.js';
import { _getCopyOnEnterAttributes } from '@ckeditor/ckeditor5-enter';

import {
	ModelDocumentSelection,
	type ViewDomConverter,
	type ModelNode,
	type ModelElement,
	type ModelSchema,
	type ModelSelection,
	type ViewElement
} from '@ckeditor/ckeditor5-engine';

/**
 * The name of the type around model selection attribute responsible for
 * displaying a fake caret next to a selected widget.
 *
 * @internal
 */
export const TYPE_AROUND_SELECTION_ATTRIBUTE = 'widget-type-around';

/**
 * Checks if an element is a widget that qualifies to get the widget type around UI.
 */
export function isTypeAroundWidget( viewElement: ViewElement | undefined, modelElement: ModelElement, schema: ModelSchema ): boolean {
	return !!viewElement && isWidget( viewElement ) && !schema.isInline( modelElement );
}

/**
 * For the passed HTML element, this helper finds the closest widget type around button ancestor.
 *
 * @internal
 */
export function getClosestTypeAroundDomButton( domElement: HTMLElement ): HTMLElement | null {
	return domElement.closest( '.ck-widget__type-around__button' );
}

/**
 * For the passed widget type around button element, this helper determines at which position
 * the paragraph would be inserted into the content if, for instance, the button was
 * clicked by the user.
 *
 * @internal
 * @returns The position of the button.
 */
export function getTypeAroundButtonPosition( domElement: HTMLElement ): 'before' | 'after' {
	return domElement.classList.contains( 'ck-widget__type-around__button_before' ) ? 'before' : 'after';
}

/**
 * For the passed HTML element, this helper returns the closest view widget ancestor.
 *
 * @internal
 */
export function getClosestWidgetViewElement( domElement: HTMLElement, domConverter: ViewDomConverter ): ViewElement {
	const widgetDomElement = domElement.closest( '.ck-widget' );

	return domConverter.mapDomToView( widgetDomElement as any ) as ViewElement;
}

/**
 * For the passed selection instance, it returns the position of the fake caret displayed next to a widget.
 *
 * **Note**: If the fake caret is not currently displayed, `null` is returned.
 *
 * @internal
 * @returns The position of the fake caret or `null` when none is present.
 */
export function getTypeAroundFakeCaretPosition( selection: ModelSelection | ModelDocumentSelection ): 'before' | 'after' | null {
	return selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) as any;
}

/**
 * Looks for the `copyOnEnter` text formatting attributes (e.g. bold, font color) carried by the last piece
 * of inline content on the sibling that directly precedes a run of one or more consecutive block widgets.
 *
 * Used when the user inserts a new paragraph next to a widget (e.g. an image or a table) via the type-around
 * UI: the new, empty paragraph should continue whatever formatting was active right before the widget,
 * instead of starting unformatted:
 *
 * ```
 * <paragraph><$text bold="true">Bar</$text></paragraph><imageBlock></imageBlock>
 * ```
 *
 * Only the attributes carried by the *last* inline child of that sibling are considered - whatever precedes
 * it doesn't matter, because it's the last piece of content that reflects what the user was typing right
 * before reaching the widget:
 *
 * ```
 * // "bold" IS recovered here: "Bar", the last child, is bold. "Foo" not being bold is irrelevant.
 * <paragraph>Foo<$text bold="true">Bar</$text></paragraph><imageBlock></imageBlock>
 * ```
 *
 * If there is more than one widget in a row, the search continues past all of them until a sibling with
 * actual content (or the boundary of the parent) is found:
 *
 * ```
 * <paragraph><$text bold="true">Bar</$text></paragraph><imageBlock></imageBlock><imageBlock></imageBlock>
 * ```
 *
 * @param schema Model's schema.
 * @param widgetElement The widget model element.
 * @internal
 */
export function getCopyOnEnterTextAttributesBeforeWidgets(
	schema: ModelSchema,
	widgetElement: ModelElement
): Array<[ string, unknown ]> {
	// If `element` is itself a widget, it counts as the first skipped widget in the chain (see above).
	// Otherwise, the chain of widgets to skip, if any, starts at its previous sibling.
	let sibling: ModelNode | null = widgetElement;

	// Skip over any number of consecutive block widgets (objects).
	while ( sibling && sibling.is( 'element' ) && schema.isObject( sibling ) ) {
		sibling = sibling.previousSibling;
	}

	// Reached the start of the parent, or found some other, non-widget element — there is nothing to copy.
	if ( !sibling?.is( 'element' ) ) {
		return [];
	}

	// There is no content to take attributes from.
	if ( sibling.isEmpty ) {
		const selectionAttributes = extractStoredSelectionAttributes( sibling.getAttributes() );

		return Array.from( _getCopyOnEnterAttributes( schema, selectionAttributes ) );
	}

	const lastChild = sibling.getChild( sibling.childCount - 1 )!;

	// Only text and inline elements (e.g. `softBreak`, `imageInline`) carry text formatting attributes.
	// A nested block (e.g. the paragraph inside a `blockQuote`) means this is a different context, not
	// a continuation of the surrounding flow, so there's nothing to recover.
	if ( !schema.isInline( lastChild ) ) {
		return [];
	}

	return Array.from( _getCopyOnEnterAttributes( schema, lastChild.getAttributes() ) );
}

/**
 * Extracts the selection attributes stored on an empty block.
 */
function* extractStoredSelectionAttributes( iterator: IterableIterator<[string, unknown]> ): IterableIterator<[string, unknown]> {
	for ( const [ attributeKey, attributeValue ] of iterator ) {
		if ( !ModelDocumentSelection._isStoreAttributeKey( attributeKey ) ) {
			continue;
		}

		const realKey = ModelDocumentSelection._dropStoreAttributeKeyPrefix( attributeKey );

		yield [ realKey, attributeValue ];
	}
}
