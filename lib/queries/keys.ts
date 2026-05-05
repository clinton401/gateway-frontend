import { prisma } from "@/lib/prisma";

export async function getApiKeys() {
    return prisma.apiKey.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getApiKeyById(id: string) {
    return prisma.apiKey.findUnique({ where: { id } });
}