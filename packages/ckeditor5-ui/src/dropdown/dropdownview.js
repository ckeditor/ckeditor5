/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/dropdownview
 */

import View from '../view';
import Template from '../template';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * The dropdown view class.
 *
 * @extends module:ui/view~View
 */
export default class DropdownView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, buttonView, panelView ) {
		super( locale );

		// Extend button's template before it's registered as a child of the dropdown because
		// by doing so, its #element is rendered and any post–render template extension will
		// not be reflected in DOM.
		Template.extend( buttonView.template, {
			attributes: {
				class: [
					'ck-dropdown__button'
				]
			}
		} );

		/**
		 * Button of this dropdown view.
		 *
		 * @readonly
		 * @member {ui.button.ButtonView} #buttonView
		 */
		this.buttonView = buttonView;

		/**
		 * Panel of this dropdown view.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownpanelview~DropdownPanelView} #panelView
		 */
		this.panelView = panelView;

		/**
		 * Controls whether the dropdown view is open, which also means its
		 * {@link #panelView panel} is visible.
		 *
		 * @observable
		 * @member {Boolean} #isOpen
		 */
		this.set( 'isOpen', false );

		/**
		 * Tracks information about DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.template = new Template( {
			tag: 'div',

			attributes: {
				class: [
					'ck-dropdown'
				]
			},

			children: [
				buttonView,
				panelView
			]
		} );

		// Toggle the the dropdown when it's button has been clicked.
		this.listenTo( buttonView, 'execute', () => {
			this.isOpen = !this.isOpen;
		} );

		// Toggle the visibility of the panel when the dropdown becomes open.
		panelView.bind( 'isVisible' ).to( this, 'isOpen' );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element );

		// Register #element in the focus tracker.
		this.focusTracker.add( this.element );

		const closeDropdown = ( data, cancel ) => {
			if ( this.isOpen ) {
				this.buttonView.focus();
				this.isOpen = false;
				cancel();
			}
		};

		// Open the dropdown panel using the arrow down key, just like with return or space.
		this.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			// Don't open if the dropdown is disabled or already open.
			if ( this.buttonView.isEnabled && !this.isOpen ) {
				this.isOpen = true;
				cancel();
			}
		} );

		// Block the right arrow key (until nested dropdowns are implemented).
		this.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( this.isOpen ) {
				cancel();
			}
		} );

		// Close the dropdown using the arrow left/escape key.
		this.keystrokes.set( 'arrowleft', closeDropdown );
		this.keystrokes.set( 'esc', closeDropdown );

		super.init();
	}

	/**
	 * Focuses the {@link #buttonView}.
	 */
	focus() {
		this.buttonView.focus();
	}
}
