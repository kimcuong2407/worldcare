import fs from 'fs';
/* eslint-disable */
const serverService = {
  getVersion: () => {
    let filepath = 'package.json';
    let i = 0;
    const server: {
      status?: string,
      version?: string,
      name?: string
    } = { status: 'up' };

    do {
      filepath = `${require.main.paths[i].replace(/\/[^\/]*$/, '/')}package.json`;
      i += 1;
    }
    while (!fs.existsSync(filepath) && i < require.main.paths.length);
    const pkg = require(`${filepath}`);
    server.name = pkg.name;
    server.version = pkg.version;
    return server;
  },
};

export default serverService;
