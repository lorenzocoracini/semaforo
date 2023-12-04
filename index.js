const express = require("express");
const querystring = require("querystring");
const sqlite3 = require("sqlite3");
var cors = require("cors");
const app = express();
const port = 8080;

app.use(cors());

const db = new sqlite3.Database("semaforo.db");

db.run("CREATE TABLE IF NOT EXISTS semaforo (horario TEXT, acionado INTEGER)");

app.get("/h", (req, res) => {
  console.log("ENTROU GET")
  db.all("SELECT * FROM semaforo WHERE acionado = 1", (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao buscar os horários acionados");
    } else {
      const horariosAcionados = rows.map((row) => ({
        horario: row.horario,
      }));
      res.json(horariosAcionados);
    }
  });
});

app.post("/", (req, res) => {
  console.log('entrou post')
  if (
    req.method === "POST" &&
    req.headers["content-type"] === "application/x-www-form-urlencoded"
  ) {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      const parsedData = querystring.parse(data);
      console.log(parsedData.name);

      const estado = parsedData["name"].includes("acionado");

      // Correção: A coluna na tabela é "acionado", não "estado"
      db.run(
        "INSERT INTO semaforo (horario, acionado) VALUES (?, ?)",
        [new Date().toLocaleString(), estado ? 1 : 0],
        (err) => {
          if (err) {
            console.error(err.message);
            res.status(500).send("Erro ao inserir o estado");
          } else {
            res.send("Estado inserido com sucesso");
          }
        }
      );
    });
  } else {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.send(
      "Opss, ocorreu algum erro. Necessita ser application/x-www-form-urlencoded"
    );
  }
});

app.listen(port, () => {
  console.log("server running");
});

module.exports = app;