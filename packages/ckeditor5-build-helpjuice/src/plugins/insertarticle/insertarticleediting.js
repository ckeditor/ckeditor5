import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class InfoEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('insertedArticle', {
			isObject: true,
			allowWhere: '$block'
		});

		schema.register('insertedArticleBody', {
			isLimit: true,
			allowIn: 'insertedArticle',
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('insertedArticleBody') && childDefinition.name == 'insertedArticle') {
				return false;
			}
		});

		schema.register("insertedArticleDelete", {
			isObject: true,
			isLimit: true,
			allowIn: "insertedArticle"
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// CONVERSION FOR INSERTED ARTICLE ROOT ELEMENT
		conversion.for('upcast').elementToElement({
			model: 'insertedArticle',
			view: {
				name: 'div',
				classes: ['helpjuice-inserted-article', 'notranslate']
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'insertedArticle',
			view: {
				name: 'div',
				classes: ['helpjuice-inserted-article', 'notranslate']
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'insertedArticle',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-inserted-article notranslate' });

				return toWidget(div, viewWriter, { label: 'Insert Article' });
			}
		});

		// CONVERSION FOR INSERTED ARTICLE BODY
		conversion.for('upcast').elementToElement({
			model: 'insertedArticleBody',
			view: {
				name: 'div',
				classes: 'helpjuice-inserted-article-body'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'insertedArticleBody',
			view: {
				name: 'div',
				classes: 'helpjuice-inserted-article-body'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'insertedArticleBody',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-inserted-article-body' });

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "insertedArticleDelete",
			view: {
				name: "div",
				classes: "helpjuice-inserted-article-delete"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "insertedArticleDelete",
			view: {
				name: "div",
				classes: "helpjuice-inserted-article-delete"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "insertedArticleDelete",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-inserted-article-delete" });
				return toWidget(div, viewWriter);
			}
		});
	}
}
