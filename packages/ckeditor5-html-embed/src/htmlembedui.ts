/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-embed/htmlembedui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconHtml } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
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
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'htmlEmbed', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true,
				label: t( 'Insert HTML' )
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:htmlEmbed', () => {
			const buttonView = this._createButton( MenuBarMenuListItemButtonView );

			buttonView.set( {
				label: t( 'HTML snippet' )
			} );

			return buttonView;
		} );
	}

	/**
	 * Creates a button for html embed command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const command: HtmlEmbedCommand = editor.commands.get( 'htmlEmbed' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;

		view.set( {
			icon: IconHtml
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
	}
}
