function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Google', 
            url_path: 'http://www.google.com', 
            rating: 3, 
            descr: 'Internet-related services and products'
        },
        {
            id: 2,
            title: 'Github', 
            url_path: 'https://www.github.com', 
            rating: 5, 
            descr: 'An online code repository'
        },
        {
            id: 3,
            title: 'w3schools', 
            url_path: 'https://www.w3schools.com', 
            rating: 5, 
            descr: 'The worlds largest web developer site'
        },
        {
            id: 4,
            title: 'Youtube', 
            url_path: 'https://www.youtube.com', 
            rating: 3, 
            descr: 'A video sharing website'
        },
    ]
}

module.exports = {
    makeBookmarksArray,
}