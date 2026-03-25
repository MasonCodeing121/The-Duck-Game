# The Duck Game

A multiplayer browser-based game where players control ducks to collect pancakes and feed a central carrot.

## Architecture

- **Frontend only**: Pure static HTML5 Canvas game, no backend server
- **`index.html`**: Entry point with canvas, room selector UI, and styles
- **`sketch.js`**: Entire game engine — canvas drawing helpers, game logic, and Socket.io multiplayer sync
- **Multiplayer**: Connects to an external Socket.io server at `https://server-5jkd.onrender.com/`

## Running the Project

The project is served as static files using the `serve` package on port 5000.

```
npm run dev
```

## Dependencies

- `serve` ^14.2.4 — static file server

## Game Controls

- **WASD** — move duck
- **Spacebar** — dash (uses stamina)
- **ESC** — exit treehouse scene

## Notes

- The multiplayer server is externally hosted on Render, so multiplayer depends on that server being available
- Game files are in the root directory
