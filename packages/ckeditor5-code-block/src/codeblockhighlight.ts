/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block/codeblockhighlight
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { CodeBlockEditing } from './codeblockediting.js';
import type {
	ViewAttributeElement,
	ViewDowncastWriter,
	ModelElement,
	ViewElement,
	ViewText,
	ModelPosition
} from 'ckeditor5/src/engine.js';

import { common, createLowlight } from 'lowlight';

// Import highlight.js theme for syntax highlighting styles
import 'highlight.js/styles/github.css';

/**
 * Highlight node structure (simplified from lowlight output).
 */
interface HighlightNode {
	type: 'text' | 'element' | 'root';
	value?: string;
	tagName?: string;
	properties?: {
		className?: Array<string>;
	};
	children?: Array<HighlightNode>;
}

/**
 * The code block highlight plugin.
 *
 * Strategy: LINE-LEVEL HIGHLIGHTING
 * - Only re-highlights the current line being edited (where cursor is)
 * - Other lines remain stable (no DOM changes)
 * - Triggers on word boundaries (space, punctuation)
 * - Full re-highlight on paste/initialization
 */
export class CodeBlockHighlight extends Plugin {
	/**
	 * Lowlight instance for syntax highlighting.
	 */
	public readonly lowlight: ReturnType<typeof createLowlight>;

	/**
	 * Set of highlighted view attribute elements.
	 */
	private _highlightedElements = new Set<ViewAttributeElement>();

	/**
	 * Last highlighted text per code block to avoid unnecessary re-highlighting.
	 */
	private _lastHighlightedText = new Map<ModelElement, string>();

	/**
	 * Set of code blocks pending FULL highlighting in the next post-fixer run.
	 */
	private _pendingFullHighlights = new Set<ModelElement>();

