const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.question.createMany({
        data: [
            {
                invention: "Imprimerie",
                year: 1440,
                explanation: "Inventée par Gutenberg.",
                imageUrl: "https://www.entrepreneur-individuel.fr/wp-content/uploads/2022/06/imprimeur.jpg"
            },
            {
                invention: "Téléphone",
                year: 1876,
                explanation: "Alexander Graham Bell en est l'inventeur.",
                imageUrl: "https://cdn.futura-sciences.com/cdn-cgi/image/width=1920,quality=50,format=auto/sources/images/dossier/1944/portable2.jpg"
            },
            {
                invention: "Internet",
                year: 1969,
                explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969.",
                imageUrl: "https://cdn.futura-sciences.com/cdn-cgi/image/width=1920,quality=50,format=auto/sources/images/actu/icann-internet-nom-de-domaine.jpg"
            }
        ],
    });

    await prisma.avatar.createMany({
        data: [
            { name: "Avatar 1", imageUrl: "https://example.com/avatar1.jpg" },
            { name: "Avatar 2", imageUrl: "https://example.com/avatar2.jpg" },
            { name: "Avatar 3", imageUrl: "https://example.com/avatar3.jpg" },
        ],
    });

    console.log("✅ Données initiales insérées !");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });