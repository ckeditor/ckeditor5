/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/fullpage
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { logWarning, createElement, isShadowRoot, whenElementConnected } from '@ckeditor/ckeditor5-utils';
import {
	ViewUpcastWriter,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent,
	type ModelRootElement
} from '@ckeditor/ckeditor5-engine';

import { HtmlPageDataProcessor, type FullPageHeadStyle } from './htmlpagedataprocessor.js';

/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export class FullPage extends Plugin {
	/**
	 * Style elements injected into the DOM by this plugin instance.
	 */
	private _injectedStyleElements = new Set<HTMLStyleElement>();

	/**
	 * Cancels an injection that is waiting for the editing root to be connected to a document. `null` when there
	 * is none pending.
	 */
	private _cancelPendingInjection: ( () => void ) | null = null;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullPage' as const;
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public static get licenseFeatureCode(): string {
		return 'FPH';
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
	public static override get isPremiumPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'htmlSupport.fullPage', {
			allowRenderStylesFromHead: false,
			sanitizeCss: rawCss => {
				/**
				 * When using the Full page with the `config.htmlSupport.fullPage.allowRenderStylesFromHead` set to `true`,
				 * it is strongly recommended to define a sanitize function that will clean up the CSS
				 * which is present in the `<head>` in editors content in order to avoid XSS vulnerability.
				 *
				 * For a detailed overview, check the {@glink features/html/full-page-html Full page HTML feature} documentation.
				 *
				 * @error css-full-page-provide-sanitize-function
				 */
				logWarning( 'css-full-page-provide-sanitize-function' );

				return {
					css: rawCss,
					hasChanged: false
				};
			}
		} );

		editor.data.processor = new HtmlPageDataProcessor( editor.data.viewDocument );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const properties = [ '$fullPageDocument', '$fullPageDocType', '$fullPageXmlDeclaration', '$fullPageHeadStyles' ];

		editor.model.schema.extend( '$root', {
			allowAttributes: properties
		} );

		// Apply custom properties from view document fragment to the model root attributes.
		editor.data.on<DataControllerToModelEvent>( 'toModel', ( evt, [ viewElementOrFragment ] ) => {
			const root = editor.model.document.getRoot()!;

			editor.model.change( writer => {
				for ( const name of properties ) {
					const value = viewElementOrFragment.getCustomProperty( name );

					if ( value ) {
						writer.setAttribute( name, value, root );
					}
				}
			} );

			this._syncStylesFromHead( root );
		}, { priority: 'low' } );

		// Apply root attributes to the view document fragment.
		editor.data.on<DataControllerToViewEvent>( 'toView', ( evt, [ modelElementOrFragment ] ) => {
			if ( !modelElementOrFragment.is( 'rootElement' ) ) {
				return;
			}

			const root = modelElementOrFragment;
			const viewFragment = evt.return!;

			if ( !root.hasAttribute( '$fullPageDocument' ) ) {
				return;
			}

			const writer = new ViewUpcastWriter( viewFragment.document );

			for ( const name of properties ) {
				const value = root.getAttribute( name );

				if ( value ) {
					writer.setCustomProperty( name, value, viewFragment );
				}
			}
		}, { priority: 'low' } );

		// Clear root attributes related to full page editing on editor content reset.
		editor.data.on( 'set', () => {
			const root = editor.model.document.getRoot()!;

			editor.model.change( writer => {
				for ( const name of properties ) {
					if ( root.hasAttribute( name ) ) {
						writer.removeAttribute( name, root );
					}
				}
			} );
		}, { priority: 'high' } );

		// Make sure that document is returned even if there is no content in the page body.
		editor.data.on( 'get', ( evt, args ) => {
			if ( !args[ 0 ] ) {
				args[ 0 ] = {};
			}

			args[ 0 ].trim = false;
		}, { priority: 'high' } );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._cancelPendingInjection?.();
		this._removeStyleElementsFromDom();
	}

	/**
	 * Renders the `<style>` elements from the full page data in the tree the editor lives in – the `<head>` of its
	 * document, or the shadow root hosting it – replacing the ones rendered before.
	 *
	 * That tree is only known once the editing root is connected to a document, which does not have to be the case
	 * when this is called: a `DecoupledEditor` editable, and the editable of any editor created from a data string,
	 * is mounted by the integrator at an arbitrary point in time. The injection waits for it.
	 */
	private _syncStylesFromHead( root: ModelRootElement ): void {
		if ( !isAllowedRenderStylesFromHead( this.editor ) ) {
			return;
		}

		const domRootElement = getDomRootElement( this.editor, root );

		// No editing root is bound to the model root, which is the case for an editor without a UI. There is
		// nothing to style then.
		if ( !domRootElement ) {
			return;
		}

		this._cancelPendingInjection?.();

		this._cancelPendingInjection = whenElementConnected( domRootElement, () => {
			this._cancelPendingInjection = null;

			this._removeStyleElementsFromDom();
			this._renderStyleElementsInDom( root, getStylesInjectionTarget( domRootElement ) );
		} );
	}

	/**
	 * Removes the `<style>` elements injected by the plugin. Elements are tracked by reference, as they may live
	 * in a `ShadowRoot` rather than in the main document.
	 */
	private _removeStyleElementsFromDom(): void {
		for ( const style of this._injectedStyleElements ) {
			style.remove();
		}

		this._injectedStyleElements.clear();
	}

	/**
	 * Renders the `<style>` elements from the full page data in the given target. CSS content is sanitized before
	 * rendering.
	 */
	private _renderStyleElementsInDom( root: ModelRootElement, target: HTMLHeadElement | ShadowRoot ): void {
		const styleElements = root.getAttribute( '$fullPageHeadStyles' ) as Array<FullPageHeadStyle> | undefined;

		if ( !styleElements ) {
			return;
		}

		const sanitizeCss = this.editor.config.get( 'htmlSupport.fullPage.sanitizeCss' )!;

		for ( const { css, attributes } of styleElements ) {
			const styleElement = createElement( target.ownerDocument!, 'style', attributes );

			// `textContent` is used instead of `innerText`, as the element is not rendered yet.
			styleElement.textContent = sanitizeCss( css ).css;

			target.append( styleElement );

			this._injectedStyleElements.add( styleElement );
		}
	}
}

/**
 * Returns where the `<style>` elements from the full page data should be rendered for the given editing root: the
 * shadow root hosting it, or the `<head>` of its document.
 */
function getStylesInjectionTarget( domRootElement: HTMLElement ): HTMLHeadElement | ShadowRoot {
	const root = domRootElement.getRootNode();

	return isShadowRoot( root ) ? root : domRootElement.ownerDocument.head;
}

/**
 * Returns the DOM element the given model root is rendered in, or `null` when no editing root is bound to it yet.
 */
function getDomRootElement( editor: Editor, root: ModelRootElement ): HTMLElement | null {
	const viewRootElement = editor.editing.mapper.toViewElement( root );
	const domRootElement = viewRootElement && editor.editing.view.domConverter.mapViewToDom( viewRootElement );

	return ( domRootElement as HTMLElement | undefined ) || null;
}

/**
 * Normalize the Full page configuration option `allowRenderStylesFromHead`.
 */
function isAllowedRenderStylesFromHead( editor: Editor ): boolean {
	return editor.config.get( 'htmlSupport.fullPage.allowRenderStylesFromHead' )!;
}
