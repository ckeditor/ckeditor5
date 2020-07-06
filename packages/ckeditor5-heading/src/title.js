/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/title
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import first from '@ckeditor/ckeditor5-utils/src/first';
import {
	needsPlaceholder,
	showPlaceholder,
	hidePlaceholder,
	enablePlaceholder
} from '@ckeditor/ckeditor5-engine/src/view/placeholder';

// A list of element names that should be treated by the Title plugin as title-like.
// This means that an element of a type from this list will be changed to a title element
// when it is the first element in the root.
const titleLikeElements = new Set( [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ] );

/**
 * The Title plugin.
 *
 * It splits the document into `Title` and `Body` sections.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Title extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Title';
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
		const model = editor.model;

		/**
		 * A reference to an empty paragraph in the body
		 * created when there is no element in the body for the placeholder purposes.
		 *
		 * @private
		 * @type {null|module:engine/model/element~Element}
		 */
		this._bodyPlaceholder = null;

		// To use the schema for disabling some features when the selection is inside the title element
		// it is needed to create the following structure:
		//
		// <title>
		//     <title-content>The title text</title-content>
		// </title>
		//
		// See: https://github.com/ckeditor/ckeditor5/issues/2005.
		model.schema.register( 'title', { isBlock: true, allowIn: '$root' } );
		model.schema.register( 'title-content', { isBlock: true, allowIn: 'title', allowAttributes: [ 'alignment' ] } );
		model.schema.extend( '$text', { allowIn: 'title-content' } );

		// Disallow all attributes in `title-content`.
		model.schema.addAttributeCheck( context => {
			if ( context.endsWith( 'title-content $text' ) ) {
				return false;
			}
		} );

		// Because `title` is represented by two elements in the model
		// but only one in the view, it is needed to adjust Mapper.
		editor.editing.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );
		editor.data.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );

		// Conversion.
		editor.conversion.for( 'downcast' ).elementToElement( { model: 'title-content', view: 'h1' } );
		// Custom converter is used for data v -> m conversion to avoid calling post-fixer when setting data.
		// See https://github.com/ckeditor/ckeditor5/issues/2036.
		editor.data.upcastDispatcher.on( 'element:h1', dataViewModelH1Insertion, { priority: 'high' } );
		editor.data.upcastDispatcher.on( 'element:h2', dataViewModelH1Insertion, { priority: 'high' } );
		editor.data.upcastDispatcher.on( 'element:h3', dataViewModelH1Insertion, { priority: 'high' } );

		// Take care about correct `title` element structure.
		model.document.registerPostFixer( writer => this._fixTitleContent( writer ) );

		// Create and take care of correct position of a `title` element.
		model.document.registerPostFixer( writer => this._fixTitleElement( writer ) );

		// Create element for `Body` placeholder if it is missing.
		model.document.registerPostFixer( writer => this._fixBodyElement( writer ) );

		// Prevent from adding extra at the end of the document.
		model.document.registerPostFixer( writer => this._fixExtraParagraph( writer ) );

		// Attach `Title` and `Body` placeholders to the empty title and/or content.
		this._attachPlaceholders();

		// Attach Tab handling.
		this._attachTabPressHandling();
	}

	/**
	 * Returns the title of the document. Note that because this plugin does not allow any formatting inside
	 * the title element, the output of this method will be a plain text, with no HTML tags.
	 *
	 * It is not recommended to use this method together with features that insert markers to the
	 * data output, like comments or track changes features. If such markers start in the title and end in the
	 * body, the result of this method might be incorrect.
	 *
	 * @returns {String} The title of the document.
	 */
	getTitle() {
		const titleElement = this._getTitleElement();
		const titleContentElement = titleElement.getChild( 0 );

		return this.editor.data.stringify( titleContentElement );
	}

	/**
	 * Returns the body of the document.
	 *
	 * Note that it is not recommended to use this method together with features that insert markers to the
	 * data output, like comments or track changes features. If such markers start in the title and end in the
	 * body, the result of this method might be incorrect.
	 *
	 * @returns {String} The body of the document.
	 */
	getBody() {
		const editor = this.editor;
		const data = editor.data;
		const model = editor.model;
		const root = editor.model.document.getRoot();
		const viewWriter = new ViewDowncastWriter( editor.editing.view.document );

		const rootRange = model.createRangeIn( root );
		const viewDocumentFragment = new ViewDocumentFragment( editor.editing.view.document );

		// Convert the entire root to view.
		data.mapper.clearBindings();
		data.mapper.bindElements( root, viewDocumentFragment );
		data.downcastDispatcher.convertInsert( rootRange, viewWriter );

		// Convert all markers that intersects with body.
		const bodyStartPosition = model.createPositionAfter( root.getChild( 0 ) );
		const bodyRange = model.createRange( bodyStartPosition, model.createPositionAt( root, 'end' ) );

		for ( const marker of model.markers ) {
			const intersection = bodyRange.getIntersection( marker.getRange() );

			if ( intersection ) {
				data.downcastDispatcher.convertMarkerAdd( marker.name, intersection, viewWriter );
			}
		}

		// Remove title element from view.
		viewWriter.remove( viewWriter.createRangeOn( viewDocumentFragment.getChild( 0 ) ) );

		// view -> data
		return editor.data.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the `title` element when it is in the document. Returns `undefined` otherwise.
	 *
	 * @private
	 * @returns {module:engine/model/element~Element|undefined}
	 */
	_getTitleElement() {
		const root = this.editor.model.document.getRoot();

		for ( const child of root.getChildren() ) {
			if ( isTitle( child ) ) {
				return child;
			}
		}
	}

	/**
	 * Model post-fixer callback that ensures that `title` has only one `title-content` child.
	 * All additional children should be moved after the `title` element and renamed to a paragraph.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixTitleContent( writer ) {
		const title = this._getTitleElement();

		// There's no title in the content - it will be created by _fixTitleElement post-fixer.
		if ( !title || title.maxOffset === 1 ) {
			return false;
		}

		const titleChildren = Array.from( title.getChildren() );

		// Skip first child because it is an allowed element.
		titleChildren.shift();

		for ( const titleChild of titleChildren ) {
			writer.move( writer.createRangeOn( titleChild ), title, 'after' );
			writer.rename( titleChild, 'paragraph' );
		}

		return true;
	}

	/**
	 * Model post-fixer callback that creates a title element when it is missing,
	 * takes care of the correct position of it and removes additional title elements.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixTitleElement( writer ) {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();

		const titleElements = Array.from( modelRoot.getChildren() ).filter( isTitle );
		const firstTitleElement = titleElements[ 0 ];
		const firstRootChild = modelRoot.getChild( 0 );

		// When title element is at the beginning of the document then try to fix additional
		// title elements (if there are any) and stop post-fixer as soon as possible.
		if ( firstRootChild.is( 'title' ) ) {
			return fixAdditionalTitleElements( titleElements, writer, model );
		}

		// When there is no title in the document and first element in the document cannot be changed
		// to the title then create an empty title element at the beginning of the document.
		if ( !firstTitleElement && !titleLikeElements.has( firstRootChild.name ) ) {
			const title = writer.createElement( 'title' );

			writer.insert( title, modelRoot );
			writer.insertElement( 'title-content', title );

			return true;
		}

		// At this stage, we are sure the title is somewhere in the content. It has to be fixed.

		// Change the first element in the document to the title if it can be changed (is title-like).
		if ( titleLikeElements.has( firstRootChild.name ) ) {
			changeElementToTitle( firstRootChild, writer, model );
		// Otherwise, move the first occurrence of the title element to the beginning of the document.
		} else {
			writer.move( writer.createRangeOn( firstTitleElement ), modelRoot, 0 );
		}

		fixAdditionalTitleElements( titleElements, writer, model );

		return true;
	}

	/**
	 * Model post-fixer callback that adds an empty paragraph at the end of the document
	 * when it is needed for the placeholder purposes.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixBodyElement( writer ) {
		const modelRoot = this.editor.model.document.getRoot();

		if ( modelRoot.childCount < 2 ) {
			this._bodyPlaceholder = writer.createElement( 'paragraph' );
			writer.insert( this._bodyPlaceholder, modelRoot, 1 );

			return true;
		}

		return false;
	}

	/**
	 * Model post-fixer callback that removes a paragraph from the end of the document
	 * if it was created for the placeholder purposes and is not needed anymore.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixExtraParagraph( writer ) {
		const root = this.editor.model.document.getRoot();
		const placeholder = this._bodyPlaceholder;

		if ( shouldRemoveLastParagraph( placeholder, root ) ) {
			this._bodyPlaceholder = null;
			writer.remove( placeholder );

			return true;
		}

		return false;
	}

	/**
	 * Attaches the `Title` and `Body` placeholders to the title and/or content.
	 *
	 * @private
	 */
	_attachPlaceholders() {
		const editor = this.editor;
		const t = editor.t;
		const view = editor.editing.view;
		const viewRoot = view.document.getRoot();
		const sourceElement = editor.sourceElement;

		const titlePlaceholder = editor.config.get( 'title.placeholder' ) || t( 'Type your title' );
		const bodyPlaceholder = editor.config.get( 'placeholder' ) ||
			sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute( 'placeholder' ) ||
			t( 'Type or paste your content here.' );

		// Attach placeholder to the view title element.
		editor.editing.downcastDispatcher.on( 'insert:title-content', ( evt, data, conversionApi ) => {
			enablePlaceholder( {
				view,
				element: conversionApi.mapper.toViewElement( data.item ),
				text: titlePlaceholder
			} );
		} );

		// Attach placeholder to first element after a title element and remove it if it's not needed anymore.
		// First element after title can change so we need to observe all changes keep placeholder in sync.
		let oldBody;

		// This post-fixer runs after the model post-fixer so we can assume that
		// the second child in view root will always exist.
		view.document.registerPostFixer( writer => {
			const body = viewRoot.getChild( 1 );
			let hasChanged = false;

			// If body element has changed we need to disable placeholder on the previous element
			// and enable on the new one.
			if ( body !== oldBody ) {
				if ( oldBody ) {
					hidePlaceholder( writer, oldBody );
					writer.removeAttribute( 'data-placeholder', oldBody );
				}

				writer.setAttribute( 'data-placeholder', bodyPlaceholder, body );
				oldBody = body;
				hasChanged = true;
			}

			// Then we need to display placeholder if it is needed.
			if ( needsPlaceholder( body ) && viewRoot.childCount === 2 && body.name === 'p' ) {
				hasChanged = showPlaceholder( writer, body ) ? true : hasChanged;
			// Or hide if it is not needed.
			} else {
				hasChanged = hidePlaceholder( writer, body ) ? true : hasChanged;
			}

			return hasChanged;
		} );
	}

	/**
	 * Creates navigation between the title and body sections using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys.
	 *
	 * @private
	 */
	_attachTabPressHandling() {
		const editor = this.editor;
		const model = editor.model;

		// Pressing <kbd>Tab</kbd> inside the title should move the caret to the body.
		editor.keystrokes.set( 'TAB', ( data, cancel ) => {
			model.change( writer => {
				const selection = model.document.selection;
				const selectedElements = Array.from( selection.getSelectedBlocks() );

				if ( selectedElements.length === 1 && selectedElements[ 0 ].is( 'title-content' ) ) {
					const firstBodyElement = model.document.getRoot().getChild( 1 );
					writer.setSelection( firstBodyElement, 0 );
					cancel();
				}
			} );
		} );

		// Pressing <kbd>Shift</kbd>+<kbd>Tab</kbd> at the beginning of the body should move the caret to the title.
		editor.keystrokes.set( 'SHIFT + TAB', ( data, cancel ) => {
			model.change( writer => {
				const selection = model.document.selection;

				if ( !selection.isCollapsed ) {
					return;
				}

				const root = editor.model.document.getRoot();
				const selectedElement = first( selection.getSelectedBlocks() );
				const selectionPosition = selection.getFirstPosition();

				const title = root.getChild( 0 );
				const body = root.getChild( 1 );

				if ( selectedElement === body && selectionPosition.isAtStart ) {
					writer.setSelection( title.getChild( 0 ), 0 );
					cancel();
				}
			} );
		} );
	}
}

