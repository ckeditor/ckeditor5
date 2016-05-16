/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeDocument from '../treeview/document.js';

export default class EditingController {
	constructor( modelDocument ) {
		this.model = modelDocument;
		this.view = new TreeDocument();
	}

	destroy() {}
}
