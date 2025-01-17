/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/heading
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { HeadingOption } from '@ckeditor/ckeditor5-heading';
import { Enter } from 'ckeditor5/src/enter.js';

import DataSchema from '../dataschema.js';

/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 */
export default class HeadingElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataSchema, Enter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HeadingElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'HeadingEditing' ) ) {
			return;
		}

		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;

		this.registerHeadingElements( editor, options );
	}

	/**
	 * Registers all elements supported by HeadingEditing to enable custom attributes for those elements.
	 */
	private registerHeadingElements( editor: Editor, options: Array<HeadingOption> ) {
		const dataSchema = editor.plugins.get( DataSchema );

		const headerModels = [];
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

		dataSchema.extendBlockElement( {
			model: 'htmlSummary',
			modelSchema: {
				allowChildren: headerModels
			}
		} );
	}
}
