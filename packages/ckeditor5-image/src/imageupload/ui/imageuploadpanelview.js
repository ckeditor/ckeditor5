/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/ui/imageuploadpanelview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import ImageUploadFormRowView from './imageuploadformrowview';

import { createLabeledInputText } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';
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

import '../../../theme/imageupload.css';

export default class ImageUploadPanelView extends View {
	/**
	 * Creates a view for the dropdown panel of {@link module:image/imageupload/imageuploadui~ImageUploadUI}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} [options] Options for the panel view.
	 * @param {Object} [options.integrations={insertImageViaUrl:'insertImageViaUrl'}] Integrations object that contain
	 * components (or tokens for components) to be shown in the panel view. By default it has `insertImageViaUrl` view.
	 */
	constructor( locale, options = { integrations: { insertImageViaUrl: 'insertImageViaUrl' } } ) {
		super( locale );

		/**
		 * The labeled URL input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.labeledInputView = this._createLabeledInputView( locale );

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
		 * Value of the URL input.
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
		 * Collection of the defined integrations for inserting the images.
		 *
		 * @private
		 * @member {module:utils/collection~Collection}
		 */
		this.set( '_integrations', new Collection() );

		for ( const integration of Object.values( options.integrations ) ) {
			if ( integration === 'insertImageViaUrl' ) {
				this._integrations.add( this.labeledInputView );

				continue;
			}

			this._integrations.add( integration );
		}

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-image-upload-form'
				],

				tabindex: '-1'
			},

			children: [
				...this._integrations,
				new ImageUploadFormRowView( locale, {
					children: [
						this.insertButtonView,
						this.cancelButtonView
					],
					class: 'ck-image-upload-form__action-row'
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
			this.labeledInputView,
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
		this.listenTo( this.labeledInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * Creates labeled field view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
	 */
	_createLabeledInputView( locale ) {
		const t = locale.t;
		const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

		labeledInputView.set( {
			label: t( 'Insert image via URL' )
		} );
		labeledInputView.fieldView.placeholder = t( 'https://example.com/src/image.png' );
		labeledInputView.infoText = t( 'Paste the image source URL' );
		labeledInputView.fieldView.bind( 'value' ).to( this, 'imageURLInputValue', value => value || '' );

		labeledInputView.fieldView.on( 'input', () => {
			this.imageURLInputValue = labeledInputView.fieldView.element.value;
		} );

		return labeledInputView;
	}

	/**
	 * Creates dropdown view.
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
				class: 'ck-image-upload__panel'
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

		insertButtonView.bind( 'isEnabled' ).to( this, 'imageURLInputValue' );
		insertButtonView.delegate( 'execute' ).to( this, 'submit' );
		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return { insertButtonView, cancelButtonView };
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}
}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. click on {@link #insertButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. click on {@link #cancelButtonView}.
 *
 * @event cancel
 */
