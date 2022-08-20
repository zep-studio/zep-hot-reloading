import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import FormData from 'form-data';
import multer from 'multer'
import cors from 'cors'
import { publishZepApp } from './deployer';
import { HTMLElement, parse } from 'node-html-parser'

dotenv.config();
require('express-async-errors')

const app = express();
const port = process.env.PORT;
const upload = multer()

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hi I am a publisher');
});

app.post('/auth/first', upload.none(), async (req, res) => {
  const loginData = new FormData();
  loginData.append("email", req.body.email);

  await axios.post("https://zep.us/api/me/signin", loginData);
  res.json({
    success: true
  })
})

app.post('/auth/second', upload.none(), async (req, res) => {
  const confirmData = new FormData();
  confirmData.append("email", req.body.email);
  confirmData.append("t", req.body.t);

  const { headers } = await axios.post(
    "https://zep.us/api/me/signin/confirm",
    confirmData
  );

  return res.json({
    token: headers["set-cookie"]![0]
  })
})

app.post('/publish', upload.single('file'), async (req, res) => {
  const token = req.body.token;
  const appId = req.body.appId;
  const name = req.body.name;
  const description = req.body.description;
  const type = parseInt(req.body.type, 10);
  const file = req.file;

  if (!appId) return res.sendStatus(400);
  try {
    await publishZepApp({
      file: file?.buffer,
      sessionCookie: token,
      appId,
      name,
      description,
      type,
    })
  } catch (err: any) {
    return res.json({ success: false, error: {
      message: err.message, code: err.code, status: err.status} })
  }
  if (appId !== 'create') return res.json({ success: true, id: appId })

  const resp = await axios.get("https://zep.us/me/apps", {
    headers: {
      cookie: token,
    }
  })

  const id = /(["'])(?:(?=(\\?))\2.)*?\1/.exec((Array.from(parse(resp.data).querySelectorAll('table > tbody > tr')).map(v => [v, parseInt(v?.querySelector('td')?.textContent || '0', 10)]).filter(v => v[1]).reduce((pv, cv) => pv[1] > cv[1] ? pv : cv)[0] as HTMLElement)?.getAttribute('onclick')?.toString?.() || '')?.[0].replaceAll(`'`, '').replaceAll(`"`, '').split('/').pop()

  return res.json({ success: true, id })
})

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
