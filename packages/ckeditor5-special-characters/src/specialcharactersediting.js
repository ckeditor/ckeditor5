/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import InsertSpecialCharacterCommand from './insertspecialcharactercommand';

/**
 * Special characters editing plugin.
 *
 * It registers the {@link module:special-characters/insertspecialcharactercommand~InsertSpecialCharacterCommand Special Character} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharactersEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Typing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		const command = new InsertSpecialCharacterCommand( editor );
		editor.commands.add( 'insertSpecialCharacter', command );
	}
}
