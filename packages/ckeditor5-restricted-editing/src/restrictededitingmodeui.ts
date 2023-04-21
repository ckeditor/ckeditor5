/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodeui
 */

import {
	Plugin,
	type Command
} from 'ckeditor5/src/core';
import {
	Model,
	createDropdown,
	addListToDropdown,
	type ButtonExecuteEvent,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';

import lockIcon from '../theme/icons/contentlock.svg';

/**
 * The restricted editing mode UI feature.
 *
 * It introduces the `'restrictedEditing'` dropdown that offers tools to navigate between exceptions across
 * the document.
 */
export default class RestrictedEditingModeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'RestrictedEditingModeUI' {
		return 'RestrictedEditingModeUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'restrictedEditing', locale => {
			const dropdownView = createDropdown( locale );
			const listItems = new Collection<ListDropdownItemDefinition>();

			listItems.add( this._getButtonDefinition(
				'goToPreviousRestrictedEditingException',
				t( 'Previous editable region' ),
				'Shift+Tab'
			) );
			listItems.add( this._getButtonDefinition(
				'goToNextRestrictedEditingException',
				t( 'Next editable region' ),
				'Tab'
			) );

			addListToDropdown( dropdownView, listItems );

			dropdownView.buttonView.set( {
				label: t( 'Navigate editable regions' ),
				icon: lockIcon,
				tooltip: true,
				isEnabled: true,
				isOn: false
			} );

			this.listenTo<ButtonExecuteEvent>( dropdownView, 'execute', evt => {
				const { _commandName } = evt.source as any;
				editor.execute( _commandName );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns a definition of the navigation button to be used in the dropdown.

	 * @param commandName The name of the command that the button represents.
	 * @param label The translated label of the button.
	 * @param keystroke The button keystroke.
	 */
	private _getButtonDefinition( commandName: string, label: string, keystroke: string ): ListDropdownItemDefinition {
		const editor = this.editor;
		const command: Command = editor.commands.get( commandName )!;
		const definition = {
			type: 'button' as const,
			model: new Model( {
				label,
				withText: true,
				keystroke,
				withKeystroke: true,
				_commandName: commandName
			} )
		};

		definition.model.bind( 'isEnabled' ).to( command, 'isEnabled' );

		return definition;
	}
}
