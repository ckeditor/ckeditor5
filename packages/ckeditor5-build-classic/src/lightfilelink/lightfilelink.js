import LightFileLinkEditing from './lightfilelinkediting.js';
import LightFileLinkUI from './lightfilelinkui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class LightFileLink extends Plugin {

	static get pluginName() {
		return 'LightFileLink';
	}

    static get requires() {
        return [LightFileLinkEditing, LightFileLinkUI];
    }
}