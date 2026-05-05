import { prisma } from "@/lib/prisma";

export async function getGatewaySettings() {
    const rows = await prisma.gatewaySetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as {
        gateway_name: string;
        gateway_url: string;
    };
}