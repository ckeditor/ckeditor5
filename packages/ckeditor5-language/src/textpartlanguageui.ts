/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguageui
 */

import { Plugin } from 'ckeditor5/src/core';
import { Model, createDropdown, addListToDropdown, type ListDropdownItemDefinition } from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';
import { stringifyLanguageAttribute } from './utils';
import type TextPartLanguageCommand from './textpartlanguagecommand';

import '../theme/language.css';

/**
 * The text part language UI plugin.
 *
 * It introduces the `'language'` dropdown.
 */
export default class TextPartLanguageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TextPartLanguageUI' {
		return 'TextPartLanguageUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const options = editor.config.get( 'language.textPartLanguage' )!;
		const defaultTitle = t( 'Choose language' );
		const removeTitle = t( 'Remove language' );
		const dropdownTooltip = t( 'Language' );

		// Register UI component.
		editor.ui.componentFactory.add( 'textPartLanguage', locale => {
			const itemDefinitions = new Collection<ListDropdownItemDefinition>();
			const titles: Record<string, string> = {};

			const languageCommand: TextPartLanguageCommand = editor.commands.get( 'textPartLanguage' )!;

			// Item definition with false `languageCode` will behave as remove lang button.
			itemDefinitions.add( {
				type: 'button',
				model: new Model( {
					label: removeTitle,
					languageCode: false,
					withText: true
				} )
			} );

			itemDefinitions.add( {
				type: 'separator'
			} );

			for ( const option of options ) {
				const def = {
					type: 'button' as const,
					model: new Model( {
						label: option.title,
						languageCode: option.languageCode,
						textDirection: option.textDirection,
						withText: true
					} )
				};

				const language = stringifyLanguageAttribute( option.languageCode, option.textDirection );

				def.model.bind( 'isOn' ).to( languageCommand, 'value', value => value === language );

				itemDefinitions.add( def );

				titles[ language ] = option.title;
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
						'ck-text-fragment-language-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( languageCommand, 'isEnabled' );
			dropdownView.buttonView.bind( 'label' ).to( languageCommand, 'value', value => {
				return ( value && titles[ value ] ) || defaultTitle;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				languageCommand.execute( {
					languageCode: ( evt.source as any ).languageCode,
					textDirection: ( evt.source as any ).textDirection
				} );

				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}
