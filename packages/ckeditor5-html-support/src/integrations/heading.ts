/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/heading
 */

import { Plugin } from 'ckeditor5/src/core';
import type { HeadingOption } from '@ckeditor/ckeditor5-heading';

import DataSchema from '../dataschema';

/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 */
export default class HeadingElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataSchema ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HeadingElementSupport' {
		return 'HeadingElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'HeadingEditing' ) ) {
			return;
		}

		const dataSchema = editor.plugins.get( DataSchema );
		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;
		const headerModels = [];

		// We are registering all elements supported by HeadingEditing
		// to enable custom attributes for those elements.
		for ( const option of options ) {
			if ( 'model' in option && 'view' in option ) {
				dataSchema.registerBlockElement( {
					view: option.view as string,
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
