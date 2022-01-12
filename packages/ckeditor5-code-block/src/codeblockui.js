/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockui
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, SplitButtonView, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';

import { getNormalizedAndLocalizedLanguageDefinitions } from './utils';

import codeBlockIcon from '../theme/icons/codeblock.svg';
import '../theme/codeblock.css';

/**
 * The code block UI plugin.
 *
 * Introduces the `'codeBlock'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeBlockUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;
		const normalizedLanguageDefs = getNormalizedAndLocalizedLanguageDefinitions( editor );

		componentFactory.add( 'codeBlock', locale => {
			const command = editor.commands.get( 'codeBlock' );
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			splitButtonView.set( {
				label: t( 'Insert code block' ),
				tooltip: true,
				icon: codeBlockIcon,
				isToggleable: true
			} );

			splitButtonView.bind( 'isOn' ).to( command, 'value', value => !!value );

			splitButtonView.on( 'execute', () => {
				editor.execute( 'codeBlock', {
					usePreviousLanguageChoice: true
				} );

				editor.editing.view.focus();
			} );

			dropdownView.on( 'execute', evt => {
				editor.execute( 'codeBlock', {
					language: evt.source._codeBlockLanguage,
					forceValue: true
				} );

				editor.editing.view.focus();
			} );

			dropdownView.class = 'ck-code-block-dropdown';
			dropdownView.bind( 'isEnabled' ).to( command );

			addListToDropdown( dropdownView, this._getLanguageListItemDefinitions( normalizedLanguageDefs ) );

			return dropdownView;
		} );
	}

	/**
	 * A helper returning a collection of the `codeBlock` dropdown items representing languages
	 * available for the user to choose from.
	 *
	 * @private
	 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} normalizedLanguageDefs
	 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
	 */
	_getLanguageListItemDefinitions( normalizedLanguageDefs ) {
		const editor = this.editor;
		const command = editor.commands.get( 'codeBlock' );
		const itemDefinitions = new Collection();

		for ( const languageDef of normalizedLanguageDefs ) {
			const definition = {
				type: 'button',
				model: new Model( {
					_codeBlockLanguage: languageDef.language,
					label: languageDef.label,
					withText: true
				} )
			};

			definition.model.bind( 'isOn' ).to( command, 'value', value => {
				return value === definition.model._codeBlockLanguage;
			} );

			itemDefinitions.add( definition );
		}

		return itemDefinitions;
	}
}