// A view-to-model converter for the h1 that appears at the beginning of the document (a title element).
//
// @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
// @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
// @param {Object} data An object containing conversion input, a placeholder for conversion output and possibly other values.
// @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
function dataViewModelH1Insertion( evt, data, conversionApi ) {
	const modelCursor = data.modelCursor;
	const viewItem = data.viewItem;

	if ( !modelCursor.isAtStart || !modelCursor.parent.is( '$root' ) ) {
		return;
	}

	if ( !conversionApi.consumable.consume( viewItem, { name: true } ) ) {
		return;
	}

	const modelWriter = conversionApi.writer;

	const title = modelWriter.createElement( 'title' );
	const titleContent = modelWriter.createElement( 'title-content' );

	modelWriter.append( titleContent, title );
	modelWriter.insert( title, modelCursor );

	conversionApi.convertChildren( viewItem, titleContent );

	conversionApi.updateConversionResult( title, data );
}

// Maps position from the beginning of the model `title` element to the beginning of the view `h1` element.
//
// <title>^<title-content>Foo</title-content></title> -> <h1>^Foo</h1>
//
// @param {module:editor/view/view~View} editingView
function mapModelPositionToView( editingView ) {
	return ( evt, data ) => {
		const positionParent = data.modelPosition.parent;

		if ( !positionParent.is( 'title' ) ) {
			return;
		}

		const modelTitleElement = positionParent.parent;
		const viewElement = data.mapper.toViewElement( modelTitleElement );

		data.viewPosition = editingView.createPositionAt( viewElement, 0 );
		evt.stop();
	};
}

