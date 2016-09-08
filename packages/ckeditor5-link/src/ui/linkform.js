/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Form from '../../ui/form/form.js';

/**
 * The link form class.
 *
 *		new LinkForm( new Model(), new LinkFormView() );
 *
 * See {@link link.ui.LinkFormView}.
 *
 * @memberOf link.ui
 * @extends ui.form.Form
 */
export default class LinkForm extends Form {
	/**
	 * Creates an instance of {@link link.ui.LinkForm} class.
	 *
	 * @param {link.ui.LinkFormModel} model Model of this link form.
	 * @param {ui.View} view View of this link form.
	 */
	constructor( model, view ) {
		super( model, view );

		this.addCollection( 'actions' );
	}
}
