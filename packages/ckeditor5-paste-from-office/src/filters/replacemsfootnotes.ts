/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/replacemsfootnotes
 */

import type { ViewDocumentFragment, ViewElement, ViewText, ViewUpcastWriter } from '@ckeditor/ckeditor5-engine';

/**
 * Replaces MS Word specific footnotes references and definitions with proper elements.
 *
 * Things to know about MS Word footnotes:
 *
 * * Footnote references in Word are marked with `mso-footnote-id` style.
 * * Word does not support nested footnotes, so references within definitions are ignored.
 * * Word appends extra spaces after footnote references within definitions, which are trimmed.
 * * Footnote definitions list is marked with `mso-element: footnote-list` style it contain `mso-element: footnote` elements.
 * * Footnote definition might contain tables, lists and other elements, not only text. They are placed directly within `li` element,
 * without any wrapper (in opposition to text content of the definition, which is placed within `MsoFootnoteText` element).
 *
 * Example pseudo document showing MS Word footnote structure:
 *
 * ```html
 * <p>Text with footnote<a style='mso-footnote-id:ftn1'>[1]</a> reference.</p>
 *
 * <div style='mso-element:footnote-list'>
 * 	<div style='mso-element:footnote' id=ftn1>
 * 		<p class=MsoFootnoteText><a style='mso-footnote-id:ftn1'>[1]</a> Footnote content</p>
 * 		<table class="MsoTableGrid">...</table>
 * 	</div>
 * </div>
 * ```
 *
 * Will be transformed into:
 *
 * ```html
 * <p>Text with footnote<sup class="footnote"><a id="ref-footnote-ftn1" href="#footnote-ftn1">1</a></sup> reference.</p>
 *
 * <ol class="footnotes">
 * 	<li class="footnote-definition" id="footnote-ftn1">
 * 		<a href="#ref-footnote-ftn1" class="footnote-backlink">^</a>
 * 		<div class="footnote-content">
 * 			<p>Footnote content</p>
 * 			<table>...</table>
 * 		</div>
 * 	</li>
 * </ol>
 * ```
 *
 * @param documentFragment `data.content` obtained from clipboard.
 * @param writer The view writer instance.
 * @internal
 */
export function replaceMSFootnotes( documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter ): void {
	const msFootnotesRefs = new Map<string, ViewElement>();
	const msFootnotesDefs = new Map<string, ViewElement>();
	let msFootnotesDefinitionsList: ViewElement | null = null;

	// Phase 1: Collect all footnotes references and definitions. Find the footnotes definitions list element.
	for ( const { item } of writer.createRangeIn( documentFragment ) ) {
		if ( !item.is( 'element' ) ) {
			continue;
		}

		// If spot a footnotes definitions element, let's store it. It'll be replaced later.
		// There should be only one such element in the document.
		if ( item.getStyle( 'mso-element' ) === 'footnote-list' ) {
			msFootnotesDefinitionsList = item;
			continue;
		}

		// If spot a footnote reference or definition, store it in the corresponding map.
		if ( item.hasStyle( 'mso-footnote-id' ) ) {
			const msFootnoteDef = item.findAncestor( 'element', el => el.getStyle( 'mso-element' ) === 'footnote' );

			if ( msFootnoteDef ) {
				// If it's a reference within a definition, ignore it and track only the definition.
				// MS Word do not support nested footnotes, so it's safe to assume that all references within
				// a definition point to the same definition.
				const msFootnoteDefId = msFootnoteDef.getAttribute( 'id' )!;

				msFootnotesDefs.set( msFootnoteDefId, msFootnoteDef );
			} else {
				// If it's a reference outside of a definition, track it as a reference.
				const msFootnoteRefId = item.getStyle( 'mso-footnote-id' )!;

				msFootnotesRefs.set( msFootnoteRefId, item );
			}

			continue;
		}
	}

	// If there are no footnotes references or definitions, or no definitions list, there's nothing to normalize.
	if ( !msFootnotesRefs.size || !msFootnotesDefinitionsList ) {
		return;
	}

	// Phase 2: Replace footnotes definitions list with proper element.
	const footnotesDefinitionsList = createFootnotesListViewElement( writer );

	writer.replace( msFootnotesDefinitionsList, footnotesDefinitionsList );

	// Phase 3: Replace all footnotes references and add matching definitions to the definitions list.
	for ( const [ footnoteId, msFootnoteRef ] of msFootnotesRefs ) {
		const msFootnoteDef = msFootnotesDefs.get( footnoteId );

		if ( !msFootnoteDef ) {
			continue;
		}

		// Replace footnote reference.
		writer.replace( msFootnoteRef, createFootnoteRefViewElement( writer, footnoteId ) );

		// Append found matching definition to the definitions list.
		// Order doesn't matter here, as it'll be fixed in the post-fixer.
		const defElements = createFootnoteDefViewElement( writer, footnoteId );

		removeMSReferences( writer, msFootnoteDef );

		// Insert content within the `MsoFootnoteText` element. It's usually a definition text content.
		for ( const child of msFootnoteDef.getChildren() ) {
			let clonedChild = child;

			if ( child.is( 'element' ) ) {
				clonedChild = writer.clone( child, true );
			}

			writer.appendChild( clonedChild, defElements.content );
		}

		writer.appendChild( defElements.listItem, footnotesDefinitionsList );
	}
}

