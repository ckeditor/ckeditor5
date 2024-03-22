/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodeui
 */

import { Plugin, type Command } from 'ckeditor5/src/core.js';
import {
	ViewModel,
	createDropdown,
	addListToDropdown,
	MenuBarMenuListItemButtonView,
	type ButtonExecuteEvent,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';

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
	public static get pluginName() {
		return 'RestrictedEditingModeUI' as const;
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

		editor.ui.componentFactory.add(
			'menuBar:restrictedEditingPrevious',
			() => this._createMenuBarButton( t( 'Previous editable region' ), 'goToPreviousRestrictedEditingException', 'Shift+Tab' )
		);

		editor.ui.componentFactory.add(
			'menuBar:restrictedEditingNext',
			() => this._createMenuBarButton( t( 'Next editable region' ), 'goToNextRestrictedEditingException', 'Tab' )
		);
	}

	/**
	 * Creates a button for restricted editing command to use in menu bar.
	 */
	private _createMenuBarButton( label: string, commandName: string, keystroke: string ): MenuBarMenuListItemButtonView {
		const editor = this.editor;
		const command = editor.commands.get( commandName )!;
		const view = new MenuBarMenuListItemButtonView( editor.locale );

		view.set( {
			label,
			keystroke,
			tooltip: true,
			isEnabled: true,
			isOn: false
		} );

		view.bind( 'isEnabled' ).to( command );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( commandName );
			editor.editing.view.focus();
		} );

		return view;
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
		const definition: ListDropdownItemDefinition = {
			type: 'button' as const,
			model: new ViewModel( {
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
