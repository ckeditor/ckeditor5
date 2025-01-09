/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/pasteplaintext
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import type { DocumentFragment, Model, Element } from '@ckeditor/ckeditor5-engine';

import ClipboardObserver from './clipboardobserver.js';
import ClipboardPipeline, { type ClipboardContentInsertionEvent } from './clipboardpipeline.js';

/**
 * The plugin detects the user's intention to paste plain text.
 *
 * For example, it detects the <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke.
 */
export default class PastePlainText extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PastePlainText' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const selection = model.document.selection;

		view.addObserver( ClipboardObserver );

		editor.plugins.get( ClipboardPipeline ).on<ClipboardContentInsertionEvent>( 'contentInsertion', ( evt, data ) => {
			if ( !isUnformattedInlineContent( data.content, model ) ) {
				return;
			}

			model.change( writer => {
				// Formatting attributes should be preserved.
				const textAttributes = Array.from( selection.getAttributes() )
					.filter( ( [ key ] ) => model.schema.getAttributeProperties( key ).isFormatting );

				if ( !selection.isCollapsed ) {
					model.deleteContent( selection, { doNotAutoparagraph: true } );
				}

				// Also preserve other attributes if they survived the content deletion (because they were not fully selected).
				// For example linkHref is not a formatting attribute but it should be preserved if pasted text was in the middle
				// of a link.
				textAttributes.push( ...selection.getAttributes() );

				const range = writer.createRangeIn( data.content );

				for ( const item of range.getItems() ) {
					for ( const attribute of textAttributes ) {
						if ( model.schema.checkAttribute( item, attribute[ 0 ] ) ) {
							writer.setAttribute( attribute[ 0 ], attribute[ 1 ], item );
						}
					}
				}
			} );
		} );
	}
}

/**
 * Returns true if specified `documentFragment` represents the unformatted inline content.
 */
function isUnformattedInlineContent( documentFragment: DocumentFragment, model: Model ): boolean {
	let range = model.createRangeIn( documentFragment );

	// We consider three scenarios here. The document fragment may include:
	//
	// 1. Only text and inline objects. Then it could be unformatted inline content.
	// 2. Exactly one block element on top-level, eg. <p>Foobar</p> or <h2>Title</h2>.
	//    In this case, check this element content, it could be treated as unformatted inline content.
	// 3. More block elements or block objects, then it is not unformatted inline content.
	//
	// We will check for scenario 2. specifically, and if it happens, we will unwrap it and follow with the regular algorithm.
	//
	if ( documentFragment.childCount == 1 ) {
		const child = documentFragment.getChild( 0 )!;

		if ( child.is( 'element' ) && model.schema.isBlock( child ) && !model.schema.isObject( child ) && !model.schema.isLimit( child ) ) {
			// Scenario 2. as described above.
			range = model.createRangeIn( child as Element );
		}
	}

	for ( const child of range.getItems() ) {
		if ( !model.schema.isInline( child ) ) {
			return false;
		}

		const attributeKeys = Array.from( child.getAttributeKeys() );

		if ( attributeKeys.find( key => model.schema.getAttributeProperties( key ).isFormatting ) ) {
			return false;
		}
	}

	return true;
}
