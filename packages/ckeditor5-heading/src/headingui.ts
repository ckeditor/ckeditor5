/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module heading/headingui
 */

import { Plugin, type Command } from 'ckeditor5/src/core.js';
import {
	ViewModel,
	createDropdown,
	addListToDropdown,
	type ButtonExecuteEvent,
	type ListDropdownItemDefinition,
	MenuBarMenuListItemView,
	MenuBarMenuListView,
	MenuBarMenuView,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
import type { ParagraphCommand } from 'ckeditor5/src/paragraph.js';

import { getLocalizedOptions } from './utils.js';
import type HeadingCommand from './headingcommand.js';

import '../theme/heading.css';

/**
 * The headings UI feature. It introduces the `headings` dropdown.
 */
export default class HeadingUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HeadingUI' as const;
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
		const t = editor.t;
		const options = getLocalizedOptions( editor );
		const defaultTitle = t( 'Choose heading' );
		const accessibleLabel = t( 'Heading' );

		// Register UI component.
		editor.ui.componentFactory.add( 'heading', locale => {
			const titles: Record<string, string> = {};
			const itemDefinitions: Collection<ListDropdownItemDefinition> = new Collection();
			const headingCommand: HeadingCommand = editor.commands.get( 'heading' )!;
			const paragraphCommand: ParagraphCommand = editor.commands.get( 'paragraph' )!;
			const commands: Array<Command> = [ headingCommand ];

			for ( const option of options ) {
				const def: ListDropdownItemDefinition = {
					type: 'button',
					model: new ViewModel( {
						label: option.title,
						class: option.class,
						role: 'menuitemradio',
						withText: true
					} )
				};

				if ( option.model === 'paragraph' ) {
					def.model.bind( 'isOn' ).to( paragraphCommand, 'value' );
					def.model.set( 'commandName', 'paragraph' );
					commands.push( paragraphCommand );
				} else {
					def.model.bind( 'isOn' ).to( headingCommand, 'value', value => value === option.model );
					def.model.set( {
						commandName: 'heading',
						commandValue: option.model
					} );
				}

				// Add the option to the collection.
				itemDefinitions.add( def );

				titles[ option.model ] = option.title;
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, itemDefinitions, {
				ariaLabel: accessibleLabel,
				role: 'menu'
			} );

			dropdownView.buttonView.set( {
				ariaLabel: accessibleLabel,
				ariaLabelledBy: undefined,
				isOn: false,
				withText: true,
				tooltip: accessibleLabel
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-heading-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
				return areEnabled.some( isEnabled => isEnabled );
			} );

			dropdownView.buttonView.bind( 'label' ).to( headingCommand, 'value', paragraphCommand, 'value', ( heading, paragraph ) => {
				const whichModel = paragraph ? 'paragraph' : heading;

				if ( typeof whichModel === 'boolean' ) {
					return defaultTitle;
				}

				// If none of the commands is active, display default title.
				if ( !titles[ whichModel ] ) {
					return defaultTitle;
				}

				return titles[ whichModel ];
			} );

			dropdownView.buttonView.bind( 'ariaLabel' ).to( headingCommand, 'value', paragraphCommand, 'value', ( heading, paragraph ) => {
				const whichModel = paragraph ? 'paragraph' : heading;

				if ( typeof whichModel === 'boolean' ) {
					return accessibleLabel;
				}

				// If none of the commands is active, display default title.
				if ( !titles[ whichModel ] ) {
					return accessibleLabel;
				}

				return `${ titles[ whichModel ] }, ${ accessibleLabel }`;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo<ButtonExecuteEvent>( dropdownView, 'execute', evt => {
				const { commandName, commandValue } = evt.source as any;
				editor.execute( commandName, commandValue ? { value: commandValue } : undefined );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'menuBar:heading', locale => {
			const menuView = new MenuBarMenuView( locale );
			const headingCommand: HeadingCommand = editor.commands.get( 'heading' )!;
			const paragraphCommand: ParagraphCommand = editor.commands.get( 'paragraph' )!;
			const commands: Array<Command> = [ headingCommand ];
			const listView = new MenuBarMenuListView( locale );

			menuView.set( {
				class: 'ck-heading-dropdown'
			} );

			listView.set( {
				ariaLabel: t( 'Heading' ),
				role: 'menu'
			} );

			menuView.buttonView.set( {
				label: t( 'Heading' )
			} );

			menuView.panelView.children.add( listView );

			for ( const option of options ) {
				const listItemView = new MenuBarMenuListItemView( locale, menuView );
				const buttonView = new MenuBarMenuListItemButtonView( locale );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );

				buttonView.set( {
					isToggleable: true,
					label: option.title,
					role: 'menuitemradio',
					class: option.class
				} );

				buttonView.delegate( 'execute' ).to( menuView );

				buttonView.on<ButtonExecuteEvent>( 'execute', () => {
					const commandName = option.model === 'paragraph' ? 'paragraph' : 'heading';

					editor.execute( commandName, { value: option.model } );
					editor.editing.view.focus();
				} );

				if ( option.model === 'paragraph' ) {
					buttonView.bind( 'isOn' ).to( paragraphCommand, 'value' );
					commands.push( paragraphCommand );
				} else {
					buttonView.bind( 'isOn' ).to( headingCommand, 'value', value => value === option.model );
				}
			}

			menuView.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
				return areEnabled.some( isEnabled => isEnabled );
			} );

			return menuView;
		} );
	}
}
