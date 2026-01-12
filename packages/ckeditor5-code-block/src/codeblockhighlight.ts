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
	ViewText
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
	 * Flag to prevent infinite loops in post-fixer.
	 */
	private _isHighlighting = false;

	/**
	 * Last highlighted text per code block to avoid unnecessary re-highlighting.
	 */
	private _lastHighlightedText = new Map<ModelElement, string>();

	/**
	 * Flag to indicate if we're doing initial highlighting (to prevent cleanup)
	 */
	private _isInitializing = false;

	/**
	 * Flag to enable cleanup listeners only after first user interaction
	 */
	private _cleanupEnabled = false;

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
		// DON'T register cleanup listeners yet - test if they're causing the issue
		// this._registerCleanupListeners();

		// Listen for changes in the model to schedule highlighting
		this._registerModelChangeListener();
	}

	/**
	 * Get syntax highlights using lowlight for the given code and language.
	 */
	private _getLowlightHighlight( language: string, code: string ): Array<HighlightNode> {
		try {
			// Call lowlight.highlight() with language and code
			// Returns: { type: 'root', children: [...], data: { language, relevance } }
			const result = this.lowlight.highlight( language, code );

			// Return the children array which contains the highlighted nodes
			// Cast to our HighlightNode type (lowlight's structure is compatible)
			return ( result.children || [] ) as Array<HighlightNode>;
		} catch {
			// Language not supported or highlighting failed
			// Return plain text without highlighting
			return [ {
				type: 'text',
				value: code
			} ];
		}
	}

	/**
	 * Register listener for model document changes.
	 */
	private _registerModelChangeListener(): void {
		const model = this.editor.model;

		// Listen for content changes (typing, paste, etc.)
		this.listenTo( model.document, 'change:data', () => {
			const selection = model.document.selection;
			const position = selection.getFirstPosition();

			if ( !position || !position.parent.is( 'element', 'codeBlock' ) ) {
				return;
			}

			const codeBlock = position.parent as ModelElement;

			// Check if we should highlight immediately based on what was typed
			if ( this._shouldHighlightImmediately( codeBlock ) ) {
				// Use requestAnimationFrame to avoid blocking the typing
				requestAnimationFrame( () => {
					this._highlightCodeBlock( codeBlock );
				} );
			}
		} );

		// Listen for codeBlock insertions (including language changes)
		this.listenTo( model.document, 'change:data', () => {
			// Check if any codeBlock was inserted
			const changes = model.document.differ.getChanges();

			for ( const change of changes ) {
				if ( change.type === 'insert' ) {
					// Check if the inserted element is a codeBlock
					const item = change.position.nodeAfter;
					if ( item && item.is( 'element', 'codeBlock' ) ) {
						// Highlight the newly inserted code block
						setTimeout( () => this._highlightCodeBlock( item ) );
					}
				}
			}
		} );
	}

	/**
	 * Determine if we should highlight immediately based on the current context.
	 */
	private _shouldHighlightImmediately( codeBlock: ModelElement ): boolean {
		// Check if content has changed
		const currentText = this._getTextFromModelElement( codeBlock );
		const lastText = this._lastHighlightedText.get( codeBlock );

		// Always highlight if this is the first time or content changed significantly (paste, delete)
		if ( !lastText ) {
			return true;
		}

		// Don't highlight if text hasn't changed (e.g., cursor movement)
		if ( currentText === lastText ) {
			return false;
		}

		// Don't highlight if content changed significantly (will be handled by paste/undo)
		if ( Math.abs( currentText.length - lastText.length ) > 1 ) {
			return true;
		}

		// Only highlight when a word boundary character was just typed
		// Check the last character of the entire text
		if ( currentText.length > 0 ) {
			const lastCharInText = currentText[ currentText.length - 1 ];
			const wordBoundaries = /[\s.,;:!?(){}[\]<>=+\-*/%&|^~`'"]/;

			if ( wordBoundaries.test( lastCharInText ) ) {
				return true;
			}
		}

		return false;
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
	 * Highlight a single code block.
	 */
	private _highlightCodeBlock( codeBlock: ModelElement ): void {
		if ( this._isHighlighting ) {
			return;
		}

		this._isHighlighting = true;

		const editor = this.editor;
		const view = editor.editing.view;
		const mapper = editor.editing.mapper;
		const model = editor.model;

		// Save the current model selection position
		const modelSelection = model.document.selection;
		const modelPosition = modelSelection.getFirstPosition();
		let savedOffset: number | null = null;
		let isInThisCodeBlock = false;

		// Check if selection is in this code block and save offset
		if ( modelPosition && modelPosition.parent === codeBlock ) {
			savedOffset = modelPosition.offset;
			isInThisCodeBlock = true;
		}

		view.change( writer => {
			// Get the view element for this code block (the <code> element)
			const viewCodeElement = mapper.toViewElement( codeBlock );
			if ( !viewCodeElement ) {
				this._isHighlighting = false;
				return;
			}

			// Find the actual <code> element
			const codeElement = this._findCodeElement( viewCodeElement );
			if ( !codeElement ) {
				this._isHighlighting = false;
				return;
			}

			// Get all text content from the view element
			const text = this._getTextFromViewElement( codeElement );

			// Store the text we're highlighting
			this._lastHighlightedText.set( codeBlock, text );

			// Clear existing highlights in the entire code block
			this._clearHighlightsInViewElement( codeElement, writer );

			// Get the language attribute from the code block model
			const language = codeBlock.getAttribute( 'language' ) as string || 'plaintext';

			// Get highlights using lowlight with the specified language
			const highlights = this._getLowlightHighlight( language, text );

			// Apply highlights
			this._applyHighlightsToViewElement( codeElement, highlights, writer );
		} );

		// Restore the selection position in the model after a brief delay
		// This ensures the view has been updated before we restore the selection
		if ( isInThisCodeBlock && savedOffset !== null ) {
			const offsetToRestore = savedOffset; // Capture non-null value for closure
			setTimeout( () => {
				model.change( writer => {
					const newPosition = writer.createPositionAt( codeBlock, offsetToRestore );
					writer.setSelection( newPosition );
				} );
			}, 0 );
		}

		this._isHighlighting = false;
	}

	/**
	 * Get text content from a view element.
	 */
	private _getTextFromViewElement( element: ViewElement ): string {
		let text = '';
		for ( const child of element.getChildren() ) {
			if ( child.is( '$text' ) ) {
				text += child.data;
			} else if ( child.is( 'element', 'br' ) ) {
				text += '\n';
			} else if ( child.is( 'element' ) ) {
				// Recursively get text from child elements (for existing highlights)
				text += this._getTextFromViewElement( child );
			}
		}
		return text;
	}

	/**
	 * Clear all highlights in a view element.
	 */
	private _clearHighlightsInViewElement( viewElement: ViewElement, writer: ViewDowncastWriter ): void {
		const elementsToRemove: Array<ViewAttributeElement> = [];

		// Collect all highlighted elements
		for ( const item of this._highlightedElements ) {
			// Check if this element is a descendant of the viewElement
			let parent = item.parent;
			while ( parent ) {
				if ( parent === viewElement ) {
					elementsToRemove.push( item );
					break;
				}
				parent = parent.parent;
			}
		}

		// Remove highlights
		for ( const element of elementsToRemove ) {
			try {
				writer.unwrap( writer.createRangeOn( element ), element );
				this._highlightedElements.delete( element );
			} catch {
				// Element might already be removed or invalid
				this._highlightedElements.delete( element );
			}
		}
	}

	/**
	 * Apply highlights to a view element.
	 */
	private _applyHighlightsToViewElement(
		codeElement: ViewElement,
		highlights: Array<HighlightNode>,
		writer: ViewDowncastWriter
	): void {
		// Build a flat list of text nodes and their positions
		const textNodes: Array<{ node: ViewText; start: number; end: number }> = [];
		let currentOffset = 0;

		const collectTextNodes = ( element: ViewElement | ViewAttributeElement ) => {
			for ( const child of element.getChildren() ) {
				if ( child.is( '$text' ) ) {
					const nodeLength = child.data.length;
					textNodes.push( {
						node: child,
						start: currentOffset,
						end: currentOffset + nodeLength
					} );
					currentOffset += nodeLength;
				} else if ( child.is( 'element', 'br' ) ) {
					// Treat <br> as newline character
					currentOffset += 1;
				} else if ( child.is( 'element' ) || child.is( 'attributeElement' ) ) {
					// Recursively collect from child elements
					// BUT don't collect from old highlight spans - they should have been cleared
					collectTextNodes( child );
				}
			}
		};

		collectTextNodes( codeElement );

		// Build a list of segments to highlight with their positions
		interface SegmentToHighlight {
			start: number;
			end: number;
			className: string;
			tagName: string;
		}
		const segmentsToHighlight: Array<SegmentToHighlight> = [];

		let charPosition = 0;
		for ( const highlight of highlights ) {
			if ( highlight.type === 'text' && highlight.value ) {
				charPosition += highlight.value.length;
			} else if ( highlight.type === 'element' && highlight.children ) {
				const textValue = this._extractTextFromHighlightNode( highlight );
				const startPos = charPosition;
				const endPos = charPosition + textValue.length;

				const className = highlight.properties?.className?.join( ' ' ) || '';
				segmentsToHighlight.push( {
					start: startPos,
					end: endPos,
					className,
					tagName: highlight.tagName || 'span'
				} );

				charPosition += textValue.length;
			}
		}

		// IMPORTANT: Wrap in REVERSE order (from end to start)
		// This prevents earlier wraps from invalidating text node references for later wraps
		for ( let i = segmentsToHighlight.length - 1; i >= 0; i-- ) {
			const segment = segmentsToHighlight[ i ];

			// Find text nodes that contain this range
			const affectedNodes = textNodes.filter( node =>
				node.start < segment.end && node.end > segment.start
			);

			// Wrap the text in these nodes (also in reverse order)
			for ( let j = affectedNodes.length - 1; j >= 0; j-- ) {
				const nodeInfo = affectedNodes[ j ];
				const relativeStart = Math.max( 0, segment.start - nodeInfo.start );
				const relativeEnd = Math.min( nodeInfo.node.data.length, segment.end - nodeInfo.start );

				if ( relativeStart < relativeEnd && relativeStart < nodeInfo.node.data.length ) {
					try {
						const startPosition = writer.createPositionAt( nodeInfo.node, relativeStart );
						const endPosition = writer.createPositionAt( nodeInfo.node, relativeEnd );
						const range = writer.createRange( startPosition, endPosition );

						const attributeElement = writer.createAttributeElement(
							segment.tagName,
							{ class: segment.className }
						);

						writer.wrap( range, attributeElement );
						this._highlightedElements.add( attributeElement );
					} catch ( error ) {
						// Skip if wrapping fails
						console.warn( 'Failed to wrap text node:', error );
					}
				}
			}
		}
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
		// The structure is <pre><code>...</code></pre>
		// The viewElement might be the <code> itself or we need to find it
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
				// Don't cleanup if not enabled yet
				if ( !this._cleanupEnabled ) {
					return;
				}

				// Don't cleanup during highlighting or initialization
				if ( this._isHighlighting || this._isInitializing ) {
					return;
				}

				view.change( writer => {
					const elementsArray = Array.from( this._highlightedElements );
					for ( const element of elementsArray ) {
						try {
							writer.unwrap( writer.createRangeOn( element ), element );
							this._highlightedElements.delete( element );
						} catch {
							// Element might already be removed
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

