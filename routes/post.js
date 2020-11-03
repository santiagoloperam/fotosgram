"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacion_1 = require("../middlewares/autenticacion");
const post_model_1 = require("../models/post.model");
const file_system_1 = __importDefault(require("../classes/file-system"));
const postRoutes = express_1.Router();
const fileSystem = new file_system_1.default();
//Obtener Posts paginados lo dejamos publicos pero se puede poner token
postRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Resivimos la pagina dentro de los params opcionales en url del request como 'query'
    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 10;
    //Búsqueda de todos los registros
    const posts = yield post_model_1.Post.find()
        .sort({ _id: -1 })
        .skip(skip) //Registros a saltar para pasar de página
        .limit(10)
        .populate('usuario', '-password')
        .exec();
    res.json({
        ok: true,
        pagina,
        posts
    });
}));
//Crear Post
postRoutes.post('/create', [autenticacion_1.verificaToken], (req, res) => {
    const body = req.body;
    // El usuario (req.usuario) se recibe en el middleware verificationToken o middleware de autenticación
    body.usuario = req.usuario._id;
    //Array de las Imagenes creadas pasadas de temp hacia post del usuario antes de crear el post
    const imagenes = fileSystem.imagenesDesdeTempHaciaPost(req.usuario._id);
    //En el modelo de post.model para moongose el campo es un array de strings de nombre imgs que estan en la carpeta Post
    body.imgs = imagenes;
    //Ya tengo el usuario y el post del body para guardar en BD
    post_model_1.Post.create(body).then((postDB) => __awaiter(void 0, void 0, void 0, function* () {
        yield postDB.populate('usuario', '-password').execPopulate();
        res.json({
            ok: true,
            post: postDB
        });
    })).catch(err => {
        res.json(err);
    });
});
//Rutas-Servicios para subir archivos
postRoutes.post('/upload', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningún archivo'
        });
    }
    const file = req.files.image;
    //si la peticion viene sin la propiedad image o archivo con esa llave
    if (!file) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningún archivo - Image'
        });
    }
    // Si la petició no incluye un archivo tipo image
    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Lo que subió no es una imagen'
        });
    }
    //El file se obtiene del body despues de todas las validaciones y el userId del token
    yield fileSystem.guardarImagenTemporal(file, req.usuario._id);
    res.json({
        ok: true,
        file: file
    });
}));
// NUEVO MÉTODO PARA MOSTRAR IMAGENES POR USUARIO Y NOMBRE DE IMG (sin token para q las imgs sean públicas)
postRoutes.get('/imagen/:userid/:img', (req, res) => {
    const userId = req.params.userid;
    const img = req.params.img;
    const pathFoto = fileSystem.getFotoUrl(userId, img);
    // res.sendFile entrega el archivo que está en ese path
    res.sendFile(pathFoto);
});
exports.default = postRoutes;
