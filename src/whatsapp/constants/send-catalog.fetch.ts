export const sendCatalogFetch = async (to: string, data: any) => {

    return await fetch(process.env.FACEBOOK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FACEBOOK_API_TOKEN}`,
        },
        body: JSON.stringify({
            recipient_type: "individual",
            messaging_product: "whatsapp",
            to: "529614497858",
            type: "interactive",
            interactive: {
              type: "flow",
              header: {
                type: "text",
                // titulo para una tienda de playeras de programacion
                text: "¡Bienvenido a la tienda!"
              },
              body: {
                text: "Haz click en el botón para ver nuestro catálogo",
              },
              action: {
                name: "flow",
                parameters: {
                  mode: "published  ",
                  flow_message_version: "3",
                  flow_token: "AQAAAAACS5FpgQ_cAAAAAD0QI3s.",
                  flow_id: "1705368093531970",
                  flow_cta: "Ver catálogo",
                  flow_action: "navigate",
                  flow_action_payload: {
                    screen: "CATALOG",
                    data: data
                  }
                }
              }
            }
          })
    })
}