/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstylecommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { getSelectedMediaModelWidget } from '../utils.js';
import type { NormalizedMediaStyleOption } from '../mediaembedconfig.js';

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
	 * The currently-applied style name. `false` when no style applies — either no media is
	 * selected, or the selected media has no `mediaStyle` attribute and no style in
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
	 * is marked `isDefault: true`.
	 */
	declare public value: string | false;

	/**
	 * Resolved styles indexed by `name`. Used to look up the `isDefault` flag at execute time
	 * (any default-marked style clears the attribute) and to validate that a requested style
	 * is part of the resolved options list.
	 */
	private readonly _styles: Map<string, NormalizedMediaStyleOption>;

	/**
	 * The `name` of the first style with `isDefault: true` in the resolved options, or `null`
	 * when the integrator did not designate a default. Exposed via {@link #value} when the
	 * selected media has no `mediaStyle` attribute, so the default-state UI button can light up.
	 * Does not gate the "clear attribute" branch in {@link #execute} — that uses the per-style
	 * `isDefault` flag so multi-default configs behave consistently with the downcast.
	 */
	private readonly _defaultStyleName: string | null;

	/**
	 * Creates an instance of the media embed style command.
	 *
	 * @param editor The editor instance.
	 * @param styles The resolved list of style options that this command will accept.
	 */
	constructor( editor: Editor, styles: Array<NormalizedMediaStyleOption> ) {
		super( editor );

		this._styles = new Map( styles.map( style => [ style.name, style ] ) );

		const defaultStyle = styles.find( style => style.isDefault );

		this._defaultStyleName = defaultStyle ? defaultStyle.name : null;
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
			this.value = this._styles.has( styleName ) ? styleName : ( this._defaultStyleName ?? false );
		} else {
			this.value = this._defaultStyleName ?? false;
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
	 * Passing any `isDefault: true` style name (or `null`) therefore clears the attribute. Values
	 * that are neither falsy, an `isDefault` style, nor present in the resolved options list are
	 * silently rejected.
	 *
	 * @param options
	 * @param options.value The name of the style to apply, or `null` to clear the alignment.
	 * @fires execute
	 */
	public override execute( options: { value: string | null } ): void {
		const model = this.editor.model;
		const element = getSelectedMediaModelWidget( model.document.selection )!;
		const requestedStyle = options.value;

		// Falsy value or any `isDefault: true` style clears the attribute. Default styles encode
		// as attribute-absence on the model. The downcast emits no class for them.
		if ( !requestedStyle || this._styles.get( requestedStyle )?.isDefault ) {
			model.change( writer => {
				writer.removeAttribute( 'mediaStyle', element );
			} );

			return;
		}

		// Reject names that are not part of the resolved options list.
		if ( !this._styles.has( requestedStyle ) ) {
			return;
		}

		model.change( writer => {
			writer.setAttribute( 'mediaStyle', requestedStyle, element );
		} );
	}
}
