import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertDangerCommand from "./insertdangercommand";

export default class DangerEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add("insertDanger", new InsertDangerCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("danger", {
			isObject: true,
			allowWhere: "$block",
			allowIn: "listItem"
		});

		schema.register("dangerBody", {
			isLimit: true,
			allowIn: "danger",
			allowContentOf: "$root"
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("dangerBody") && childDefinition.name == "danger") {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: ["helpjuice-callout", "danger"],
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("danger");
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "danger",
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement("div", {
					class: "helpjuice-callout danger"
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "danger",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-callout danger"
				});

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: "helpjuice-callout-body",
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("dangerBody");
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "dangerBody",
			view: ( modelElement, { writer } ) => {
				return writer.createEditableElement("div", {
					class: "helpjuice-callout-body"
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "dangerBody",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", {
					class: "helpjuice-callout-body"
				});

				return toWidgetEditable(div, viewWriter);
			}
		});
	}
}
