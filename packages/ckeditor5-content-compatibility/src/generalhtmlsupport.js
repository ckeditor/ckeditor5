/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/generalhtmlsupport
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DataSchema from './dataschema';

/**
 * @extends module:core/plugin~Plugin
 */
export default class GeneralHTMLSupport extends Plugin {
	constructor( editor ) {
		super( editor );

		this.dataSchema = new DataSchema( editor );
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'GeneralHTMLSupport';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dataSchema = this.dataSchema;

		// Register block elements.
		editor.model.schema.register( '$ghsBlock', {
			inheritAllFrom: '$block',
			allowIn: '$ghsBlock'
		} );

		dataSchema.register( { view: 'article', model: 'ghsArticle', schema: '$ghsBlock' } );
		dataSchema.register( { view: 'section', model: 'ghsSection', schema: '$ghsBlock' } );
		dataSchema.register( { view: 'dl', model: 'ghsDl', schema: '$ghsBlock' } );

		// Register data list elements.
		editor.model.schema.register( '$ghsDatalist', {
			allowIn: 'ghsDl',
			isBlock: true,
			allowContentOf: '$ghsBlock'
		} );
		editor.model.schema.extend( '$text', { allowIn: '$ghsDatalist' } );

		dataSchema.register( { view: 'dt', model: 'ghsDt', schema: '$ghsDatalist' } );
		dataSchema.register( { view: 'dd', model: 'ghsDd', schema: '$ghsDatalist' } );
	}
}
