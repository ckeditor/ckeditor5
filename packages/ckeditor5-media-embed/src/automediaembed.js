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
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import LivePosition from '@ckeditor/ckeditor5-engine/src/model/liveposition';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;

/**
 * The auto-media embed plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoMediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Clipboard ];
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
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const mediaRegistry = editor.plugins.get( MediaEmbedEditing ).registry;

		let leftLivePosition, rightLivePosition;

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting a content, between those position can be located a URL that should be transformed to media.
		this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

			leftLivePosition = LivePosition.createFromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			rightLivePosition = LivePosition.createFromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';
		} );

		modelDocument.on( 'change:data', () => {
			if ( !leftLivePosition ) {
				return;
			}

			const urlRange = new Range( leftLivePosition, rightLivePosition );
			const walker = new TreeWalker( { boundaries: urlRange, ignoreElementEnd: true } );

			let url = '';

			for ( const node of walker ) {
				if ( node.type === 'elementStart' ) {
					return detach();
				}

				url += node.item.data;
			}

			url = url.trim();

			// If the url does not match to universal url regexp, let's skip that.
			if ( !url.match( URL_REGEXP ) ) {
				return detach();
			}

			// If the url is valid from MediaEmbed plugin point of view, let's use it.
			if ( !mediaRegistry.hasMedia( url ) ) {
				return detach();
			}

			// `leftLivePosition` won't be available in `setTimeout` function so let's clone it.
			const positionToInsert = Position.createFromPosition( leftLivePosition );

			global.window.setTimeout( () => {
				editor.model.change( writer => {
					writer.remove( urlRange );
					writer.setSelection( positionToInsert );
					editor.commands.execute( 'mediaEmbed', url );
				} );
			}, 100 );
		} );

		function detach() {
			leftLivePosition.detach();
			rightLivePosition.detach();

			leftLivePosition = null;
			rightLivePosition = null;
		}
	}
}
