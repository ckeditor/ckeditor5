/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import SpecialCharactersUI from './specialcharactersui';

/**
 * The special characters feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharacters extends Plugin {
	constructor( editor ) {
		super( editor );

		/**
		 * Registered characters. A pair of a character name and its symbol.
		 *
		 * @private
		 * @member {Map.<String, String>}
		 */
		this._characters = new Map();

		/**
		 * Registered groups. Each group contains a collection with symbol names.
		 *
		 * @private
		 * @member {Map.<String, Set.<String>>}
		 */
		this._groups = new Map();
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SpecialCharactersUI, Typing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharacters';
	}

	/**
	 * Adds a collection of special characters to specified group.
	 *
	 * @param {String} groupName
	 * @param {Array.<~SpecialCharacterDefinition>} items
	 */
	addItems( groupName, items ) {
		const group = this._getGroup( groupName );

		for ( const item of items ) {
			if ( this._characters.has( item.title ) ) {
				/**
				 * @error specialcharacters-duplicated-character-name
				 */
				throw new CKEditorError( 'specialcharacters-duplicated-character-name', null );
			}

			group.add( item.title );
			this._characters.set( item.title, item.character );
		}
	}

	/**
	 * @returns {Iterable.<String>}
	 */
	getGroups() {
		return this._groups.keys();
	}

	/**
	 * @param {String} groupName
	 * @returns {Set<String>|undefined}
	 */
	getCharacterForGroup( groupName ) {
		return this._groups.get( groupName );
	}

	/**
	 * Returns a symbol of the special character for specified name. If the special character couldn't be found, `undefined` is returned.
	 *
	 * @param {String} title A title of the special character.
	 * @returns {String|undefined}
	 */
	getCharacter( title ) {
		return this._characters.get( title );
	}

	/**
	 * Returns a group of special characters. If the group with the specified name does not exist, it will be created.
	 *
	 * @param {String} groupName A name of group to create.
	 */
	_getGroup( groupName ) {
		if ( !this._groups.has( groupName ) ) {
			this._groups.set( groupName, new Set() );
		}

		return this._groups.get( groupName );
	}
}

/**
 * @typedef {Object} module:special-characters/specialcharacters~SpecialCharacterDefinition
 *
 * @property {String} title A unique title of the character.
 *
 * @property {String} character A symbol that should be inserted to the editor.
 */
