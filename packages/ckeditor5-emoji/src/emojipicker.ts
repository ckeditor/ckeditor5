/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojipicker
 */

import '../theme/emojipicker.css';
import { icons, Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Picker } from 'emoji-picker-element';

import {
	clickOutsideHandler,
	ContextualBalloon,
	View,
	ButtonView,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';

type EmojiClickEvent = Event & {
	detail: {
		unicode: string;
	};
};

/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export default class EmojiPicker extends Plugin {
	private _balloon!: ContextualBalloon;
	declare private _emojiView: EmojiView;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
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
	public init(): void {
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this._emojiView = this._createEmojiView();

		this.editor.ui.componentFactory.add( 'emoji', () => createButton( this, ButtonView ) );
		this.editor.ui.componentFactory.add( 'menuBar:emoji', () => createButton( this, MenuBarMenuListItemButtonView ) );
	}

	/**
	 * Displays the balloon with the emoji picker.
	 *
	 * @param initialSearchValue Allows opening the emoji picker with given search query already typed in.
	 */
	public showUI( initialSearchValue?: string ): void {
		this._balloon.add( {
			view: this._emojiView,
			position: this._getBalloonPositionData()
		} );

		this._emojiView.focusInputElement();

		this._emojiView.attachListeners();

		if ( initialSearchValue ) {
			this._emojiView.updateSearchValue( initialSearchValue );
		}
	}

	/**
	 * Hides the balloon with the emoji picker.
	 */
	private _hideUI() {
		this._emojiView.removeListeners();
		this._balloon.remove( this._emojiView );

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

	/**
	 * Creates the emoji picker view.
	 */
	private _createEmojiView() {
		const editor = this.editor;
		const emojiView = new EmojiView( editor );

		emojiView.emojiElement.addEventListener( 'emoji-click', event => {
			const emoji = ( event as EmojiClickEvent ).detail.unicode;

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( emoji ) );
			} );

			this._hideUI();
		} );

		// Close the dialog while focus is in it.
		emojiView.emojiElement.addEventListener( 'keydown', event => {
			if ( event.key === 'Escape' ) {
				this._hideUI();
			}
		} );

		// Close the dialog when clicking outside of it.
		clickOutsideHandler( {
			emitter: emojiView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === emojiView
		} );

		return emojiView;
	}
}

class EmojiView extends View {
	public emojiElement: HTMLElement;
	private declare _lastFavoriteEmoji: HTMLElement;

	constructor( editor: Editor ) {
		super( editor.locale );

		this.emojiElement = new Picker();
		this.emojiElement.classList.add( 'light', 'ck', 'ck-emoji-picker' );

		const emojiView = new View( editor.locale );

		emojiView.element = this.emojiElement;

		this.setTemplate( {
			tag: 'div',
			children: this.createCollection( [ emojiView ] )
		} );
	}

	public updateSearchValue( newValue: string ): void {
		const inputElement = this._getInputElement();

		inputElement.value = newValue;
		inputElement.dispatchEvent( new Event( 'input' ) );
	}

	public focusInputElement(): void {
		this._getInputElement().focus();
	}

	public attachListeners(): void {
		const observer = new MutationObserver( mutationList => {
			this._lastFavoriteEmoji = Array.from( mutationList[ 0 ].addedNodes ).pop() as HTMLElement;

			this._lastFavoriteEmoji.addEventListener( 'keydown', this._lastFocusableItemListener );
			this._getInputElement().addEventListener( 'keydown', this._firstFocusableItemListener );

			observer.disconnect();
		} );

		const favoriteEmojisSection = this.emojiElement.shadowRoot!.querySelector( '.favorites.emoji-menu' )!;

		observer.observe( favoriteEmojisSection, { childList: true } );
	}

	public removeListeners(): void {
		this._lastFavoriteEmoji.removeEventListener( 'keydown', this._lastFocusableItemListener );
		this._getInputElement().removeEventListener( 'keydown', this._firstFocusableItemListener );
	}

	private _getInputElement(): HTMLInputElement {
		return this.emojiElement.shadowRoot!.querySelector( 'input#search' )!;
	}

	private _firstFocusableItemListener = ( event: Event ) => {
		const keyboardEvent = event as KeyboardEvent;

		if ( keyboardEvent.key !== 'Tab' ) {
			return;
		}

		if ( !keyboardEvent.shiftKey ) {
			return;
		}

		this._lastFavoriteEmoji.focus();

		event.preventDefault();
	};

	private _lastFocusableItemListener = ( event: Event ) => {
		const keyboardEvent = event as KeyboardEvent;

		if ( keyboardEvent.key !== 'Tab' ) {
			return;
		}

		if ( keyboardEvent.shiftKey ) {
			return;
		}

		this.focusInputElement();

		event.preventDefault();
	};
}

/**
 * Creates a (toolbar or menu bar) button for the emoji picker feature.
 */
function createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(
	emojiPicker: EmojiPicker,
	ButtonClass: T
): InstanceType<T> {
	const button = new ButtonClass( emojiPicker.editor.locale ) as InstanceType<T>;

	button.set( {
		label: emojiPicker.editor.t( 'Emoji' ),
		icon: icons.cog // TODO: update the icon when ready. See https://github.com/ckeditor/ckeditor5/issues/17378
	} );

	if ( button instanceof ButtonView ) {
		button.set( {
			tooltip: true
		} );
	}

	button.on( 'execute', () => emojiPicker.showUI() );

	return button;
}
