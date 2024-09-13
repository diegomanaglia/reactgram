const express = require("express");
const router = express();

router.use("/api/users", require("./UserRoutes"));
router.use("/api/photos", require("./PhotoRoutes"));

// Testando uma rota
router.get("/", (req, res) => {
    res.send("API está funcionando!");
})

module.exports = router;