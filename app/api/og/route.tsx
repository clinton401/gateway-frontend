import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic title from query params
    const title = searchParams.get("title") || "GatewayOS";
    const description =
      searchParams.get("description") ||
      "Programmable API Gateway Control Plane";

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px",
            borderRadius: "24px",
            backgroundColor: "rgba(24, 24, 27, 0.8)",
            border: "1px solid #3f3f46",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: "white",
              marginBottom: 20,
              letterSpacing: "-0.05em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            color: "#71717a",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          gatewayos.vercel.app
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    // 🟢 Strict Type Narrowing
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // 🟢 Use console.error for production logging readability
    console.error(`OG Image Generation Failed: ${errorMessage}`);

    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
