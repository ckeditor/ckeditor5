/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/list/listitemview
 */

import View from '../view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * The list item view class.
 *
 * @extends module:ui/view~View
 */
export default class ListItemView extends View {
	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		/**
		 * Controls the `tabindex` attribute of the item.
		 *
		 * @observable
		 * @default -1
		 * @member {String} #tabindex
		 */
		this.set( 'tabindex', -1 );

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'li',

			attributes: {
				class: [
					'ck-list__item',
					bind.to( 'class' ),
					bind.if( 'isActive', 'ck-list__item_active' )
				],
				style: bind.to( 'style' ),
				tabindex: bind.to( 'tabindex' )
			},

			children: [
				{
					text: bind.to( 'label' )
				}
			],

			on: {
				click: bind.to( 'execute' )
			}
		} );

		/**
		 * The label of the list item.
		 *
		 * @observable
		 * @member {String} #label
		 */

		/**
		 * (Optional) The DOM style attribute of the list item.
		 *
		 * @observable
		 * @member {String} #style
		 */

		/**
		 * (Optional) The additional class set on the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */

		/**
		 * (Optional) When set, it marks the item as active among the others.
		 *
		 * @observable
		 * @member {Boolean} #isActive
		 */

		/**
		 * Fired when the list item has been clicked.
		 *
		 * @event execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		const onKeystrokePress = ( data, cancel ) => {
			this.fire( 'execute' );
			cancel();
		};

		this.keystrokes.listenTo( this.element );

		// Execute on Enter and Space key press.
		this.keystrokes.set( 'Enter', onKeystrokePress );
		this.keystrokes.set( 'Space', onKeystrokePress );
	}

	/**
	 * Focuses the list item.
	 */
	focus() {
		this.element.focus();
	}
}
