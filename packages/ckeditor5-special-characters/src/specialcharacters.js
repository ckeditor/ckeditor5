/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import SpecialCharactersNavigationView from './ui/specialcharactersnavigationview';
import CharacterGridView from './ui/charactergridview';
import CharacterInfoView from './ui/characterinfoview';

import specialCharactersIcon from '../theme/icons/specialcharacters.svg';
import '../theme/specialcharacters.css';

const ALL_SPECIAL_CHARACTERS_GROUP = 'All';

/**
 * The special characters feature.
 *
 * Introduces the `'specialCharacters'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharacters extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Typing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharacters';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Registered characters. A pair of a character name and its symbol.
		 *
		 * @private
		 * @member {Map.<String, String>} #_characters
		 */
		this._characters = new Map();

		/**
		 * Registered groups. Each group contains a collection with symbol names.
		 *
		 * @private
		 * @member {Map.<String, Set.<String>>} #_groups
		 */
		this._groups = new Map();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const inputCommand = editor.commands.get( 'input' );

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			const dropdownView = createDropdown( locale );
			const specialCharsGroups = [ ...this.getGroups() ];

			// Add a special group that shows all available special characters.
			specialCharsGroups.unshift( ALL_SPECIAL_CHARACTERS_GROUP );

			const navigationView = new SpecialCharactersNavigationView( locale, specialCharsGroups );
			const gridView = new CharacterGridView( locale );
			const infoView = new CharacterInfoView( locale );

			gridView.delegate( 'execute' ).to( dropdownView );

			gridView.on( 'tileHover', ( evt, data ) => {
				infoView.set( data );
			} );

			dropdownView.on( 'change:isOpen', () => {
				infoView.set( {
					character: null,
					name: null
				} );
			} );

			// Set the initial content of the special characters grid.
			this._updateGrid( navigationView.currentGroupName, gridView );

			// Update the grid of special characters when a user changed the character group.
			navigationView.on( 'execute', () => {
				this._updateGrid( navigationView.currentGroupName, gridView );
			} );

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( inputCommand );

			// Insert a special character when a tile was clicked.
			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( 'input', { text: data.character } );
				editor.editing.view.focus();
			} );

			dropdownView.panelView.children.add( navigationView );
			dropdownView.panelView.children.add( gridView );
			dropdownView.panelView.children.add( infoView );

			return dropdownView;
		} );
	}

	/**
	 * Adds a collection of special characters to specified group. A title of a special character must be unique.
	 *
	 * @param {String} groupName
	 * @param {Array.<module:special-characters/specialcharacters~SpecialCharacterDefinition>} items
	 */
	addItems( groupName, items ) {
		if ( groupName === ALL_SPECIAL_CHARACTERS_GROUP ) {
			/**
			 * The name "All" for special category group cannot be used because it's a special category which displays all available
			 * special characters.
			 *
			 * @error special-character-invalid-group-name
			 */
			throw new CKEditorError(
				`special-character-invalid-group-name: The name "${ ALL_SPECIAL_CHARACTERS_GROUP }" is reserved and cannot be used.`
			);
		}

		const group = this._getGroup( groupName );

		for ( const item of items ) {
			group.add( item.title );
			this._characters.set( item.title, item.character );
		}
	}

	/**
	 * Returns iterator of special characters groups.
	 *
	 * @returns {Iterable.<String>}
	 */
	getGroups() {
		return this._groups.keys();
	}

	/**
	 * Returns a collection of special characters symbol names (titles).
	 *
	 * @param {String} groupName
	 * @returns {Set.<String>|undefined}
	 */
	getCharactersForGroup( groupName ) {
		if ( groupName === ALL_SPECIAL_CHARACTERS_GROUP ) {
			return new Set( this._characters.keys() );
		}

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
	 * @private
	 * @param {String} groupName A name of group to create.
	 */
	_getGroup( groupName ) {
		if ( !this._groups.has( groupName ) ) {
			this._groups.set( groupName, new Set() );
		}

		return this._groups.get( groupName );
	}

	/**
	 * Updates the symbol grid depending on the currently selected character group.
	 *
	 * @private
	 * @param {String} currentGroupName
	 * @param {module:special-characters/ui/charactergridview~CharacterGridView} gridView
	 */
	_updateGrid( currentGroupName, gridView ) {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		const characterTitles = this.getCharactersForGroup( currentGroupName );

		for ( const title of characterTitles ) {
			const character = this.getCharacter( title );

			gridView.tiles.add( gridView.createTile( character, title ) );
		}
	}
}

/**
 * @typedef {Object} module:special-characters/specialcharacters~SpecialCharacterDefinition
 *
 * @property {String} title A unique name of the character (e.g. "greek small letter epsilon").
 * @property {String} character A human-readable character displayed as label (e.g. "ε").
 */
