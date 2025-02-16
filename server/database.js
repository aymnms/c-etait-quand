const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllQuestions() {
    return await prisma.question.findMany();
}

async function getQuestion(id) {
    return await prisma.question.findUnique({
        where: { id: id }
    });
}

async function getRandomQuestion() {
    const randomQuestion = await prisma.question.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * await prisma.question.count())
    });
    return randomQuestion;
}

async function addQuestion(invention, year, explanation, imageUrl) {
    return await prisma.question.create({
        data: { invention, year, explanation, imageUrl }
    });
}

async function getAllAvatars() {
    return await prisma.avatar.findMany();
}

async function getAvatar(id) {
    return await prisma.avatar.findUnique({
        where: { id: id }
    });
}

module.exports = {
    getAllQuestions,
    getQuestion,
    getRandomQuestion,
    addQuestion,
    getAllAvatars,
    getAvatar
};