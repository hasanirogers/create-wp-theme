# Create WP App

A command line tool for scaffolding WordPress applications using customizable templates with variable substitution.

## Features

- 🚀 Interactive CLI prompts using @clack/prompts
- 📝 Template-based scaffolding with variable substitution
- 🎯 Support for multiple prompt types (text, select, multiselect, confirm)
- 📁 Automatic directory creation and file processing
- 📦 Optional dependency installation
- ⚙️ Configurable templates via JSON

## Usage

### As a CLI Tool

```bash
# Install globally
npm install -g create-wp-app

# Create a new app
create-wp-app
```

### Development

```bash
# Clone and install dependencies
git clone <repository>
cd create-wp-app
npm install

# Run in development
npm run exec

# Build for production
npm run build
```

## Template Structure

Create a template directory with the following structure:

```
my-template/
├── template.json          # Template configuration
├── package.json           # Template files with {{variables}}
├── README.md
├── src/
│   └── index.js
└── config/
    └── {{appName}}.json   # Files can use variables in names too
```

### Template Configuration (`template.json`)

```json
{
  "prompts": [
    {
      "name": "appName",
      "type": "text",
      "message": "What is your app name?",
      "default": "My WordPress App"
    },
    {
      "name": "license",
      "type": "select",
      "message": "Choose a license",
      "options": ["MIT", "ISC", "Apache-2.0"],
      "default": "MIT"
    },
    {
      "name": "features",
      "type": "multiselect",
      "message": "Select features to include",
      "options": ["Authentication", "Database", "API"],
      "default": ["Authentication"]
    },
    {
      "name": "useTypeScript",
      "type": "confirm",
      "message": "Use TypeScript?",
      "default": true
    }
  ]
}
```

### Variable Substitution

Use `{{variableName}}` syntax in template files:

- **File content**: Replace variables in any text file
- **File names**: Use variables in file and directory names
- **File paths**: Variables work in nested directory structures

Example `package.json` template:

```json
{
  "name": "{{appName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{author}}",
  "license": "{{license}}"
}
```

## Prompt Types

### Text Input
```json
{
  "name": "appName",
  "type": "text",
  "message": "App name?",
  "default": "My App"
}
```

### Select (Single Choice)
```json
{
  "name": "license",
  "type": "select",
  "message": "Choose license",
  "options": ["MIT", "ISC", "Apache-2.0"],
  "default": "MIT"
}
```

### Multiselect (Multiple Choice)
```json
{
  "name": "features",
  "type": "multiselect",
  "message": "Select features",
  "options": ["Auth", "DB", "API"],
  "default": ["Auth"]
}
```

### Confirm (Yes/No)
```json
{
  "name": "useTypeScript",
  "type": "confirm",
  "message": "Use TypeScript?",
  "default": true
}
```

## Example

The tool comes with a default template in `templates/default/`. Run:

```bash
npm run exec
```

Then use the template path `./templates/default` and provide your answers to generate a new application.

## License

ISC
