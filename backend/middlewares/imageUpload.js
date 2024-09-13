const multer = require("multer");
const path = require("path");

// Destino do armazenamento da imagem
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "";

        if (req.baseUrl.includes("users")) {
            folder = "users";
        } else if (req.baseUrl.includes("photos")) {
            folder = "photos";
        }

        cb(null, `uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const imageUpload = multer({
    storage: imageStorage,
    fileFilter (req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            // Verifica se a imagem está em PSN ou JPG
            return cb(new Error("Por favor, envie uma imagem em PNG ou JPG"))
        }

        cb(undefined, true)
    }
})

module.exports = { imageUpload };