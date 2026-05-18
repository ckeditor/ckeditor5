/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstylecommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { getSelectedMediaModelWidget } from '../utils.js';
import { DEFAULT_STYLE_NAME } from './constants.js';
import type { MediaStyleOptionDefinition } from '../mediaembedconfig.js';

/**
 * The media embed style command. It is used to apply a style option (e.g. an alignment) to a
 * selected media embed.
 *
 * The set of accepted style values comes from the resolved
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
 * options. Values not in that set are silently rejected by {@link #execute}.
 */
export class MediaEmbedStyleCommand extends Command {
	/**
	 * The current media style name, or `false` when the command is disabled (no media selected).
	 * Falls back to {@link #_defaultStyleName} when the selected media has no `mediaStyle` attribute
	 * or its attribute value is not in the resolved options list — so the default-state UI button
	 * lights up on insert and after a configuration change drops a previously-applied style.
	 */
	declare public value: string | false;

	/**
	 * Names of the styles handled by this command. The command only needs membership lookups,
	 * not the full definitions — those are owned by the editing plugin.
	 */
	private readonly _styleNames: Set<string>;

	/**
	 * The effective default style name — the `name` of the style with `isDefault: true` in the
	 * resolved options, or {@link module:media-embed/mediaembedstyle/constants~DEFAULT_STYLE_NAME}
	 * as the ultimate fallback when the integrator dropped the default without a replacement.
	 */
	private readonly _defaultStyleName: string;

	/**
	 * Creates an instance of the media embed style command.
	 *
	 * @param editor The editor instance.
	 * @param styles The resolved list of style options that this command will accept.
	 */
	constructor( editor: Editor, styles: Array<MediaStyleOptionDefinition> ) {
		super( editor );

		this._styleNames = new Set( styles.map( style => style.name ) );

		const defaultStyle = styles.find( style => style.isDefault );

		this._defaultStyleName = defaultStyle ? defaultStyle.name : DEFAULT_STYLE_NAME;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const element = getSelectedMediaModelWidget( this.editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !element ) {
			this.value = false;
		} else if ( element.hasAttribute( 'mediaStyle' ) ) {
			const styleName = element.getAttribute( 'mediaStyle' ) as string;

			// A previously-applied style may have been dropped from the resolved options list
			// (e.g. by a config change). Fall back to the effective default so the UI stays
			// consistent with what the downcast actually renders (no class for unknown names).
			this.value = this._styleNames.has( styleName ) ? styleName : this._defaultStyleName;
		} else {
			this.value = this._defaultStyleName;
		}
	}

	/**
	 * Executes the command and applies the chosen style to the currently selected media embed.
	 *
	 * ```ts
	 * editor.execute( 'mediaStyle', { value: 'alignLeft' } );
	 * editor.execute( 'mediaStyle', { value: 'alignCenter' } ); // removes the attribute — alignCenter is the built-in default
	 * editor.execute( 'mediaStyle', { value: null } );          // removes the attribute
	 * ```
	 *
	 * The default style is encoded on the model as the absence of the `mediaStyle` attribute.
	 * Passing the default style name (or `null`) therefore clears the attribute — this branch
	 * runs even when the default style itself was excluded from the resolved options, so the
	 * "clear alignment" intent always works. Values that are neither falsy, the default name,
	 * nor present in the resolved options list are silently rejected.
	 *
	 * @param options
	 * @param options.value The name of the style to apply, or `null` to clear the alignment.
	 * @fires execute
	 */
	public override execute( options: { value: string | null } ): void {
		const model = this.editor.model;
		const element = getSelectedMediaModelWidget( model.document.selection )!;
		const requestedStyle = options.value;

		if ( !requestedStyle || requestedStyle === this._defaultStyleName ) {
			model.change( writer => {
				writer.removeAttribute( 'mediaStyle', element );
			} );

			return;
		}

		// Reject names that are not part of the resolved options list.
		if ( !this._styleNames.has( requestedStyle ) ) {
			return;
		}

		model.change( writer => {
			writer.setAttribute( 'mediaStyle', requestedStyle, element );
		} );
	}
}
