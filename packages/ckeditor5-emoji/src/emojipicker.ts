/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojipicker
 */

import 'emoji-picker-element';

import {
	ButtonView,
	clickOutsideHandler,
	ContextualBalloon,
	View
} from 'ckeditor5/src/ui.js';

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

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
	declare private _emojiDialog: EmojiDialog;

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
		this._emojiDialog = this._createEmojiDialog();

		this.editor.ui.componentFactory.add( 'emoji', () => {
			const button = new ButtonView();

			button.set( {
				label: this.editor.t( 'Emoji' ),
				withText: true
			} );

			button.on( 'execute', () => this.showUI() );

			return button;
		} );
	}

	/**
	 * @internal
	 */
	public showUI(): void {
		this._balloon.add( {
			view: this._emojiDialog,
			position: this._getBalloonPositionData()
		} );

		this._emojiDialog.focus();
	}

	/**
	 * @internal
	 */
	private _hideUI() {
		this._balloon.remove( this._emojiDialog );

		this.editor.editing.view.focus();
	}

	/**
	 * @internal
	 */
	private _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM.
		target = () => view.domConverter.viewRangeToDom(
			viewDocument.selection.getFirstRange()!
		);

		return {
			target
		};
	}

	/**
	 * @internal
	 */
	private _createEmojiDialog() {
		const editor = this.editor;
		const emojiDialog = new EmojiDialog( editor );

		emojiDialog.emojiElement.addEventListener( 'emoji-click', event => {
			const emoji = ( event as EmojiClickEvent ).detail.unicode;

			editor.model.change( writer => {
				const insertPosition = editor.model.document.selection.getFirstPosition()!;

				writer.insertText( emoji, insertPosition );
			} );

			this._hideUI();
		} );

		emojiDialog.emojiElement.addEventListener( 'keydown', event => {
			if ( event.key === 'Escape' ) {
				this._hideUI();
			}
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: emojiDialog,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI(),
			activator: () => this._balloon.visibleView === emojiDialog
		} );

		return emojiDialog;
	}
}

class EmojiDialog extends View {
	public emojiElement: HTMLElement;

	constructor( editor: Editor ) {
		super( editor.locale );

		this.emojiElement = document.createElement( 'emoji-picker' );
		this.emojiElement.style.height = '400px';
		this.emojiElement.classList.add( 'light' );

		const emojiView = new View( editor.locale );

		emojiView.element = this.emojiElement;

		this.setTemplate( {
			tag: 'div',
			children: this.createCollection( [ emojiView ] )
		} );
	}

	public focus() {
		const inputElement = this.emojiElement.shadowRoot!.querySelector<HTMLElement>( 'input#search' )!;

		inputElement.focus();
	}
}
