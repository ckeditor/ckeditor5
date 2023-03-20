/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/automediaembed
 */

import { type Editor, Plugin } from 'ckeditor5/src/core';
import { LiveRange, LivePosition } from 'ckeditor5/src/engine';
import { Clipboard, type ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { Delete } from 'ckeditor5/src/typing';
import { Undo, type UndoCommand } from 'ckeditor5/src/undo';
import { global } from 'ckeditor5/src/utils';

import MediaEmbedEditing from './mediaembedediting';
import { insertMedia } from './utils';
import type MediaEmbedCommand from './mediaembedcommand';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w-]+\.[\w-.~:/?#[\]@!$&'()*+,;=%]+$/;

/**
 * The auto-media embed plugin. It recognizes media links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */
export default class AutoMediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Clipboard, Delete, Undo ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'AutoMediaEmbed' {
		return 'AutoMediaEmbed';
	}

	/**
	 * The paste–to–embed `setTimeout` ID. Stored as a property to allow
	 * cleaning of the timeout.
	 */
	private _timeoutId: number | null;

	/**
	 * The position where the `<media>` element will be inserted after the timeout,
	 * determined each time the new content is pasted into the document.
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

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting, the content between those positions will be checked for a URL that could be transformed
		// into media.
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		this.listenTo( clipboardPipeline, 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange()!;

			const leftLivePosition = LivePosition.fromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			const rightLivePosition = LivePosition.fromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';

			modelDocument.once( 'change:data', () => {
				this._embedMediaBetweenPositions( leftLivePosition, rightLivePosition );

				leftLivePosition.detach();
				rightLivePosition.detach();
			}, { priority: 'high' } );
		} );

		const undoCommand: UndoCommand = editor.commands.get( 'undo' )!;
		undoCommand.on( 'execute', () => {
			if ( this._timeoutId ) {
				global.window.clearTimeout( this._timeoutId );
				this._positionToInsert!.detach();

				this._timeoutId = null;
				this._positionToInsert = null;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Analyzes the part of the document between provided positions in search for a URL representing media.
	 * When the URL is found, it is automatically converted into media.
	 *
	 * @param leftPosition Left position of the selection.
	 * @param rightPosition Right position of the selection.
	 */
	private _embedMediaBetweenPositions( leftPosition: LivePosition, rightPosition: LivePosition ): void {
		const editor = this.editor;
		const mediaRegistry = editor.plugins.get( MediaEmbedEditing ).registry;
		// TODO: Use marker instead of LiveRange & LivePositions.
		const urlRange = new LiveRange( leftPosition, rightPosition );
		const walker = urlRange.getWalker( { ignoreElementEnd: true } );

		let url = '';

		for ( const node of walker ) {
			if ( node.item.is( '$textProxy' ) ) {
				url += node.item.data;
			}
		}

		url = url.trim();

		// If the URL does not match to universal URL regexp, let's skip that.
		if ( !url.match( URL_REGEXP ) ) {
			urlRange.detach();

			return;
		}

		// If the URL represents a media, let's use it.
		if ( !mediaRegistry.hasMedia( url ) ) {
			urlRange.detach();

			return;
		}

		const mediaEmbedCommand: MediaEmbedCommand = editor.commands.get( 'mediaEmbed' )!;

		// Do not anything if media element cannot be inserted at the current position (#47).
		if ( !mediaEmbedCommand.isEnabled ) {
			urlRange.detach();

			return;
		}

		// Position won't be available in the `setTimeout` function so let's clone it.
		this._positionToInsert = LivePosition.fromPosition( leftPosition );

		// This action mustn't be executed if undo was called between pasting and auto-embedding.
		this._timeoutId = global.window.setTimeout( () => {
			editor.model.change( writer => {
				this._timeoutId = null;

				writer.remove( urlRange );
				urlRange.detach();

				let insertionPosition: LivePosition | null = null;

				// Check if position where the media element should be inserted is still valid.
				// Otherwise leave it as undefined to use document.selection - default behavior of model.insertContent().
				if ( this._positionToInsert!.root.rootName !== '$graveyard' ) {
					insertionPosition = this._positionToInsert;
				}

				insertMedia( editor.model, url, insertionPosition, false );

				this._positionToInsert!.detach();
				this._positionToInsert = null;
			} );

			editor.plugins.get( Delete ).requestUndoOnBackspace();
		}, 100 );
	}
}
