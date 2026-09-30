/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox/ckboximageedit/ckboximageeditediting
 */

import { PendingActions, Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { Notification } from '@ckeditor/ckeditor5-ui';
import { ImageEditing, ImageUtils } from '@ckeditor/ckeditor5-image';
import { isTrustedTypesEnforced, logWarning } from '@ckeditor/ckeditor5-utils';
import { CKBoxImageEditCommand } from './ckboximageeditcommand.js';
import { CKBoxEditing } from '../ckboxediting.js';
import { CKBoxUtils } from '../ckboxutils.js';

/**
 * The CKBox image edit editing plugin.
 */
export class CKBoxImageEditEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxImageEditEditing' as const;
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
	public static get requires(): PluginDependenciesOf<[
		CKBoxEditing,
		CKBoxUtils,
		PendingActions,
		Notification,
		ImageUtils,
		ImageEditing
	]> {
		return [
			CKBoxEditing,
			CKBoxUtils,
			PendingActions,
			Notification,
			ImageUtils,
			ImageEditing
		];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;

		const imageEditCommand = new CKBoxImageEditCommand( editor );

		editor.commands.add( 'ckboxImageEdit', imageEditCommand );

		// The image editor of CKBox writes its markup as a plain string, so under enforcement it never loads the image.
		// Disabling greys out its toolbar button instead of leaving one that opens an editor stuck on loading.
		if ( isTrustedTypesEnforced() ) {
			/**
			 * The CKBox image editor is not available, because the application enforces Trusted Types with the
			 * `require-trusted-types-for 'script'` CSP directive. The image editor writes HTML in a way that this directive
			 * rejects, and the editor cannot change how it does that. Choosing assets in CKBox still works.
			 *
			 * The editor disables its own **Edit image** button. The **Edit** button in the CKBox dialog is part of CKBox, so
			 * it stays available, but the image editor that it opens cannot load the image either.
			 *
			 * For a detailed overview, check the {@glink getting-started/setup/csp#known-limitations Content Security
			 * Policy} guide.
			 *
			 * @error ckbox-image-edit-unavailable-with-trusted-types
			 */
			logWarning( 'ckbox-image-edit-unavailable-with-trusted-types' );

			imageEditCommand.forceDisabled( 'trustedTypes' );
		}
	}
}
