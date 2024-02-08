# Chatbot-implementado-con-ChatGPT
Este repositorio contiene un prototipo de chatbot implementado con la inteligencia artificial ChatGPT, con el contexto de restaurantes de guayaquil. 

##Como fue su Instalacion:
Este prototipo fue creado gracias a [ChatBot](https://bot-whatsapp.netlify.app/) de [Leifer Mendez](https://github.com/codigoencasa/bot-whatsapp)
En el se podra observar la instalacion y documentacion para el correcto uso de su bot.
![ChatBot](https://github.com/Douglas-CO/Chatbot-implementado-con-ChatGPT/assets/84036785/36a511be-640a-4e04-ad52-2a7f76559916)

1.- Abrimos un cmd y nos colocamos en una carpeta a nuestro criterio y se coloco lo siguiente
- **cmd>** npm create bot-whatsapp@latest
- **cmd>** ¿Quieres crear un Bot? (Y/n) … Y [Respuesta Y]
- **cmd>** ¿Cuál proveedor de WhatsApp quieres utilizar?... Baileys [A criterio personal] 
- **cmd>** ¿Cuál base de datos quieres utilizar?…  MySQL [A criterio personal]
- **cmd>** cd base-wweb-memory
- **cmd>** npm install
- **cmd>** npm install openai
- **cmd>** npm start

2.- Se instalo la libreria de openai "npm install --save openai", se coloco la api de openai en .env y se prosiguio a llamarlo en el app.js de la siguiente manera:
  const OpenAI = require("openai");
  const openai = new OpenAI({
    apiKey: process.env.KeyOpenai,
  });

3.- La instalacion proporciono la arquitectura para la base de datos por consiguiente se remplazara con los datos del mysql personal.
- const MYSQL_DB_HOST = "localhost";
- const MYSQL_DB_USER = "root";
- const MYSQL_DB_PASSWORD = "1234";
- const MYSQL_DB_NAME = "tesis";
- const MYSQL_DB_PORT = "3307";

##USAR
1.- Descargar
2.- npm install
3.- Remplazar los datos
