"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const autenticacion_1 = require("../middlewares/autenticacion");
const userRoutes = express_1.Router();
//Login
userRoutes.post('/login', (req, res) => {
    //Agarro todas los atributos del body
    const body = req.body;
    //Busco el usuario del modelo User de mongoose por email
    usuario_model_1.Usuario.findOne({ email: body.email }, (err, userDB) => {
        if (err)
            throw err;
        if (!userDB) {
            return res.json({
                ok: false,
                mensaje: 'Usuario/Contraseña incorrectas'
            });
        }
        //Si la petición se envio y el email existe...metodo para comparar contraseña
        if (userDB.compararPassword(body.password)) {
            //Si entro aqui el password esta ok
            const tokenUser = token_1.default.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });
            return res.json({
                ok: true,
                token: tokenUser
            });
        }
        else {
            //Contraseña no válida
            return res.json({
                ok: false,
                mensaje: 'Usuario/Contraseña incorrectas ****'
            });
        }
    });
});
//Crear un usuario
userRoutes.post('/create', (req, res) => {
    const user = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: bcrypt_1.default.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };
    usuario_model_1.Usuario.create(user).then(userDB => {
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        return res.json({
            ok: true,
            token: tokenUser
        });
    }).catch(err => {
        res.json({
            ok: false,
            err
        });
    });
});
//Actualizar Usuario
//Crear un usuario
userRoutes.post('/update', autenticacion_1.verificaToken, (req, res) => {
    const user = {
        // Si el valor no viene en el body del request viene con el request del token
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.Usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    };
    //El new: true es para que traiga data actualizada
    usuario_model_1.Usuario.findByIdAndUpdate(req.usuario._id, user, { new: true }, (err, userDB) => {
        if (err)
            throw err;
        if (!userDB) {
            return res.json({
                ok: false,
                mensaje: ' No existe un usuario con ese ID!'
            });
        }
        // Como si existe ese usuario actualizado se genera nuevo token con la data
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        return res.json({
            ok: true,
            token: tokenUser
        });
    });
});
//RUTA PARA RETORNAR SOLO LA INFO DEL USUARIO DEL TOKEN
userRoutes.get('/', [autenticacion_1.verificaToken], (req, res) => {
    // Cuando el toquen es correcto el request decodifica el token y lo pone en usuario
    const usuario = req.usuario;
    res.json({
        ok: true,
        usuario
    });
});
exports.default = userRoutes;
