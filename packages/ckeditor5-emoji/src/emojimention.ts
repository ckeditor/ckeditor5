/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojimention
 */

import { env, type Locale, type ObservableChangeEvent, type PositionOptions } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import EmojiDatabase, { type EmojiCategory } from './emojidatabase.js';
import { TextWatcher, type TextWatcherMatchedEvent } from 'ckeditor5/src/typing.js';
import { clickOutsideHandler, ContextualBalloon, Dialog, SearchInfoView, type SearchTextViewSearchEvent } from 'ckeditor5/src/ui.js';
import EmojiPickerView, { type EmojiDropdownPanelContent } from './ui/emojipickerview.js';
import type { SkinToneId } from './emojiconfig.js';
import EmojiGridView, { type EmojiGridViewExecuteEvent } from './ui/emojigridview.js';
import EmojiSearchView from './ui/emojisearchview.js';
import EmojiToneView from './ui/emojitoneview.js';
import EmojiCategoriesView from './ui/emojicategoriesview.js';
import type { Range } from 'ckeditor5/src/engine.js';

function getLastValidMarkerInText( pattern: RegExp, text: string ): number | undefined {
	let lastValidMarker: any;

	const currentMarkerLastIndex = text.lastIndexOf( ':' );

	if ( currentMarkerLastIndex > 0 && !text.substring( currentMarkerLastIndex - 1 ).match( pattern ) ) {
		return undefined;
	}

	if ( !lastValidMarker || currentMarkerLastIndex >= lastValidMarker.position ) {
		return currentMarkerLastIndex;
	}
}

/**
 * Creates a RegExp pattern for the marker.
 *
 * Function has to be exported to achieve 100% code coverage.
 */
function createRegExp( marker: string, minimumCharacters: number ): RegExp {
	const numberOfCharacters = minimumCharacters == 0 ? '*' : `{${ minimumCharacters },}`;
	const openAfterCharacters = env.features.isRegExpUnicodePropertySupported ? '\\p{Ps}\\p{Pi}"\'' : '\\(\\[{"\'';
	const mentionCharacters = '.';

	// I wanted to make an util out of it, but since this regexp uses "u" flag, it became difficult.
	// When "u" flag is used, the regexp has "strict" escaping rules, i.e. if you try to escape a character that does not need
	// to be escaped, RegExp() will throw. It made it difficult to write a generic util, because different characters are
	// allowed in different context. For example, escaping "-" sometimes was correct, but sometimes it threw an error.
	marker = marker.replace( /[.*+?^${}()\-|[\]\\]/g, '\\$&' );

	// The pattern consists of 3 groups:
	//
	// - 0 (non-capturing): Opening sequence - start of the line, space or an opening punctuation character like "(" or "\"",
	// - 1: The marker character,
	// - 2: Mention input (taking the minimal length into consideration to trigger the UI),
	//
	// The pattern matches up to the caret (end of string switch - $).
	//               (0:      opening sequence       )(1:   marker  )(2:                typed mention              )$
	const pattern = `(?:^|[ ${ openAfterCharacters }])([${ marker }])(${ mentionCharacters }${ numberOfCharacters })$`;

	return new RegExp( pattern, 'u' );
}

/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */
export default class EmojiMention extends Plugin {
	/**
	 * Active skin tone.
	 *
	 * @observable
	 * @default 'default'
	 */
	declare public skinTone: SkinToneId;

	/**
	 * Active category.
	 *
	 * @observable
	 * @default ''
	 */
	declare public categoryName: string;

	/**
	 * A query provided by a user in the search field.
	 *
	 * @observable
	 * @default ''
	 */
	declare public searchQuery: string;

	/**
	 * An array containing all emojis grouped by their categories.
	 */
	declare public emojiGroups: Array<EmojiCategory>;

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
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiDatabase, ContextualBalloon, Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiMention' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public init(): void {
		const { editor } = this;

		this._emojiDatabase = editor.plugins.get( EmojiDatabase );
		this._balloon = editor.plugins.get( ContextualBalloon );

		this.emojiGroups = this._emojiDatabase.getEmojiGroups();

		this.set( 'searchQuery', '' );
		this.set( 'categoryName', this.emojiGroups[ 0 ].title );
		this.set( 'skinTone', 'default' );

		const pattern = createRegExp( ':', 0 );
		let isTyping = false;
		let typingTimer: number;

		editor.model.document.on( 'change:data', () => {
			if ( !isTyping ) {
				isTyping = true;
			}

			// Optionally, you can set a timeout to detect when typing has stopped
			if ( typingTimer ) {
				clearTimeout( typingTimer );
			}
			typingTimer = setTimeout( () => {
				isTyping = false;
			}, 250 );
		} );

