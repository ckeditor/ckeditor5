import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ExclamationTriangleRegular from './icons/exclamation-triangle-regular.svg';

export default class CalloutBlocksUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('CalloutBlocksDropdown', locale => {
            const dropdownView = createDropdown(locale);
			const items = []

			items.push(editor.ui.componentFactory.create('info'))
			items.push(editor.ui.componentFactory.create('success'))
			items.push(editor.ui.componentFactory.create('warning'))
			items.push(editor.ui.componentFactory.create('danger'))
			addToolbarToDropdown(dropdownView, items)

			dropdownView.buttonView.set( {
				label: t('Insert Callout'),
				icon: ExclamationTriangleRegular,
				tooltip: true,
			});

			return dropdownView
		});
	}
}
