const mongoose = require("mongoose");

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const conn = async () => {

    try {
        
        const dbConn = mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.et0kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);

        console.log("Conectou ao banco de dados.")

        return dbConn

    } catch (error) {
        console.log(error);
    }

}

conn();

module.exports = conn;