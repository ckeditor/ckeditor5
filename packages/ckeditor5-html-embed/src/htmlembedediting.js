/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HTMLEmbedCommand from './htmlembedcommand';

import '../theme/htmlembed.css';

/**
 * The HTML embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HTMLEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HTMLEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		schema.register( 'horizontalLine', {
			isObject: true,
			allowWhere: '$block'
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: () => {
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: () => {
			}
		} );

		editor.commands.add( 'htmlEmbed', new HTMLEmbedCommand( editor ) );
	}
}