// Returns true when given element is a title. Returns false otherwise.
//
// @param {module:engine/model/element~Element} element
// @returns {Boolean}
function isTitle( element ) {
	return element.is( 'title' );
}

// Changes the given element to the title element.
//
// @param {module:engine/model/element~Element} element
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function changeElementToTitle( element, writer, model ) {
	const title = writer.createElement( 'title' );

	writer.insert( title, element, 'before' );
	writer.insert( element, title, 0 );
	writer.rename( element, 'title-content' );
	model.schema.removeDisallowedAttributes( [ element ], writer );
}

// Loops over the list of title elements and fixes additional ones.
//
// @param {Array.<module:engine/model/element~Element>} titleElements
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
// @returns {Boolean} Returns true when there was any change. Returns false otherwise.
function fixAdditionalTitleElements( titleElements, writer, model ) {
	let hasChanged = false;

	for ( const title of titleElements ) {
		if ( title.index !== 0 ) {
			fixTitleElement( title, writer, model );
			hasChanged = true;
		}
	}

	return hasChanged;
}

// Changes given title element to a paragraph or removes it when it is empty.
//
// @param {module:engine/model/element~Element} title
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function fixTitleElement( title, writer, model ) {
	const child = title.getChild( 0 );

	// Empty title should be removed.
	// It is created as a result of pasting to the title element.
	if ( child.isEmpty ) {
		writer.remove( title );

		return;
	}

	writer.move( writer.createRangeOn( child ), title, 'before' );
	writer.rename( child, 'paragraph' );
	writer.remove( title );
	model.schema.removeDisallowedAttributes( [ child ], writer );
}

