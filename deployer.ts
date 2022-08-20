import axios from 'axios';
import { Blob } from 'buffer';
import dedent from 'dedent';
import FormData from 'form-data';
import JSZip from 'jszip';

const generateZepapp = async (appGeneratedScript: string): Promise<Buffer> => {
  const zip = new JSZip();
  zip.file('main.js', appGeneratedScript);

  // .zepapp.zip
  const zepapp = await zip.generateAsync({ type: 'nodebuffer' });
  return zepapp;
};

type PublishOptions = {
  sessionCookie: string;
  name: string;
  description: string;
  type: 'minigame' | 'sidebar';
  appId?: string;
};
const publishZepapp = async (zepapp: Buffer, options: PublishOptions) => {
  const formData = new FormData();
  // const blob = new Blob([zepapp]);
  formData.append('file', zepapp, `${options.name}.zepapp.zip`);
  formData.append('name', options.name);
  formData.append('desc', options.description);

  console.log(formData);

  let type = '1';
  switch (options.type) {
    case 'minigame':
      type = '2';
      break;
    case 'sidebar':
      type = '3';
  }
  formData.append('type', type);

  const appId = options.appId || 'create';
  const length = await new Promise<number>((resolve) =>
    formData.getLength((e, l) => resolve(l)),
  );

  const { data } = await axios.post(
    `https://zep.us/me/apps/${appId}`,
    formData,
    {
      headers: {
        cookie: options.sessionCookie,
        'Content-Length': length,
        ...formData.getHeaders(),
      },
    },
  );
  console.log(data);
};

const APP_GENERATED_SCRIPT = dedent`
  var player, text;

  App.onInit.Add(function () {
    App.sayToAll('Hi, App Start!');
  });
  App.onSay.Add(function (player, text) {
    for (var count = 0; count < 5; count++) {
      App.sayToAll(text);
      App.sayToAll(player);
    }
  });
`;
const APP_PUBLISH_OPTIONS: PublishOptions = {
  sessionCookie: '',
  name: 'Test App',
  description: 'Test App',
  type: 'minigame',
  appId: 'create',
};

// const getToken = async () => {
//   // const loginData = new FormData();
//   // loginData.append('email', 'i@junho.io');
//   // await axios.post('https://zep.us/api/me/signin', loginData);

//   const confirmData = new FormData();
//   confirmData.append('email', 'i@junho.io');
//   confirmData.append('t', '075139');
//   const { headers } = await axios.post(
//     'https://zep.us/api/me/signin/confirm',
//     confirmData,
//   );
//   const sessionCookie = headers['set-cookie']![0];
//   console.log(sessionCookie);
// };

(async () => {
  const app = await generateZepapp(APP_GENERATED_SCRIPT);
  await publishZepapp(app, APP_PUBLISH_OPTIONS);
})();
