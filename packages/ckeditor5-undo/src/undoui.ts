/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/undoui
 */

import { icons, Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

/**
 * The undo UI feature. It introduces the `'undo'` and `'redo'` buttons to the editor.
 */
export default class UndoUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UndoUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = editor.t;

		const localizedUndoIcon = locale.uiLanguageDirection == 'ltr' ? icons.undo : icons.redo;
		const localizedRedoIcon = locale.uiLanguageDirection == 'ltr' ? icons.redo : icons.undo;

		this._addButtonsToFactory( 'undo', t( 'Undo' ), 'CTRL+Z', localizedUndoIcon );
		this._addButtonsToFactory( 'redo', t( 'Redo' ), 'CTRL+Y', localizedRedoIcon );
	}

	/**
	 * Creates a button for the specified command.
	 *
	 * @param name Command name.
	 * @param label Button label.
	 * @param keystroke Command keystroke.
	 * @param Icon Source of the icon.
	 */
	private _addButtonsToFactory( name: 'undo' | 'redo', label: string, keystroke: string, Icon: string ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, () => {
			const buttonView = this._createButton( ButtonView, name, label, keystroke, Icon );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + name, () => {
			return this._createButton( MenuBarMenuListItemButtonView, name, label, keystroke, Icon );
		} );
	}

	/**
	 * TODO
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(
		ButtonClass: T,
		name: 'undo' | 'redo',
		label: string,
		keystroke: string,
		Icon: string
	): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( name )!;
		const view = new ButtonClass( locale ) as InstanceType<T>;

		view.set( {
			label,
			icon: Icon,
			keystroke
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		this.listenTo( view, 'execute', () => {
			editor.execute( name );
			editor.editing.view.focus();
		} );

		return view;
	}
}
