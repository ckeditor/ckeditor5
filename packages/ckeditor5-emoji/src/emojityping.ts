/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojityping
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { Range } from 'ckeditor5/src/engine.js';
import { env } from 'ckeditor5/src/utils.js';
import { clickOutsideHandler, ContextualBalloon, type ButtonView } from 'ckeditor5/src/ui.js';
import { TextWatcher, type TextWatcherMatchedEvent } from 'ckeditor5/src/typing.js';

import EmojiTypingView from './ui/emojitypingview.js';
import EmojiDatabase from './emojidatabase.js';
import type { MentionFeed } from '@ckeditor/ckeditor5-mention';

const EMOJI_MENTION_MARKER = ':';

/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */
export default class EmojiTyping extends Plugin {
	/**
	 * The contextual balloon plugin instance.
	 */
	declare private _balloon: ContextualBalloon;

	/**
	 * An instance of the {@link module:emoji/emojidatabase~EmojiDatabase} plugin.
	 */
	declare private _emojiDatabasePlugin: EmojiDatabase;

	/**
	 * A flag describing whether the `EmojiTyping` plugin conflicts with `Mention` or `Merge fields` features.
	 * @private
	 */
	private readonly _isConflictingOtherPlugins: boolean;

	/**
	 * The actions view displayed inside the balloon.
	 */
	declare private _emojiTypingView: EmojiTypingView | undefined;

	/**
	 * Model range that is used to insert the emoji.
	 */
	declare private _rangeToInsert: Range;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiDatabase, ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiTyping' as const;
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

		const mentionFeedsConfigs = editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const mergeFieldsPrefix = editor.config.get( 'mergeFields.prefix' )! as string;
		const markerAlreadyUsed = mentionFeedsConfigs.some( config => config.marker === EMOJI_MENTION_MARKER );
		const isMarkerUsedByMergeFields = mergeFieldsPrefix ? mergeFieldsPrefix[ 0 ] === EMOJI_MENTION_MARKER : false;

		this._isConflictingOtherPlugins = markerAlreadyUsed || isMarkerUsedByMergeFields;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		this._balloon = editor.plugins.get( 'ContextualBalloon' );
		this._emojiDatabasePlugin = editor.plugins.get( 'EmojiDatabase' );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		// Skip overriding the `mention` command listener if the emoji database is not loaded.
		if ( !this._emojiDatabasePlugin.isDatabaseLoaded() ) {
			return;
		}

		if ( this._isConflictingOtherPlugins ) {
			/**
			 * The `marker` in the `emoji` config is already used by other plugin configuration.
			 *
			 * @error emoji-config-marker-already-used
			 * @param {string} marker Used marker.
			 */
			logWarning( 'emoji-config-marker-already-used', { marker: EMOJI_MENTION_MARKER } );

			return;
		}

		const pattern = createRegExp( ':', 0 );
		let isTyping = false;
		let typingTimer: number;

		const shouldInterceptEvent = () => this._balloon.visibleView === this._emojiTypingView;
		const isGridEmpty = () => this._emojiTypingView!.gridView.isEmpty;
		const findCurrentElement = ( gridItems: ViewCollection ) => {
			const tile = gridItems.find( tile => tile.element!.classList.contains( 'ck-focus' ) )!;
			const index = gridItems.getIndex( tile );

			return { tile, index };
		};
		const updateElements = ( toAdd: ButtonView, toRemove: ButtonView ) => {
			toRemove.element!.classList.remove( 'ck-focus' );
			toAdd.element!.classList.add( 'ck-focus' );
		};

		editor.keystrokes.set( 'Enter', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() || isGridEmpty() ) {
				return;
			}

			const { tile } = findCurrentElement( this._emojiTypingView.gridView.tiles );

			this.editor.model.change( writer => {
				this.editor.model.insertContent( writer.createText( tile.label ), this._rangeToInsert );
			} );

