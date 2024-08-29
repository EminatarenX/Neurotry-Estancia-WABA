export const sendRegistrationFetch = async (to: string) => {
  return await fetch(process.env.FACEBOOK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FACEBOOK_API_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      recipient_type: "individual",
      type: "interactive",
      interactive: {
        type: "flow",
        header: {
          type: "text",
          text: "Registrate",
        },
        body: {
          text: "Continua y registrate para poder acceder a nuestros productos y servicios",
        },
        footer: {
          text: "Not shown in draft mode",
        },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_action: "navigate",
            flow_token: "<FLOW_TOKEN>",
            flow_id: "893715122572700",
            flow_cta: "Continuar",
            mode: "draft",
            flow_action_payload: {
              screen: "JOIN_NOW",
              data: {
                customvalue: "<CUSTOM_VALUE>",
              },
            },
          },
        },
      },
    }),
  })
    .then((res) => res.json())
    .catch((error) => console.log(error));
};
