/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Model from '/ckeditor5/core/ui/model.js';
import Controller from '/ckeditor5/core/ui/controller.js';
import ControllerCollection from '/ckeditor5/core/ui/controllercollection.js';
import ChromeView from './view.js';

export default class ChromeController extends Controller {
	constructor() {
		const model = new Model();

		super( model, new ChromeView( model ) );

		this.collections.add( new ControllerCollection( 'main' ) );
	}
}
