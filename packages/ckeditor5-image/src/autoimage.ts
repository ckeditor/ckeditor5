/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/autoimage
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Clipboard, type ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
import { LivePosition, LiveRange } from 'ckeditor5/src/engine.js';
import { Undo } from 'ckeditor5/src/undo.js';
import { Delete } from 'ckeditor5/src/typing.js';
import { global } from 'ckeditor5/src/utils.js';

import ImageUtils from './imageutils.js';

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const IMAGE_URL_REGEXP = new RegExp( String( /^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source +
	/\.(jpg|jpeg|png|gif|ico|webp|JPG|JPEG|PNG|GIF|ICO|WEBP)/.source +
	/(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source +
	/(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source ) );

/**
 * The auto-image plugin. It recognizes image links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */
export default class AutoImage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Clipboard, ImageUtils, Undo, Delete ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AutoImage' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * The paste–to–embed `setTimeout` ID. Stored as a property to allow
	 * cleaning of the timeout.
	 */
	private _timeoutId: ReturnType<typeof setTimeout> | null;

	/**
	 * The position where the `<imageBlock>` element will be inserted after the timeout,
	 * determined each time a new content is pasted into the document.
	 */
	private _positionToInsert: LivePosition | null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._timeoutId = null;

		this._positionToInsert = null;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting, the content between those positions will be checked for a URL that could be transformed
		// into an image.
		this.listenTo( clipboardPipeline, 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange()!;

			const leftLivePosition = LivePosition.fromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			const rightLivePosition = LivePosition.fromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';

			modelDocument.once( 'change:data', () => {
				this._embedImageBetweenPositions( leftLivePosition, rightLivePosition );

				leftLivePosition.detach();
				rightLivePosition.detach();
			}, { priority: 'high' } );
		} );

		editor.commands.get( 'undo' )!.on( 'execute', () => {
			if ( this._timeoutId ) {
				global.window.clearTimeout( this._timeoutId );
				this._positionToInsert!.detach();

				this._timeoutId = null;
				this._positionToInsert = null;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Analyzes the part of the document between provided positions in search for a URL representing an image.
	 * When the URL is found, it is automatically converted into an image.
	 *
	 * @param leftPosition Left position of the selection.
	 * @param rightPosition Right position of the selection.
	 */
	private _embedImageBetweenPositions( leftPosition: LivePosition, rightPosition: LivePosition ): void {
		const editor = this.editor;
		// TODO: Use a marker instead of LiveRange & LivePositions.
		const urlRange = new LiveRange( leftPosition, rightPosition );
		const walker = urlRange.getWalker( { ignoreElementEnd: true } );
		const selectionAttributes = Object.fromEntries( editor.model.document.selection.getAttributes() );
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

		let src = '';

		for ( const node of walker ) {
			if ( node.item.is( '$textProxy' ) ) {
				src += node.item.data;
			}
		}

		src = src.trim();

		// If the URL does not match the image URL regexp, let's skip that.
		if ( !src.match( IMAGE_URL_REGEXP ) ) {
			urlRange.detach();

			return;
		}

		// Position will not be available in the `setTimeout` function so let's clone it.
		this._positionToInsert = LivePosition.fromPosition( leftPosition );

		// This action mustn't be executed if undo was called between pasting and auto-embedding.
		this._timeoutId = setTimeout( () => {
			// Do nothing if image element cannot be inserted at the current position.
			// See https://github.com/ckeditor/ckeditor5/issues/2763.
			// Condition must be checked after timeout - pasting may take place on an element, replacing it. The final position matters.
			const imageCommand = editor.commands.get( 'insertImage' )!;

			if ( !imageCommand.isEnabled ) {
				urlRange.detach();

				return;
			}

			editor.model.change( writer => {
				this._timeoutId = null;

				writer.remove( urlRange );
				urlRange.detach();

				let insertionPosition;

				// Check if the position where the element should be inserted is still valid.
				// Otherwise leave it as undefined to use the logic of insertImage().
				if ( this._positionToInsert!.root.rootName !== '$graveyard' ) {
					insertionPosition = this._positionToInsert!.toPosition();
				}

				imageUtils.insertImage( { ...selectionAttributes, src }, insertionPosition );

				this._positionToInsert!.detach();
				this._positionToInsert = null;
			} );

			const deletePlugin: Delete = editor.plugins.get( 'Delete' );

			deletePlugin.requestUndoOnBackspace();
		}, 100 );
	}
}
