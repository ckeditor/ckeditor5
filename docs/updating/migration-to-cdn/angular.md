---
menu-title: Migrate Angular integration from NPM to CDN
meta-title: Vue CKEditor 5 - migrate integration from NPM to CDN | CKEditor 5 documentation
meta-description: Migrate Angular CKEditor 5 integration from NPM to CDN in a few simple steps. Learn how to install Angular CKEditor 5 integration in your project using the CDN.
category: migrations
order: 20
---

# Migrating Angular CKEditor&nbsp;5 integration from NPM to CDN

This guide will help you migrate Angular CKEditor&nbsp;5 integration from an NPM-based installation to a CDN-based installation.

## Prerequisites

Remove the existing CKEditor&nbsp;5 packages from your project. If you are using the NPM-based installation, you can remove it by running the following command:

```bash
npm uninstall ckeditor5 ckeditor5-premium-features
```

Upgrade the CKEditor&nbsp;5 Angular integration to the latest version. You can find the latest version in the [CKEditor&nbsp;5 Builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/angular.html) documentation.

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN scripts injection might be not recognized properly in such environments.

## Migration steps

### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor 5 imports in your Vue components, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, ... } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';
```
