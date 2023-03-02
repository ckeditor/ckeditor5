/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/ui/imageinsertpanelview
 */

import { icons } from 'ckeditor5/src/core';
import { ButtonView, View, ViewCollection, submitHandler, FocusCycler, type InputTextView, type LabeledFieldView } from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';

import ImageInsertFormRowView from './imageinsertformrowview';

import '../../../theme/imageinsert.css';

export type ViewWithName = View & { name: string };

/**
 * The insert an image via URL view controller class.
 *
 * See {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 */
export default class ImageInsertPanelView extends View {
	/**
	 * The "insert/update" button view.
	 */
	public insertButtonView: ButtonView;

	/**
	 * The "cancel" button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * The value of the URL input.
	 *
	 * @observable
	 */
	declare public imageURLInputValue: string;

	/**
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of views that can be focused in the form.
	 */
	protected readonly _focusables: ViewCollection;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * A collection of the defined integrations for inserting the images.
	 *
	 * @private
	 */
	declare public _integrations: Collection<ViewWithName>;

	/**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param locale The localization services instance.
	 * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
	 */
	constructor( locale: Locale, integrations: Record<string, View> = {} ) {
		super( locale );

		const { insertButtonView, cancelButtonView } = this._createActionButtons( locale );

		this.insertButtonView = insertButtonView;

		this.cancelButtonView = cancelButtonView;

		this.set( 'imageURLInputValue', '' );

		this.focusTracker = new FocusTracker();

		this.keystrokes = new KeystrokeHandler();

		this._focusables = new ViewCollection();

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

		this.set( '_integrations', new Collection<ViewWithName>() );

		for ( const [ integration, integrationView ] of Object.entries( integrations ) ) {
			if ( integration === 'insertImageViaUrl' ) {
				( integrationView as LabeledFieldView<InputTextView> ).fieldView
					.bind( 'value' ).to( this, 'imageURLInputValue', ( value: string ) => value || '' );

				( integrationView as LabeledFieldView<InputTextView> ).fieldView.on( 'input', () => {
					this.imageURLInputValue = ( integrationView as LabeledFieldView<InputTextView> ).fieldView.element!.value.trim();
				} );
			}

			( integrationView as ViewWithName ).name = integration;

			this._integrations.add( integrationView as ViewWithName );
		}

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-image-insert-form'
				],

				tabindex: '-1'
			},

			children: [
				...this._integrations,
				new ImageInsertFormRowView( locale, {
					children: [
						this.insertButtonView,
						this.cancelButtonView
					],
					class: 'ck-image-insert-form__action-row'
				} )
			]
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

		const childViews = [
			...this._integrations,
			this.insertButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );

		const stopPropagation = ( data: KeyboardEvent ) => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the "selectstart" event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		// TODO: blocking "selectstart" in the #panelView should be configurable per–drop–down instance.
		this.listenTo( childViews[ 0 ].element!, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
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
	 * Returns a view of the integration.
	 *
	 * @param name The name of the integration.
	 */
	public getIntegration( name: string ): View {
		return this._integrations.find( integration => integration.name === name )!;
	}

	/**
	 * Creates the following form controls:
	 *
	 * * {@link #insertButtonView},
	 * * {@link #cancelButtonView}.
	 *
	 * @param locale The localization services instance.
	 */
	private _createActionButtons( locale: Locale ): { insertButtonView: ButtonView; cancelButtonView: ButtonView } {
		const t = locale.t;
		const insertButtonView = new ButtonView( locale );
		const cancelButtonView = new ButtonView( locale );

		insertButtonView.set( {
			label: t( 'Insert' ),
			icon: icons.check,
			class: 'ck-button-save',
			type: 'submit',
			withText: true,
			isEnabled: this.imageURLInputValue
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: icons.cancel,
			class: 'ck-button-cancel',
			withText: true
		} );

		insertButtonView.bind( 'isEnabled' ).to( this, 'imageURLInputValue', value => !!value );
		insertButtonView.delegate( 'execute' ).to( this, 'submit' );
		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return { insertButtonView, cancelButtonView };
	}

	/**
	 * Focuses the first {@link #_focusables focusable} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}
}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. by a click on {@link ~ImageInsertPanelView#insertButtonView}.
 *
 * @eventName ~ImageInsertPanelView#submit
 */
export type SubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled, e.g. by a click on {@link ~ImageInsertPanelView#cancelButtonView}.
 *
 * @eventName ~ImageInsertPanelView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
