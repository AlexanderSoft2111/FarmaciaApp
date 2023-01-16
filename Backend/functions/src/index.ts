import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

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

// Referencia a la base de datos de fireStore
// const db = admin.firestore();


app.post("/sendEmail", async (req, res) => {
  const name = req.body.name;
  const docUrl = req.body.docUrl;
  const para = req.body.para;
  const nombreCliente = req.body.cliente;
  const numFactura = req.body.numFactura;
  const email = req.headers.email;
  const password = req.headers.password;

  //console.log(req.headers);
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',//para outlook smtp-mail.outlook.com y gmail smtp.gmail.com
    port: 587, // 587 otros puertos y 465 para gmail
    secure: false, // true for 465, false for other ports
    auth: {
      user: email, // generated ethereal user
      pass: password, // generated ethereal password
    },
  });

  transporter.verify().then( () => {
    console.log("ready for send emails");
    console.log(docUrl);
  });

  await transporter.sendMail({
    from: "\"AZUDIST\" <azudist@outlook.com>",
    to: para,
    subject: "FACTURA - Revisa tu Documento Electrónico de AZUDIST",
    text: `Estimado Cliente ${nombreCliente} adjunto sirvase encontrar el siguiente comprobante electronico Factura Electronica Nº ${numFactura}`,
    attachments: {
      filename: name + ".pdf",
      path: docUrl,
    },
  });

  res.json({
    ok: true,
  });
});

export const api = functions.https.onRequest( app );
