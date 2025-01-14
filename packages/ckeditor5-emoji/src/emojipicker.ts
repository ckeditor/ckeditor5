/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojipicker
 */

import {
	ButtonView,
	clickOutsideHandler,
	ContextualBalloon,
	Dialog,
	MenuBarMenuListItemButtonView,
	SearchInfoView
} from 'ckeditor5/src/ui.js';
import type { Model } from 'ckeditor5/src/engine.js';
import type { Locale, ObservableChangeEvent } from 'ckeditor5/src/utils.js';
import { type Editor, icons, Plugin } from 'ckeditor5/src/core.js';

import EmojiGridView, { type EmojiGridViewExecuteEvent } from './ui/emojigridview.js';
import EmojiDatabase, { type EmojiCategory } from './emojidatabase.js';
import EmojiSearchView from './ui/emojisearchview.js';
import EmojiCategoriesView from './ui/emojicategoriesview.js';
import EmojiPickerView from './ui/emojipickerview.js';

import EmojiToneView from './ui/emojitoneview.js';
import type { SkinToneId } from './emojiconfig.js';

import '../theme/emojipicker.css';

const VISUAL_SELECTION_MARKER_NAME = 'emoji-picker';

/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export default class EmojiPicker extends Plugin {
	/**
	 * Active skin tone.
	 *
	 * @observable
	 * @default 'default'
	 */
	declare private _skinTone: SkinToneId;

	/**
	 * Active category.
	 *
	 * @observable
	 * @default ''
	 */
	declare private _categoryName: string;

	/**
	 * A query provided by a user in the search field.
	 *
	 * @observable
	 * @default ''
	 */
	declare private _searchQuery: string;

	/**
	 * An array containing all emojis grouped by their categories.
	 */
	declare private _emojiGroups: Arrary<EmojiCategory>;

	/**
	 * The contextual balloon plugin instance.
	 */
	declare private _balloon: ContextualBalloon;

	/**
	 * An instance of the {@link module:emoji/emojidatabase~EmojiDatabase} plugin.
	 */
	declare private _emojiDatabase: EmojiDatabase;

	/**
	 * The actions view displayed inside the balloon.
	 */
	declare private _emojiPickerView: EmojiPickerView | undefined;

	/**
	 * Returns an active skin tone.
	 */
	public get skinTone(): typeof this._skinTone {
		return this._skinTone;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiDatabase, ContextualBalloon, Dialog ] as const;
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

		this.editor.config.define( 'emoji', {
			skinTone: 'default'
		} );

		this.set( '_searchQuery', '' );
		this.set( '_categoryName', '' );
		this.set( '_skinTone', editor.config.get( 'emoji.skinTone' )! );
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		const editor = this.editor;

		this._emojiDatabase = editor.plugins.get( EmojiDatabase );
		this._balloon = editor.plugins.get( ContextualBalloon );
		this._emojiGroups = this._emojiDatabase.getEmojiGroups();
		this._categoryName = this._emojiGroups[ 0 ].title;

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

		this._setupConversion();
	}

	/**
	 * Creates a button for toolbar and menu bar that will show the emoji dialog.
	 */
	private _createDialogButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const buttonView = new ButtonClass( this.editor.locale ) as InstanceType<T>;
		const t = this.editor.locale.t;

		buttonView.set( {
			label: t( 'Emoji' ),
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
		const dropdownPanelContent = this._createDropdownPanelContent( this.editor.locale );
		this._emojiPickerView = new EmojiPickerView( this.editor.locale, dropdownPanelContent );

		this._balloon.add( {
			view: this._emojiPickerView,
			position: getBalloonPositionData( this.editor )
		} );

		// Close the panel on esc key press when the **actions have focus**.
		this._emojiPickerView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: this._emojiPickerView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === this._emojiPickerView
		} );

		if ( searchValue ) {
			this._searchQuery = searchValue;
			this._emojiPickerView.searchView.setInputValue( this._searchQuery );
		}

		// To trigger an initial search to render the grid.
		this._emojiPickerView.searchView.search( this._searchQuery );

		setTimeout( () => this._emojiPickerView!.focus() );
		showFakeVisualSelection( this.editor.model );
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI(): void {
		if ( this._emojiPickerView ) {
			this._balloon.remove( this._emojiPickerView );
		}

		this.editor.editing.view.focus();
		this._searchQuery = '';

		hideFakeVisualSelection( this.editor.model );
	}

	/**
	 * Registers converters.
	 */
	private _setupConversion(): void {
		const editor = this.editor;

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

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `categoriesView` and `gridView`properties, containing UI parts.
	 */
	private _createDropdownPanelContent( locale: Locale ): DropdownPanelContent {
		const gridView = new EmojiGridView( locale, {
			emojiGroups: this._emojiGroups,
			initialCategory: this._categoryName,
			getEmojiBySearchQuery: ( query: string ) => {
				return this._emojiDatabase.getEmojiBySearchQuery( query );
			}
		} );

		gridView.emojiGroups = this._emojiGroups;
		gridView.categoryName = this._categoryName;

		const resultsView = new SearchInfoView( locale );
		const searchView = new EmojiSearchView( locale, gridView, resultsView );
		const toneView = new EmojiToneView( locale, this._skinTone );
		const categoriesView = new EmojiCategoriesView( locale, this._emojiGroups, this._categoryName );

		// Bind the "current" plugin settings specific views to avoid manual updates.
		gridView.bind( 'categoryName' ).to( this, '_categoryName' );
		gridView.bind( 'skinTone' ).to( this, '_skinTone' );
		gridView.bind( 'searchQuery' ).to( this, '_searchQuery' );

		// Update the grid of emojis when selected category changes.
		categoriesView.on<ObservableChangeEvent<string>>( 'change:categoryName', ( ev, args, categoryName ) => {
			this._categoryName = categoryName;
		} );

		// Disable the category switcher when filtering by a query.
		searchView.on( 'input', ( evt, data ) => {
			if ( data.query ) {
				categoriesView.disableCategories();
			} else {
				categoriesView.enableCategories();
			}

			this._searchQuery = data.query;
		} );

		// Update the grid of emojis when selected skin tone changes.
		toneView.on( 'change:skinTone', ( evt, propertyName, newValue ) => {
			this._skinTone = newValue;
		} );

		// Insert an emoji on a tile click.
		gridView.on<EmojiGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			const editor = this.editor;
			const model = editor.model;
			const textToInsert = data.emoji;

			model.change( writer => {
				model.insertContent( writer.createText( textToInsert ) );
			} );

			this._hideUI();
		} );

		return {
			searchView,
			toneView,
			categoriesView,
			gridView,
			resultsView
		};
	}
}

type DropdownPanelContent = {
	searchView: EmojiSearchView;
	toneView: EmojiToneView;
	categoriesView: EmojiCategoriesView;
	gridView: EmojiGridView;
	resultsView: SearchInfoView;
};

function getBalloonPositionData( editor: Editor ): Partial<PositionOptions> {
	const view = editor.editing.view;
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
function showFakeVisualSelection( model: Model ): void {
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
 * Hides the fake visual selection.
 */
function hideFakeVisualSelection( model: Model ): void {
	if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
		model.change( writer => {
			writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
		} );
	}
}
