require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT;

const app = express();

// Configurar para receber respostas JSON e form-data
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Resolver CORS
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Diretório de uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Conexão com banco de dados
require("./config/db.js")

// Importando as rotas
const router = require("./routes/Router.js");

app.use(router);

app.listen(port, () => {
    console.log(`App rodando na porta ${port} | http://localhost:${port}`)
});