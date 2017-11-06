/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightCommand from './highlightcommand';

/**
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.config.define( 'highlight', [
			{ class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
			{ class: 'marker-green', title: 'Green Marker', color: '#66ff00', type: 'marker' },
			{ class: 'marker-pink', title: 'Pink Marker', color: '#ff6fff', type: 'marker' },
			{ class: 'pen-red', title: 'Red Pen', color: '#ff0000', type: 'pen' },
			{ class: 'pen-blue', title: 'Blue Pen', color: '#0000ff', type: 'pen' }
		] );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}
