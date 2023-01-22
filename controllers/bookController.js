const Book = require("../models/book");
const BookCopy = require("../models/bookcopy");
const Genre = require("../models/genre");
const Author = require("../models/author");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

exports.index = async (req, res) => {
  const counts = await Promise.all([
    Book.countDocuments(),
    BookCopy.countDocuments(),
    BookCopy.countDocuments({ status: "Available" }),
    Genre.countDocuments(),
    Author.countDocuments()
  ]);

  const [
    bookCount, 
    bookCopyCount, 
    availableBookCopyCount,
    authorCount,
    genreCount] = counts;

  const data = {
    bookCount, 
    bookCopyCount, 
    availableBookCopyCount,
    authorCount,
    genreCount
  };

  res.render("index", { title: "Local Library Home", data });
}

exports.book_list = async (req, res) => {
  const books = await Book.find({}, {title: 1, author: 1})
    .sort({title: 1})
    .populate("author")
    .exec();

  res.render("book/book_list", { title: "Book List", booksList: books });
}

exports.book_details = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const book = await Book.findById(id)
    .populate("author")
    .populate("genre")
    .exec();

  const copies = await BookCopy.find({ book: id }).exec();

  if (book == null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book/book_details", { title: "Book Detail", book, copies });
}

exports.book_create_get = async (req, res) => {
  const [ authors, genres ] = await Promise.all([ Author.find({}), Genre.find({}) ]);
  authors.sort((a, b) => {
    return a.family_name.toUpperCase() < b.family_name.toUpperCase();
  })
  res.render("book/book_form", { title: "Create Book", authors, genres });
}

exports.book_create_post = [
  (req, res, next) => {
    // Make sure genre is always an array
    if(!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),  
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { title, author, summary, isbn, genre } = req.body;

    const book = new Book({
      title, 
      author, 
      summary, 
      isbn, 
      genre
    });

    if (!errors.isEmpty()) {
      const [ authors, genres ] = await Promise.all([ Author.find({}), Genre.find({}) ]);
      for (const genre of genres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = true;
          console.log("hi");
        }
      }

      authors.sort((a, b) => {
        return a.family_name.toUpperCase() < b.family_name.toUpperCase();
      })

      res.render("book_form", { 
        title: "Create Book",
        authors,
        genres,
        book, 
        errors: errors.array() 
      });
      return;
    }
    await book.save();
    res.redirect(book.url);
  },
];

exports.book_delete_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const [ book, copies ] = await Promise.all([Book.findById(id)
    .populate("genre")
    .populate("author")
    .exec(),
    BookCopy.find({book: id})
  ]);

  if(book === null) {
    res.redirect("/catalog/books");
  }

  res.render("book/book_delete", {
    title: "Delete book",
    book,
    copies
  });
}

exports.book_delete_post = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  await Book.findByIdAndRemove(id);

  res.redirect("/catalog/books");
}

exports.book_update_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const [ book, authors, genres ] = await Promise.all([ 
    Book.findById(id)
      .populate("author")
      .populate("genre")
      .exec(),
    Author.find({}), 
    Genre.find({}) 
  ]);

  if (book == null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  for (const genre of genres) {
    for (const bookGenre of book.genre) {
      if (genre._id.toString() === bookGenre._id.toString()) {
        genre.checked = "true";
      }
    }
  }

  res.render("book/book_form", { title: "Update Book", authors, genres, book });
}

exports.book_update_post = [
  (req, res, next) => {
    // Make sure genre is always an array
    if(!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),  
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),
  async (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);
    const { title, author, summary, isbn, genre } = req.body;

    const book = new Book({
      title, 
      author, 
      summary, 
      isbn, 
      genre,
      _id: id
    });

    if (!errors.isEmpty()) {
      const [ authors, genres ] = await Promise.all([ Author.find({}), Genre.find({}) ]);
      for (const genre of genres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = true;
          console.log("hi");
        }
      }

      authors.sort((a, b) => {
        return a.family_name.toUpperCase() < b.family_name.toUpperCase();
      })

      res.render("book_form", { 
        title: "Create Book",
        authors,
        genres,
        book, 
        errors: errors.array() 
      });
      return;
    }

    await Book.findByIdAndUpdate(id, book, {});
    res.redirect(book.url);
  },
]