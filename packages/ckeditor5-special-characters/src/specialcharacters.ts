/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { Typing, type InsertTextCommand } from 'ckeditor5/src/typing';
import { createDropdown, type DropdownView } from 'ckeditor5/src/ui';
import { CKEditorError, type Locale } from 'ckeditor5/src/utils';
import SpecialCharactersNavigationView from './ui/specialcharactersnavigationview';
import CharacterGridView, {
	type CharacterGridViewExecuteEvent,
	type CharacterGridViewTileFocusEvent,
	type CharacterGridViewTileHoverEvent
} from './ui/charactergridview';
import CharacterInfoView from './ui/characterinfoview';
import SpecialCharactersView from './ui/specialcharactersview';

import specialCharactersIcon from '../theme/icons/specialcharacters.svg';

import '../theme/specialcharacters.css';

const ALL_SPECIAL_CHARACTERS_GROUP = 'All';

/**
 * The special characters feature.
 *
 * Introduces the `'specialCharacters'` dropdown.
 */
export default class SpecialCharacters extends Plugin {
	/**
	 * Registered characters. A pair of a character name and its symbol.
	 */
	private _characters: Map<string, string>;

	/**
	 * Registered groups. Each group contains a displayed label and a collection with symbol names.
	 */
	private _groups: Map<string, Group>;

	/**
	 * A label describing the "All" special characters category.
	 */
	private _allSpecialCharactersGroupLabel: string;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Typing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SpecialCharacters' {
		return 'SpecialCharacters';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		const t = editor.t;

		this._characters = new Map();
		this._groups = new Map();
		this._allSpecialCharactersGroupLabel = t( 'All' );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		const inputCommand: InsertTextCommand = editor.commands.get( 'insertText' )!;

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			const dropdownView = createDropdown( locale );
			let dropdownPanelContent: DropdownPanelContent;

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( inputCommand );

			// Insert a special character when a tile was clicked.
			dropdownView.on<CharacterGridViewExecuteEvent>( 'execute', ( evt, data ) => {
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
	 */
	public addItems(
		groupName: string,
		items: Array<SpecialCharacterDefinition>,
		options: { label: string } = { label: groupName }
	): void {
		if ( groupName === ALL_SPECIAL_CHARACTERS_GROUP ) {
			/**
			 * The name "All" for a special category group cannot be used because it is a special category that displays all
			 * available special characters.
			 *
			 * @error special-character-invalid-group-name
			 */
			throw new CKEditorError( 'special-character-invalid-group-name', null );
		}

		const group = this._getGroup( groupName, options.label )!;

		for ( const item of items ) {
			group.items.add( item.title );
			this._characters.set( item.title, item.character );
		}
	}

	/**
	 * Returns special character groups in an order determined based on configuration and registration sequence.
	 */
	public getGroups(): Set<string> {
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
	 */
	public getCharactersForGroup( groupName: string ): Set<string> | undefined {
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
	 * @param title The title of a special character.
	 */
	public getCharacter( title: string ): string | undefined {
		return this._characters.get( title );
	}

	/**
	 * Returns a group of special characters. If the group with the specified name does not exist, it will be created.
	 *
	 * @param groupName The name of the group to create.
	 * @param label The label describing the new group.
	 */
	private _getGroup( groupName: string, label: string ): Group | undefined {
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
	 */
	private _updateGrid( currentGroupName: string, gridView: CharacterGridView ): void {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		const characterTitles = this.getCharactersForGroup( currentGroupName )!;

		for ( const title of characterTitles ) {
			const character = this.getCharacter( title )!;

			gridView.tiles.add( gridView.createTile( character, title ) );
		}
	}

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `navigationView`, `gridView` and `infoView` properties, containing UI parts.
	 */
	private _createDropdownPanelContent( locale: Locale, dropdownView: DropdownView ): DropdownPanelContent {
		const groupEntries: Array<[string, string]> = Array
			.from( this.getGroups() )
			.map( name => ( [ name, this._groups.get( name )!.label ] ) );

		// The map contains a name of category (an identifier) and its label (a translational string).
		const specialCharsGroups: Map<string, string> = new Map( [
			// Add a special group that shows all available special characters.
			[ ALL_SPECIAL_CHARACTERS_GROUP, this._allSpecialCharactersGroupLabel ],
			...groupEntries
		] );

		const navigationView = new SpecialCharactersNavigationView( locale, specialCharsGroups );
		const gridView = new CharacterGridView( locale );
		const infoView = new CharacterInfoView( locale );

		gridView.delegate( 'execute' ).to( dropdownView );

		gridView.on<CharacterGridViewTileHoverEvent>( 'tileHover', ( evt, data ) => {
			infoView.set( data );
		} );

		gridView.on<CharacterGridViewTileFocusEvent>( 'tileFocus', ( evt, data ) => {
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

export interface SpecialCharacterDefinition {

	/**
	 * A unique name of the character (e.g. "greek small letter epsilon").
	 */
	title: string;

	/**
	 * A human-readable character displayed as the label (e.g. "ε").
	 */
	character: string;
}

interface Group {
	label: string;
	items: Set<string>;
}

interface DropdownPanelContent {
	navigationView: SpecialCharactersNavigationView;
	gridView: CharacterGridView;
	infoView: CharacterInfoView;
}
