export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
      payload: "eyJkb21haW4iOiJmcmFtZXMtdjIudmVyY2VsLmFwcCJ9",
      signature:
        "MHhiNDIwMzQ1MGZkNzgzYTExZjRiOTllZTFlYjA3NmMwOTdjM2JkOTY1NGM2ODZjYjkyZTAyMzk2Y2Q0YjU2MWY1MjY5NjI5ZGQ5NTliYjU0YzEwOGI4OGVmNjdjMTVlZTdjZDc2YTRiMGU5NzkzNzA3YzkxYzFkOWFjNTg0YmQzNjFi",
    },
    frame: {
      version: "0.0.1",
      name: "d33m EPL",
      iconUrl: `${appUrl}/512.png`,
      splashImageUrl: `${appUrl}/defifa_spinner.gif`,
      splashBackgroundColor: "#BD195D",
      homeUrl: appUrl,
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
