/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';

/**
 * The basic button view class.
 *
 * @memberOf core.ui.button
 * @extends core.ui.View
 */

export default class ButtonView extends View {
	constructor( model ) {
		super( model );

		const bind = this.attributeBinder;

		this.template = {
			tag: 'button',

			attributes: {
				class: [
					'ck-button',
					bind.to( 'isEnabled', value => value ? 'ck-enabled' : 'ck-disabled' ),
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' )
				]
			},

			children: [
				{
					text: bind.to( 'label' )
				}
			],

			on: {
				mousedown: ( evt ) => {
					evt.preventDefault();
				},

				click: () => {
					// We can't make the button disabled using the disabled attribute, because it won't be focusable.
					// Though, shouldn't this condition be moved to the button controller?
					if ( model.isEnabled ) {
						this.fire( 'click' );
					}
				}
			}
		};
	}
}

/**
 * Fired when the button is being clicked. It won't be fired when the button is disabled.
 *
 * @event core.ui.button.ButtonView#click
 */
