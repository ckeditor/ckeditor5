/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module heading/title
 */

import { Plugin, type Editor, type ElementApi } from 'ckeditor5/src/core.js';
import { first, type GetCallback } from 'ckeditor5/src/utils.js';
import {
	DowncastWriter,
	enablePlaceholder,
	hidePlaceholder,
	needsPlaceholder,
	showPlaceholder,
	type DowncastInsertEvent,
	type Element,
	type MapperModelToViewPositionEvent,
	type Model,
	type RootElement,
	type UpcastConversionApi,
	type UpcastConversionData,
	type UpcastElementEvent,
	type EditingView,
	type ViewElement,
	type Writer,
	type PlaceholderableElement
} from 'ckeditor5/src/engine.js';

// A list of element names that should be treated by the Title plugin as title-like.
// This means that an element of a type from this list will be changed to a title element
// when it is the first element in the root.
const titleLikeElements = new Set( [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ] );

/**
 * The Title plugin.
 *
 * It splits the document into `Title` and `Body` sections.
 */
export default class Title extends Plugin {
	/**
	 * A reference to an empty paragraph in the body
	 * created when there is no element in the body for the placeholder purposes.
	 */
	private _bodyPlaceholder = new Map<string, Element>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Title' as const;
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
	public static get requires() {
		return [ 'Paragraph' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;

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
		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );
		editor.data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );

		// Conversion.
		editor.conversion.for( 'downcast' ).elementToElement( { model: 'title-content', view: 'h1' } );
		editor.conversion.for( 'downcast' ).add( dispatcher => dispatcher.on<DowncastInsertEvent>(
			'insert:title',
			( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			}
		) );

		// Custom converter is used for data v -> m conversion to avoid calling post-fixer when setting data.
		// See https://github.com/ckeditor/ckeditor5/issues/2036.
		editor.data.upcastDispatcher.on<UpcastElementEvent>( 'element:h1', dataViewModelH1Insertion, { priority: 'high' } );
		editor.data.upcastDispatcher.on<UpcastElementEvent>( 'element:h2', dataViewModelH1Insertion, { priority: 'high' } );
		editor.data.upcastDispatcher.on<UpcastElementEvent>( 'element:h3', dataViewModelH1Insertion, { priority: 'high' } );

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
	 * @param options Additional configuration passed to the conversion process.
	 * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
	 * @returns The title of the document.
	 */
	public getTitle( options: Record<string, unknown> = {} ): string {
		const rootName = options.rootName ? options.rootName as string : undefined;
		const titleElement = this._getTitleElement( rootName );
		const titleContentElement = titleElement!.getChild( 0 ) as Element;

		return this.editor.data.stringify( titleContentElement, options );
	}

