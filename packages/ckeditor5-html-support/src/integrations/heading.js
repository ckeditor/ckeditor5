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
		const dataSchema = editor.plugins.get( DataSchema );

		const options = editor.plugins.has( 'Heading' ) ? editor.config.get( 'heading.options' ) : [];

		const htmlGroupChildren = [
			'htmlH1',
			'htmlH2',
			'htmlH3',
			'htmlH4',
			'htmlH5',
			'htmlH6'
		];

		for ( const option of options ) {
			if ( 'model' in option && 'view' in option ) {
				dataSchema.registerBlockElement( {
					view: option.view,
					model: option.model
				} );

				htmlGroupChildren.push( option.model );
			}
		}

		// I'm not sure if it should be defined here. Mayby only amended somehow.
		dataSchema.registerBlockElement( {
			model: 'htmlHgroup',
			view: 'hgroup',
			modelSchema: {
				allowChildren: htmlGroupChildren
			}
		} );
	}
}
