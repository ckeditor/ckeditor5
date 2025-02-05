/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojicategoriesview
 */

import { ButtonView, View, FocusCycler, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale, type ObservableChangeEvent } from 'ckeditor5/src/utils.js';
import type { EmojiCategory } from '../emojirepository.js';

import '../../theme/emojicategories.css';

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
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Helps cycling over focusable children in the input view.
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * A collection of the categories buttons.
	 */
	public readonly buttonViews: ViewCollection<ButtonView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { emojiCategories, categoryName }: { emojiCategories: Array<EmojiCategory>; categoryName: string } ) {
		super( locale );

		this.buttonViews = this.createCollection(
			emojiCategories.map( emojiCategory => this._createCategoryButton( emojiCategory ) )
		);

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.focusCycler = new FocusCycler( {
			focusables: this.buttonViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'arrowleft',
				focusNext: 'arrowright'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji__categories-list' ],
				role: 'tablist'
			},
			children: this.buttonViews
		} );

		this.on<ObservableChangeEvent<string>>( 'change:categoryName', ( event, name, newValue, oldValue ) => {
			const oldCategoryButton = this.buttonViews.find( button => button.tooltip === oldValue );

			if ( oldCategoryButton ) {
				oldCategoryButton.isOn = false;
			}

			const newCategoryButton = this.buttonViews.find( button => button.tooltip === newValue )!;
			newCategoryButton.isOn = true;
		} );

		this.set( 'categoryName', categoryName );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.buttonViews.forEach( buttonView => {
			this.focusTracker.add( buttonView );
		} );

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
		this.buttonViews.destroy();
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.buttonViews.first!.focus();
	}

	/**
	 * Marks all categories buttons as enabled (clickable).
	 */
	public enableCategories(): void {
		this.buttonViews.forEach( buttonView => {
			buttonView.isEnabled = true;
		} );
	}

	/**
	 * Marks all categories buttons as disabled (non-clickable).
	 */
	public disableCategories(): void {
		this.buttonViews.forEach( buttonView => {
			buttonView.set( {
				class: '',
				isEnabled: false,
				isOn: false
			} );
		} );
	}

	/**
	 * Creates a button representing a category item.
	 */
	private _createCategoryButton( emojiCategory: EmojiCategory ): ButtonView {
		const buttonView = new ButtonView();
		const bind = buttonView.bindTemplate;

		// A `[role="tab"]` element requires also the `[aria-selected]` attribute with its state.
		buttonView.extendTemplate( {
			attributes: {
				'aria-selected': bind.to( 'isOn', value => value.toString() ),
				class: [
					'ck-emoji__category-item'
				]
			}
		} );

		buttonView.set( {
			ariaLabel: emojiCategory.title,
			label: emojiCategory.icon,
			role: 'tab',
			tooltip: emojiCategory.title,
			withText: true,
			// To improve accessibility, disconnect a button and its label connection so that screen
			// readers can read the `[aria-label]` attribute directly from the more descriptive button.
			ariaLabelledBy: undefined
		} );

		buttonView.on( 'execute', () => {
			this.categoryName = emojiCategory.title;
		} );

		buttonView.on<ObservableChangeEvent<boolean>>( 'change:isEnabled', () => {
			if ( buttonView.isEnabled && buttonView.tooltip === this.categoryName ) {
				buttonView.isOn = true;
			}
		} );

		return buttonView;
	}
}
