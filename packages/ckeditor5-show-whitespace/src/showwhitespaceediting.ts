/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-whitespace/showwhitespaceediting
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import type { DowncastInsertEvent, ModelElement, ModelText, ModelTextProxy } from '@ckeditor/ckeditor5-engine';

import { ShowWhitespaceCommand } from './showwhitespacecommand.js';
import type { ShowWhitespaceConfig } from './showwhitespaceconfig.js';

// Pattern to split text into tokens: regular text chunks, spaces, nbsp, and tabs.
// Capturing group keeps the delimiters in the result array.
const WHITESPACE_SPLIT_PATTERN = /( |\u00A0|\t)/g;

/**
 * The show whitespace editing plugin.
 *
 * Registers the command and the editing downcast converters that render
 * visible whitespace markers in the editing view.
 */
export class ShowWhitespaceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowWhitespaceEditing' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'showWhitespace', {
			spaces: true,
			nbsp: true,
			tabs: true,
			softBreaks: true,
			paragraphMarks: true,
			trailingSpaces: true
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const config = editor.config.get( 'showWhitespace' ) as ShowWhitespaceConfig;

		editor.commands.add( 'showWhitespace', new ShowWhitespaceCommand( editor, config ) );

		// Ctrl+Shift+8 (Cmd+Shift+8 on Mac) — same as Microsoft Word.
		editor.keystrokes.set( 'CTRL+SHIFT+8', 'showWhitespace' );

		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Show whitespace' ),
					keystroke: 'CTRL+SHIFT+8'
				}
			]
		} );

		this._setupTextConverter( config );

		if ( config.softBreaks !== false ) {
			this._setupSoftBreakConverter();
		}
	}

	/**
	 * Registers a high-priority editing downcast converter for `$text` nodes that wraps
	 * whitespace characters (spaces, non-breaking spaces, tabs) in styled `<span>` elements.
	 *
	 * When the feature is inactive, the converter returns early and lets the default
	 * `insertText()` converter handle the insertion.
	 */
	private _setupTextConverter( config: ShowWhitespaceConfig ): void {
		const editor = this.editor;

		// Determine which whitespace characters to visualize based on config.
		const showSpaces = config.spaces !== false;
		const showNbsp = config.nbsp !== false;
		const showTabs = config.tabs !== false;
		const showTrailing = config.trailingSpaces !== false;

		// If nothing is enabled, skip the converter entirely.
		if ( !showSpaces && !showNbsp && !showTabs ) {
			return;
		}

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastInsertEvent<ModelText | ModelTextProxy>>(
				'insert:$text',
				( evt, data, conversionApi ) => {
					const command = editor.commands.get( 'showWhitespace' )!;

					// When the feature is off, let the default converter handle it.
					if ( !command.value ) {
						return;
					}

					if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
						return;
					}

					const viewWriter = conversionApi.writer;
					const text = data.item.data;
					const tokens = text.split( WHITESPACE_SPLIT_PATTERN );

					// Determine trailing space positions if enabled.
					const trailingStartIndex = showTrailing && showSpaces ?
						getTrailingSpaceStartIndex( tokens, data.item ) :
						-1;

					let modelPosition = data.range.start;
					let viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
					let tokenIndex = 0;

					for ( const token of tokens ) {
						if ( token === '' ) {
							tokenIndex++;
							continue;
						}

						const isWhitespace = token === ' ' || token === '\u00A0' || token === '\t';
						const isEnabledWhitespace = isWhitespace && (
							( token === ' ' && showSpaces ) ||
							( token === '\u00A0' && showNbsp ) ||
							( token === '\t' && showTabs )
						);

						if ( isEnabledWhitespace ) {
							let cssClass = getWhitespaceClass( token );

							// Add trailing class if this space is in the trailing region.
							if ( trailingStartIndex >= 0 && tokenIndex >= trailingStartIndex && token === ' ' ) {
								cssClass += ' ck-whitespace-trailing';
							}

							// Insert the actual whitespace character inside a wrapper span.
							// The visible symbol comes from CSS ::before on the span.
							const whitespaceText = viewWriter.createText( token );
							viewWriter.insert( viewPosition, whitespaceText );

							// Wrap the whitespace character in a span with a unique id
							// to prevent the view writer from merging adjacent spans.
							const wrapperSpan = viewWriter.createAttributeElement( 'span', {
								class: cssClass
							}, {
								id: `ck-ws-${ modelPosition.offset }`
							} );

							const modelRange = editor.model.createRange(
								modelPosition,
								modelPosition.getShiftedBy( 1 )
							);
							const viewRange = conversionApi.mapper.toViewRange( modelRange );

							viewWriter.wrap( viewRange, wrapperSpan );

							modelPosition = modelPosition.getShiftedBy( 1 );
							viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
						} else {
							// Regular text chunk or disabled whitespace type — insert as plain text.
							viewWriter.insert( viewPosition, viewWriter.createText( token ) );

							modelPosition = modelPosition.getShiftedBy( token.length );
							viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
						}

						tokenIndex++;
					}
				},
				{ priority: 'high' }
			);
		} );
	}

	/**
	 * Registers a high-priority editing downcast converter for `softBreak` elements
	 * that inserts a visible marker UI element before the `<br>`.
	 *
	 * The marker is a non-selectable, non-content element that displays the ↵ symbol via CSS.
	 * When the feature is inactive, the default softBreak converter runs instead.
	 */
	private _setupSoftBreakConverter(): void {
		const editor = this.editor;

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastInsertEvent<ModelElement>>(
				'insert:softBreak',
				( evt, data, conversionApi ) => {
					const command = editor.commands.get( 'showWhitespace' )!;

					// When the feature is off, let the default converter handle it.
					if ( !command.value ) {
						return;
					}

					if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
						return;
					}

					const viewWriter = conversionApi.writer;
					const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

					// Create the visible marker (non-selectable UI element).
					const softBreakMarker = viewWriter.createUIElement( 'span', {
						class: 'ck-whitespace-soft-break'
					} );

					// Create the actual <br> element.
					const br = viewWriter.createEmptyElement( 'br' );

					// Insert the marker first, then the <br>.
					viewWriter.insert( viewPosition, softBreakMarker );
					viewWriter.insert( viewWriter.createPositionAfter( softBreakMarker ), br );

					// Map the model softBreak element to the <br> for correct model-view mapping.
					conversionApi.mapper.bindElements( data.item, br );
				},
				{ priority: 'high' }
			);
		} );
	}
}

