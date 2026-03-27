/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/standardeditingmodeui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { IconContentUnlock } from '@ckeditor/ckeditor5-icons';
import {
	ButtonView,
	MenuBarMenuListItemButtonView,
	createDropdown,
	addToolbarToDropdown
} from '@ckeditor/ckeditor5-ui';

/**
 * The standard editing mode UI feature.
 *
 * It introduces the `'restrictedEditingException'` button that marks text as unrestricted for editing.
 */
export class StandardEditingModeUI extends Plugin {
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
		const componentFactory = editor.ui.componentFactory;

		// Dropdown button with inline/block buttons.
		componentFactory.add( 'restrictedEditingException:dropdown', locale => {
			const dropdownView = createDropdown( locale );
			const t = locale.t;

			const buttons = [
				componentFactory.create( 'restrictedEditingException:inline' ),
				componentFactory.create( 'restrictedEditingException:block' )
			] as Array<ButtonView>;

			for ( const button of buttons ) {
				button.set( {
					withText: true,
					tooltip: false
				} );
			}

			addToolbarToDropdown(
				dropdownView,
				buttons,
				{
					enableActiveItemFocusOnDropdownOpen: true,
					isVertical: true,
					ariaLabel: t( 'Enable editing' )
				}
			);

			dropdownView.buttonView.set( {
				label: t( 'Enable editing' ),
				icon: IconContentUnlock,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-restricted-editing-dropdown'
				}
			} );

			// Enable button if any of the buttons is enabled.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => {
				return areEnabled.some( isEnabled => isEnabled );
			} );

			// Focus the editable after executing the command.
			this.listenTo( dropdownView, 'execute', () => {
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );

		// Inline exception button.
		componentFactory.add( 'restrictedEditingException:inline', () => {
			const button = this._createButton( 'restrictedEditingException', ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		// Block exception button.
		componentFactory.add( 'restrictedEditingException:block', () => {
			const button = this._createButton( 'restrictedEditingExceptionBlock', ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		// Menu bar inline/block buttons.
		componentFactory.add( 'menuBar:restrictedEditingException:inline', () => {
			return this._createButton( 'restrictedEditingException', MenuBarMenuListItemButtonView );
		} );

		componentFactory.add( 'menuBar:restrictedEditingException:block', () => {
			return this._createButton( 'restrictedEditingExceptionBlock', MenuBarMenuListItemButtonView );
		} );

		// Auto button - triggers inline or block exception command.
		componentFactory.add( 'restrictedEditingException:auto', () => {
			const button = this._createButton( 'restrictedEditingExceptionAuto', ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );
		componentFactory.add( 'menuBar:restrictedEditingException:auto', () => {
			return this._createButton( 'restrictedEditingExceptionAuto', MenuBarMenuListItemButtonView );
		} );

		// Aliases for backward compatibility.
		componentFactory.add( 'restrictedEditingException', () => {
			return componentFactory.create( 'restrictedEditingException:inline' );
		} );
		componentFactory.add( 'menuBar:restrictedEditingException', () => {
			return componentFactory.create( 'menuBar:restrictedEditingException:inline' );
		} );
	}

	/**
	 * Creates a button for restricted editing exception command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>(
		commandName: 'restrictedEditingException' | 'restrictedEditingExceptionBlock' | 'restrictedEditingExceptionAuto',
		ButtonClass: T
	): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = this.editor.commands.get( commandName )!;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.icon = IconContentUnlock;
		view.isToggleable = true;

		view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		if ( commandName == 'restrictedEditingExceptionAuto' ) {
			view.bind( 'label' ).to( command, 'value', value => {
				return value ? t( 'Disable editing' ) : t( 'Enable editing' );
			} );
		} else if ( commandName == 'restrictedEditingExceptionBlock' ) {
			view.bind( 'label' ).to( command, 'value', value => {
				return value ? t( 'Disable block editing' ) : t( 'Enable block editing' );
			} );
		} else {
			view.bind( 'label' ).to( command, 'value', value => {
				return value ? t( 'Disable inline editing' ) : t( 'Enable inline editing' );
			} );
		}

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( commandName );
			editor.editing.view.focus();
		} );

		return view;
	}
}
