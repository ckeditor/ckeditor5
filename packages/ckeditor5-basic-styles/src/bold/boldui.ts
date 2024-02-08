/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold/boldui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import type AttributeCommand from '../attributecommand.js';

const BOLD = 'bold';

/**
 * The bold UI feature. It introduces the Bold button.
 */
export default class BoldUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BoldUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const command: AttributeCommand = editor.commands.get( BOLD )!;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( BOLD, () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + BOLD, () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * TODO
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command: AttributeCommand = editor.commands.get( BOLD )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Bold' ),
			icon: icons.bold,
			keystroke: 'CTRL+B',
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( BOLD );
			editor.editing.view.focus();
		} );

		return view;
	}
}
