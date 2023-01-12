import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FilesIcon from './icons/files.svg';
import { Model, SplitButtonView, addListToDropdown, createDropdown } from 'ckeditor5/src/ui';
import { Collection } from '@ckeditor/ckeditor5-utils';

export default class FilesManagerUI extends Plugin {
	static get pluginName() {
		return 'FilesManager';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('FilesManager', locale => {

			const dropdownView = createDropdown(locale, SplitButtonView);

			// Configure dropdown's button properties:
			dropdownView.buttonView.set({
				label: t('Files Manager'),
				icon: FilesIcon,
				tooltip: true,
				class: "files-manager-btn"
			});

			dropdownView.render();

			const collection = new Collection();

			collection.add({
				type: 'button',
				model: new Model({
					label: 'Upload New File',
					class: 'file-manager-upload-new-file-btn',
					withText: true
				})
			})
			addListToDropdown(dropdownView, collection)

			return dropdownView;
		});
	}
}
