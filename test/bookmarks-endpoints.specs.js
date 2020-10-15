const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./articles.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
  
    

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks_store').truncate())

    afterEach('cleanup', () => db('bookmarks_store').truncate())

    describe(`GET /bookmarks`, () => {

        context(`Given no bookmarks`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
    
            beforeEach('insert articles', () => {
                return db   
                    .into('bookmarks_store')
                    .insert(testBookmarks)
            })
    
            it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })
    })


    describe(`GET /bookmarks/:id`, () => {

        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: {message: `Bookmark doesn't exist`} })
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert articles', () => {
                return db   
                    .into('bookmarks_store')
                    .insert(testBookmarks)
            })

            it('GET /bookmarks/:id responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })
    })

    describe(`POST /bookmarks`, () => {
        it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
            const newBookmark = {  
                title: 'Test bookmark', 
                url_path: 'https://www.youtube.com', 
                rating: 5, 
                descr: 'This is a test'
            }
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url_path).to.eql(newBookmark.url_path)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body.descr).to.eql(newBookmark.descr)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)  
                )
        })

        it(`responds with 400 and an error message when the 'title' is missing`, () => {
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({
                    url_path: 'https://www.youtube.com', 
                    rating: 5, 
                    descr: 'This is a test'
                })
                .expect(400, {
                    error: { message: `Missing 'title' in request body` }
                })
        })

        it(`responds with 400 and an error message when the 'url_path' is missing or not valid`, () => {
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({
                    title: 'Test bookmark', 
                    url_path: 'fghjk',
                    rating: 5, 
                    descr: 'This is a test'
                })
                .expect(400, {
                    error: { message: `Invalid url supplied` }
                })
        })

        it(`responds with 400 and an error message when the 'rating' is not a number between 0 and 5`, () => {
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({
                    title: 'Test bookmark', 
                    url_path: 'fghjk',
                    rating: 7, 
                    descr: 'This is a test'
                })
                .expect(400, {
                    error: { message: `Invalid url supplied` }
                })
        })
    })

    describe(`Delete /bookmarks/:id`, () => {

        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db   
                    .into('bookmarks_store')
                    .insert(testBookmarks)
            })

            it('responds with 204 and removes the bookmark', () => {
                const idToRemove = 2
                const expectedBookmark = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/bookmarks`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmark)    
                    )
            })
        })
    })
})