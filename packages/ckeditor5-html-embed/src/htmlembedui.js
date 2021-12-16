/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import htmlEmbedIcon from '../theme/icons/html.svg';

/**
 * The HTML embed UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlEmbedUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HtmlEmbedUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'htmlEmbed', locale => {
			const command = editor.commands.get( 'htmlEmbed' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Insert HTML' ),
				icon: htmlEmbedIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'htmlEmbed' );
				editor.editing.view.focus();

				const widgetWrapper = editor.editing.view.document.selection.getSelectedElement();

				widgetWrapper.getCustomProperty( 'rawHtmlApi' ).makeEditable();
			} );

			return view;
		} );
	}
}
