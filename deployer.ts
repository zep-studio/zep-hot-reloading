import axios from 'axios';
import dedent from 'dedent';
import FormData from 'form-data';
// import JSZip from 'jszip';

// const generateZepapp = async (appGeneratedScript: string): Promise<Buffer> => {
//   const zip = new JSZip();
//   zip.file('main.js', appGeneratedScript);

//   // .zepapp.zip
//   const zepapp = await zip.generateAsync({ type: 'nodebuffer' });
//   return zepapp;
// };

type PublishOptions = {
  file?: Buffer;
  sessionCookie: string;
  name: string;
  description: string;
  type: number; // 1: 일반, 2: 미니게임, 3: 사이드바
  appId?: string;
};
export const publishZepApp = async (options: PublishOptions) => {
  const formData = new FormData();

  if (options.file) formData.append('file', options.file, { filename: 'zep.zip', contentType: 'application/zip' });
  if (options.name) formData.append('name', options.name);
  if (options.description) formData.append('desc', options.description);
  if (options.type) formData.append('type', options.type);

  console.log(formData)

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
  return data
};
