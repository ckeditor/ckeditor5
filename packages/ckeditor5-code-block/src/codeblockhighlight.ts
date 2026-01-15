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

// Import the GitHub theme for syntax highlighting (provides CSS classes like hljs-keyword, hljs-string, etc.).
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
	classes: string | null; // Space-separated class names (e.g., "hljs-keyword"), or null for plain text.
}

/**
 * The code block syntax highlighting plugin.
 *
 * Uses a model-based strategy to apply syntax highlighting:
 * - Operates at the model level using the `codeHighlight` text attribute.
 * - Applies highlight classes based on the lowlight library (highlight.js wrapper).
 * - Conversion handles rendering to the editing view automatically.
 */
export class CodeBlockHighlight extends Plugin {
	/**
	 * Lowlight instance for syntax highlighting.
	 */
	public readonly lowlight: ReturnType<typeof createLowlight>;

	/**
	 * Tracks the last highlighted state (text and language) for each code block.
	 *
	 * Used to avoid redundant re-analysis when the content hasn't changed.
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
		// Define schema: allow codeHighlight attribute on text, only inside codeBlock.
		this._defineSchema();

		// Define conversions: model attribute -> editing view span (no data conversion).
		this._defineConverters();

		// Register model post-fixer to apply highlights.
		this._registerModelPostFixer();

		// Register model post-fixer to remove invalid codeHighlight attributes.
		this._registerCleanupPostFixer();
	}

	/**
	 * Defines the schema for the codeHighlight attribute.
	 */
	private _defineSchema(): void {
		const schema = this.editor.model.schema;

		// Allow the codeHighlight attribute on $text nodes.
		schema.extend( '$text', {
			allowAttributes: 'codeHighlight'
		} );

		// Set attribute properties to control behavior.
		schema.setAttributeProperties( 'codeHighlight', {
			copyOnEnter: false, // New text after Enter should not inherit highlight.
			isFormatting: false // This is not user-applied formatting.
		} );

		// Restrict the codeHighlight attribute to text inside code blocks only.
		schema.addAttributeCheck( ( context, attributeName ) => {
			if ( attributeName !== 'codeHighlight' ) {
				return true;
			}

			// Check if we're inside a codeBlock element.
			// Context is like: "$root > codeBlock > $text" or "$root > codeBlock > $textProxy".
			return context.endsWith( 'codeBlock $text' ) || context.endsWith( 'codeBlock $textProxy' );
		} );
	}

