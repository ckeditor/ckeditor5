/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/fullpage
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { logWarning, global } from 'ckeditor5/src/utils.js';
import {
	UpcastWriter,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent,
	type RootElement
} from 'ckeditor5/src/engine.js';

import HtmlPageDataProcessor from './htmlpagedataprocessor.js';

/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export default class FullPage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullPage' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'fullPage', {
			allowRenderStylesFromHead: false,
			sanitizeCss: rawCss => {
				/**
				 * When using the Full page with the `config.fullPage.allowRenderStylesFromHead` set to `true`,
				 * it is strongly recommended to define a sanitize function that will clean up the CSS
				 * which is present in the `<head>` in editors content in order to avoid XSS vulnerability.
				 *
				 * For a detailed overview, check the {@glink TODO} documentation.
				 *
				 * @error html-embed-provide-sanitize-function
				 */
				logWarning( 'css-full-page-provide-sanitize-function' );

				return {
					css: rawCss,
					hasChanged: false
				};
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const properties = [ '$fullPageDocument', '$fullPageDocType', '$fullPageXmlDeclaration' ];

		editor.data.processor = new HtmlPageDataProcessor( editor.data.viewDocument );

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

			const allowRenderStylesFromHead = isAllowedRenderStylesFromHead( editor );

			if ( allowRenderStylesFromHead ) {
				this._renderStylesFromHead( root );
			}
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

			const writer = new UpcastWriter( viewFragment.document );

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
	 * Checks if in the document exists any `<style>` elements injected by the plugin and removes them,
	 * so these could be re-rendered later.
	 * There is used `data-full-page-style-id` attribute to recognize styles injected by the feature.
	 */
	private _removeStyleElementsFromDom(): void {
		const existingStyleElements = Array.from(
			global.document.querySelectorAll( `[data-full-page-style-id="${ this.editor.id }"]` )
		);

		for ( const style of existingStyleElements ) {
			style.remove();
		}
	}

	/**
	 * Extracts `<style>` elements from the full page data and renders them in the main document `<head>`.
	 * CSS content is sanitized before rendering.
	 *
	 * @param fullPageData Represents the full page data passed to the editor as a string.
	 */
	private _renderStyleElementsInDom( fullPageData: string ): void {
		// Use DOMParser for easier elements extraction and unwanted code execution prevention.
		const domParser = new DOMParser();
		const doc = domParser.parseFromString( fullPageData, 'text/html' );
		const sanitizeCss = this.editor.config.get( 'fullPage.sanitizeCss' )!;

		// Extract `<style>` elements from the `<head>` from the full page data.
		const styleElements: Array<HTMLStyleElement> = Array.from( doc.querySelectorAll( 'head style' ) );

		// Add `data-full-page-style` attribute to the `<style>` element and render it in `<head>` in the main document.
		for ( const style of styleElements ) {
			style.setAttribute( 'data-full-page-style-id', this.editor.id );

			// Sanitize the CSS content before rendering it in the editor.
			const sanitizedCss = sanitizeCss( style.innerText );

			if ( sanitizedCss.hasChanged ) {
				style.innerText = sanitizedCss.css;
			}

			global.document.head.append( style );
		}
	}

	/**
	 * Removes existing `<style>` elements injected by the plugin and renders new ones from the full page data.
	 *
	 * @param root Represents the root element of the model.
	 */
	private _renderStylesFromHead( root: RootElement ) {
		const fullPageData = root.getAttribute( '$fullPageDocument' ) as string;

		this._removeStyleElementsFromDom();
		this._renderStyleElementsInDom( fullPageData );
	}
}

/**
 * Normalize the Full page configuration option `allowRenderStylesFromHead`.
 */
function isAllowedRenderStylesFromHead( editor: Editor ): boolean {
	const allowRenderStylesFromHead = editor.config.get( 'fullPage.allowRenderStylesFromHead' );

	// When not defined, option `allowRenderStylesFromHead` by default is set to `false`.
	return allowRenderStylesFromHead !== undefined ? allowRenderStylesFromHead : false;
}
