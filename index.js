"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const usuario_1 = __importDefault(require("./routes/usuario"));
const post_1 = __importDefault(require("./routes/post"));
const server = new server_1.default();
//Body Parser me prepara los request de mi petición
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//File Upload prepara los request tipo files en una sección especial
server.app.use(express_fileupload_1.default());
//Configuración CORS
server.app.use(cors_1.default({ origin: true, credentials: true }));
//Rutas de mi aplicación
server.app.use('/user', usuario_1.default);
server.app.use('/posts', post_1.default);
//Conectar a DB
// mongoose.connect('mongodb://localhost:27017/fotosgram',
mongoose_1.default.connect('mongodb+srv://santi:santi@cluster0.ltwr1.mongodb.net/fotosgram?retryWrites=true&w=majority', { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err)
        throw err;
    console.log('Base de Datos ONLINE!!!!!');
});
//Levantar express
server.start(() => {
    console.log(`servidor corriendo en el puerto ${server.port}!!!`);
});
