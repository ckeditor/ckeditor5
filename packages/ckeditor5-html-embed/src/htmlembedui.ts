/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import htmlEmbedIcon from '../theme/icons/html.svg';
import type { ContainerRawHtmlApiProperty } from './htmlembedediting';

/**
 * The HTML embed UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlEmbedUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HtmlEmbedUI' {
		return 'HtmlEmbedUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'htmlEmbed', locale => {
			const command = editor.commands.get( 'htmlEmbed' )!;
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

				editor.editing.view.document.selection
					.getSelectedElement()!
					.getCustomProperty<ContainerRawHtmlApiProperty>( 'rawHtmlApi' )
					.makeEditable();
			} );

			return view;
		} );
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PLuginsMap {
		[ HtmlEmbedUI.pluginName ]: HtmlEmbedUI;
	}
}
