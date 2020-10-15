const express = require('express')
const { v4: uuid } = require('uuid')
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const { bookmarks } = require('../store')
const xss = require('xss')
const BookmarksService = require('../bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title), 
    url_path: bookmark.url_path, 
    rating: bookmark.rating, 
    descr: xss(bookmark.descr)
})

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
       const { title, url_path, rating, descr } = req.body;
       const newBookmark = { title, url_path, rating, descr  }

       if (!title) {
           logger.error(`Missing 'title' in request body`);
           return res
            .status(400)
            .json({
                error: { message: `Missing 'title' in request body` }
            })
       }

       if (!isWebUri(url_path)) {
           logger.error(`Invalid url '${url_path}' supplied`);
           return res
            .status(400)
            .json({
                error: { message: `Invalid url supplied` }
            })
       }

       if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
           logger.error(`Invalid rating '${rating}' supplied`);
           return res 
            .status(400)
            .json({
                error: { message: `'rating' must be a number between 0 and 5` }
            })
       }

       const id = uuid()
        
       logger.info(`Bookmark with id ${id} created`)


       
       BookmarksService.insertBookmark(
           req.app.get('db'),
           newBookmark
       )
        .then(bookmark => {
            res
                .status(201)
                .location(`/bookmarks/${bookmark.id}`)
                .json(serializeBookmark(bookmark))
        })
        .catch(next)

    })

bookmarkRouter
    .route('/bookmarks/:id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })

    .get((req, res) => {
        res.json(serializeBookmark(res.bookmark))
    })

    .delete((req, res, next) => {
        const { id } = req.params;

        BookmarksService.deleteBookmark(
            req.app.get('db'),
            id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarkRouter