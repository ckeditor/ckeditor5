/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojicategoriesview
 */

import '../../theme/emojicategories.css';

import { ButtonView, View, ViewCollection, FocusCycler } from 'ckeditor5/src/ui.js';
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
	declare public categoryName: string;

	/**
	 * Tracks information about the DOM focus in the grid.
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	private readonly _keystrokeHandler: KeystrokeHandler;

	/**
	 * TODO: Fill it up.
	 */
	private readonly _buttonViews: ViewCollection<ButtonView>;

	private readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, emojiGroups: Array<EmojiGroup>, categoryName: string ) {
		super( locale );

		this._buttonViews = new ViewCollection(
			this._createCategoryButtons( emojiGroups )
		);

		this._focusTracker = new FocusTracker();
		this._keystrokeHandler = new KeystrokeHandler();
		this._focusCycler = new FocusCycler( {
			focusables: this._buttonViews,
			focusTracker: this._focusTracker,
			keystrokeHandler: this._keystrokeHandler,
			actions: {
				focusPrevious: 'arrowleft',
				focusNext: 'arrowright'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-categories' ]
			},
			children: this._buttonViews
		} );

		this.on( 'change:categoryName', ( event, name, newValue, oldValue ) => {
			const previousButton = this._buttonViews.find( button => button.tooltip === oldValue )!;
			const newButton = this._buttonViews.find( button => button.tooltip === newValue )!;

			if ( previousButton ) {
				previousButton.class = '';
			}

			newButton.class = ACTIVE_CATEGORY_CLASS;
		} );

		this.set( 'categoryName', categoryName );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this._buttonViews.forEach( buttonView => {
			this._focusTracker.add( buttonView );
		} );

		this._keystrokeHandler.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._focusTracker.destroy();
		this._keystrokeHandler.destroy();
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this._buttonViews.first!.focus();
	}

	/**
	 * Marks all categories buttons as enabled (clickable).
	 */
	public enableCategories(): void {
		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = true;
		} );
	}

	/**
	 * Marks all categories buttons as disabled (non-clickable).
	 */
	public disableCategories(): void {
		this._buttonViews.forEach( buttonView => {
			buttonView.isEnabled = false;
		} );
	}

	private _createCategoryButtons( emojiGroups: Array<EmojiGroup> ) {
		return emojiGroups.map( emojiGroup => {
			const buttonView = new ButtonView();

			buttonView.tooltip = emojiGroup.title;
			buttonView.label = emojiGroup.icon;
			buttonView.withText = true;

			buttonView.on( 'execute', event => {
				if ( !buttonView.isEnabled ) {
					event.stop();

					return;
				}

				this.categoryName = buttonView.tooltip as string;
			} );

			buttonView.on( 'change:isEnabled', ( event, name, oldValue, newValue ) => {
				if ( newValue ) {
					buttonView.class = '';
				} else if ( buttonView.tooltip === this.categoryName ) {
					buttonView.class = ACTIVE_CATEGORY_CLASS;
				}
			} );

			return buttonView;
		} );
	}
}
