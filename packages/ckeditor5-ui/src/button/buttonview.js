/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/button/buttonview
 */

import View from '../view';
import Template from '../template';
import IconView from '../icon/iconview';

import { getEnvKeystrokeText } from 'ckeditor5-utils/src/keyboard';

/**
 * The button view class.
 *
 * @extends module:ui/view~View
 */
export default class ButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The label of the button view visible to the user.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * (Optional) The keystroke associated with the button, i.e. <kbd>CTRL+B</kbd>,
		 * in the string format compatible with {@link module:utils/keyboard}.
		 *
		 * @observable
		 * @member {Boolean} #keystroke.
		 */
		this.set( 'keystroke' );

		/**
		 * (Optional) Title of the button displayed in the tooltip, i.e. when
		 * hovering the button with the mouse cursor. When `title` property is not defined
		 * then combination of `label` and `keystroke` will be set as title.
		 *
		 * @observable
		 * @member {Boolean} #title
		 */
		this.set( 'title' );

		/**
		 * The HTML type of the button. Default `button`.
		 *
		 * @observable
		 * @member {'button'|'submit'|'reset'|'menu'} #type
		 */
		this.set( 'type', 'button' );

		/**
		 * Controls whether the button view is "on", e.g. some feature which it represents
		 * is currently enabled.
		 *
		 * @observable
		 * @member {Boolean} #isOn
		 */
		this.set( 'isOn', false );

		/**
		 * Controls whether the button view is enabled (can be clicked).
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * (Optional) Whether the label of the button is hidden (e.g. button with icon only).
		 *
		 * @observable
		 * @member {Boolean} #withText
		 */
		this.set( 'withText', false );

		/**
		 * (Optional) The name of the icon of the button view.
		 * See {@link module:ui/icon/iconview~IconView} and
		 * {@link module:theme/iconmanagermodel~IconManagerModel}.
		 *
		 * @observable
		 * @member {String} #icon
		 */
		this.set( 'icon' );

		/**
		 * Title of the button bound to the template.
		 *
		 * @see #title
		 * @private
		 * @observable
		 * @member {Boolean} #_tooltip
		 */
		this.bind( '_tooltip' ).to( this, 'title', this, 'label', this, 'keystroke', this._getTooltip.bind( this ) );

		/**
		 * Icon of the button view.
		 *
		 * @readonly
		 * @member {module:ui/icon/iconview~IconView} #iconView
		 */

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'button',

			attributes: {
				class: [
					'ck-button',
					'ck-tooltip_s',
					bind.to( 'isEnabled', value => value ? 'ck-enabled' : 'ck-disabled' ),
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' ),
					bind.if( 'withText', 'ck-button_with-text' )
				],
				type: bind.to( 'type', value => value ? value : 'button' ),
				'data-ck-tooltip': [
					bind.to( '_tooltip' )
				]
			},

			children: [
				{
					tag: 'span',

					attributes: {
						class: [ 'ck-button__label' ]
					},

					children: [
						{
							text: bind.to( 'label' )
						}
					]
				}
			],

			on: {
				mousedown: bind.to( evt => {
					evt.preventDefault();
				} ),

				click: bind.to( evt => {
					// We can't make the button disabled using the disabled attribute, because it won't be focusable.
					// Though, shouldn't this condition be moved to the button controller?
					if ( this.isEnabled ) {
						this.fire( 'execute' );
					} else {
						// Prevent the default when button is disabled, to block e.g.
						// automatic form submitting. See ckeditor/ckeditor5-link#74.
						evt.preventDefault();
					}
				} )
			}
		} );

		/**
		 * Fired when the button view is clicked. It won't be fired when the button is disabled.
		 *
		 * @event #execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	init() {
		let promise = Promise.resolve();

		if ( this.icon && !this.iconView ) {
			const iconView = this.iconView = new IconView();

			iconView.bind( 'content' ).to( this, 'icon' );

			this.element.insertBefore( iconView.element, this.element.firstChild );

			// Make sure the icon view will be destroyed along with button.
			promise = promise.then( () => this.addChildren( iconView ) );
		}

		return promise.then( () => super.init() );
	}

	/**
	 * Gets value for the `data-ck-tooltip` attribute from title, label and keystroke properties.
	 *
	 * @private
	 * @param {String} title Button title.
	 * @param {String} label Button label.
	 * @param {String} keystroke Button keystroke.
	 * @returns {String}
	 */
	_getTooltip( title, label, keystroke ) {
		if ( title ) {
			return title;
		}

		if ( keystroke ) {
			label += ` (${ getEnvKeystrokeText( keystroke ) })`;
		}

		return label;
	}
}
