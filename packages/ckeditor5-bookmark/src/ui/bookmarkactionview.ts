/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/ui/linkactionsview
 */

import { ButtonView, View, ViewCollection, FocusCycler, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type LocaleTranslate, type Locale } from 'ckeditor5/src/utils.js';
import { icons } from 'ckeditor5/src/core.js';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/bookmark.css';

/**
 * The bookmark actions view class. This view displays the bookmark preview, allows
 * removing or editing the bookmark.
 */
export default class BookmarkActionView extends View {
	/**
	 * Tracks information about DOM focus in the actions.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The bookmark preview view.
	 */
	public bookmarkPreviewView: ButtonView;

	/**
	 * The remove button view.
	 */
	public removeButtonView: ButtonView;

	/**
	 * The edit bookmark button view.
	 */
	public editButtonView: ButtonView;

	/**
	 * The id preview view.
	 */
	declare public id: string;

	/**
	 * A collection of views that can be focused in the view.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the view.
	 */
	private readonly _focusCycler: FocusCycler;

	declare public t: LocaleTranslate;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const t = locale.t;

		this.bookmarkPreviewView = this._createBookmarkPreviewView();
		this.removeButtonView = this._createButton( t( 'Remove' ), icons.remove, 'remove' );
		this.editButtonView = this._createButton( t( 'Edit link' ), icons.pencil, 'edit' );

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-bookmark-actions',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: [
				this.bookmarkPreviewView,
				this.editButtonView,
				this.removeButtonView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const childViews = [
			this.bookmarkPreviewView,
			this.editButtonView,
			this.removeButtonView
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
	 * Focuses the fist {@link #_focusables} in the actions.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates a button view.
	 *
	 * @param label The button label.
	 * @param icon The button icon.
	 * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, eventName?: string ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.delegate( 'execute' ).to( this, eventName );

		return button;
	}

	/**
	 * Creates a bookmark name preview button.
	 *
	 * @returns The button view instance.
	 */
	private _createBookmarkPreviewView(): ButtonView {
		const button = new ButtonView( this.locale );
		const t = this.t;

		button.set( {
			withText: true,
			tooltip: t( 'Bookmark name' )
		} );

		button.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-bookmark-actions__preview'
				]
			}
		} );

		button.bind( 'label' ).to( this, 'id', id => {
			return id;
		} );

		return button;
	}
}
