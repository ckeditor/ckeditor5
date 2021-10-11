/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/heading
 */

import { Plugin } from 'ckeditor5/src/core';

import DataSchema from '../dataschema';

/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataSchema ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'HeadingEditing' ) ) {
			return;
		}

		const dataSchema = editor.plugins.get( DataSchema );
		const options = editor.config.get( 'heading.options' );
		const headerModels = [];

		// We are registering all elements supported by HeadingEditing
		// to enable custom attributes for those elements.
		for ( const option of options ) {
			if ( 'model' in option && 'view' in option ) {
				dataSchema.registerBlockElement( {
					view: option.view,
					model: option.model
				} );

				headerModels.push( option.model );
			}
		}

		dataSchema.extendBlockElement( {
			model: 'htmlHgroup',
			modelSchema: {
				allowChildren: headerModels
			}
		} );
	}
}
