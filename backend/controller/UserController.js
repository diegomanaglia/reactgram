const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Gerar token do usuário
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "7d"
    })
}

// Registrar usuário e fazer login
const register = async (req, res) => {

    const { name, email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ email })

    if (user) {
        res.status(422).json({ errors: ["Usuário já cadastrado com este e-mail."] });
        return
    }

    // Gerar a senha hash
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    });

    // Verificar se o usuário foi criado com sucesso -> retorna o token
    if (!newUser) {
        res.status(422).json({ errors: ["Houve um erro. Por favor, tente novamente mais tarde."] });
        return
    }

    // Retorna os dados do usuário e o token de autenticação
    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id)
    })
};

// Fazer login do usuário
const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Verificar se o usuário existe no banco de dados
    if (!user) {
        res.status(404).json({ errors: ["Usuário não encontrado."] });
        return
    }

    // Verificar se a senha confere
    if (!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({ errors: ["Senha incorreta."] });
        return
    }

    // Retorna o token de autenticação
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id)
    })
}

// Pegar usuário logado atual
const getCurrentUser = async (req, res) => {
    const user = req.user;
    res.status(200).json(user);
}

// Atualizar um usuário
const update = async (req, res) => {

    const { name, password, bio } = req.body;

    let profileImage = null;

    if (req.file) {
        profileImage = req.file.filename;
    }

    const reqUser = req.user;

    const user = await User.findById(reqUser._id).select("-password");

    if (name) {
        user.name = name;
    }

    if (password) {
        // Gerar a senha hash
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        user.password = passwordHash;
    }

    if (profileImage) {
        user.profileImage = profileImage;
    }

    if (bio) {
        user.bio = bio;
    }

    await user.save();

    res.status(200).json(user);
};

// Pegar um usuário pelo ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select("-password");

        // Verificar se o usuário existe
        if (!user) {
            res.status(404).json({ errors: ["Usuário não encontrado."] });
            return
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ errors: ["Usuário não encontrado."] });
    }



}


module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById
}