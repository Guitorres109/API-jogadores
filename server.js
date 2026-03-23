require("dotenv").config();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const express = require("express");
const cors = require("cors");
const path = require("path");

const jogadores = require("./data/jogadores.json");

const app = express();

app.use(cors());

// 🔐 Middleware de API Key
function verificarApiKey(req, res, next) {
    const chave = req.query.key || req.headers["x-api-key"];

    if (!chave) {
        return res.status(401).json({
            status: "error",
            message: "API Key não fornecida"
        });
    }

    if (chave !== API_KEY) {
        return res.status(403).json({
            status: "error",
            message: "API Key inválida"
        });
    }

    next();
}

// 📁 Servir imagens
app.use("/img", express.static(path.join(__dirname, "data/img")));

// 🎲 Função para sortear
function sortear(array) {
    const i = Math.floor(Math.random() * array.length);
    return array[i];
}

// 🌐 Rotas HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html/server.html"));
});

app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "html/api.html"));
});

// ✅ Verificação
app.get("/verificar", (req, res) => {
    res.json({
        status: "success",
        message: "Servidor está online e respondendo!"
    });
});

// 🎲 Jogador aleatório
app.get("/api/jogadores/aleatorio", verificarApiKey, (req, res) => {
    const nomes = Object.keys(jogadores);
    const nomeSorteado = sortear(nomes);
    const jogador = jogadores[nomeSorteado];
    const foto = sortear(jogador.foto);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
        status: "success",
        message: `Jogador: ${jogador.nome}\nIdade: ${jogador.idade}\nTime: ${jogador.time}\nNacionalidade: ${jogador.nacionalidade}`,
        foto: `${baseUrl}/img/${foto}`
    });
});

// 🔎 Buscar jogador
app.get("/api/jogadores/:pesquisa", verificarApiKey, (req, res) => {
    const pesquisa = req.params.pesquisa.toLowerCase();
    const jogador = jogadores[pesquisa];

    if (!jogador) {
        return res.status(404).json({
            status: "error",
            message: `Jogador "${pesquisa}" não encontrado`
        });
    }

    const foto = sortear(jogador.foto);
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
        status: "success",
        message: `Jogador: ${jogador.nome}\nIdade: ${jogador.idade}\nTime: ${jogador.time}\nNacionalidade: ${jogador.nacionalidade}`,
        foto: `${baseUrl}/img/${foto}`
    });
});

// 🚀 Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});