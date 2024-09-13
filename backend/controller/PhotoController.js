const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

// Inserir uma foto com um usuário relacionado
const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const image = req.file.filename;

    const reqUser = req.user

    const user = await User.findById(reqUser._id);

    // Criar uma foto
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name
    });

    // Se a foto foi criada com sucesso, retorna o data
    if (!newPhoto) {
        res.status(422).json({ errors: ["Houve um problema na criação da foto. Por favor, tente novamente mais tarde."] });
        return
    }

    res.status(201).json(newPhoto);
};

// Excluir uma foto do DB
const deletePhoto = async (req, res) => {
    const { id } = req.params;

    const reqUser = req.user;

    try {
        const photo = await Photo.findById(id);

        // Verifica se a foto existe
        if (!photo) {
            res.status(404).json({ errors: ["Foto não encontrada."] });
            return
        }

        // Verifica se a foto pertence ao usuário
        if (!photo.userId.equals(reqUser._id)) {
            res.status(422).json({ errors: ["Ocorreu um erro. Por favor, tente novamente mais tarde."] });
            return
        }

        await Photo.findByIdAndDelete(photo._id);

        res.status(200).json({ id: photo._id, message: "Foto excluída com sucesso." })
    } catch (error) {
        res.status(404).json({ errors: ["Foto não encontrada."] });
    }
}

// Obter todas as fotos
const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);
}

// Obter as fotos do usuário
const getUserPhotos = async (req, res) => {
    const { id } = req.params;

    const photos = await Photo.find({ userId: id }).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);

}

// Obter uma foto pelo ID
const getPhotoById = async (req, res) => {
    const { id } = req.params;

    const photo = await Photo.findById(id);

    // Verifica se a foto existe
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada."] });
        return
    }

    res.status(200).json(photo);
}

// Atualizar uma foto
const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // Verifica se a foto existe
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada."] });
        return
    }

    // Verifica se a foto pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
        res.status(422).json({ errors: ["Ocorreu um erro. Por favor, tente novamente mais tarde."] });
        return
    }

    if (title) {
        photo.title = title;
    }

    await photo.save();

    res.status(200).json({ photo, message: "Foto atualizada com sucesso." })
}

// Like em uma foto
const likePhoto = async (req, res) => {
    const { id } = req.params;

    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // Verifica se a foto existe
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada."] });
        return
    }

    // Verificar se o usuário já curtiu a foto
    if (photo.likes.includes(reqUser._id)) {
        res.status(422).json({ errors: ["Você já curtiu a foto."] });
        return
    }

    // Inserir o usuário no array de likes
    photo.likes.push(reqUser._id);

    photo.save();

    res.status(200).json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida." });
}

// Comentários de uma foto
const commentPhoto = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    const photo = await Photo.findById(id);

    // Verifica se a foto existe
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada."] });
        return
    }

    // Insere o comentário no array de comentários
    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id
    }

    photo.comments.push(userComment);

    await photo.save();

    res.status(200).json({
        comment: userComment,
        message: "O comentário foi adicionado com sucesso."
    })
}

// Pesquisar imagem pelo título
const searchPhotos = async (req, res) => {
    const { q } = req.query;

    const photos = await Photo.find({title: new RegExp(q, "i")}).exec();

    res.status(200).json(photos);
}

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos
}