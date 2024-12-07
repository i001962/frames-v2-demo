export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjQxNjMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg4NWY5ODg2YzQ4QjE3YjUzNGYzQTY0RjI0NjBkRDlDMDRBQjlhMjM2In0",
      payload: "eyJkb21haW4iOiJkMzNtLWZyYW1lcy12Mi52ZXJjZWwuYXBwIn0",
      signature:
        "MHhmOTVjODdlZjM4ZjUyYTI3ODQxY2NiNTA4MDdiNzk1NTMwOTBmOTIxYzIwZjQ2ZTQwN2EyODZjMzg1Mjc4ZDVmMTM3MWY2YjAwNmMxZWMyYjAyODhkODk2NTg2OGM2MzM0ODRiMDkwYzU0MGQwMjlhZTI4OTEwMjU4NDI3Yjc4ODFi",
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
