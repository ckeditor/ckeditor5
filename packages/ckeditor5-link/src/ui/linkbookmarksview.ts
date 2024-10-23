/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/ui/linkbookmarksview
 */

import {
	ButtonView,
	FocusCycler,
	FormHeaderView,
	View,
	ListView,
	ListItemView,
	ViewCollection,
	submitHandler,
	type FocusableView
} from 'ckeditor5/src/ui.js';

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from 'ckeditor5/src/utils.js';

import { icons } from 'ckeditor5/src/core.js';

/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkbookmarksview~LinkBookmarksView}.
 */
export default class LinkBookmarksView extends View {
	/**
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The Back button view displayed in the header.
	 */
	public backButton: ButtonView;

	// public readonly listBookmarksChildren: ViewCollection<ListView>;

	public readonly listChildren: ViewCollection<ButtonView | ListItemView>;

	/**
	 * A collection of child views.
	 */
	public children: ViewCollection;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:link/ui/linkbookmarksview~LinkBookmarksView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param linkCommand Reference to {@link module:link/linkcommand~LinkCommand}.
	 * @param validators  Form validators used by {@link #isValid}.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.backButton = this._createBackButton();
		this.listChildren = this.createCollection();

		this.children = this.createCollection( [
			this._createHeaderView()
		] );

		// Add list view to the children when the first item is added to the list.
		// This is to avoid adding the list view when the form is empty.
		this.listenTo( this.listChildren, 'add', () => {
			this.stopListening( this.listChildren, 'add' );
			this.children.add( this._createListView() );
		} );

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [ 'ck', 'ck-link__panel' ],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( {
			view: this
		} );

		// TODO: focusable list items
		const childViews = [
			// ...this._manualDecoratorSwitches,
			this.backButton
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates a view for the list at the bottom.
	 */
	private _createListView(): ListView {
		const listView = new ListView( this.locale );

		listView.extendTemplate( {
			attributes: {
				class: [
					'ck-link__items'
				]
			}
		} );

		listView.items.bindTo( this.listChildren ).using( def => {
			const listItemView = new ListItemView( this.locale );

			listItemView.children.add( def );

			return listItemView;
		} );

		return listView;
	}

	/**
	 * Creates a back button view that cancels the form.
	 */
	private _createBackButton(): ButtonView {
		const t = this.locale!.t;
		const backButton = new ButtonView( this.locale );

		backButton.set( {
			label: t( 'Cancel' ),
			icon: icons.previousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'cancel' );

		return backButton;
	}

	/**
	 * Creates a header view for the form.
	 */
	private _createHeaderView(): FormHeaderView {
		const t = this.locale!.t;

		const header = new FormHeaderView( this.locale, {
			label: t( 'Bookmarks' )
		} );

		header.children.add( this.backButton, 0 );

		return header;
	}
}

/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkBookmarksView#cancelButtonView}.
 *
 * @eventName ~LinkBookmarksView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