// Returns true when the last paragraph in the document was created only for the placeholder
// purpose and it's not needed anymore. Returns false otherwise.
//
// @param {module:engine/model/rootelement~RootElement} root
// @param {module:engine/model/element~Element} placeholder
// @returns {Boolean}
function shouldRemoveLastParagraph( placeholder, root ) {
	if ( !placeholder || !placeholder.is( 'paragraph' ) || placeholder.childCount ) {
		return false;
	}

	if ( root.childCount <= 2 || root.getChild( root.childCount - 1 ) !== placeholder ) {
		return false;
	}

	return true;
}

/**
 * The configuration of the {@link module:heading/title~Title title feature}.
 *
 * Read more in {@link module:heading/title~TitleConfig}.
 *
 * @member {module:heading/title~TitleConfig} module:core/editor/editorconfig~EditorConfig#title
 */

/**
 * The configuration of the {@link module:heading/title~Title title feature}.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				plugins: [ Title, ... ],
 *				title: {
 *					placeholder: 'My custom placeholder for the title'
 *				},
 *				placeholder: 'My custom placeholder for the body'
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * @interface TitleConfig
 */

/**
 * Defines a custom value of the placeholder for the title field.
 *
 * Read more in {@link module:heading/title~TitleConfig}.
 *
 * @member {String} module:heading/title~TitleConfig#placeholder
 */
