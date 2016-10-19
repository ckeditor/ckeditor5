/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

import ButtonView from '../../ui/button/buttonview.js';
import LabeledInputView from '../../ui/labeledinput/labeledinputview.js';

/**
 * The link form view controller class.
 *
 * See {@link link.ui.LinkForm}.
 *
 * @memberOf link.ui
 * @extends ui.form.FormView
 */
export default class LinkFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.urlInputView = new LabeledInputView( locale );
		this.saveButtonView = new ButtonView( locale );
		this.cancelButtonView = new ButtonView( locale );
		this.unlinkButtonView = new ButtonView( locale );

		Template.extend( this.saveButtonView.template, {
			attributes: {
				class: [
					'ck-button-action'
				]
			}
		} );

		this.template = new Template( {
			tag: 'form',

			attributes: {
				class: [
					'ck-link-form',
				]
			},

			children: [
				this.urlInputView,
				{
					tag: 'div',

					attributes: {
						class: [
							'ck-link-form__actions'
						]
					},

					children: [
						this.saveButtonView,
						this.cancelButtonView,
						this.unlinkButtonView
					]
				}
			],

			on: {
				submit: bind.to( evt => {
					evt.preventDefault();
					this.fire( 'submit' );
				} )
			}
		} );
	}
}
