/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojipicker
 */

import { ButtonView, clickOutsideHandler, ContextualBalloon, Dialog, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import type { PositionOptions } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { IconEmoji } from 'ckeditor5/src/icons.js';

import EmojiCommand from './emojicommand.js';
import EmojiRepository from './emojirepository.js';
import EmojiPickerView, { type EmojiPickerViewUpdateEvent } from './ui/emojipickerview.js';
import { type EmojiGridViewExecuteEvent } from './ui/emojigridview.js';
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
	 * The actions view displayed inside the balloon.
	 */
	declare public emojiPickerView: EmojiPickerView | undefined;

	/**
	 * The contextual balloon plugin instance.
	 */
	declare public _balloonPlugin: ContextualBalloon;

	/**
	 * An instance of the {@link module:emoji/emojirepository~EmojiRepository} plugin.
	 */
	declare private _emojiRepositoryPlugin: EmojiRepository;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiRepository, ContextualBalloon, Dialog, Typing ] as const;
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
	public async init(): Promise<void> {
		const editor = this.editor;

		this._balloonPlugin = editor.plugins.get( 'ContextualBalloon' );
		this._emojiRepositoryPlugin = editor.plugins.get( 'EmojiRepository' );

		// Skip registering a button in the toolbar and list item in the menu bar if the emoji repository is not ready.
		if ( !await this._emojiRepositoryPlugin.isReady() ) {
			return;
		}

		const command = new EmojiCommand( editor );

		editor.commands.add( 'emoji', command );

		editor.ui.componentFactory.add( 'emoji', () => {
			const button = this._createButton( ButtonView, command );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:emoji', () => {
			return this._createButton( MenuBarMenuListItemButtonView, command );
		} );

		this._setupConversion();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		if ( this.emojiPickerView ) {
			this.emojiPickerView.destroy();
		}
	}

	/**
	 * Represents an active skin tone. Its value depends on the emoji UI plugin.
	 *
	 * Before opening the UI for the first time, the returned value is read from the editor configuration.
	 * Otherwise, it reflects the user's intention.
	 */
	public get skinTone(): SkinToneId {
		if ( !this.emojiPickerView ) {
			return this.editor.config.get( 'emoji.skinTone' )!;
		}

		return this.emojiPickerView.gridView.skinTone;
	}

	/**
	 * Displays the balloon with the emoji picker.
	 *
	 * @param [searchValue=''] A default query used to filer the grid when opening the UI.
	 */
	public showUI( searchValue: string = '' ): void {
		// Show visual selection on a text when the contextual balloon is displayed.
		// See #17654.
		this._showFakeVisualSelection();

		if ( !this.emojiPickerView ) {
			this.emojiPickerView = this._createEmojiPickerView();
		}

		if ( searchValue ) {
			this.emojiPickerView.searchView.setInputValue( searchValue );
		}

		this.emojiPickerView.searchView.search( searchValue );

		if ( !this._balloonPlugin.hasView( this.emojiPickerView ) ) {
			this._balloonPlugin.add( {
				view: this.emojiPickerView,
				position: this._getBalloonPositionData()
			} );
		}

		this.emojiPickerView.focus();
	}

	/**
	 * Creates a button for toolbar and menu bar that will show the emoji dialog.
	 */
	private _createButton<T extends typeof ButtonView>( ViewClass: T, command: EmojiCommand ): InstanceType<T> {
		const buttonView = new ViewClass( this.editor.locale ) as InstanceType<T>;
		const t = this.editor.locale.t;

		buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );

		buttonView.set( {
			label: t( 'Emoji' ),
			icon: IconEmoji,
			isToggleable: true
		} );

		buttonView.on( 'execute', () => {
			this.showUI();
		} );

		return buttonView;
	}

	/**
	 * Creates an instance of the `EmojiPickerView` class that represents an emoji balloon.
	 */
	private _createEmojiPickerView(): EmojiPickerView {
		const emojiPickerView = new EmojiPickerView( this.editor.locale, {
			emojiCategories: this._emojiRepositoryPlugin.getEmojiCategories(),
			skinTone: this.editor.config.get( 'emoji.skinTone' )!,
			skinTones: this._emojiRepositoryPlugin.getSkinTones(),
			getEmojiByQuery: ( query: string ) => {
				return this._emojiRepositoryPlugin.getEmojiByQuery( query );
			}
		} );

		// Insert an emoji on a tile click.
		this.listenTo<EmojiGridViewExecuteEvent>( emojiPickerView.gridView, 'execute', ( evt, data ) => {
			const editor = this.editor;
			const textToInsert = data.emoji;

			this._hideUI();
			editor.execute( 'insertText', { text: textToInsert } );
		} );

		// Update the balloon position when layout is changed.
		this.listenTo<EmojiPickerViewUpdateEvent>( emojiPickerView, 'update', () => {
			if ( this._balloonPlugin.visibleView === emojiPickerView ) {
				this._balloonPlugin.updatePosition();
			}
		} );

		// Close the panel on `Esc` key press when the **actions have focus**.
		emojiPickerView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: emojiPickerView,
			contextElements: [ this._balloonPlugin.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloonPlugin.visibleView === emojiPickerView
		} );

		return emojiPickerView;
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI(): void {
		this._balloonPlugin.remove( this.emojiPickerView! );
		this.emojiPickerView!.searchView.setInputValue( '' );
		this.editor.editing.view.focus();
		this._hideFakeVisualSelection();
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
	 * Returns positioning options for the {@link #_balloonPlugin}. They control the way the balloon is attached
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
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds an 'emoji-picker' marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
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
			}
		} );
	}

	/**
	 * Hides the fake visual selection.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}
}
