/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojipicker
 */

import '../theme/emojipicker.css';
import type { Locale } from 'ckeditor5/src/utils.js';
import { Database } from 'emoji-picker-element';
import { icons, Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import EmojiGridView, {
	type EmojiGridViewExecuteEvent,
	type EmojiGridViewTileFocusEvent,
	type EmojiGridViewTileHoverEvent
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

const VISUAL_SELECTION_MARKER_NAME = 'emoji-picker';

/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export default class EmojiPicker extends Plugin {
	/**
	 * Registered emojis. A pair of an emoji name and all its available skin tone variants.
	 */
	private _emojis: Map<string, Array<string>>;

	private _selectedSkinTone: SkinToneId;

	private _emojiGroups: Array<EmojiGroup>;

	private _balloon!: ContextualBalloon;

	private _emojiPickerView: EmojiPickerView | null;

	private _searchQuery: string | null;

	private _emojiDatabase: Database;

	public get emojis(): typeof this._emojis {
		return this._emojis;
	}

	public get selectedSkinTone(): typeof this._selectedSkinTone {
		return this._selectedSkinTone;
	}

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

		this._emojis = new Map();
		this._selectedSkinTone = 0;
		this._emojiGroups = [];
		this._emojiPickerView = null;
		this._searchQuery = null;
		this._emojiDatabase = new Database();
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

		// Renders a fake visual selection marker on an expanded selection.
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: {
				classes: [ 'ck-fake-emoji-selection' ]
			}
		} );

		// Renders a fake visual selection marker on a collapsed selection.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: ( data, { writer } ) => {
				if ( !data.markerRange.isCollapsed ) {
					return null;
				}

				const markerElement = writer.createUIElement( 'span' );

				writer.addClass(
					[ 'ck-fake-emoji-selection', 'ck-fake-emoji-selection_collapsed' ],
					markerElement
				);

				return markerElement;
			}
		} );
	}

	private async _getEmojiGroup( {
		databaseId, title, exampleEmoji
	}: {
		databaseId: number; title: string; exampleEmoji: string;
	} ): Promise<EmojiGroup> {
		const databaseGroup = await this._emojiDatabase.getEmojiByGroup( databaseId );
		const container = this._createEmojiWidthTestingContainer();
		const baselineEmojiWidth = this._getNodeWidth( container, '🙂' );

		const items = databaseGroup
			.filter( item => {
				const emojiWidth = this._getNodeWidth( container, item.unicode );

				// On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
				// against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
				// floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
				// So here we set the threshold at 1.8 times the size of the baseline emoji.
				return ( emojiWidth / 1.8 < baselineEmojiWidth ) && ( emojiWidth >= baselineEmojiWidth );
			} )
			.map( item => {
				const name = item.annotation;
				const emojis = [ item.unicode ];

				if ( 'skins' in item ) {
					emojis.push( ...item.skins!.sort( ( a, b ) => a.tone - b.tone ).map( item => item.unicode ) );
				}

				this._emojis.set( name, emojis );

				return { name, emojis };
			} );

		// Clean up width testing container.
		document.body.removeChild( container );

		return {
			title,
			exampleEmoji,
			items
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

		// Set the initial content of the emoji grid.
		this._updateGrid( dropdownPanelContent ).then( () => {
			this._balloon.updatePosition();
		} );

		// Update the grid of emojis when search query input changes.
		searchView.on<EmojiSearchViewInputEvent>( 'input', ( evt, data ) => {
			this._searchQuery = data.value;

			this._updateGrid( dropdownPanelContent ).then( () => {
				this._balloon.updatePosition();
			} );
		} );

		// Update the grid of emojis when selected category changes.
		categoriesView.on( 'change:currentCategoryName', () => {
			this._updateGrid( dropdownPanelContent );
		} );

		// Update the grid of emojis when selected skin tone changes.
		toneView.on( 'change:selectedSkinTone', ( evt, propertyName, newValue ) => {
			this._selectedSkinTone = newValue;

			this._updateGrid( dropdownPanelContent );
		} );

		// Update the info view of emojis when a tile in the grid is hovered.
		gridView.on<EmojiGridViewTileHoverEvent>( 'tileHover', ( evt, data ) => {
			infoView.set( data );
		} );

		// Update the info view of emojis when a tile in the grid is focused.
		gridView.on<EmojiGridViewTileFocusEvent>( 'tileFocus', ( evt, data ) => {
			infoView.set( data );
		} );

		return dropdownPanelContent;
	}

	/**
	 * Updates the symbol grid depending on the currently selected emoji category.
	 */
	private async _updateGrid( { gridView, categoriesView }: DropdownPanelContent ): Promise<void> {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		if ( !this._searchQuery || this._searchQuery.length < 2 ) {
			const emojisForCategory = this._getEmojisForCategory( categoriesView.currentCategoryName );

			this._addTilesToGrid( gridView, emojisForCategory );
			categoriesView.enableCategories();

			return;
		}

		const queryResult = await this._emojiDatabase.getEmojiBySearchQuery( this._searchQuery );
		const tilesToAdd = queryResult.map( queriedEmoji => {
			let name = '';

			if ( 'annotation' in queriedEmoji ) {
				name = queriedEmoji.annotation;
			}

			const emojis = this._emojis.get( name );

			// Query might return some emojis which we chose not to add to our database.
			/* istanbul ignore next -- @preserve */
			if ( !emojis ) {
				return null;
			}

			return { name, emojis };
		} );

		this._addTilesToGrid( gridView, tilesToAdd.filter( Boolean ) as Array<EmojiItem> );
		categoriesView.disableCategories();
	}

	private _getEmojisForCategory( groupName: string ): Array<EmojiItem> {
		const group = this._emojiGroups.find( group => group.title === groupName )!;

		return group.items;
	}

	private _addTilesToGrid( gridView: EmojiGridView, emojisForCategory: Array<EmojiItem> ) {
		for ( const item of emojisForCategory ) {
			const emoji = item.emojis[ this._selectedSkinTone ] || item.emojis[ 0 ];

			gridView.tiles.add( gridView.createTile( emoji, item.name ) );
		}
	}

	/**
	 * Creates a button for toolbar and menu bar that will show the emoji dialog.
	 */
	private _createDialogButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const buttonView = new ButtonClass( this.editor.locale ) as InstanceType<T>;

		buttonView.set( {
			label: this.editor.locale.t( 'Emoji' ),
			icon: icons.cog,
			isToggleable: true
		} );

		buttonView.on( 'execute', () => {
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

		this._balloon.add( {
			view: this._emojiPickerView,
			position: this._getBalloonPositionData()
		} );

		// Close the dialog while focus is in it.
		this._emojiPickerView.element!.addEventListener( 'keydown', event => {
			if ( event.key === 'Escape' ) {
				this._hideUI();
			}
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: this._emojiPickerView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === this._emojiPickerView
		} );

		dropdownPanelContent.gridView.on<EmojiGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			this.editor.execute( 'insertText', { text: data.emoji } );
			this._hideUI();
		} );

		setTimeout( () => this._emojiPickerView!.focus() );

		if ( this._searchQuery ) {
			dropdownPanelContent.searchView.setSearchQuery( this._searchQuery );
		}

		this._showFakeVisualSelection();
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

		this._hideFakeVisualSelection();
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

	/**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds an 'emoji-picker' marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( range.start.isAtEnd ) {
				const startPosition = range.start.getLastMatchingPosition(
					( { item } ) => !model.schema.isContent( item ),
					{ boundaries: range }
				);

				writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
					usingOperation: false,
					affectsData: false,
					range: writer.createRange( startPosition, range.end )
				} );
			} else {
				writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
					usingOperation: false,
					affectsData: false,
					range
				} );
			}
		} );
	}

	/**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}

	/**
	 * Creates a div for emoji width testing purposes.
	 */
	private _createEmojiWidthTestingContainer(): HTMLDivElement {
		const container = document.createElement( 'div' );
		container.style.position = 'absolute';
		container.style.left = '-9999px';
		container.style.whiteSpace = 'nowrap';
		container.style.fontSize = '24px';
		document.body.appendChild( container );

		return container;
	}

	/**
	 * Returns the width of the provided node.
	 */
	private _getNodeWidth( container: HTMLDivElement, node: string ): number {
		const span = document.createElement( 'span' );
		span.textContent = node;
		container.appendChild( span );
		const nodeWidth = span.offsetWidth;
		container.removeChild( span );

		return nodeWidth;
	}
}

export interface DropdownPanelContent {
	searchView: EmojiSearchView;
	toneView: EmojiToneView;
	categoriesView: EmojiCategoriesView;
	gridView: EmojiGridView;
	infoView: EmojiInfoView;
}

export type EmojiGroup = {
	title: string;
	exampleEmoji: string;
	items: Array<EmojiItem>;
};

type EmojiItem = {
	name: string;
	emojis: Array<string>;
};
