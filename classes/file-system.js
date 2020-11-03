"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//path sirve para que node sepa el directorio desde donde arranca el proyecto
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs")); //Gestiona archivos y carpetas
const uniqid_1 = __importDefault(require("uniqid"));
class FileSystem {
    constructor() { }
    ;
    guardarImagenTemporal(file, userId) {
        return new Promise((resolve, reject) => {
            //Crear carpetas y crearCarpetaUsuario devuelve la Temporal
            const path = this.crearCarpetaUsuario(userId);
            //Nombre archivo
            const nombreArchivo = this.generarNombreUnico(file.name);
            //Mover el archivo a nuestra carpeta Temp
            file.mv(`${path}/${nombreArchivo}`, (err) => {
                if (err) {
                    //No se pudo mover
                    reject(err);
                }
                else {
                    //Todo salio bien
                    resolve();
                }
            });
        });
    }
    generarNombreUnico(nombreOriginal) {
        //Extraer extencion del archivo.. ej: xxxx.jpg
        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1];
        const idUnico = uniqid_1.default();
        return `${idUnico}.${extension}`;
    }
    crearCarpetaUsuario(userId) {
        //__dirname es el directorio desde la raiz hasta donde estoy y el segundo parametro hacia donde me muevo
        //le agrego el userID al directorio
        const pathUser = path_1.default.resolve(__dirname, '../uploads', userId);
        const pathUserTemp = pathUser + '/temp';
        console.log(pathUser);
        //Verificar con node si una carpeta existe
        const existe = fs_1.default.existsSync(pathUser);
        if (!existe) {
            fs_1.default.mkdirSync(pathUser);
            fs_1.default.mkdirSync(pathUserTemp);
        }
        return pathUserTemp;
    }
    /// PASAR ARCHIVOS DE CARPETA TEMP DE UN USUARI A POST AL CREAR UN POST
    imagenesDesdeTempHaciaPost(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads', userId, 'temp');
        const pathPost = path_1.default.resolve(__dirname, '../uploads', userId, 'posts');
        if (!fs_1.default.existsSync(pathTemp)) {
            return [];
        }
        //Si el usuario tiene la carpeta temp pero no post
        if (!fs_1.default.existsSync(pathPost)) {
            fs_1.default.mkdirSync(pathPost);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userId);
        //PASA LOS ARCHIVOS DE CARPETA SOLO CON REONOMBRAR EL PATH
        imagenesTemp.forEach(imagen => {
            fs_1.default.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
        });
        return imagenesTemp;
    }
    obtenerImagenesEnTemp(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads', userId, 'temp');
        return fs_1.default.readdirSync(pathTemp) || [];
    }
    // Trae el path de la foto que se va a usar en las rutas post mediante res.sendFile
    getFotoUrl(userId, img) {
        //Path de los Posts
        const pathFoto = path_1.default.resolve(__dirname, '../uploads', userId, 'posts', img);
        // Verificar si existe la img
        const existe = fs_1.default.existsSync(pathFoto);
        if (!existe) {
            return path_1.default.resolve(__dirname, '../assets/400x250.jpg');
        }
        return pathFoto;
    }
}
exports.default = FileSystem;
