/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/headingconfig
 */

import type { ViewElementDefinition } from 'ckeditor5/src/engine';

/**
 * The configuration of the heading feature.
 * The option is used by the {@link module:heading/headingediting~HeadingEditing} feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     heading: ... // Heading feature config.
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface HeadingConfig {

	/**
	 * The available heading options.
	 *
	 * The default value is:
	 * ```ts
	 * const headingConfig = {
	 *   options: [
	 *     { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
	 *     { model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
	 *     { model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
	 *     { model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
	 *   ]
	 * };
	 * ```
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
	 * ```ts
	 * editor.execute( 'heading', { value: 'heading1' } );
	 * ```
	 */
	options?: Array<HeadingOption>;
}

/**
 * Heading option descriptor.
 */
export type HeadingOption = HeadingElementOption | HeadingParagraphOption;

export interface HeadingElementOption {

	/**
	 * Name of the model element to convert.
	 */
	model: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6';

	/**
	 * Definition of a view element to convert from/to.
	 */
	view: ViewElementDefinition;

	/**
	 * The user-readable title of the option.
	 */
	title: string;

	/**
	 * The class which will be added to the dropdown item representing this option.
	 */
	class: string;

	/**
	 * Icon used by {@link module:heading/headingbuttonsui~HeadingButtonsUI}. It can be omitted when using the default configuration.
	 */
	icon?: string;
}

export interface HeadingParagraphOption {

	/**
	 * Name of the model element to convert.
	 */
	model: 'paragraph';

	/**
	 * The user-readable title of the option.
	 */
	title: string;

	/**
	 * The class which will be added to the dropdown item representing this option.
	 * */
	class: string;

	/**
	 * Icon used by {@link module:heading/headingbuttonsui~HeadingButtonsUI}. It can be omitted when using the default configuration.
	 */
	icon?: string;
}