		const watcher = new TextWatcher( editor.model, ( text: string ) => {
			if ( !isTyping ) {
				return false;
			}

			const position = getLastValidMarkerInText( pattern, text );

			if ( typeof position === 'undefined' ) {
				return false;
			}

			let splitStringFrom = 0;

			if ( position !== 0 ) {
				splitStringFrom = position - 1;
			}

			const textToTest = text.substring( splitStringFrom );

			return pattern.test( textToTest );
		} );

		watcher.on<TextWatcherMatchedEvent>( 'matched', ( evt, data ) => {
			this.showUI( data.text.slice( 1 ), data.range );
		} );
	}

	/**
	 * Displays the balloon with the emoji picker.
	 */
	public showUI( searchValue: string, range: Range ): void {
		const dropdownPanelContent = this._createDropdownPanelContent( this.editor.locale, range );
		this._emojiPickerView = new EmojiPickerView( this.editor.locale, dropdownPanelContent );

		this._balloon.add( {
			view: this._emojiPickerView,
			position: this._getBalloonPositionData()
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
			this.searchQuery = searchValue;
			this._emojiPickerView.searchView.setInputValue( this.searchQuery );
		}

		// To trigger an initial search to render the grid.
		this._emojiPickerView.searchView.search( this.searchQuery );

		setTimeout( () => this._emojiPickerView!.focus() );
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI(): void {
		if ( this._emojiPickerView ) {
			this._balloon.remove( this._emojiPickerView );
		}

		this.editor.editing.view.focus();
		this.searchQuery = '';

		// this._hideFakeVisualSelection();
	}

	/**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `categoriesView` and `gridView`properties, containing UI parts.
	 */
	private _createDropdownPanelContent( locale: Locale, range: Range ): EmojiDropdownPanelContent {
		const t = locale.t;

		const gridView = new EmojiGridView( locale, {
			emojiGroups: this.emojiGroups,
			categoryName: this.categoryName,
			getEmojiBySearchQuery: ( query: string ) => {
				return this._emojiDatabase.getEmojiBySearchQuery( query );
			}
		} );

		const resultsView = new SearchInfoView();
		const searchView = new EmojiSearchView( locale, {
			gridView,
			resultsView
		} );
		const toneView = new EmojiToneView( locale, {
			skinTone: this.skinTone
		} );
		const categoriesView = new EmojiCategoriesView( locale, {
			emojiGroups: this.emojiGroups,
			categoryName: this.categoryName
		} );

		// Bind the "current" plugin settings specific views to avoid manual updates.
		gridView.bind( 'categoryName' ).to( this, 'categoryName' );
		gridView.bind( 'skinTone' ).to( this, 'skinTone' );
		gridView.bind( 'searchQuery' ).to( this, 'searchQuery' );

		// Disable the category switcher when filtering by a query.
		searchView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( data.query ) {
				categoriesView.disableCategories();
			} else {
				categoriesView.enableCategories();
			}

			this.searchQuery = data.query;
			this._balloon.updatePosition();
		} );

		// Show a user-friendly message when emojis are not found.
		searchView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( !data.resultsCount ) {
				resultsView.set( {
					primaryText: t( 'No emojis were found matching "%0".', data.query ),
					secondaryText: t( 'Please try a different phrase or check the spelling.' ),
					isVisible: true
				} );
			} else {
				resultsView.set( {
					isVisible: false
				} );
			}
		} );

		// Update the grid of emojis when selected category changes.
		categoriesView.on<ObservableChangeEvent<string>>( 'change:categoryName', ( ev, args, categoryName ) => {
			this.categoryName = categoryName;
			this._balloon.updatePosition();
		} );

		// Update the grid of emojis when selected skin tone changes.
		toneView.on<ObservableChangeEvent>( 'change:skinTone', ( evt, propertyName, newValue ) => {
			this.skinTone = newValue;

			searchView.search( this.searchQuery );
		} );

		// Insert an emoji on a tile click.
		gridView.on<EmojiGridViewExecuteEvent>( 'execute', ( evt, data ) => {
			const editor = this.editor;
			const model = editor.model;
			const textToInsert = data.emoji;

			model.change( writer => {
				const selection = model.createSelection( range );

				model.deleteContent( selection );
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

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 */
	private _getBalloonPositionData(): Partial<PositionOptions> {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		// Set a target position by converting view selection range to DOM.
		const target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange()! );

		return {
			target
		};
	}
}
