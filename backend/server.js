const http = require("http");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jogadores = require("./data/jogadores.json")
const API_KEY = "minha_chave_super_secreta";
const app = express();
const PORT = 3000;
const os = require("os");
let ip = null;
app.use(cors())

function verificarApiKey(req, res, next) {

    const chave = req.query.key || req.headers["x-api-key"];

    if(!chave){
        return res.status(401).json({
            status: "error",
            message: "API Key não fornecida"
        });
    }

    if(chave !== API_KEY){
        return res.status(403).json({
            status: "error",
            message: "API Key inválida"
        });
    }

    next();
}

app.use(
    "/img",
    express.static(
        path.join(__dirname, "data/img")
    )
)

function sortear(array){
    const i = Math.floor(Math.random() * array.length)
    return array[i]
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html/server.html"));
})

app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "html/api.html"));
})

app.get("/verificar", (req, res) => {
    res.json({
        status: "success",
        message: `Servidor está online e respondendo`
    })
})

app.get("/api/jogadores/aleatorio", verificarApiKey, (req, res) => {
    const nomes = Object.keys(jogadores);
    const nomeSorteado = sortear(nomes);
    const jogador = jogadores[nomeSorteado];
    const foto = sortear(jogador.foto);
    res.json({
        status: "success",
        message: `Jogador: ${jogador.nome}\nIdade: ${jogador.idade}\nTime: ${jogador.time}\nNacionalidade: ${jogador.nacionalidade}`,
        foto: `http://${ip}:${PORT}/img/${foto}`
    });
});

app.get("/api/jogadores/:pesquisa", verificarApiKey, (req, res) => {
    const nomes = Object.keys(jogadores);
    const pesquisa = req.params.pesquisa.toLocaleLowerCase();
    const jogador = jogadores[pesquisa];
    const foto = sortear(jogador.foto);
    if(!jogadores[pesquisa]){
        res.status(404).json({
            status: "success",
            message: `Jogador "${pesquisa}" não encontrado`
        });
        return;
    } else{
        res.json({
            status: "success",
            message: `Jogador: ${jogador.nome}\nIdade: ${jogador.idade}\nTime: ${jogador.time}\nNacionalidade: ${jogador.nacionalidade}`,
            foto: `http://${ip}:${PORT}/img/${foto}`
        });
    }
});

function encontrarIP(){
    const interfaces = os.networkInterfaces();
    const nomeInterface = "Ethernet 3";
    if (interfaces[nomeInterface]) {
      for (const iface of interfaces[nomeInterface]) {
        // pega somente IPv4 e ignora o interno (127.0.0.1)
        if (iface.family === "IPv4" && !iface.internal) {
          ip = iface.address;
          break;
        }
      }
    }
    return
}
encontrarIP()

//iNICIA O SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://${ip}:${PORT}`)
    console.log(`Cachorros aleatórios em http://${ip}:${PORT}/api/jogadores/aleatorio`)
    console.log(`Pesquisar cachorros em (exemplo) http://${ip}:${PORT}/api/jogadores/neymar`)
})