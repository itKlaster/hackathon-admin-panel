'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
    async createBetterArticle(ctx) {
        console.log("Статья создается");


        // const articleURL = ctx.query.link;
        // const articlePages = ctx.query.pages;
        // const forceWhisper = ctx.query.force || false;
        // const selector = ctx.query.selector || 'uniform';
        // const start = ctx.query.start || 0;
        // const end = ctx.query.end || 0;
        // const imageFormat = ctx.query.image_format || 'imgur';

        const { link, pages, force, from, to, images, images_alg, image_format } = ctx.query;

        if (!link || !pages || !images) {
            ctx.body = {
                error: 422,
                message: "Пропущен какой-то важный параметр."
            }
            return;
        }

        const response = await fetch("http://127.0.0.1:8000/article/", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9,ru;q=0.8,en-RU;q=0.7,ru-RU;q=0.6,en-GB;q=0.5",
                "content-type": "application/json",
            },
            "body": JSON.stringify({
                "number_of_paragraphs": pages || 2,
                "number_of_screenshots": images || 3,
                "url": link,
                "start": from || 0,
                "end": to || 0,
                "force_whisper": Boolean(force),
                "selector":  images_alg || "uniform",
                "image_format": image_format || "imgur"
            }),
            "method": "POST",
        });

        const res = await response.json();

        console.log("Пишу результат в базу данных")
        const entry = await strapi.entityService.create('api::article.article', {
            data: {
                data: res,
                publishedAt: new Date()
            },
        });

        console.log(entry);

        ctx.body = res;
    }
}));