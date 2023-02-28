/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import { Plugin } from 'ckeditor5/src/core';
import { Typing } from 'ckeditor5/src/typing';
import { createDropdown } from 'ckeditor5/src/ui';
import { CKEditorError } from 'ckeditor5/src/utils';
import SpecialCharactersNavigationView from './ui/specialcharactersnavigationview';
import CharacterGridView from './ui/charactergridview';
import CharacterInfoView from './ui/characterinfoview';
import SpecialCharactersView from './ui/specialcharactersview';

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

		const t = editor.t;

		/**
		 * Registered characters. A pair of a character name and its symbol.
		 *
		 * @private
		 * @member {Map.<String, String>} #_characters
		 */
		this._characters = new Map();

		/**
		 * Registered groups. Each group contains a displayed label and a collection with symbol names.
		 *
		 * @private
		 * @member {Map.<String, {items: Set.<String>, label: String}>} #_groups
		 */
		this._groups = new Map();

		/**
		 * A label describing the "All" special characters category.
		 *
		 * @private
		 * @member {String} #_allSpecialCharactersGroupLabel
		 */
		this._allSpecialCharactersGroupLabel = t( 'All' );
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
			let dropdownPanelContent;

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( inputCommand );

			// Insert a special character when a tile was clicked.
			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( 'insertText', { text: data.character } );
				editor.editing.view.focus();
			} );

			dropdownView.on( 'change:isOpen', () => {
				if ( !dropdownPanelContent ) {
					dropdownPanelContent = this._createDropdownPanelContent( locale, dropdownView );

					const specialCharactersView = new SpecialCharactersView(
						locale,
						dropdownPanelContent.navigationView,
						dropdownPanelContent.gridView,
						dropdownPanelContent.infoView
					);

					dropdownView.panelView.children.add( specialCharactersView );
				}

				dropdownPanelContent.infoView.set( {
					character: null,
					name: null
				} );
			} );

			return dropdownView;
		} );
	}

	/**
	 * Adds a collection of special characters to the specified group. The title of a special character must be unique.
	 *
	 * **Note:** The "All" category name is reserved by the plugin and cannot be used as a new name for a special
	 * characters category.
	 *
	 * @param {String} groupName
	 * @param {Array.<module:special-characters/specialcharacters~SpecialCharacterDefinition>} items
	 * @param {Object} options
	 * @param {String} [options.label=groupName]
	 */
	addItems( groupName, items, options = { label: groupName } ) {
		if ( groupName === ALL_SPECIAL_CHARACTERS_GROUP ) {
			/**
			 * The name "All" for a special category group cannot be used because it is a special category that displays all
			 * available special characters.
			 *
			 * @error special-character-invalid-group-name
			 */
			throw new CKEditorError( 'special-character-invalid-group-name', null );
		}

		const group = this._getGroup( groupName, options.label );

		for ( const item of items ) {
			group.items.add( item.title );
			this._characters.set( item.title, item.character );
		}
	}

	/**
	 * Returns special character groups in an order determined based on configuration and registration sequence.
	 *
	 * @returns {Iterable.<String>}
	 */
	getGroups() {
		const groups = Array.from( this._groups.keys() );
		const order = this.editor.config.get( 'specialCharacters.order' ) || [];

		const invalidGroup = order.find( item => !groups.includes( item ) );

		if ( invalidGroup ) {
			/**
			 * One of the special character groups in the "specialCharacters.order" configuration doesn't exist.
			 *
			 * @error special-character-invalid-order-group-name
			 */
			throw new CKEditorError( 'special-character-invalid-order-group-name', null, { invalidGroup } );
		}

		return new Set( [
			...order,
			...groups
		] );
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

		const group = this._groups.get( groupName );

		if ( group ) {
			return group.items;
		}
	}

	/**
	 * Returns the symbol of a special character for the specified name. If the special character could not be found, `undefined`
	 * is returned.
	 *
	 * @param {String} title The title of a special character.
	 * @returns {String|undefined}
	 */
	getCharacter( title ) {
		return this._characters.get( title );
	}

	/**
	 * Returns a group of special characters. If the group with the specified name does not exist, it will be created.
	 *
	 * @private
	 * @param {String} groupName The name of the group to create.
	 * @param {String} label The label describing the new group.
	 */
	_getGroup( groupName, label ) {
		if ( !this._groups.has( groupName ) ) {
			this._groups.set( groupName, {
				items: new Set(),
				label
			} );
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

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @private
	 * @param {module:utils/locale~Locale} locale
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
	 * @returns {Object} Returns an object with `navigationView`, `gridView` and `infoView` properties, containing UI parts.
	 */
	_createDropdownPanelContent( locale, dropdownView ) {
		// The map contains a name of category (an identifier) and its label (a translational string).
		const specialCharsGroups = new Map( [
			// Add a special group that shows all available special characters.
			[ ALL_SPECIAL_CHARACTERS_GROUP, this._allSpecialCharactersGroupLabel ],

			...Array.from( this.getGroups() )
				.map( name => ( [ name, this._groups.get( name ).label ] ) )
		] );

		const navigationView = new SpecialCharactersNavigationView( locale, specialCharsGroups );
		const gridView = new CharacterGridView( locale );
		const infoView = new CharacterInfoView( locale );

		gridView.delegate( 'execute' ).to( dropdownView );

		gridView.on( 'tileHover', ( evt, data ) => {
			infoView.set( data );
		} );

		gridView.on( 'tileFocus', ( evt, data ) => {
			infoView.set( data );
		} );

		// Update the grid of special characters when a user changed the character group.
		navigationView.on( 'execute', () => {
			this._updateGrid( navigationView.currentGroupName, gridView );
		} );

		// Set the initial content of the special characters grid.
		this._updateGrid( navigationView.currentGroupName, gridView );

		return { navigationView, gridView, infoView };
	}
}

/**
 * @typedef {Object} module:special-characters/specialcharacters~SpecialCharacterDefinition
 *
 * @property {String} title A unique name of the character (e.g. "greek small letter epsilon").
 * @property {String} character A human-readable character displayed as the label (e.g. "ε").
 */

/**
 * The configuration of the {@link module:special-characters/specialcharacters~SpecialCharacters} feature.
 *
 * Read more in {@link module:special-characters/specialcharacters~SpecialCharactersConfig}.
 *
 * @member {module:special-characters/specialcharacters~SpecialCharactersConfig}
 * module:core/editor/editorconfig~EditorConfig#specialCharacters
 */

/**
 * The configuration of the special characters feature.
 *
 * Read more about {@glink features/special-characters#configuration configuring the special characters feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				specialCharacters: ... // Special characters feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * @interface SpecialCharactersConfig
 */

/**
 * The configuration of the special characters category order.
 *
 * Special characters categories are displayed in the UI in the order in which they were registered. Using the `order` property
 * allows to override this behaviour and enforce specific order. Categories not listed in the `order` property will be displayed
 * in the default order below categories listed in the configuration.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				plugins: [ SpecialCharacters, SpecialCharactersEssentials, ... ],
 *				specialCharacters: {
 *					order: [
 *						'Text',
 *						'Latin',
 *						'Mathematical',
 *						'Currency',
 *						'Arrows'
 *					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @member {Array.<String>} module:special-characters/specialcharacters~SpecialCharactersConfig#order
 */
