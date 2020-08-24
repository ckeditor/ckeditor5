/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/ui/domwrapperview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

/**
 * This class wraps DOM element as a CKEditor5 UI View.
 *
 * It allows to render any DOM element and use it in mentions list.
 *
 * @extends {module:ui/view~View}
 */
export default class DomWrapperView extends View {
	/**
	 * Creates an instance of {@link module:mention/ui/domwrapperview~DomWrapperView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Element} domElement
	 */
	constructor( locale, domElement ) {
		super( locale );

		// Disable template rendering on this view.
		this.template = false;

		/**
		 * The DOM element for which wrapper was created.
		 *
		 * @type {Element}
		 */
		this.domElement = domElement;

		// Render dom wrapper as a button.
		this.domElement.classList.add( 'ck-button' );

		/**
		 * Controls whether the dom wrapper view is "on". This is in line with {@link module:ui/button/button~Button#isOn} property.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #isOn
		 */
		this.set( 'isOn', false );

		// Handle isOn state as in buttons.
		this.on( 'change:isOn', ( evt, name, isOn ) => {
			if ( isOn ) {
				this.domElement.classList.add( 'ck-on' );
				this.domElement.classList.remove( 'ck-off' );
			} else {
				this.domElement.classList.add( 'ck-off' );
				this.domElement.classList.remove( 'ck-on' );
			}
		} );

		// Pass click event as execute event.
		this.listenTo( this.domElement, 'click', () => {
			this.fire( 'execute' );
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.element = this.domElement;
	}
}
