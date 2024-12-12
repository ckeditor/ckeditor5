/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/ui/specialcharacterscategoriesview
 */

import '../../theme/emojicategories.css';

const ACTIVE_CATEGORY_CLASS = 'ck-active-category';

import {
	KeystrokeHandler,
	FocusTracker,
	type Locale
} from 'ckeditor5/src/utils.js';

import {
	ButtonView,
	View,
	ViewCollection
} from 'ckeditor5/src/ui.js';
import type { EmojiGroup } from '../emojipicker.js';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 */
export default class EmojiCategoriesView extends View {
	/**
	 * Currently selected special characters group's name.
	 */
	declare public currentGroupName: string;

	private _groupNames: Array<string>;

	private _buttonViews: ViewCollection<ButtonView>;

	/**
	 * Tracks information about the DOM focus in the grid.
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	private readonly _keystrokeHandler: KeystrokeHandler;

	private _areCategoriesEnabled: boolean;

	/**
	 * Creates an instance of the {@link module:emoji/ui/specialcharacterscategoriesview~EmojiCategoriesView}
	 * class.
	 *
	 * @param locale The localization services instance.
	 * @param groupNames The names of the character groups.
	 */
	constructor( locale: Locale, emojiGroups: Array<EmojiGroup> ) {
		super( locale );

		this._areCategoriesEnabled = true;

		this._groupNames = emojiGroups.map( emojiGroup => emojiGroup.title );
		this.set( 'currentGroupName', this._groupNames[ 0 ] );

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
				class: [ 'ck', 'ck-character-categories' ]
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
		if ( this._areCategoriesEnabled ) {
			return;
		}

		this._areCategoriesEnabled = true;

		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = true;
		} );
	}

	public disableCategories(): void {
		if ( !this._areCategoriesEnabled ) {
			return;
		}

		this._areCategoriesEnabled = false;

		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = false;
		} );
	}

	private _setupButtons(): void {
		this._buttonViews.forEach( buttonView => {
			this._focusTracker.add( buttonView );

			if ( buttonView.tooltip === this.currentGroupName ) {
				buttonView.element!.classList.add( ACTIVE_CATEGORY_CLASS );
			}

			buttonView.element!.addEventListener( 'click', event => {
				this.currentGroupName = buttonView.tooltip as string;

				this._buttonViews.forEach( buttonViewInnerLoop => {
					buttonViewInnerLoop.element!.classList.remove( ACTIVE_CATEGORY_CLASS );
				} );

				const clickedButtonTooltip = ( event.target as HTMLElement ).dataset.ckeTooltipText;

				if ( buttonView.tooltip === clickedButtonTooltip ) {
					buttonView.element!.classList.add( ACTIVE_CATEGORY_CLASS );
				}
			} );
		} );
	}
}
