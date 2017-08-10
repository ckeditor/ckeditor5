/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingCommand from './headingcommand';

const defaultModelElement = 'paragraph';

/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The configuration of the heading feature. Introduced by the {@link module:heading/headingengine~HeadingEngine} feature.
		 *
		 * Read more in {@link module:heading/headingengine~HeadingConfig}.
		 *
		 * @member {module:heading/headingengine~HeadingConfig} module:core/editor/editorconfig~EditorConfig#heading
		 */
		editor.config.define( 'heading', {
			options: [
				{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
				{ modelElement: 'heading3', viewElement: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;
		const options = editor.config.get( 'heading.options' );

		for ( const option of options ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( option.modelElement !== defaultModelElement ) {
				// Schema.
				editor.document.schema.registerItem( option.modelElement, '$block' );

				// Build converter from model to view for data and editing pipelines.
				buildModelConverter().for( data.modelToView, editing.modelToView )
					.fromElement( option.modelElement )
					.toElement( option.viewElement );

				// Build converter from view to model for data pipeline.
				buildViewConverter().for( data.viewToModel )
					.fromElement( option.viewElement )
					.toElement( option.modelElement );

				// Register the heading command for this option.
				editor.commands.add( option.modelElement, new HeadingCommand( editor, option.modelElement ) );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );
		const options = editor.config.get( 'heading.options' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, data ) => {
				const positionParent = editor.document.selection.getFirstPosition().parent;
				const batch = data.batch;
				const isHeading = options.some( option => positionParent.is( option.modelElement ) );

				if ( isHeading && !positionParent.is( defaultModelElement ) && positionParent.childCount === 0 ) {
					batch.rename( positionParent, defaultModelElement );
				}
			} );
		}
	}
}

/**
 * The configuration of the heading feature. Introduced by the {@link module:heading/headingengine~HeadingEngine} feature.
 *
 *		ClassicEditor.create( {
 * 			heading: ... // Heading feature options.
 *		} )
 *
 *
 * @interface HeadingConfig
 */

/**
 * The available heading options.
 *
 * The default value:
 *
 *		options: [
 *			{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *			{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *			{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *			{ modelElement: 'heading3', viewElement: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *		]
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
 * the {@link module:heading/headingengine~HeadingEngine} feature).
 *
 * Note: In the model you should always start from `heading1`, regardless of how the headings are represented in the view.
 * That's assumption is used by features like {@link module:autoformat/autoformat~Autoformat} to know which element
 * they should use when applying the first level heading.
 *
 * The defined headings are also available in {@link module:core/commandcollection~CommandCollection} under their model names.
 * For example, the below code will apply `<heading1>` to the current selection:
 *
 *		editor.execute( 'heading1' );
 *
 * @member {Array} module:heading/headingengine~HeadingConfig#options
 */
