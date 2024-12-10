/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojipicker
 */

import '../theme/emoji.css';
import { type Locale } from 'ckeditor5/src/utils.js';
import { Database } from 'emoji-picker-element';
import { icons, Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import EmojiGridView, {
	type CharacterGridViewExecuteEvent,
	type CharacterGridViewTileFocusEvent,
	type CharacterGridViewTileHoverEvent
} from './ui/emojigridview.js';
import EmojiSearchView, { type EmojiSearchViewInputEvent } from './ui/emojisearchview.js';
import EmojiCategoriesView from './ui/emojicategoriesview.js';
import EmojiPickerView from './ui/emojipickerview.js';
import EmojiInfoView from './ui/emojiinfoview.js';

import {
	ButtonView,
	ContextualBalloon,
	Dialog,
	// DialogViewPosition,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';

export type EmojiGroup = {
	title: string;
	exampleEmoji: string;
	items: Array<EmojiItem>;
};

type EmojiItem = {
	name: string;
	emoji: string;
};

/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export default class EmojiPicker extends Plugin {
	private _searchQuery: string | null;

	private _emojiDatabase: Database;

	/**
	 * Registered characters. A pair of a character name and its symbol.
	 */
	private _characters: Map<string, string>;

	/**
	 * Registered groups. Each group contains a displayed label and a collection with symbol names.
	 */
	private _groups: Map<string, Group>;

	private _emojiGroups: Array<EmojiGroup>;

	private _balloon!: ContextualBalloon;

	private _emojiPickerView: EmojiPickerView | null;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon, Typing, Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiPicker' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._searchQuery = null;

		this._characters = new Map();
		this._groups = new Map();
		this._emojiGroups = [];

		this._emojiDatabase = new Database();
		this._emojiPickerView = null;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'emoji', () => {
			const button = this._createDialogButton( ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:emoji', () => {
			return this._createDialogButton( MenuBarMenuListItemButtonView );
		} );

		this._balloon = this.editor.plugins.get( ContextualBalloon );

		this._emojiGroups = await Promise.all( [
			this._getEmojiGroup( { databaseId: 0, title: 'Smileys & Expressions', exampleEmoji: '😀' } ),
			this._getEmojiGroup( { databaseId: 1, title: 'Gestures & People', exampleEmoji: '👋' } ),
			this._getEmojiGroup( { databaseId: 3, title: 'Animals & Nature', exampleEmoji: '🐻' } ),
			this._getEmojiGroup( { databaseId: 4, title: 'Food & Drinks', exampleEmoji: '🍎' } ),
			this._getEmojiGroup( { databaseId: 5, title: 'Travel & Places', exampleEmoji: '🚘' } ),
			this._getEmojiGroup( { databaseId: 6, title: 'Activities', exampleEmoji: '🏀' } ),
			this._getEmojiGroup( { databaseId: 7, title: 'Objects', exampleEmoji: '💡' } ),
			this._getEmojiGroup( { databaseId: 8, title: 'Symbols', exampleEmoji: '🟢' } ),
			this._getEmojiGroup( { databaseId: 9, title: 'Flags', exampleEmoji: '🏁' } )
		] );
	}

	/**
	 * Adds a collection of special characters to the specified group. The title of a special character must be unique.
	 */
	public addItems(
		groupName: string,
		items: Array<SpecialCharacterDefinition>,
		options: { label: string } = { label: groupName }
	): void {
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
		return new Set( Array.from( this._groups.keys() ) );
	}

	private async _getEmojiGroup( {
		databaseId, title, exampleEmoji
	}: {
		databaseId: number; title: string; exampleEmoji: string;
	} ): Promise<EmojiGroup> {
		const databaseGroup = await this._emojiDatabase.getEmojiByGroup( databaseId );

		return {
			title,
			exampleEmoji,
			items: databaseGroup.map( item => {
				const name = item.annotation;
				const emoji = item.unicode;

				this._characters.set( name, emoji );

				return { name, emoji };
			} )
		};
	}

	/**
	 * Returns a collection of special characters symbol names (titles).
	 */
	public getCharactersForGroup( groupName: string ): Array<EmojiItem> {
		const group = this._emojiGroups.find( group => group.title === groupName )!;

		return group.items;
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
	private async _updateGrid( currentGroupName: string, categoriesView: EmojiCategoriesView, gridView: EmojiGridView ): Promise<void> {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		if ( !this._searchQuery || this._searchQuery.length < 2 ) {
			const charactersForGroup = this.getCharactersForGroup( currentGroupName );

			this._addTilesToGrid( gridView, charactersForGroup );
			categoriesView.enableCategories();

			return;
		}

		const queryResult = await this._emojiDatabase.getEmojiBySearchQuery( this._searchQuery );
		const tilesToAdd = queryResult.map( queriedEmoji => {
			let name = '';

			if ( 'annotation' in queriedEmoji ) {
				name = queriedEmoji.annotation;
			}

			const emoji = this._characters.get( name );

			if ( !emoji ) {
				return null;
			}

			return { name, emoji };
		} );

		this._addTilesToGrid( gridView, tilesToAdd.filter( Boolean ) as Array<EmojiItem> );
		categoriesView.disableCategories();
	}

	private _addTilesToGrid( gridView: EmojiGridView, charactersForGroup: Array<EmojiItem> ) {
		for ( const item of charactersForGroup ) {
			gridView.tiles.add( gridView.createTile( item.emoji, item.name ) );
		}
	}

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `categoriesView` and `gridView`properties, containing UI parts.
	 */
	private _createDropdownPanelContent( locale: Locale ): DropdownPanelContent {
		const emojiSearchView = new EmojiSearchView( locale );
		const categoriesView = new EmojiCategoriesView( locale, this._emojiGroups );
		const gridView = new EmojiGridView( locale );
		const infoView = new EmojiInfoView( locale );

		emojiSearchView.on<EmojiSearchViewInputEvent>( 'input', ( evt, data ) => {
			this._searchQuery = data.value;

			this._updateGrid( categoriesView.currentGroupName, categoriesView, gridView );
		} );

		gridView.on<CharacterGridViewTileHoverEvent>( 'tileHover', ( evt, data ) => {
			infoView.set( data );
		} );

		gridView.on<CharacterGridViewTileFocusEvent>( 'tileFocus', ( evt, data ) => {
			infoView.set( data );
		} );

		// Update the grid of special characters when a user changed the character group.
		categoriesView.on( 'change:currentGroupName', ( evt, propertyName, newValue ) => {
			this._updateGrid( newValue, categoriesView, gridView );
		} );

		// Set the initial content of the special characters grid.
		this._updateGrid( categoriesView.currentGroupName, categoriesView, gridView );

		return { emojiSearchView, categoriesView, gridView, infoView };
	}

	/**
	 * Creates a button for toolbar and menu bar that will show special characters dialog.
	 */
	private _createDialogButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;
		const command = editor.commands.get( 'insertText' )!;
		const t = locale.t;
		const dialogPlugin = this.editor.plugins.get( 'Dialog' );

		buttonView.set( {
			label: t( 'Emoji' ),
			icon: icons.cog,
			isToggleable: true
		} );

		buttonView.bind( 'isOn' ).to( dialogPlugin, 'id', id => id === 'specialCharacters' );
		buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );

		buttonView.on( 'execute', () => {
			if ( dialogPlugin.id === 'specialCharacters' ) {
				dialogPlugin.hide();

				return;
			}

			this.showUI();
		} );

		return buttonView;
	}

	/*
	public showDialog( searchValue?: string ): void {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const locale = editor.locale;
		const t = locale.t;

		if ( searchValue ) {
			this._searchQuery = searchValue;
		}

		const { emojiSearchView, categoriesView, gridView, infoView } = this._createDropdownPanelContent( locale );
		const content = new EmojiPickerView(
			locale,
			emojiSearchView,
			categoriesView,
			gridView,
			infoView
		);

		if ( this._searchQuery ) {
			emojiSearchView.setSearchQuery( this._searchQuery );
		}

		gridView.on<CharacterGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			editor.execute( 'insertText', { text: data.character } );
		} );

		dialog.show( {
			id: 'specialCharacters',
			title: t( 'Emoji picker' ),
			className: 'ck-emoji',
			content,
			position: DialogViewPosition.EDITOR_TOP_SIDE
		} );
	}
	*/

	/**
	 * Displays the balloon with the emoji picker.
	 */
	public showUI( searchValue?: string ): void {
		if ( searchValue ) {
			this._searchQuery = searchValue;
		}

		const { emojiSearchView, categoriesView, gridView, infoView } = this._createDropdownPanelContent( this.editor.locale );
		this._emojiPickerView = new EmojiPickerView(
			this.editor.locale,
			emojiSearchView,
			categoriesView,
			gridView,
			infoView
		);

		this._balloon.add( {
			view: this._emojiPickerView,
			position: this._getBalloonPositionData()
		} );

		if ( this._searchQuery ) {
			emojiSearchView.setSearchQuery( this._searchQuery );
		}

		gridView.on<CharacterGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			this.editor.execute( 'insertText', { text: data.character } );
			this._hideUI();
		} );

		setTimeout( () => this._emojiPickerView!.focus() );

		if ( this._searchQuery ) {
			emojiSearchView.setSearchQuery( this._searchQuery );
		}
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI() {
		if ( this._emojiPickerView ) {
			this._balloon.remove( this._emojiPickerView );
		}

		this.editor.editing.view.focus();
	}

	private _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		// Set a target position by converting view selection range to DOM.
		const target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange()! );

		return {
			target
		};
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
	emojiSearchView: EmojiSearchView;
	categoriesView: EmojiCategoriesView;
	gridView: EmojiGridView;
	infoView: EmojiInfoView;
}
