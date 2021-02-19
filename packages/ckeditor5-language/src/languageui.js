/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/languageui
 */

import { Plugin } from 'ckeditor5/src/core';
import { Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';
import { parseLanguageToString, getLocalizedOptions } from './utils';

import '../theme/language.css';

/**
 * The language UI plugin.
 *
 * It introduces the `'language'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LanguageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LanguageUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const options = getLocalizedOptions( editor );
		const defaultTitle = t( 'Choose language' );
		const removeTitle = t( 'Remove language' );
		const dropdownTooltip = t( 'Language' );

		// Register UI component.
		editor.ui.componentFactory.add( 'language', locale => {
			const itemDefinitions = new Collection();
			const titles = {};

			const languageCommand = editor.commands.get( 'language' );

			for ( const option of options ) {
				const def = {
					type: 'button',
					model: new Model( {
						label: option.title,
						class: option.class,
						languageCode: option.languageCode,
						textDirection: option.textDirection,
						withText: true
					} )
				};

				const language = parseLanguageToString( option.languageCode, option.textDirection );

				def.model.bind( 'isOn' ).to( languageCommand, 'value', value => value === language );

				itemDefinitions.add( def );

				titles[ language ] = option.title;
			}

			itemDefinitions.add( {
				type: 'separator'
			} );

			// Item definition with false `languageCode` will behave as remove lang button.
			itemDefinitions.add( {
				type: 'button',
				model: new Model( {
					label: removeTitle,
					class: 'ck-language_remove',
					languageCode: false,
					withText: true
				} )
			} );

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
						'ck-language-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( languageCommand, 'isEnabled' );
			dropdownView.buttonView.bind( 'label' ).to( languageCommand, 'value', value => {
				return titles[ value ] || defaultTitle;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( 'language', {
					languageCode: evt.source.languageCode,
					textDirection: evt.source.textDirection
				} );

				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}
