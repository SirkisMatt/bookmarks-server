const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_store')
    },
    insertBookmark(knex, newBookmark) {
        return knex
            .insert(newBookmark)
            .into('bookmarks_store')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('bookmarks_store').select('*').where('id', id).first()
    },
    deleteBookmark(knex, id) {
        return knex('bookmarks_store')
            .where({ id })
            .delete()
    },
    updateBookmark(knex, id, newBookmarkField) {
        return knex('bookmarks_store')
            .where({ id })
            .update(newBookmarkField)
    }
}

module.exports = BookmarksService