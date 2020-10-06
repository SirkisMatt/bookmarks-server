-- First, remove the table if it exists
drop table if exists bookmarks;

-- Create the table anew
create table bookmarks (
    id INTEGER primary key generated by default as identity,
    title TEXT NOT NULL,
    url_path TEXT NOT NULL,
    rating INTEGER NOT NULL,
    descr TEXT
);

-- insert some test data
-- Using a multi-row insert statement here
insert into bookmarks (title, url_path, rating, descr)
values
('Google', 'http://www.google.com', 3, 'Internet-related services and products'),
('Github', 'https://github.com/', 5, 'An online code repository'),
('w3schools', 'https://www.w3schools.com/', 5, 'The worlds largest web developer site'),
('Youtube', 'https://www.youtube.com/', 3, 'A video sharing website'),
('Yahoo', 'https://yahoo.com/', 3, 'A not so useful search engine'),
('Netflix', 'https://www.netflix.com', 3, 'A place where you wish better movies where played'),
('LinkedIn', 'https://www.linkedin.com/', 3, 'A place where you are forced to talk about yourself'),
('Repl.it', 'https://repl.it/', 3, 'Browser based code editing software'),
('Conservify', 'http://conservify.org/', 3, 'A cool as non-profit'),
('Climatescape', 'https://climatescape.org/', 3, 'A website to draw inspiration from'),
('CSS Zen Garden', 'http://www.csszengarden.com/218/', 3, 'Look what you can do with CSS');