/**
 * Returns the CSS class for the given whitespace character.
 */
function getWhitespaceClass( char: string ): string {
	switch ( char ) {
		case ' ':
			return 'ck-whitespace-space';
		case '\u00A0':
			return 'ck-whitespace-nbsp';
		case '\t':
			return 'ck-whitespace-tab';
		default:
			return 'ck-whitespace-space';
	}
}

/**
 * Determines the token index from which spaces are considered "trailing".
 *
 * A space is trailing if it and all subsequent tokens are spaces, AND the text node
 * is the last text content before the end of its parent block (or before a softBreak).
 *
 * Returns -1 if there are no trailing spaces.
 */
function getTrailingSpaceStartIndex(
	tokens: Array<string>,
	textItem: ModelText | ModelTextProxy
): number {
	const parent = textItem.parent;

	if ( !parent || !parent.is( 'element' ) ) {
		return -1;
	}

	// Check if this text ends at the end of the parent block by comparing offsets.
	// This is more robust than nextSibling — works correctly when text nodes
	// are split by typing, attribute boundaries, or reconversion.
	const textEndOffset = textItem.startOffset! + textItem.offsetSize;
	const parentMaxOffset = ( parent as ModelElement ).maxOffset;

	if ( textEndOffset === parentMaxOffset ) {
		// Text is the very last content in the parent — trailing detection applies.
	} else if ( textEndOffset === parentMaxOffset - 1 ) {
		// One item remains — only allow if it's a softBreak.
		const lastChild = ( parent as ModelElement ).getChild( ( parent as ModelElement ).childCount - 1 );

		if ( !lastChild || !lastChild.is( 'element', 'softBreak' ) ) {
			return -1;
		}
	} else {
		return -1;
	}

	// Find where trailing spaces start by iterating tokens from the end.
	let trailingStart = -1;

	for ( let i = tokens.length - 1; i >= 0; i-- ) {
		if ( tokens[ i ] === ' ' ) {
			trailingStart = i;
		} else if ( tokens[ i ] !== '' ) {
			// Non-empty, non-space token — stop.
			break;
		}
	}

	return trailingStart;
}
