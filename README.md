# MCP Web Store Desktop

A desktop application for managing MCP servers from the MCP Web Store (mcpwebstore.com).

## Features

- Install MCPs directly from mcpwebstore.com via protocol handler
- Manage installed MCPs (start, stop, uninstall)
- System tray integration for easy access
- Dark/light mode support based on system preference

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcpwebstore-desktop.git
cd mcpwebstore-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Run the app in development mode:
```bash
npm start
```

### Building

To build the app for distribution:

```bash
npm run build
```

This will create distributables in the `dist` folder.

## Protocol Handler

The app registers a custom protocol handler for `mcpwebstore://` URLs. This allows direct installation of MCPs from the web store.

## License

[ISC](LICENSE) 