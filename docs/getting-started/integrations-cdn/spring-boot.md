---
category: cloud
meta-title: Using CKEditor 5 with Spring Boot from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Spring Boot using CDN.
order: 130
menu-title: Spring Boot
modified_at: 2025-05-06
---

# Integrating CKEditor&nbsp;5 with Spring Boot from CDN

As a pure JavaScript/TypeScript library, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the Java-based [Spring Boot](https://spring.io/projects/spring-boot).

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Spring Boot project. You can create a basic Spring Boot project using [Spring Initializr](https://start.spring.io/). Refer to the [Spring Boot documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html) to learn how to set up a project in this framework.

This guide is using the "Spring Web" and "Thymeleaf" dependencies selected in the Spring Initializr. Here is the list of dependencies used in the demo project:

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-web</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-test</artifactId>
		<scope>test</scope>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-thymeleaf</artifactId>
	</dependency>
</dependencies>
```

<info-box info>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

## Project structure

The folder structure of the created project should resemble the one below:

```plain
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── demo
│   │   │               └── DemoApplication.java
│   │   └── resources
│   │       ├── static
│   │       │   └── ...
│   │       ├── templates
│   │       │   ├── index.html
│   │       │   └── ...
│   │       └── application.properties
│   └── test
├── pom.xml
└── ...
```

## Adding CKEditor&nbsp;5 container, scripts and styles

First, create or modify the `index.html` file in the `src/main/resources/templates` directory to include the CKEditor&nbsp;5 scripts and styles. All necessary scripts and links are in the HTML snippet below. You can copy and paste them into your template. Open-source and premium features are in separate files, so there are different tags for both types of plugins. Add tags for premium features only if you use them.

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor 5 - Spring Boot CDN Integration</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
	<!-- Add if you use premium features. -->
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
	<!--  -->
	<style>
	.main-container {
		width: 795px;
		margin-left: auto;
		margin-right: auto;
	}
	</style>
</head>
<body>
	<div class="main-container">
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>
	</div>
</body>
</html>
```

## Adding the Editor creation script

Both previously attached scripts expose global variables named `CKEDITOR` and `CKEDITOR_PREMIUM_FEATURES`. You can use them to access the editor class and plugins. In our example, we use object destructuring (a JavaScript feature) to access the editor class from the open-source global variable with a basic set of plugins. You can access premium plugins from the other variable the same way. Then, we pass the whole configuration to the `create()` method. Be aware that you need a proper {@link getting-started/licensing/license-key-and-activation license key} to use the integration.

```html
<script>
	const {
		ClassicEditor,
		Essentials,
		Bold,
		Italic,
		Font,
		Paragraph
	} = CKEDITOR;
	const { FormatPainter } = CKEDITOR_PREMIUM_FEATURES;

	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			licenseKey: '<YOUR_LICENSE_KEY>',
			plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
			toolbar: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
				'formatPainter'
			]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

Now, we need to put our script in the previous template. We need to put the script under the `<div>` element, so the editor can attach to it. Your final template should look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor 5 - Spring Boot CDN Integration</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.umd.js"></script>
	<!-- Add if you use premium features. -->
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/43.0.0/ckeditor5-premium-features.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/43.0.0/ckeditor5-premium-features.umd.js"></script>
	<!--  -->
	<style>
		.main-container {
			width: 795px;
			margin-left: auto;
			margin-right: auto;
		}
	</style>
</head>
<body>
	<div class="main-container">
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>
	</div>
	<script>
		const {
			ClassicEditor,
			Essentials,
			Bold,
			Italic,
			Font,
			Paragraph
		} = CKEDITOR;
		const { FormatPainter } = CKEDITOR_PREMIUM_FEATURES;

		ClassicEditor
			.create( document.querySelector( '#editor' ), {
				licenseKey: '<YOUR_LICENSE_KEY>',
				plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
				toolbar: [
					'undo', 'redo', '|', 'bold', 'italic', '|',
					'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
					'formatPainter'
				]
			} )
			.then( editor => {
				window.editor = editor;
			} )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

To make this work with Spring Boot, you need to create a controller to serve the HTML page. Create a file named `HomeController.java` in your project's main package:

```java
package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/")
	public String home() {
		return "index";
	}
}
```

Finally, run your Spring Boot application using `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows) and navigate to `http://localhost:8080` to see the editor in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
