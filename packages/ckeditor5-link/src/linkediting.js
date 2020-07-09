/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import TwoStepCaretMovement from '@ckeditor/ckeditor5-typing/src/twostepcaretmovement';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';
import AutomaticDecorators from './utils/automaticdecorators';
import ManualDecorator from './utils/manualdecorator';
import findLinkRange from './findlinkrange';
import { createLinkElement, ensureSafeUrl, getLocalizedDecorators, normalizeDecorators } from './utils';

import '../theme/link.css';

const HIGHLIGHT_CLASS = 'ck-link_selected';
const DECORATOR_AUTOMATIC = 'automatic';
const DECORATOR_MANUAL = 'manual';
const EXTERNAL_LINKS_REGEXP = /^(https?:)?\/\//;

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element
 * as well as `'link'` and `'unlink'` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TwoStepCaretMovement ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'link', {
			addTargetToExternalLinks: false
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow link attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'linkHref' } );

		editor.conversion.for( 'dataDowncast' )
			.attributeToElement( { model: 'linkHref', view: createLinkElement } );

		editor.conversion.for( 'editingDowncast' )
			.attributeToElement( { model: 'linkHref', view: ( href, writer ) => {
				return createLinkElement( ensureSafeUrl( href ), writer );
			} } );

		editor.conversion.for( 'upcast' )
			.elementToAttribute( {
				view: {
					name: 'a',
					attributes: {
						href: true
					}
				},
				model: {
					key: 'linkHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} );

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );

		const linkDecorators = getLocalizedDecorators( editor.t, normalizeDecorators( editor.config.get( 'link.decorators' ) ) );

		this._enableAutomaticDecorators( linkDecorators.filter( item => item.mode === DECORATOR_AUTOMATIC ) );
		this._enableManualDecorators( linkDecorators.filter( item => item.mode === DECORATOR_MANUAL ) );

		// Enable two-step caret movement for `linkHref` attribute.
		const twoStepCaretMovementPlugin = editor.plugins.get( TwoStepCaretMovement );
		twoStepCaretMovementPlugin.registerAttribute( 'linkHref' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();

		// Change the attributes of the selection in certain situations after the link was inserted into the document.
		this._enableInsertContentSelectionAttributesFixer();

		// Handle a click at the beginning/end of a link element.
		this._enableClickingAfterLink();

		// Handle typing over the link.
		this._enableTypingOverLink();
	}

	/**
	 * Processes an array of configured {@link module:link/link~LinkDecoratorAutomaticDefinition automatic decorators}
	 * and registers a {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast dispatcher}
	 * for each one of them. Downcast dispatchers are obtained using the
	 * {@link module:link/utils~AutomaticDecorators#getDispatcher} method.
	 *
	 * **Note**: This method also activates the automatic external link decorator if enabled with
	 * {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}.
	 *
	 * @private
	 * @param {Array.<module:link/link~LinkDecoratorAutomaticDefinition>} automaticDecoratorDefinitions
	 */
	_enableAutomaticDecorators( automaticDecoratorDefinitions ) {
		const editor = this.editor;
		const automaticDecorators = new AutomaticDecorators();

		// Adds a default decorator for external links.
		if ( editor.config.get( 'link.addTargetToExternalLinks' ) ) {
			automaticDecorators.add( {
				id: 'linkIsExternal',
				mode: DECORATOR_AUTOMATIC,
				callback: url => EXTERNAL_LINKS_REGEXP.test( url ),
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			} );
		}

		automaticDecorators.add( automaticDecoratorDefinitions );

		if ( automaticDecorators.length ) {
			editor.conversion.for( 'downcast' ).add( automaticDecorators.getDispatcher() );
		}
	}

	/**
	 * Processes an array of configured {@link module:link/link~LinkDecoratorManualDefinition manual decorators},
	 * transforms them into {@link module:link/utils~ManualDecorator} instances and stores them in the
	 * {@link module:link/linkcommand~LinkCommand#manualDecorators} collection (a model for manual decorators state).
	 *
	 * Also registers an {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement attribute-to-element}
	 * converter for each manual decorator and extends the {@link module:engine/model/schema~Schema model's schema}
	 * with adequate model attributes.
	 *
	 * @private
	 * @param {Array.<module:link/link~LinkDecoratorManualDefinition>} manualDecoratorDefinitions
	 */
	_enableManualDecorators( manualDecoratorDefinitions ) {
		if ( !manualDecoratorDefinitions.length ) {
			return;
		}

		const editor = this.editor;
		const command = editor.commands.get( 'link' );
		const manualDecorators = command.manualDecorators;

		manualDecoratorDefinitions.forEach( decorator => {
			editor.model.schema.extend( '$text', { allowAttributes: decorator.id } );

			// Keeps reference to manual decorator to decode its name to attributes during downcast.
			manualDecorators.add( new ManualDecorator( decorator ) );

			editor.conversion.for( 'downcast' ).attributeToElement( {
				model: decorator.id,
				view: ( manualDecoratorName, writer ) => {
					if ( manualDecoratorName ) {
						const attributes = manualDecorators.get( decorator.id ).attributes;
						const element = writer.createAttributeElement( 'a', attributes, { priority: 5 } );
						writer.setCustomProperty( 'link', true, element );

						return element;
					}
				} } );

			editor.conversion.for( 'upcast' ).elementToAttribute( {
				view: {
					name: 'a',
					attributes: manualDecorators.get( decorator.id ).attributes
				},
				model: {
					key: decorator.id
				}
			} );
		} );
	}

	/**
	 * Adds a visual highlight style to a link in which the selection is anchored.
	 * Together with two-step caret movement, they indicate that the user is typing inside the link.
	 *
	 * Highlight is turned on by adding the `.ck-link_selected` class to the link in the view:
	 *
	 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
	 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
	 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
	 *
	 * This way, adding and removing the highlight does not interfere with conversion.
	 *
	 * @private
	 */
	_setupLinkHighlight() {
		const editor = this.editor;
		const view = editor.editing.view;
		const highlightedLinks = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;
			let changed = false;

			if ( selection.hasAttribute( 'linkHref' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ), editor.model );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
				// broken by a UIElement.
				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'a' ) && !item.hasClass( HIGHLIGHT_CLASS ) ) {
						writer.addClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.add( item );
						changed = true;
					}
				}
			}

			return changed;
		} );

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

			function removeHighlight() {
				view.change( writer => {
					for ( const item of highlightedLinks.values() ) {
						writer.removeClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.delete( item );
					}
				} );
			}
		} );
	}

	/**
	 * Starts listening to {@link module:engine/model/model~Model#event:insertContent} and corrects the model
	 * selection attributes if the selection is at the end of a link after inserting the content.
	 *
	 * The purpose of this action is to improve the overall UX because the user is no longer "trapped" by the
	 * `linkHref` attribute of the selection and they can type a "clean" (`linkHref`–less) text right away.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/6053.
	 *
	 * @private
	 */
	_enableInsertContentSelectionAttributesFixer() {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		model.on( 'insertContent', () => {
			const nodeBefore = selection.anchor.nodeBefore;
			const nodeAfter = selection.anchor.nodeAfter;

			// NOTE: ↰ and ↱ represent the gravity of the selection.

			// The only truly valid case is:
			//
			//		                                 ↰
			//		...<$text linkHref="foo">INSERTED[]</$text>
			//
			// If the selection is not "trapped" by the `linkHref` attribute after inserting, there's nothing
			// to fix there.
			if ( !selection.hasAttribute( 'linkHref' ) ) {
				return;
			}

			// Filter out the following case where a link with the same href (e.g. <a href="foo">INSERTED</a>) is inserted
			// in the middle of an existing link:
			//
			// Before insertion:
			//		                       ↰
			//		<$text linkHref="foo">l[]ink</$text>
			//
			// Expected after insertion:
			//		                               ↰
			//		<$text linkHref="foo">lINSERTED[]ink</$text>
			//
			if ( !nodeBefore ) {
				return;
			}

			// Filter out the following case where the selection has the "linkHref" attribute because the
			// gravity is overridden and some text with another attribute (e.g. <b>INSERTED</b>) is inserted:
			//
			// Before insertion:
			//
			//		                       ↱
			//		<$text linkHref="foo">[]link</$text>
			//
			// Expected after insertion:
			//
			//		                                                          ↱
			//		<$text bold="true">INSERTED</$text><$text linkHref="foo">[]link</$text>
			//
			if ( !nodeBefore.hasAttribute( 'linkHref' ) ) {
				return;
			}

			// Filter out the following case where a link is a inserted in the middle (or before) another link
			// (different URLs, so they will not merge). In this (let's say weird) case, we can leave the selection
			// attributes as they are because the user will end up writing in one link or another anyway.
			//
			// Before insertion:
			//
			//		                       ↰
			//		<$text linkHref="foo">l[]ink</$text>
			//
			// Expected after insertion:
			//
			//		                                                             ↰
			//		<$text linkHref="foo">l</$text><$text linkHref="bar">INSERTED[]</$text><$text linkHref="foo">ink</$text>
			//
			if ( nodeAfter && nodeAfter.hasAttribute( 'linkHref' ) ) {
				return;
			}

			// Make the selection free of link-related model attributes.
			// All link-related model attributes start with "link". That includes not only "linkHref"
			// but also all decorator attributes (they have dynamic names).
			model.change( writer => {
				[ ...model.document.selection.getAttributeKeys() ]
					.filter( name => name.startsWith( 'link' ) )
					.forEach( name => writer.removeSelectionAttribute( name ) );
			} );
		}, { priority: 'low' } );
	}

	/**
	 * Starts listening to {@link module:engine/view/document~Document#event:mousedown} and
	 * {@link module:engine/view/document~Document#event:selectionChange} and puts the selection before/after a link node
	 * if clicked at the beginning/ending of the link.
	 *
	 * The purpose of this action is to allow typing around the link node directly after a click.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/1016.
	 *
	 * @private
	 */
	_enableClickingAfterLink() {
		const editor = this.editor;

		editor.editing.view.addObserver( MouseObserver );

		let clicked = false;

		// Detect the click.
		this.listenTo( editor.editing.view.document, 'mousedown', () => {
			clicked = true;
		} );

		// When the selection has changed...
		this.listenTo( editor.editing.view.document, 'selectionChange', () => {
			if ( !clicked ) {
				return;
			}

			// ...and it was caused by the click...
			clicked = false;

			const selection = editor.model.document.selection;

			// ...and no text is selected...
			if ( !selection.isCollapsed ) {
				return;
			}

			// ...and clicked text is the link...
			if ( !selection.hasAttribute( 'linkHref' ) ) {
				return;
			}

			const position = selection.getFirstPosition();
			const linkRange = findLinkRange( position, selection.getAttribute( 'linkHref' ), editor.model );

			// ...check whether clicked start/end boundary of the link.
			// If so, remove the `linkHref` attribute.
			if ( position.isTouching( linkRange.start ) || position.isTouching( linkRange.end ) ) {
				editor.model.change( writer => {
					writer.removeSelectionAttribute( 'linkHref' );

					for ( const manualDecorator of editor.commands.get( 'link' ).manualDecorators ) {
						writer.removeSelectionAttribute( manualDecorator.id );
					}
				} );
			}
		} );
	}

	/**
	 * Starts listening to {@link module:engine/model/model~Model#deleteContent} and {@link module:engine/model/model~Model#insertContent}
	 * and checks whether typing over the link. If so, attributes of removed text are preserved and applied to the inserted text.
	 *
	 * The purpose of this action is to allow modifying a text without loosing the `linkHref` attribute (and other).
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/4762.
	 *
	 * @private
	 */
	_enableTypingOverLink() {
		const editor = this.editor;

		// Selection attributes when started typing over the link.
		let selectionAttributes;

		// Whether pressed `Backspace` or `Delete`. If so, attributes should not be preserved.
		let deletedContent;

		// Detect pressing `Backspace` / `Delete`.
		editor.editing.view.document.on( 'delete', ( evt, data ) => {
			/* istanbul ignore else */
			if ( data.domEvent.keyCode == keyCodes.delete || data.domEvent.keyCode == keyCodes.backspace ) {
				deletedContent = true;
			}
		}, { priority: 'high' } );

		editor.model.on( 'deleteContent', () => {
			const selection = editor.model.document.selection;

			// Copy attributes only if anything is selected.
			if ( selection.isCollapsed ) {
				return;
			}

			// When the content was deleted, do not preserve attributes.
			if ( deletedContent ) {
				deletedContent = false;

				return;
			}

			const nodeAfterFirstPosition = selection.getFirstPosition().nodeAfter;
			const nodeBeforeLastPosition = selection.getLastPosition().nodeBefore;

			if ( isCorrectLink( nodeAfterFirstPosition, nodeBeforeLastPosition ) ) {
				selectionAttributes = nodeAfterFirstPosition.getAttributes();
			}
		}, { priority: 'high' } );

		editor.model.on( 'insertContent', ( evt, [ element ] ) => {
			if ( !selectionAttributes ) {
				return;
			}

			editor.model.change( writer => {
				for ( const [ attribute, value ] of selectionAttributes ) {
					writer.setAttribute( attribute, value, element );
				}
			} );

			selectionAttributes = null;
		}, { priority: 'high' } );
	}
}

// Checks whether passed elements are the same and they represent a text node.
//
// @param {module:engine/model/node~Node} nodeA
// @param {module:engine/model/node~Node} nodeB
// @returns {Boolean}
function isCorrectLink( nodeA, nodeB ) {
	if ( !nodeA || !nodeB ) {
		return;
	}

	if ( nodeA !== nodeB ) {
		return;
	}

	return nodeA.is( 'text' );
}
