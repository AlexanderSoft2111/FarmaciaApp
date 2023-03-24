import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import {autorizacionComprobanteAPI, validarComprobanteXmlAPI} from "./apis/fakcil";

/* tslint:disable no-var-requires */
const nodemailer = require("nodemailer");

const app = express();

app.use( cors({origin: true}) );

// lectura y parseo del body
app.use( express.json());

// Extrayendo las credenciales de firebase
const serviceAccount = ("src/serviceAccountKey.json");


// Inicializando la app de firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


app.post("/sendEmail", async (req, res) => {
  const name = req.body.name;
  const docUrl = req.body.docUrl;
  const para = req.body.para;
  const nombreCliente = req.body.cliente;
  const numDocumento = req.body.numDocumento;
  const tipoDocumento = req.body.tipoDocumento;
  const email = req.headers.email;
  const password = req.headers.password;

  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', // para outlook smtp-mail.outlook.com y gmail smtp.gmail.com
    port: 587, // 587 otros puertos y 465 para gmail
    secure: false, // true for 465, false for other ports
    auth: {
      user: email, // generated ethereal user
      pass: password, // generated ethereal password
    },
  });

  transporter.verify().then( () => {
    console.log("ready for send emails");
  });

  await transporter.sendMail({
    from: "\"AZUDIST\" <azudist@outlook.com>",
    to: para,
    subject: `${tipoDocumento} - Revisa tu Documento Electrónico de AZUDIST`,
    text: `Estimado Cliente ${nombreCliente} adjunto sirvase encontrar el siguiente comprobante electrónico ${tipoDocumento} Nº ${numDocumento}`,
    attachments: {
      filename: name + ".pdf",
      path: docUrl,
    },
  });

  res.json({
    ok: true,
  });
});

app.post("/validarComprobanteXmlAPI", validarComprobanteXmlAPI);

app.post("/autorizacionComprobanteAPI", autorizacionComprobanteAPI);

export const api = functions.https.onRequest( app );

