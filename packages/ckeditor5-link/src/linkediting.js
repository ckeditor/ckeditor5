/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';
import { createLinkElement, ensureSafeUrl } from './utils';
import AutomaticDecorators from './utils/automaticdecorators';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from './findlinkrange';
import '../theme/link.css';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

const HIGHLIGHT_CLASS = 'ck-link_selected';
const AUTO = 'automatic';
const MANUAL = 'manual';

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
	constructor( editor ) {
		super( editor );

		editor.config.define( 'link', {
			targetDecorator: false
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

		const linkDecorators = editor.config.get( 'link.decorators' ) || [];
		this.enableAutomaticDecorators( linkDecorators.filter( item => item.mode === AUTO ) );
		this.enableManualDecorators( linkDecorators.filter( item => item.mode === MANUAL ) );

		// Enable two-step caret movement for `linkHref` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'linkHref' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();
	}

	enableAutomaticDecorators( automaticDecoratorDefinitions ) {
		const editor = this.editor;
		const automaticDecorators = new AutomaticDecorators();

		// Adds default decorator for external links.
		if ( editor.config.get( 'link.targetDecorator' ) ) {
			automaticDecorators.add( {
				mode: AUTO,
				callback: url => {
					const EXTERNAL_LINKS_REGEXP = /^(https?:)?\/\//;
					return EXTERNAL_LINKS_REGEXP.test( url );
				},
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			} );
		}

		automaticDecorators.add( automaticDecoratorDefinitions );
		editor.conversion.for( 'downcast' ).add( automaticDecorators.getDispatcher() );
	}

	enableManualDecorators( manualDecoratorDefinitions ) {
		const editor = this.editor;
		if ( !manualDecoratorDefinitions.length ) {
			return;
		}

		const command = editor.commands.get( 'link' );
		const attrCollection = command.customAttributes;

		manualDecoratorDefinitions.forEach( ( decorator, index ) => {
			const decoratorName = `linkManualDecorator${ index }`;
			editor.model.schema.extend( '$text', { allowAttributes: decoratorName } );

			attrCollection.add( new ManualDecorator( Object.assign( { id: decoratorName, value: undefined }, decorator ) ) );
			editor.conversion.for( 'downcast' ).attributeToElement( {
				model: decoratorName,
				view: ( manualDecoratorName, writer ) => {
					if ( manualDecoratorName ) {
						const element = writer.createAttributeElement(
							'a',
							attrCollection.get( decoratorName ).attributes,
							{
								priority: 5
							}
						);
						writer.setCustomProperty( 'link', true, element );
						return element;
					}
				} } );
		} );
	}

	/**
	 * Adds a visual highlight style to a link in which the selection is anchored.
	 * Together with two-step caret movement, they indicate that the user is typing inside the link.
	 *
	 * Highlight is turned on by adding `.ck-link_selected` class to the link in the view:
	 *
	 * * the class is removed before conversion has started, as callbacks added with `'highest'` priority
	 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events,
	 * * the class is added in the view post fixer, after other changes in the model tree were converted to the view.
	 *
	 * This way, adding and removing highlight does not interfere with conversion.
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

			if ( selection.hasAttribute( 'linkHref' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ), editor.model );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
				// broken by a UIElement.
				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'a' ) ) {
						writer.addClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.add( item );
					}
				}
			}
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
}

export class ManualDecorator {
	constructor( { id, value, label, attributes } = {} ) {
		this.id = id;

		this.set( 'value', value );

		this.label = label;

		this.attributes = attributes;
	}
}

mix( ManualDecorator, ObservableMixin );
