/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/autoimage
 */

import { Plugin } from 'ckeditor5/src/core';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { LivePosition, LiveRange } from 'ckeditor5/src/engine';
import { Undo } from 'ckeditor5/src/undo';
import { Delete } from 'ckeditor5/src/typing';
import { global } from 'ckeditor5/src/utils';

import ImageUtils from './imageutils';

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const IMAGE_URL_REGEXP = new RegExp( String( /^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source +
	/\.(jpg|jpeg|png|gif|ico|webp|JPG|JPEG|PNG|GIF|ICO|WEBP)/.source +
	/(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source +
	/(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source ) );

/**
 * The auto-image plugin. It recognizes image links in the pasted content and embeds
 * them shortly after they are injected into the document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoImage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Clipboard, ImageUtils, Undo, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoImage';
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
		 * The position where the `<imageBlock>` element will be inserted after the timeout,
		 * determined each time a new content is pasted into the document.
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
		// into an image.
		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

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
	 * Analyzes the part of the document between provided positions in search for a URL representing an image.
	 * When the URL is found, it is automatically converted into an image.
	 *
	 * @protected
	 * @param {module:engine/model/liveposition~LivePosition} leftPosition Left position of the selection.
	 * @param {module:engine/model/liveposition~LivePosition} rightPosition Right position of the selection.
	 */
	_embedImageBetweenPositions( leftPosition, rightPosition ) {
		const editor = this.editor;
		// TODO: Use a marker instead of LiveRange & LivePositions.
		const urlRange = new LiveRange( leftPosition, rightPosition );
		const walker = urlRange.getWalker( { ignoreElementEnd: true } );
		const selectionAttributes = Object.fromEntries( editor.model.document.selection.getAttributes() );
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

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
		this._timeoutId = global.window.setTimeout( () => {
			// Do nothing if image element cannot be inserted at the current position.
			// See https://github.com/ckeditor/ckeditor5/issues/2763.
			// Condition must be checked after timeout - pasting may take place on an element, replacing it. The final position matters.
			const imageCommand = editor.commands.get( 'insertImage' );

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
				if ( this._positionToInsert.root.rootName !== '$graveyard' ) {
					insertionPosition = this._positionToInsert.toPosition();
				}

				imageUtils.insertImage( { ...selectionAttributes, src }, insertionPosition );

				this._positionToInsert.detach();
				this._positionToInsert = null;
			} );

			editor.plugins.get( 'Delete' ).requestUndoOnBackspace();
		}, 100 );
	}
}
