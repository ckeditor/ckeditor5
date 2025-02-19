/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/ui/linkpropertiesview
 */

import {
	ButtonView,
	FocusCycler,
	FormHeaderView,
	View,
	ViewCollection,
	ListView,
	ListItemView,
	type SwitchButtonView,
	type FocusableView
} from 'ckeditor5/src/ui.js';
import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';

import '../../theme/linkproperties.css';

/**
 * The link properties view controller class.
 *
 * See {@link module:link/ui/linkpropertiesview~LinkPropertiesView}.
 */
export default class LinkPropertiesView extends View {
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
	public backButtonView: ButtonView;

	/**
	 * A collection of child views.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
	 * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
	 * configured in the editor.
	 */
	public readonly listChildren: ViewCollection<SwitchButtonView>;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:link/ui/linkpropertiesview~LinkPropertiesView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.backButtonView = this._createBackButton();
		this.listChildren = this.createCollection();

		this.children = this.createCollection( [
			this._createHeaderView(),
			this._createListView()
		] );

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
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-link-properties'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: this.children
		} );

		// Close the panel on esc key press when the **form has focus**.
		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<BackEvent>( 'back' );
			cancel();
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const childViews = [
			...this.listChildren,
			this.backButtonView
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
	 * Creates a back button view.
	 */
	private _createBackButton(): ButtonView {
		const t = this.locale!.t;
		const backButton = new ButtonView( this.locale );

		// TODO: maybe we should have a dedicated BackButtonView in the UI library.
		backButton.set( {
			class: 'ck-button-back',
			label: t( 'Back' ),
			icon: IconPreviousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'back' );

		return backButton;
	}

	/**
	 * Creates a header view for the form.
	 */
	private _createHeaderView(): FormHeaderView {
		const t = this.locale!.t;

		const header = new FormHeaderView( this.locale, {
			label: t( 'Link properties' )
		} );

		header.children.add( this.backButtonView, 0 );

		return header;
	}

	/**
	 * Creates a form view that displays the {@link #listChildren} collection.
	 */
	private _createListView(): ListView {
		const listView = new ListView( this.locale );

		listView.extendTemplate( {
			attributes: {
				class: [
					'ck-link__list'
				]
			}
		} );

		listView.items.bindTo( this.listChildren ).using( item => {
			const listItemView = new ListItemView( this.locale );

			listItemView.children.add( item );

			return listItemView;
		} );

		return listView;
	}
}

/**
 * Fired when the {@link ~LinkPropertiesView#backButtonView} is pressed.
 *
 * @eventName ~LinkPropertiesView#back
 */
export type BackEvent = {
	name: 'back';
	args: [];
};
