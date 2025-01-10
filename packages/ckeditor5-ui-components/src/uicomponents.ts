/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/uicomponents
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import getRegistry, { type Registry } from './core/registry.js';

import CKInput from './components/ckinput.js';
import CKLabeledInput from './components/cklabeledinput.js';
import CKForm from './components/ckform.js';

export default class UIComponents extends Plugin {
	private _registry: Registry;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UIComponents' as const;
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

		this._registry = getRegistry( editor );

		this._registry.register( CKForm.componentName, CKForm );
		this._registry.register( CKInput.componentName, CKInput );
		this._registry.register( CKLabeledInput.componentName, CKLabeledInput );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._registry.confirm();
	}
}