	/**
	 * Map of code blocks to specific line numbers that need re-highlighting.
	 */
	private _pendingLineHighlights = new Map<ModelElement, Set<number>>();

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CodeBlockEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeBlockHighlight' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	constructor( editor: Editor ) {
		super( editor );
		this.lowlight = createLowlight( common );
	}

	public init(): void {
		// Register view post-fixer for applying highlights at safe timing
		this._registerViewPostFixer();

		// Listen for model changes to schedule highlighting
		this._registerModelChangeListener();

		// Register cleanup listeners to remove highlights before re-conversion
		this._registerCleanupListeners();
	}

	/**
	 * Get syntax highlights using lowlight for the given code and language.
	 */
	private _getLowlightHighlight( language: string, code: string ): Array<HighlightNode> {
		try {
			const result = this.lowlight.highlight( language, code );
			return ( result.children || [] ) as Array<HighlightNode>;
		} catch {
			return [ {
				type: 'text',
				value: code
			} ];
		}
	}

	/**
	 * Register view post-fixer to apply syntax highlighting at safe timing.
	 */
	private _registerViewPostFixer(): void {
		const view = this.editor.editing.view;
		const mapper = this.editor.editing.mapper;

		view.document.registerPostFixer( writer => {
			let changed = false;

			// Process FULL highlights first (initialization, paste, language change)
			for ( const codeBlock of this._pendingFullHighlights ) {
				const viewElement = mapper.toViewElement( codeBlock );
				if ( !viewElement ) {
					continue;
				}

				const codeElement = this._findCodeElement( viewElement );
				if ( !codeElement ) {
					continue;
				}

				// Get FULL code block text
				const code = this._getTextFromModelElement( codeBlock );
				const language = ( codeBlock.getAttribute( 'language' ) as string ) || 'plaintext';

				// Get highlights from lowlight with FULL context
				const highlights = this._getLowlightHighlight( language, code );

				// Clear all classes from existing spans
				this._clearHighlightClasses( codeElement, writer );

				// Apply new highlights to entire code block
				this._applyHighlightsToViewElement( codeElement, highlights, writer );

				// Remember what we highlighted
				this._lastHighlightedText.set( codeBlock, code );

				changed = true;
			}

			// Process LINE-LEVEL highlights (typing)
			for ( const [ codeBlock, lineNumbers ] of this._pendingLineHighlights.entries() ) {
				const viewElement = mapper.toViewElement( codeBlock );
				if ( !viewElement ) {
					continue;
				}

				const codeElement = this._findCodeElement( viewElement );
				if ( !codeElement ) {
					continue;
				}

				// Get FULL code block text (lowlight needs context)
				const fullCode = this._getTextFromModelElement( codeBlock );
				const language = ( codeBlock.getAttribute( 'language' ) as string ) || 'plaintext';

				// Get highlights from lowlight with FULL context
				const fullHighlights = this._getLowlightHighlight( language, fullCode );

				// Apply highlights ONLY to the specified lines
				for ( const lineNumber of lineNumbers ) {
					this._highlightSpecificLine( codeElement, fullCode, fullHighlights, lineNumber, writer );
				}

				changed = true;
			}

			// Clear pending highlights after processing
			this._pendingFullHighlights.clear();
			this._pendingLineHighlights.clear();

			return changed;
		} );
	}

	/**
	 * Register listener for model document changes.
	 */
	private _registerModelChangeListener(): void {
		const model = this.editor.model;

		this.listenTo( model.document, 'change:data', () => {
			const selection = model.document.selection;
			const position = selection.getFirstPosition();
			const changes = model.document.differ.getChanges();

			// Check for inserted code blocks (paste, undo, language change)
			let hasInsertedCodeBlock = false;
			for ( const change of changes ) {
				if ( change.type === 'insert' ) {
					const item = change.position.nodeAfter;
					if ( item && item.is( 'element', 'codeBlock' ) ) {
						// Full highlight for new code blocks
						this._pendingFullHighlights.add( item );
						hasInsertedCodeBlock = true;
					}
				}
			}

			// If code blocks were inserted, trigger immediate highlight
			if ( hasInsertedCodeBlock ) {
				this.editor.editing.view.forceRender();
				return;
			}

			// For typing in code blocks: line-level highlighting on word boundaries
			if ( position && position.parent.is( 'element', 'codeBlock' ) ) {
				const codeBlock = position.parent as ModelElement;
				const currentText = this._getTextFromModelElement( codeBlock );
				const lastText = this._lastHighlightedText.get( codeBlock );

				// Check if we should highlight (word boundary detection)
				if ( currentText !== lastText && this._shouldHighlightAfterTyping( currentText ) ) {
					// Get the line number where cursor is
					const lineNumber = this._getLineNumberAtPosition( position );

					// Schedule line-level highlight
					if ( !this._pendingLineHighlights.has( codeBlock ) ) {
						this._pendingLineHighlights.set( codeBlock, new Set() );
					}
					this._pendingLineHighlights.get( codeBlock )!.add( lineNumber );

					// Update last highlighted text
					this._lastHighlightedText.set( codeBlock, currentText );

					// Trigger view render
					this.editor.editing.view.forceRender();
				}
			}
		} );
	}

	/**
	 * Determine if we should highlight after typing.
	 * Triggers on word boundaries: space, punctuation, etc.
	 */
	private _shouldHighlightAfterTyping( text: string ): boolean {
		if ( text.length === 0 ) {
			return false;
		}

		const lastChar = text[ text.length - 1 ];
		const wordBoundaries = /[\s.,;:!?(){}[\]<>=+\-*/%&|^~`'"\\]/;

		return wordBoundaries.test( lastChar );
	}

	/**
	 * Get the line number (0-based) at the given position in a code block.
	 */
	private _getLineNumberAtPosition( position: ModelPosition ): number {
		const codeBlock = position.parent as ModelElement;
		let lineNumber = 0;
		let offsetSoFar = 0;

		for ( const child of codeBlock.getChildren() ) {
			if ( child.is( 'element', 'softBreak' ) ) {
				if ( offsetSoFar < position.offset ) {
					lineNumber++;
				}
				offsetSoFar++;
			} else if ( child.is( '$text' ) ) {
				offsetSoFar += child.data.length;
			}
		}

		return lineNumber;
	}

	/**
	 * Highlight a specific line in the code block.
	 *
	 * Strategy:
	 * 1. Get line boundaries (start/end offsets)
	 * 2. Extract highlights for that line from full lowlight output
	 * 3. Only modify spans within that line
	 */
	private _highlightSpecificLine(
		codeElement: ViewElement,
		fullCode: string,
		fullHighlights: Array<HighlightNode>,
		lineNumber: number,
		writer: ViewDowncastWriter
	): void {
		// Split full code into lines
		const lines = fullCode.split( '\n' );
		if ( lineNumber >= lines.length ) {
			return;
		}

		// Calculate character offsets for this line
		let lineStartOffset = 0;
		for ( let i = 0; i < lineNumber; i++ ) {
			lineStartOffset += lines[ i ].length + 1; // +1 for newline
		}
		const lineEndOffset = lineStartOffset + lines[ lineNumber ].length;

		// Find view text nodes for this line
		const lineTextNodes = this._getTextNodesInRange( codeElement, lineStartOffset, lineEndOffset );

		// Clear classes from spans in this line only
		for ( const { parent } of lineTextNodes ) {
			if ( parent.is( 'attributeElement' ) && parent.hasAttribute( 'class' ) ) {
				writer.removeAttribute( 'class', parent );
			}
		}

		// Extract highlight segments for this line from full highlights
		const lineHighlights = this._extractHighlightsForRange( fullHighlights, lineStartOffset, lineEndOffset );

		// Apply highlights to this line
		this._applyHighlightsToRange( lineTextNodes, lineHighlights, lineStartOffset, writer );
	}

	/**
	 * Get text nodes within a specific character range.
	 */
	private _getTextNodesInRange(
		element: ViewElement,
		rangeStart: number,
		rangeEnd: number
	): Array<{ node: ViewText; start: number; end: number; parent: ViewElement | ViewAttributeElement }> {
		const textNodes: Array<{ node: ViewText; start: number; end: number; parent: ViewElement | ViewAttributeElement }> = [];
		let currentOffset = 0;

		const collectTextNodes = ( el: ViewElement | ViewAttributeElement ) => {
			for ( const child of el.getChildren() ) {
				if ( child.is( '$text' ) ) {
					const nodeLength = child.data.length;
					const nodeStart = currentOffset;
					const nodeEnd = currentOffset + nodeLength;

					// Check if this text node overlaps with our range
					if ( nodeStart < rangeEnd && nodeEnd > rangeStart ) {
						textNodes.push( {
							node: child,
							start: nodeStart,
							end: nodeEnd,
							parent: el
						} );
					}

					currentOffset += nodeLength;
				} else if ( child.is( 'element', 'br' ) ) {
					currentOffset += 1;
				} else if ( child.is( 'attributeElement' ) ) {
					collectTextNodes( child );
				}
			}
		};

		collectTextNodes( element );
		return textNodes;
	}

	/**
	 * Extract highlight segments that fall within a specific character range.
	 */
	private _extractHighlightsForRange(
		highlights: Array<HighlightNode>,
		rangeStart: number,
		rangeEnd: number
	): Array<{ start: number; end: number; className: string }> {
		const segments: Array<{ start: number; end: number; className: string }> = [];
		let charPosition = 0;

		for ( const highlight of highlights ) {
			if ( highlight.type === 'text' && highlight.value ) {
				charPosition += highlight.value.length;
			} else if ( highlight.type === 'element' && highlight.children ) {
				const textValue = this._extractTextFromHighlightNode( highlight );
				const segStart = charPosition;
				const segEnd = charPosition + textValue.length;

				// Check if this segment overlaps with our range
				if ( segStart < rangeEnd && segEnd > rangeStart ) {
					const className = highlight.properties?.className?.join( ' ' ) || '';
					segments.push( {
						start: Math.max( segStart, rangeStart ),
						end: Math.min( segEnd, rangeEnd ),
						className
					} );
				}

				charPosition += textValue.length;
			}
		}

		return segments;
	}

	/**
	 * Apply highlight segments to text nodes in a specific range.
	 */
	private _applyHighlightsToRange(
		textNodes: Array<{ node: ViewText; start: number; end: number; parent: ViewElement | ViewAttributeElement }>,
		segments: Array<{ start: number; end: number; className: string }>,
		rangeStart: number,
		writer: ViewDowncastWriter
	): void {
		// Process segments in reverse order
		for ( let i = segments.length - 1; i >= 0; i-- ) {
			const segment = segments[ i ];

			// Find text nodes that overlap with this segment
			const affectedNodes = textNodes.filter( node =>
				node.start < segment.end && node.end > segment.start
			);

			// Process nodes in reverse order
			for ( let j = affectedNodes.length - 1; j >= 0; j-- ) {
				const nodeInfo = affectedNodes[ j ];

				// Check if already wrapped in span
				if ( nodeInfo.parent.is( 'attributeElement' ) ) {
					// Reuse span - just update classes
					if ( segment.className ) {
						writer.setAttribute( 'class', segment.className, nodeInfo.parent );
						this._highlightedElements.add( nodeInfo.parent );
					}
				} else {
					// Need to wrap - calculate relative positions
					const relativeStart = Math.max( 0, segment.start - nodeInfo.start );
					const relativeEnd = Math.min( nodeInfo.node.data.length, segment.end - nodeInfo.start );

					if ( relativeStart < relativeEnd ) {
						try {
							const startPosition = writer.createPositionAt( nodeInfo.node, relativeStart );
							const endPosition = writer.createPositionAt( nodeInfo.node, relativeEnd );
							const range = writer.createRange( startPosition, endPosition );

							const attributeElement = writer.createAttributeElement( 'span', { class: segment.className } );
							writer.wrap( range, attributeElement );
							this._highlightedElements.add( attributeElement );
						} catch {
							// Skip if wrapping fails
						}
					}
				}
			}
		}
	}

	/**
	 * Get text content from a model element.
	 */
	private _getTextFromModelElement( element: ModelElement ): string {
		let text = '';
		for ( const child of element.getChildren() ) {
			if ( child.is( '$text' ) ) {
				text += child.data;
			} else if ( child.is( 'element', 'softBreak' ) ) {
				text += '\n';
			}
		}
		return text;
	}

	/**
	 * Clear all classes from existing highlight spans.
	 */
	private _clearHighlightClasses( viewElement: ViewElement, writer: ViewDowncastWriter ): void {
		const attributeElements: Array<ViewAttributeElement> = [];

		const collectAttributeElements = ( element: ViewElement | ViewAttributeElement ) => {
			for ( const child of element.getChildren() ) {
				if ( child.is( 'attributeElement' ) ) {
					attributeElements.push( child );
					collectAttributeElements( child );
				} else if ( child.is( 'element' ) && child.name !== 'br' ) {
					collectAttributeElements( child );
				}
			}
		};

		collectAttributeElements( viewElement );

		for ( const element of attributeElements ) {
			if ( element.hasAttribute( 'class' ) ) {
				writer.removeAttribute( 'class', element );
			}
		}
	}

	/**
	 * Apply highlights to entire view element (full highlight).
	 */
	private _applyHighlightsToViewElement(
		codeElement: ViewElement,
		highlights: Array<HighlightNode>,
		writer: ViewDowncastWriter
	): void {
		// Get all text nodes
		const textNodes = this._getTextNodesInRange( codeElement, 0, Number.MAX_SAFE_INTEGER );

		// Extract all highlight segments
		const segments = this._extractHighlightsForRange( highlights, 0, Number.MAX_SAFE_INTEGER );

		// Apply highlights
		this._applyHighlightsToRange( textNodes, segments, 0, writer );
	}

	/**
	 * Extract text from a highlight node.
	 */
	private _extractTextFromHighlightNode( node: HighlightNode ): string {
		if ( node.type === 'text' && node.value ) {
			return node.value;
		}
		if ( node.children ) {
			return node.children.map( child => this._extractTextFromHighlightNode( child ) ).join( '' );
		}
		return '';
	}

	/**
	 * Find the <code> element inside a <pre> element.
	 */
	private _findCodeElement( element: ViewElement ): ViewElement | null {
		if ( element.name === 'code' ) {
			return element;
		}

		for ( const child of element.getChildren() ) {
			if ( child.is( 'element' ) && child.name === 'code' ) {
				return child;
			}
		}

		return null;
	}

	/**
	 * Register cleanup listeners to remove highlights before conversion.
	 */
	private _registerCleanupListeners(): void {
		const editor = this.editor;
		const view = editor.editing.view;

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			const removeHighlights = () => {
				view.change( writer => {
					const elementsArray = Array.from( this._highlightedElements );
					for ( const element of elementsArray ) {
						try {
							writer.unwrap( writer.createRangeOn( element ), element );
							this._highlightedElements.delete( element );
						} catch {
							this._highlightedElements.delete( element );
						}
					}
				} );
			};

			dispatcher.on( 'insert', removeHighlights, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlights, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlights, { priority: 'highest' } );
		} );
	}
}
