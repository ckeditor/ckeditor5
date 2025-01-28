/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Enter,
	ShiftEnter,
	EnterCommand,
	ShiftEnterCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Enter.pluginName ]: Enter;
		[ ShiftEnter.pluginName ]: ShiftEnter;
	}

	interface CommandsMap {
		enter: EnterCommand;
		shiftEnter: ShiftEnterCommand;
	}
}
