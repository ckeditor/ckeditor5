/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/automediaembed
 */

import { Plugin } from 'ckeditor5/src/core';
import { LiveRange, LivePosition } from 'ckeditor5/src/engine';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { Delete } from 'ckeditor5/src/typing';
import { Undo } from 'ckeditor5/src/undo';
import { global } from 'ckeditor5/src/utils';

import MediaEmbedEditing from './mediaembedediting';
import { insertMedia } from './utils';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w-]+\.[\w-.~:/?#[\]@!$&'()*+,;=%]+$/;

/**
 * The auto-media embed plugin. It recognizes media links in the pasted content and embeds
 * them shortly after they are injected into the document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoMediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Clipboard, Delete, Undo ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoMediaEmbed';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The paste–to–embed `setTimeout` ID. Stored as a property to allow
		 * cleaning of the timeout.
		 *
		 * @private
		 * @member {Number} #_timeoutId
		 */
		this._timeoutId = null;

		/**
		 * The position where the `<media>` element will be inserted after the timeout,
		 * determined each time the new content is pasted into the document.
		 *
		 * @private
		 * @member {module:engine/model/liveposition~LivePosition} #_positionToInsert
		 */
		this._positionToInsert = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting, the content between those positions will be checked for a URL that could be transformed
		// into media.
		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

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

		editor.commands.get( 'undo' ).on( 'execute', () => {
			if ( this._timeoutId ) {
				global.window.clearTimeout( this._timeoutId );
				this._positionToInsert.detach();

				this._timeoutId = null;
				this._positionToInsert = null;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Analyzes the part of the document between provided positions in search for a URL representing media.
	 * When the URL is found, it is automatically converted into media.
	 *
	 * @protected
	 * @param {module:engine/model/liveposition~LivePosition} leftPosition Left position of the selection.
	 * @param {module:engine/model/liveposition~LivePosition} rightPosition Right position of the selection.
	 */
	_embedMediaBetweenPositions( leftPosition, rightPosition ) {
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

		const mediaEmbedCommand = editor.commands.get( 'mediaEmbed' );

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

				let insertionPosition;

				// Check if position where the media element should be inserted is still valid.
				// Otherwise leave it as undefined to use document.selection - default behavior of model.insertContent().
				if ( this._positionToInsert.root.rootName !== '$graveyard' ) {
					insertionPosition = this._positionToInsert;
				}

				insertMedia( editor.model, url, insertionPosition, false );

				this._positionToInsert.detach();
				this._positionToInsert = null;
			} );

			editor.plugins.get( 'Delete' ).requestUndoOnBackspace();
		}, 100 );
	}
}
