import dedent from "dedent";
import JSZip from 'jszip';

const appGeneratedScript = dedent`
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

const generateZepapp = async () => {
  const zip = new JSZip();
  zip.file("main.js", appGeneratedScript);

  const content = await zip.generateAsync({ type: "nodebuffer" });
  // .zepapp.zip
  console.log(content);
};

generateZepapp();
