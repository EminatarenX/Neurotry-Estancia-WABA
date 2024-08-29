export const sendMessageFetch = async (to: string, message: string, previewUrl: boolean = false) => {
    return await fetch(process.env.FACEBOOK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FACEBOOK_API_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            preview_url: previewUrl,
            body: message,
          },
        }),
      }).then((res) => res.json().catch((error) => console.log(error)));
}