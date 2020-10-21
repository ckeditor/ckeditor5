/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import htmlEmbedIcon from '../theme/icons/html.svg';

/**
 * The HTML embed UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlEmbedUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'htmlEmbed', locale => {
			const command = editor.commands.get( 'insertHtmlEmbed' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Insert HTML' ),
				icon: htmlEmbedIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'insertHtmlEmbed' );
				editor.editing.view.focus();

				const widgetWrapper = editor.editing.view.document.selection.getSelectedElement();
				const rawHtmlContainer = widgetWrapper.getChild( 1 );

				// After inserting a new element, switch to "Edit source" mode.
				rawHtmlContainer.getChild( 0 ).getCustomProperty( 'domElement' ).click();

				// And focus the edit source element (`textarea`).
				rawHtmlContainer.getChild( 1 ).getCustomProperty( 'domElement' ).focus();
			} );

			return view;
		} );
	}
}
