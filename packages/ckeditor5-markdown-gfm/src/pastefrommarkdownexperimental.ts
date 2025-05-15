/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/pastefrommarkdownexperimental
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { ClipboardPipeline, type ClipboardInputTransformationEvent } from 'ckeditor5/src/clipboard.js';
import GFMDataProcessor from './gfmdataprocessor.js';
import type { ViewDocumentKeyDownEvent } from 'ckeditor5/src/engine.js';

const ALLOWED_MARKDOWN_FIRST_LEVEL_TAGS = [ 'SPAN', 'BR', 'PRE', 'CODE' ];

/**
 * The GitHub Flavored Markdown (GFM) paste plugin.
 *
 * For a detailed overview, check the {@glink features/pasting/paste-markdown Paste Markdown feature} guide.
 */
export default class PasteFromMarkdownExperimental extends Plugin {
	/**
	 * @internal
	 */
	private _gfmDataProcessor: GFMDataProcessor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._gfmDataProcessor = new GFMDataProcessor( editor.data.viewDocument );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PasteFromMarkdownExperimental' as const;
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
		const view = editor.editing.view;
		const viewDocument = view.document;

		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );

		let shiftPressed = false;

		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( evt, data ) => {
			shiftPressed = data.shiftKey;
		} );

		this.listenTo<ClipboardInputTransformationEvent>( clipboardPipeline, 'inputTransformation', ( evt, data ) => {
			if ( shiftPressed ) {
				return;
			}

			const dataAsTextHtml = data.dataTransfer.getData( 'text/html' );

			if ( !dataAsTextHtml ) {
				const dataAsTextPlain = data.dataTransfer.getData( 'text/plain' );

				data.content = this._gfmDataProcessor.toView( dataAsTextPlain );

				return;
			}

			const markdownFromHtml = this._parseMarkdownFromHtml( dataAsTextHtml );

			if ( markdownFromHtml ) {
				data.content = this._gfmDataProcessor.toView( markdownFromHtml );
			}
		} );
	}

	/**
	 * Determines if the code copied from a website in the `text/html` type can be parsed as Markdown.
	 * It removes any OS-specific HTML tags, for example, <meta> on macOS and <!--StartFragment--> on Windows.
	 * Then removes a single wrapper HTML tag or wrappers for sibling tags, and if there are no more tags left,
	 * returns the remaining text. Returns null if there are any remaining HTML tags detected.
	 *
	 * @param htmlString Clipboard content in the `text/html` type format.
	 */
	private _parseMarkdownFromHtml( htmlString: string ): string | null {
		const withoutOsSpecificTags = this._removeOsSpecificTags( htmlString );

		if ( !this._containsOnlyAllowedFirstLevelTags( withoutOsSpecificTags ) ) {
			return null;
		}

		const withoutWrapperTag = this._removeFirstLevelWrapperTagsAndBrs( withoutOsSpecificTags );

		if ( this._containsAnyRemainingHtmlTags( withoutWrapperTag ) ) {
			return null;
		}

		return this._replaceHtmlReservedEntitiesWithCharacters( withoutWrapperTag );
	}

	/**
	 * Removes OS-specific tags.
	 *
	 * @param htmlString Clipboard content in the `text/html` type format.
	 */
	private _removeOsSpecificTags( htmlString: string ): string {
		// Removing the <meta> tag present on Mac.
		const withoutMetaTag = htmlString.replace( /^<meta\b[^>]*>/, '' ).trim();
		// Removing the <html> tag present on Windows.
		const withoutHtmlTag = withoutMetaTag.replace( /^<html>/, '' ).replace( /<\/html>$/, '' ).trim();
		// Removing the <body> tag present on Windows.
		const withoutBodyTag = withoutHtmlTag.replace( /^<body>/, '' ).replace( /<\/body>$/, '' ).trim();

		// Removing the <!--StartFragment--> tag present on Windows.
		return withoutBodyTag.replace( /^<!--StartFragment-->/, '' ).replace( /<!--EndFragment-->$/, '' ).trim();
	}

	/**
	 * If the input HTML string contains any first-level formatting tags
	 * like <b>, <strong>, or <i>, we should not treat it as Markdown.
	 *
	 * @param htmlString Clipboard content.
	 */
	private _containsOnlyAllowedFirstLevelTags( htmlString: string ): boolean {
		const parser = new DOMParser();
		const { body: tempElement } = parser.parseFromString( htmlString, 'text/html' );

		const tagNames = Array.from( tempElement.children ).map( el => el.tagName );

		return tagNames.every( el => ALLOWED_MARKDOWN_FIRST_LEVEL_TAGS.includes( el ) );
	}

	/**
	 * Removes multiple HTML wrapper tags from a list of sibling HTML tags.
	 *
	 * @param htmlString Clipboard content without any OS-specific tags.
	 */
	private _removeFirstLevelWrapperTagsAndBrs( htmlString: string ): string {
		const parser = new DOMParser();
		const { body: tempElement } = parser.parseFromString( htmlString, 'text/html' );

		const brElements = tempElement.querySelectorAll( 'br' );

		for ( const br of brElements ) {
			br.replaceWith( '\n' );
		}

		const outerElements = tempElement.querySelectorAll( ':scope > *' );

		for ( const element of outerElements ) {
			const elementClone = element.cloneNode( true );
			element.replaceWith( ...elementClone.childNodes );
		}

		return tempElement.innerHTML;
	}

	/**
	 * Determines if a string contains any HTML tags.
	 */
	private _containsAnyRemainingHtmlTags( str: string ): boolean {
		return str.includes( '<' );
	}

	/**
	 * Replaces the reserved HTML entities with the actual characters.
	 *
	 * @param htmlString Clipboard content without any tags.
	 */
	private _replaceHtmlReservedEntitiesWithCharacters( htmlString: string ) {
		return htmlString
			.replace( /&gt;/g, '>' )
			.replace( /&lt;/g, '<' )
			.replace( /&nbsp;/g, ' ' );
	}
}
