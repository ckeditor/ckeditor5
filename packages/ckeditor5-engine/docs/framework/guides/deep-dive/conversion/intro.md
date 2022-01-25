---
category: framework-deep-dive-conversion
menu-title: Introduction
order: 10
since: 33.0.0
---

# Introduction

## What is the conversion?

As you may know, the editor works on two layers - model and view. The process of transforming one into the other is called conversion.

When you load data into the editor, the view is created out of the markup, then, with the help of the upcast converters, the model is created. Once that is done, the model becomes the editor state.

All changes (e.g. typing or pasting from the clipboard) are then applied directly to the model. In order to update the editing view (the one being displayed to the user), the engine transforms changes in the model to the view. The same process is executed when data needs to be generated (e.g. when you copy editor content or use `editor.getData()`).

You can think about upcast and downcast as about processes working in opposite directions (symmetrical to each other).

Following chapters will teach you how to create the right converter for each case, when creating your very own CKEditor 5 plugin.

## Table of contents

* **{@link framework/guides/deep-dive/conversion/downcast Model to view - downcast}**

	Model has to be transformed into the view. Learn how to achieve that by creating downcast converters.

* **{@link framework/guides/deep-dive/conversion/upcast View to model - upcast}**

	Raw data coming into the editor has to be transformed into the model. Learn how to achieve that by creating upcast converters.

* **{@link framework/guides/deep-dive/conversion/helpers/intro Conversion helpers}**

	There are plenty of ways to transform data between model and view. To help you do this as efficiently as possible we provided many functions speeding up this process. This chapter will help you choose the right helper for the job.
