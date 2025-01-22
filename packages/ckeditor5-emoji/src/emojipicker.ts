/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojipicker
 */

import { ButtonView, clickOutsideHandler, ContextualBalloon, Dialog, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import type { PositionOptions } from 'ckeditor5/src/utils.js';
import { type Editor, icons, Plugin } from 'ckeditor5/src/core.js';

import EmojiCommand from './emojicommand.js';
import EmojiDatabase from './emojidatabase.js';
import EmojiPickerView from './ui/emojipickerview.js';
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
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		this._emojiDatabase = editor.plugins.get( 'EmojiDatabase' );
		this._balloon = editor.plugins.get( 'ContextualBalloon' );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		// Skip registering a button in the toolbar and list item in the menu bar if the emoji database is not loaded.
		if ( !this._emojiDatabase.isDatabaseLoaded() ) {
			return;
		}

		editor.commands.add( 'emoji', new EmojiCommand( editor ) );

		editor.ui.componentFactory.add( 'emoji', () => {
			const button = this._createUiComponent( ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:emoji', () => {
			return this._createUiComponent( MenuBarMenuListItemButtonView );
		} );

		this._setupConversion();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		if ( this._emojiPickerView ) {
			this._emojiPickerView.destroy();
		}
	}

	/**
	 * Represents an active skin tone. Its value depends on the emoji UI plugin.
	 *
	 * Before opening the UI for the first time, the returned value is read from the editor configuration.
	 * Otherwise, it reflects the user's intention.
	 */
	public get skinTone(): SkinToneId {
		if ( !this._emojiPickerView ) {
			return this.editor.config.get( 'emoji.skinTone' )!;
		}

		return this._emojiPickerView.gridView.skinTone;
	}

	/**
	 * Displays the balloon with the emoji picker.
	 *
	 * @param [searchValue=''] A default query used to filer the grid when opening the UI.
	 */
	public showUI( searchValue: string = '' ): void {
		if ( !this._emojiPickerView ) {
			this._emojiPickerView = this._createEmojiPickerView();
		}

		if ( searchValue ) {
			this._emojiPickerView.searchView.setInputValue( searchValue );
		}

		this._emojiPickerView.searchView.search( searchValue );

		if ( !this._balloon.hasView( this._emojiPickerView ) ) {
			this._balloon.add( {
				view: this._emojiPickerView,
				position: this._getBalloonPositionData()
			} );

			this._showFakeVisualSelection();
		}

		setTimeout( () => {
			this._emojiPickerView!.focus();
		} );
	}

	/**
	 * Creates a button for toolbar and menu bar that will show the emoji dialog.
	 */
	private _createUiComponent<T extends typeof ButtonView>( ViewClass: T ): InstanceType<T> {
		const buttonView = new ViewClass( this.editor.locale ) as InstanceType<T>;
		const t = this.editor.locale.t;

		buttonView.set( {
			label: t( 'Emoji' ),
			icon: icons.emoji,
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
			emojiGroups: this._emojiDatabase.getEmojiGroups(),
			skinTone: this.editor.config.get( 'emoji.skinTone' )!,
			skinTones: this._emojiDatabase.getSkinTones(),
			getEmojiBySearchQuery: ( query: string ) => {
				return this._emojiDatabase.getEmojiBySearchQuery( query );
			}
		} );

		// Insert an emoji on a tile click.
		this.listenTo<EmojiGridViewExecuteEvent>( emojiPickerView.gridView, 'execute', ( evt, data ) => {
			const editor = this.editor;
			const model = editor.model;
			const textToInsert = data.emoji;

			model.change( writer => {
				model.insertContent( writer.createText( textToInsert ) );
			} );

			this._hideUI();
		} );

		// TODO: How to resolve it smartly?
		// this.listenTo( emojiPickerView, 'update', () => {
		// 	this._balloon.updatePosition();
		// } );

		// Close the panel on `Esc` key press when the **actions have focus**.
		emojiPickerView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: emojiPickerView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === emojiPickerView
		} );

		return emojiPickerView;
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI(): void {
		this._balloon.remove( this._emojiPickerView! );

		this._emojiPickerView!.searchView.setInputValue( '' );

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
