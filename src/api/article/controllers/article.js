'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
function timeToSeconds(timeString) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
  
    return hours * 3600 + minutes * 60 + seconds;
  }
  
module.exports = createCoreController('api::article.article', ({ strapi }) => ({
    async createBetterArticle(ctx) {
        console.log("Статья создается");

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
                "start": from && timeToSeconds(from) || 0,
                "end": to && timeToSeconds(to)|| 0,
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
                url: link,
                publishedAt: new Date()
            },
        });
        ctx.body = res;
    },


    async createHTMLResponse(ctx) {
        const id = parseInt(ctx.params.id);
        const time = ctx.query.time || false;
        if (isNaN(id)) return {
            code: 422,
            error: 'Требуется ID.'
        }

        const entry = await strapi.entityService.findOne('api::article.article', id);
        const article = entry.data;
        let html = "";

        html += `<h1>${article.title}</h1>`;
        html += `<p>${article.description}</p>`
        html += `<div id="topics">`;

        article.topics.forEach(topic => {
            html += `<h2>${topic.title}</h2>`

            topic.paragraphs.split("\n").forEach(par => {
                const regex = /^\[(\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}:\d{2}:\d{2})\]\s*(.*)$/;
                const paragraph = par.match(regex);

                html += `<p>${paragraph ? `${time ? paragraph[0] : paragraph[3]}` : par}</p>`
            })

            html += '<div class="images-row">';
            topic.images.forEach(image => {
                html += `<img src="${image}">`;
            })
            html += '</div>'

            if (time) html += `<small>Сегмент длится ${topic.start} - ${topic.end}</small>`
            
        })

        return html;

    },


    async createHTMLResponseWithCSS(ctx) {
        const id = parseInt(ctx.params.id);
        const time = ctx.query.time || false;
        if (isNaN(id)) return {
            code: 422,
            error: 'Требуется ID.'
        }

        const entry = await strapi.entityService.findOne('api::article.article', id);
        const article = entry.data;
        let html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;0,1000;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900;1,1000&family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
            body {
                height: 100vh;
                background: black;
                color: white;
                font-family: 'Nunito Sans', sans-serif !important;
            }
        </style>
        `;

        html += `<h1>${article.title}</h1>`;
        html += `<p>${article.description}</p>`
        html += `<div id="topics">`;

        article.topics.forEach(topic => {
            html += `<h2>${topic.title}</h2>`

            topic.paragraphs.split("\n").forEach(par => {
                const regex = /^\[(\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}:\d{2}:\d{2})\]\s*(.*)$/;
                const paragraph = par.match(regex);

                html += `<p>${paragraph ? `${time ? paragraph[0] : paragraph[3]}` : par}</p>`
            })

            topic.images.forEach(image => {
                html += `<img src="${image}">`;
            })

            if (time) html += `<small>Сегмент длится ${topic.start} - ${topic.end}</small>`
            
        })

        return html;

    }
}));