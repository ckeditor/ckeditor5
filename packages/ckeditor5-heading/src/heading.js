/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/heading
 */

import { Plugin } from 'ckeditor5/src/core';

import HeadingEditing from './headingediting';
import HeadingUI from './headingui';

import '../theme/heading.css';

/**
 * The headings feature.
 *
 * For a detailed overview, check the {@glink features/headings Headings feature documentation}
 * and the {@glink api/heading package page}.
 *
 * This is a "glue" plugin which loads the {@link module:heading/headingediting~HeadingEditing heading editing feature}
 * and {@link module:heading/headingui~HeadingUI heading UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Heading extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingEditing, HeadingUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Heading';
	}
}

/**
 * The configuration of the heading feature. Introduced by the {@link module:heading/headingediting~HeadingEditing} feature.
 *
 * Read more in {@link module:heading/heading~HeadingConfig}.
 *
 * @member {module:heading/heading~HeadingConfig} module:core/editor/editorconfig~EditorConfig#heading
 */

/**
 * The configuration of the heading feature.
 * The option is used by the {@link module:heading/headingediting~HeadingEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				heading: ... // Heading feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HeadingConfig
 */

/**
 * The available heading options.
 *
 * The default value is:
 *
 *		const headingConfig = {
 *			options: [
 *				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *				{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *				{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *				{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *			]
 *		};
 *
 * It defines 3 levels of headings. In the editor model they will use `heading1`, `heading2`, and `heading3` elements.
 * Their respective view elements (so the elements output by the editor) will be: `h2`, `h3`, and `h4`. This means that
 * if you choose "Heading 1" in the headings dropdown the editor will turn the current block to `<heading1>` in the model
 * which will result in rendering (and outputting to data) the `<h2>` element.
 *
 * The `title` and `class` properties will be used by the `headings` dropdown to render available options.
 * Usually, the first option in the headings dropdown is the "Paragraph" option, hence it's also defined on the list.
 * However, you don't need to define its view representation because it's handled by
 * the {@link module:paragraph/paragraph~Paragraph} feature (which is required by
 * the {@link module:heading/headingediting~HeadingEditing} feature).
 *
 * You can **read more** about configuring heading levels and **see more examples** in
 * the {@glink features/headings Headings} guide.
 *
 * Note: In the model you should always start from `heading1`, regardless of how the headings are represented in the view.
 * That's assumption is used by features like {@link module:autoformat/autoformat~Autoformat} to know which element
 * they should use when applying the first level heading.
 *
 * The defined headings are also available as values passed to the `'heading'` command under their model names.
 * For example, the below code will apply `<heading1>` to the current selection:
 *
 *		editor.execute( 'heading', { value: 'heading1' } );
 *
 * @member {Array.<module:heading/heading~HeadingOption>} module:heading/heading~HeadingConfig#options
 */

/**
 * Heading option descriptor.
 *
 * @typedef {Object} module:heading/heading~HeadingOption
 * @property {String} model Name of the model element to convert.
 * @property {module:engine/view/elementdefinition~ElementDefinition} view Definition of a view element to convert from/to.
 * @property {String} title The user-readable title of the option.
 * @property {String} class The class which will be added to the dropdown item representing this option.
 * @property {String} [icon] Icon used by {@link module:heading/headingbuttonsui~HeadingButtonsUI}. It can be omitted when using
 * the default configuration.
 * @extends module:engine/conversion/conversion~ConverterDefinition
 */
