/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguageui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	addListToDropdown,
	createDropdown,
	ListSeparatorView,
	MenuBarMenuView,
	MenuBarMenuListView,
	MenuBarMenuListItemView,
	MenuBarMenuListItemButtonView,
	ViewModel,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';
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

		// Register UI component.
		editor.ui.componentFactory.add( 'textPartLanguage', locale => {
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

		// Register menu bar UI component.
		editor.ui.componentFactory.add( 'menuBar:textPartLanguage', locale => {
			const menuView = new MenuBarMenuView( locale );

			menuView.buttonView.set( {
				label: accessibleLabel
			} );

			const listView = new MenuBarMenuListView( locale );

			for ( const definition of itemDefinitions ) {
				if ( definition.type != 'button' ) {
					listView.items.add( new ListSeparatorView( locale ) );
					continue;
				}

				const listItemView = new MenuBarMenuListItemView( locale, menuView );
				const buttonView = new MenuBarMenuListItemButtonView( locale );

				// TODO change after font is merged
				buttonView.extendTemplate( {
					attributes: {
						'aria-checked': buttonView.bindTemplate.to( 'isOn' )
					}
				} );

				buttonView.bind( ...Object.keys( definition.model ) as Array<keyof MenuBarMenuListItemButtonView> ).to( definition.model );
				buttonView.delegate( 'execute' ).to( menuView );

				buttonView.on( 'execute', () => {
					languageCommand.execute( {
						languageCode: ( definition.model as any ).languageCode,
						textDirection: ( definition.model as any ).textDirection
					} );

					editor.editing.view.focus();
				} );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );
			}

			menuView.bind( 'isEnabled' ).to( languageCommand, 'isEnabled' );
			menuView.panelView.children.add( listView );

			return menuView;
		} );
	}
}
