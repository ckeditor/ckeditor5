/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class DataController {
	constructor( modelDocument, dataProcessor ) {
		this.model = modelDocument;
		this.processor = dataProcessor;
	}

	destroy() {}
}
