/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/ui/imageinsertpanelview
 */

import { icons } from 'ckeditor5/src/core';
import { ButtonView, View, ViewCollection, submitHandler, FocusCycler } from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

import ImageInsertFormRowView from './imageinsertformrowview';

import '../../../theme/imageinsert.css';

/**
 * The insert an image via URL view controller class.
 *
 * See {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * @extends module:ui/view~View
 */
export default class ImageInsertPanelView extends View {
	/**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} [integrations] An integrations object that contains
	 * components (or tokens for components) to be shown in the panel view.
	 */
	constructor( locale, integrations ) {
		super( locale );

		const { insertButtonView, cancelButtonView } = this._createActionButtons( locale );

		/**
		 * The "insert/update" button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.insertButtonView = insertButtonView;

		/**
		 * The "cancel" button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = cancelButtonView;

		/**
		 * The value of the URL input.
		 *
		 * @member {String} #imageURLInputValue
		 * @observable
		 */
		this.set( 'imageURLInputValue', '' );

		/**
		 * Tracks information about DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
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

		/**
		 * A collection of the defined integrations for inserting the images.
		 *
		 * @private
		 * @member {module:utils/collection~Collection}
		 */
		this.set( '_integrations', new Collection() );

		if ( integrations ) {
			for ( const [ integration, integrationView ] of Object.entries( integrations ) ) {
				if ( integration === 'insertImageViaUrl' ) {
					integrationView.fieldView.bind( 'value' ).to( this, 'imageURLInputValue', value => value || '' );

					integrationView.fieldView.on( 'input', () => {
						this.imageURLInputValue = integrationView.fieldView.element.value.trim();
					} );
				}

				integrationView.name = integration;

				this._integrations.add( integrationView );
			}
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
	render() {
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
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		const stopPropagation = data => data.stopPropagation();

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
		this.listenTo( childViews[ 0 ].element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Returns a view of the integration.
	 *
	 * @param {String} name The name of the integration.
	 * @returns {module:ui/view~View}
	 */
	getIntegration( name ) {
		return this._integrations.find( integration => integration.name === name );
	}

	/**
	 * Creates the following form controls:
	 *
	 * * {@link #insertButtonView},
	 * * {@link #cancelButtonView}.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {Object.<String,module:ui/view~View>}
	 */
	_createActionButtons( locale ) {
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
	focus() {
		this._focusCycler.focusFirst();
	}
}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. by a click on {@link #insertButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. by a click on {@link #cancelButtonView}.
 *
 * @event cancel
 */
