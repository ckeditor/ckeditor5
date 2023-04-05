/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/headingui
 */

import { Plugin, type Command } from 'ckeditor5/src/core';
import {
	Model,
	createDropdown,
	addListToDropdown,
	type ButtonExecuteEvent,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';
import type { ParagraphCommand } from 'ckeditor5/src/paragraph';

import { getLocalizedOptions } from './utils';
import type HeadingCommand from './headingcommand';

import '../theme/heading.css';

/**
 * The headings UI feature. It introduces the `headings` dropdown.
 */
export default class HeadingUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HeadingUI' {
		return 'HeadingUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const options = getLocalizedOptions( editor );
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

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
					model: new Model( {
						label: option.title,
						class: option.class,
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
			addListToDropdown( dropdownView, itemDefinitions );

			dropdownView.buttonView.set( {
				isOn: false,
				withText: true,
				tooltip: dropdownTooltip
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

			dropdownView.buttonView.bind( 'label' ).to( headingCommand, 'value', paragraphCommand, 'value', ( value, para ) => {
				const whichModel = value || para && 'paragraph';

				if ( typeof whichModel === 'boolean' ) {
					return defaultTitle;
				}

				// If none of the commands is active, display default title.
				if ( !titles[ whichModel ] ) {
					return defaultTitle;
				}

				return titles[ whichModel ];
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo<ButtonExecuteEvent>( dropdownView, 'execute', evt => {
				const { commandName, commandValue } = evt.source as any;
				editor.execute( commandName, commandValue ? { value: commandValue } : undefined );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}
