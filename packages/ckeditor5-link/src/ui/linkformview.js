/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Template from '../../ui/template.js';
import FormView from '../../ui/form/formview.js';

/**
 * The link form view controller class.
 *
 * See {@link link.ui.LinkForm}.
 *
 * @memberOf link.ui
 * @extends ui.form.FormView
 */
export default class LinkFormView extends FormView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		Template.extend( this.template, {
			attributes: {
				class: [
					'ck-link-form',
				]
			}
		} );

		this.template.children.add( new Template( {
			tag: 'div',
			attributes: {
				class: 'ck-link-form__actions'
			}
		} ) );

		this.register( 'actions', 'div.ck-link-form__actions' );
	}
}