/**
 * Removes all MS Office specific references from the given element.
 *
 * It also removes leading space from text nodes following the references, as MS Word adds
 * them to separate the reference from the rest of the text.
 *
 * @param writer The view writer.
 * @param element The element to trim.
 * @returns The trimmed element.
 */
function removeMSReferences( writer: ViewUpcastWriter, element: ViewElement ): ViewElement {
	const elementsToRemove: Array<ViewElement> = [];
	const textNodesToTrim: Array<ViewText> = [];

	for ( const { item } of writer.createRangeIn( element ) ) {
		if ( item.is( 'element' ) && item.getStyle( 'mso-footnote-id' ) ) {
			elementsToRemove.unshift( item );

			// MS Word used to add spaces after footnote references within definitions. Let's check if there's a space after
			// the footnote reference and mark it for trimming.
			const { nextSibling } = item;

			if ( nextSibling?.is( '$text' ) && nextSibling.data.startsWith( ' ' ) ) {
				textNodesToTrim.unshift( nextSibling );
			}
		}
	}

	for ( const element of elementsToRemove ) {
		writer.remove( element );
	}

	// Remove only the leading space from text nodes following reference within definition, preserve the rest of the text.
	for ( const textNode of textNodesToTrim ) {
		const trimmedData = textNode.data.substring( 1 );

		if ( trimmedData.length > 0 ) {
			// Create a new text node and replace the old one.
			const parent = textNode.parent!;
			const index = parent.getChildIndex( textNode );
			const newTextNode = writer.createText( trimmedData );

			writer.remove( textNode );
			writer.insertChild( index, newTextNode, parent );
		} else {
			// If the text node contained only a space, remove it entirely.
			writer.remove( textNode );
		}
	}

	return element;
}

/**
 * Creates a footnotes list view element.
 *
 * @param writer The view writer instance.
 * @returns The footnotes list view element.
 */
function createFootnotesListViewElement( writer: ViewUpcastWriter ): ViewElement {
	return writer.createElement( 'ol', { class: 'footnotes' } );
}

/**
 * Creates a footnote reference view element.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns The footnote reference view element.
 */
function createFootnoteRefViewElement( writer: ViewUpcastWriter, footnoteId: string ): ViewElement {
	const sup = writer.createElement( 'sup', { class: 'footnote' } );
	const link = writer.createElement( 'a', {
		id: `ref-${ footnoteId }`,
		href: `#${ footnoteId }`
	} );

	writer.appendChild( link, sup );

	return sup;
}

/**
 * Creates a footnote definition view element with a backlink and a content container.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns An object containing the list item element, backlink and content container.
 */
function createFootnoteDefViewElement( writer: ViewUpcastWriter, footnoteId: string ): {
	listItem: ViewElement;
	content: ViewElement;
} {
	const listItem = writer.createElement( 'li', {
		id: footnoteId,
		class: 'footnote-definition'
	} );

	const backLink = writer.createElement( 'a', {
		href: `#ref-${ footnoteId }`,
		class: 'footnote-backlink'
	} );

	const content = writer.createElement( 'div', {
		class: 'footnote-content'
	} );

	writer.appendChild( writer.createText( '^' ), backLink );
	writer.appendChild( backLink, listItem );
	writer.appendChild( content, listItem );

	return {
		listItem,
		content
	};
}
