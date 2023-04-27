import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CalloutBlocksUI from './calloutblocksui';
import Danger from './danger/danger';
import Info from './info/info';
import Success from './success/success';
import Warning from './warning/warning';

export default class CalloutBlocks extends Plugin {
	static get requires() {
		return [Danger, Info, Success, Warning, CalloutBlocksUI];
	}

	static get pluginName() {
		return 'CalloutBlocks';
	}
}
