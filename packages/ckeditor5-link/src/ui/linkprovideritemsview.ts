/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/ui/linkprovideritemsview
 */

import {
	ButtonView,
	FocusCycler,
	FormHeaderView,
	View,
	ListView,
	ListItemView,
	ViewCollection,
	type FocusableView
} from 'ckeditor5/src/ui.js';

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from 'ckeditor5/src/utils.js';

import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';

import '../../theme/linkprovideritems.css';

/**
 * The link provider items view.
 */
export default class LinkProviderItemsView extends View {
	/**
	 * Tracks information about the list of links.
	 *
	 * @observable
	 */
	declare public hasItems: boolean;

	/**
	 * The header label of the view.
	 *
	 * @observable
	 */
	declare public title: string;

	/**
	 * The text displayed when no links are available.
	 *
	 * @observable
	 */
	declare public emptyListPlaceholder: string;

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
	 * The List view of links buttons.
	 */
	public listView: ListView;

	/**
	 * The collection of child views, which is bind with the `listView`.
	 */
	public readonly listChildren: ViewCollection<ButtonView>;

	/**
	 * The view displayed when the list is empty.
	 */
	public emptyListInformation: View;

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
	 * Creates an instance of the {@link module:link/ui/linkprovideritemsview~LinkProviderItemsView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.listChildren = this.createCollection();

		this.backButtonView = this._createBackButton();
		this.listView = this._createListView();
		this.emptyListInformation = this._createEmptyLinksListItemView();

		this.children = this.createCollection( [
			this._createHeaderView(),
			this.emptyListInformation
		] );

		this.set( 'title', '' );
		this.set( 'emptyListPlaceholder', '' );
		this.set( 'hasItems', false );

		this.listenTo( this.listChildren, 'change', () => {
			this.hasItems = this.listChildren.length > 0;
		} );

		this.on( 'change:hasItems', ( evt, propName, hasItems ) => {
			if ( hasItems ) {
				this.children.remove( this.emptyListInformation );
				this.children.add( this.listView );
			} else {
				this.children.remove( this.listView );
				this.children.add( this.emptyListInformation );
			}
		} );

		// Close the panel on esc key press when the **form has focus**.
		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<CancelEvent>( 'cancel' );
			cancel();
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
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-link-providers'
				],

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

		const childViews = [
			this.listView,
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
	 * Creates a view for the list at the bottom.
	 */
	private _createListView(): ListView {
		const listView = new ListView( this.locale );

		listView.extendTemplate( {
			attributes: {
				class: [
					'ck-link-providers__list'
				]
			}
		} );

		listView.items.bindTo( this.listChildren ).using( button => {
			const listItemView = new ListItemView( this.locale );

			listItemView.children.add( button );

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
			class: 'ck-button-back',
			label: t( 'Back' ),
			icon: IconPreviousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'cancel' );

		return backButton;
	}

	/**
	 * Creates a header view for the form.
	 */
	private _createHeaderView(): FormHeaderView {
		const header = new FormHeaderView( this.locale );

		header.bind( 'label' ).to( this, 'title' );
		header.children.add( this.backButtonView, 0 );

		return header;
	}

	/**
	 * Creates an info view for an empty list.
	 */
	private _createEmptyLinksListItemView(): View {
		const view = new View( this.locale );

		view.setTemplate( {
			tag: 'p',
			attributes: {
				class: [ 'ck', 'ck-link__empty-list-info' ]
			},
			children: [
				{
					text: this.bindTemplate.to( 'emptyListPlaceholder' )
				}
			]
		} );

		return view;
	}
}

/**
 * Fired when the links view is canceled, for example with a click on {@link ~LinkProviderItemsView#backButtonView}.
 *
 * @eventName ~LinkProviderItemsView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
