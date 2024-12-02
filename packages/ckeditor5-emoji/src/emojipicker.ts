/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojipicker
 */

import { Picker } from 'emoji-picker-element';

import {
	clickOutsideHandler,
	ContextualBalloon,
	View,
	ButtonView,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';

import { icons, Plugin, type Editor } from 'ckeditor5/src/core.js';
import EmojiLibraryIntegration from './emojilibraryintegration.js';

import '../theme/emojipicker.css';
import { getEmojiButtonCreator } from './utils.js';

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
		return [ EmojiLibraryIntegration, ContextualBalloon ] as const;
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

		const createButton = getEmojiButtonCreator( {
			editor: this.editor,
			icon: icons.cog, // TODO: update the icon when ready. See https://github.com/ckeditor/ckeditor5/issues/17378
			label: this.editor.t( 'Emoji' ),
			callback: () => this.showUI()
		} );

		this.editor.ui.componentFactory.add( 'emoji', () => createButton( ButtonView ) );
		this.editor.ui.componentFactory.add( 'menuBar:emoji', () => createButton( MenuBarMenuListItemButtonView ) );
	}

	/**
	 * @internal
	 */
	public showUI( initialSearchValue?: string ): void {
		this._balloon.add( {
			view: this._emojiView,
			position: this._getBalloonPositionData()
		} );

		this._emojiView.focus();

		if ( initialSearchValue ) {
			this._emojiView.updateSearchValue( initialSearchValue );
		}
	}

	/**
	 * @internal
	 */
	private _hideUI() {
		this._balloon.remove( this._emojiView );

		this.editor.editing.view.focus();
	}

	/**
	 * @internal
	 */
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
	 * @internal
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

		// Close the dialog while focus is in the editor.
		editor.keystrokes.set( 'Esc', () => {
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

	private _getInputElement(): HTMLInputElement {
		return this.emojiElement.shadowRoot!.querySelector( 'input#search' )!;
	}

	public updateSearchValue( newValue: string ): void {
		const inputElement = this._getInputElement();

		inputElement.value = newValue;
		inputElement.dispatchEvent( new Event( 'input' ) );
	}

	public focus(): void {
		this._getInputElement().focus();
	}
}
