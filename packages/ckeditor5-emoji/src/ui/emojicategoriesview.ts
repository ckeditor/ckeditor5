/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojicategoriesview
 */

import '../../theme/emojicategories.css';

import { ButtonView, View, ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { EmojiGroup } from '../emojipicker.js';

const ACTIVE_CATEGORY_CLASS = 'ck-active-category';

/**
 * A class representing the navigation part of the emoji UI.
 * It is responsible allowing the user to select a particular emoji category.
 */
export default class EmojiCategoriesView extends View {
	/**
	 * Currently selected emoji category name.
	 */
	declare public currentCategoryName: string;

	/**
	 * Tracks information about the DOM focus in the grid.
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	private readonly _keystrokeHandler: KeystrokeHandler;

	private _buttonViews: ViewCollection<ButtonView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, emojiGroups: Array<EmojiGroup>, categoryName: string ) {
		super( locale );

		this.set( 'currentCategoryName', categoryName );

		this._buttonViews = new ViewCollection( emojiGroups.map( emojiGroup => {
			const buttonView = new ButtonView();

			buttonView.tooltip = emojiGroup.title;
			buttonView.label = emojiGroup.exampleEmoji;
			buttonView.withText = true;

			return buttonView;
		} ) );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-categories' ]
			},
			children: this._buttonViews
		} );

		this._focusTracker = new FocusTracker();
		this._keystrokeHandler = new KeystrokeHandler();

		this._keystrokeHandler.set( 'arrowleft', () => {
			const previousSibling = this._focusTracker.focusedElement?.previousElementSibling;

			if ( previousSibling ) {
				( previousSibling as HTMLButtonElement ).focus();
			} else {
				this._buttonViews.last!.focus();
			}
		} );

		this._keystrokeHandler.set( 'arrowright', () => {
			const nextSibling = this._focusTracker.focusedElement?.nextElementSibling;

			if ( nextSibling ) {
				( nextSibling as HTMLButtonElement ).focus();
			} else {
				this._buttonViews.first!.focus();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this._setupButtons();

		this._keystrokeHandler.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this._buttonViews.first!.focus();
	}

	public enableCategories(): void {
		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = true;
		} );
	}

	public disableCategories(): void {
		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = false;
		} );
	}

	private _setupButtons(): void {
		this._buttonViews.forEach( buttonView => {
			this._focusTracker.add( buttonView );

			if ( buttonView.tooltip === this.currentCategoryName ) {
				buttonView.element!.classList.add( ACTIVE_CATEGORY_CLASS );
			}

			buttonView.element!.addEventListener( 'click', event => {
				this.currentCategoryName = buttonView.tooltip as string;

				this._buttonViews.forEach( buttonViewInnerLoop => {
					buttonViewInnerLoop.element!.classList.remove( ACTIVE_CATEGORY_CLASS );
				} );

				let eventTarget = ( event.target as HTMLElement );

				if ( eventTarget.nodeName === 'SPAN' ) {
					eventTarget = eventTarget.parentElement!;
				}

				if ( buttonView.tooltip === eventTarget.dataset.ckeTooltipText ) {
					buttonView.element!.classList.add( ACTIVE_CATEGORY_CLASS );
				}
			} );
		} );
	}
}
