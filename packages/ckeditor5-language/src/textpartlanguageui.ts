/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguageui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ViewModel, createDropdown, addListToDropdown, type ListDropdownItemDefinition } from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { stringifyLanguageAttribute } from './utils.js';
import type TextPartLanguageCommand from './textpartlanguagecommand.js';

/**
 * The text part language UI plugin.
 *
 * It introduces the `'language'` dropdown.
 */
export default class TextPartLanguageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TextPartLanguageUI' as const;
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
		const accessibleLabel = t( 'Language' );

		// Register UI component.
		editor.ui.componentFactory.add( 'textPartLanguage', locale => {
			const itemDefinitions = new Collection<ListDropdownItemDefinition>();
			const titles: Record<string, string> = {};

			const languageCommand: TextPartLanguageCommand = editor.commands.get( 'textPartLanguage' )!;

			// Item definition with false `languageCode` will behave as remove lang button.
			itemDefinitions.add( {
				type: 'button',
				model: new ViewModel( {
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
					model: new ViewModel( {
						label: option.title,
						languageCode: option.languageCode,
						role: 'menuitemradio',
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
						'ck-text-fragment-language-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( languageCommand, 'isEnabled' );
			dropdownView.buttonView.bind( 'label' ).to( languageCommand, 'value', value => {
				return ( value && titles[ value ] ) || defaultTitle;
			} );

			dropdownView.buttonView.bind( 'ariaLabel' ).to( languageCommand, 'value', value => {
				const selectedLanguageTitle = value && titles[ value ];

				if ( !selectedLanguageTitle ) {
					return accessibleLabel;
				}

				return `${ selectedLanguageTitle }, ${ accessibleLabel }`;
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
