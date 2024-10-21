/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/ui/linkadvancedview
 */

import {
	ButtonView,
	FocusCycler,
	SwitchButtonView,
	FormHeaderView,
	View,
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

import type LinkCommand from '../linkcommand.js';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkform.css'; // TODO: Split into more granular stylesheets?

/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkadvancedview~LinkAdvancedView}.
 */
export default class LinkAdvancedView extends View {
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

	/**
	 * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
	 * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
	 * configured in the editor.
	 */
	private readonly _manualDecoratorSwitches: ViewCollection<SwitchButtonView>;

	/**
	 * A collection of child views.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:link/ui/linkadvancedview~LinkAdvancedView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param linkCommand Reference to {@link module:link/linkcommand~LinkCommand}.
	 * @param validators  Form validators used by {@link #isValid}.
	 */
	constructor(
		locale: Locale,
		linkCommand: LinkCommand
	) {
		super( locale );

		this.backButton = this._createBackButton();
		this._manualDecoratorSwitches = this._createManualDecoratorSwitches( linkCommand );

		this.children = this.createCollection( [
			this._createHeaderView(),
			this._createFormView()
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
	 * Obtains the state of the {@link module:ui/button/switchbuttonview~SwitchButtonView switch buttons} representing
	 * {@link module:link/linkcommand~LinkCommand#manualDecorators manual link decorators}
	 * in the {@link module:link/ui/linkadvancedview~LinkAdvancedView}.
	 *
	 * @returns Key-value pairs, where the key is the name of the decorator and the value is its state.
	 */
	public getDecoratorSwitchesState(): Record<string, boolean> {
		return Array
			.from( this._manualDecoratorSwitches as Iterable<SwitchButtonView & { name: string }> )
			.reduce( ( accumulator, switchButton ) => {
				accumulator[ switchButton.name ] = switchButton.isOn;
				return accumulator;
			}, {} as Record<string, boolean> );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			...this._manualDecoratorSwitches,
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
			label: t( 'Link' )
		} );

		header.children.add( this.backButton, 0 );

		return header;
	}

	/**
	 * Creates a form view for the link form.
	 */
	private _createFormView(): View {
		const form = new View( this.locale );

		form.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-link__form',
					'ck-responsive-form'
				]
			},

			children: this._createFormChildren()
		} );

		return form;
	}

	/**
	 * Populates {@link module:ui/viewcollection~ViewCollection} of {@link module:ui/button/switchbuttonview~SwitchButtonView}
	 * made based on {@link module:link/linkcommand~LinkCommand#manualDecorators}.
	 *
	 * @param linkCommand A reference to the link command.
	 * @returns ViewCollection of switch buttons.
	 */
	private _createManualDecoratorSwitches( linkCommand: LinkCommand ): ViewCollection<SwitchButtonView> {
		const switches = this.createCollection<SwitchButtonView>();

		for ( const manualDecorator of linkCommand.manualDecorators ) {
			const switchButton: SwitchButtonView & { name?: string } = new SwitchButtonView( this.locale );

			switchButton.set( {
				name: manualDecorator.id,
				label: manualDecorator.label,
				withText: true
			} );

			switchButton.bind( 'isOn' ).toMany( [ manualDecorator, linkCommand ], 'value', ( decoratorValue, commandValue ) => {
				return commandValue === undefined && decoratorValue === undefined ? !!manualDecorator.defaultValue : !!decoratorValue;
			} );

			switchButton.on( 'execute', () => {
				manualDecorator.set( 'value', !switchButton.isOn );
			} );

			switches.add( switchButton );
		}

		return switches;
	}

	/**
	 * Populates the {@link #children} collection of the form.
	 *
	 * If {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators} are configured in the editor, it creates an
	 * additional `View` wrapping all {@link #_manualDecoratorSwitches} switch buttons corresponding
	 * to these decorators.
	 *
	 * @param manualDecorators A reference to
	 * the collection of manual decorators stored in the link command.
	 * @returns The children of link form view.
	 */
	private _createFormChildren(): ViewCollection {
		const children = this.createCollection();

		if ( this._manualDecoratorSwitches.length ) {
			const additionalButtonsView = new View();

			additionalButtonsView.setTemplate( {
				tag: 'ul',
				// TODO: Change to ListView
				children: this._manualDecoratorSwitches.map( switchButton => ( {
					tag: 'li',
					children: [ switchButton ],
					attributes: {
						class: [
							'ck',
							'ck-list__item'
						]
					}
				} ) ),
				attributes: {
					class: [
						'ck',
						'ck-reset',
						'ck-list'
					]
				}
			} );
			children.add( additionalButtonsView );
		}

		return children;
	}
}

/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkAdvancedView#cancelButtonView}.
 *
 * @eventName ~LinkAdvancedView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
