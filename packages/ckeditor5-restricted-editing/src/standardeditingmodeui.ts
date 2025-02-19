/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/standardeditingmodeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconContentUnlock } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

/**
 * The standard editing mode UI feature.
 *
 * It introduces the `'restrictedEditingException'` button that marks text as unrestricted for editing.
 */
export default class StandardEditingModeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StandardEditingModeUI' as const;
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

		editor.ui.componentFactory.add( 'restrictedEditingException', () => {
			const button = this._createButton( ButtonView );

			button.set( {
				tooltip: true,
				isToggleable: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:restrictedEditingException', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for restricted editing exception command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = this.editor.commands.get( 'restrictedEditingException' )!;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.icon = IconContentUnlock;

		view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
		view.bind( 'label' ).to( command, 'value', value => {
			return value ? t( 'Disable editing' ) : t( 'Enable editing' );
		} );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'restrictedEditingException' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
