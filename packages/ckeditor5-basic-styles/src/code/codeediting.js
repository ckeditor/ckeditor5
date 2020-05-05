/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AttributeCommand from '../attributecommand';

const CODE = 'code';

/**
 * The code editing feature.
 *
 * It registers the `'code'` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow code attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: CODE } );
		editor.model.schema.setAttributeProperties( CODE, {
			isFormatting: true,
			copyOnEnter: true
		} );

		editor.conversion.attributeToElement( {
			model: CODE,
			view: 'code',
			upcastAlso: {
				styles: {
					'word-wrap': 'break-word'
				}
			}
		} );

		// Create code command.
		editor.commands.add( CODE, new AttributeCommand( editor, CODE ) );
	}
}
