/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/ui/imageinsertpanelview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import ImageInsertFormRowView from './imageinsertformrowview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

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
		 * The dropdown view.
		 *
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this.dropdownView = this._createDropdownView( locale );

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
	 * Returns a view of the integration.
	 *
	 * @param {String} name The name of the integration.
	 * @returns {module:ui/view~View}
	 */
	getIntegration( name ) {
		return this._integrations.find( integration => integration.name === name );
	}

	/**
	 * Creates the dropdown view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createDropdownView( locale ) {
		const t = locale.t;
		const dropdownView = createDropdown( locale, SplitButtonView );
		const splitButtonView = dropdownView.buttonView;
		const panelView = dropdownView.panelView;

		splitButtonView.set( {
			label: t( 'Insert image' ),
			icon: imageIcon,
			tooltip: true
		} );

		panelView.extendTemplate( {
			attributes: {
				class: 'ck-image-insert__panel'
			}
		} );

		return dropdownView;
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
			icon: checkIcon,
			class: 'ck-button-save',
			type: 'submit',
			withText: true,
			isEnabled: this.imageURLInputValue
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: cancelIcon,
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
