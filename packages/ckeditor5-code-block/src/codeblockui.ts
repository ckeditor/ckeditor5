/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockui
 */

import { icons, Plugin } from 'ckeditor5/src/core.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { ViewModel, SplitButtonView, createDropdown, addListToDropdown, type ListDropdownItemDefinition } from 'ckeditor5/src/ui.js';

import { getNormalizedAndLocalizedLanguageDefinitions } from './utils.js';

import type { CodeBlockLanguageDefinition } from './codeblockconfig.js';
import type CodeBlockCommand from './codeblockcommand.js';

import '../theme/codeblock.css';

/**
 * The code block UI plugin.
 *
 * Introduces the `'codeBlock'` dropdown.
 */
export default class CodeBlockUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeBlockUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;
		const normalizedLanguageDefs = getNormalizedAndLocalizedLanguageDefinitions( editor );

		componentFactory.add( 'codeBlock', locale => {
			const command: CodeBlockCommand = editor.commands.get( 'codeBlock' )!;
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;
			const accessibleLabel = t( 'Insert code block' );

			splitButtonView.set( {
				label: accessibleLabel,
				tooltip: true,
				icon: icons.codeBlock,
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
					language: ( evt.source as any )._codeBlockLanguage,
					forceValue: true
				} );

				editor.editing.view.focus();
			} );

			dropdownView.class = 'ck-code-block-dropdown';
			dropdownView.bind( 'isEnabled' ).to( command );

			addListToDropdown( dropdownView, () => this._getLanguageListItemDefinitions( normalizedLanguageDefs ), {
				role: 'menu',
				ariaLabel: accessibleLabel
			} );

			return dropdownView;
		} );
	}

	/**
	 * A helper returning a collection of the `codeBlock` dropdown items representing languages
	 * available for the user to choose from.
	 */
	private _getLanguageListItemDefinitions(
		normalizedLanguageDefs: Array<CodeBlockLanguageDefinition>
	): Collection<ListDropdownItemDefinition> {
		const editor = this.editor;
		const command: CodeBlockCommand = editor.commands.get( 'codeBlock' )!;
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();

		for ( const languageDef of normalizedLanguageDefs ) {
			const definition: ListDropdownItemDefinition = {
				type: 'button',
				model: new ViewModel( {
					_codeBlockLanguage: languageDef.language,
					label: languageDef.label,
					role: 'menuitemradio',
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
