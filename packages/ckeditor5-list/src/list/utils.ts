/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/utils
 */

import type { Editor } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView, type ButtonExecuteEvent } from 'ckeditor5/src/ui.js';

/**
 * Helper method for creating toolbar and menu buttons and linking them with an appropriate command.
 *
 * @internal
 * @param editor The editor instance to which the UI component will be added.
 * @param commandName The name of the command.
 * @param label The button label.
 * @param icon The source of the icon.
 */
export function createUIComponents(
	editor: Editor,
	commandName: 'bulletedList' | 'numberedList' | 'todoList',
	label: string,
	icon: string
): void {
	editor.ui.componentFactory.add( commandName, () => {
		const buttonView = _createButton( ButtonView, editor, commandName, label, icon );

		buttonView.set( {
			tooltip: true,
			isToggleable: true
		} );

		return buttonView;
	} );

	editor.ui.componentFactory.add( `menuBar:${ commandName }`, () => {
		const buttonView = _createButton( MenuBarMenuListItemButtonView, editor, commandName, label, icon );

		buttonView.set( {
			role: 'menuitemcheckbox',
			isToggleable: true
		} );

		return buttonView;
	} );
}

/**
 * Creates a button to use either in toolbar or in menu bar.
 */
function _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(
	ButtonClass: T,
	editor: Editor,
	commandName: 'bulletedList' | 'numberedList' | 'todoList',
	label: string,
	icon: string
): InstanceType<T> {
	const command = editor.commands.get( commandName )!;
	const view = new ButtonClass( editor.locale ) as InstanceType<T>;

	view.set( {
		label,
		icon
	} );

	// Bind button model to command.
	view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

	// Execute the command.
	view.on<ButtonExecuteEvent>( 'execute', () => {
		editor.execute( commandName );
		editor.editing.view.focus();
	} );

	return view;
}
