const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");
const OpenAI = require("openai");
const {obtenerMenu, obtenerHorario} = require('./Restaurante/BaseDatos');
require('dotenv').config();

//Base de Datos
const MYSQL_DB_HOST = "localhost";
const MYSQL_DB_USER = "root";
const MYSQL_DB_PASSWORD = "1234";
const MYSQL_DB_NAME = "tesis";
const MYSQL_DB_PORT = "3307";

//Llamada a la IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

//Declaramos funciones para sacar los datos
let menuComoTexto;
let horarioComoTexto;

//Llamamos las tablas
obtenerMenu((err, menuDB) => {
  if (err) {
    console.error('Error al obtener el menú:', err);
    return;
  }
  menuComoTexto = JSON.stringify(menuDB);
});
obtenerHorario((err, horarioDB) => {
  if (err) {
    console.error('Error al obtener el menú:', err);
    return;
  }
  horarioComoTexto = JSON.stringify(horarioDB);
});

//Arquitectura de ChatBot
const flowUbicacion = addKeyword(["Local", "local", "LOCAL"]).addAnswer(
  "Nos encontramos en x, frente a y"
);

const flowHorario = addKeyword(["Horario", "horario", "HORARIO"]).addAction(
  async (ctx, { flowDynamic }) => {
    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Soy ${ctx.pushName} y dime los horarios de atencion ${horarioComoTexto}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      const respuesta = response.choices[0]?.message?.content.trim();
      if (respuesta) {
        return await flowDynamic(respuesta);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al generar la respuesta:", error);
      return await flowDynamic(
        "Lo siento, hubo un error al procesar tu solicitud."
      );
    }
  }
);

const flowInsatisfaccion = addKeyword([
  "No me gusto",
  "no me gusto",
  "NO ME GUSTO",
  "No me Gusto",
  "No me gusta",
  "no me gusta",
  "NO ME GUSTA",
  "No me Gusta",
]).addAction(async (ctx, { flowDynamic }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Soy ${ctx.pushName} y doy mi opinion ${ctx.body}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowDespedido = addKeyword([
  "Adios",
  "Adiós",
  "adiós",
  "Bye",
  "bye",
  "Chao",
  "chao",
  "adios",
]).addAction(async (ctx, { flowDynamic }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `despidete de mi de manera corta, mas un concejo filosofico mas un atentamente [restaurante].`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowIngredientes = addKeyword([
  "Ingredientes",
  "ingredientes",
  "Ingrediente",
  "ingrediente",
]).addAction(async (ctx, { flowDynamic }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Soy ${ctx.pushName} y digo ${ctx.body}, si no especifico comida que sean todos los ingredientes caso contrario solo del plato que pido de aqui: ${menuComoTexto}, si no exise el ingrediente di que respeto que no estan incluido`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowCancelar = addKeyword([
  "Cancelar",
  "cancelar",
  "cancelarlo",
  "Cancelarlo",
]).addAnswer(
  "Lo entendemos, su pedido sera cancelarlo. Estaremos atento ante cualquier pedido de su parte"
);

const flowLocation = addKeyword(EVENTS.LOCATION).addAction(
  async (ctx, { flowDynamic }) => {
    console.log(ctx);
    return await flowDynamic(
      `Perfecto! dentro de los proximos 15 minutos te sera entregado`
    );
  }
);

const flowRetiro = addKeyword([
  "Retiro",
  "retiro",
  "Retirarlo",
  "retirarlo",
  "Retirarla",
  "retirarla",
]).addAction(async (ctx, { flowDynamic }) => {
  return await flowDynamic(
    `Muy bien, tu pedido sera etiquetado con tu nombre y numero celular, ${ctx.pushName}-${ctx.from}`
  );
});

const flowDomicilio = addKeyword(["Domicilio", "domicilio"]).addAnswer([
  "Por Favor proporcionanos tu locacion actual, nuestro chatbot protegera tu datos personales",
]);

const flowPedido = addKeyword([
  "Pedido",
  "pedido",
  "PEDIDO",
  "Quiero",
  "quiero",
  "Dame",
  "dame",
]).addAction(async (ctx, { flowDynamic }) => {
  console.log(ctx);
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${ctx.body}, primero calcula su valor total siempre y cuando este aqui ${menuComoTexto}, y despues preguntame si deseo a domicilio o lo retiro`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowPrecio = addKeyword([
  "valor",
  "VALOR",
  "Valor",
  "valor?",
  "VALOR?",
  "Valor?",
  "Precio",
  "precio",
  "PRECIO",
  "Precios",
  "precios",
  "PRECIOS",
  "Precio?",
  "precio?",
  "PRECIO?",
  "Precios?",
  "precios?",
  "PRECIOS?",
]).addAction(async (ctx, { flowDynamic }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${ctx.body}, siempre y cuando este aqui: ${menuComoTexto}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowMenu = addKeyword([
  "MENU",
  "menu",
  "menú",
  "Menú",
  "Menu",
  "menù",
  "Menù",
  "MENU?",
  "menu?",
  "menú?",
  "Menú?",
  "Menu?",
  "menù?",
  "Menù?",
]).addAction(async (ctx, { flowDynamic }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Explicame la comida del menu: ${menuComoTexto}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const respuesta = response.choices[0]?.message?.content.trim();
    if (respuesta) {
      return await flowDynamic(respuesta);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return await flowDynamic(
      "Lo siento, hubo un error al procesar tu solicitud."
    );
  }
});

const flowPrincipal = addKeyword(["hola", "HOLA", "Hola"])
  .addAction(async (ctx, { flowDynamic }) => {
    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Soy ${ctx.pushName}, respondeme lo que digo como camarero del restaurante XYZ: ${ctx.body}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      const respuesta = response.choices[0]?.message?.content.trim();
      if (respuesta) {
        return await flowDynamic(respuesta);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al generar la respuesta:", error);
      return await flowDynamic(
        "Lo siento, hubo un error al procesar tu solicitud."
      );
    }
  })
  .addAnswer([
    "👉 *Menu* para ver el menu del dia",
    "👉 *Precio* el valor de cada comida",
    "👉 *Pedido* con la palabra pedido o quiero podras adquirir de nuestro alimentos",
    "👉 *Local* Lugar en donde nos encontramos",
    "👉 *Horario* horas de atencion del local",
    "👉 *Cancelar* en caso desee cancelar el pedido",
  ]);

//Envio de datos hacia el usuario y base de datos 
const main = async () => {
  const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
  });
  const adapterFlow = createFlow([
    flowMenu,
    flowPedido,
    flowPrecio,
    flowIngredientes,
    flowPrincipal,
    flowLocation,
    flowRetiro,
    flowDomicilio,
    flowDespedido,
    flowCancelar,
    flowInsatisfaccion,
    flowUbicacion,
    flowHorario,
  ]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
