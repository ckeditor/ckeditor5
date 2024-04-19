/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import type BlockQuoteCommand from './blockquotecommand.js';

import '../theme/blockquote.css';

/**
 * The block quote UI plugin.
 *
 * It introduces the `'blockQuote'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BlockQuoteUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const command: BlockQuoteCommand = editor.commands.get( 'blockQuote' )!;

		editor.ui.componentFactory.add( 'blockQuote', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:blockQuote', () => this._createButton( MenuBarMenuListItemButtonView ) );
	}

	/**
	 * Creates a button for block quote command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'blockQuote' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Block quote' ),
			icon: icons.quote,
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'blockQuote' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
