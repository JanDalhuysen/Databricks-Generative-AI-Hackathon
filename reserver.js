const fs = require("fs");
const express = require("express");
const body_parser = require("body-parser");
const fetch = require("node-fetch");
const os = require("os");
const cors = require("cors");

const { exec } = require("child_process");

const app = express();
const port = 5000;

var url_encoded_parser = body_parser.urlencoded({ extended: false });

app.use(cors({ origin: "*" }));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ----------

app.get("/SimpleStockSense", (req, res) => {
  res.render("SimpleStockSense");
});

app.get("/SimpleStockSense_step_one/:share_name", (req, res) => {
  console.log("SimpleStockSense started");
  let data = req.params;
  let share_name = data.share_name;
  let fetch_string =
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=" +
    share_name +
    "&apikey=QUB75QBDEXT3XIPV";
  fetch(fetch_string, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      const requestBody = {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Look at the following data and tell me how the share performed and if it would be a good one to buy:\n\n${data
              .split("\n")
              .slice(0, 150)
              .join("\n")}`,
          },
        ],
      };
      const token = "dapice5215e759e7dd9465e40d6bf9987897";
      const url =
        "https://dbc-870667d8-4476.cloud.databricks.com/serving-endpoints/databricks-llama-2-70b-chat/invocations";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`token:${token}`).toString(
            "base64"
          )}`,
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.text())
        .then((data) => {
          let json = JSON.parse(data);
          let content = json.choices[0].message.content;
          res.send(content);
        });
    });
});

app.listen(port, listening);

function listening() {
  console.log(`Listening on http://localhost:${port}`);
}