	/**
	 * Returns the body of the document.
	 *
	 * Note that it is not recommended to use this method together with features that insert markers to the
	 * data output, like comments or track changes features. If such markers start in the title and end in the
	 * body, the result of this method might be incorrect.
	 *
	 * @param options Additional configuration passed to the conversion process.
	 * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
	 * @returns The body of the document.
	 */
	public getBody( options: Record<string, unknown> = {} ): string {
		const editor = this.editor;
		const data = editor.data;
		const model = editor.model;
		const rootName = options.rootName ? options.rootName as string : undefined;
		const root = editor.model.document.getRoot( rootName )!;
		const view = editor.editing.view;
		const viewWriter = new DowncastWriter( view.document );

		const rootRange = model.createRangeIn( root );
		const viewDocumentFragment = viewWriter.createDocumentFragment();

		// Find all markers that intersects with body.
		const bodyStartPosition = model.createPositionAfter( root.getChild( 0 )! );
		const bodyRange = model.createRange( bodyStartPosition, model.createPositionAt( root, 'end' ) );

		const markers = new Map();

		for ( const marker of model.markers ) {
			const intersection = bodyRange.getIntersection( marker.getRange() );

			if ( intersection ) {
				markers.set( marker.name, intersection );
			}
		}

		// Convert the entire root to view.
		data.mapper.clearBindings();
		data.mapper.bindElements( root, viewDocumentFragment );
		data.downcastDispatcher.convert( rootRange, markers, viewWriter, options );

		// Remove title element from view.
		viewWriter.remove( viewWriter.createRangeOn( viewDocumentFragment.getChild( 0 ) ) );

		// view -> data
		return editor.data.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the `title` element when it is in the document. Returns `undefined` otherwise.
	 */
	private _getTitleElement( rootName?: string ): Element | undefined {
		const root = this.editor.model.document.getRoot( rootName )!;

		for ( const child of root.getChildren() as IterableIterator<Element> ) {
			if ( isTitle( child ) ) {
				return child;
			}
		}
	}

	/**
	 * Model post-fixer callback that ensures that `title` has only one `title-content` child.
	 * All additional children should be moved after the `title` element and renamed to a paragraph.
	 */
	private _fixTitleContent( writer: Writer ) {
		let changed = false;

		for ( const rootName of this.editor.model.document.getRootNames() ) {
			const title = this._getTitleElement( rootName );

			// If there is no title in the content it will be created by `_fixTitleElement` post-fixer.
			// If the title has just one element, then it is correct. No fixing.
			if ( !title || title.maxOffset === 1 ) {
				continue;
			}

			const titleChildren = Array.from( title.getChildren() ) as Array<Element>;

			// Skip first child because it is an allowed element.
			titleChildren.shift();

			for ( const titleChild of titleChildren ) {
				writer.move( writer.createRangeOn( titleChild ), title, 'after' );
				writer.rename( titleChild, 'paragraph' );
			}

			changed = true;
		}

		return changed;
	}

	/**
	 * Model post-fixer callback that creates a title element when it is missing,
	 * takes care of the correct position of it and removes additional title elements.
	 */
	private _fixTitleElement( writer: Writer ) {
		let changed = false;
		const model = this.editor.model;

		for ( const modelRoot of this.editor.model.document.getRoots() ) {
			const titleElements = Array.from( modelRoot.getChildren() as IterableIterator<Element> ).filter( isTitle );
			const firstTitleElement = titleElements[ 0 ];
			const firstRootChild = modelRoot.getChild( 0 ) as Element;

			// When title element is at the beginning of the document then try to fix additional title elements (if there are any).
			if ( firstRootChild.is( 'element', 'title' ) ) {
				if ( titleElements.length > 1 ) {
					fixAdditionalTitleElements( titleElements, writer, model );

					changed = true;
				}

				continue;
			}

			// When there is no title in the document and first element in the document cannot be changed
			// to the title then create an empty title element at the beginning of the document.
			if ( !firstTitleElement && !titleLikeElements.has( firstRootChild.name ) ) {
				const title = writer.createElement( 'title' );

				writer.insert( title, modelRoot );
				writer.insertElement( 'title-content', title );

				changed = true;

				continue;
			}

			if ( titleLikeElements.has( firstRootChild.name ) ) {
				// Change the first element in the document to the title if it can be changed (is title-like).
				changeElementToTitle( firstRootChild, writer, model );
			} else {
				// Otherwise, move the first occurrence of the title element to the beginning of the document.
				writer.move( writer.createRangeOn( firstTitleElement ), modelRoot, 0 );
			}

			fixAdditionalTitleElements( titleElements, writer, model );

			changed = true;
		}

		return changed;
	}

	/**
	 * Model post-fixer callback that adds an empty paragraph at the end of the document
	 * when it is needed for the placeholder purposes.
	 */
	private _fixBodyElement( writer: Writer ) {
		let changed = false;

		for ( const rootName of this.editor.model.document.getRootNames() ) {
			const modelRoot = this.editor.model.document.getRoot( rootName )!;

			if ( modelRoot.childCount < 2 ) {
				const placeholder = writer.createElement( 'paragraph' );

				writer.insert( placeholder, modelRoot, 1 );
				this._bodyPlaceholder.set( rootName, placeholder );

				changed = true;
			}
		}

		return changed;
	}

	/**
	 * Model post-fixer callback that removes a paragraph from the end of the document
	 * if it was created for the placeholder purposes and is not needed anymore.
	 */
	private _fixExtraParagraph( writer: Writer ) {
		let changed = false;

		for ( const rootName of this.editor.model.document.getRootNames() ) {
			const root = this.editor.model.document.getRoot( rootName )!;
			const placeholder = this._bodyPlaceholder.get( rootName )!;

			if ( shouldRemoveLastParagraph( placeholder, root ) ) {
				this._bodyPlaceholder.delete( rootName );
				writer.remove( placeholder );

				changed = true;
			}
		}

		return changed;
	}

	/**
	 * Attaches the `Title` and `Body` placeholders to the title and/or content.
	 */
	private _attachPlaceholders() {
		const editor: Editor & Partial<ElementApi> = this.editor;
		const t = editor.t;
		const view = editor.editing.view;
		const sourceElement = editor.sourceElement;

		const titlePlaceholder = editor.config.get( 'title.placeholder' ) || t( 'Type your title' );
		const bodyPlaceholder = editor.config.get( 'placeholder' ) ||
			sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute( 'placeholder' ) ||
			t( 'Type or paste your content here.' );

		// Attach placeholder to the view title element.
		editor.editing.downcastDispatcher.on<DowncastInsertEvent<Element>>( 'insert:title-content', ( evt, data, conversionApi ) => {
			const element: PlaceholderableElement = conversionApi.mapper.toViewElement( data.item )!;

			element.placeholder = titlePlaceholder;

			enablePlaceholder( {
				view,
				element,
				keepOnFocus: true
			} );
		} );

		// Attach placeholder to first element after a title element and remove it if it's not needed anymore.
		// First element after title can change, so we need to observe all changes keep placeholder in sync.
		const bodyViewElements = new Map<string, ViewElement>();

		// This post-fixer runs after the model post-fixer, so we can assume that the second child in view root will always exist.
		view.document.registerPostFixer( writer => {
			let hasChanged = false;

			for ( const viewRoot of view.document.roots ) {
				// `viewRoot` can be empty despite the model post-fixers if the model root was detached.
				if ( viewRoot.isEmpty ) {
					continue;
				}

				// If `viewRoot` is not empty, then we can expect at least two elements in it.
				const body = viewRoot!.getChild( 1 ) as ViewElement;
				const oldBody = bodyViewElements.get( viewRoot.rootName );

				// If body element has changed we need to disable placeholder on the previous element and enable on the new one.
				if ( body !== oldBody ) {
					if ( oldBody ) {
						hidePlaceholder( writer, oldBody );
						writer.removeAttribute( 'data-placeholder', oldBody );
					}

					writer.setAttribute( 'data-placeholder', bodyPlaceholder, body );
					bodyViewElements.set( viewRoot.rootName, body );

					hasChanged = true;
				}

				// Then we need to display placeholder if it is needed.
				// See: https://github.com/ckeditor/ckeditor5/issues/8689.
				if ( needsPlaceholder( body, true ) && viewRoot!.childCount === 2 && body!.name === 'p' ) {
					hasChanged = showPlaceholder( writer, body ) ? true : hasChanged;
				} else {
					// Or hide if it is not needed.
					hasChanged = hidePlaceholder( writer, body ) ? true : hasChanged;
				}
			}

			return hasChanged;
		} );
	}

	/**
	 * Creates navigation between the title and body sections using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys.
	 */
	private _attachTabPressHandling() {
		const editor = this.editor;
		const model = editor.model;

		// Pressing <kbd>Tab</kbd> inside the title should move the caret to the body.
		editor.keystrokes.set( 'TAB', ( data, cancel ) => {
			model.change( writer => {
				const selection = model.document.selection;
				const selectedElements = Array.from( selection.getSelectedBlocks() );

				if ( selectedElements.length === 1 && selectedElements[ 0 ].is( 'element', 'title-content' ) ) {
					const root = selection.getFirstPosition()!.root;
					const firstBodyElement = root.getChild( 1 );

					writer.setSelection( firstBodyElement!, 0 );

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

				const selectedElement = first( selection.getSelectedBlocks() );
				const selectionPosition = selection.getFirstPosition()!;
				const root = editor.model.document.getRoot( selectionPosition.root.rootName! )!;

				const title = root.getChild( 0 ) as Element;
				const body = root.getChild( 1 );

				if ( selectedElement === body && selectionPosition.isAtStart ) {
					writer.setSelection( title.getChild( 0 )!, 0 );

					cancel();
				}
			} );
		} );
	}
}

/**
 * A view-to-model converter for the h1 that appears at the beginning of the document (a title element).
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param evt An object containing information about the fired event.
 * @param data An object containing conversion input, a placeholder for conversion output and possibly other values.
 * @param conversionApi Conversion interface to be used by the callback.
 */
function dataViewModelH1Insertion( evt: unknown, data: UpcastConversionData<ViewElement>, conversionApi: UpcastConversionApi ) {
	const modelCursor = data.modelCursor;
	const viewItem = data.viewItem;

	if ( !modelCursor.isAtStart || !modelCursor.parent.is( 'element', '$root' ) ) {
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

/**
 * Maps position from the beginning of the model `title` element to the beginning of the view `h1` element.
 *
 * ```html
 * <title>^<title-content>Foo</title-content></title> -> <h1>^Foo</h1>
 * ```
 */
function mapModelPositionToView( editingView: EditingView ): GetCallback<MapperModelToViewPositionEvent> {
	return ( evt, data ) => {
		const positionParent = data.modelPosition.parent;

		if ( !positionParent.is( 'element', 'title' ) ) {
			return;
		}

		const modelTitleElement = positionParent.parent as Element;
		const viewElement = data.mapper.toViewElement( modelTitleElement )!;

		data.viewPosition = editingView.createPositionAt( viewElement, 0 );
		evt.stop();
	};
}

/**
 * @returns Returns true when given element is a title. Returns false otherwise.
 */
function isTitle( element: Element ) {
	return element.is( 'element', 'title' );
}

/**
 * Changes the given element to the title element.
 */
function changeElementToTitle( element: Element, writer: Writer, model: Model ) {
	const title = writer.createElement( 'title' );

	writer.insert( title, element, 'before' );
	writer.insert( element, title, 0 );
	writer.rename( element, 'title-content' );
	model.schema.removeDisallowedAttributes( [ element ], writer );
}

/**
 * Loops over the list of title elements and fixes additional ones.
 *
 * @returns Returns true when there was any change. Returns false otherwise.
 */
function fixAdditionalTitleElements( titleElements: Array<Element>, writer: Writer, model: Model ) {
	let hasChanged = false;

	for ( const title of titleElements ) {
		if ( title.index !== 0 ) {
			fixTitleElement( title, writer, model );

			hasChanged = true;
		}
	}

	return hasChanged;
}

/**
 * Changes given title element to a paragraph or removes it when it is empty.
 */
function fixTitleElement( title: Element, writer: Writer, model: Model ) {
	const child = title.getChild( 0 ) as Element;

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

/**
 * Returns true when the last paragraph in the document was created only for the placeholder
 * purpose and it's not needed anymore. Returns false otherwise.
 */
function shouldRemoveLastParagraph( placeholder: Element, root: RootElement ) {
	if ( !placeholder || !placeholder.is( 'element', 'paragraph' ) || placeholder.childCount ) {
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
 * ```ts
 * ClassicEditor
 *   .create( document.querySelector( '#editor' ), {
 *     plugins: [ Title, ... ],
 *     title: {
 *       placeholder: 'My custom placeholder for the title'
 *     },
 *     placeholder: 'My custom placeholder for the body'
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface TitleConfig {

	/**
	 * Defines a custom value of the placeholder for the title field.
	 *
	 * Read more in {@link module:heading/title~TitleConfig}.
	 */
	placeholder?: string;
}
