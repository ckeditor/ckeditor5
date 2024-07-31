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
import { Collection, type LanguageDirection } from 'ckeditor5/src/utils.js';
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
		const defaultTitle = t( 'Choose language' );
		const accessibleLabel = t( 'Language' );

		// Register UI component.
		editor.ui.componentFactory.add( 'textPartLanguage', locale => {
			const { definitions, titles } = this._getItemMetadata();
			const languageCommand = editor.commands.get( 'textPartLanguage' )!;

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, definitions, {
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

		// Register menu bar UI component.
		editor.ui.componentFactory.add( 'menuBar:textPartLanguage', locale => {
			const { definitions } = this._getItemMetadata();
			const languageCommand = editor.commands.get( 'textPartLanguage' )!;

			const menuView = new MenuBarMenuView( locale );

			menuView.buttonView.set( {
				label: accessibleLabel
			} );

			const listView = new MenuBarMenuListView( locale );

			listView.set( {
				ariaLabel: t( 'Language' ),
				role: 'menu'
			} );

			for ( const definition of definitions ) {
				if ( definition.type != 'button' ) {
					listView.items.add( new ListSeparatorView( locale ) );
					continue;
				}

				const listItemView = new MenuBarMenuListItemView( locale, menuView );
				const buttonView = new MenuBarMenuListItemButtonView( locale );

				buttonView.set( {
					role: 'menuitemradio',
					isToggleable: true
				} );

				buttonView.bind( ...Object.keys( definition.model ) as Array<keyof MenuBarMenuListItemButtonView> ).to( definition.model );
				buttonView.delegate( 'execute' ).to( menuView );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );
			}

			menuView.bind( 'isEnabled' ).to( languageCommand, 'isEnabled' );
			menuView.panelView.children.add( listView );
			menuView.on( 'execute', evt => {
				languageCommand.execute( {
					languageCode: ( evt.source as any ).languageCode as string,
					textDirection: ( evt.source as any ).textDirection as LanguageDirection
				} );

				editor.editing.view.focus();
			} );

			return menuView;
		} );
	}

	/**
	 * Returns metadata for dropdown and menu items.
	 */
	private _getItemMetadata(): ItemMetadata {
		const editor = this.editor;
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();
		const titles: Record<string, string> = {};
		const languageCommand: TextPartLanguageCommand = editor.commands.get( 'textPartLanguage' )!;
		const options = editor.config.get( 'language.textPartLanguage' )!;
		const t = editor.locale.t;
		const removeTitle = t( 'Remove language' );

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

		return {
			definitions: itemDefinitions,
			titles
		};
	}
}

type ItemMetadata = {
	definitions: Collection<ListDropdownItemDefinition>;
	titles: Record<string, string>;
};
