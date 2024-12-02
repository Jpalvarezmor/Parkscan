// config.js
const config = {
    serverIp: 'http://localhost', // Cambia esto a "http://localhost" cuando trabajes en local
    backendPort: 5000,
    socketPort: 5001,

    get apiBaseUrl() {
        return `${this.serverIp}:${this.backendPort}`;
    },
    get socketBaseUrl() {
        return `${this.serverIp}:${this.socketPort}`;
    }
};

module.exports = config;
