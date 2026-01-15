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
	ModelElement,
	ModelWriter
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
 * Represents a text segment with optional highlight classes.
 */
interface HighlightSegment {
	text: string;
	classes: string | null; // Space-separated class names, or null for no highlight
}

/**
 * The code block highlight plugin.
 *
 * MODEL-BASED STRATEGY:
 * - Works at the model level using text attributes
 * - Applies `codeHighlight` attribute to text nodes with highlight classes
 * - Conversion handles rendering to view automatically
 * - No manual view manipulation = no selection jumps!
 */
export class CodeBlockHighlight extends Plugin {
	/**
	 * Lowlight instance for syntax highlighting.
	 */
	public readonly lowlight: ReturnType<typeof createLowlight>;

	/**
	 * Track last highlighted state (text + language) for each code block to avoid redundant re-analysis.
	 */
	private _lastHighlightedState = new Map<ModelElement, { text: string; language: string }>();

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
		// Define schema: allow codeHighlight attribute on text, only inside codeBlock
		this._defineSchema();

		// Define conversions: model attribute -> editing view span (no data conversion)
		this._defineConverters();

		// Register model post-fixer to apply highlights
		this._registerModelPostFixer();

		// Register model post-fixer to remove invalid codeHighlight attributes
		this._registerCleanupPostFixer();
	}

	/**
	 * Define schema for codeHighlight attribute.
	 */
	private _defineSchema(): void {
		const schema = this.editor.model.schema;

		// Allow codeHighlight attribute on $text
		schema.extend( '$text', {
			allowAttributes: 'codeHighlight'
		} );

		// Set attribute properties
		schema.setAttributeProperties( 'codeHighlight', {
			copyOnEnter: false, // New text after Enter should not inherit highlight
			isFormatting: false // This is not user-applied formatting
		} );

		// Only allow codeHighlight inside codeBlock
		schema.addAttributeCheck( ( context, attributeName ) => {
			if ( attributeName !== 'codeHighlight' ) {
				return true;
			}

			// Check if we're inside a codeBlock using endsWith
			// Context is like: "$root > codeBlock > $text"
			return context.endsWith( 'codeBlock $text' ) || context.endsWith( 'codeBlock $textProxy' );
		} );
	}

	/**
	 * Define conversions for codeHighlight attribute.
	 */
	private _defineConverters(): void {
		const editor = this.editor;

		// Editing downcast: codeHighlight attribute -> <span class="...">
		editor.conversion.for( 'editingDowncast' ).attributeToElement( {
			model: 'codeHighlight',
			view: ( attributeValue, { writer } ) => {
				if ( !attributeValue ) {
					return null;
				}

				// attributeValue is space-separated class names
				return writer.createAttributeElement( 'span', {
					class: attributeValue
				} );
			},
			converterPriority: 'high'
		} );

		// NO data downcast - we want clean data without highlights
		// NO upcast - we'll recompute highlights on load
	}

	/**
	 * Register model post-fixer to remove codeHighlight attributes outside code blocks.
	 * This is necessary because schema.addAttributeCheck() only prevents adding NEW disallowed attributes,
	 * but doesn't automatically remove EXISTING attributes when content is moved/merged (e.g., deleting a code block).
	 *
	 * Uses differ to track only affected elements for optimal performance.
	 */
	private _registerCleanupPostFixer(): void {
		const editor = this.editor;
		const model = editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const affectedElements = new Set<ModelElement>();

			// First pass: identify elements that might have stray codeHighlight attributes
			for ( const change of changes ) {
				if ( change.type === 'insert' || change.type === 'remove' ) {
					const parent = change.position.parent;

					// Track non-code-block parents where content was added/removed
					if ( parent && parent.is( 'element' ) && !parent.is( 'element', 'codeBlock' ) ) {
						affectedElements.add( parent );
					}
				}
			}

			// Second pass: clean up only affected elements
			let changed = false;

			for ( const element of affectedElements ) {
				for ( const item of writer.createRangeIn( element ).getItems() ) {
					if ( ( item.is( '$text' ) || item.is( '$textProxy' ) ) && item.hasAttribute( 'codeHighlight' ) ) {
						// Check if this text is inside a codeBlock (don't remove if it is)
						const parent = item.parent;
						const isInCodeBlock = parent && parent.is( 'element', 'codeBlock' );

						if ( !isInCodeBlock ) {
							writer.removeAttribute( 'codeHighlight', item );
							changed = true;
						}
					}
				}
			}

			return changed;
		} );
	}

	/**
	 * Register model post-fixer to analyze and apply highlights.
	 */
	private _registerModelPostFixer(): void {
		const editor = this.editor;
		const model = editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const affectedCodeBlocks = new Set<ModelElement>();

			// Identify code blocks that need re-highlighting
			for ( const change of changes ) {
				if ( change.type === 'insert' ) {
					const insertedItem = change.position.nodeAfter;

					// A code block element was inserted
					if ( insertedItem && insertedItem.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( insertedItem );
					}

					// Content was inserted inside a code block (typing, paste)
					const parent = change.position.parent;

					if ( parent && parent.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( parent );
					}
				} else if ( change.type === 'remove' ) {
					// Content was removed from inside a code block (delete, backspace)
					const parent = change.position.parent;
					if ( parent && parent.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( parent );
					}
				}
			}

			// Early exit if no code blocks affected
			if ( affectedCodeBlocks.size === 0 ) {
				return false;
			}

			// Highlight only affected code blocks
			let changed = false;

			for ( const codeBlock of affectedCodeBlocks ) {
				const currentText = this._getTextFromModelElement( codeBlock );
				const currentLanguage = ( codeBlock.getAttribute( 'language' ) as string ) || 'plaintext';

				if ( this._shouldHighlightCodeBlock( codeBlock, currentText, currentLanguage ) ) {
					const wasChanged = this._highlightCodeBlock( codeBlock, currentText, currentLanguage, writer );

					changed = changed || wasChanged;
				}
			}

			return changed;
		} );
	}

	/**
	 * Check if a code block needs re-highlighting.
	 */
	private _shouldHighlightCodeBlock( codeBlock: ModelElement, currentText: string, currentLanguage: string ): boolean {
		const lastState = this._lastHighlightedState.get( codeBlock );

		// Re-highlight if text changed OR language changed OR never highlighted before
		if ( !lastState ) {
			return true;
		}

		return currentText !== lastState.text || currentLanguage !== lastState.language;
	}

	/**
	 * Highlight a code block by applying codeHighlight attributes.
	 */
	private _highlightCodeBlock(
		codeBlock: ModelElement,
		code: string,
		language: string,
		writer: ModelWriter
	): boolean {
		// Get highlight segments from lowlight
		const segments = this._getHighlightSegments( language, code );

		// Apply highlights to the code block
		const changed = this._applyHighlightsToCodeBlock( codeBlock, segments, code.length, writer );

		// Remember what we highlighted (both text and language)
		this._lastHighlightedState.set( codeBlock, {
			text: code,
			language
		} );

		return changed;
	}

	/**
	 * Get highlight segments from lowlight.
	 */
	private _getHighlightSegments( language: string, code: string ): Array<HighlightSegment> {
		try {
			const result = this.lowlight.highlight( language, code );
			const nodes = ( result.children || [] ) as Array<HighlightNode>;

			return this._extractSegmentsFromNodes( nodes );
		} catch {
			// If lowlight fails, return plain text
			return [ { text: code, classes: null } ];
		}
	}

	/**
	 * Extract text segments with classes from lowlight nodes.
	 */
	private _extractSegmentsFromNodes( nodes: Array<HighlightNode> ): Array<HighlightSegment> {
		const segments: Array<HighlightSegment> = [];

		for ( const node of nodes ) {
			if ( node.type === 'text' && node.value ) {
				// Plain text, no highlight
				segments.push( {
					text: node.value,
					classes: null
				} );
			} else if ( node.type === 'element' && node.children ) {
				// Highlighted element
				const classes = node.properties?.className?.join( ' ' ) || null;
				const childText = this._extractTextFromNode( node );

				if ( childText ) {
					segments.push( {
						text: childText,
						classes
					} );
				}
			}
		}

		return segments;
	}

	/**
	 * Extract text content from a highlight node.
	 */
	private _extractTextFromNode( node: HighlightNode ): string {
		if ( node.type === 'text' && node.value ) {
			return node.value;
		}

		if ( node.children ) {
			let text = '';
			for ( const child of node.children ) {
				text += this._extractTextFromNode( child );
			}
			return text;
		}

		return '';
	}

	/**
	 * Apply highlight segments to a code block.
	 */
	private _applyHighlightsToCodeBlock(
		codeBlock: ModelElement,
		segments: Array<HighlightSegment>,
		actualLength: number,
		writer: ModelWriter
	): boolean {
		let changed = false;

		// Process each segment
		let currentOffset = 0;

		for ( const segment of segments ) {
			const segmentLength = segment.text.length;

			// Safety check: don't go beyond actual text
			if ( currentOffset + segmentLength > actualLength ) {
				break;
			}

			// Create range for this segment
			const range = writer.createRange(
				writer.createPositionAt( codeBlock, currentOffset ),
				writer.createPositionAt( codeBlock, currentOffset + segmentLength )
			);

			// Apply or remove codeHighlight attribute on the entire range
			if ( segment.classes ) {
				// Apply highlight
				writer.setAttribute( 'codeHighlight', segment.classes, range );

				changed = true;
			} else {
				// In this case, the text is plain text, so we need to remove the highlight.
				// Remove highlight only if any item in range has the attribute
				let hasAttribute = false;

				for ( const item of range.getItems() ) {
					if ( ( item.is( '$text' ) || item.is( '$textProxy' ) ) && item.hasAttribute( 'codeHighlight' ) ) {
						hasAttribute = true;
						break;
					}
				}

				if ( hasAttribute ) {
					writer.removeAttribute( 'codeHighlight', range );

					changed = true;
				}
			}

			currentOffset += segmentLength;
		}

		return changed;
	}

	/**
	 * Get text content from a model element (code block).
	 */
	private _getTextFromModelElement( element: ModelElement ): string {
		const parts: Array<string> = [];

		for ( const child of element.getChildren() ) {
			if ( child.is( '$text' ) || child.is( '$textProxy' ) ) {
				parts.push( child.data );
			} else if ( child.is( 'element', 'softBreak' ) ) {
				parts.push( '\n' );
			}
		}

		return parts.join( '' );
	}
}
