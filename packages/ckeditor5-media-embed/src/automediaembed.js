/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/automediaembed
 */

import MediaEmbedEditing from './mediaembedediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import LiveRange from '@ckeditor/ckeditor5-engine/src/model/liverange';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import LivePosition from '@ckeditor/ckeditor5-engine/src/model/liveposition';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;

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
		return [ Clipboard, Undo ];
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
		 * A timer id returned by `setTimeout` function.
		 *
		 * @private
		 * @member {Number} media-embed/automediaembed~AutoMediaEmbed#_timeoudId
		 */
		this._timeoutId = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting a content, between those position can be located a URL that should be transformed to media.
		this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

			const leftLivePosition = LivePosition.createFromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			const rightLivePosition = LivePosition.createFromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';

			modelDocument.once( 'change:data', () => {
				this._autoEmbedingEventHandler( leftLivePosition, rightLivePosition );

				leftLivePosition.detach();
				rightLivePosition.detach();
			}, { priority: 'high' } );
		} );

		editor.commands.get( 'undo' ).on( 'execute', () => {
			if ( this._timeoutId ) {
				global.window.clearTimeout( this._timeoutId );
				this._timeoutId = null;
			}
		}, { priority: 'high' } );
	}

	/**
	 * A handler that replaces the pasted URL with `<media>` element.
	 *
	 * @private
	 * @param {module:engine/model/liveposition~LivePosition} leftPosition Left position of the selection.
	 * @param {module:engine/model/liveposition~LivePosition} rightPosition Right position of the selection.
	 */
	_autoEmbedingEventHandler( leftPosition, rightPosition ) {
		const editor = this.editor;
		const mediaRegistry = editor.plugins.get( MediaEmbedEditing ).registry;
		const urlRange = new LiveRange( leftPosition, rightPosition );
		const walker = new TreeWalker( { boundaries: urlRange, ignoreElementEnd: true } );

		let url = '';

		for ( const node of walker ) {
			url += node.item.data;
		}

		url = url.trim();

		// If the url does not match to universal url regexp, let's skip that.
		if ( !url.match( URL_REGEXP ) ) {
			return;
		}

		// If the url is valid from MediaEmbed plugin point of view, let's use it.
		if ( !mediaRegistry.hasMedia( url ) ) {
			return;
		}

		// Positions won't be available in `setTimeout` function so let's clone it.
		const positionToInsert = Position.createFromPosition( leftPosition );

		// This action mustn't be executed if undo was called between pasting and auto-embedding.
		this._timeoutId = global.window.setTimeout( () => {
			editor.model.change( writer => {
				this._timeoutId = null;

				writer.remove( urlRange );
				writer.setSelection( positionToInsert );
				editor.commands.execute( 'mediaEmbed', url );
			} );
		}, 100 );
	}
}