			this._hideUI();
			cancel();
		} );

		editor.keystrokes.set( 'Esc', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() ) {
				return;
			}

			this._hideUI();
			cancel();
		} );

		editor.keystrokes.set( 'ArrowLeft', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() || isGridEmpty() ) {
				return;
			}

			const gridItems = this._emojiTypingView.gridView.tiles;
			const { tile, index } = findCurrentElement( gridItems );

			const newIndex = index === 0 ? gridItems.length - 1 : index - 1;
			const newTile = gridItems.get( newIndex )!;

			updateElements( newTile, tile );
			cancel();
		} );

		editor.keystrokes.set( 'ArrowRight', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() || isGridEmpty() ) {
				return;
			}

			const gridItems = this._emojiTypingView.gridView.tiles;
			const { tile, index } = findCurrentElement( gridItems );
			const newIndex = index === gridItems.length - 1 ? 0 : index + 1;
			const newTile = gridItems.get( newIndex )!;

			updateElements( newTile, tile );
			cancel();
		} );

		editor.keystrokes.set( 'ArrowDown', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() || isGridEmpty() ) {
				return;
			}

			const gridColumns = this._gridColumns();
			const gridItems = this._emojiTypingView.gridView.tiles;
			const { tile, index } = findCurrentElement( gridItems );

			let newIndex = index + gridColumns;

			if ( newIndex > gridItems.length - 1 ) {
				newIndex = index % gridColumns;
			}

			const newTile = gridItems.get( newIndex )!;

			updateElements( newTile, tile );
			cancel();
		} );

		editor.keystrokes.set( 'ArrowUp', ( evt, cancel ) => {
			if ( !shouldInterceptEvent() || isGridEmpty() ) {
				return;
			}

			const gridColumns = this._gridColumns();
			const gridItems = this._emojiTypingView.gridView.tiles;
			const { tile, index } = findCurrentElement( gridItems );

			let nextIndex = index - gridColumns;

			if ( nextIndex < 0 ) {
				nextIndex = index + gridColumns * Math.floor( gridItems.length / gridColumns );

				if ( nextIndex > gridItems.length - 1 ) {
					nextIndex -= gridColumns;
				}
			}

			const newTile = gridItems.get( nextIndex )!;

			updateElements( newTile, tile );
			cancel();
		} );

		// To prevent opening the balloon on click that matches the pattern.
		editor.model.document.on( 'change:data', () => {
			if ( !isTyping ) {
				isTyping = true;
			}

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
			this._rangeToInsert = data.range;
			this._showUI( data.text.slice( 1 ) );
		} );

		watcher.on<TextWatcherMatchedEvent>( 'unmatched', () => {
			this._hideUI();
		} );
	}

	/**
	 * Shows the balloon UI.
	 *
	 * @param searchQuery
	 */
	private _showUI( searchQuery: string ) {
		if ( !this._emojiTypingView ) {
			this._emojiTypingView = this._createEmojiTypingView();
		}

		if ( !this._balloon.hasView( this._emojiTypingView ) ) {
			this._balloon.add( {
				view: this._emojiTypingView,
				position: this._getBalloonPositionData()
			} );
		}

		this._emojiTypingView.search( searchQuery );
		this._balloon.updatePosition();

		setTimeout( () => this._emojiTypingView!.focus() );
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI(): void {
		if ( this._balloon.hasView( this._emojiTypingView ) ) {
			this._balloon.remove( this._emojiTypingView! );
		}

		this.editor.editing.view.focus();
	}

	private _createEmojiTypingView(): EmojiTypingView {
		const emojiTypingView = new EmojiTypingView( this.editor.locale, {
			emojiGroups: this._emojiDatabasePlugin.getEmojiGroups(),
			skinTone: this.editor.config.get( 'emoji.skinTone' )!,
			getEmojiBySearchQuery: ( query: string ) => {
				return this._emojiDatabasePlugin.getEmojiBySearchQuery( query );
			}
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: emojiTypingView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === emojiTypingView
		} );

		return emojiTypingView;
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

	/**
	 * Returns number of columns in the grid.
	 */
	private _gridColumns(): number {
		return global.window
			.getComputedStyle( this._emojiTypingView.gridView.element!.firstChild as Element ) // Responsive `.ck-emoji-grid__tiles`.
			.getPropertyValue( 'grid-template-columns' )
			.split( ' ' )
			.length;
	}
}

// ---- `@ckeditor/ckeditor5-mention` internals.

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