	/**
	 * Defines conversions for the codeHighlight attribute.
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

				// The attribute value contains space-separated class names from highlight.js (e.g. "hljs-keyword").
				return writer.createAttributeElement( 'span', {
					class: attributeValue
				} );
			},
			converterPriority: 'high'
		} );
	}

	/**
	 * Registers a model post-fixer to remove stray codeHighlight attributes.
	 *
	 * This is necessary because `schema.addAttributeCheck()` only prevents adding new disallowed attributes
	 * but doesn't automatically remove existing attributes when content is moved or merged
	 * (e.g., when a code block is deleted and its content is merged into a paragraph).
	 *
	 * The post-fixer uses the differ to track only affected elements for optimal performance.
	 */
	private _registerCleanupPostFixer(): void {
		const editor = this.editor;
		const model = editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const affectedElements = new Set<ModelElement>();

			// Identify elements that might have stray codeHighlight attributes.
			for ( const change of changes ) {
				if ( change.type === 'insert' || change.type === 'remove' ) {
					const parent = change.position.parent;

					// Track non-code-block parents where content was added or removed.
					if ( parent && parent.is( 'element' ) && !parent.is( 'element', 'codeBlock' ) ) {
						affectedElements.add( parent );
					}
				}
			}

			// Remove codeHighlight attributes from text nodes outside code blocks.
			let changed = false;

			for ( const element of affectedElements ) {
				for ( const item of writer.createRangeIn( element ).getItems() ) {
					if ( ( item.is( '$text' ) || item.is( '$textProxy' ) ) && item.hasAttribute( 'codeHighlight' ) ) {
						// Double-check that this text is not inside a code block.
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
	 * Registers a model post-fixer to apply syntax highlighting to code blocks.
	 *
	 * The post-fixer uses the differ to identify only affected code blocks (those that were inserted,
	 * modified, or had content changes) to minimize performance impact during editing.
	 */
	private _registerModelPostFixer(): void {
		const editor = this.editor;
		const model = editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const affectedCodeBlocks = new Set<ModelElement>();

			// Identify code blocks that need re-highlighting based on model changes.
			for ( const change of changes ) {
				if ( change.type === 'insert' ) {
					const insertedItem = change.position.nodeAfter;

					// Track newly inserted code blocks (initialization, paste, or conversion).
					if ( insertedItem && insertedItem.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( insertedItem );
					}

					// Track code blocks where content was inserted (typing, paste).
					const parent = change.position.parent;

					if ( parent && parent.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( parent );
					}
				} else if ( change.type === 'remove' ) {
					// Track code blocks where content was removed (delete, backspace).
					const parent = change.position.parent;

					if ( parent && parent.is( 'element', 'codeBlock' ) ) {
						affectedCodeBlocks.add( parent );
					}
				}
			}

			// Early exit if no code blocks were affected by the changes.
			if ( affectedCodeBlocks.size === 0 ) {
				return false;
			}

			// Process each affected code block and apply highlights.
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
	 * Checks if a code block needs re-highlighting.
	 *
	 * @param codeBlock The code block element to check.
	 * @param currentText Current text content of the code block.
	 * @param currentLanguage Current language attribute value.
	 * @returns Returns `true` if the code block should be re-highlighted.
	 */
	private _shouldHighlightCodeBlock( codeBlock: ModelElement, currentText: string, currentLanguage: string ): boolean {
		const lastState = this._lastHighlightedState.get( codeBlock );

		// Re-highlight if never highlighted before or if text or language changed.
		if ( !lastState ) {
			return true;
		}

		return currentText !== lastState.text || currentLanguage !== lastState.language;
	}

	/**
	 * Highlights a code block by applying codeHighlight attributes to text ranges.
	 *
	 * @param codeBlock The code block element to highlight.
	 * @param code Text content of the code block.
	 * @param language Programming language for syntax highlighting.
	 * @param writer Model writer instance for applying changes.
	 * @returns Returns `true` if any changes were made to the model.
	 */
	private _highlightCodeBlock(
		codeBlock: ModelElement,
		code: string,
		language: string,
		writer: ModelWriter
	): boolean {
		// Get highlight segments from lowlight.
		const segments = this._getHighlightSegments( language, code );

		// Apply highlights to the code block.
		const changed = this._applyHighlightsToCodeBlock( codeBlock, segments, code.length, writer );

		// Cache the highlighted state to avoid redundant re-analysis.
		this._lastHighlightedState.set( codeBlock, {
			text: code,
			language
		} );

		return changed;
	}

	/**
	 * Gets highlight segments from lowlight for a given code and language.
	 *
	 * @param language Programming language identifier (e.g., 'javascript', 'python').
	 * @param code Source code to analyze.
	 * @returns Array of text segments with optional highlight classes.
	 */
	private _getHighlightSegments( language: string, code: string ): Array<HighlightSegment> {
		try {
			const result = this.lowlight.highlight( language, code );
			const nodes = ( result.children || [] ) as Array<HighlightNode>;

			return this._extractSegmentsFromNodes( nodes );
		} catch {
			// If lowlight fails (unsupported language or parsing error), return plain text.
			return [ { text: code, classes: null } ];
		}
	}

	/**
	 * Extracts text segments with classes from lowlight's node tree.
	 *
	 * @param nodes Array of highlight nodes from lowlight output.
	 * @returns Array of flattened text segments.
	 */
	private _extractSegmentsFromNodes( nodes: Array<HighlightNode> ): Array<HighlightSegment> {
		const segments: Array<HighlightSegment> = [];

		for ( const node of nodes ) {
			if ( node.type === 'text' && node.value ) {
				// Plain text node without highlighting.
				segments.push( {
					text: node.value,
					classes: null
				} );
			} else if ( node.type === 'element' && node.children ) {
				// Highlighted element node (e.g., keyword, string, comment).
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
	 * Recursively extracts text content from a highlight node tree.
	 *
	 * @param node Highlight node to extract text from.
	 * @returns Concatenated text content.
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
	 * Applies highlight segments to a code block by setting codeHighlight attributes on text ranges.
	 *
	 * @param codeBlock The code block element to apply highlights to.
	 * @param segments Array of highlight segments from lowlight, each containing text and optional CSS classes.
	 * @param actualLength Total character length of the code block text (used for bounds checking).
	 * @param writer Model writer instance for applying changes.
	 * @returns Returns `true` if any changes were made to the model.
	 */
	private _applyHighlightsToCodeBlock(
		codeBlock: ModelElement,
		segments: Array<HighlightSegment>,
		actualLength: number,
		writer: ModelWriter
	): boolean {
		let changed = false;
		let currentOffset = 0;

		for ( const segment of segments ) {
			const segmentLength = segment.text.length;

			// Safety check: ensure we don't exceed the actual text length.
			if ( currentOffset + segmentLength > actualLength ) {
				break;
			}

			// Create a range for this segment.
			const range = writer.createRange(
				writer.createPositionAt( codeBlock, currentOffset ),
				writer.createPositionAt( codeBlock, currentOffset + segmentLength )
			);

			// Apply or remove the codeHighlight attribute based on segment type.
			if ( segment.classes ) {
				writer.setAttribute( 'codeHighlight', segment.classes, range );
				changed = true;
			} else {
				// For plain text segments, remove highlight only if present to avoid unnecessary operations.
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
	 * Extracts text content from a model element (code block).
	 *
	 * Converts the code block's content into a flat string representation where softBreak elements
	 * are converted to newline characters for lowlight processing.
	 *
	 * @param element The code block model element.
	 * @returns Flattened text content with newlines.
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
