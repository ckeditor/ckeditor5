/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedui
 */

import { icons, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import type { RawHtmlApi } from './htmlembedediting.js';
import type HtmlEmbedCommand from './htmlembedcommand.js';

/**
 * The HTML embed UI plugin.
 */
export default class HtmlEmbedUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HtmlEmbedUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'htmlEmbed', locale => {
			const command: HtmlEmbedCommand = editor.commands.get( 'htmlEmbed' )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Insert HTML' ),
				icon: icons.html,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'htmlEmbed' );
				editor.editing.view.focus();

				const rawHtmlApi = editor.editing.view.document.selection
					.getSelectedElement()!
					.getCustomProperty( 'rawHtmlApi' ) as RawHtmlApi;

				rawHtmlApi.makeEditable();
			} );

			return view;
		} );
	}
}
