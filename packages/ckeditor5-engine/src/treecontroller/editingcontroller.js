/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeView from '../treeview/treeview.js';

export default class EditingController {
	constructor( modelDocument ) {
		this.model = modelDocument;
		this.view = new TreeView();
	}

	destroy() {}
}
