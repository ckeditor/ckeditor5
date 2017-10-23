/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/dropdownview
 */

import View from '../view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * The dropdown view class.
 *
 *		const button = new ButtonView( locale );
 *		const panel = new DropdownPanelView( locale );
 *		const dropdown = new DropdownView( locale, button, panel );
 *
 *		panel.element.textContent = 'Content of the panel';
 *		button.set( {
 *			label: 'A dropdown',
 *			withText: true
 *		} );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown with a panel containing a "Content of the panel" text.
 *		document.body.appendChild( dropdown.element );
 *
 * Also see {@link module:ui/dropdown/createdropdown~createDropdown} and
 * {@link module:ui/dropdown/list/createlistdropdown~createListDropdown} to learn about different
 * dropdown creation helpers.
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
		buttonView.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown__button'
				]
			}
		} );

		/**
		 * Button of the dropdown view. Clicking the button opens the {@link #panelView}.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView} #buttonView
		 */
		this.buttonView = buttonView;

		/**
		 * Panel of the dropdown. It opens when the {@link #buttonView} is
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed} (i.e. clicked).
		 *
		 * Child views can be added to the panel's `children` collection:
		 *
		 *		dropdown.panelView.children.add( childView );
		 *
		 * See {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#children} and
		 * {@link module:ui/viewcollection~ViewCollection#add}.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownpanelview~DropdownPanelView} #panelView
		 */
		this.panelView = panelView;

		/**
		 * Controls whether the dropdown view is open, i.e. shows or hides the {@link #panelView panel}.
		 *
		 * @observable
		 * @member {Boolean} #isOpen
		 */
		this.set( 'isOpen', false );

		/**
		 * Tracks information about DOM focus in the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
		 * keystrokes of the dropdown:
		 *
		 * * <kbd>▼</kbd> opens the dropdown,
		 * * <kbd>◀</kbd> and <kbd>Esc</kbd> closes the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.setTemplate( {
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
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Toggle the the dropdown when it's button has been clicked.
		this.listenTo( this.buttonView, 'execute', () => {
			this.isOpen = !this.isOpen;
		} );

		// Toggle the visibility of the panel when the dropdown becomes open.
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

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
	}

	/**
	 * Focuses the {@link #buttonView}.
	 */
	focus() {
		this.buttonView.focus();
	}
}
