/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojipicker
 */

import '../theme/emojipicker.css';
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
	clickOutsideHandler,
	ContextualBalloon,
	Dialog,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';
import EmojiToneView, { type SkinToneId } from './ui/emojitoneview.js';

export type EmojiGroup = {
	title: string;
	exampleEmoji: string;
	items: Array<EmojiItem>;
};

type EmojiItem = {
	name: string;
	emojis: Array<string>;
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
	private _characters: Map<string, Array<string>>;

	/**
	 * Registered groups. Each group contains a displayed label and a collection with symbol names.
	 */
	private _groups: Map<string, Group>;

	private _emojiGroups: Array<EmojiGroup>;

	private _balloon!: ContextualBalloon;

	private _emojiPickerView: EmojiPickerView | null;

	private _selectedSkinTone: SkinToneId;

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
		this._selectedSkinTone = 0;
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
				const emojis = [ item.unicode ];

				if ( 'skins' in item ) {
					emojis.push( ...item.skins!.sort( ( a, b ) => a.tone - b.tone ).map( item => item.unicode ) );
				}

				this._characters.set( name, emojis );

				return { name, emojis };
			} )
		};
	}

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `categoriesView` and `gridView`properties, containing UI parts.
	 */
	private _createDropdownPanelContent( locale: Locale ): DropdownPanelContent {
		const searchView = new EmojiSearchView( locale );
		const toneView = new EmojiToneView( locale, this._selectedSkinTone );
		const categoriesView = new EmojiCategoriesView( locale, this._emojiGroups );
		const gridView = new EmojiGridView( locale );
		const infoView = new EmojiInfoView( locale );

		const dropdownPanelContent = {
			searchView,
			toneView,
			categoriesView,
			gridView,
			infoView
		};

		// Set the initial content of the special characters grid.
		this._updateGrid( dropdownPanelContent ).then( () => {
			this._balloon.updatePosition();
		} );

		searchView.on<EmojiSearchViewInputEvent>( 'input', ( evt, data ) => {
			this._searchQuery = data.value;

			this._updateGrid( dropdownPanelContent ).then( () => {
				this._balloon.updatePosition();
			} );
		} );

		gridView.on<CharacterGridViewTileHoverEvent>( 'tileHover', ( evt, data ) => {
			infoView.set( data );
		} );

		gridView.on<CharacterGridViewTileFocusEvent>( 'tileFocus', ( evt, data ) => {
			infoView.set( data );
		} );

		// Update the grid of special characters when a user changed the character group.
		categoriesView.on( 'change:currentGroupName', () => {
			this._updateGrid( dropdownPanelContent );
		} );

		toneView.on( 'change:selectedSkinTone', ( evt, propertyName, newValue ) => {
			this._selectedSkinTone = newValue;

			this._updateGrid( dropdownPanelContent );
		} );

		return dropdownPanelContent;
	}

	/**
	 * Updates the symbol grid depending on the currently selected character group.
	 */
	private async _updateGrid( { gridView, categoriesView }: DropdownPanelContent ): Promise<void> {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		if ( !this._searchQuery || this._searchQuery.length < 2 ) {
			const charactersForGroup = this.getCharactersForGroup( categoriesView.currentGroupName );

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

			const emojis = this._characters.get( name );

			if ( !emojis ) {
				return null;
			}

			return { name, emojis };
		} );

		this._addTilesToGrid( gridView, tilesToAdd.filter( Boolean ) as Array<EmojiItem> );
		categoriesView.disableCategories();
	}

	/**
	 * Returns a collection of special characters symbol names (titles).
	 */
	public getCharactersForGroup( groupName: string ): Array<EmojiItem> {
		const group = this._emojiGroups.find( group => group.title === groupName )!;

		return group.items;
	}

	private _addTilesToGrid( gridView: EmojiGridView, charactersForGroup: Array<EmojiItem> ) {
		for ( const item of charactersForGroup ) {
			const emoji = item.emojis[ this._selectedSkinTone ] || item.emojis[ 0 ];

			gridView.tiles.add( gridView.createTile( emoji, item.name ) );
		}
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

	/**
	 * Displays the balloon with the emoji picker.
	 */
	public showUI( searchValue?: string ): void {
		if ( searchValue ) {
			this._searchQuery = searchValue;
		}

		const dropdownPanelContent = this._createDropdownPanelContent( this.editor.locale );
		this._emojiPickerView = new EmojiPickerView( this.editor.locale, dropdownPanelContent );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: this._emojiPickerView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === this._emojiPickerView
		} );

		this._balloon.add( {
			view: this._emojiPickerView,
			position: this._getBalloonPositionData()
		} );

		dropdownPanelContent.gridView.on<CharacterGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			this.editor.execute( 'insertText', { text: data.character } );
			this._hideUI();
		} );

		setTimeout( () => this._emojiPickerView!.focus() );

		if ( this._searchQuery ) {
			dropdownPanelContent.searchView.setSearchQuery( this._searchQuery );
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
		this._searchQuery = '';
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

interface Group {
	label: string;
	items: Set<string>;
}

export interface DropdownPanelContent {
	searchView: EmojiSearchView;
	toneView: EmojiToneView;
	categoriesView: EmojiCategoriesView;
	gridView: EmojiGridView;
	infoView: EmojiInfoView;
}
